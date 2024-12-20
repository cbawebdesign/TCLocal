import { useState, useEffect } from 'react';
import Link from 'next/link';
import LogoImage from '~/core/ui/Logo/LogoImage'; // Adjust this import as needed

export default function ConfigPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Toggle states
  const [iqQuotesEnabled, setIqQuotesEnabled] = useState(false);
  const [lxQuotesEnabled, setLxQuotesEnabled] = useState(false);
  const [polyQuotesEnabled, setPolyQuotesEnabled] = useState(false);
  const [dasEnabled, setDasEnabled] = useState(false);

  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(darkMode ? 'dark' : 'light');
  }, []);

  const config = {
    DasAccount: 'MyAccount',
    DasId: 'MyID',
    DasPassword: 'MyPassword',
    IqQuotesEnabled: iqQuotesEnabled,
    DasEnabled: dasEnabled,
    LxQuotesEnabled: lxQuotesEnabled,
    PolyQuotesEnabled: polyQuotesEnabled,
    LxKey: '',
    PolyKey: '',
    ScriptLeftClickAlertFile: '',
    ScriptLeftClickAlertArgs: '',
    FilingViewerHeight: 1000,
    FilingViewerWidth: 800,
    FilingViewerTop: 10,
    FilingViewerLeft: 10,
    MktCapMicro: 300,
    MktCapSmall: 2000,
    MktCapMid: 10000,
    MktCapLarge: 200000,
    FilterNewsPositive: 'good,positive,profit',
    FilterNewsNegative: 'bad,negative,loss'
  };

  const inputWidth = '7rem';

  const toggleClasses = (enabled: boolean) =>
    `toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${
      enabled ? 'bg-green-500' : 'bg-red-500'
    }`;

  const inputClasses =
    'px-4 py-2 border rounded-lg w-64 bg-gray-50 border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white';
  const numberInputClasses =
    'px-4 py-2 border rounded-lg bg-gray-50 border-gray-300 w-24 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white';

  return (
    <div
      className={`relative min-h-screen ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {/* Gradient Background */}
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

      <div className="relative z-10 flex flex-col items-center p-6 space-y-6">
        {/* Header and Logo */}
        <LogoImage style={{ width: '160px', height: '100px' }} />
        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          Trade Companion Configurations
        </h1>
        <p className="text-center max-w-prose text-lg italic">
          An overview of your current settings.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-105 transform transition"
        >
          Go Back Home
        </Link>

        {/* Main Panel */}
        <div className="w-full max-w-6xl bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-2xl backdrop-blur-lg p-6 space-y-8">
          {/* Quotes Section */}
          <section>
            <h4 className="text-2xl font-bold mb-4">Quotes</h4>

            {/* IQ Feed */}
            <h5 className="text-xl font-semibold mb-2">IQ Feed</h5>
            <div className="flex items-center space-x-4 mb-4">
              <span>IQ feed quotes are {config.IqQuotesEnabled ? 'enabled' : 'disabled'}</span>
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  checked={config.IqQuotesEnabled}
                  onChange={(e) => setIqQuotesEnabled(e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ top: '0', left: '0' }}
                />
                <label className={toggleClasses(config.IqQuotesEnabled)}></label>
              </div>
            </div>

            {/* LX Quotes */}
            <h5 className="text-xl font-semibold mb-2">LX Quotes</h5>
            <div className="flex items-center space-x-4 mb-4">
              <span>LX quotes are {config.LxQuotesEnabled ? 'enabled' : 'disabled'}</span>
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  checked={config.LxQuotesEnabled}
                  onChange={(e) => setLxQuotesEnabled(e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ top: '0', left: '0' }}
                />
                <label className={toggleClasses(config.LxQuotesEnabled)}></label>
              </div>
            </div>

            <label className="block mb-2">
              <span className="font-medium mr-2">Key:</span>
              <input
                type="text"
                value={config.LxKey}
                readOnly
                className={inputClasses}
              />
            </label>

            {/* Polygon */}
            <h5 className="text-xl font-semibold mb-2 mt-6">Polygon</h5>
            <div className="flex items-center space-x-4 mb-4">
              <span>Poly quotes are {config.PolyQuotesEnabled ? 'enabled' : 'disabled'}</span>
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  checked={config.PolyQuotesEnabled}
                  onChange={(e) => setPolyQuotesEnabled(e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ top: '0', left: '0' }}
                />
                <label className={toggleClasses(config.PolyQuotesEnabled)}></label>
              </div>
            </div>

            <label className="block mb-2">
              <span className="font-medium mr-2">Key:</span>
              <input
                type="text"
                value={config.PolyKey}
                readOnly
                className={inputClasses}
              />
            </label>
          </section>

          {/* Platforms Section */}
          <section>
            <h4 className="text-2xl font-bold mb-4">Platforms</h4>
            <h5 className="text-xl font-semibold mb-2">DAS</h5>
            <div className="flex items-center space-x-4 mb-4">
              <span>DAS platform is {config.DasEnabled ? 'enabled' : 'disabled'}</span>
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  checked={config.DasEnabled}
                  onChange={(e) => setDasEnabled(e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ top: '0', left: '0' }}
                />
                <label className={toggleClasses(config.DasEnabled)}></label>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label>
                <span className="font-medium mr-2">Account:</span>
                <input
                  type="text"
                  readOnly
                  value={config.DasAccount}
                  disabled={!config.DasEnabled}
                  className={`${inputClasses} ${!config.DasEnabled ? 'opacity-70' : ''}`}
                />
              </label>
              <label>
                <span className="font-medium mr-2">ID:</span>
                <input
                  type="text"
                  readOnly
                  value={config.DasId}
                  disabled={!config.DasEnabled}
                  className={`${inputClasses} ${!config.DasEnabled ? 'opacity-70' : ''}`}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Password:</span>
                <input
                  type="password"
                  readOnly
                  value={config.DasPassword}
                  disabled={!config.DasEnabled}
                  className={`${inputClasses} ${!config.DasEnabled ? 'opacity-70' : ''}`}
                />
              </label>
            </div>
          </section>

          {/* Scripts Section */}
          <section>
            <h4 className="text-2xl font-bold mb-4">Scripts</h4>
            <h5 className="text-xl font-semibold mb-2">Left-click Alert row</h5>
            <div className="flex flex-col space-y-2">
              <label>
                <span className="font-medium mr-2">Filename:</span>
                <input
                  type="text"
                  value={config.ScriptLeftClickAlertFile}
                  readOnly
                  className={inputClasses}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Args:</span>
                <input
                  type="text"
                  value={config.ScriptLeftClickAlertArgs}
                  readOnly
                  className={inputClasses}
                />
              </label>
            </div>
          </section>

          {/* Filing Viewer Section */}
          <section>
            <h4 className="text-2xl font-bold mb-4">Filing Viewer</h4>
            <div className="flex flex-wrap space-x-4 space-y-4 items-center">
              <label>
                <span className="font-medium mr-2">Height:</span>
                <input
                  type="number"
                  value={config.FilingViewerHeight}
                  readOnly
                  className={numberInputClasses}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Width:</span>
                <input
                  type="number"
                  value={config.FilingViewerWidth}
                  readOnly
                  className={numberInputClasses}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Top:</span>
                <input
                  type="number"
                  value={config.FilingViewerTop}
                  readOnly
                  className={numberInputClasses}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Left:</span>
                <input
                  type="number"
                  value={config.FilingViewerLeft}
                  readOnly
                  className={numberInputClasses}
                />
              </label>
            </div>
          </section>

          {/* Market Cap Section */}
          <section>
            <h4 className="text-2xl font-bold mb-4">Market Cap ($M)</h4>
            <div className="flex flex-wrap space-x-4 space-y-4 items-center">
              <label>
                <span className="font-medium mr-2">Micro:</span>
                <input
                  type="number"
                  style={{ width: inputWidth }}
                  value={config.MktCapMicro}
                  readOnly
                  className={`px-2 py-1 border rounded-lg bg-gray-50 border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Small:</span>
                <input
                  type="number"
                  style={{ width: inputWidth }}
                  value={config.MktCapSmall}
                  readOnly
                  className={`px-2 py-1 border rounded-lg bg-gray-50 border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Mid:</span>
                <input
                  type="number"
                  style={{ width: inputWidth }}
                  value={config.MktCapMid}
                  readOnly
                  className={`px-2 py-1 border rounded-lg bg-gray-50 border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Large:</span>
                <input
                  type="number"
                  style={{ width: inputWidth }}
                  value={config.MktCapLarge}
                  readOnly
                  className={`px-2 py-1 border rounded-lg bg-gray-50 border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Mega (&gt;Large):</span>
                <input
                  disabled
                  type="number"
                  style={{ width: inputWidth }}
                  value={config.MktCapLarge}
                  readOnly
                  className={`px-2 py-1 border rounded-lg bg-gray-100 border-gray-300 cursor-not-allowed opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300`}
                />
              </label>
            </div>
          </section>

          {/* Filtered PRs Section */}
          <section>
            <h4 className="text-2xl font-bold mb-4">Filtered PRs</h4>
            <div className="flex flex-col space-y-2">
              <label>
                <span className="font-medium mr-2">Positive News:</span>
                <input
                  type="text"
                  value={config.FilterNewsPositive}
                  readOnly
                  className={inputClasses}
                />
              </label>
              <label>
                <span className="font-medium mr-2">Negative News:</span>
                <input
                  type="text"
                  value={config.FilterNewsNegative}
                  readOnly
                  className={inputClasses}
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
