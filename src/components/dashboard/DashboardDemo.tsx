// src/components/watchlist/WatchlistPage.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { getAuth } from 'firebase/auth';
import LogoImage from '~/core/ui/Logo/LogoImage';
import {
  FaRegComment,
  FaBullhorn,
  FaTrash,
  FaFileAlt,
  FaBell
} from 'react-icons/fa';

interface WatchlistSymbol {
  id: number;
  symbol: string;
  percentChange: string;
  lastPrice: string;
  flagged?: boolean;
}

interface Watchlist {
  name: string;
  symbols: WatchlistSymbol[];
}

interface Tweet {
  id: string;
  username: string;
  created_at: string;
  text: string;
  symbol?: string;
}

interface TradeExchangePost {
  id: string;
  source: string;
  content: string;
  save_time_utc: string;
}

interface Filing {
  symbol: string;
  form: string;
  dcn: string;
  cik: number;
  save_time: string;
  url: string;
}

interface Quote {
  s: string;
  l: number;
  o?: number;
}

interface PriceAlert {
  id: string;
  symbol: string;
  target: number;
  direction: 'above' | 'below';
  note: string;
  triggered: boolean;
}

// ─── Helper to compute absolute or relative target ─────────────────────────────
function computeTarget(
  input: string,
  symbol: string,
  watchlists: Watchlist[]
): number {
  const relMatch = input.match(/^([+-]\d+(\.\d+)?)$/);
  if (relMatch) {
    const delta = parseFloat(relMatch[1]);
    // find the lastPrice for this symbol
    for (const wl of watchlists) {
      const symObj = wl.symbols.find(s => s.symbol === symbol);
      if (symObj) {
        const base = parseFloat(symObj.lastPrice);
        if (!isNaN(base)) {
          return base + delta;
        }
      }
    }
  }
  // fallback to absolute
  return parseFloat(input);
}

