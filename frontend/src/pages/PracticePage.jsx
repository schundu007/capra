import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';

/* ──────────────────────────────── Data ──────────────────────────────── */

const SECTIONS = [
  {
    key: 'system-design',
    title: 'System Design',
    icon: 'systemDesign',
    color: '#10b981',        // emerald
    border: 'border-emerald-200',
    bg: 'hover:bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    items: [
      { label: 'URL Shortener', desc: 'Design a scalable URL shortening service', icon: 'link' },
      { label: 'Rate Limiter', desc: 'Build a distributed rate limiting system', icon: 'shield' },
      { label: 'Notification System', desc: 'Design a multi-channel notification service', icon: 'bell' },
      { label: 'Chat Application', desc: 'Real-time messaging with WebSocket architecture', icon: 'messageSquare' },
      { label: 'Distributed Cache', desc: 'Design a high-throughput caching layer', icon: 'layers' },
      { label: 'Payment Gateway', desc: 'Build a reliable payment processing system', icon: 'creditCard' },
    ],
  },
  {
    key: 'technical',
    title: 'Technical',
    icon: 'settings',
    color: '#06b6d4',        // cyan
    border: 'border-cyan-200',
    bg: 'hover:bg-cyan-50',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-600',
    cols: 'grid-cols-1 sm:grid-cols-2',
    items: [
      { label: 'K8s Networking', desc: 'Container networking, services, and ingress', icon: 'cloud' },
      { label: 'CI/CD Pipeline', desc: 'Build and deploy automation strategies', icon: 'rocket' },
      { label: 'Microservices', desc: 'Service decomposition and communication patterns', icon: 'package' },
      { label: 'Database Sharding', desc: 'Horizontal partitioning and data distribution', icon: 'database' },
    ],
  },
  {
    key: 'behavioral',
    title: 'Behavioral',
    icon: 'behavioral',
    color: '#f59e0b',        // amber
    border: 'border-amber-200',
    bg: 'hover:bg-amber-50',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    cols: 'grid-cols-1 sm:grid-cols-2',
    items: [
      { label: 'About Yourself', desc: 'Craft a compelling personal narrative', icon: 'user' },
      { label: 'Technical Challenge', desc: 'Walk through a difficult engineering problem', icon: 'target' },
      { label: 'Production Incidents', desc: 'Handling outages and post-mortems', icon: 'alertTriangle' },
      { label: 'Leadership Style', desc: 'Influence, mentorship, and team dynamics', icon: 'users' },
    ],
  },
  {
    key: 'ai-ml',
    title: 'AI / ML',
    icon: 'ml',
    color: '#f43f5e',        // rose
    border: 'border-rose-200',
    bg: 'hover:bg-rose-50',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-600',
    cols: 'grid-cols-1 sm:grid-cols-3',
    items: [
      { label: 'Transformer Architecture', desc: 'Attention mechanisms and modern LLM design', icon: 'brain' },
      { label: 'Model Training Pipeline', desc: 'Data prep, training loops, and evaluation', icon: 'activity' },
      { label: 'Feature Engineering', desc: 'Feature selection, encoding, and scaling', icon: 'filter' },
    ],
  },
  {
    key: 'full-stack',
    title: 'Full Stack',
    icon: 'fullstack',
    color: '#3b82f6',        // blue
    border: 'border-blue-200',
    bg: 'hover:bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    cols: 'grid-cols-1 sm:grid-cols-3',
    items: [
      { label: 'REST vs GraphQL', desc: 'API design trade-offs and best practices', icon: 'code' },
      { label: 'Auth & JWT', desc: 'Authentication flows, tokens, and session management', icon: 'lock' },
      { label: 'Cloud & DevOps', desc: 'Infrastructure, containers, and deployment', icon: 'cloudArchitect' },
    ],
  },
  {
    key: 'data',
    title: 'Data',
    icon: 'data',
    color: '#14b8a6',        // teal
    border: 'border-teal-200',
    bg: 'hover:bg-teal-50',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-600',
    cols: 'grid-cols-1 sm:grid-cols-3',
    items: [
      { label: 'SQL & Data Modeling', desc: 'Schema design, normalization, and queries', icon: 'database' },
      { label: 'ETL & Pipelines', desc: 'Data ingestion, transformation, and orchestration', icon: 'signal' },
      { label: 'A/B Testing & Stats', desc: 'Experiment design, significance, and analysis', icon: 'chartBar' },
    ],
  },
  {
    key: 'coding',
    title: 'Practice Coding',
    icon: 'code',
    color: '#8b5cf6',        // violet
    border: 'border-violet-200',
    bg: 'hover:bg-violet-50',
    iconBg: 'bg-violet-100',
    iconText: 'text-violet-600',
    cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    items: [
      { label: 'Two Sum', desc: 'Hash map lookup pattern', icon: 'algorithm' },
      { label: 'LRU Cache', desc: 'Linked list + hash map design', icon: 'layers' },
      { label: 'Merge Intervals', desc: 'Sorting and interval merging', icon: 'activity' },
      { label: 'Binary Tree BFS', desc: 'Level-order traversal technique', icon: 'systemDesign' },
      { label: 'Linked List', desc: 'Pointer manipulation essentials', icon: 'link' },
      { label: 'Valid Parens', desc: 'Stack-based matching', icon: 'code' },
      { label: 'Max Subarray', desc: "Kadane's algorithm", icon: 'chartLine' },
      { label: 'Group Anagrams', desc: 'Hash-based grouping', icon: 'filter' },
    ],
  },
];

