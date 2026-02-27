import { Icon } from './Icons.jsx';

/**
 * Documentation Page for Ascend
 */
export default function DocsPage() {
  const sections = [
    {
      title: 'Getting Started',
      icon: 'rocket',
      color: '#10b981',
      items: [
        { title: 'Quick Start', desc: 'Get up and running in 5 minutes' },
        { title: 'Installation', desc: 'Download and install Ascend' },
        { title: 'First Problem', desc: 'Solve your first coding problem' },
      ]
    },
    {
      title: 'Features',
      icon: 'code',
      color: '#3b82f6',
      items: [
        { title: 'Coding Assistant', desc: 'Real-time coding solutions with explanations' },
        { title: 'System Design', desc: 'Architecture diagrams and scalability analysis' },
        { title: 'Behavioral Prep', desc: 'STAR method responses for behavioral questions' },
        { title: 'Interview Assistant', desc: 'Live transcription and AI-powered answers' },
      ]
    },
    {
      title: 'Guides',
      icon: 'target',
      color: '#8b5cf6',
      items: [
        { title: '2-Week Prep Plan', desc: 'Intensive interview preparation schedule' },
        { title: 'FAANG Interview Guide', desc: 'Preparing for Big Tech interviews' },
        { title: 'System Design Walkthrough', desc: 'Complete system design example' },
      ]
    },
    {
      title: 'Reference',
      icon: 'clipboard',
      color: '#f59e0b',
      items: [
        { title: 'Keyboard Shortcuts', desc: 'All shortcuts for power users' },
        { title: 'API Reference', desc: 'Integration and API documentation' },
        { title: 'Troubleshooting', desc: 'Common issues and solutions' },
        { title: 'Subscription Plans', desc: 'Pricing and plan details' },
      ]
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 mx-auto px-6 py-8" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Icon name="ascend" size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Ascend</span>
          </a>
          <a href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
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
          {[
            { label: 'Quick Start', icon: 'play', color: '#10b981' },
            { label: 'Features', icon: 'sparkles', color: '#3b82f6' },
            { label: 'Pricing', icon: 'wallet', color: '#8b5cf6' },
            { label: 'Support', icon: 'messageSquare', color: '#f59e0b' },
          ].map((link, i) => (
            <button key={i} className="p-4 rounded-xl text-center transition-all hover:scale-105" style={{ background: `${link.color}10`, border: `1px solid ${link.color}30` }}>
              <Icon name={link.icon} size={24} style={{ color: link.color }} className="mx-auto mb-2" />
              <span className="text-white text-sm font-medium">{link.label}</span>
            </button>
          ))}
        </div>

        {/* Documentation Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${section.color}15` }}>
                  <Icon name={section.icon} size={20} style={{ color: section.color }} />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {section.items.map((item, j) => (
                  <div key={j} className="p-4 rounded-xl cursor-pointer transition-all hover:bg-white/5" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Icon name="messageSquare" size={32} className="text-green-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-2">Need Help?</h3>
          <p className="text-gray-400 text-sm mb-4">Can't find what you're looking for? Our support team is here to help.</p>
          <a href="mailto:support@cariara.com" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm" style={{ background: '#10b981', color: '#fff' }}>
            <Icon name="email" size={16} />
            Contact Support
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <span className="text-gray-500 text-sm">© 2025 Ascend</span>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
