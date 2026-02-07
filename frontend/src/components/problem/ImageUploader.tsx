import { useState, useCallback } from 'react';
import { extractTextFromImage, analyzeStream } from '../../services/api';
import { useAppStore } from '../../store/appStore';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    setProblemText,
    setLoading,
    setStreaming,
    appendStreamingText,
    clearStreaming,
    setError: setGlobalError,
    mode
  } = useAppStore();

  const processImage = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Invalid file type. Please upload PNG, JPG, or WebP.');
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }

      setError(null);
      setIsProcessing(true);
      setLoading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(file);
        });

        const imageType = file.type.split('/')[1] as 'png' | 'jpg' | 'jpeg' | 'webp';

        // Step 1: Extract text from image (OCR)
        const ocrResponse = await extractTextFromImage({
          image_base64: base64,
          image_type: imageType,
        });

        const extractedText = ocrResponse.extracted_text;

        // Step 2: Update problem text box
        setProblemText(extractedText);

        setIsProcessing(false);

        // Step 3: Trigger streaming analysis
        clearStreaming();
        setStreaming(true);

        await analyzeStream(
          {
            problem_text: extractedText,
            mode,
          },
          (chunk) => appendStreamingText(chunk),
          () => {
            setStreaming(false);
            setLoading(false);
          },
          (err) => {
            setGlobalError(err);
            setStreaming(false);
            setLoading(false);
          }
        );

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze image');
        setIsProcessing(false);
        setLoading(false);
      }
    },
    [setProblemText, setLoading, setStreaming, appendStreamingText, clearStreaming, setGlobalError, mode]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processImage(file);
    },
    [processImage]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImage(file);
    },
    [processImage]
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
        Upload Screenshot
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Uploaded problem"
            className="w-full max-h-32 object-contain rounded-lg border border-slate-700"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-white">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span className="text-sm">Extracting text...</span>
              </div>
            </div>
          )}
          {!isProcessing && (
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <svg className="w-8 h-8 mx-auto text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-slate-400">
              Drop image or <span className="text-cyan-400">browse</span>
            </p>
          </label>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
