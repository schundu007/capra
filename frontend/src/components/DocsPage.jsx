import { useState } from 'react';
import { Icon } from './Icons.jsx';

/**
 * Documentation Page with Sidebar Navigation
 * Inspired by techprep.app
 */
export default function DocsPage() {
  const [activePage, setActivePage] = useState('coding');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('a-z');

  // Sidebar navigation items
  const navItems = [
    { id: 'coding', label: 'Data Structures & Algorithms', icon: 'code' },
    { id: 'system-design', label: 'System Design', icon: 'systemDesign' },
    { id: 'low-level', label: 'Low Level Design', icon: 'layers' },
    { id: 'behavioral', label: 'Behavioral', icon: 'users' },
    { id: 'projects', label: 'Projects', icon: 'briefcase' },
    { id: 'companies', label: 'Companies', icon: 'building' },
    { id: 'roadmaps', label: 'Roadmaps', icon: 'compass' },
  ];

  // DSA Topics
  const codingTopics = [
    { id: 'arrays-hashing', title: 'Arrays & Hashing', icon: 'code', color: '#ef4444', questions: 57 },
    { id: 'binary-search', title: 'Binary Search', icon: 'search', color: '#f59e0b', questions: 3 },
    { id: 'bit-manipulation', title: 'Bit Manipulation', icon: 'cpu', color: '#8b5cf6', questions: 13 },
    { id: 'blind-75', title: 'Blind 75', icon: 'zap', color: '#22c55e', questions: 75 },
    { id: 'dynamic-programming', title: 'Dynamic Programming', icon: 'chartLine', color: '#3b82f6', questions: 24 },
    { id: 'graphs', title: 'Graphs', icon: 'share', color: '#ec4899', questions: 54 },
    { id: 'greedy', title: 'Greedy', icon: 'target', color: '#06b6d4', questions: 5 },
    { id: 'heaps', title: 'Heaps', icon: 'layers', color: '#f97316', questions: 33 },
    { id: 'intervals', title: 'Intervals', icon: 'chartBar', color: '#84cc16', questions: 5 },
    { id: 'linked-lists', title: 'Linked Lists', icon: 'link', color: '#a855f7', questions: 31 },
    { id: 'math-geometry', title: 'Math & Geometry', icon: 'puzzle', color: '#14b8a6', questions: 10 },
    { id: 'matrix', title: 'Matrix', icon: 'layers', color: '#6366f1', questions: 7 },
    { id: 'queues', title: 'Queues', icon: 'inbox', color: '#f43f5e', questions: 17 },
    { id: 'recursion', title: 'Recursion', icon: 'refresh', color: '#10b981', questions: 15 },
    { id: 'search-algorithms', title: 'Search Algorithms', icon: 'search', color: '#0ea5e9', questions: 23 },
    { id: 'sliding-window', title: 'Sliding Window', icon: 'chevronsRight', color: '#8b5cf6', questions: 5 },
    { id: 'sorting-algorithms', title: 'Sorting Algorithms', icon: 'chartBar', color: '#f59e0b', questions: 18 },
    { id: 'stacks', title: 'Stacks', icon: 'layers', color: '#22c55e', questions: 34 },
    { id: 'ascend-100', title: 'Ascend 100', icon: 'ascend', color: '#10b981', questions: 100 },
    { id: 'trees', title: 'Trees', icon: 'share', color: '#06b6d4', questions: 45 },
    { id: 'tries', title: 'Tries', icon: 'folder', color: '#ec4899', questions: 25 },
    { id: 'two-pointers', title: 'Two Pointers', icon: 'chevronsRight', color: '#3b82f6', questions: 6 },
  ];

  // System Design Topics
  const systemDesignTopics = [
    { id: 'fundamentals', title: 'Fundamentals', icon: 'lightbulb', color: '#10b981', questions: 12 },
    { id: 'scalability', title: 'Scalability', icon: 'chartLine', color: '#3b82f6', questions: 8 },
    { id: 'load-balancing', title: 'Load Balancing', icon: 'layers', color: '#8b5cf6', questions: 6 },
    { id: 'caching', title: 'Caching', icon: 'zap', color: '#f59e0b', questions: 10 },
    { id: 'databases', title: 'Databases', icon: 'database', color: '#ef4444', questions: 15 },
    { id: 'message-queues', title: 'Message Queues', icon: 'inbox', color: '#ec4899', questions: 7 },
    { id: 'microservices', title: 'Microservices', icon: 'share', color: '#06b6d4', questions: 9 },
    { id: 'api-design', title: 'API Design', icon: 'code', color: '#22c55e', questions: 11 },
    { id: 'cap-theorem', title: 'CAP Theorem', icon: 'puzzle', color: '#a855f7', questions: 5 },
    { id: 'consistency', title: 'Consistency Patterns', icon: 'refresh', color: '#14b8a6', questions: 8 },
    { id: 'cdn', title: 'CDN', icon: 'globe', color: '#f97316', questions: 4 },
    { id: 'sharding', title: 'Sharding', icon: 'layers', color: '#0ea5e9', questions: 7 },
  ];

  // Common System Designs
  const systemDesigns = [
    { id: 'url-shortener', title: 'URL Shortener', subtitle: 'TinyURL / Bit.ly', icon: 'link', color: '#10b981', difficulty: 'Easy' },
    { id: 'twitter', title: 'Twitter / X', subtitle: 'Social Media Feed', icon: 'messageSquare', color: '#3b82f6', difficulty: 'Hard' },
    { id: 'uber', title: 'Uber / Lyft', subtitle: 'Ride-Sharing Service', icon: 'mapPin', color: '#8b5cf6', difficulty: 'Hard' },
    { id: 'whatsapp', title: 'WhatsApp', subtitle: 'Real-Time Chat', icon: 'messageSquare', color: '#22c55e', difficulty: 'Medium' },
    { id: 'youtube', title: 'YouTube', subtitle: 'Video Streaming', icon: 'video', color: '#ef4444', difficulty: 'Hard' },
    { id: 'netflix', title: 'Netflix', subtitle: 'Streaming Platform', icon: 'video', color: '#f43f5e', difficulty: 'Hard' },
    { id: 'dropbox', title: 'Dropbox', subtitle: 'File Storage', icon: 'folder', color: '#3b82f6', difficulty: 'Medium' },
    { id: 'instagram', title: 'Instagram', subtitle: 'Photo Sharing', icon: 'camera', color: '#ec4899', difficulty: 'Hard' },
  ];

  // Behavioral Topics
  const behavioralTopics = [
    { id: 'tell-me-about-yourself', title: 'Tell Me About Yourself', icon: 'user', color: '#10b981', questions: 5 },
    { id: 'leadership', title: 'Leadership', icon: 'users', color: '#3b82f6', questions: 12 },
    { id: 'teamwork', title: 'Teamwork', icon: 'share', color: '#8b5cf6', questions: 10 },
    { id: 'conflict-resolution', title: 'Conflict Resolution', icon: 'messageSquare', color: '#f59e0b', questions: 8 },
    { id: 'problem-solving', title: 'Problem Solving', icon: 'lightbulb', color: '#ef4444', questions: 15 },
    { id: 'failure-mistakes', title: 'Failures & Mistakes', icon: 'alertTriangle', color: '#f43f5e', questions: 7 },
    { id: 'achievements', title: 'Achievements', icon: 'star', color: '#22c55e', questions: 9 },
    { id: 'motivation', title: 'Motivation & Goals', icon: 'target', color: '#06b6d4', questions: 6 },
    { id: 'pressure-stress', title: 'Pressure & Stress', icon: 'zap', color: '#a855f7', questions: 8 },
    { id: 'communication', title: 'Communication', icon: 'messageCircle', color: '#ec4899', questions: 7 },
    { id: 'adaptability', title: 'Adaptability', icon: 'refresh', color: '#14b8a6', questions: 6 },
    { id: 'decision-making', title: 'Decision Making', icon: 'puzzle', color: '#6366f1', questions: 8 },
  ];

  // Company-Specific Prep
  const companyPrep = [
    { id: 'amazon-lp', title: 'Amazon Leadership Principles', subtitle: '16 principles with examples', icon: 'briefcase', color: '#f59e0b', count: 16 },
    { id: 'google-behavioral', title: 'Google Behavioral', subtitle: 'Googliness & Leadership', icon: 'code', color: '#4285f4', count: 12 },
    { id: 'meta-behavioral', title: 'Meta Behavioral', subtitle: 'Core values alignment', icon: 'users', color: '#1877f2', count: 10 },
    { id: 'microsoft-behavioral', title: 'Microsoft Behavioral', subtitle: 'Growth mindset focus', icon: 'layers', color: '#00a4ef', count: 8 },
  ];

  // Filter and sort topics based on active page
  const getFilteredTopics = () => {
    let topics = [];
    if (activePage === 'coding') topics = codingTopics;
    else if (activePage === 'system-design') topics = systemDesignTopics;
    else if (activePage === 'behavioral') topics = behavioralTopics;
    else return [];

    return topics
      .filter(topic => topic.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
        if (sortOrder === 'z-a') return b.title.localeCompare(a.title);
        if (sortOrder === 'most') return b.questions - a.questions;
        if (sortOrder === 'least') return a.questions - b.questions;
        return 0;
      });
  };

  const filteredTopics = getFilteredTopics();

  // Get page title and color
  const getPageConfig = () => {
    switch (activePage) {
      case 'coding': return { title: 'Data Structures & Algorithms', color: '#10b981' };
      case 'system-design': return { title: 'System Design', color: '#3b82f6' };
      case 'behavioral': return { title: 'Behavioral Interviews', color: '#a855f7' };
      case 'low-level': return { title: 'Low Level Design', color: '#8b5cf6' };
      case 'projects': return { title: 'Projects', color: '#84cc16' };
      case 'companies': return { title: 'Companies', color: '#06b6d4' };
      case 'roadmaps': return { title: 'Roadmaps', color: '#f97316' };
      default: return { title: 'Documentation', color: '#10b981' };
    }
  };

  const pageConfig = getPageConfig();

  return (
    <div className="min-h-screen flex" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col" style={{ background: '#0a0a0f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div className="p-5">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Icon name="ascend" size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Ascend</span>
          </a>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon name={item.icon} size={18} className={isActive ? 'text-green-400' : ''} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <a
            href="/?scroll=pricing"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5"
            style={{ color: '#f59e0b' }}
          >
            <Icon name="zap" size={18} />
            <span className="font-medium">Upgrade</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div />
          <div className="flex items-center gap-4">
            <a href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-green-400 hover:bg-green-400/10 transition-colors" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              Getting started guide
            </a>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Icon name="search" size={16} />
              Search everything
              <span className="text-gray-600 ml-2">/</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8 max-w-6xl">
          {/* Page Title */}
          <h1 className="text-3xl font-bold text-white mb-8">{pageConfig.title}</h1>

          {/* Search and Sort - Only for pages with topics */}
          {['coding', 'system-design', 'behavioral'].includes(activePage) && (
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search topics"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 w-64 focus:outline-none focus:ring-1"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', '--tw-ring-color': `${pageConfig.color}50` }}
                />
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2.5 rounded-lg text-sm text-gray-400 focus:outline-none cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="a-z">A - Z</option>
                <option value="z-a">Z - A</option>
                <option value="most">Most Questions</option>
                <option value="least">Least Questions</option>
              </select>
            </div>
          )}

          {/* DSA Content */}
          {activePage === 'coding' && (
            <>
              {/* Featured Banner */}
              <a href="#" className="block mb-8 p-5 rounded-xl transition-all hover:scale-[1.01]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      <Icon name="ascend" size={20} className="text-white" />
                    </div>
                    <span className="text-white font-medium">How to Pass Data Structures & Algorithms Interviews in 2026</span>
                  </div>
                  <Icon name="chevronRight" size={20} className="text-gray-500" />
                </div>
              </a>

              {/* Topic Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
                {filteredTopics.map((topic) => (
                  <a
                    key={topic.id}
                    href={`#${topic.id}`}
                    className="group p-4 rounded-xl transition-all hover:scale-[1.02] hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon name={topic.icon} size={16} style={{ color: topic.color }} />
                        <span className="text-white font-medium text-sm">{topic.title}</span>
                      </div>
                      <Icon name="chevronRight" size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Icon name="star" size={14} />
                      <span>{topic.questions} Questions</span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Quick Reference Section */}
              <h2 className="text-xl font-bold text-white mb-6">Quick Reference</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Icon name="clock" size={18} className="text-green-400" />
                    Time Complexity Cheat Sheet
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">O(1)</span><span className="text-green-400">Constant - Best</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">O(log n)</span><span className="text-green-400">Logarithmic - Great</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">O(n)</span><span className="text-yellow-400">Linear - Good</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">O(n log n)</span><span className="text-yellow-400">Linearithmic - Fair</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">O(n²)</span><span className="text-orange-400">Quadratic - Slow</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">O(2ⁿ)</span><span className="text-red-400">Exponential - Avoid</span></div>
                  </div>
                </div>
                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Icon name="database" size={18} className="text-blue-400" />
                    When to Use What
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Fast lookup</span><span className="text-white">Hash Map</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Sorted data</span><span className="text-white">Binary Search Tree</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">FIFO operations</span><span className="text-white">Queue</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">LIFO operations</span><span className="text-white">Stack</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Priority access</span><span className="text-white">Heap</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Prefix matching</span><span className="text-white">Trie</span></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* System Design Content */}
          {activePage === 'system-design' && (
            <>
              {/* Featured Banner */}
              <a href="#" className="block mb-8 p-5 rounded-xl transition-all hover:scale-[1.01]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                      <Icon name="systemDesign" size={20} className="text-white" />
                    </div>
                    <span className="text-white font-medium">How to Pass System Design Interviews in 2026</span>
                  </div>
                  <Icon name="chevronRight" size={20} className="text-gray-500" />
                </div>
              </a>

              {/* Core Concepts */}
              <h2 className="text-xl font-bold text-white mb-4">Core Concepts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                {filteredTopics.map((topic) => (
                  <a
                    key={topic.id}
                    href={`#${topic.id}`}
                    className="group p-4 rounded-xl transition-all hover:scale-[1.02] hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon name={topic.icon} size={16} style={{ color: topic.color }} />
                        <span className="text-white font-medium text-sm">{topic.title}</span>
                      </div>
                      <Icon name="chevronRight" size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Icon name="star" size={14} />
                      <span>{topic.questions} Questions</span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Common Designs */}
              <h2 className="text-xl font-bold text-white mb-4">Common System Designs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {systemDesigns.map((design) => (
                  <a
                    key={design.id}
                    href={`#${design.id}`}
                    className="group p-5 rounded-xl transition-all hover:scale-[1.01] hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${design.color}15` }}>
                        <Icon name={design.icon} size={24} style={{ color: design.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-semibold">{design.title}</h3>
                          <Icon name="chevronRight" size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{design.subtitle}</p>
                        <span className="px-2 py-1 rounded text-xs" style={{ background: `${design.color}20`, color: design.color }}>
                          {design.difficulty}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Interview Framework */}
              <div className="p-6 rounded-xl mb-12" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icon name="target" size={20} className="text-blue-400" />
                  System Design Interview Framework (45 min)
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { time: '5 min', step: 'Requirements', desc: 'Clarify functional & non-functional requirements, scale' },
                    { time: '5 min', step: 'Estimations', desc: 'Back-of-envelope: QPS, storage, bandwidth' },
                    { time: '20 min', step: 'High-Level Design', desc: 'Components, data flow, API design' },
                    { time: '15 min', step: 'Deep Dive', desc: 'Database schema, scaling, trade-offs' },
                  ].map((phase, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <div className="text-blue-400 text-sm font-bold mb-1">{phase.time}</div>
                      <div className="text-white font-semibold mb-2">{phase.step}</div>
                      <div className="text-gray-400 text-sm">{phase.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Reference */}
              <h2 className="text-xl font-bold text-white mb-6">Quick Reference</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Icon name="layers" size={18} className="text-blue-400" />
                    Building Blocks
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Load Balancer</span><span className="text-white">NGINX, HAProxy, ALB</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Cache</span><span className="text-white">Redis, Memcached</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Message Queue</span><span className="text-white">Kafka, RabbitMQ, SQS</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Search</span><span className="text-white">Elasticsearch, Solr</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">SQL Database</span><span className="text-white">PostgreSQL, MySQL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">NoSQL Database</span><span className="text-white">MongoDB, Cassandra</span></div>
                  </div>
                </div>
                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Icon name="puzzle" size={18} className="text-purple-400" />
                    Key Trade-offs
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Consistency vs Availability</span><span className="text-white">CAP Theorem</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Latency vs Throughput</span><span className="text-white">System tuning</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">SQL vs NoSQL</span><span className="text-white">Data modeling</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Push vs Pull</span><span className="text-white">Data delivery</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Sync vs Async</span><span className="text-white">Communication</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Strong vs Eventual</span><span className="text-white">Consistency</span></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Behavioral Content */}
          {activePage === 'behavioral' && (
            <>
              {/* Featured Banner */}
              <a href="#" className="block mb-8 p-5 rounded-xl transition-all hover:scale-[1.01]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                      <Icon name="users" size={20} className="text-white" />
                    </div>
                    <span className="text-white font-medium">Master Behavioral Interviews with the STAR Method</span>
                  </div>
                  <Icon name="chevronRight" size={20} className="text-gray-500" />
                </div>
              </a>

              {/* STAR Method */}
              <div className="p-6 rounded-xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.02))', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icon name="star" size={20} className="text-purple-400" />
                  The STAR Method
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { letter: 'S', title: 'Situation', desc: 'Set the scene and give context for your story', color: '#ef4444' },
                    { letter: 'T', title: 'Task', desc: 'Describe your responsibility in that situation', color: '#f59e0b' },
                    { letter: 'A', title: 'Action', desc: 'Explain what steps you took to address it', color: '#22c55e' },
                    { letter: 'R', title: 'Result', desc: 'Share the outcomes and what you learned', color: '#3b82f6' },
                  ].map((step, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-xl font-bold" style={{ background: `${step.color}20`, color: step.color }}>
                        {step.letter}
                      </div>
                      <div className="text-white font-semibold mb-2">{step.title}</div>
                      <div className="text-gray-400 text-sm">{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Categories */}
              <h2 className="text-xl font-bold text-white mb-4">Question Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                {filteredTopics.map((topic) => (
                  <a
                    key={topic.id}
                    href={`#${topic.id}`}
                    className="group p-4 rounded-xl transition-all hover:scale-[1.02] hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon name={topic.icon} size={16} style={{ color: topic.color }} />
                        <span className="text-white font-medium text-sm">{topic.title}</span>
                      </div>
                      <Icon name="chevronRight" size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Icon name="star" size={14} />
                      <span>{topic.questions} Questions</span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Company-Specific */}
              <h2 className="text-xl font-bold text-white mb-4">Company-Specific Prep</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {companyPrep.map((company) => (
                  <a
                    key={company.id}
                    href={`#${company.id}`}
                    className="group p-5 rounded-xl transition-all hover:scale-[1.01] hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${company.color}15` }}>
                        <Icon name={company.icon} size={24} style={{ color: company.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-semibold">{company.title}</h3>
                          <Icon name="chevronRight" size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{company.subtitle}</p>
                        <span className="px-2 py-1 rounded text-xs" style={{ background: `${company.color}20`, color: company.color }}>
                          {company.count} Topics
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Quick Reference */}
              <h2 className="text-xl font-bold text-white mb-6">Quick Reference</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Icon name="check" size={18} className="text-green-400" />
                    Do's
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2"><span className="text-green-400">✓</span><span className="text-gray-300">Use specific examples from your experience</span></div>
                    <div className="flex items-start gap-2"><span className="text-green-400">✓</span><span className="text-gray-300">Quantify your impact with numbers when possible</span></div>
                    <div className="flex items-start gap-2"><span className="text-green-400">✓</span><span className="text-gray-300">Focus on YOUR actions and contributions</span></div>
                    <div className="flex items-start gap-2"><span className="text-green-400">✓</span><span className="text-gray-300">Practice your stories out loud before interviews</span></div>
                    <div className="flex items-start gap-2"><span className="text-green-400">✓</span><span className="text-gray-300">Prepare 5-7 versatile stories that cover multiple themes</span></div>
                  </div>
                </div>
                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Icon name="x" size={18} className="text-red-400" />
                    Don'ts
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2"><span className="text-red-400">✗</span><span className="text-gray-300">Don't give vague or hypothetical answers</span></div>
                    <div className="flex items-start gap-2"><span className="text-red-400">✗</span><span className="text-gray-300">Don't blame others or badmouth past employers</span></div>
                    <div className="flex items-start gap-2"><span className="text-red-400">✗</span><span className="text-gray-300">Don't ramble - keep answers to 2-3 minutes</span></div>
                    <div className="flex items-start gap-2"><span className="text-red-400">✗</span><span className="text-gray-300">Don't say "we" when you mean "I"</span></div>
                    <div className="flex items-start gap-2"><span className="text-red-400">✗</span><span className="text-gray-300">Don't memorize scripts - know your key points</span></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Coming Soon for other pages */}
          {['low-level', 'projects', 'companies', 'roadmaps'].includes(activePage) && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `${pageConfig.color}15` }}>
                <Icon name={navItems.find(n => n.id === activePage)?.icon || 'code'} size={32} style={{ color: pageConfig.color }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                We're working hard to bring you comprehensive {pageConfig.title.toLowerCase()} content. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
