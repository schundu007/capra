import { useState, useRef } from 'react';
import { getApiUrl } from '../../hooks/useElectron';

const API_URL = getApiUrl();

const INPUT_FIELDS = [
  {
    id: 'jobDescription',
    label: 'Job Description',
    placeholder: 'Paste the full job description here...',
    required: true,
    icon: '📋',
  },
  {
    id: 'resume',
    label: 'Resume',
    placeholder: 'Paste your resume content here...',
    required: true,
    icon: '📄',
  },
  {
    id: 'coverLetter',
    label: 'Cover Letter',
    placeholder: 'Paste your cover letter (optional)...',
    required: false,
    icon: '✉️',
  },
  {
    id: 'prepMaterials',
    label: 'Additional Prep Materials',
    placeholder: 'Company research, notes, questions to ask (optional)...',
    required: false,
    icon: '📚',
  },
];

export default function InputPanel({ inputs, onChange, hasInputs }) {
  const [dragOver, setDragOver] = useState(null);
  const fileInputRef = useRef(null);
  const [activeField, setActiveField] = useState(null);
  const [extracting, setExtracting] = useState(null);

  // Extract text from file (supports PDF, DOCX, TXT, MD)
  const extractTextFromFile = async (file, fieldId) => {
    const filename = file.name.toLowerCase();

    // For plain text files, read directly
    if (filename.endsWith('.txt') || filename.endsWith('.md')) {
      try {
        const text = await file.text();
        onChange(fieldId, text);
      } catch (err) {
        console.error('Failed to read file:', err);
        alert('Failed to read file');
      }
      return;
    }

    // For PDF/DOCX, send to backend for extraction
    if (filename.endsWith('.pdf') || filename.endsWith('.docx')) {
      setExtracting(fieldId);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(API_URL + '/api/extract', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to extract text');
        }

        const data = await response.json();
        onChange(fieldId, data.text);
      } catch (err) {
        console.error('Failed to extract text:', err);
        alert('Failed to extract text from file: ' + err.message);
      } finally {
        setExtracting(null);
      }
      return;
    }

    alert('Unsupported file type. Please upload PDF, DOCX, TXT, or MD files.');
  };

  const handleDrop = async (e, fieldId) => {
    e.preventDefault();
    setDragOver(null);

    const files = Array.from(e.dataTransfer.files);
    const supportedFile = files.find(f => {
      const name = f.name.toLowerCase();
      return name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.pdf') || name.endsWith('.docx');
    });

    if (supportedFile) {
      await extractTextFromFile(supportedFile, fieldId);
    }
  };

  const handleFileSelect = async (e, fieldId) => {
    const file = e.target.files?.[0];
    if (file) {
      await extractTextFromFile(file, fieldId);
    }
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Interview Materials</h3>
        <p className="text-sm text-gray-500 mt-1">
          Provide your job description and resume to generate personalized interview prep content.
        </p>
      </div>

      {/* Input Fields */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-6 h-full">
          {INPUT_FIELDS.map((field) => (
            <div
              key={field.id}
              className={`flex flex-col ${field.id === 'jobDescription' || field.id === 'resume' ? 'row-span-1' : ''}`}
            >
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <span>{field.icon}</span>
                <span>{field.label}</span>
                {field.required && <span className="text-red-500">*</span>}
                {inputs[field.id] && (
                  <span className="ml-auto text-xs text-gray-400">
                    {inputs[field.id].length.toLocaleString()} chars
                  </span>
                )}
              </label>
              <div
                className={`relative flex-1 min-h-[200px] rounded-lg border-2 transition-all ${
                  dragOver === field.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : inputs[field.id]
                    ? 'border-emerald-200 bg-white'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(field.id);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, field.id)}
              >
                <textarea
                  value={inputs[field.id]}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  onFocus={() => setActiveField(field.id)}
                  onBlur={() => setActiveField(null)}
                  placeholder={field.placeholder}
                  className="absolute inset-0 w-full h-full p-4 text-sm resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset rounded-lg"
                />

                {/* Upload hint overlay when empty */}
                {!inputs[field.id] && activeField !== field.id && !extracting && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-gray-400">
                      <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-xs">Drag & drop PDF, DOCX, TXT, or MD</p>
                      <p className="text-xs mt-1">or click to type</p>
                    </div>
                  </div>
                )}

                {/* Extracting indicator */}
                {extracting === field.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                    <div className="text-center text-emerald-600">
                      <div className="w-8 h-8 mx-auto mb-2 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium">Extracting text...</p>
                    </div>
                  </div>
                )}

                {/* File upload button */}
                <button
                  onClick={() => {
                    setActiveField(field.id);
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-2 right-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Upload file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.docx"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, activeField || field.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="text-sm">
            {hasInputs ? (
              <span className="text-emerald-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Ready! Click any section on the left to generate content
              </span>
            ) : (
              <span className="text-gray-500">Fill in Job Description and Resume, then click any section to generate</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
