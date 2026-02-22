import { useState, useEffect, useRef } from 'react';
import InputPanel from './interview-prep/InputPanel';
import OutputPanel from './interview-prep/OutputPanel';
import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();

// Section definitions
const SECTIONS = [
  { id: 'pitch', name: 'Elevator Pitch', description: '2-3 minute interview pitch' },
  { id: 'hr', name: 'HR Questions', description: 'Salary, culture, availability' },
  { id: 'hiring-manager', name: 'Hiring Manager', description: 'Role-specific questions' },
  { id: 'coding', name: 'Coding', description: 'Algorithm & coding challenges' },
  { id: 'system-design', name: 'System Design', description: 'Architecture questions' },
  { id: 'behavioral', name: 'Behavioral', description: 'STAR method questions' },
  { id: 'techstack', name: 'Tech Stack', description: 'Technology-specific questions' },
];

const EMPTY_INPUTS = {
  jobDescription: '',
  resume: '',
  coverLetter: '',
  prepMaterials: '',
};

const EMPTY_GENERATED = {
  pitch: null,
  hr: null,
  'hiring-manager': null,
  coding: null,
  'system-design': null,
  behavioral: null,
  techstack: null,
};

// Get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('capra_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Clean up generated content - remove double spaces, extra spaces, empty lines
function cleanupContent(content) {
  if (!content) return content;

  if (typeof content === 'string') {
    return content
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

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

// Load company data from localStorage
function loadCompanyData() {
  const stored = localStorage.getItem('interviewPrepCompanies');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse company data:', e);
    }
  }

  // Check for legacy data and migrate
  const legacyInputs = localStorage.getItem('interviewPrepInputs');
  const legacyGenerated = localStorage.getItem('interviewPrepGenerated');

  if (legacyInputs || legacyGenerated) {
    // Migrate legacy data to new format with "Default" company
    const migratedData = {
      companies: ['Untitled Company'],
      activeCompany: 'Untitled Company',
      data: {
        'Untitled Company': {
          inputs: legacyInputs ? JSON.parse(legacyInputs) : { ...EMPTY_INPUTS },
          generated: legacyGenerated ? JSON.parse(legacyGenerated) : { ...EMPTY_GENERATED },
        },
      },
    };

    // Save migrated data and clean up legacy
    localStorage.setItem('interviewPrepCompanies', JSON.stringify(migratedData));
    localStorage.removeItem('interviewPrepInputs');
    localStorage.removeItem('interviewPrepGenerated');

    return migratedData;
  }

  // Return default structure
  return {
    companies: [],
    activeCompany: null,
    data: {},
  };
}

// Save company data to localStorage
function saveCompanyData(companyData) {
  localStorage.setItem('interviewPrepCompanies', JSON.stringify(companyData));
}

