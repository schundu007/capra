import { useState, useEffect } from 'react';
import ApiKeyInput from './ApiKeyInput';

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [apiKeys, setApiKeys] = useState({
    anthropic: null,
    openai: null,
    hasAnthropic: false,
    hasOpenai: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadKeys() {
      if (window.electronAPI) {
        const keys = await window.electronAPI.getApiKeys();
        setApiKeys(keys);
      }
    }
    loadKeys();
  }, []);

  const handleSaveKey = async (provider, key) => {
    if (!window.electronAPI) return;

    try {
      const updated = await window.electronAPI.setApiKeys({ [provider]: key });
      setApiKeys(updated);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComplete = async () => {
    if (!apiKeys.hasAnthropic && !apiKeys.hasOpenai) {
      setError('Please configure at least one API key to continue.');
      return;
    }

    if (window.electronAPI) {
      await window.electronAPI.completeSetup();
    }
    onComplete();
  };

  const hasAtLeastOneKey = apiKeys.hasAnthropic || apiKeys.hasOpenai;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-auto py-8">
      <div className="w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg shadow-yellow-500/30">
            <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Capra</h1>
          <p className="text-slate-400 text-lg">Let's get you set up with your AI providers</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-yellow-400' : 'bg-slate-700'}`} />
          <div className={`w-24 h-1 rounded-full ${step >= 2 ? 'bg-yellow-400' : 'bg-slate-700'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-yellow-400' : 'bg-slate-700'}`} />
        </div>

        {/* Content */}
        <div className="bg-slate-900 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-white mb-2">Configure API Keys</h2>
              <p className="text-slate-400 mb-6">
                Capra uses AI providers to solve coding problems. You'll need at least one API key to get started.
                Your keys are stored securely in your system's keychain.
              </p>

              <div className="space-y-4">
                <ApiKeyInput
                  provider="anthropic"
                  currentKey={apiKeys.anthropic}
                  hasKey={apiKeys.hasAnthropic}
                  onSave={(key) => handleSaveKey('anthropic', key)}
                  onDelete={() => handleSaveKey('anthropic', null)}
                />

                <ApiKeyInput
                  provider="openai"
                  currentKey={apiKeys.openai}
                  hasKey={apiKeys.hasOpenai}
                  onSave={(key) => handleSaveKey('openai', key)}
                  onDelete={() => handleSaveKey('openai', null)}
                />
              </div>

              {error && (
                <div className="mt-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!hasAtLeastOneKey}
                  className="px-6 py-3 text-sm font-medium text-slate-900 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">You're all set!</h2>
                <p className="text-slate-400">
                  Capra is ready to help you solve coding problems.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-8">
                <h3 className="text-white font-medium mb-3">Quick Tips</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Paste a problem description, screenshot, or URL to get started</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Toggle between Claude and GPT models in the header</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Access settings anytime from the header menu (⌘,)</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 text-sm font-medium text-slate-900 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all flex items-center gap-2"
                >
                  Start Using Capra
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Need help? Visit our <a href="https://github.com/your-repo/capra" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300">documentation</a>
        </div>
      </div>
    </div>
  );
}
