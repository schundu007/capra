import { useState, useEffect, useRef } from 'react';

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'python', label: 'Python 3' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
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
  const [detailLevel, setDetailLevel] = useState('basic'); // 'basic' or 'detailed'
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
    { id: 'text', label: 'Problem' },
    { id: 'url', label: 'URL' },
    { id: 'screenshot', label: 'Screenshot' },
  ];

  return (
    <div className="flex flex-col">
      {/* Header with tabs and language selector */}
      <div className="flex items-center justify-between mb-3">
        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid #d4e0d8' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className="px-4 py-2 text-sm font-medium transition-colors relative"
              style={{
                color: activeTab === tab.id ? '#1ba94c' : '#4a4a4a',
                borderBottom: activeTab === tab.id ? '2px solid #1ba94c' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Detail Level Toggle */}
          <div className="flex items-center rounded overflow-hidden" style={{ border: '1px solid #d4e0d8' }}>
            <button
              type="button"
              onClick={() => setDetailLevel('basic')}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: detailLevel === 'basic' ? '#1ba94c' : '#ffffff',
                color: detailLevel === 'basic' ? '#ffffff' : '#4a4a4a'
              }}
              title="Minimal code that outputs correct results"
            >
              Basic
            </button>
            <button
              type="button"
              onClick={() => setDetailLevel('detailed')}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: detailLevel === 'detailed' ? '#1ba94c' : '#ffffff',
                color: detailLevel === 'detailed' ? '#ffffff' : '#4a4a4a'
              }}
              title="Comprehensive code with comments and explanations"
            >
              Detailed
            </button>
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm rounded"
            style={{
              background: '#ffffff',
              border: '1px solid #d4e0d8',
              color: '#111111'
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="Paste your coding problem here..."
            className="w-full h-32 px-3 py-2 text-sm font-mono resize-none rounded"
            style={{
              background: '#ffffff',
              border: '1px solid #d4e0d8',
              color: '#111111'
            }}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {problemText && (
                <span className="text-xs" style={{ color: '#7a7a7a' }}>{problemText.length} chars</span>
              )}
              {(problemText.trim() || hasSolution) && (
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  className="text-xs transition-colors"
                  style={{ color: '#7a7a7a' }}
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !problemText.trim()}
              className="px-4 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50"
              style={{ background: '#1ba94c', color: 'white' }}
            >
              {isLoading ? 'Processing...' : 'Solve'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://leetcode.com/problems/..."
            className="w-full px-3 py-2 text-sm rounded"
            style={{
              background: '#ffffff',
              border: '1px solid #d4e0d8',
              color: '#111111'
            }}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <div>
              {(url.trim() || hasSolution) && (
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  className="text-xs"
                  style={{ color: '#7a7a7a' }}
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-4 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50"
              style={{ background: '#1ba94c', color: 'white' }}
            >
              {isLoading ? 'Fetching...' : 'Fetch & Solve'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'screenshot' && (
        <div className="flex flex-col gap-3">
          {preview ? (
            <div className="relative rounded overflow-hidden" style={{ border: '1px solid #d4e0d8' }}>
              <img src={preview} alt="Preview" className="w-full max-h-32 object-contain" style={{ background: '#f5f9f7' }} />
              <button
                onClick={clearPreview}
                disabled={isLoading}
                className="absolute top-2 right-2 p-1 rounded"
                style={{ background: 'rgba(255,255,255,0.9)', color: '#4a4a4a' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                  <span className="text-sm font-medium" style={{ color: '#1ba94c' }}>Analyzing...</span>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="h-32 rounded flex flex-col items-center justify-center cursor-pointer transition-colors"
              style={{
                border: `2px dashed ${isDragging ? '#1ba94c' : '#d4e0d8'}`,
                background: isDragging ? 'rgba(27, 169, 76, 0.05)' : '#f5f9f7'
              }}
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7a7a7a' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: isDragging ? '#1ba94c' : '#4a4a4a' }}>
                {isDragging ? 'Drop here' : 'Drop screenshot or click'}
              </span>
              <span className="text-xs mt-1" style={{ color: '#7a7a7a' }}>PNG, JPG up to 10MB</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      )}
    </div>
  );
}