export default function InterviewPrepModal({ isOpen, onClose, provider, model, isDedicatedWindow = false, embedded = false }) {
  const [activeTab, setActiveTab] = useState('input');
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [inputs, setInputs] = useState({ ...EMPTY_INPUTS });
  const [generated, setGenerated] = useState({ ...EMPTY_GENERATED });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(null);
  const [generatingSections, setGeneratingSections] = useState(new Set()); // For parallel generation
  const [streamingContent, setStreamingContent] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showNewCompanyInput, setShowNewCompanyInput] = useState(false);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const dropdownRef = useRef(null);
  const newCompanyInputRef = useRef(null);

  // Load company data on mount
  useEffect(() => {
    if (isOpen || embedded) {
      const data = loadCompanyData();
      setCompanies(data.companies);
      setActiveCompany(data.activeCompany);

      if (data.activeCompany && data.data[data.activeCompany]) {
        setInputs(data.data[data.activeCompany].inputs || { ...EMPTY_INPUTS });
        setGenerated(data.data[data.activeCompany].generated || { ...EMPTY_GENERATED });
      } else {
        setInputs({ ...EMPTY_INPUTS });
        setGenerated({ ...EMPTY_GENERATED });
      }
    }
  }, [isOpen, embedded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
        setShowNewCompanyInput(false);
        setNewCompanyName('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus new company input when shown
  useEffect(() => {
    if (showNewCompanyInput && newCompanyInputRef.current) {
      newCompanyInputRef.current.focus();
    }
  }, [showNewCompanyInput]);

  // Save current company data whenever inputs or generated content changes
  useEffect(() => {
    if (activeCompany) {
      const data = loadCompanyData();
      data.data[activeCompany] = {
        inputs,
        generated,
      };
      data.activeCompany = activeCompany;
      saveCompanyData(data);
    }
  }, [inputs, generated, activeCompany]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Create a new company
  const handleCreateCompany = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName || companies.includes(trimmedName)) {
      return;
    }

    const data = loadCompanyData();
    data.companies.push(trimmedName);
    data.activeCompany = trimmedName;
    data.data[trimmedName] = {
      inputs: { ...EMPTY_INPUTS },
      generated: { ...EMPTY_GENERATED },
    };
    saveCompanyData(data);

    setCompanies(data.companies);
    setActiveCompany(trimmedName);
    setInputs({ ...EMPTY_INPUTS });
    setGenerated({ ...EMPTY_GENERATED });
    setShowNewCompanyInput(false);
    setNewCompanyName('');
    setShowCompanyDropdown(false);
    setActiveTab('input');
  };

  // Switch to a different company
  const handleSwitchCompany = (companyName) => {
    if (companyName === activeCompany) {
      setShowCompanyDropdown(false);
      return;
    }

    const data = loadCompanyData();
    data.activeCompany = companyName;
    saveCompanyData(data);

    setActiveCompany(companyName);
    if (data.data[companyName]) {
      setInputs(data.data[companyName].inputs || { ...EMPTY_INPUTS });
      setGenerated(data.data[companyName].generated || { ...EMPTY_GENERATED });
    } else {
      setInputs({ ...EMPTY_INPUTS });
      setGenerated({ ...EMPTY_GENERATED });
    }
    setShowCompanyDropdown(false);
    setActiveTab('input');
  };

  // Rename company
  const handleRenameCompany = (newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName === activeCompany) {
      setEditingCompanyName(false);
      return;
    }

    if (companies.includes(trimmedName)) {
      alert('A company with this name already exists');
      return;
    }

    const data = loadCompanyData();
    const index = data.companies.indexOf(activeCompany);
    if (index !== -1) {
      data.companies[index] = trimmedName;
      data.data[trimmedName] = data.data[activeCompany];
      delete data.data[activeCompany];
      data.activeCompany = trimmedName;
      saveCompanyData(data);

      setCompanies(data.companies);
      setActiveCompany(trimmedName);
    }
    setEditingCompanyName(false);
  };

  // Delete a company
  const handleDeleteCompany = (companyName) => {
    if (!confirm(`Delete "${companyName}" and all its interview prep data?`)) {
      return;
    }

    const data = loadCompanyData();
    data.companies = data.companies.filter(c => c !== companyName);
    delete data.data[companyName];

    // Switch to another company or clear
    if (data.companies.length > 0) {
      data.activeCompany = data.companies[0];
      saveCompanyData(data);
      setCompanies(data.companies);
      setActiveCompany(data.companies[0]);
      setInputs(data.data[data.companies[0]]?.inputs || { ...EMPTY_INPUTS });
      setGenerated(data.data[data.companies[0]]?.generated || { ...EMPTY_GENERATED });
    } else {
      data.activeCompany = null;
      saveCompanyData(data);
      setCompanies([]);
      setActiveCompany(null);
      setInputs({ ...EMPTY_INPUTS });
      setGenerated({ ...EMPTY_GENERATED });
    }
    setShowCompanyDropdown(false);
    setActiveTab('input');
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
                  return newContent.replace(/  +/g, ' ');
                });
              }

              if (data.done && data.result) {
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

  // Generate a single section (for parallel generation)
  const generateSingleSection = async (sectionId) => {
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
      let fullContent = '';

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
                fullContent += data.chunk;
              }

              if (data.done && data.result) {
                const cleanedResult = cleanupContent(data.result);
                return { sectionId, result: cleanedResult };
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      return { sectionId, result: null };
    } catch (err) {
      console.error(`Generate section ${sectionId} error:`, err);
      return { sectionId, error: err.message };
    }
  };

  // Generate all sections in parallel
  const handleGenerateAll = async () => {
    if (!inputs.jobDescription.trim() || !inputs.resume.trim()) {
      alert('Please provide at least a Job Description and Resume');
      return;
    }

    // Get sections that need to be generated
    const sectionsToGenerate = SECTIONS.filter(s => !generated[s.id]).map(s => s.id);

    if (sectionsToGenerate.length === 0) {
      alert('All sections are already generated. Use "Clear All" to regenerate.');
      return;
    }

    setIsGenerating(true);
    setGeneratingSections(new Set(sectionsToGenerate));

    // Run all sections in parallel
    const promises = sectionsToGenerate.map(async (sectionId) => {
      const result = await generateSingleSection(sectionId);

      // Update state as each section completes
      if (result.result) {
        setGenerated(prev => ({ ...prev, [sectionId]: result.result }));
      }

      // Remove from generating set
      setGeneratingSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });

      return result;
    });

    await Promise.all(promises);

    setIsGenerating(false);
    setGeneratingSections(new Set());
  };

  // Handle tab click - auto-generate if not already generated
  const handleTabClick = (sectionId) => {
    setActiveTab(sectionId);

    if (sectionId !== 'input' && !generated[sectionId] && !isGenerating && inputs.jobDescription.trim() && inputs.resume.trim()) {
      handleGenerateSection(sectionId);
    }
  };

  const handleClearAll = () => {
    if (!confirm('Clear generated content? (Your inputs will be kept)')) return;

    setGenerated({ ...EMPTY_GENERATED });
    setActiveTab('input');
  };

  if (!isOpen && !embedded) return null;

  const hasInputs = inputs.jobDescription.trim() && inputs.resume.trim();
  const completedSections = Object.values(generated).filter(v => v !== null).length;

  // Use different container style for dedicated window vs modal vs embedded
  const containerClass = embedded
    ? "h-full flex"
    : isDedicatedWindow
    ? "h-screen flex"
    : "fixed inset-0 z-50 flex bg-black/50";

  return (
    <div className={`${containerClass} relative`}>
      {/* Drag bar for dedicated window - spans entire top */}
      {isDedicatedWindow && !embedded && (
        <div
          className="absolute top-0 left-0 right-0 h-7 z-50"
          style={{ WebkitAppRegion: 'drag', backgroundColor: 'transparent' }}
        />
      )}
      {/* Sidebar Navigation */}
      <div className={`w-64 flex flex-col ${isDedicatedWindow && !embedded ? 'pt-7' : ''}`} style={{ background: '#ffffff', borderRight: '1px solid #e5e5e5' }}>
        {/* Header with Company Selector */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid #e5e5e5' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: '#333333' }}>Interview Prep</h2>
            {!isDedicatedWindow && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#666666' }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Company Selector */}
          <div className="relative" ref={dropdownRef}>
            {activeCompany ? (
              <button
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 rounded transition-colors text-left"
                style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {editingCompanyName ? (
                    <input
                      type="text"
                      defaultValue={activeCompany}
                      className="bg-transparent text-sm font-medium w-full focus:outline-none"
                      style={{ color: '#333333' }}
                      onBlur={(e) => handleRenameCompany(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameCompany(e.target.value);
                        } else if (e.key === 'Escape') {
                          setEditingCompanyName(false);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium truncate" style={{ color: '#333333' }}>{activeCompany}</span>
                  )}
                </div>
                <svg className={`w-4 h-4 transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`} style={{ color: '#666666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowNewCompanyInput(true);
                  setShowCompanyDropdown(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                style={{ background: '#10b981', color: '#ffffff' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Company
              </button>
            )}

            {/* Dropdown Menu */}
            {showCompanyDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto" style={{ background: '#ffffff', border: '1px solid #e5e5e5' }}>
                {/* Existing Companies */}
                {companies.map((company) => (
                  <div
                    key={company}
                    className="flex items-center justify-between px-3 py-2 cursor-pointer"
                    style={{ background: company === activeCompany ? '#f5f5f5' : 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = company === activeCompany ? '#f5f5f5' : 'transparent'}
                  >
                    <button
                      onClick={() => handleSwitchCompany(company)}
                      className="flex-1 text-left text-sm truncate"
                      style={{ color: '#333333' }}
                    >
                      {company}
                    </button>
                    <div className="flex items-center gap-1">
                      {company === activeCompany && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCompanyName(true);
                            setShowCompanyDropdown(false);
                          }}
                          className="p-1 rounded"
                          style={{ color: '#666666' }}
                          title="Rename"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCompany(company);
                        }}
                        className="p-1 rounded"
                        style={{ color: '#666666' }}
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Divider if there are companies */}
                {companies.length > 0 && <div className="my-1" style={{ borderTop: '1px solid #e5e5e5' }} />}

                {/* Add New Company */}
                {showNewCompanyInput ? (
                  <div className="px-3 py-2">
                    <input
                      ref={newCompanyInputRef}
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCompanyName.trim()) {
                          handleCreateCompany(newCompanyName);
                        } else if (e.key === 'Escape') {
                          setShowNewCompanyInput(false);
                          setNewCompanyName('');
                        }
                      }}
                      placeholder="Company name..."
                      className="w-full px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      style={{ background: '#f5f5f5', color: '#333333', border: '1px solid #e5e5e5' }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleCreateCompany(newCompanyName)}
                        disabled={!newCompanyName.trim()}
                        className="flex-1 py-1 text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: '#10b981', color: '#ffffff' }}
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowNewCompanyInput(false);
                          setNewCompanyName('');
                        }}
                        className="flex-1 py-1 text-xs font-medium rounded"
                        style={{ background: '#f5f5f5', color: '#666666', border: '1px solid #e5e5e5' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewCompanyInput(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm"
                    style={{ color: '#10b981' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Company
                  </button>
                )}
              </div>
            )}
          </div>

          {activeCompany && completedSections > 0 && (
            <div className="mt-2 text-xs" style={{ color: '#666666' }}>
              {completedSections}/{SECTIONS.length} sections ready
            </div>
          )}
        </div>

        {/* Navigation Tabs - only show if company is selected */}
        {activeCompany ? (
          <>
            <nav className="flex-1 overflow-y-auto py-2">
              {/* Input Tab */}
              <button
                onClick={() => setActiveTab('input')}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: 'transparent',
                  color: '#333333',
                  border: activeTab === 'input' ? '1px dashed #10b981' : '1px solid transparent',
                  margin: '0 8px',
                  width: 'calc(100% - 16px)',
                  borderRadius: '6px',
                }}
              >
                <div>
                  <div className="font-medium">Input Materials</div>
                  <div className="text-xs" style={{ color: '#666666' }}>JD, Resume, Cover Letter</div>
                </div>
              </button>

              {/* Divider */}
              <div className="my-2 mx-4" style={{ borderTop: '1px solid #e5e5e5' }} />

              {/* Section Tabs */}
              {SECTIONS.map((section) => {
                const isActive = activeTab === section.id;
                const isComplete = generated[section.id] !== null;
                const isCurrentlyGenerating = generatingSection === section.id || generatingSections.has(section.id);

                return (
                  <button
                    key={section.id}
                    onClick={() => handleTabClick(section.id)}
                    disabled={isGenerating && !isCurrentlyGenerating}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                    style={{
                      background: 'transparent',
                      color: isComplete ? '#10b981' : '#333333',
                      border: isActive ? '1px dashed #10b981' : '1px solid transparent',
                      margin: '2px 8px',
                      width: 'calc(100% - 16px)',
                      borderRadius: '4px',
                      opacity: isGenerating && !isCurrentlyGenerating ? 0.5 : 1,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{section.name}</div>
                    </div>
                    {isCurrentlyGenerating && (
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
                    )}
                    {isComplete && !isCurrentlyGenerating && (
                      <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 space-y-2" style={{ borderTop: '1px solid #e5e5e5' }}>
              {/* Generate All Button - Always visible */}
              <button
                onClick={handleGenerateAll}
                disabled={isGenerating || !hasInputs || completedSections === SECTIONS.length}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: '#10b981', color: '#ffffff' }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating {generatingSections.size} sections...
                  </>
                ) : completedSections === SECTIONS.length ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    All Sections Ready!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate All ({SECTIONS.length - completedSections} sections)
                  </>
                )}
              </button>

              {!hasInputs && (
                <div className="text-xs text-center" style={{ color: '#666666' }}>
                  Add JD & Resume first
                </div>
              )}

              <button
                onClick={handleClearAll}
                disabled={isGenerating}
                className="w-full py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                style={{ color: '#666666', background: 'transparent' }}
                onMouseEnter={(e) => { e.target.style.background = '#f5f5f5'; e.target.style.color = '#333333'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#666666'; }}
              >
                Clear Generated
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center" style={{ color: '#666666' }}>
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">Add a company to start</p>
              <p className="text-xs mt-1" style={{ color: '#999999' }}>preparing for interviews</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden" style={{ background: '#ffffff' }}>
        {!activeCompany ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center" style={{ color: '#666666' }}>
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium" style={{ color: '#333333' }}>No Company Selected</h3>
              <p className="text-sm mt-1">Add a company from the sidebar to start preparing</p>
            </div>
          </div>
        ) : activeTab === 'input' ? (
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
