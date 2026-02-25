import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
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
    icon: '📝',
  },
];

// Documentation field is separate - supports multiple files
const DOCUMENTATION_FIELD = {
  id: 'documentation',
  label: 'Documentation & Study Materials',
  placeholder: 'Upload PDFs, DOCX, TXT files with study materials, guides, or any documentation the AI should learn from...',
  required: false,
  icon: '📚',
  multiFile: true,
};

// Convert plain text to markdown-like format for better rendering
function textToMarkdown(text) {
  if (!text) return '';

  let result = text;

  // Convert lines that look like headers (ALL CAPS, short, or ending with :)
  result = result.replace(/^([A-Z][A-Z\s&\-\/]+):?\s*$/gm, '\n## $1\n');

  // Convert bullet points to markdown bullets
  result = result.replace(/^[\s]*[•·▪►◦‣⁃]\s*/gm, '- ');
  result = result.replace(/^[\s]*[-]\s+/gm, '- ');

  // Convert numbered lists
  result = result.replace(/^[\s]*(\d+)[\.\)]\s+/gm, '$1. ');

  // Add line breaks for better paragraph separation
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

// Document viewer component - Word/Google Docs style
function DocumentViewer({ content, onEdit, fieldLabel, icon }) {
  const markdownContent = textToMarkdown(content);

  return (
    <div
      className="h-full flex flex-col rounded-xl overflow-hidden shadow-sm"
      style={{ background: '#ffffff', border: '1px solid #d1d5db' }}
    >
      {/* Document toolbar - like Word/Docs */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="font-medium text-sm" style={{ color: '#374151' }}>{fieldLabel}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            {content.split(/\s+/).filter(w => w).length} words
          </span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{ background: '#3b82f6', color: '#ffffff' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
      </div>

      {/* Document content area - Paper style */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: '#f1f5f9' }}
      >
        <div
          className="mx-auto my-6 px-12 py-10 shadow-lg"
          style={{
            background: '#ffffff',
            maxWidth: '800px',
            minHeight: 'calc(100% - 48px)',
            borderRadius: '2px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          {/* Document content with proper typography */}
          <div
            className="prose prose-sm max-w-none"
            style={{
              fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
              fontSize: '14px',
              lineHeight: '1.7',
              color: '#1f2937',
            }}
          >
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginTop: '24px', marginBottom: '12px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginTop: '20px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginTop: '16px', marginBottom: '8px' }}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p style={{ marginTop: '8px', marginBottom: '8px', lineHeight: '1.7' }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul style={{ marginTop: '8px', marginBottom: '8px', paddingLeft: '20px', listStyleType: 'disc' }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ marginTop: '8px', marginBottom: '8px', paddingLeft: '20px', listStyleType: 'decimal' }}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginTop: '4px', marginBottom: '4px', lineHeight: '1.6' }}>
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: '600', color: '#111827' }}>{children}</strong>
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InputPanel({ inputs, onChange, hasInputs }) {
  const [dragOver, setDragOver] = useState(null);
  const fileInputRef = useRef(null);
  const docFileInputRef = useRef(null);
  const [editingField, setEditingField] = useState(null);
  const [extracting, setExtracting] = useState(null);
  const [extractingDoc, setExtractingDoc] = useState(false);

  // Extract text from file (supports PDF, DOCX, TXT, MD)
  const extractTextFromFile = async (file, fieldId) => {
    const filename = file.name.toLowerCase();

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

  // Handle adding documentation files (multiple)
  const handleDocumentationUpload = async (files) => {
    setExtractingDoc(true);
    const currentDocs = inputs.documentation || [];
    const newDocs = [];

    for (const file of files) {
      const filename = file.name.toLowerCase();
      let content = '';

      try {
        if (filename.endsWith('.txt') || filename.endsWith('.md')) {
          content = await file.text();
        } else if (filename.endsWith('.pdf') || filename.endsWith('.docx')) {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(API_URL + '/api/extract', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            content = data.text;
          } else {
            console.error('Failed to extract:', file.name);
            continue;
          }
        } else {
          continue; // Skip unsupported files
        }

        if (content) {
          newDocs.push({ name: file.name, content });
        }
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }

    if (newDocs.length > 0) {
      onChange('documentation', [...currentDocs, ...newDocs]);
    }
    setExtractingDoc(false);
  };

  const handleDocDrop = async (e) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files).filter(f => {
      const name = f.name.toLowerCase();
      return name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.pdf') || name.endsWith('.docx');
    });
    if (files.length > 0) {
      await handleDocumentationUpload(files);
    }
  };

  const handleDocFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleDocumentationUpload(files);
    }
    e.target.value = '';
  };

  const removeDocument = (index) => {
    const currentDocs = inputs.documentation || [];
    onChange('documentation', currentDocs.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid #e5e5e5', background: '#ffffff' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#333333' }}>Interview Materials</h3>
        <p className="text-sm mt-1" style={{ color: '#666666' }}>
          Add your job description and resume. Content displays in document format for easy reading.
        </p>
      </div>

      {/* Input Fields - 2x2 Grid */}
      <div className="flex-1 overflow-y-auto p-4" style={{ background: '#f3f4f6' }}>
        <div className="grid grid-cols-2 gap-4 h-full">
          {INPUT_FIELDS.map((field) => {
            const hasContent = inputs[field.id]?.trim();
            const isEditing = editingField === field.id || !hasContent;

            return (
              <div key={field.id} className="flex flex-col min-h-[250px]">
                {hasContent && !isEditing ? (
                  <DocumentViewer
                    content={inputs[field.id]}
                    onEdit={() => setEditingField(field.id)}
                    fieldLabel={field.label}
                    icon={field.icon}
                  />
                ) : (
                  <div className="flex flex-col h-full">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#6b7280' }}>
                      <span>{field.icon}</span>
                      <span>{field.label}</span>
                      {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                      {hasContent && (
                        <button
                          onClick={() => setEditingField(null)}
                          className="ml-auto text-xs font-medium px-2.5 py-1 rounded-md"
                          style={{ background: '#10b981', color: '#ffffff' }}
                        >
                          Done Editing
                        </button>
                      )}
                    </label>
                    <div
                      className="relative flex-1 rounded-xl transition-all"
                      style={{
                        border: dragOver === field.id ? '2px dashed #10b981' : inputs[field.id] ? '2px solid #10b981' : '2px dashed #d1d5db',
                        background: '#ffffff',
                      }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(field.id); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => handleDrop(e, field.id)}
                    >
                      <textarea
                        value={inputs[field.id]}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="absolute inset-0 w-full h-full p-4 text-sm resize-none bg-transparent focus:outline-none rounded-xl"
                        style={{ color: '#374151', lineHeight: '1.6' }}
                        autoFocus={editingField === field.id}
                      />

                      {!inputs[field.id] && !extracting && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center" style={{ color: '#9ca3af' }}>
                            <div className="text-4xl mb-3 opacity-40">{field.icon}</div>
                            <p className="text-sm font-medium">Drop file or paste text</p>
                            <p className="text-xs mt-1">Supports PDF, DOCX, TXT, MD</p>
                          </div>
                        </div>
                      )}

                      {extracting === field.id && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
                          <div className="text-center" style={{ color: '#10b981' }}>
                            <div className="w-8 h-8 mx-auto mb-2 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
                            <p className="text-sm font-medium">Extracting text...</p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-3 right-3 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 hover:shadow-md"
                        style={{ background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,.pdf,.docx"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, field.id)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Documentation Section - Full width below the 2x2 grid */}
        <div className="mt-4">
          <div className="flex flex-col h-48 rounded-xl overflow-hidden" style={{ background: '#ffffff', border: '2px dashed #d1d5db' }}>
            {/* Header */}
            <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <div className="flex items-center gap-2">
                <span className="text-base">📚</span>
                <span className="font-medium text-sm" style={{ color: '#374151' }}>Documentation & Study Materials</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>
                  AI will learn from these
                </span>
              </div>
              {(inputs.documentation?.length > 0) && (
                <span className="text-xs" style={{ color: '#6b7280' }}>
                  {inputs.documentation.length} file(s) uploaded
                </span>
              )}
            </div>

            {/* Content Area */}
            <div
              className="flex-1 p-4 overflow-y-auto"
              style={{ background: dragOver === 'documentation' ? '#f0fdf4' : '#ffffff' }}
              onDragOver={(e) => { e.preventDefault(); setDragOver('documentation'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={handleDocDrop}
            >
              {extractingDoc ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center" style={{ color: '#10b981' }}>
                    <div className="w-8 h-8 mx-auto mb-2 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
                    <p className="text-sm font-medium">Processing files...</p>
                  </div>
                </div>
              ) : inputs.documentation?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {inputs.documentation.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                      style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
                    >
                      <span style={{ color: '#374151' }}>{doc.name}</span>
                      <span className="text-xs" style={{ color: '#9ca3af' }}>
                        ({Math.round(doc.content.length / 1000)}KB)
                      </span>
                      <button
                        onClick={() => removeDocument(idx)}
                        className="p-1 rounded hover:bg-red-100"
                        style={{ color: '#ef4444' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => docFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: '#10b981', color: '#ffffff' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add More
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center" style={{ color: '#9ca3af' }}>
                  <div className="text-3xl mb-2 opacity-40">📚</div>
                  <p className="text-sm font-medium">Drop files or click to upload</p>
                  <p className="text-xs mt-1">PDF, DOCX, TXT, MD - The AI will learn from all uploaded materials</p>
                  <button
                    onClick={() => docFileInputRef.current?.click()}
                    className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: '#10b981', color: '#ffffff' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Documentation
                  </button>
                </div>
              )}
            </div>
            <input
              ref={docFileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.docx"
              multiple
              className="hidden"
              onChange={handleDocFileSelect}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3" style={{ borderTop: '1px solid #e5e5e5', background: '#ffffff' }}>
        <div className="flex items-center justify-center">
          <div className="text-sm">
            {hasInputs ? (
              <span className="flex items-center gap-2" style={{ color: '#10b981' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <strong>Ready!</strong> Select a section from the sidebar to generate content
              </span>
            ) : (
              <span style={{ color: '#6b7280' }}>Add Job Description and Resume to get started</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
