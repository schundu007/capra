import { useState, useEffect } from 'react';

/**
 * Funding/Donation Page for Ascend
 * Powered by Donorbox - like Signal's donation page
 */
export default function FundingPage({ onClose }) {
  const [activeTab, setActiveTab] = useState('card'); // 'card' or 'crypto'

  // Load Donorbox script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://donorbox.org/widget.js';
    script.setAttribute('paypalExpress', 'false');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-10 text-white rounded-t-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Support Ascend</h1>
              <p className="text-emerald-100 text-sm">Keep interview prep free and accessible</p>
            </div>
          </div>
          <p className="text-emerald-50 leading-relaxed">
            Ascend is built by developers, for developers. No ads, no tracking, no data selling.
            Your donations fund servers, AI API costs, and ongoing development to help engineers
            ace their technical interviews.
          </p>
        </div>

        {/* Why we need funding - compact */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2" />
                  </svg>
                </div>
                <span className="text-gray-600">Servers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-600">AI APIs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                </div>
                <span className="text-gray-600">Diagrams</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <span className="text-gray-600">Development</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab selector */}
        <div className="px-8 pt-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('card')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'card'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Card, PayPal, Bank
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'crypto'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Crypto
            </button>
          </div>
        </div>

        {/* Donation content */}
        <div className="px-8 py-6">
          {activeTab === 'card' ? (
            <div className="min-h-[400px]">
              {/* Donorbox embed - replace 'your-campaign' with actual campaign slug */}
              <iframe
                src="https://donorbox.org/embed/support-ascend-interview-prep?default_interval=o&hide_donation_meter=true"
                name="donorbox"
                allowpaymentrequest="allowpaymentrequest"
                seamless="seamless"
                frameBorder="0"
                scrolling="no"
                height="900px"
                width="100%"
                style={{
                  maxWidth: '500px',
                  minWidth: '250px',
                  maxHeight: 'none !important',
                  margin: '0 auto',
                  display: 'block'
                }}
                allow="payment"
              />

              {/* Fallback if Donorbox not set up yet */}
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50 mt-4">
                <p className="text-gray-500 text-sm mb-4">
                  Donorbox integration coming soon. For now, you can support via:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href="https://github.com/sponsors/schundu007"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub Sponsors
                  </a>
                  <a
                    href="https://buymeacoffee.com/ascendapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-gray-900 rounded-lg hover:bg-[#e6c700] transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.168.364z"/>
                    </svg>
                    Buy Me a Coffee
                  </a>
                  <a
                    href="https://paypal.me/ascendinterviewprep"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0070ba] text-white rounded-lg hover:bg-[#005ea6] transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .632-.544h6.012c2.657 0 4.63.622 5.703 1.799.965 1.058 1.403 2.593 1.262 4.427-.019.249-.045.496-.078.74-.557 4.142-3.025 6.197-7.33 6.197H8.811a.641.641 0 0 0-.632.544l-.993 4.078a.641.641 0 0 1-.632.544l-.478-.168z"/>
                    </svg>
                    PayPal
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6">
              <p className="text-gray-600 text-sm mb-6 text-center">
                Support Ascend with cryptocurrency. All donations go directly to infrastructure costs.
              </p>

              <div className="space-y-4 max-w-md mx-auto">
                {/* Ethereum */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#627EEA] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ETH</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Ethereum (ETH/USDC)</h4>
                      <p className="text-xs text-gray-500">ERC-20 tokens accepted</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <code className="text-xs text-gray-600 break-all select-all">
                      0x742d35Cc6634C0532925a3b844Bc9e7595f...
                    </code>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Coming soon - wallet setup in progress</p>
                </div>

                {/* Bitcoin */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#F7931A] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">BTC</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Bitcoin (BTC)</h4>
                      <p className="text-xs text-gray-500">Native Bitcoin network</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <code className="text-xs text-gray-600 break-all select-all">
                      bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj...
                    </code>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Coming soon - wallet setup in progress</p>
                </div>

                {/* Solana */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SOL</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Solana (SOL/USDC)</h4>
                      <p className="text-xs text-gray-500">SPL tokens accepted</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <code className="text-xs text-gray-600 break-all select-all">
                      Coming soon...
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              100% of donations fund infrastructure & development
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Powered by</span>
              <a href="https://donorbox.org" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium">
                Donorbox
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            <a href="https://github.com/schundu007/capra" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              View source on GitHub
            </a>
            {' '} &bull; {' '}
            Open source interview prep tool
          </p>
        </div>
      </div>
    </div>
  );
}
