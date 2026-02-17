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

export default function ProblemInput({ onSubmit, onFetchUrl, onScreenshot, onClear, isLoading, extractedText, onExtractedTextClear, shouldClear, hasSolution, expanded, onToggleExpand }) {
  const [problemText, setProblemText] = useState('');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [language, setLanguage] = useState('auto');
  const [detailLevel, setDetailLevel] = useState('basic');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Get first line for collapsed preview
  const getPreviewText = () => {
    if (!problemText) return '';
    const firstLine = problemText.split('\n')[0];
    return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
  };

  // Clean up text - remove extra empty lines and whitespace
  const cleanupText = useCallback((text) => {
    if (!text) return '';
    return text
      .split('\n')
      .map(line => line.trimEnd()) // Remove trailing whitespace from each line
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
      .trim();
  }, []);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lineHeight = 22; // line height for 14px font
    const minHeight = lineHeight * 2 + 16; // 2 rows minimum + padding
    // When expanded, allow much larger height to show full content
    const maxHeight = expanded !== false ? 600 : 400;

    // Reset height to auto to measure content
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;

    // Set height to fit content, clamped between min and max
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [expanded]);

  // Resize textarea when problem text or expanded state changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [problemText, expanded, adjustTextareaHeight]);

  useEffect(() => {
    if (extractedText) {
      // Clean up extracted text and set it
      const cleaned = cleanupText(extractedText);
      setProblemText(cleaned);
      setUrl('');
      setActiveTab('text');
      onExtractedTextClear?.();
    }
  }, [extractedText, onExtractedTextClear, cleanupText]);

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

  // Collapsed view - minimal display with expand button
  if (expanded === false && problemText) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] truncate" style={{ color: '#a1a1aa' }}>{getPreviewText()}</p>
        </div>
        <button
          onClick={onToggleExpand}
          className="flex-shrink-0 px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all flex items-center gap-1.5"
          style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
          title="Expand problem"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Expand
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className="px-2.5 py-1 text-[10px] font-medium rounded-md transition-all"
                style={{
                  background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#10b981' : '#71717a',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Collapse button - only show when there's content */}
          {problemText && onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="ml-1 p-1.5 rounded-lg transition-all"
              style={{ color: '#71717a' }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#fafafa'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#71717a'; }}
              title="Collapse problem"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Detail Toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => setDetailLevel('basic')}
              disabled={isLoading}
              className="px-2 py-1 text-[10px] font-medium transition-all"
              style={{
                background: detailLevel === 'basic' ? '#10b981' : 'transparent',
                color: detailLevel === 'basic' ? 'white' : '#71717a',
              }}
            >
              Basic
            </button>
            <button
              type="button"
              onClick={() => setDetailLevel('detailed')}
              disabled={isLoading}
              className="px-2 py-1 text-[10px] font-medium transition-all"
              style={{
                background: detailLevel === 'detailed' ? '#10b981' : 'transparent',
                color: detailLevel === 'detailed' ? 'white' : '#71717a',
              }}
            >
              Full
            </button>
          </div>

          {/* Language */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoading}
            className="px-2 py-1 text-[10px] rounded-lg"
            style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}
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
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Paste coding problem..."
              className="w-full px-3 py-2 resize-none rounded-lg border placeholder-gray-500 focus:outline-none focus:ring-2 scrollbar-thin"
              style={{
                minHeight: '60px',
                maxHeight: expanded !== false ? '600px' : '400px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#fafafa',
                backgroundColor: '#18181b',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="off"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-2 flex-shrink-0">
              <span className="text-[10px]" style={{ color: '#52525b' }}>
                {problemText.length > 0 && `${problemText.length} chars`}
              </span>
              <button
                type="submit"
                disabled={isLoading || !problemText.trim()}
                className="px-4 py-1.5 text-[11px] font-medium rounded-lg transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                }}
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
              className="w-full px-3 py-2 text-[12px] rounded-lg focus:outline-none focus:ring-2"
              style={{
                background: '#18181b',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fafafa',
              }}
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-4 py-1.5 text-[11px] font-medium rounded-lg transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                }}
              >
                {isLoading ? '...' : 'Fetch & Solve'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'screenshot' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {preview ? (
              <div className="relative rounded-xl overflow-hidden" style={{ maxHeight: '300px', background: '#18181b', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '300px', display: 'block' }}
                />
                <button
                  onClick={clearPreview}
                  disabled={isLoading}
                  className="absolute top-2 right-2 p-1.5 rounded-full transition-colors"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
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
                className="flex-1 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all py-8"
                style={{
                  border: isDragging ? '2px dashed #10b981' : '2px dashed rgba(255,255,255,0.1)',
                  background: isDragging ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <svg className="w-8 h-8 mb-2" style={{ color: '#52525b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[11px]" style={{ color: '#71717a' }}>Drop image or click to upload</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
