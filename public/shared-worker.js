importScripts('https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/7.0.5/signalr.min.js');

const connections = [];
const subscribedSymbols = new Set();

const azureBase = "https://tradecompanion.azurewebsites.net"; // <- notice no `/api` now for SignalR
const signalrHubUrl = `${azureBase}/quotesHub`; // <- if this doesn't work, it might be different, we can test

class QuoteManager {
  constructor() {
    this.subscribers = new Map();
  }
  subscribe(symbol, port) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    const subs = this.subscribers.get(symbol);
    if (!subs.includes(port)) subs.push(port);
  }
  unsubscribe(symbol, port) {
    const subs = this.subscribers.get(symbol) || [];
    const idx = subs.indexOf(port);
    if (idx !== -1) subs.splice(idx, 1);
    if (subs.length === 0) this.subscribers.delete(symbol);
  }
  publish(symbol, data) {
    const subs = this.subscribers.get(symbol) || [];
    subs.forEach(port => {
      port.postMessage({ type: "quote", symbol, payload: data });
    });
  }
}

const quoteManager = new QuoteManager();

// SignalR connection
let connection = new signalR.HubConnectionBuilder()
  .withUrl(signalrHubUrl)
  .configureLogging(signalR.LogLevel.Information)
  .build();

connection.start()
  .then(() => {
    console.log("[Worker] Connected to SignalR hub");
    broadcastStatus("Connected to quote server");
  })
  .catch(err => {
    console.error("[Worker] SignalR connection failed:", err);
  });

// When the server pushes a quote update
connection.on("ReceiveQuote", (symbol, data) => {
  console.log("[Worker] Received quote for", symbol, data);
  quoteManager.publish(symbol, data);
});

// Send subscription messages to server if needed
function subscribeSymbol(symbol) {
  if (connection.state === "Connected") {
    connection.invoke("Subscribe", symbol)
      .catch(err => console.error("[Worker] Subscribe error:", err));
  }
}

function unsubscribeSymbol(symbol) {
  if (connection.state === "Connected") {
    connection.invoke("Unsubscribe", symbol)
      .catch(err => console.error("[Worker] Unsubscribe error:", err));
  }
}

// Broadcast simple status messages
function broadcastStatus(msg) {
  connections.forEach(p => p.postMessage({ type: "status", message: msg }));
}

// Handle new page connections
onconnect = e => {
  const port = e.ports[0];
  connections.push(port);
  port.start?.();
  broadcastStatus("Shared worker ready");

  port.onmessage = event => {
    const msg = event.data;
    if (msg.type === "subscribe" && msg.symbol) {
      quoteManager.subscribe(msg.symbol, port);
      if (!subscribedSymbols.has(msg.symbol)) {
        subscribedSymbols.add(msg.symbol);
        subscribeSymbol(msg.symbol); // call SignalR Subscribe
        broadcastStatus(`Subscribed: ${msg.symbol}`);
      }
    } else if (msg.type === "unsubscribe" && msg.symbol) {
      quoteManager.unsubscribe(msg.symbol, port);
      if (!quoteManager.subscribers.has(msg.symbol)) {
        subscribedSymbols.delete(msg.symbol);
        unsubscribeSymbol(msg.symbol); // call SignalR Unsubscribe
        broadcastStatus(`Unsubscribed: ${msg.symbol}`);
      }
    }
  };
};
