import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();

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
      <div className="p-2 rounded-lg bg-gray-100 border border-gray-200">
        <pre className="text-[10px] text-gray-700 overflow-auto whitespace-pre-wrap font-mono leading-tight">{cleanChart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 text-[10px] animate-pulse">
        Rendering...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-lg bg-gray-50 border border-gray-200 overflow-auto"
      style={{ padding: '8px' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Collapsible section component
function CollapsibleSection({ title, icon, color, children, defaultOpen = true, badge }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2.5 py-1.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
          {title}
          {badge && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-normal">{badge}</span>}
        </span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-2.5 pb-2.5 pt-1">{children}</div>}
    </div>
  );
}

export default function SystemDesignPanel({ systemDesign, eraserDiagram, onGenerateEraserDiagram }) {
  const [generatingEraser, setGeneratingEraser] = useState(false);

  const handleGenerateEraser = async () => {
    if (!onGenerateEraserDiagram) return;
    setGeneratingEraser(true);
    try {
      await onGenerateEraserDiagram();
    } finally {
      setGeneratingEraser(false);
    }
  };

  if (!systemDesign || !systemDesign.included) {
    return null;
  }

  return (
    <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-200 animate-fade-in">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">System Design</span>
      </div>

      <div className="space-y-2">
        {/* Row 1: Overview + Requirements side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Overview */}
          {systemDesign.overview && (
            <div className="rounded-lg p-2.5 bg-white border border-gray-200">
              <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Overview
              </h4>
              <p className="text-[11px] text-gray-700 leading-snug">{systemDesign.overview}</p>
            </div>
          )}

          {/* Requirements - Full display */}
          {systemDesign.requirements && (
            <div className="rounded-lg p-2.5 bg-white border border-gray-200">
              <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Requirements
              </h4>
              <div className="space-y-2">
                {systemDesign.requirements.functional && systemDesign.requirements.functional.length > 0 && (
                  <div>
                    <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wide flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Functional
                    </span>
                    <ul className="space-y-0.5">
                      {systemDesign.requirements.functional.map((req, i) => (
                        <li key={i} className="text-[10px] text-gray-700 flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {systemDesign.requirements.nonFunctional && systemDesign.requirements.nonFunctional.length > 0 && (
                  <div>
                    <span className="text-[9px] font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Non-Functional
                    </span>
                    <ul className="space-y-0.5">
                      {systemDesign.requirements.nonFunctional.map((req, i) => (
                        <li key={i} className="text-[10px] text-gray-700 flex items-start gap-1.5">
                          <span className="text-blue-400 mt-0.5">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Architecture Components + Scalability side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Architecture Components */}
          {systemDesign.architecture && (
            <div className="rounded-lg p-2.5 bg-white border border-gray-200">
              <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Components
              </h4>
              {systemDesign.architecture.components && systemDesign.architecture.components.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {systemDesign.architecture.components.map((component, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] rounded border border-amber-200"
                    >
                      {component}
                    </span>
                  ))}
                </div>
              )}
              {systemDesign.architecture.description && (
                <p className="text-[10px] text-gray-600 leading-snug line-clamp-3">{systemDesign.architecture.description}</p>
              )}
            </div>
          )}

          {/* Scalability - Compact badges */}
          {systemDesign.scalability && systemDesign.scalability.length > 0 && (
            <div className="rounded-lg p-2.5 bg-white border border-gray-200">
              <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Scalability
              </h4>
              <div className="flex flex-wrap gap-1">
                {systemDesign.scalability.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] rounded border border-emerald-200"
                    title={item}
                  >
                    <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {item.length > 30 ? item.slice(0, 30) + '...' : item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Diagrams - Mermaid and Eraser side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Architecture Diagram (Mermaid) */}
          {systemDesign.diagram && (
            <div className="rounded-lg p-2.5 bg-white border border-gray-200">
              <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Flow Diagram
              </h4>
              <MermaidDiagram chart={systemDesign.diagram} />
            </div>
          )}

          {/* Professional Diagram (Eraser.io) */}
          <div className="rounded-lg p-2.5 bg-white border border-gray-200">
            <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Pro Diagram
              </span>
              {onGenerateEraserDiagram && !eraserDiagram && (
                <button
                  onClick={handleGenerateEraser}
                  disabled={generatingEraser}
                  className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium rounded transition-all"
                  style={{
                    background: generatingEraser ? '#e5e7eb' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: generatingEraser ? '#9ca3af' : 'white',
                  }}
                >
                  {generatingEraser ? (
                    <>
                      <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      ...
                    </>
                  ) : (
                    <>
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Generate
                    </>
                  )}
                </button>
              )}
            </h4>

            {eraserDiagram ? (
              <div>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={eraserDiagram.imageUrl}
                    alt="Architecture Diagram"
                    className="w-full h-auto"
                  />
                </div>
                {eraserDiagram.editUrl && (
                  <a
                    href={eraserDiagram.editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium rounded bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Edit
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                <svg className="w-6 h-6 mx-auto mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[9px]">Click Generate for pro diagram</p>
              </div>
            )}
          </div>
        </div>

        {/* Row 4: API Design - Collapsible */}
        {systemDesign.apiDesign && systemDesign.apiDesign.length > 0 && (
          <CollapsibleSection
            title="API Design"
            color="bg-blue-500"
            defaultOpen={false}
            badge={`${systemDesign.apiDesign.length}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {systemDesign.apiDesign.map((api, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-medium rounded ${
                      api.method === 'GET' ? 'bg-emerald-100 text-emerald-700' :
                      api.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      api.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                      api.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {api.method}
                    </span>
                    <code className="text-[9px] font-mono text-gray-600 truncate">{api.endpoint}</code>
                  </div>
                  <p className="text-[9px] text-gray-500 line-clamp-2">{api.description}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Row 5: Data Model - Collapsible */}
        {systemDesign.dataModel && systemDesign.dataModel.length > 0 && (
          <CollapsibleSection
            title="Data Model"
            color="bg-indigo-500"
            defaultOpen={false}
            badge={`${systemDesign.dataModel.length} tables`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {systemDesign.dataModel.map((table, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-2 py-1 bg-gray-100 border-b border-gray-200">
                    <span className="text-[9px] font-semibold text-gray-700 font-mono">{table.table}</span>
                  </div>
                  <div className="p-1.5 max-h-24 overflow-y-auto">
                    {table.fields && table.fields.slice(0, 5).map((field, j) => (
                      <div key={j} className="flex items-center gap-1 text-[8px] py-0.5">
                        <span className="font-mono text-amber-600 truncate w-16">{field.name}</span>
                        <span className="font-mono text-gray-400 truncate w-12">{field.type}</span>
                      </div>
                    ))}
                    {table.fields && table.fields.length > 5 && (
                      <span className="text-[8px] text-gray-400">+{table.fields.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
