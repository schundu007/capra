import { useState, useEffect } from 'react';
import InputPanel from './interview-prep/InputPanel';
import OutputPanel from './interview-prep/OutputPanel';
import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();

// Section definitions
const SECTIONS = [
  { id: 'pitch', name: 'Elevator Pitch', icon: '✨', description: '2-3 minute interview pitch' },
  { id: 'hr', name: 'HR Questions', icon: '✨', description: 'Salary, culture, availability' },
  { id: 'hiring-manager', name: 'Hiring Manager', icon: '✨', description: 'Role-specific questions' },
  { id: 'coding', name: 'Coding', icon: '✨', description: 'Algorithm & coding challenges' },
  { id: 'system-design', name: 'System Design', icon: '✨', description: 'Architecture questions' },
  { id: 'behavioral', name: 'Behavioral', icon: '✨', description: 'STAR method questions' },
  { id: 'techstack', name: 'Tech Stack', icon: '✨', description: 'Technology-specific questions' },
];

// Get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('capra_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Clean up generated content - remove double spaces, extra spaces, empty lines
function cleanupContent(content) {
  if (!content) return content;

  // If it's a string, clean it directly
  if (typeof content === 'string') {
    return content
      .replace(/[ \t]+/g, ' ')           // Replace multiple spaces/tabs with single space
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // Replace 3+ newlines with 2
      .replace(/^\s+|\s+$/gm, '')        // Trim each line
      .replace(/\n{3,}/g, '\n\n')        // Ensure max 2 consecutive newlines
      .trim();
  }

  // If it's an object, recursively clean string values
  if (typeof content === 'object' && content !== null) {
    const cleaned = Array.isArray(content) ? [] : {};
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'string') {
        cleaned[key] = value
          .replace(/[ \t]+/g, ' ')
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .replace(/^\s+|\s+$/gm, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanupContent(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  return content;
}

export default function InterviewPrepModal({ isOpen, onClose, provider, model }) {
  const [activeTab, setActiveTab] = useState('input');
  const [inputs, setInputs] = useState({
    jobDescription: '',
    resume: '',
    coverLetter: '',
    prepMaterials: '',
  });
  const [generated, setGenerated] = useState({
    pitch: null,
    hr: null,
    'hiring-manager': null,
    coding: null,
    'system-design': null,
    behavioral: null,
    techstack: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(null);
  const [streamingContent, setStreamingContent] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('interviewPrepInputs');
      if (saved) {
        try {
          setInputs(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load saved inputs:', e);
        }
      }
      const savedGenerated = localStorage.getItem('interviewPrepGenerated');
      if (savedGenerated) {
        try {
          setGenerated(JSON.parse(savedGenerated));
        } catch (e) {
          console.error('Failed to load saved generated content:', e);
        }
      }
    }
  }, [isOpen]);

  // Save inputs to localStorage
  useEffect(() => {
    if (inputs.jobDescription || inputs.resume || inputs.coverLetter || inputs.prepMaterials) {
      localStorage.setItem('interviewPrepInputs', JSON.stringify(inputs));
    }
  }, [inputs]);

  // Save generated content to localStorage
  useEffect(() => {
    const hasContent = Object.values(generated).some(v => v !== null);
    if (hasContent) {
      localStorage.setItem('interviewPrepGenerated', JSON.stringify(generated));
    }
  }, [generated]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Generate a single section on-demand
  const handleGenerateSection = async (sectionId) => {
    if (!inputs.jobDescription.trim() || !inputs.resume.trim()) {
      alert('Please provide at least a Job Description and Resume');
      return;
    }

    setIsGenerating(true);
    setGeneratingSection(sectionId);
    setStreamingContent('');

    try {
      const response = await fetch(API_URL + '/api/interview/prep/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          jobDescription: inputs.jobDescription,
          resume: inputs.resume,
          coverLetter: inputs.coverLetter,
          prepMaterials: inputs.prepMaterials,
          section: sectionId,
          provider: provider || 'claude',
          model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate section');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                setStreamingContent(prev => {
                  const newContent = prev + data.chunk;
                  // Light cleanup on streaming - just fix double spaces
                  return newContent.replace(/  +/g, ' ');
                });
              }

              if (data.done && data.result) {
                // Clean up the result before storing
                const cleanedResult = cleanupContent(data.result);
                setGenerated(prev => ({ ...prev, [sectionId]: cleanedResult }));
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error('Generate section error:', err);
      alert('Failed to generate: ' + err.message);
    } finally {
      setIsGenerating(false);
      setGeneratingSection(null);
      setStreamingContent('');
    }
  };

  // Handle tab click - auto-generate if not already generated
  const handleTabClick = (sectionId) => {
    setActiveTab(sectionId);

    // Auto-generate if not already generated and not currently generating
    if (sectionId !== 'input' && !generated[sectionId] && !isGenerating && inputs.jobDescription.trim() && inputs.resume.trim()) {
      handleGenerateSection(sectionId);
    }
  };

  const handleClearAll = () => {
    setInputs({ jobDescription: '', resume: '', coverLetter: '', prepMaterials: '' });
    setGenerated({
      pitch: null,
      hr: null,
      'hiring-manager': null,
      coding: null,
      'system-design': null,
      behavioral: null,
      techstack: null,
    });
    localStorage.removeItem('interviewPrepInputs');
    localStorage.removeItem('interviewPrepGenerated');
    setActiveTab('input');
  };

  if (!isOpen) return null;

  const hasInputs = inputs.jobDescription.trim() && inputs.resume.trim();
  const completedSections = Object.values(generated).filter(v => v !== null).length;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Interview Prep</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {completedSections > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {completedSections}/{SECTIONS.length} sections ready
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Input Tab */}
          <button
            onClick={() => setActiveTab('input')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              activeTab === 'input'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-lg">📝</span>
            <div>
              <div className="font-medium">Input Materials</div>
              <div className="text-xs opacity-75">JD, Resume, Cover Letter</div>
            </div>
          </button>

          {/* Divider */}
          <div className="my-2 mx-4 border-t border-gray-800" />

          {/* Section Tabs */}
          {SECTIONS.map((section) => {
            const isActive = activeTab === section.id;
            const isComplete = generated[section.id] !== null;
            const isCurrentlyGenerating = generatingSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => handleTabClick(section.id)}
                disabled={isGenerating && !isCurrentlyGenerating}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : isComplete
                    ? 'text-emerald-400 hover:bg-gray-800'
                    : 'text-gray-400 hover:bg-gray-800'
                } ${isGenerating && !isCurrentlyGenerating ? 'opacity-50' : ''}`}
              >
                <span className="text-base">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{section.name}</div>
                </div>
                {isCurrentlyGenerating && (
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                )}
                {isComplete && !isCurrentlyGenerating && (
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="text-xs text-gray-500 text-center mb-2">
            Click any section to generate
          </div>
          <button
            onClick={handleClearAll}
            className="w-full py-2 px-4 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white overflow-hidden">
        {activeTab === 'input' ? (
          <InputPanel
            inputs={inputs}
            onChange={handleInputChange}
            hasInputs={hasInputs}
          />
        ) : (
          <OutputPanel
            section={SECTIONS.find(s => s.id === activeTab)}
            content={generated[activeTab]}
            streamingContent={generatingSection === activeTab ? streamingContent : ''}
            isGenerating={generatingSection === activeTab}
            onRegenerate={() => handleGenerateSection(activeTab)}
            onGenerate={() => handleGenerateSection(activeTab)}
            hasInputs={hasInputs}
          />
        )}
      </div>
    </div>
  );
}
