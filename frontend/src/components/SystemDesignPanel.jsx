import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
});

// Clean and fix mermaid syntax for v11 compatibility
function sanitizeMermaidChart(chart) {
  if (!chart) return '';

  let clean = chart
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '  ')
    .replace(/\r\n/g, '\n')
    .trim();

  // Add flowchart directive if missing
  if (!clean.match(/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/i)) {
    clean = 'flowchart LR\n' + clean;
  }

  // Replace 'graph' with 'flowchart' for v11 compatibility
  clean = clean.replace(/^graph\s+(TD|TB|BT|RL|LR)/i, 'flowchart $1');

  // Fix common syntax issues for mermaid v11
  const lines = clean.split('\n');
  const fixedLines = lines.map((line, i) => {
    if (i === 0) return line; // Keep directive line as-is

    // Fix arrows: ensure proper spacing
    line = line.replace(/\s*-->\s*/g, ' --> ');
    line = line.replace(/\s*---\s*/g, ' --- ');
    line = line.replace(/\s*-\.->\s*/g, ' -.-> ');

    // Fix node definitions with special characters in IDs
    // Replace spaces in node IDs with underscores
    line = line.replace(/([A-Za-z])(\s+)(\[|\(|\{)/g, '$1$3');

    return line;
  });

  return fixedLines.join('\n');
}

function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chart) return;

    const renderDiagram = async () => {
      try {
        const cleanChart = sanitizeMermaidChart(chart);

        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Render with mermaid v11 API
        const { svg: svgContent } = await mermaid.render(id, cleanChart);
        setSvg(svgContent);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart]);

  // Always show the text representation when there's an error
  if (error) {
    const cleanChart = chart.replace(/\\n/g, '\n').replace(/\\t/g, '  ').trim();
    return (
      <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Architecture:</div>
        <pre className="text-xs text-gray-700 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">{cleanChart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs animate-pulse">
        Rendering diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="p-4 rounded-xl bg-gray-50 border border-gray-200 overflow-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function SystemDesignPanel({ systemDesign }) {
  if (!systemDesign || !systemDesign.included) {
    return null;
  }

  return (
    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 animate-fade-in">
      {/* Header */}
      <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 block">System Design</span>

      <div className="space-y-4">

      {/* Overview */}
      {systemDesign.overview && (
        <div className="rounded-lg p-4 bg-white border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Overview
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{systemDesign.overview}</p>
        </div>
      )}

      {/* Requirements */}
      {systemDesign.requirements && (
        <div className="rounded-lg p-4 bg-white border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Requirements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemDesign.requirements.functional && systemDesign.requirements.functional.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Functional
                </h5>
                <ul className="space-y-1.5">
                  {systemDesign.requirements.functional.map((req, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {systemDesign.requirements.nonFunctional && systemDesign.requirements.nonFunctional.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Non-Functional
                </h5>
                <ul className="space-y-1.5">
                  {systemDesign.requirements.nonFunctional.map((req, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Architecture Diagram */}
      {systemDesign.diagram && (
        <div className="rounded-lg p-4 bg-white border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Architecture Diagram
          </h4>
          <MermaidDiagram chart={systemDesign.diagram} />
        </div>
      )}

      {/* Architecture Description */}
      {systemDesign.architecture && (
        <div className="rounded-lg p-4 bg-white border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Architecture
          </h4>
          {systemDesign.architecture.components && systemDesign.architecture.components.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {systemDesign.architecture.components.map((component, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg border border-amber-200"
                >
                  {component}
                </span>
              ))}
            </div>
          )}
          {systemDesign.architecture.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{systemDesign.architecture.description}</p>
          )}
        </div>
      )}

      {/* API Design */}
      {systemDesign.apiDesign && systemDesign.apiDesign.length > 0 && (
        <div className="rounded-lg p-4 bg-white border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            API Design
          </h4>
          <div className="space-y-3">
            {systemDesign.apiDesign.map((api, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded-lg ${
                    api.method === 'GET' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    api.method === 'POST' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    api.method === 'PUT' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    api.method === 'DELETE' ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {api.method}
                  </span>
                  <code className="text-xs font-mono text-gray-600">{api.endpoint}</code>
                </div>
                <p className="text-xs text-gray-500 mb-2">{api.description}</p>
                {api.request && api.request !== '{}' && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Request:</span>
                    <pre className="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded-lg mt-1 overflow-auto border border-gray-200">{api.request}</pre>
                  </div>
                )}
                {api.response && api.response !== '{}' && (
                  <div>
                    <span className="text-xs text-gray-500">Response:</span>
                    <pre className="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded-lg mt-1 overflow-auto border border-gray-200">{api.response}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Model */}
      {systemDesign.dataModel && systemDesign.dataModel.length > 0 && (
        <div className="rounded-lg p-4 bg-white border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Data Model
          </h4>
          <div className="space-y-3">
            {systemDesign.dataModel.map((table, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-700 font-mono">{table.table}</span>
                </div>
                <div className="p-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left py-1.5 px-2 font-semibold">Field</th>
                        <th className="text-left py-1.5 px-2 font-semibold">Type</th>
                        <th className="text-left py-1.5 px-2 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.fields && table.fields.map((field, j) => (
                        <tr key={j} className="border-t border-gray-200">
                          <td className="py-1.5 px-2 font-mono text-amber-600">{field.name}</td>
                          <td className="py-1.5 px-2 font-mono text-gray-500">{field.type}</td>
                          <td className="py-1.5 px-2 text-gray-600">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scalability */}
      {systemDesign.scalability && systemDesign.scalability.length > 0 && (
        <div className="rounded-lg p-4 bg-white border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Scalability Considerations
          </h4>
          <ul className="space-y-2">
            {systemDesign.scalability.map((item, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
}
