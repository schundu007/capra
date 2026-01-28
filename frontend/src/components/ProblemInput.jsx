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

  return (
    <div>
      {/* Tabs + Language in one row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex bg-neutral-800 rounded p-0.5 border border-neutral-700">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === 'text' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === 'url' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
          >
            URL
          </button>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isLoading}
          className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs border border-neutral-700 focus:outline-none focus:border-neutral-500"
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
            className="w-full h-36 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:border-neutral-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !problemText.trim()}
            className="w-full mt-2 py-2 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-sm font-medium rounded transition-colors"
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
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full mt-2 py-2 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-sm font-medium rounded transition-colors"
          >
            {isLoading ? 'Fetching...' : 'Fetch & Solve'}
          </button>
        </form>
      )}
    </div>
  );
}
