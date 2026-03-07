import { useState, useEffect } from 'react';

// Language data with icons - categories is an array to support multiple categories
const LANGUAGES = [
  // Core Languages
  { value: 'python3', label: 'Python 3', icon: '🐍', categories: ['all', 'data'] },
  { value: 'python2', label: 'Python 2', icon: '🐍', categories: ['all'] },
  { value: 'javascript', label: 'JavaScript', icon: 'JS', categories: ['all', 'frontend', 'backend'] },
  { value: 'typescript', label: 'TypeScript', icon: 'TS', categories: ['all', 'frontend', 'backend'] },
  { value: 'java', label: 'Java', icon: '☕', categories: ['all', 'backend', 'mobile'] },
  { value: 'c', label: 'C', icon: 'C', categories: ['all'] },
  { value: 'cpp', label: 'C++', icon: 'C+', categories: ['all'] },
  { value: 'csharp', label: 'C#', icon: 'C#', categories: ['all', 'backend'] },
  { value: 'go', label: 'Go', icon: 'Go', categories: ['all', 'backend', 'devops'] },
  { value: 'rust', label: 'Rust', icon: '🦀', categories: ['all'] },
  { value: 'ruby', label: 'Ruby', icon: '💎', categories: ['all', 'backend'] },
  { value: 'php', label: 'PHP', icon: '🐘', categories: ['all', 'backend'] },
  { value: 'swift', label: 'Swift 5', icon: '🕊️', categories: ['all', 'mobile'] },
  { value: 'kotlin', label: 'Kotlin', icon: 'K', categories: ['all', 'mobile'] },
  { value: 'scala', label: 'Scala', icon: 'S', categories: ['all', 'backend'] },
  { value: 'bash', label: 'Bash', icon: '$>', categories: ['all', 'devops'] },
  { value: 'perl', label: 'Perl', icon: '🐪', categories: ['all'] },
  { value: 'lua', label: 'Lua', icon: '🌙', categories: ['all'] },
  { value: 'r', label: 'R', icon: 'R', categories: ['all', 'data'] },
  { value: 'haskell', label: 'Haskell', icon: 'λ', categories: ['all'] },
  { value: 'clojure', label: 'Clojure', icon: '()', categories: ['all'] },
  { value: 'elixir', label: 'Elixir', icon: '💧', categories: ['all', 'backend'] },
  { value: 'erlang', label: 'Erlang', icon: 'E', categories: ['all'] },
  { value: 'fsharp', label: 'F#', icon: 'F#', categories: ['all'] },
  { value: 'ocaml', label: 'OCaml', icon: '🐫', categories: ['all'] },
  { value: 'dart', label: 'Dart', icon: '🎯', categories: ['all', 'mobile'] },
  { value: 'julia', label: 'Julia', icon: 'Ju', categories: ['all', 'data'] },
  { value: 'objectivec', label: 'Objective-C', icon: 'OC', categories: ['all', 'mobile'] },
  { value: 'coffeescript', label: 'CoffeeScript', icon: '☕', categories: ['all'] },
  { value: 'vb', label: 'Visual Basic', icon: 'VB', categories: ['all'] },
  { value: 'tcl', label: 'Tcl', icon: 'Tc', categories: ['all'] },
  // Database / SQL
  { value: 'sql', label: 'SQL', icon: '🗃️', categories: ['all', 'sql'] },
  { value: 'mysql', label: 'MySQL', icon: '🐬', categories: ['all', 'sql'] },
  { value: 'postgresql', label: 'PostgreSQL', icon: '🐘', categories: ['all', 'sql'] },
  // Frontend Frameworks
  { value: 'react', label: 'React', icon: '⚛️', categories: ['all', 'frontend', 'mobile'] },
  { value: 'vue', label: 'Vue', icon: 'V', categories: ['all', 'frontend'] },
  { value: 'angular', label: 'Angular', icon: 'A', categories: ['all', 'frontend'] },
  { value: 'svelte', label: 'Svelte', icon: 'S', categories: ['all', 'frontend'] },
  { value: 'nextjs', label: 'Next.js', icon: 'N', categories: ['all', 'frontend'] },
  { value: 'html', label: 'HTML', icon: '🌐', categories: ['all', 'frontend'] },
  // Backend Frameworks
  { value: 'nodejs', label: 'NodeJS', icon: '💚', categories: ['all', 'backend'] },
  { value: 'django', label: 'Django', icon: 'Dj', categories: ['all', 'backend'] },
  { value: 'rails', label: 'Rails', icon: '🛤️', categories: ['all', 'backend'] },
  { value: 'spring', label: 'Spring', icon: '🌱', categories: ['all', 'backend'] },
  // DevOps
  { value: 'terraform', label: 'Terraform', icon: '🏗️', categories: ['all', 'devops'] },
  { value: 'kubernetes', label: 'Kubernetes', icon: '☸️', categories: ['all', 'devops'] },
  { value: 'docker', label: 'Docker', icon: '🐳', categories: ['all', 'devops'] },
  // Data Science / ML
  { value: 'pyspark', label: 'PySpark', icon: '⚡', categories: ['all', 'data'] },
  { value: 'pytorch', label: 'PyTorch', icon: '🔥', categories: ['all', 'data'] },
  { value: 'tensorflow', label: 'TensorFlow', icon: 'TF', categories: ['all', 'data'] },
  { value: 'scipy', label: 'SciPy', icon: '📊', categories: ['all', 'data'] },
  // Blockchain
  { value: 'solidity', label: 'Solidity', icon: '⟠', categories: ['all'] },
  // Hardware
  { value: 'verilog', label: 'Verilog', icon: '🔌', categories: ['all'] },
  // Docs
  { value: 'markdown', label: 'Markdown', icon: 'MD', categories: ['all', 'docs'] },
];

