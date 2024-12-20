import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import LogoImage from '~/core/ui/Logo/LogoImage';

export interface AlertTrigger {
    time: string;
    alert: string;
    alertName: string;
    watchlist: string;
    message: string;
    symbol: string;
}

export default function DashboardDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [alerts, setAlerts] = useState<AlertTrigger[]>([
    { time: "10:00 AM", alert: "Price Drop", alertName: "Alert 1", watchlist: "Watchlist A", message: "Price dropped", symbol: "AAPL" },
    { time: "11:00 AM", alert: "Price Rise", alertName: "Alert 2", watchlist: "Watchlist B", message: "Price rose", symbol: "MSFT" }
  ]);

  useEffect(() => {
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(darkMode ? "dark" : "light");
  }, []);

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
          Monitor your alerts and watchlists below.
        </p>

        {/* Alerts List */}
        <div className="w-full max-w-6xl bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-lg p-6">
          {/* Alerts Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold tracking-wide">
              Alerts
            </h2>
          </div>

          {/* Alerts Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="px-6 py-3 text-left">Alert</th>
                  <th className="px-6 py-3 text-left">Watchlist</th>
                  <th className="px-6 py-3 text-left">Symbol</th>
                  <th className="px-6 py-3 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, index) => (
                  <tr
                    key={index}
                    className="transition duration-200 transform hover:scale-[1.01] hover:shadow-lg hover:rounded-lg hover:border-[2px] hover:border-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:via-cyan-500 hover:to-purple-500"
                  >
                    <td className="px-6 py-3 font-medium">{alert.time}</td>
                    <td className="px-6 py-3">{alert.alert}</td>
                    <td className="px-6 py-3">{alert.watchlist}</td>
                    <td className="px-6 py-3">{alert.symbol}</td>
                    <td className="px-6 py-3">{alert.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Link href="/anotherPage">
          <a className="text-blue-500 hover:underline">Go to another page</a>
        </Link>
      </div>
    </div>
  );
}
