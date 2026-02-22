import { useState, useRef } from 'react';
import { getApiUrl } from '../../hooks/useElectron';

const API_URL = getApiUrl();

const INPUT_FIELDS = [
  {
    id: 'jobDescription',
    label: 'Job Description',
    placeholder: 'Paste the full job description here...',
    required: true,
  },
  {
    id: 'resume',
    label: 'Resume',
    placeholder: 'Paste your resume content here...',
    required: true,
  },
  {
    id: 'coverLetter',
    label: 'Cover Letter',
    placeholder: 'Paste your cover letter (optional)...',
    required: false,
  },
  {
    id: 'prepMaterials',
    label: 'Additional Prep Materials',
    placeholder: 'Company research, notes, questions to ask (optional)...',
    required: false,
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
    <div className="h-full flex flex-col" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid #e5e5e5', background: '#ffffff' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#333333' }}>Interview Materials</h3>
        <p className="text-sm mt-1" style={{ color: '#666666' }}>
          Provide your job description and resume to generate personalized interview prep content.
        </p>
      </div>

      {/* Input Fields */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: '#f5f5f5' }}>
        <div className="grid grid-cols-2 gap-6 h-full">
          {INPUT_FIELDS.map((field) => (
            <div
              key={field.id}
              className={`flex flex-col ${field.id === 'jobDescription' || field.id === 'resume' ? 'row-span-1' : ''}`}
            >
              <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#666666' }}>
                <span>{field.label}</span>
                {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                {inputs[field.id] && (
                  <span className="ml-auto font-normal normal-case" style={{ color: '#999999' }}>
                    {inputs[field.id].length.toLocaleString()} chars
                  </span>
                )}
              </label>
              <div
                className="relative flex-1 min-h-[160px] rounded transition-all"
                style={{
                  border: dragOver === field.id
                    ? '2px solid #10b981'
                    : inputs[field.id]
                    ? '1px solid #10b981'
                    : '1px solid #e5e5e5',
                  background: '#ffffff',
                }}
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
                  className="absolute inset-0 w-full h-full p-3 text-sm resize-none bg-transparent focus:outline-none rounded"
                  style={{ color: '#333333' }}
                />

                {/* Upload hint overlay when empty */}
                {!inputs[field.id] && activeField !== field.id && !extracting && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center" style={{ color: '#999999' }}>
                      <p className="text-xs font-medium">Drop file here</p>
                      <p className="text-xs mt-0.5">PDF, DOCX, TXT, or MD</p>
                    </div>
                  </div>
                )}

                {/* Extracting indicator */}
                {extracting === field.id && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                    <div className="text-center" style={{ color: '#10b981' }}>
                      <div className="w-5 h-5 mx-auto mb-1 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
                      <p className="text-xs font-medium">Extracting...</p>
                    </div>
                  </div>
                )}

                {/* File upload button */}
                <button
                  onClick={() => {
                    setActiveField(field.id);
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{ background: '#f5f5f5', color: '#666666' }}
                  title="Upload file"
                >
                  Upload
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
      <div className="px-6 py-3" style={{ borderTop: '1px solid #e5e5e5', background: '#ffffff' }}>
        <div className="flex items-center justify-center">
          <div className="text-xs">
            {hasInputs ? (
              <span style={{ color: '#10b981' }}>
                <strong>Ready</strong> — Click any section on the left to generate
              </span>
            ) : (
              <span style={{ color: '#666666' }}>Fill in Job Description and Resume to generate</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
