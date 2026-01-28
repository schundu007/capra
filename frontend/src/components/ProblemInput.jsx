import { useState, useEffect } from 'react';

const LANGUAGES = [
  { value: 'auto', label: 'Auto' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'sql', label: 'SQL' },
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

  return (
    <div>
      {/* Tabs + Language in one row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex bg-slate-800 rounded p-0.5">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 text-xs rounded ${activeTab === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1 text-xs rounded ${activeTab === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            URL
          </button>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isLoading}
          className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700 focus:outline-none"
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
            placeholder="Paste problem here..."
            className="w-full h-36 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !problemText.trim()}
            className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-sm font-medium rounded transition-colors"
          >
            {isLoading ? 'Processing...' : 'Solve'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUrlSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://leetcode.com/problems/..."
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-sm font-medium rounded transition-colors"
          >
            {isLoading ? 'Fetching...' : 'Fetch & Solve'}
          </button>
        </form>
      )}
    </div>
  );
}
