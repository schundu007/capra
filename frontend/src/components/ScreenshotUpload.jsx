import { useState, useRef, useEffect } from 'react';

export default function ScreenshotUpload({ onUpload, isLoading, shouldClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (shouldClear) {
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [shouldClear]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    onUpload(file);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-panel p-4 animate-fade-in">
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-28 object-contain rounded-lg bg-slate-900/50"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={clearPreview}
              disabled={isLoading}
              className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          {/* Close button always visible */}
          <button
            onClick={clearPreview}
            disabled={isLoading}
            className="absolute top-2 right-2 p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs text-indigo-300">Analyzing...</span>
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
          className={
            'h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ' +
            (isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
              : 'border-slate-600 hover:border-indigo-500/50 hover:bg-slate-800/50')
          }
        >
          <div className="p-3 rounded-full bg-slate-800/50 mb-2">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-slate-400 text-xs">Drop screenshot or click to upload</p>
          <p className="text-slate-500 text-xs mt-1">Supports PNG, JPG, GIF</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
