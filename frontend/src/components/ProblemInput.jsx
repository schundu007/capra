import { useState, useEffect } from 'react';

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'sql', label: 'SQL' },
  { value: 'terraform', label: 'Terraform' },
  { value: 'jenkins', label: 'Jenkins' },
  { value: 'yaml', label: 'YAML/K8s' },
];

export default function ProblemInput({ onSubmit, onFetchUrl, isLoading, extractedText, onExtractedTextClear, shouldClear }) {
  const [problemText, setProblemText] = useState('');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [language, setLanguage] = useState('auto');

  useEffect(() => {
    if (extractedText) {
      setProblemText(extractedText);
      setUrl('');
      setActiveTab('text');
      onExtractedTextClear && onExtractedTextClear();
    }
  }, [extractedText, onExtractedTextClear]);

  useEffect(() => {
    if (shouldClear) {
      setProblemText('');
      setUrl('');
    }
  }, [shouldClear]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (problemText.trim() && !isLoading) {
      onSubmit(problemText, language);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onFetchUrl(url, language);
    }
  };

  const tabClass = (tab) => {
    const base = 'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200';
    if (activeTab === tab) {
      return base + ' bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25';
    }
    return base + ' text-slate-400 hover:text-slate-200 hover:bg-slate-700/50';
  };

  return (
    <div className="glass-panel p-4 animate-fade-in">
      {/* Tab buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('text')} className={tabClass('text')}>
          <span className="flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Text
          </span>
        </button>
        <button onClick={() => setActiveTab('url')} className={tabClass('url')}>
          <span className="flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            URL
          </span>
        </button>
      </div>

      {/* Language select */}
      <div className="mb-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-slate-900/50 text-slate-100 rounded-lg text-sm border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      {activeTab === 'text' ? (
        <form onSubmit={handleTextSubmit}>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="Paste your problem here..."
            className="input-field h-32 resize-none text-sm font-mono"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !problemText.trim()}
            className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Solve Problem
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUrlSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste problem URL here..."
            className="input-field text-sm"
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Supports LeetCode, HackerRank, Glider, Lark, CodeSignal, Codility
          </p>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Fetching...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Fetch & Solve
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