export default function WatchlistPage() {
  // ─── State & Refs ────────────────────────────────────────────────────────────
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlistIndex, setSelectedWatchlistIndex] = useState(0);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newSymbolText, setNewSymbolText] = useState('');
  const [prevCloses, setPrevCloses] = useState<Record<string, number>>({});
  const prevClosesRef = useRef<Record<string, number>>({});

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const [tweetsBySymbol, setTweetsBySymbol] = useState<Record<string, Tweet[]>>({});
  const [tweetFilter, setTweetFilter] = useState<string | null>('*');
  const [expandedTweets, setExpandedTweets] = useState<Set<string>>(new Set());

  const [tradePosts, setTradePosts] = useState<TradeExchangePost[]>([]);
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());

  const [rawFilings, setRawFilings] = useState<Filing[]>([]);
  const [filings, setFilings] = useState<Filing[]>([]);

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const priceAlertsRef = useRef<PriceAlert[]>([]);
  const [alertModalSymbol, setAlertModalSymbol] = useState<string | null>(null);
  // bottom form state
  const [newAlertSymbol, setNewAlertSymbol] = useState<string>('');
  const [newAlertTarget, setNewAlertTarget] = useState<string>('');
  const [newAlertDirection, setNewAlertDirection] = useState<'above' | 'below'>('above');
  const [newAlertNote, setNewAlertNote] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);

  // Inline‐alert inputs state
  const [inlineAlertInputs, setInlineAlertInputs] = useState<{
    [symbol: string]: { upper: string; lower: string; note: string }
  }>({});

  const current = watchlists[selectedWatchlistIndex] || { name: '', symbols: [] };
  const srUrl = 'https://tradecompanion3.azurewebsites.net/api';

  const btnClasses = `
    bg-gradient-to-r from-blue-600/20 via-cyan-300/20 to-purple-600/20
    border border-gray-600 rounded px-4 py-2
    transition transform hover:-translate-y-0.5 hover:scale-105
    hover:bg-gradient-to-r hover:from-blue-500/40 hover:via-cyan-400/40 hover:to-purple-500/40
    hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
  `;

  async function getIdToken(): Promise<string | null> {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  }

  // ─── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    priceAlertsRef.current = priceAlerts;
  }, [priceAlerts]);

  // default bottom-form symbol on watchlist switch
  useEffect(() => {
    setNewAlertSymbol(current.symbols[0]?.symbol || '');
  }, [current.symbols]);

  // fetch previous closes
  useEffect(() => {
    if (!current.symbols.length) return;
    const symbolsParam = current.symbols.map(s => s.symbol).join(',');
    fetch(`${srUrl}/prevcloses?symbols=${encodeURIComponent(symbolsParam)}`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then((json: any) => {
        const map: Record<string, number> = {};
        json.results?.forEach((item: any) => {
          if (item.Ti && typeof item.c === 'number') {
            map[item.Ti.toUpperCase()] = item.c;
          }
        });
        setPrevCloses(map);
        prevClosesRef.current = map;
      })
      .catch(err => console.error('Failed to fetch prev closes:', err));
  }, [JSON.stringify(current.symbols)]);

  // load existing priceAlerts
  useEffect(() => {
    (async () => {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch('/api/alerts/priceAlerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPriceAlerts(await res.json());
      }
    })();
  }, []);

  // SignalR negotiate + connect
  useEffect(() => {
    let conn: signalR.HubConnection | null = null;
    (async () => {
      try {
        const res = await fetch(`${srUrl}/negotiate`, { method: 'POST' });
        if (!res.ok) throw new Error('Negotiate failed');
        const { Url, AccessToken } = (await res.json()) as any;
        conn = new signalR.HubConnectionBuilder()
          .withUrl(Url, { accessTokenFactory: () => AccessToken })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Warning)
          .build();

        conn.on('BroadcastQuotes', (data: Quote[]) => {
          // update quotes
          setWatchlists(prev =>
            prev.map(wl => ({
              ...wl,
              symbols: wl.symbols.map(s => {
                const q = data.find(q => q.s.toUpperCase() === s.symbol.toUpperCase());
                if (!q) return s;
                const last = q.l;
                const pc = prevClosesRef.current[q.s.toUpperCase()];
                if (pc == null) {
                  return { ...s, lastPrice: last.toFixed(2) };
                }
                return {
                  ...s,
                  lastPrice: last.toFixed(2),
                  percentChange: `${(((last - pc) / pc) * 100).toFixed(2)}%`
                };
              })
            }))
          );
          // check alerts
          data.forEach(q =>
            priceAlertsRef.current.forEach(alert => {
              if (
                !alert.triggered &&
                alert.symbol === q.s &&
                ((alert.direction === 'above' && q.l >= alert.target) ||
                  (alert.direction === 'below' && q.l <= alert.target))
              ) {
                setPriceAlerts(pa =>
                  pa.map(a => (a.id === alert.id ? { ...a, triggered: true } : a))
                );
                setNotifications(n => [
                  ...n,
                  `🔔 ${alert.symbol} is ${alert.direction} ${alert.target.toFixed(2)}`
                ]);
              }
            })
          );
        });

        conn.on('BroadcastFiling', (f: Filing) => {
          setRawFilings(prev => [f, ...prev]);
        });

        await conn.start();
        setConnection(conn);
      } catch (err) {
        console.error('SignalR error:', err);
      }
    })();
    return () => {
      if (conn) conn.stop().catch(() => {});
    };
  }, []);

  // auto-subscribe L1
  useEffect(() => {
    if (!connection) return;
    current.symbols.forEach(s => {
      connection.invoke('SubL1', s.symbol).catch(() =>
        console.error('Subscribe error', s.symbol)
      );
    });
  }, [connection, current.symbols]);

  // load watchlists & flags
  useEffect(() => {
    (async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const res = await fetch('/api/watchlist/loadwatchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      if (!res.ok) return;
      const data = await res.json();
      setWatchlists(
        data.watchlists.length
          ? data.watchlists
          : [{ name: 'Watchlist 1', symbols: [] }]
      );
    })();
  }, []);

  // fetch tweets
  useEffect(() => {
    if (!current.symbols.length) {
      setTweetsBySymbol({});
      return;
    }
    (async () => {
      const res = await fetch(`${srUrl}/tweets?since=0&t=${Date.now()}`);
      if (!res.ok) {
        setTweetsBySymbol({});
        return;
      }
      const all: Tweet[] = await res.json();
      const bySym: Record<string, Tweet[]> = {};
      current.symbols.forEach(s => {
        bySym[s.symbol] = all
          .filter(t => t.text.includes(`$${s.symbol}`))
          .slice(-6)
          .reverse();
      });
      setTweetsBySymbol(bySym);
      setTweetFilter('*');
      setExpandedTweets(new Set());
    })();
  }, [current.symbols]);

  // fetch trades
  useEffect(() => {
    (async () => {
      const res = await fetch(`${srUrl}/TradeExchangeGet`);
      if (!res.ok) return;
      setTradePosts(await res.json());
    })();
  }, []);

  // fetch filings
  useEffect(() => {
    (async () => {
      const since = new Date(0).toISOString().substring(0, 19);
      const res = await fetch(`${srUrl}/Filings?since=${encodeURIComponent(since)}`);
      if (!res.ok) return;
      setRawFilings(await res.json());
    })();
  }, []);

  // filter filings by current symbols
  useEffect(() => {
    const allowed = new Set(current.symbols.map(s => s.symbol));
    setFilings(
      rawFilings.filter(f =>
        f.symbol.split(',').some(sym => allowed.has(sym.trim()))
      )
    );
  }, [rawFilings, current.symbols]);

  // ─── CRUD Helpers ────────────────────────────────────────────────────────────
  const saveToFirebase = async (toSave?: Watchlist[]) => {
    const user = getAuth().currentUser;
    if (!user) { alert('Please log in'); return; }
    const payload = { uid: user.uid, watchlists: toSave ?? watchlists };
    const res = await fetch('/api/watchlist/savewatchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    alert(res.ok ? '✅ Saved' : '❌ Save failed');
  };

  const toggleFlag = (symbolId: number) => {
    const newWLs = watchlists.map((wl, idx) =>
      idx === selectedWatchlistIndex
        ? {
            ...wl,
            symbols: wl.symbols.map(s =>
              s.id === symbolId ? { ...s, flagged: !s.flagged } : s
            )
          }
        : wl
    );
    setWatchlists(newWLs);
    saveToFirebase(newWLs);
  };

  const addWatchlist = () => {
    const nm = newWatchlistName.trim();
    if (!nm) return;
    setWatchlists(wl => [...wl, { name: nm, symbols: [] }]);
    setSelectedWatchlistIndex(watchlists.length);
    setNewWatchlistName('');
  };

  const addSymbol = () => {
    const txt = newSymbolText.trim().toUpperCase();
    if (!txt) return;
    const id = current.symbols.length
      ? current.symbols[current.symbols.length - 1].id + 1
      : 1;
    const sym: WatchlistSymbol = { id, symbol: txt, percentChange: '+0.00%', lastPrice: '0.00' };
    const newWLs = watchlists.map((w, idx) =>
      idx === selectedWatchlistIndex
        ? { ...w, symbols: [...w.symbols, sym] }
        : w
    );
    setWatchlists(newWLs);
    setNewSymbolText('');
    connection?.invoke('SubL1', txt).catch(() => {});
  };

  const deleteSymbol = (id: number) => {
    setWatchlists(wl =>
      wl.map((w, idx) =>
        idx === selectedWatchlistIndex
          ? { ...w, symbols: w.symbols.filter(s => s.id !== id) }
          : w
      )
    );
    setTweetFilter('*');
  };

  const toggleExpandTweet = (id: string) => {
    setExpandedTweets(prev => {
      const nxt = new Set(prev);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });
  };
  const toggleExpandTrade = (id: string) => {
    setExpandedTrades(prev => {
      const nxt = new Set(prev);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });
  };

  const linkify = (text: string) =>
    text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
      /^https?:\/\//.test(part)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">{part}</a>
        : part
    );

  // ─── Inline-alert helpers ────────────────────────────────────────────────────
  const handleInlineInputChange = (
    symbol: string,
    field: 'upper' | 'lower' | 'note',
    value: string
  ) => {
    setInlineAlertInputs(prev => ({
      ...prev,
      [symbol]: {
        ...(prev[symbol] || { upper: '', lower: '', note: '' }),
        [field]: value
      }
    }));
  };

  const createInlineAlert = async (
    symbol: string,
    target: number,
    direction: 'above' | 'below',
    note: string
  ) => {
    const token = await getIdToken();
    if (!token) return;
    try {
      const res = await fetch('/api/alerts/priceAlerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ symbol, target, direction, note })
      });
      if (!res.ok) throw new Error('save failed');
      const saved: PriceAlert = await res.json();
      setPriceAlerts(pa => [...pa, saved]);
      connection?.invoke('SubL1', symbol).catch(() => {});
    } catch (e) {
      console.error('createInlineAlert error', e);
    }
  };

  const handleInlineKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    symbol: string,
    field: 'upper' | 'lower'
  ) => {
    if (e.key !== 'Enter') return;
    const raw = inlineAlertInputs[symbol]?.[field];
    if (!raw) return;
    const direction = field === 'upper' ? 'above' : 'below';
    const target = computeTarget(raw, symbol, watchlists);
    createInlineAlert(symbol, target, direction, inlineAlertInputs[symbol].note);
    setInlineAlertInputs(prev => ({
      ...prev,
      [symbol]: {
        upper: field === 'upper' ? '' : prev[symbol]?.upper || '',
        lower: field === 'lower' ? '' : prev[symbol]?.lower || '',
        note: ''
      }
    }));
  };

  // ─── Reordering for flagged ───────────────────────────────────────────────────
  const displayedTweets = tweetFilter === '*'
    ? Object.entries(tweetsBySymbol).flatMap(([sym, arr]) => arr.map(t => ({ ...t, symbol: sym })))
    : (tweetsBySymbol[tweetFilter!] || []).map(t => ({ ...t, symbol: tweetFilter! }));

  const displayedTrades = tradePosts.filter(p => p.content.length >= 5).slice(-6).reverse();
  const displayedFilings = filings;

  const flaggedSymbols = new Set(current.symbols.filter(s => s.flagged).map(s => s.symbol));

  const reorderedTweets = [
    ...displayedTweets.filter(t => flaggedSymbols.has(t.symbol)),
    ...displayedTweets.filter(t => !flaggedSymbols.has(t.symbol))
  ];

  const reorderedTrades = [
    ...displayedTrades.filter(p => flaggedSymbols.has(p.content.match(/\$?([A-Z]+)/)?.[1] || '')),
    ...displayedTrades.filter(p => !flaggedSymbols.has(p.content.match(/\$?([A-Z]+)/)?.[1] || ''))
  ];

  const reorderedFilings = [
    ...displayedFilings.filter(f => flaggedSymbols.has(f.symbol)),
    ...displayedFilings.filter(f => !flaggedSymbols.has(f.symbol))
  ];

  // ─── All flagged across all watchlists ───────────────────────────────────────
  const flaggedAllSymbols = Array.from(
    new Set(watchlists.flatMap(wl =>
      wl.symbols.filter(s => s.flagged).map(s => s.symbol)
    ))
  );

  // ─── Bottom “Add Alert” form handler ─────────────────────────────────────────
  const handleAddAlert = async () => {
    if (!newAlertSymbol || !newAlertTarget) return;
    const target = computeTarget(newAlertTarget, newAlertSymbol, watchlists);
    const token = await getIdToken();
    if (!token) return;
    const body = {
      symbol: newAlertSymbol,
      target,
      direction: newAlertDirection,
      note: newAlertNote
    };
    const res = await fetch('/api/alerts/priceAlerts', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const saved: PriceAlert = await res.json();
      setPriceAlerts(pa => [...pa, saved]);
      connection?.invoke('SubL1', saved.symbol).catch(() => {});
      setNewAlertTarget('');
      setNewAlertNote('');
    } else {
      alert('Failed to add alert');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    const token = await getIdToken();
    if (!token) return;
    await fetch('/api/alerts/priceAlerts', {
      method:'DELETE',
      headers:{
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
    setPriceAlerts(pa => pa.filter(x => x.id !== id));
  };

  return (
    <div className="bg-black text-gray-200 min-h-screen relative">
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
        style={{ backgroundAttachment: 'fixed' }}
      />
      <div className="relative z-10 max-w-screen-xl mx-auto p-6 space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <LogoImage style={{ width: 200, height: 120 }} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Watchlist & Quotes */}
          <div className="w-full lg:w-2/5 space-y-6">
            {/* Watchlist selector & CRUD */}
            <div className="flex flex-col gap-2">
              <select
                value={selectedWatchlistIndex}
                onChange={e => setSelectedWatchlistIndex(+e.target.value)}
                className="px-2 py-1 bg-gray-800 border border-gray-600 rounded"
              >
                {watchlists.map((w, i) => (
                  <option key={i} value={i}>
                    {w.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded"
                  placeholder="New Watchlist"
                  value={newWatchlistName}
                  onChange={e => setNewWatchlistName(e.target.value)}
                />
                <button onClick={addWatchlist} className={btnClasses}>
                  Add
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded"
                  placeholder="New Symbol"
                  value={newSymbolText}
                  onChange={e => setNewSymbolText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSymbol()}
                />
                <button onClick={addSymbol} className={btnClasses}>
                  Add
                </button>
              </div>
            </div>

            {/* Quotes w/ Flag + Inline Alerts */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="px-2 py-1 border border-gray-700">🚩</th>
                    <th className="px-2 py-1 border border-gray-700 text-left">Symb</th>
                    <th className="px-2 py-1 border border-gray-700 text-right">% Ch</th>
                    <th className="px-2 py-1 border border-gray-700 text-right">Last</th>
                    <th className="px-2 py-1 w-32 border border-gray-700 text-center">▴ Upper</th>
                    <th className="px-2 py-1 w-32 border border-gray-700 text-center">▾ Lower</th>
                    <th className="px-2 py-1 w-48 border border-gray-700 text-center">✎ Note</th>
                  </tr>
                </thead>
                <tbody>
                  {current.symbols.map(s => (
                    <tr key={s.id} className="hover:bg-gray-800 transition-shadow">
                      <td className="px-2 py-1 border border-gray-700 text-center">
                        <button onClick={() => toggleFlag(s.id)}>
                          {s.flagged ? '🚩' : '⚑'}
                        </button>
                      </td>
                      <td className="px-2 py-1 border border-gray-700">{s.symbol}</td>
                      <td className="px-2 py-1 border border-gray-700 text-right">{s.percentChange}</td>
                      <td className="px-2 py-1 border border-gray-700 text-right">{s.lastPrice}</td>
                      <td className="px-1 py-1 border border-gray-700">
                        <input
                          type="number"
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-center"
                          value={inlineAlertInputs[s.symbol]?.upper || ''}
                          onChange={e => handleInlineInputChange(s.symbol, 'upper', e.target.value)}
                          onKeyDown={e => handleInlineKeyDown(e, s.symbol, 'upper')}
                          placeholder="Enter & Press ↵"
                        />
                      </td>
                      <td className="px-1 py-1 border border-gray-700">
                        <input
                          type="number"
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-center"
                          value={inlineAlertInputs[s.symbol]?.lower || ''}
                          onChange={e => handleInlineInputChange(s.symbol, 'lower', e.target.value)}
                          onKeyDown={e => handleInlineKeyDown(e, s.symbol, 'lower')}
                          placeholder="Enter & Press ↵"
                        />
                      </td>
                      <td className="px-1 py-1 border border-gray-700">
                        <input
                          type="text"
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
                          value={inlineAlertInputs[s.symbol]?.note || ''}
                          onChange={e => handleInlineInputChange(s.symbol, 'note', e.target.value)}
                          placeholder="Optional note"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* All Flagged Symbols Box */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-4">
              <h3 className="text-lg font-semibold mb-2">🚩 All Flagged Symbols</h3>
              {flaggedAllSymbols.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {flaggedAllSymbols.map(sym => (
                    <li key={sym}>{sym}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No flagged symbols</p>
              )}
            </div>
          </div>

          {/* RIGHT: Four Panels */}
          <div className="w-full lg:w-3/5 space-y-6">
            {/* Press Release */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-4">
              <h3 className="text-lg font-semibold mb-2">Press Release</h3>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="px-2 py-1 border border-gray-700">Date & Time</th>
                    <th className="px-2 py-1 border border-gray-700">Headline</th>
                    <th className="px-2 py-1 border border-gray-700">Save</th>
                    <th className="px-2 py-1 border border-gray-700">Unsave</th>
                  </tr>
                </thead>
                <tbody>{/* …press releases… */}</tbody>
              </table>
            </div>

            {/* Tweets */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-4">
              <h3 className="text-lg font-semibold mb-2">Tweets</h3>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="px-2 py-1 border border-gray-700 text-center">🚩</th>
                    <th className="px-2 py-1 border border-gray-700">Name</th>
                    <th className="px-2 py-1 border border-gray-700">Account</th>
                    <th className="px-2 py-1 border border-gray-700">Date & Time</th>
                    <th className="px-2 py-1 border border-gray-700">Save</th>
                    <th className="px-2 py-1 border border-gray-700">Unsave</th>
                  </tr>
                </thead>
                <tbody>
                  {reorderedTweets.map(t => (
                    <tr key={t.id} className="hover:bg-gray-800 transition-shadow">
                      <td className="px-2 py-1 border border-gray-700 text-center">
                        {flaggedSymbols.has(t.symbol) ? '🚩' : ''}
                      </td>
                      <td className="px-2 py-1 border border-gray-700">{t.username}</td>
                      <td className="px-2 py-1 border border-gray-700">{t.symbol}</td>
                      <td className="px-2 py-1 border border-gray-700">
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                      <td className="px-2 py-1 border border-gray-700 text-center">Save</td>
                      <td className="px-2 py-1 border border-gray-700 text-center">Unsave</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TradeExchange */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-4">
              <h3 className="text-lg font-semibold mb-2">Trade Exchange</h3>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="px-2 py-1 border border-gray-700">Date & Time</th>
                    <th className="px-2 py-1 border border-gray-700">Message</th>
                    <th className="px-2 py-1 border border-gray-700">Save</th>
                    <th className="px-2 py-1 border border-gray-700">Unsave</th>
                  </tr>
                </thead>
                <tbody>
                  {reorderedTrades.map(p => (
                    <tr key={p.id} className="hover:bg-gray-800 transition-shadow">
                      <td className="px-2 py-1 border border-gray-700">
                        {new Date(p.save_time_utc).toLocaleString()}
                      </td>
                      <td className="px-2 py-1 border border-gray-700">{p.content}</td>
                      <td className="px-2 py-1 border border-gray-700 text-center">Save</td>
                      <td className="px-2 py-1 border border-gray-700 text-center">Unsave</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Filings */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-4">
              <h3 className="text-lg font-semibold mb-2">Filings</h3>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="px-2 py-1 border border-gray-700">Date & Time</th>
                    <th className="px-2 py-1 border border-gray-700">Form</th>
                    <th className="px-2 py-1 border border-gray-700">Notes</th>
                    <th className="px-2 py-1 border border-gray-700">Save</th>
                    <th className="px-2 py-1 border border-gray-700">Unsave</th>
                  </tr>
                </thead>
                <tbody>
                  {reorderedFilings.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-800 transition-shadow">
                      <td className="px-2 py-1 border border-gray-700">
                        {new Date(f.save_time).toLocaleString()}
                      </td>
                      <td className="px-2 py-1 border border-gray-700">{f.form}</td>
                      <td className="px-2 py-1 border border-gray-700">{/* notes */}</td>
                      <td className="px-2 py-1 border border-gray-700 text-center">Save</td>
                      <td className="px-2 py-1 border border-gray-700 text-center">Unsave</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Price-alerts panel */}
        <div className="relative mt-8">
          {/* toast notifications */}
          <div className="fixed top-4 right-4 space-y-2 z-50">
            {notifications.map((msg, i) => (
              <div key={i} className="bg-yellow-500 text-black px-4 py-2 rounded shadow flex justify-between">
                <span>{msg}</span>
                <button onClick={() => setNotifications(n => n.filter((_, j) => j !== i))} className="ml-2 font-bold">
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-lg shadow-xl p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaBell className="mr-2" /> Price Alerts
            </h2>

            {/* Add Alert form */}
            <div className="mb-4 p-4 bg-gray-800 rounded flex flex-wrap gap-2 items-end">
              <div>
                <label className="block text-sm mb-1">Symbol</label>
                <select
                  value={newAlertSymbol}
                  onChange={e => setNewAlertSymbol(e.target.value)}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded"
                >
                  {watchlists.flatMap(wl => wl.symbols).map(s => (
                    <option key={s.id} value={s.symbol}>{s.symbol}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Target</label>
                <input
                  type="text"
                  value={newAlertTarget}
                  onChange={e => setNewAlertTarget(e.target.value)}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded w-24"
                  placeholder="+5 or 210.00"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Direction</label>
                <select
                  value={newAlertDirection}
                  onChange={e => setNewAlertDirection(e.target.value as any)}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Note</label>
                <input
                  type="text"
                  value={newAlertNote}
                  onChange={e => setNewAlertNote(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded"
                  placeholder="(optional)"
                />
              </div>
              <button onClick={handleAddAlert} className={btnClasses}>
                Add Alert
              </button>
            </div>

            {/* existing alerts */}
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="px-4 py-2 border border-gray-700">Symbol</th>
                  <th className="px-4 py-2 border border-gray-700">Target</th>
                  <th className="px-4 py-2 border border-gray-700">Dir</th>
                  <th className="px-4 py-2 border border-gray-700">Note</th>
                  <th className="px-4 py-2 border border-gray-700">Status</th>
                  <th className="px-4 py-2 border border-gray-700">Delete</th>
                </tr>
              </thead>
              <tbody>
                {priceAlerts.map(a => (
                  <tr key={a.id} className="hover:bg-gray-800 transition-shadow">
                    <td className="px-4 py-2 border border-gray-700">{a.symbol}</td>
                    <td className="px-4 py-2 border border-gray-700">{a.target.toFixed(2)}</td>
                    <td className="px-4 py-2 border border-gray-700">{a.direction}</td>
                    <td className="px-4 py-2 border border-gray-700">{a.note}</td>
                    <td className="px-4 py-2 border border-gray-700">{a.triggered ? '✔️' : '–'}</td>
                    <td className="px-4 py-2 border border-gray-700 text-center">
                      <button onClick={() => handleDeleteAlert(a.id)}>
                        <FaTrash className="text-red-400 hover:text-red-200" />
                      </button>
                    </td>
                  </tr>
                ))}
                {priceAlerts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500 italic">
                      No price alerts yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
