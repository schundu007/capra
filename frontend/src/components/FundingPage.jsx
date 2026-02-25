import { useEffect } from 'react';

/**
 * Funding/Donation Page for Ascend
 */
export default function FundingPage({ onClose }) {
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

        {/* Donation content */}
        <div className="px-8 py-6">
          <div className="min-h-[400px]">
            {/* Donorbox embed */}
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

            {/* PayPal donation option */}
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50 mt-4">
              <p className="text-gray-500 text-sm mb-4">
                Support Ascend development:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
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
        </div>
      </div>
    </div>
  );
}
