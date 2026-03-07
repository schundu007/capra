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
  { id: 'all', label: 'All', icon: '📚', color: '#10b981' },
  { id: 'frontend', label: 'Frontend', icon: '🎨', color: '#3b82f6' },
  { id: 'backend', label: 'Backend', icon: '⚙️', color: '#8b5cf6' },
  { id: 'mobile', label: 'Mobile', icon: '📱', color: '#ec4899' },
  { id: 'sql', label: 'SQL', icon: '🗃️', color: '#f59e0b' },
  { id: 'devops', label: 'DevOps', icon: '🚀', color: '#06b6d4' },
  { id: 'data', label: 'Data/ML', icon: '📊', color: '#84cc16' },
  { id: 'docs', label: 'Docs', icon: '📝', color: '#64748b' },
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
  const activeCategoryData = CATEGORIES.find(c => c.id === activeCategory);

  const handleSelect = (value) => {
    onSelect(value);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1)',
          maxWidth: '800px',
          height: '560px',
          maxHeight: '85vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient Header Bar */}
        <div
          className="h-1.5"
          style={{ background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Select Language</h2>
              <p className="text-xs text-gray-500">Choose your preferred programming language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100"
            style={{ color: '#9ca3af' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-5 py-3 flex flex-wrap gap-2" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveCategory(cat.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeCategory === cat.id ? cat.color : 'rgba(0, 0, 0, 0.04)',
                color: activeCategory === cat.id ? '#ffffff' : '#64748b',
                boxShadow: activeCategory === cat.id ? `0 2px 8px ${cat.color}40` : 'none',
              }}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search languages..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/30"
              style={{ 
                background: '#f8fafc', 
                color: '#1e293b', 
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-5" style={{ maxHeight: 'calc(100% - 220px)' }}>
          {/* Auto option */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('auto');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-4 transition-all hover:shadow-md"
            style={{
              background: selectedLanguage === 'auto' 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' 
                : '#f8fafc',
              border: selectedLanguage === 'auto' ? '2px solid #10b981' : '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div 
              className="w-10 h-10 flex items-center justify-center rounded-xl text-lg"
              style={{ 
                background: selectedLanguage === 'auto' 
                  ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' 
                  : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
              }}
            >
              ✨
            </div>
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-gray-900">Auto Detect</div>
              <div className="text-xs text-gray-500">Let AI choose the best language</div>
            </div>
            {selectedLanguage === 'auto' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#10b981' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* Language grid */}
          <div className="grid grid-cols-4 gap-2">
            {filteredLanguages.map(lang => (
              <button
                key={lang.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(lang.value);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all hover:shadow-md group"
                style={{
                  background: selectedLanguage === lang.value 
                    ? `linear-gradient(135deg, ${activeCategoryData?.color || '#10b981'}15 0%, ${activeCategoryData?.color || '#10b981'}08 100%)`
                    : '#f8fafc',
                  border: selectedLanguage === lang.value 
                    ? `2px solid ${activeCategoryData?.color || '#10b981'}` 
                    : '1px solid rgba(0, 0, 0, 0.04)',
                }}
              >
                <span 
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all group-hover:scale-105"
                  style={{ 
                    background: selectedLanguage === lang.value 
                      ? activeCategoryData?.color || '#10b981'
                      : '#e2e8f0', 
                    color: selectedLanguage === lang.value ? '#ffffff' : '#475569',
                  }}
                >
                  {lang.icon}
                </span>
                <span className="text-sm font-medium text-gray-700 truncate flex-1">{lang.label}</span>
                {selectedLanguage === lang.value && (
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: activeCategoryData?.color || '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.04)' }}>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No languages found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 flex items-center justify-between text-xs text-gray-400" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)', background: '#fafafa' }}>
          <span>Press ESC to close</span>
          <span>{filteredLanguages.length} languages available</span>
        </div>
      </div>
    </div>
  );
}
