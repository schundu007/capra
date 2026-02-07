import { useState, useEffect, useRef, useCallback } from 'react';

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
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback((shrink = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lineHeight = 18; // approx line height for text-[11px]
    const minRows = 2;
    const maxRows = 12;
    const minHeight = lineHeight * minRows + 12; // 12px for padding
    const maxHeight = lineHeight * maxRows + 12;

    if (shrink) {
      // Shrink to minimum height
      textarea.style.height = `${minHeight}px`;
    } else {
      // Reset height to auto to get scrollHeight
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Clamp between min and max
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Shrink textarea when solution is generated
  useEffect(() => {
    if (hasSolution) {
      adjustTextareaHeight(true);
    }
  }, [hasSolution, adjustTextareaHeight]);

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
      // Reset textarea height
      adjustTextareaHeight(true);
    }
  }, [shouldClear, adjustTextareaHeight]);

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
        <div className="flex gap-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`px-1.5 py-0.5 text-[9px] font-semibold rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1ba94c]/10 text-[#1ba94c]'
                  : 'text-gray-800 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Detail Toggle */}
          <div className="flex rounded overflow-hidden border border-gray-300">
            <button
              type="button"
              onClick={() => setDetailLevel('basic')}
              disabled={isLoading}
              className={`px-1.5 py-0.5 text-[9px] transition-colors ${
                detailLevel === 'basic'
                  ? 'bg-[#1ba94c] text-white'
                  : 'text-gray-500 hover:text-gray-700 bg-white'
              }`}
            >
              Basic
            </button>
            <button
              type="button"
              onClick={() => setDetailLevel('detailed')}
              disabled={isLoading}
              className={`px-1.5 py-0.5 text-[9px] transition-colors ${
                detailLevel === 'detailed'
                  ? 'bg-[#1ba94c] text-white'
                  : 'text-gray-500 hover:text-gray-700 bg-white'
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
            className="px-1.5 py-0.5 text-[9px] rounded bg-white border border-gray-300 text-gray-700"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col">
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="flex flex-col">
            <textarea
              ref={textareaRef}
              value={problemText}
              onChange={(e) => {
                setProblemText(e.target.value);
                adjustTextareaHeight(false);
              }}
              onPaste={() => {
                // Delay to allow paste to complete
                setTimeout(() => adjustTextareaHeight(false), 0);
              }}
              placeholder="Paste coding problem..."
              className="w-full px-2 py-1.5 text-[11px] font-mono resize-none rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1ba94c]"
              style={{ minHeight: '48px', maxHeight: '228px' }}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-1.5 flex-shrink-0">
              <span className="text-[9px] text-gray-400">
                {problemText.length > 0 && `${problemText.length} chars`}
              </span>
              <button
                type="submit"
                disabled={isLoading || !problemText.trim()}
                className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-[#1ba94c] text-white hover:bg-[#158f3f] disabled:opacity-50 transition-all"
              >
                {isLoading ? '...' : 'Solve'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-1.5">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-2 py-1.5 text-[11px] rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1ba94c]"
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-[#1ba94c] text-white hover:bg-[#158f3f] disabled:opacity-50 transition-all"
              >
                {isLoading ? '...' : 'Fetch'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'screenshot' && (
          <div className="flex-1 flex flex-col min-h-0">
            {preview ? (
              <div className="relative flex-1 rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  onClick={clearPreview}
                  disabled={isLoading}
                  className="absolute top-1.5 right-1.5 p-0.5 rounded bg-black/50 text-white hover:bg-black/70"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    ? 'border-[#1ba94c] bg-[#1ba94c]/5'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
              >
                <svg className="w-6 h-6 mb-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] text-gray-500">Drop image or click</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