const CATEGORIES = [
  { id: 'all', label: 'All Languages', icon: '📚' },
  { id: 'frontend', label: 'Frontend', icon: '🎨' },
  { id: 'backend', label: 'Backend', icon: '⚙️' },
  { id: 'mobile', label: 'Mobile', icon: '📱' },
  { id: 'sql', label: 'SQL', icon: '🗃️' },
  { id: 'devops', label: 'DevOps', icon: '🚀' },
  { id: 'data', label: 'Data / ML', icon: '📊' },
  { id: 'docs', label: 'Documentation', icon: '📝' },
];

export default function LanguageSelectorModal({ isOpen, onClose, selectedLanguage, onSelect }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get languages for the selected category
  const getFilteredLanguages = () => {
    let langs = LANGUAGES;

    // Filter by category (categories is now an array)
    if (activeCategory !== 'all') {
      langs = langs.filter(l => l.categories.includes(activeCategory));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      langs = langs.filter(l => l.label.toLowerCase().includes(query));
    }

    return langs;
  };

  const filteredLanguages = getFilteredLanguages();

  const handleSelect = (value) => {
    onSelect(value);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl overflow-hidden shadow-2xl flex"
        style={{
          background: '#1a1a1a',
          width: '720px',
          maxWidth: '90vw',
          height: '500px',
          maxHeight: '80vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left Sidebar - Categories */}
        <div
          className="w-44 flex-shrink-0 py-3 overflow-y-auto"
          style={{ background: '#141414', borderRight: '1px solid #2a2a2a', position: 'relative', zIndex: 10 }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveCategory(cat.id);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-all cursor-pointer"
              style={{
                background: activeCategory === cat.id ? '#8b5cf6' : 'transparent',
                color: activeCategory === cat.id ? '#ffffff' : '#a1a1aa',
                position: 'relative',
                zIndex: 11,
              }}
            >
              <span>{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content - Language Grid */}
        <div className="flex-1 flex flex-col">
          {/* Header with search */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">Select Language</span>
              {selectedLanguage && selectedLanguage !== 'auto' && (
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#8b5cf6', color: '#ffffff' }}>
                  {LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-2" style={{ borderBottom: '1px solid #2a2a2a' }}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg"
                style={{ background: '#252525', color: '#ffffff', border: '1px solid #3a3a3a' }}
                autoFocus
              />
            </div>
          </div>

          {/* Language Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Auto option */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('auto');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-3 transition-all cursor-pointer"
              style={{
                background: selectedLanguage === 'auto' ? 'rgba(139, 92, 246, 0.2)' : '#252525',
                border: selectedLanguage === 'auto' ? '1px solid #8b5cf6' : '1px solid transparent',
              }}
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg text-sm" style={{ background: '#3a3a3a' }}>
                ✨
              </span>
              <div className="text-left">
                <div className="text-sm font-medium text-white">Auto Detect</div>
                <div className="text-xs text-gray-500">Let AI choose the best language</div>
              </div>
              {selectedLanguage === 'auto' && (
                <svg className="ml-auto w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Language grid */}
            <div className="grid grid-cols-3 gap-2">
              {filteredLanguages.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(lang.value);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:bg-gray-700 cursor-pointer"
                  style={{
                    background: selectedLanguage === lang.value ? 'rgba(139, 92, 246, 0.2)' : '#252525',
                    border: selectedLanguage === lang.value ? '1px solid #8b5cf6' : '1px solid transparent',
                  }}
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold" style={{ background: '#3a3a3a', color: '#ffffff' }}>
                    {lang.icon}
                  </span>
                  <span className="text-sm text-white truncate">{lang.label}</span>
                  {selectedLanguage === lang.value && (
                    <svg className="ml-auto w-4 h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {filteredLanguages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No languages found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