const MOCK_CATEGORIES = [
  { value: 'system-design', label: 'System Design' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'ai-ml', label: 'ML / AI' },
];

/* ────────────────────────────── Component ────────────────────────────── */

export default function PracticePage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  // Mock interview state
  const [mockCategory, setMockCategory] = useState('system-design');
  const [mockActive, setMockActive] = useState(false);
  const [mockQuestion, setMockQuestion] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  /* ── Topic click → navigate to /app with query ── */
  const handleTopicClick = useCallback((label) => {
    navigate('/app?q=' + encodeURIComponent(label));
  }, [navigate]);

  /* ── Mock interview helpers ── */
  const getRandomQuestion = useCallback((cat) => {
    const section = SECTIONS.find((s) => s.key === cat);
    if (!section) return null;
    const items = section.items;
    return items[Math.floor(Math.random() * items.length)];
  }, []);

  const startMock = useCallback(() => {
    const q = getRandomQuestion(mockCategory);
    setMockQuestion(q);
    setMockActive(true);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, [mockCategory, getRandomQuestion]);

  const nextQuestion = useCallback(() => {
    const q = getRandomQuestion(mockCategory);
    setMockQuestion(q);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, [mockCategory, getRandomQuestion]);

  const stopMock = useCallback(() => {
    setMockActive(false);
    setMockQuestion(null);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Header ── */}
        <div className={`text-center mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Practice{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Topics
            </span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Prepare for your interviews with curated topics
          </p>
        </div>

        {/* ── Topic Sections ── */}
        <div className="space-y-8">
          {SECTIONS.map((section, si) => (
            <div
              key={section.key}
              className={`bg-white rounded-xl border ${section.border} shadow-sm overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${si * 80}ms` }}
            >
              {/* Section header */}
              <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section.iconBg}`}>
                  <Icon name={section.icon} size={16} className={section.iconText} />
                </div>
                <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: section.color }}>
                  {section.title}
                </h2>
              </div>

              {/* Cards grid */}
              <div className={`px-5 sm:px-6 pb-5 grid gap-3 ${section.cols}`}>
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleTopicClick(item.label)}
                    className={`group text-left p-4 rounded-lg border border-gray-100 transition-all duration-200 ${section.bg} hover:border-current hover:shadow-sm`}
                    style={{ '--tw-border-opacity': 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                        style={{ backgroundColor: section.color + '15', color: section.color }}
                      >
                        <Icon name={item.icon} size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-800 truncate">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Mock Interview Section ── */}
        <div
          className={`mt-10 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: `${SECTIONS.length * 80}ms` }}
        >
          <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-900">
              <Icon name="timer" size={16} className="text-white" />
            </div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-gray-900">
              Mock Interview
            </h2>
          </div>

          <div className="px-5 sm:px-6 pb-6">
            {!mockActive ? (
              /* Inactive state: category picker + start */
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={mockCategory}
                  onChange={(e) => setMockCategory(e.target.value)}
                  className="flex-1 sm:flex-none sm:w-56 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
                >
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <button
                  onClick={startMock}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Icon name="play" size={14} className="text-white" />
                  Start Mock Interview
                </button>
              </div>
            ) : (
              /* Active state: question + timer + controls */
              <div className="space-y-4">
                {/* Timer bar */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Icon name="timer" size={14} className="text-emerald-500" />
                    {MOCK_CATEGORIES.find((c) => c.value === mockCategory)?.label}
                  </span>
                  <span className="font-mono text-lg font-bold text-gray-900 tabular-nums">
                    {formatTime(elapsed)}
                  </span>
                </div>

                {/* Question card */}
                {mockQuestion && (
                  <div className="p-5 rounded-lg bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100">
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {mockQuestion.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{mockQuestion.desc}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={nextQuestion}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Icon name="refresh" size={14} />
                    Next Question
                  </button>
                  <button
                    onClick={() => {
                      if (mockQuestion) handleTopicClick(mockQuestion.label);
                      stopMock();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Icon name="arrowRight" size={14} className="text-white" />
                    Practice This
                  </button>
                  <button
                    onClick={stopMock}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors ml-auto"
                  >
                    <Icon name="stop" size={14} />
                    Stop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
