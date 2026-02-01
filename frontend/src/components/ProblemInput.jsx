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
  const [detailLevel, setDetailLevel] = useState('detailed');
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
    onScreenshot(file, language);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTabSwitch = (tabId) => {
    if (tabId === activeTab) return;
    // Clear all inputs and solution when switching tabs
    setProblemText('');
    setUrl('');
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab(tabId);
    onClear && onClear();
  };

  const tabs = [
    { id: 'text', label: 'Text', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'url', label: 'URL', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )},
    { id: 'screenshot', label: 'Screenshot', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
  ];

  return (
    <div className="flex flex-col">
      {/* Tabs + Options */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex p-1 rounded-xl bg-gray-100 border border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Detail Level Toggle */}
          <div className="flex p-0.5 rounded-lg bg-gray-100 border border-gray-200">
            <button
              type="button"
              onClick={() => setDetailLevel('high-level')}
              disabled={isLoading}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                detailLevel === 'high-level'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Brief
            </button>
            <button
              type="button"
              onClick={() => setDetailLevel('detailed')}
              disabled={isLoading}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                detailLevel === 'detailed'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Detailed
            </button>
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoading}
            className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-red-600 cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="flex-1 flex flex-col gap-2">
            <div className="relative flex-1">
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Paste your coding problem here..."
                className="w-full h-full min-h-[120px] px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 font-mono leading-relaxed transition-all"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {problemText && (
                  <span className="text-xs text-gray-400">{problemText.length} chars</span>
                )}
                {(problemText.trim() || hasSolution) && (
                  <button
                    type="button"
                    onClick={onClear}
                    disabled={isLoading}
                    title="Clear all"
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasSolution && (
                  <button
                    type="button"
                    onClick={() => onSubmit(problemText, language, detailLevel)}
                    disabled={isLoading || !problemText.trim()}
                    title="Re-solve"
                    className="p-2 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !problemText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Go</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                {(url.trim() || hasSolution) && (
                  <button
                    type="button"
                    onClick={onClear}
                    disabled={isLoading}
                    title="Clear all"
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Fetching</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Go</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'screenshot' && (
          <div className="flex flex-col gap-3">
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-300">
                <img src={preview} alt="Preview" className="w-full max-h-36 object-contain bg-gray-100" />
                <button
                  onClick={clearPreview}
                  disabled={isLoading}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg text-gray-500 hover:text-gray-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-semibold">Analyzing...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-red-600 bg-yellow-50'
                    : 'border-gray-300 hover:border-yellow-400 hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isDragging ? 'bg-yellow-100 text-red-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className={`text-sm font-semibold ${isDragging ? 'text-red-700' : 'text-gray-600'}`}>
                  {isDragging ? 'Drop image here' : 'Drop screenshot or click to upload'}
                </span>
                <span className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
