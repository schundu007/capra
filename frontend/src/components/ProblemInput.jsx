import { useState, useEffect, useRef } from 'react';

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

export default function ProblemInput({ onSubmit, onFetchUrl, onScreenshot, onClear, isLoading, extractedText, onExtractedTextClear, shouldClear, hasSolution }) {
  const [problemText, setProblemText] = useState('');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [language, setLanguage] = useState('auto');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

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
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  // Screenshot handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onScreenshot(file, language);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs + Language row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'text' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'url' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
          >
            URL
          </button>
          <button
            onClick={() => setActiveTab('screenshot')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'screenshot' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
          >
            Screenshot
          </button>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isLoading}
          className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md text-xs border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="flex-1 flex flex-col">
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Paste problem here..."
              className="flex-1 min-h-[120px] px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 resize-none focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:bg-white dark:focus:bg-neutral-800"
              disabled={isLoading}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !problemText.trim()}
                className="flex-1 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-500 text-white dark:text-neutral-900 text-sm font-medium rounded transition-colors"
              >
                {isLoading ? 'Processing...' : 'Solve'}
              </button>
              {hasSolution && (
                <button
                  type="button"
                  onClick={() => onSubmit(problemText, language)}
                  disabled={isLoading || !problemText.trim()}
                  title="Re-solve with same input"
                  className="px-3 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              {(problemText.trim() || hasSolution) && (
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  title="Clear all"
                  className="px-3 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="flex flex-col">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:bg-white dark:focus:bg-neutral-800"
              disabled={isLoading}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="flex-1 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-500 text-white dark:text-neutral-900 text-sm font-medium rounded transition-colors"
              >
                {isLoading ? 'Fetching...' : 'Fetch & Solve'}
              </button>
              {(url.trim() || hasSolution) && (
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  title="Clear all"
                  className="px-3 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        )}

        {activeTab === 'screenshot' && (
          <div className="flex flex-col">
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full max-h-32 object-contain rounded bg-neutral-100 dark:bg-neutral-800" />
                <button
                  onClick={clearPreview}
                  disabled={isLoading}
                  className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-400 text-xs border border-neutral-200 dark:border-neutral-700"
                >
                  ✕
                </button>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-neutral-900/70 rounded">
                    <span className="text-xs text-neutral-700 dark:text-neutral-300">Analyzing...</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`h-24 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDragging ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800' : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                }`}
              >
                <svg className="w-6 h-6 text-neutral-400 dark:text-neutral-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-neutral-400 dark:text-neutral-500 text-xs">Drop screenshot or click to upload</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
