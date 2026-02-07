import { useState, useEffect, useRef } from 'react';

const LANGUAGES = [
  { value: 'auto', label: 'Auto' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JS' },
  { value: 'typescript', label: 'TS' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'terraform', label: 'Terraform' },
  { value: 'jenkins', label: 'Jenkins' },
  { value: 'yaml', label: 'YAML' },
];

export default function ProblemInput({ onSubmit, onFetchUrl, onScreenshot, onClear, isLoading, extractedText, onExtractedTextClear, shouldClear, hasSolution }) {
  const [problemText, setProblemText] = useState('');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [language, setLanguage] = useState('auto');
  const [detailLevel, setDetailLevel] = useState('basic');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (extractedText) {
      setProblemText(extractedText);
      setUrl('');
      setActiveTab('text');
      onExtractedTextClear?.();
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
      onSubmit(problemText, language, detailLevel);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onFetchUrl(url, language, detailLevel);
    }
  };

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
    onScreenshot(file, language, detailLevel);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTabSwitch = (tabId) => {
    if (tabId === activeTab) return;
    setProblemText('');
    setUrl('');
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab(tabId);
    onClear?.();
  };

  const tabs = [
    { id: 'text', label: 'Text' },
    { id: 'url', label: 'URL' },
    { id: 'screenshot', label: 'Image' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Detail Toggle */}
          <div className="flex rounded overflow-hidden border border-slate-600">
            <button
              type="button"
              onClick={() => setDetailLevel('basic')}
              disabled={isLoading}
              className={`px-2 py-0.5 text-xs transition-colors ${
                detailLevel === 'basic'
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Basic
            </button>
            <button
              type="button"
              onClick={() => setDetailLevel('detailed')}
              disabled={isLoading}
              className={`px-2 py-0.5 text-xs transition-colors ${
                detailLevel === 'detailed'
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full
            </button>
          </div>

          {/* Language */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoading}
            className="px-2 py-0.5 text-xs rounded bg-slate-800 border border-slate-600 text-white"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content - Fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="flex-1 flex flex-col min-h-0">
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Paste coding problem..."
              className="flex-1 w-full px-3 py-2 text-sm font-mono resize-none rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-2 flex-shrink-0">
              <span className="text-xs text-slate-500">
                {problemText.length > 0 && `${problemText.length} chars`}
              </span>
              <button
                type="submit"
                disabled={isLoading || !problemText.trim()}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 transition-all"
              >
                {isLoading ? '...' : 'Solve'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 transition-all"
              >
                {isLoading ? '...' : 'Fetch'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'screenshot' && (
          <div className="flex-1 flex flex-col min-h-0">
            {preview ? (
              <div className="relative flex-1 rounded-lg overflow-hidden border border-slate-700 bg-slate-800/50">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  onClick={clearPreview}
                  disabled={isLoading}
                  className="absolute top-2 right-2 p-1 rounded bg-black/50 text-white hover:bg-black/70"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed ${
                  isDragging
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <svg className="w-8 h-8 mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-slate-400">Drop image or click</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
