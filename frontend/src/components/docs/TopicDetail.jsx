import { Icon } from '../Icons.jsx';
import FormattedContent from './FormattedContent.jsx';
import CloudArchitectureDiagram from './CloudArchitectureDiagram.jsx';
import DiagramSVG from '../DiagramSVG.jsx';
import { generateSlug, getProblemBySlug } from '../../data/problems.js';
import problemsFull from '../../data/problems-full.json';

// Constants imported from parent
const CARD_STYLES = {
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' },
  header: { background: '#f0fdf4', borderBottom: '1px solid #a7f3d0', padding: '18px 24px' },
  body: { padding: '24px' },
  code: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' },
};

export default function TopicDetail({
  activePage, selectedTopic, topicDetails, pageConfig,
  completedTopics, starredTopics, toggleComplete, toggleStar,
  showAskAI, setShowAskAI, aiQuestion, setAiQuestion, aiAnswer, aiLoading, handleAskAI,
  showRoadmap, setShowRoadmap, expandedTheoryQuestions, setExpandedTheoryQuestions,
  setSelectedTopic, generatingDiagram, diagramData, diagramError,
  diagramDetailLevel, setDiagramDetailLevel, diagramCloudProvider, setDiagramCloudProvider,
  generateDiagram, codingTopics, systemDesignTopics, systemDesigns, behavioralTopics, filteredTopics,
}) {
  if (!topicDetails) return null;

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => setSelectedTopic(null)}
        className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-900 mb-6 transition-all hover:gap-3 group"
      >
        <Icon name="chevronLeft" size={18} className="transition-transform group-hover:-translate-x-0.5" />
        <span>Back to {pageConfig.title}</span>
      </button>

      {/* Topic Header - Clean minimal design */}
      <div className="rounded-xl p-6 mb-8" style={CARD_STYLES.card}>
        <div className="flex items-start gap-5">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(20, 184, 166, 0.15)' }}
          >
            <Icon name={topicDetails.icon} size={28} className="text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-sm font-bold text-gray-900">{topicDetails.title}</h1>
              {topicDetails.isNew && <span className="px-1.5 py-0.5 rounded text-sm font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">NEW</span>}
              {topicDetails.difficulty && (
                <span className={`px-2.5 py-0.5 rounded text-sm font-medium ${
                  topicDetails.difficulty === 'Easy' ? 'bg-green-500/15 text-green-700' :
                  topicDetails.difficulty === 'Medium' ? 'bg-yellow-500/15 text-emerald-700' :
                  'bg-red-500/15 text-red-700'
                }`}>
                  {topicDetails.difficulty}
                </span>
              )}
              {topicDetails.questions && (
                <span className="px-2.5 py-0.5 rounded text-sm font-medium bg-gray-50 text-gray-900">
                  {topicDetails.questions} problems
                </span>
              )}
              {/* Design in App button for system design topics */}
              {activePage === 'system-design' && (
                <a
                  href={`/app?problem=${encodeURIComponent(`Design ${topicDetails.title}. ${topicDetails.description || topicDetails.subtitle || ''}`)}&mode=system-design&autosolve=true`}
                  className="ml-auto px-4 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-500/25 transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <Icon name="zap" size={14} />
                  Design
                </a>
              )}
            </div>
            <p className="text-gray-900 text-sm leading-relaxed">{topicDetails.description}</p>
            {topicDetails.subtitle && !topicDetails.difficulty && (
              <p className="text-gray-900 text-sm mt-1">{topicDetails.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Interactive Toolbar (AlgoMaster-inspired) ── */}
      <div className="flex items-center justify-between p-4 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-3">
          {/* Mark as Complete */}
          <button
            onClick={() => toggleComplete(selectedTopic)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${completedTopics[selectedTopic] ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'}`}
          >
            <Icon name={completedTopics[selectedTopic] ? 'checkCircle' : 'check'} size={16} />
            {completedTopics[selectedTopic] ? 'Completed' : 'Mark as Complete'}
          </button>
          {/* Star */}
          <button
            onClick={() => toggleStar(selectedTopic)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${starredTopics[selectedTopic] ? 'text-yellow-600' : 'text-gray-900 hover:text-yellow-600'}`}
          >
            <Icon name={starredTopics[selectedTopic] ? 'star5' : 'star'} size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Ask AI */}
          <button
            onClick={() => setShowAskAI(!showAskAI)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showAskAI ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'}`}
          >
            <Icon name="sparkles" size={16} />
            Ask AI
          </button>
          {/* Course Roadmap */}
          <button
            onClick={() => setShowRoadmap(!showRoadmap)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-all"
          >
            <Icon name="compass" size={16} />
            Roadmap
          </button>
        </div>
      </div>

      {/* Ask AI Panel */}
      {showAskAI && (
        <div className="p-5 rounded-xl mb-6" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="sparkles" size={16} className="text-purple-700" />
            <span className="text-purple-700 font-semibold text-sm">Ask AI about {topicDetails.title}</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder={`Ask anything about ${topicDetails.title}...`}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              style={{ background: '#f3f4f6', border: '1px solid #d1d5db' }}
            />
            <button
              onClick={handleAskAI}
              disabled={aiLoading || !aiQuestion.trim()}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-900 disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
            >
              {aiLoading ? <Icon name="loader" size={16} className="animate-spin" /> : 'Ask'}
            </button>
          </div>
          {aiAnswer && (
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <FormattedContent content={aiAnswer} color="purple" />
            </div>
          )}
        </div>
      )}

      {/* Course Roadmap Panel */}
      {showRoadmap && (
        <div className="p-5 rounded-xl mb-6" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="compass" size={16} className="text-amber-700" />
            <span className="text-amber-700 font-semibold text-sm">Course Roadmap — {pageConfig.title}</span>
          </div>
          <div className="space-y-1">
            {(activePage === 'coding' ? codingTopics : activePage === 'system-design' ? [...systemDesignTopics, ...systemDesigns] : behavioralTopics).map((t, i) => (
              <button
                key={t.id}
                onClick={() => { setSelectedTopic(t.id); setShowRoadmap(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all ${t.id === selectedTopic ? 'bg-amber-500/10 text-amber-700' : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <span className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: completedTopics[t.id] ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: completedTopics[t.id] ? '#10b981' : '#6b7280' }}>
                  {completedTopics[t.id] ? '✓' : i + 1}
                </span>
                <span className="flex-1">{t.title}</span>
                {starredTopics[t.id] && <Icon name="star5" size={12} className="text-yellow-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DSA Topic Detail */}
      {activePage === 'coding' && topicDetails.keyPatterns && (
        <div className="space-y-3">
          {/* Overview + Complexity in one row */}
          <div className="grid lg:grid-cols-3 gap-3">
            {/* Introduction - Comprehensive Overview */}
            {topicDetails.introduction && (
              <div id="overview" className="rounded-lg overflow-hidden scroll-mt-24 lg:col-span-2" style={CARD_STYLES.card}>
                <div className="px-3 py-1.5 border-b border-emerald-200 flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.04)' }}>
                  <Icon name="book" size={14} className="text-emerald-700" />
                  <h3 className="text-sm font-bold text-gray-900">Overview</h3>
                </div>
                <div className="p-3 max-w-[600px] mx-auto">
                  <FormattedContent content={topicDetails.introduction} color="emerald" />
                </div>
              </div>
            )}
            {/* Complexity */}
            <div className="flex flex-col gap-2">
              <div className="p-3 rounded-lg flex-1" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div className="text-green-700 text-xs font-medium mb-1">Time Complexity</div>
                <div className="text-gray-900 font-mono text-sm">{topicDetails.timeComplexity}</div>
              </div>
              <div className="p-3 rounded-lg flex-1" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div className="text-emerald-700 text-xs font-medium mb-1">Space Complexity</div>
                <div className="text-gray-900 font-mono text-sm">{topicDetails.spaceComplexity}</div>
              </div>
            </div>
          </div>

          {/* When to Use + Key Patterns - Side by Side Row */}
          <div id="when-to-use" className={`grid gap-3 scroll-mt-24 ${topicDetails.whenToUse && topicDetails.keyPatterns ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* When to Use */}
            {topicDetails.whenToUse && (
              <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                <div className="px-3 py-1.5 border-b border-purple-200 flex items-center gap-2" style={{ background: 'rgba(168,85,247,0.04)' }}>
                  <Icon name="target" size={14} className="text-emerald-700" />
                  <h3 className="text-sm font-bold text-gray-900">When to Use</h3>
                </div>
                <div className="p-3 max-w-[600px] mx-auto">
                  <ul className="space-y-1">
                    {topicDetails.whenToUse.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-emerald-700 mt-0.5">→</span>
                        <span className="text-gray-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Key Patterns */}
            {topicDetails.keyPatterns && (
              <div className="rounded-lg overflow-hidden" style={{ background: `linear-gradient(180deg, ${topicDetails.color}10 0%, rgba(0,0,0,0.4) 100%)`, border: `1px solid ${topicDetails.color}30` }}>
                <div className="px-3 py-1.5 border-b flex items-center gap-2" style={{ background: `${topicDetails.color}08`, borderColor: `${topicDetails.color}20` }}>
                  <Icon name="puzzle" size={14} style={{ color: topicDetails.color }} />
                  <h3 className="text-sm font-bold text-gray-900">Key Patterns</h3>
                </div>
                <div className="p-3 max-w-[600px] mx-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {topicDetails.keyPatterns.map((pattern, i) => (
                      <span key={i} className="px-2 py-1 rounded text-xs" style={{ background: `${topicDetails.color}15`, color: topicDetails.color }}>
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Approach + Common Mistakes - Side by Side Row */}
          <div id="approach" className={`grid gap-3 scroll-mt-24 ${topicDetails.approach && topicDetails.commonMistakes ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Approach - Step by Step */}
            {topicDetails.approach && (
              <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                <div className="px-3 py-1.5 border-b border-blue-200 flex items-center gap-2" style={{ background: 'rgba(59,130,246,0.04)' }}>
                  <Icon name="list" size={14} className="text-emerald-700" />
                  <h3 className="text-sm font-bold text-gray-900">Step-by-Step Approach</h3>
                </div>
                <div className="p-3 max-w-[600px] mx-auto">
                  <ol className="space-y-1">
                    {topicDetails.approach.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-emerald-50 text-emerald-700">{i + 1}</span>
                        <span className="text-gray-900">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {topicDetails.commonMistakes && (
              <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                <div className="px-3 py-1.5 border-b border-red-200 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.04)' }}>
                  <Icon name="alertTriangle" size={14} className="text-red-700" />
                  <h3 className="text-sm font-bold text-gray-900">Common Mistakes</h3>
                </div>
                <div className="p-3 max-w-[600px] mx-auto">
                  <ul className="space-y-1">
                    {topicDetails.commonMistakes.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-red-700 mt-0.5">✗</span>
                        <span className="text-gray-900">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Common Problems - Clickable to solve */}
          {topicDetails.commonProblems && (
            <div id="practice" className="rounded-lg overflow-hidden scroll-mt-24" style={CARD_STYLES.card}>
              <div className="px-3 py-1.5 flex items-center gap-2" style={CARD_STYLES.header}>
                <Icon name="star" size={14} className="text-emerald-700" />
                <h3 className="text-sm font-bold text-gray-900">Practice Problems</h3>
                <span className="text-xs text-gray-900 ml-auto">{topicDetails.commonProblems.length}</span>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                  {topicDetails.commonProblems.map((problem, i) => {
                    const problemName = typeof problem === 'string' ? problem : problem.name;
                    const slug = generateSlug(problemName);
                    const problemData = getProblemBySlug(slug);
                    const difficulty = typeof problem === 'object' ? problem.difficulty : (problemData?.difficulty || null);

                    const fullProblem = problemsFull[slug];
                    const hasDescription = !!(fullProblem?.description || problemData?.description);
                    const problemText = fullProblem?.description || problemData?.description || `Solve: ${problemName}`;
                    const href = `/app?problem=${encodeURIComponent(problemText)}&autosolve=true`;

                    return (
                      <a
                        key={i}
                        href={href}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-emerald-50 transition-colors cursor-pointer group ${!hasDescription ? 'border border-amber-200' : 'border border-transparent hover:border-emerald-200'}`}
                      >
                        <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono bg-emerald-50 text-emerald-700 flex-shrink-0">{i + 1}</span>
                        <span className={`text-xs flex-1 truncate group-hover:text-emerald-700 transition-colors ${hasDescription ? 'text-gray-900' : 'text-amber-700'}`}>{problemName}</span>
                        {difficulty && (
                          <span className={`px-1.5 py-0.5 rounded text-xs flex-shrink-0 ${
                            difficulty === 'Easy' ? 'bg-green-500/20 text-green-700' :
                            difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-600' :
                            'bg-red-100 text-red-700'
                          }`}>{difficulty.charAt(0)}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Theory Questions - Expandable with Answers */}
          {topicDetails.theoryQuestions && topicDetails.theoryQuestions.length > 0 && (
            <div id="theory" className="rounded-lg overflow-hidden scroll-mt-24" style={{ background: 'linear-gradient(180deg, rgba(147,51,234,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(147,51,234,0.2)' }}>
              <div className="px-3 py-1.5 border-b border-purple-200 flex items-center gap-2" style={{ background: 'rgba(147,51,234,0.04)' }}>
                <Icon name="bookOpen" size={14} className="text-emerald-700" />
                <h3 className="text-sm font-bold text-gray-900">Theory Questions</h3>
                <span className="text-xs text-gray-900 ml-auto">{topicDetails.theoryQuestions.length}</span>
              </div>
              <div className="p-3 max-w-[600px] mx-auto">
                <div className="grid grid-cols-1 gap-2">
                  {topicDetails.theoryQuestions.map((q, i) => {
                    const questionKey = `${selectedTopic}-${i}`;
                    const isExpanded = expandedTheoryQuestions[questionKey];
                    return (
                      <div key={i} className="rounded-lg overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <button
                          onClick={() => setExpandedTheoryQuestions(prev => ({ ...prev, [questionKey]: !prev[questionKey] }))}
                          className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="w-6 h-6 rounded flex items-center justify-center text-sm font-mono bg-emerald-50 text-emerald-700 flex-shrink-0">{i + 1}</span>
                          <span className="text-gray-900 text-sm flex-1">{q.question}</span>
                          {q.difficulty && (
                            <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                              q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-700' :
                              q.difficulty === 'Medium' ? 'bg-emerald-50 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>{q.difficulty}</span>
                          )}
                          <svg className={`w-4 h-4 text-gray-900 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isExpanded && q.answer && (
                          <div className="px-4 pb-3 pt-1 border-t border-purple-500/10">
                            <div className="pl-8 text-gray-900 text-sm leading-relaxed" style={{ background: 'rgba(147,51,234,0.04)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid rgba(147,51,234,0.4)' }}>
                              {q.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tips + Interview Tips - Side by Side */}
          <div id="tips" className={`grid gap-3 scroll-mt-24 ${topicDetails.tips && topicDetails.interviewTips ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Tips */}
            {topicDetails.tips && (
              <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                <div className="px-3 py-1.5 border-b border-emerald-200 flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.04)' }}>
                  <Icon name="lightbulb" size={14} className="text-emerald-700" />
                  <h3 className="text-sm font-bold text-gray-900">Tips & Tricks</h3>
                </div>
                <div className="divide-y divide-emerald-500/10">
                  {topicDetails.tips.map((tip, i) => (
                    <div key={i} className="px-3 py-1.5 flex items-start gap-2">
                      <span className="text-emerald-700 text-xs mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-gray-900 text-xs">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Tips */}
            {topicDetails.interviewTips && (
              <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="px-3 py-1.5 border-b border-amber-200 flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.04)' }}>
                  <Icon name="briefcase" size={14} className="text-amber-700" />
                  <h3 className="text-sm font-bold text-gray-900">Interview Tips</h3>
                </div>
                <div className="divide-y divide-amber-500/10">
                  {topicDetails.interviewTips.map((tip, i) => (
                    <div key={i} className="px-3 py-1.5 flex items-start gap-2">
                      <span className="text-amber-700 text-xs mt-0.5 flex-shrink-0">★</span>
                      <span className="text-gray-900 text-xs">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Example */}
          {topicDetails.codeExample && (
            <div className="p-3 rounded-lg" style={{ background: '#f5f5f5', border: '1px solid #e2e8f0' }}>
              <h3 className="text-gray-900 text-xs font-semibold mb-2 flex items-center gap-2">
                <Icon name="code" size={14} className="text-green-700" />
                Code Example
              </h3>
              <pre className="text-sm font-mono text-green-700 overflow-x-auto whitespace-pre-wrap">
                {topicDetails.codeExample}
              </pre>
            </div>
          )}

          {/* Multiple Code Examples */}
          {topicDetails.codeExamples && topicDetails.codeExamples.length > 0 && (
            <div id="code-examples" className="space-y-6 scroll-mt-24">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Icon name="code" size={14} className="text-green-700" />
                Code Examples
              </h3>
              {topicDetails.codeExamples.map((example, i) => (
                <div key={i} className="p-6 rounded-xl" style={{ background: '#f5f5f5', border: '1px solid #e2e8f0' }}>
                  <h4 className="text-gray-900 font-semibold mb-3">{example.title}</h4>
                  {example.description && <p className="text-gray-900 text-sm mb-4">{example.description}</p>}
                  <pre className="text-sm font-mono text-green-700 overflow-x-auto whitespace-pre-wrap">
                    {example.code}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* System Design Topic Detail */}
      {activePage === 'system-design' && (topicDetails.concepts || topicDetails.requirements || topicDetails.introduction || topicDetails.primitives || topicDetails.problems || topicDetails.structures || topicDetails.coreEntities || topicDetails.implementation) && (
        <div className="space-y-5">
          {/* Core Concept Topics - Key Concepts badges */}
          {topicDetails.concepts && !topicDetails.introduction && (
            <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #e2e8f0' }}>
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <Icon name="puzzle" size={18} style={{ color: topicDetails.color }} />
                Key Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {topicDetails.concepts.map((concept, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: `${topicDetails.color}15`, color: topicDetails.color }}>
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comprehensive System Design Content (Core Concepts and Common Designs) */}
          {(topicDetails.requirements || topicDetails.introduction) && (
            <>
              {/* Introduction (Comprehensive) */}
              {topicDetails.introduction && (
                <div id="overview" className="rounded-lg overflow-hidden scroll-mt-24" style={CARD_STYLES.card}>
                  <div className="px-6 py-4 border-b border-blue-200" style={{ background: 'rgba(59,130,246,0.04)' }}>
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                        <Icon name="book" size={18} className="text-emerald-700" />
                      </div>
                      Introduction
                    </h2>
                  </div>
                  <div className="p-6">
                    <FormattedContent content={topicDetails.introduction} color="blue" />
                  </div>
                </div>
              )}

              {/* Requirements - Functional & Non-Functional */}
              {(topicDetails.functionalRequirements || topicDetails.requirements || topicDetails.nonFunctionalRequirements) && (
              <div id="requirements" className="grid md:grid-cols-2 gap-4 scroll-mt-24">
                {/* Functional Requirements */}
                {(topicDetails.functionalRequirements || topicDetails.requirements) && (
                <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                  <div className="px-3 py-2 border-b border-emerald-200 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.04)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100">
                      <Icon name="check" size={16} className="text-emerald-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Functional Requirements</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {(topicDetails.functionalRequirements || topicDetails.requirements).map((req, i) => (
                        <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-emerald-100 text-emerald-700 mt-0.5">✓</span>
                          <span className="text-gray-900 text-lg">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                )}

                {/* Non-Functional Requirements */}
                {topicDetails.nonFunctionalRequirements && (
                  <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                    <div className="px-3 py-2 border-b border-blue-200 flex items-center gap-3" style={{ background: 'rgba(59,130,246,0.04)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                        <Icon name="zap" size={16} className="text-emerald-700" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">Non-Functional Requirements</h3>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {topicDetails.nonFunctionalRequirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-emerald-50 text-emerald-700 mt-0.5">•</span>
                            <span className="text-gray-900 text-lg">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* API Design + Data Model - Side by Side Row */}
              {(topicDetails.apiDesign?.endpoints || topicDetails.dataModel) && (
                <div className={`grid gap-4 scroll-mt-24 ${topicDetails.apiDesign?.endpoints && topicDetails.dataModel ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* API Design */}
                  {topicDetails.apiDesign && topicDetails.apiDesign.endpoints && (
                    <div id="api-design" className="rounded-lg overflow-hidden scroll-mt-24" style={CARD_STYLES.card}>
                      <div className="px-3 py-2 border-b border-green-500/20 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.04)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-500/20">
                          <Icon name="code" size={16} className="text-green-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">API Design</h3>
                      </div>
                      <div className="p-3 max-w-[600px] mx-auto">
                        <div className="space-y-2">
                          {topicDetails.apiDesign.endpoints.map((endpoint, i) => (
                            <div key={i} className="rounded-lg p-3" style={{ background: '#f5f5f5', border: '1px solid #e5e7eb' }}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-sm font-bold uppercase ${
                                  endpoint.method === 'GET' ? 'bg-emerald-50 text-emerald-700' :
                                  endpoint.method === 'POST' || endpoint.method === 'INSERT' ? 'bg-green-500/20 text-green-700' :
                                  endpoint.method === 'PUT' || endpoint.method === 'UPDATE' ? 'bg-emerald-50 text-emerald-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {endpoint.method}
                                </span>
                                <code className="text-gray-900 font-mono text-sm">{endpoint.path}</code>
                              </div>
                              <div className="text-gray-900 text-sm">{endpoint.response}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Model */}
                  {topicDetails.dataModel && (
                    <div id="data-model" className="rounded-xl overflow-hidden scroll-mt-24" style={CARD_STYLES.card}>
                      <div className="px-5 py-4 flex items-center gap-3" style={CARD_STYLES.header}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                          <Icon name="database" size={18} className="text-emerald-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">Data Model</h3>
                      </div>
                      <div className="overflow-x-auto" style={CARD_STYLES.code}>
                        <pre
                          className="p-5 text-lg leading-7 text-emerald-700"
                          style={{
                            fontFamily: '"SF Mono", Monaco, "Cascadia Code", Consolas, "Courier New", monospace',
                            whiteSpace: 'pre',
                            margin: 0,
                            tabSize: 4
                          }}
                        >
                          {topicDetails.dataModel.schema}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Key Questions */}
              {topicDetails.keyQuestions && (
                <div id="key-questions" className="rounded-xl overflow-hidden scroll-mt-24" style={CARD_STYLES.card}>
                  <div className="px-5 py-4 flex items-center gap-3" style={CARD_STYLES.header}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                      <Icon name="messageSquare" size={18} className="text-emerald-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Key Questions</h3>
                    <span className="text-lg text-gray-900 ml-auto">{topicDetails.keyQuestions.length} topics</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {topicDetails.keyQuestions.map((q, i) => (
                      <div key={i} className="px-5 py-5 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start gap-4">
                          <span className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-lg text-gray-900 font-bold flex-shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-gray-900 font-semibold text-lg mb-3">{q.question}</h4>
                            <div className="text-gray-900">
                              <FormattedContent content={q.answer} color="emerald" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic + Advanced Implementation */}
              {(topicDetails.basicImplementation || topicDetails.advancedImplementation) && (
                <div id="architecture" className="space-y-5 scroll-mt-24">
                  {/* Basic Implementation */}
                  {topicDetails.basicImplementation && (
                    <div className="rounded-xl overflow-hidden" style={CARD_STYLES.card}>
                      <div className="px-5 py-4 flex items-center gap-3" style={CARD_STYLES.header}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                          <Icon name="layers" size={18} className="text-emerald-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{topicDetails.basicImplementation.title || 'Basic Approach'}</h3>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-900 text-lg mb-5 leading-relaxed">{topicDetails.basicImplementation.description}</p>
                        {topicDetails.basicImplementation.svgTemplate && (
                          <DiagramSVG
                            template={topicDetails.basicImplementation.svgTemplate}
                            className="mb-4 max-w-[500px]"
                          />
                        )}
                        {topicDetails.basicImplementation.architecture && !topicDetails.basicImplementation.svgTemplate && (
                          <div className="rounded-lg overflow-x-auto mb-4" style={{ background: '#f0f0f0' }}>
                            <pre
                              className="p-4 text-sm leading-6 text-cyan-700"
                              style={{
                                fontFamily: '"SF Mono", Monaco, "Cascadia Code", Consolas, "Courier New", monospace',
                                whiteSpace: 'pre',
                                margin: 0,
                                tabSize: 4
                              }}
                            >
                              {topicDetails.basicImplementation.architecture}
                            </pre>
                          </div>
                        )}
                        {topicDetails.basicImplementation.problems && (
                          <div>
                            <h4 className="text-red-700 text-sm font-semibold mb-3 flex items-center gap-2">
                              <Icon name="alertTriangle" size={14} />
                              Issues:
                            </h4>
                            <ul className="space-y-2">
                              {topicDetails.basicImplementation.problems.map((problem, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-900 text-lg">
                                  <span className="text-red-700 mt-0.5">✗</span>
                                  <span>{problem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Advanced Implementation */}
                  {topicDetails.advancedImplementation && (
                    <div className="rounded-xl overflow-hidden" style={CARD_STYLES.card}>
                      <div className="px-5 py-4 flex items-center gap-3" style={CARD_STYLES.header}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                          <Icon name="zap" size={18} className="text-emerald-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{topicDetails.advancedImplementation.title || 'Scalable Solution'}</h3>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-900 text-lg mb-5 leading-relaxed">{topicDetails.advancedImplementation.description}</p>
                        {topicDetails.advancedImplementation.svgTemplate && (
                          <DiagramSVG
                            template={topicDetails.advancedImplementation.svgTemplate}
                            className="mb-5"
                          />
                        )}
                        {topicDetails.advancedImplementation.architecture && !topicDetails.advancedImplementation.svgTemplate && (
                          <div className="rounded-lg overflow-x-auto mb-5" style={CARD_STYLES.code}>
                            <pre
                              className="p-5 text-lg leading-7 text-emerald-700"
                              style={{
                                fontFamily: '"SF Mono", Monaco, "Cascadia Code", Consolas, "Courier New", monospace',
                                whiteSpace: 'pre',
                                margin: 0,
                                tabSize: 4
                              }}
                            >
                              {topicDetails.advancedImplementation.architecture}
                            </pre>
                          </div>
                        )}
                        {topicDetails.advancedImplementation.keyPoints && (
                          <div className="mb-5">
                            <h4 className="text-gray-900 text-sm font-semibold mb-3">Key Points:</h4>
                            <ul className="space-y-2">
                              {topicDetails.advancedImplementation.keyPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-900 text-lg">
                                  <span className="text-emerald-700 mt-0.5">✓</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(topicDetails.advancedImplementation.databaseChoice || topicDetails.advancedImplementation.caching) && (
                          <div className="flex flex-wrap gap-3">
                            {topicDetails.advancedImplementation.databaseChoice && (
                              <span className="px-3 py-1.5 rounded-lg text-sm bg-emerald-50 text-emerald-700">
                                DB: {topicDetails.advancedImplementation.databaseChoice}
                              </span>
                            )}
                            {topicDetails.advancedImplementation.caching && (
                              <span className="px-3 py-1.5 rounded-lg text-sm bg-emerald-50 text-emerald-700">
                                Cache: {topicDetails.advancedImplementation.caching}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cloud Architecture Diagram + Tips */}
              <div className="space-y-5">
                {/* Cloud Architecture Diagram */}
                {activePage === 'system-design' && topicDetails && (
                  <div className="rounded-xl overflow-hidden" style={CARD_STYLES.card}>
                    <div className="px-5 py-4 flex items-center justify-between" style={CARD_STYLES.header}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                          <Icon name="layers" size={18} className="text-emerald-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">Architecture Diagram</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Cloud Provider Selector */}
                        <div className="flex items-center gap-1 mr-2 px-1 py-0.5 rounded-lg" style={{ background: '#f3f4f6' }}>
                          {[
                            { id: 'aws', label: 'AWS', color: '#ff9900' },
                            { id: 'gcp', label: 'GCP', color: '#4285f4' },
                            { id: 'azure', label: 'Azure', color: '#0078d4' },
                          ].map(p => (
                            <button
                              key={p.id}
                              onClick={() => setDiagramCloudProvider(p.id)}
                              className="px-2 py-0.5 text-xs font-medium rounded transition-all"
                              style={{
                                background: diagramCloudProvider === p.id ? `${p.color}30` : 'transparent',
                                color: diagramCloudProvider === p.id ? p.color : '#9ca3af',
                                border: diagramCloudProvider === p.id ? `1px solid ${p.color}50` : '1px solid transparent',
                              }}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                        {/* Detail Level */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleGenerateDiagram(topicDetails.title || selectedTopic, 'overview', diagramCloudProvider)}
                            disabled={generatingDiagram}
                            className="px-2 py-1 text-sm font-medium rounded transition-all"
                            style={{
                              background: diagramDetailLevel === 'overview' && diagramData ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399'
                            }}
                          >
                            {generatingDiagram && diagramDetailLevel === 'overview' ? '...' : 'Quick'}
                          </button>
                          <button
                            onClick={() => handleGenerateDiagram(topicDetails.title || selectedTopic, 'detailed', diagramCloudProvider)}
                            disabled={generatingDiagram}
                            className="px-2 py-1 text-sm font-medium rounded transition-all"
                            style={{
                              background: diagramDetailLevel === 'detailed' && diagramData ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
                              color: '#60a5fa'
                            }}
                          >
                            {generatingDiagram && diagramDetailLevel === 'detailed' ? '...' : 'Full'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 max-w-[600px] mx-auto">
                      <CloudArchitectureDiagram
                        imageUrl={diagramData?.imageUrl}
                        loading={generatingDiagram}
                        error={diagramError}
                        cloudProvider={diagramData?.cloudProvider || 'auto'}
                        onRetry={() => handleGenerateDiagram(topicDetails.title || selectedTopic, diagramDetailLevel)}
                      />
                      {diagramData && (
                        <div className="mt-2 flex items-center justify-between text-sm text-gray-900">
                          <span>{(diagramData.cloudProvider || 'auto').toUpperCase()}</span>
                          <a href={diagramData.imageUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-700">
                            Full Size →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {topicDetails.tips && (
                  <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                    <div className="px-3 py-2 border-b border-yellow-500/20 flex items-center gap-3" style={{ background: 'rgba(234,179,8,0.05)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                        <Icon name="star" size={16} className="text-emerald-700" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">Interview Tips</h3>
                    </div>
                    <div className="divide-y divide-yellow-500/10">
                      {topicDetails.tips.map((tip, i) => (
                        <div key={i} className="px-3 py-2 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-emerald-50 text-emerald-700">★</span>
                          <span className="text-gray-900 text-lg">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Flow Cards - Row Mode */}
              {(topicDetails.createFlow || topicDetails.redirectFlow) && (
                <div className="space-y-4">
                  {/* Create Flow */}
                  {topicDetails.createFlow && (
                    <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                      <div className="px-3 py-2 border-b border-blue-200 flex items-center gap-3" style={{ background: 'rgba(59,130,246,0.04)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                          <Icon name="arrowRight" size={16} className="text-emerald-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{topicDetails.createFlow.title}</h3>
                      </div>
                      <div className="p-4">
                        <ol className="space-y-2">
                          {topicDetails.createFlow.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-emerald-50 text-emerald-700 border border-blue-200">
                                {i + 1}
                              </span>
                              <span className="text-gray-900 text-lg">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* Redirect Flow */}
                  {topicDetails.redirectFlow && (
                    <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                      <div className="px-3 py-2 border-b border-purple-200 flex items-center gap-3" style={{ background: 'rgba(168,85,247,0.04)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                          <Icon name="arrowLeft" size={16} className="text-emerald-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{topicDetails.redirectFlow.title}</h3>
                      </div>
                      <div className="p-4">
                        <ol className="space-y-2">
                          {topicDetails.redirectFlow.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-emerald-50 text-emerald-700 border border-purple-200">
                                {i + 1}
                              </span>
                              <span className="text-gray-900 text-lg">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Discussion Points - Compact Grid */}
              {topicDetails.discussionPoints && (
                <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(6,182,212,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <div className="px-3 py-2 border-b border-cyan-500/20 flex items-center gap-3" style={{ background: 'rgba(6,182,212,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-500/20">
                      <Icon name="messageCircle" size={16} className="text-cyan-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Discussion Points</h3>
                  </div>
                  <div className="p-3 max-w-[600px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {topicDetails.discussionPoints.map((point, i) => (
                        <div key={i} className="p-3 rounded-lg" style={{ background: '#f5f5f5', border: '1px solid rgba(6,182,212,0.1)' }}>
                          <h4 className="text-cyan-700 font-semibold mb-1.5 text-sm">{point.topic}</h4>
                          <ul className="space-y-0.5">
                            {point.points.slice(0, 3).map((p, j) => (
                              <li key={j} className="flex items-start gap-1 text-gray-900 text-sm">
                                <span className="text-cyan-700 mt-0.5">•</span>
                                <span className="truncate">{p}</span>
                              </li>
                            ))}
                            {point.points.length > 3 && (
                              <li className="text-gray-900 text-sm">+{point.points.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Components & Decisions - Side by Side */}
              {(!topicDetails.introduction && topicDetails.components) || topicDetails.keyDecisions ? (
                <div className={`grid gap-4 ${(!topicDetails.introduction && topicDetails.components) && topicDetails.keyDecisions ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* System Components */}
                  {!topicDetails.introduction && topicDetails.components && (
                    <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                      <div className="px-3 py-2 border-b border-purple-200 flex items-center gap-3" style={{ background: 'rgba(168,85,247,0.04)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                          <Icon name="layers" size={16} className="text-emerald-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">System Components</h3>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {topicDetails.components.map((comp, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/15 text-emerald-700 border border-purple-200">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Design Decisions */}
                  {topicDetails.keyDecisions && (
                    <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <div className="px-3 py-2 border-b border-amber-200 flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.04)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-100">
                          <Icon name="lightbulb" size={16} className="text-amber-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">Key Design Decisions</h3>
                      </div>
                      <div className="p-4">
                        <ol className="space-y-2">
                          {topicDetails.keyDecisions.map((decision, i) => (
                            <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-amber-100 text-amber-700 border border-amber-500/30">
                                {i + 1}
                              </span>
                              <span className="text-gray-900 text-lg">{decision}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* LLD Core Entities */}
              {topicDetails.coreEntities && (
                <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(20,184,166,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(20,184,166,0.2)' }}>
                  <div className="px-3 py-2 border-b border-teal-500/20 flex items-center gap-3" style={{ background: 'rgba(20,184,166,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-teal-500/20">
                      <Icon name="box" size={16} className="text-teal-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Core Entities</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {topicDetails.coreEntities.map((entity, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#f5f5f5', border: '1px solid rgba(20,184,166,0.1)' }}>
                        <code className="text-teal-400 font-mono text-sm font-semibold whitespace-nowrap">{entity.name}</code>
                        <span className="text-gray-900 text-sm">{entity.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LLD Design Patterns */}
              {topicDetails.designPatterns && (
                <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div className="px-3 py-2 border-b border-violet-500/20 flex items-center gap-3" style={{ background: 'rgba(139,92,246,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-violet-500/20">
                      <Icon name="puzzle" size={16} className="text-violet-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Design Patterns</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {topicDetails.designPatterns.map((pattern, i) => (
                        <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-violet-500/20 text-violet-400 mt-0.5">✦</span>
                          <span className="text-gray-900 text-sm">{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* LLD Implementation Code */}
              {topicDetails.implementation && (
                <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="px-3 py-2 border-b border-green-500/20 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-500/20">
                      <Icon name="code" size={16} className="text-green-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Implementation</h3>
                  </div>
                  <div className="overflow-x-auto" style={{ background: '#f0f0f0' }}>
                    <pre
                      className="p-4 text-sm leading-6 text-green-300"
                      style={{
                        fontFamily: '"SF Mono", Monaco, "Cascadia Code", Consolas, "Courier New", monospace',
                        whiteSpace: 'pre',
                        margin: 0,
                        tabSize: 4
                      }}
                    >
                      {topicDetails.implementation}
                    </pre>
                  </div>
                </div>
              )}

              {/* Concurrency Concepts */}
              {topicDetails.concepts && Array.isArray(topicDetails.concepts) && topicDetails.concepts[0]?.name && (
                <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(249,115,22,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <div className="px-3 py-2 border-b border-orange-500/20 flex items-center gap-3" style={{ background: 'rgba(249,115,22,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-500/20">
                      <Icon name="cpu" size={16} className="text-orange-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Core Concepts</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {topicDetails.concepts.map((concept, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#f5f5f5', border: '1px solid rgba(249,115,22,0.1)' }}>
                        <code className="text-orange-700 font-mono text-sm font-semibold whitespace-nowrap">{concept.name}</code>
                        <span className="text-gray-900 text-sm">{concept.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concurrency Primitives */}
              {topicDetails.primitives && (
                <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                  <div className="px-3 py-2 border-b border-blue-200 flex items-center gap-3" style={{ background: 'rgba(59,130,246,0.04)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                      <Icon name="lock" size={16} className="text-emerald-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Synchronization Primitives</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {topicDetails.primitives.map((prim, i) => (
                      <div key={i} className="p-3 rounded-lg" style={{ background: '#f5f5f5', border: '1px solid rgba(59,130,246,0.1)' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-gray-900 font-mono text-sm font-semibold">{prim.name}</code>
                          {prim.example && <code className="text-gray-900 text-sm">{prim.example}</code>}
                        </div>
                        <span className="text-gray-900 text-sm">{prim.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concurrency Classic Problems */}
              {topicDetails.problems && topicDetails.problems[0]?.solution && (
                <div className="rounded-lg overflow-hidden" style={CARD_STYLES.card}>
                  <div className="px-3 py-2 border-b border-red-200 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.04)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-100">
                      <Icon name="alertTriangle" size={16} className="text-red-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Classic Problems</h3>
                  </div>
                  <div className="divide-y divide-red-500/10">
                    {topicDetails.problems.map((problem, i) => (
                      <div key={i} className="p-4">
                        <h4 className="text-gray-900 font-semibold text-lg mb-2">{problem.name}</h4>
                        <p className="text-gray-900 text-sm mb-2">{problem.description}</p>
                        <div className="flex items-start gap-2">
                          <span className="text-green-700 text-sm font-semibold">Solution:</span>
                          <span className="text-gray-900 text-sm">{problem.solution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concurrency Data Structures */}
              {topicDetails.structures && (
                <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(6,182,212,0.08) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <div className="px-3 py-2 border-b border-cyan-500/20 flex items-center gap-3" style={{ background: 'rgba(6,182,212,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-500/20">
                      <Icon name="database" size={16} className="text-cyan-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Concurrent Data Structures</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {topicDetails.structures.map((struct, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#f5f5f5', border: '1px solid rgba(6,182,212,0.1)' }}>
                        <code className="text-cyan-700 font-mono text-sm font-semibold whitespace-nowrap">{struct.name}</code>
                        <span className="text-gray-900 text-sm">{struct.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      )}

      {/* Behavioral Topic Detail */}
      {activePage === 'behavioral' && (topicDetails.sampleQuestions || topicDetails.starExample || topicDetails.introduction || topicDetails.keyQuestions) && (
        <div className="space-y-5">
          {/* Introduction */}
          {topicDetails.introduction && (() => {
            // Check if introduction starts with a quoted question
            const quoteMatch = topicDetails.introduction.match(/^"([^"]+)"\s*(.*)/s);
            if (quoteMatch) {
              const [, quotedQuestion, restOfText] = quoteMatch;
              return (
                <div id="overview" className="scroll-mt-24 space-y-4">
                  {/* Featured Question */}
                  <div className="p-5 rounded-xl" style={{ background: `linear-gradient(135deg, ${topicDetails.color}15, ${topicDetails.color}05)`, borderLeft: `4px solid ${topicDetails.color}` }}>
                    <p className="text-sm font-medium text-gray-900 italic">{quotedQuestion}</p>
                  </div>
                  {/* Overview Content */}
                  <div className="px-1">
                    <p className="text-gray-900 text-lg leading-relaxed">{restOfText.trim()}</p>
                  </div>
                </div>
              );
            }
            // Regular introduction without leading quote
            return (
              <div id="overview" className="scroll-mt-24">
                <p className="text-gray-900 text-lg leading-relaxed">{topicDetails.introduction}</p>
              </div>
            );
          })()}

          {/* Key Questions - Row Mode Layout */}
          {topicDetails.keyQuestions && topicDetails.keyQuestions.length > 0 && (
            <div id="key-questions" className="rounded-lg overflow-hidden scroll-mt-24" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)', border: '1px solid #e2e8f0' }}>
              <div className="px-3 py-2 border-b flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${topicDetails.color}10, transparent)`, borderColor: `${topicDetails.color}20` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${topicDetails.color}20` }}>
                  <Icon name="messageSquare" size={16} style={{ color: topicDetails.color }} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Key Questions & Answers</h3>
                <span className="text-lg text-gray-900 ml-auto">{topicDetails.keyQuestions.length} questions</span>
              </div>
              <div className="divide-y" style={{ borderColor: `${topicDetails.color}10` }}>
                {topicDetails.keyQuestions.map((item, index) => (
                  <div key={index} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: `${topicDetails.color}25`, color: topicDetails.color }}>
                        Q{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 font-semibold text-lg mb-3">{item.question}</h4>
                        <div className="text-gray-900 leading-relaxed">
                          {item.answer.split('\n').map((line, i) => {
                            const trimmedLine = line.trim();
                            // Section headers like **Present**:
                            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                              return <h5 key={i} className="text-gray-900 font-semibold mt-4 mb-2 text-lg flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ background: topicDetails.color }}></span>{trimmedLine.replace(/\*\*/g, '')}</h5>;
                            }
                            // Lines with bold text
                            else if (trimmedLine.includes('**')) {
                              const parts = trimmedLine.split('**');
                              return (
                                <p key={i} className="mb-2 text-lg leading-relaxed">
                                  {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-gray-900 font-medium">{part}</strong> : <span key={j}>{part}</span>)}
                                </p>
                              );
                            }
                            // Quoted example speech - render as styled blockquote
                            else if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
                              const quoteContent = trimmedLine.slice(1, -1);
                              return (
                                <div key={i} className="my-3 pl-4 py-2 text-lg italic text-gray-900" style={{ borderLeft: `3px solid ${topicDetails.color}40` }}>
                                  {quoteContent}
                                </div>
                              );
                            }
                            // Inline quotes within the line
                            else if (trimmedLine.includes('"') && /^[^"]*"[^"]{10,}"/.test(trimmedLine)) {
                              const rendered = trimmedLine.replace(/"([^"]{10,})"/g, (_, content) => `<em>${content}</em>`);
                              return (
                                <p key={i} className="mb-2 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered.replace(/<em>/g, '<em class="text-gray-900 italic">') }} />
                              );
                            }
                            else if (trimmedLine.startsWith('✅') || trimmedLine.startsWith('❌')) {
                              return <p key={i} className="mb-2 text-lg flex items-start gap-2"><span className="flex-shrink-0">{trimmedLine.substring(0, 2)}</span><span>{trimmedLine.substring(2)}</span></p>;
                            }
                            else if (/^\d+\./.test(trimmedLine)) {
                              const num = trimmedLine.match(/^(\d+)\./)[1];
                              return <p key={i} className="mb-2 text-lg flex items-start gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${topicDetails.color}20`, color: topicDetails.color }}>{num}</span><span>{trimmedLine.replace(/^\d+\.\s*/, '')}</span></p>;
                            }
                            else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                              return <p key={i} className="mb-1.5 text-lg flex items-start gap-2 ml-1"><span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: topicDetails.color }}></span><span>{trimmedLine.substring(2)}</span></p>;
                            }
                            else if (trimmedLine.toLowerCase().startsWith('example:')) {
                              return <div key={i} className="mt-3 mb-2 p-4 rounded-lg text-lg italic" style={{ background: '#f9fafb', borderLeft: `3px solid ${topicDetails.color}` }}>{trimmedLine}</div>;
                            }
                            else if (trimmedLine === '') {
                              return <div key={i} className="h-2"></div>;
                            }
                            return <p key={i} className="mb-2 text-lg leading-relaxed">{trimmedLine}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topicDetails.starExample && (
            <div id="star-example" className="rounded-lg overflow-hidden scroll-mt-24" style={{ background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <div className="px-3 py-2 border-b border-purple-200 flex items-center gap-3" style={{ background: 'rgba(168, 85, 247, 0.05)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                  <Icon name="target" size={16} className="text-emerald-700" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">STAR Framework Example</h3>
              </div>
              <div className="divide-y divide-purple-500/10">
                {Object.entries(topicDetails.starExample).map(([key, value]) => {
                  const colors = { situation: '#3b82f6', task: '#f59e0b', action: '#10b981', result: '#ef4444' };
                  const color = colors[key.toLowerCase()] || '#a855f7';
                  return (
                    <div key={key} className="px-3 py-2 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-24 flex-shrink-0">
                        <div className="text-sm font-bold uppercase tracking-wide" style={{ color }}>{key}</div>
                      </div>
                      <div className="flex-1 text-gray-900 text-lg leading-relaxed">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {topicDetails.sampleQuestions && !topicDetails.keyQuestions && (
            <div id="sample-questions" className="rounded-lg overflow-hidden scroll-mt-24" style={{ background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div className="px-3 py-2 border-b border-blue-200 flex items-center gap-3" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                  <Icon name="helpCircle" size={16} className="text-emerald-700" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Sample Questions</h3>
              </div>
              <div className="divide-y divide-blue-500/10">
                {topicDetails.sampleQuestions.map((q, i) => (
                  <div key={i} className="px-3 py-2 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: `${topicDetails.color}20`, color: topicDetails.color }}>{i + 1}</span>
                    <span className="text-gray-900 text-lg">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topicDetails.tips && (
            <div id="tips" className="rounded-lg overflow-hidden scroll-mt-24" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="px-3 py-2 border-b border-emerald-200 flex items-center gap-3" style={{ background: '#f0fdf4' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100">
                  <Icon name="checkCircle" size={16} className="text-emerald-700" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Tips for Success</h3>
              </div>
              <div className="divide-y divide-emerald-500/10">
                {topicDetails.tips.map((tip, i) => (
                  <div key={i} className="px-3 py-2 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-100 text-gray-900 text-sm">✓</span>
                    <span className="text-gray-900 text-lg">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topicDetails.principles && !topicDetails.keyQuestions && (
            <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #e2e8f0' }}>
              <h3 className="text-gray-900 font-semibold mb-4">Key Principles</h3>
              <div className="flex flex-wrap gap-2">
                {topicDetails.principles.map((principle, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: `${topicDetails.color}15`, color: topicDetails.color }}>
                    {principle}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
