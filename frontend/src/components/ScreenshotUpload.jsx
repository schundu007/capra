import { useState, useRef, useEffect } from 'react';

export default function ScreenshotUpload({ onUpload, isLoading, shouldClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (shouldClear) {
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [shouldClear]);

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
    onUpload(file);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-24 object-contain rounded bg-slate-800" />
          <button
            onClick={clearPreview}
            disabled={isLoading}
            className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-red-600 rounded text-slate-300 text-xs"
          >
            ✕
          </button>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 rounded">
              <span className="text-xs text-indigo-400">Analyzing...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <span className="text-slate-500 text-xs">Drop screenshot or click</span>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
