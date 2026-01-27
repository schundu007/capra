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
    const base = 'px-3 py-1 rounded text-xs font-medium transition-colors';
    if (activeTab === tab) {
      return base + ' bg-blue-600 text-white';
    }
    return base + ' bg-slate-700 text-slate-300 hover:bg-slate-600';
  };

  const buttonClass = 'mt-2 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors text-sm';

  return (
    <div className="bg-slate-800 rounded-lg p-3">
      <div className="flex gap-1 mb-2">
        <button onClick={() => setActiveTab('text')} className={tabClass('text')}>
          Text
        </button>
        <button onClick={() => setActiveTab('url')} className={tabClass('url')}>
          URL
        </button>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isLoading}
          className="ml-auto px-2 py-1 bg-slate-700 text-slate-100 rounded text-xs border border-slate-600 focus:border-blue-500 focus:outline-none"
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
            className="w-full h-32 p-2 bg-slate-900 text-slate-100 rounded border border-slate-700 focus:border-blue-500 focus:outline-none resize-none text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !problemText.trim()}
            className={buttonClass}
          >
            {isLoading ? 'Solving...' : 'Solve'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUrlSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="HackerRank/LeetCode URL..."
            className="w-full p-2 bg-slate-900 text-slate-100 rounded border border-slate-700 focus:border-blue-500 focus:outline-none text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className={buttonClass}
          >
            {isLoading ? 'Fetching...' : 'Fetch & Solve'}
          </button>
        </form>
      )}
    </div>
  );
}
