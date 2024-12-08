import { useState, useEffect } from "react";
import LogoImage from "~/core/ui/Logo/LogoImage";

interface Symbol {
  symbol: string;
  change: number;
  last: number;
  bid: number;
  ask: number;
  upperAlert: number;
  lowerAlert: number;
}

interface Watchlist {
  name: string;
  symbols: Symbol[];
}

export default function DashboardDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    { name: "Watchlist 1", symbols: [] },
    { name: "Watchlist 2", symbols: [] },
  ]);
  const [selectedWatchlistIndex, setSelectedWatchlistIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");

  useEffect(() => {
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(darkMode ? "dark" : "light");
  }, []);

  const handleAddWatchlist = () => {
    if (newWatchlistName.trim()) {
      setWatchlists([
        ...watchlists,
        { name: newWatchlistName, symbols: [] },
      ]);
      setSelectedWatchlistIndex(watchlists.length); // Automatically select the new watchlist
      setNewWatchlistName("");
      setIsModalOpen(false);
    }
  };

  const handleDeleteWatchlist = () => {
    if (watchlists.length > 1) {
      setWatchlists((prev) =>
        prev.filter((_, index) => index !== selectedWatchlistIndex)
      );
      setSelectedWatchlistIndex(0); // Reset to the first watchlist
    } else {
      alert("You must have at least one watchlist!");
    }
  };

  const handleAddSymbol = () => {
    if (newSymbol.trim()) {
      setWatchlists((prev) =>
        prev.map((watchlist, index) =>
          index === selectedWatchlistIndex
            ? {
                ...watchlist,
                symbols: [
                  ...watchlist.symbols,
                  { symbol: newSymbol.toUpperCase(), change: 0, last: 0, bid: 0, ask: 0, upperAlert: 0, lowerAlert: 0 },
                ],
              }
            : watchlist
        )
      );
      setNewSymbol("");
    }
  };

  const handleDeleteSymbol = (symbolIndex: number) => {
    setWatchlists((prev) =>
      prev.map((watchlist, index) =>
        index === selectedWatchlistIndex
          ? {
              ...watchlist,
              symbols: watchlist.symbols.filter((_, j) => j !== symbolIndex),
            }
          : watchlist
      )
    );
  };

  const currentWatchlist = watchlists[selectedWatchlistIndex];

  return (
    <div
      className={`relative min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Dynamic Background */}
      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
            : "bg-gradient-to-br from-blue-50 via-blue-100 to-purple-200"
        } z-0`}
        style={{
          backgroundAttachment: "fixed",
        }}
      ></div>

      {/* Dashboard Content */}
      <div className="relative z-10 flex flex-col items-center p-6 space-y-6">
        {/* Logo and Header */}
        <LogoImage style={{ width: "160px", height: "100px" }} />
        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          Welcome to your Trade Companion Dashboard
        </h1>
        <p className="text-center max-w-prose text-lg italic">
          Manage your watchlists and monitor your trades below
        </p>

        {/* Watchlist Dropdown */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-6">
          <select
            value={selectedWatchlistIndex}
            onChange={(e) => setSelectedWatchlistIndex(Number(e.target.value))}
            className={`px-4 py-2 border rounded-lg ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
          >
            {watchlists.map((watchlist, index) => (
              <option key={index} value={index}>
                {watchlist.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-105 transform transition"
          >
            Add Watchlist
          </button>
          <button
            onClick={handleDeleteWatchlist}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:scale-105 transform transition"
          >
            Delete Watchlist
          </button>
        </div>

        {/* Current Watchlist */}
        {currentWatchlist && (
          <div className="w-full max-w-6xl bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-lg p-6">
            {/* Watchlist Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold tracking-wide">
                {currentWatchlist.name}
              </h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="Add Symbol"
                  className={`px-4 py-2 border rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-800 border-gray-300"
                  }`}
                />
                <button
                  onClick={handleAddSymbol}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-105 transform transition"
                >
                  Add Symbol
                </button>
              </div>
            </div>

            {/* Symbols Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Symbol</th>
                    <th className="px-6 py-3 text-right">% Change</th>
                    <th className="px-6 py-3 text-right">Last</th>
                    <th className="px-6 py-3 text-right">Bid</th>
                    <th className="px-6 py-3 text-right">Ask</th>
                    <th className="px-6 py-3 text-right">Upper Alert</th>
                    <th className="px-6 py-3 text-right">Lower Alert</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWatchlist.symbols.map((symbol, symbolIndex) => (
                    <tr
                      key={symbolIndex}
                      className="transition duration-200 transform hover:scale-[1.01] hover:shadow-lg hover:rounded-lg hover:border-[2px] hover:border-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:via-cyan-500 hover:to-purple-500"
                    >
                      <td className="px-6 py-3 font-medium">{symbol.symbol}</td>
                      <td className="px-6 py-3 text-right">
                        {symbol.change >= 0
                          ? `+${symbol.change}%`
                          : `${symbol.change}%`}
                      </td>
                      <td className="px-6 py-3 text-right">
                        ${symbol.last.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        ${symbol.bid.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        ${symbol.ask.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        ${symbol.upperAlert.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        ${symbol.lowerAlert.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleDeleteSymbol(symbolIndex)}
                          className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Adding Watchlist */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Add a New Watchlist</h2>
            <input
              type="text"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              placeholder="Enter watchlist name"
              className={`w-full px-4 py-2 border rounded-lg mb-4 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            />
            <button
              onClick={handleAddWatchlist}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-105 transform transition mr-4"
            >
              Add
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:scale-105 transform transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
