import { useState } from 'react';
import { Icon } from '../Icons.jsx';
import DocsSidebar from './DocsSidebar.jsx';

/**
 * System Design Documentation Page
 * Inspired by techprep.app/system-design
 */
export default function SystemDesignDocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('a-z');

  // System Design Topics matching techprep.app style
  const topics = [
    { id: 'fundamentals', title: 'Fundamentals', icon: 'lightbulb', color: '#10b981', questions: 12 },
    { id: 'scalability', title: 'Scalability', icon: 'chartLine', color: '#3b82f6', questions: 8 },
    { id: 'load-balancing', title: 'Load Balancing', icon: 'layers', color: '#8b5cf6', questions: 6 },
    { id: 'caching', title: 'Caching', icon: 'zap', color: '#f59e0b', questions: 10 },
    { id: 'databases', title: 'Databases', icon: 'database', color: '#ef4444', questions: 15 },
    { id: 'message-queues', title: 'Message Queues', icon: 'inbox', color: '#ec4899', questions: 7 },
    { id: 'microservices', title: 'Microservices', icon: 'share', color: '#06b6d4', questions: 9 },
    { id: 'api-design', title: 'API Design', icon: 'code', color: '#22c55e', questions: 11 },
    { id: 'cap-theorem', title: 'CAP Theorem', icon: 'puzzle', color: '#a855f7', questions: 5 },
    { id: 'consistency', title: 'Consistency Patterns', icon: 'refresh', color: '#059669', questions: 8 },
    { id: 'cdn', title: 'CDN', icon: 'globe', color: '#f97316', questions: 4 },
    { id: 'dns', title: 'DNS', icon: 'globe', color: '#84cc16', questions: 3 },
    { id: 'proxies', title: 'Proxies', icon: 'shield', color: '#6366f1', questions: 5 },
    { id: 'replication', title: 'Replication', icon: 'copy', color: '#f43f5e', questions: 6 },
    { id: 'sharding', title: 'Sharding', icon: 'layers', color: '#0ea5e9', questions: 7 },
    { id: 'websockets', title: 'WebSockets', icon: 'link', color: '#8b5cf6', questions: 4 },
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
    { id: 'google-maps', title: 'Google Maps', subtitle: 'Location Services', icon: 'mapPin', color: '#f59e0b', difficulty: 'Hard' },
    { id: 'slack', title: 'Slack', subtitle: 'Team Messaging', icon: 'messageSquare', color: '#6366f1', difficulty: 'Medium' },
  ];

  // Filter and sort topics
  const filteredTopics = topics
    .filter(topic => topic.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
      if (sortOrder === 'z-a') return b.title.localeCompare(a.title);
      if (sortOrder === 'most') return b.questions - a.questions;
      if (sortOrder === 'least') return a.questions - b.questions;
      return 0;
    });

  return (
    <div className="min-h-screen flex" style={{ background: '#ffffff', fontFamily: "'Source Sans 3', sans-serif" }}>
      {/* Sidebar */}
      <DocsSidebar activePage="system-design" />

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div />
          <div className="flex items-center gap-4">
            <a href="/app" className="px-4 py-2 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-400/10 transition-colors" style={{ border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              Getting started guide
            </a>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-900 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Icon name="search" size={16} />
              Search everything
              <span className="text-gray-600 ml-2">/</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8 max-w-6xl mx-auto">
          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">System Design</h1>

          {/* Search and Sort */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search topics"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-lg text-sm text-gray-900 placeholder-gray-500 w-64 focus:outline-none focus:ring-1 focus:ring-blue-400/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
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

          {/* Featured Banner */}
          <a href="#" className="block mb-8 p-5 rounded-lg transition-all hover:scale-[1.01]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                  <Icon name="systemDesign" size={20} className="text-gray-900" />
                </div>
                <span className="text-gray-900 font-medium">How to Pass System Design Interviews in 2026</span>
              </div>
              <Icon name="chevronRight" size={20} className="text-gray-500" />
            </div>
          </a>

          {/* Core Concepts Section */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Core Concepts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {filteredTopics.map((topic) => (
              <a
                key={topic.id}
                href={`/prepare/system-design/${topic.id}`}
                className="group p-4 rounded-lg transition-all hover:scale-[1.02] hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name={topic.icon} size={16} style={{ color: topic.color }} />
                    <span className="text-gray-900 font-medium text-sm">{topic.title}</span>
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

          {/* Common Designs Section */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Common System Designs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {systemDesigns.map((design) => (
              <a
                key={design.id}
                href={`/prepare/system-design/${design.id}`}
                className="group p-5 rounded-lg transition-all hover:scale-[1.01] hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${design.color}15` }}>
                    <Icon name={design.icon} size={24} style={{ color: design.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-gray-900 font-semibold">{design.title}</h3>
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
          <div className="p-6 rounded-lg mb-12" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                <div key={i} className="p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="text-blue-400 text-sm font-bold mb-1">{phase.time}</div>
                  <div className="text-gray-900 font-semibold mb-2">{phase.step}</div>
                  <div className="text-gray-400 text-sm">{phase.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reference Section */}
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Reference</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Building Blocks */}
            <div className="p-6 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <Icon name="layers" size={18} className="text-blue-400" />
                Building Blocks
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Load Balancer</span><span className="text-gray-900">NGINX, HAProxy, ALB</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Cache</span><span className="text-gray-900">Redis, Memcached</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Message Queue</span><span className="text-gray-900">Kafka, RabbitMQ, SQS</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Search</span><span className="text-gray-900">Elasticsearch, Solr</span></div>
                <div className="flex justify-between"><span className="text-gray-400">SQL Database</span><span className="text-gray-900">PostgreSQL, MySQL</span></div>
                <div className="flex justify-between"><span className="text-gray-400">NoSQL Database</span><span className="text-gray-900">MongoDB, Cassandra</span></div>
              </div>
            </div>

            {/* Key Tradeoffs */}
            <div className="p-6 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                <Icon name="puzzle" size={18} className="text-purple-400" />
                Key Trade-offs
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Consistency vs Availability</span><span className="text-gray-900">CAP Theorem</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Latency vs Throughput</span><span className="text-gray-900">System tuning</span></div>
                <div className="flex justify-between"><span className="text-gray-400">SQL vs NoSQL</span><span className="text-gray-900">Data modeling</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Push vs Pull</span><span className="text-gray-900">Data delivery</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Sync vs Async</span><span className="text-gray-900">Communication</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Strong vs Eventual</span><span className="text-gray-900">Consistency</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
