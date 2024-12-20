import { useState, useEffect } from 'react';
import LogoImage from '~/core/ui/Logo/LogoImage';

interface Symbol {
  symbol: string;
  change: number;
  last: number;
}

interface Watchlist {
  name: string;
  symbols: Symbol[];
}

export default function Watchlist() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    { name: 'Watchlist 1', symbols: [] },
    { name: 'Watchlist 2', symbols: [] },
  ]);
  const [selectedWatchlistIndex, setSelectedWatchlistIndex] = useState(0);

  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(darkMode ? 'dark' : 'light');
  }, []);

  const handleAddWatchlist = () => {
    const newWatchlistName = `Watchlist ${watchlists.length + 1}`;
    setWatchlists([...watchlists, { name: newWatchlistName, symbols: [] }]);
    setSelectedWatchlistIndex(watchlists.length); // Automatically select the new watchlist
  };

  const handleDeleteWatchlist = () => {
    setWatchlists((prev) =>
      prev.filter((_, index) => index !== selectedWatchlistIndex)
    );
    setSelectedWatchlistIndex(0); // Reset to the first watchlist
  };

  const handleAddSymbol = (symbol: string) => {
    if (symbol.trim()) {
      setWatchlists((prev) =>
        prev.map((watchlist, index) =>
          index === selectedWatchlistIndex
            ? {
                ...watchlist,
                symbols: [
                  ...watchlist.symbols,
                  { symbol: symbol.toUpperCase(), change: 0, last: 0 },
                ],
              }
            : watchlist
        )
      );
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
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {/* Dynamic Background */}
      <div
        className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black'
            : 'bg-gradient-to-br from-blue-50 via-blue-100 to-purple-200'
        } z-0`}
        style={{
          backgroundAttachment: 'fixed',
        }}
      ></div>

      {/* Dashboard Content */}
      <div className="relative z-10 flex flex-col items-center p-6 space-y-6">
        {/* Logo and Header */}
        <LogoImage style={{ width: '160px', height: '100px' }} />
        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          Welcome to your Trade Companion 
        </h1>
        <p className="text-center max-w-prose text-lg italic">
          Manage your watchlists and monitor your trades below.
        </p>

        {/* Watchlist Dropdown */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-6">
          <select
            value={selectedWatchlistIndex}
            onChange={(e) => setSelectedWatchlistIndex(Number(e.target.value))}
            className={`px-4 py-2 border rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-800 text-white border-gray-600'
                : 'bg-white text-gray-800 border-gray-300'
            }`}
          >
            {watchlists.map((watchlist, index) => (
              <option key={index} value={index}>
                {watchlist.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddWatchlist}
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
            <h2 className="text-2xl font-bold tracking-wide mb-4">
              {currentWatchlist.name}
            </h2>

            {/* Symbols Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Symbol</th>
                    <th className="px-6 py-3 text-right">% Change</th>
                    <th className="px-6 py-3 text-right">Last</th>
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
                        <button
                          onClick={() => handleDeleteSymbol(symbolIndex)}
                          className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Add Symbol Row */}
                  <tr>
                    <td colSpan={4} className="px-6 py-3 text-center">
                      <input
                        type="text"
                        placeholder="Add Symbol"
                        className={`px-4 py-2 border rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-800 text-white border-gray-600'
                            : 'bg-white text-gray-800 border-gray-300'
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            handleAddSymbol(input.value.trim().toUpperCase());
                            input.value = '';
                          }
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
