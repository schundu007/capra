import { useState } from 'react';
import { Icon } from './Icons.jsx';

/**
 * Documentation Page for Ascend
 */
export default function DocsPage() {
  const [expandedItem, setExpandedItem] = useState(null);

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'rocket',
      color: '#10b981',
      items: [
        {
          title: 'Quick Start',
          desc: 'Get up and running in 5 minutes',
          content: `1. **Sign up** - Create your account at capra.cariara.com\n2. **Choose a plan** - Start with free tier or upgrade to Quarterly Pro\n3. **Download the app** - Get the desktop app for the best experience\n4. **Start solving** - Paste a problem or take a screenshot to begin`
        },
        {
          title: 'Installation',
          desc: 'Download and install Ascend',
          content: `**Desktop App (Recommended)**\n- macOS: Download DMG from /download page\n- Windows: Coming soon\n- Linux: Coming soon\n\n**Web App**\nNo installation needed - use directly at capra.cariara.com/app`
        },
        {
          title: 'First Problem',
          desc: 'Solve your first coding problem',
          content: `1. Open Ascend and select "Coding" mode\n2. Paste a LeetCode/HackerRank problem or take a screenshot\n3. Click "Solve" or press Ctrl+1\n4. Review the solution, explanation, and complexity analysis\n5. Copy the code with Ctrl+3`
        },
      ]
    },
    {
      id: 'features',
      title: 'Features',
      icon: 'code',
      color: '#3b82f6',
      items: [
        {
          title: 'Coding Assistant',
          desc: 'Real-time coding solutions with explanations',
          content: `**Supported Languages:** Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, and more\n\n**Features:**\n- Instant solutions with step-by-step explanations\n- Time & space complexity analysis\n- Auto-fix for runtime errors\n- Code execution sandbox`
        },
        {
          title: 'System Design',
          desc: 'Architecture diagrams and scalability analysis',
          content: `**What you get:**\n- High-level architecture overview\n- Component breakdown with responsibilities\n- Database schema design\n- API endpoint design\n- Scalability considerations\n- Tech stack justifications\n- Auto-generated architecture diagrams`
        },
        {
          title: 'Behavioral Prep',
          desc: 'STAR method responses for behavioral questions',
          content: `**STAR Method:**\n- **S**ituation - Context for your story\n- **T**ask - What was required of you\n- **A**ction - Steps you took\n- **R**esult - Outcomes and learnings\n\nPractice with AI-generated follow-up questions based on your responses.`
        },
        {
          title: 'Interview Assistant',
          desc: 'Live transcription and AI-powered answers',
          content: `**Real-time Features:**\n- Live audio transcription\n- Instant answer suggestions\n- Context-aware responses\n- Completely invisible during screen sharing\n\n*Note: For ethical use in practice sessions only.*`
        },
      ]
    },
    {
      id: 'guides',
      title: 'Guides',
      icon: 'target',
      color: '#8b5cf6',
      items: [
        {
          title: '2-Week Prep Plan',
          desc: 'Intensive interview preparation schedule',
          content: `**Week 1: Foundations**\n- Days 1-2: Arrays, Strings, Hash Maps\n- Days 3-4: Linked Lists, Stacks, Queues\n- Days 5-7: Trees, Binary Search\n\n**Week 2: Advanced**\n- Days 8-9: Graphs, BFS/DFS\n- Days 10-11: Dynamic Programming\n- Days 12-14: System Design & Mock Interviews`
        },
        {
          title: 'FAANG Interview Guide',
          desc: 'Preparing for Big Tech interviews',
          content: `**Interview Rounds:**\n1. Phone Screen (45 min) - 1-2 coding problems\n2. Virtual Onsite (4-5 rounds):\n   - 2 Coding rounds\n   - 1 System Design (L5+)\n   - 1-2 Behavioral rounds\n\n**Tips:**\n- Practice thinking out loud\n- Ask clarifying questions\n- Discuss tradeoffs`
        },
        {
          title: 'System Design Walkthrough',
          desc: 'Complete system design example',
          content: `**Example: Design a URL Shortener**\n\n1. **Requirements** - Functional & non-functional\n2. **Capacity Estimation** - QPS, storage needs\n3. **API Design** - POST /shorten, GET /:shortCode\n4. **Database** - SQL vs NoSQL, sharding strategy\n5. **Architecture** - Load balancer, cache, CDN\n6. **Deep Dives** - Analytics, rate limiting`
        },
      ]
    },
    {
      id: 'reference',
      title: 'Reference',
      icon: 'clipboard',
      color: '#f59e0b',
      items: [
        {
          title: 'Keyboard Shortcuts',
          desc: 'All shortcuts for power users',
          content: `**Essential Shortcuts:**\n- \`Ctrl+1\` - Solve problem\n- \`Ctrl+2\` - Run code\n- \`Ctrl+3\` - Copy code\n- \`Esc\` - Clear all\n- \`Ctrl+P\` - Toggle problem panel\n- \`Ctrl+A\` - Toggle Interview Assistant`
        },
        {
          title: 'API Reference',
          desc: 'Integration and API documentation',
          content: `**Endpoints:**\n- \`POST /api/solve/stream\` - Solve a problem (SSE)\n- \`POST /api/analyze\` - OCR screenshot\n- \`POST /api/run\` - Execute code\n- \`POST /api/fix\` - Fix code errors\n\nAPI documentation available for enterprise plans.`
        },
        {
          title: 'Troubleshooting',
          desc: 'Common issues and solutions',
          content: `**Common Issues:**\n\n**"API key not configured"**\n→ Add your API keys in Settings\n\n**"Code execution failed"**\n→ Check for syntax errors, ensure language is correct\n\n**"Screenshot not recognized"**\n→ Ensure text is clear and readable`
        },
        {
          title: 'Subscription Plans',
          desc: 'Pricing and plan details',
          content: `**Plans:**\n\n**Free Tier** - 10 problems/day\n\n**Monthly Pro ($50/mo)**\n- Unlimited problems\n- All features\n\n**Quarterly Pro ($300/qtr)**\n- Everything in Monthly\n- Priority support\n- Jobs portal access`
        },
      ]
    },
  ];

  const quickLinks = [
    { label: 'Quick Start', icon: 'play', color: '#10b981', target: 'getting-started' },
    { label: 'Features', icon: 'sparkles', color: '#3b82f6', target: 'features' },
    { label: 'Pricing', icon: 'wallet', color: '#8b5cf6', action: () => window.location.href = '/#pricing' },
    { label: 'Support', icon: 'messageSquare', color: '#f59e0b', action: () => window.location.href = 'mailto:support@cariara.com' },
  ];

  const handleQuickLink = (link) => {
    if (link.action) {
      link.action();
    } else if (link.target) {
      document.getElementById(link.target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleItem = (sectionIndex, itemIndex) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setExpandedItem(expandedItem === key ? null : key);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 mx-auto px-6 py-8" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Icon name="ascend" size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Ascend</span>
          </a>
          <a href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
            <Icon name="arrowLeft" size={16} />
            Back to Home
          </a>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-gray-400 text-lg">Everything you need to ace your technical interviews</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {quickLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => handleQuickLink(link)}
              className="p-4 rounded-xl text-center transition-all hover:scale-105 active:scale-95"
              style={{ background: `${link.color}10`, border: `1px solid ${link.color}30` }}
            >
              <Icon name={link.icon} size={24} style={{ color: link.color }} className="mx-auto mb-2" />
              <span className="text-white text-sm font-medium">{link.label}</span>
            </button>
          ))}
        </div>

        {/* Documentation Sections */}
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              id={section.id}
              className="p-6 rounded-2xl scroll-mt-8"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${section.color}15` }}>
                  <Icon name={section.icon} size={20} style={{ color: section.color }} />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {section.items.map((item, itemIndex) => {
                  const isExpanded = expandedItem === `${sectionIndex}-${itemIndex}`;
                  return (
                    <div
                      key={itemIndex}
                      className={`rounded-xl transition-all ${isExpanded ? 'md:col-span-2' : ''}`}
                      style={{ background: 'rgba(0,0,0,0.2)' }}
                    >
                      <button
                        onClick={() => toggleItem(sectionIndex, itemIndex)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <div>
                          <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                          <p className="text-gray-500 text-xs">{item.desc}</p>
                        </div>
                        <Icon
                          name={isExpanded ? 'chevronUp' : 'chevronDown'}
                          size={16}
                          className="text-gray-500 flex-shrink-0 mt-1"
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <div
                            className="p-4 rounded-lg text-sm text-gray-300 leading-relaxed"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            {item.content.split('\n').map((line, lineIndex) => {
                              // Handle bold text
                              const parts = line.split(/(\*\*.*?\*\*|\`.*?\`)/g);
                              return (
                                <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                                  {parts.map((part, partIndex) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return <strong key={partIndex} className="text-white">{part.slice(2, -2)}</strong>;
                                    }
                                    if (part.startsWith('`') && part.endsWith('`')) {
                                      return <code key={partIndex} className="px-1.5 py-0.5 rounded bg-white/10 text-green-400 text-xs">{part.slice(1, -1)}</code>;
                                    }
                                    return part;
                                  })}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Icon name="messageSquare" size={32} className="text-green-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-2">Need Help?</h3>
          <p className="text-gray-400 text-sm mb-4">Can't find what you're looking for? Our support team is here to help.</p>
          <a
            href="mailto:support@cariara.com"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: '#10b981', color: '#fff' }}
          >
            <Icon name="email" size={16} />
            Contact Support
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <span className="text-gray-500 text-sm">© 2025 Ascend</span>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
