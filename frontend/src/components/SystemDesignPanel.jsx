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

  // Remove markdown code blocks if present
  clean = clean.replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '').trim();

  // Add flowchart directive if missing
  if (!clean.match(/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/i)) {
    clean = 'flowchart LR\n' + clean;
  }

  // Replace 'graph' with 'flowchart' for v11 compatibility
  clean = clean.replace(/^graph\s+(TD|TB|BT|RL|LR)/i, 'flowchart $1');

  // Fix common syntax issues for mermaid v11
  const lines = clean.split('\n');
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('%%')) {
      continue;
    }

    // Keep directive line as-is (first non-empty line)
    if (fixedLines.length === 0 && line.match(/^(flowchart|graph|sequenceDiagram)/i)) {
      fixedLines.push(line);
      continue;
    }

    // Skip invalid lines that are just text without structure
    if (!line.includes('[') && !line.includes('(') && !line.includes('{') &&
        !line.includes('-->') && !line.includes('---') && !line.includes('-.->') &&
        !line.trim().startsWith('subgraph') && !line.trim().startsWith('end') &&
        !line.trim().startsWith('style') && !line.trim().startsWith('class') &&
        !line.trim().startsWith('linkStyle')) {
      continue;
    }

    // Fix arrows: ensure proper spacing
    line = line.replace(/\s*-->\s*/g, ' --> ');
    line = line.replace(/\s*---\s*/g, ' --- ');
    line = line.replace(/\s*-\.->\s*/g, ' -.-> ');
    line = line.replace(/\s*==>\s*/g, ' ==> ');

    // Fix arrow labels - |label| format
    line = line.replace(/-->\|([^|]+)\|/g, '--> |$1|');
    line = line.replace(/\|->\|/g, '|-->|');

    // Fix subgraph syntax
    if (line.trim().startsWith('subgraph')) {
      // Ensure proper subgraph format: subgraph ID[Label] or subgraph ID
      line = line.replace(/subgraph\s+"([^"]+)"/g, 'subgraph $1');
      line = line.replace(/subgraph\s+'([^']+)'/g, 'subgraph $1');
    }

    // Fix node definitions with special characters in IDs
    // Replace spaces in node IDs with underscores
    line = line.replace(/([A-Za-z])(\s+)(\[|\(|\{)/g, '$1$3');

    // Fix node IDs with special characters - replace with underscores
    line = line.replace(/([A-Za-z0-9_]+)\s*-\s*([A-Za-z0-9_]+)/g, (match, p1, p2) => {
      // Only fix if it's a node ID pattern (not an arrow)
      if (match.includes('->')) return match;
      return `${p1}_${p2}`;
    });

    // Fix labels with special characters - ensure they're properly quoted
    // Replace problematic characters in labels
    line = line.replace(/\[([^\]]*)\]/g, (match, label) => {
      // Remove or escape problematic characters in labels
      let fixedLabel = label
        .replace(/"/g, "'")  // Replace double quotes
        .replace(/;/g, ',')  // Replace semicolons
        .replace(/\n/g, ' ') // Replace newlines
        .trim();
      return `[${fixedLabel}]`;
    });

    line = line.replace(/\(([^)]*)\)/g, (match, label) => {
      // Only fix if it looks like a node label (contains letters)
      if (!/[a-zA-Z]/.test(label)) return match;
      let fixedLabel = label
        .replace(/"/g, "'")
        .replace(/;/g, ',')
        .replace(/\n/g, ' ')
        .trim();
      return `(${fixedLabel})`;
    });

    // Ensure line doesn't have trailing special characters
    line = line.replace(/;\s*$/, '');

    fixedLines.push(line);
  }

  const result = fixedLines.join('\n');

  // Final validation - if it's too short, it's probably broken
  if (fixedLines.length < 2) {
    console.warn('Mermaid chart too short after sanitization:', result);
    return 'flowchart LR\n  A[System] --> B[Component]';
  }

  return result;
}

function MermaidDiagram({ chart, expanded = false }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chart) return;

    const renderDiagram = async () => {
      try {
        const cleanChart = sanitizeMermaidChart(chart);
        console.log('[Mermaid] Sanitized chart:', cleanChart);

        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Render with mermaid v11 API
        const { svg: svgContent } = await mermaid.render(id, cleanChart);

        // If expanded, modify SVG to remove max-width constraint and scale up
        let finalSvg = svgContent;
        if (expanded) {
          // Remove max-width and set larger dimensions
          finalSvg = svgContent
            .replace(/max-width:\s*[\d.]+px;?/gi, '')
            .replace(/style="([^"]*)"/, (match, styles) => {
              // Remove max-width from inline styles, set min dimensions
              const cleanedStyles = styles.replace(/max-width:\s*[\d.]+px;?/gi, '');
              return `style="${cleanedStyles} min-width: 800px; min-height: 400px;"`;
            });
        }

        setSvg(finalSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        console.error('Original chart:', chart);
        console.error('Sanitized chart:', sanitizeMermaidChart(chart));
        setError(err.message || 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart, expanded]);

  // Always show the text representation when there's an error
  if (error) {
    const cleanChart = chart.replace(/\\n/g, '\n').replace(/\\t/g, '  ').trim();
    return (
      <div className="p-3 rounded-lg bg-white border border-gray-200">
        <pre className={`${expanded ? 'text-sm' : 'text-[11px]'} text-gray-600 overflow-auto whitespace-pre-wrap font-mono leading-relaxed`}>{cleanChart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={`p-3 rounded-lg bg-white border border-gray-200 text-gray-400 ${expanded ? 'text-sm' : 'text-[11px]'} animate-pulse`}>
        Rendering diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-lg bg-white border border-gray-200 overflow-auto ${expanded ? 'p-6' : 'p-3'}`}
      style={expanded ? { minWidth: '100%', minHeight: '60vh' } : {}}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Modal component for full-screen diagram view
function DiagramModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

// Collapsible section component
function CollapsibleSection({ title, icon, color, children, defaultOpen = true, badge }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          {title}
          {badge && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[9px] font-medium">{badge}</span>}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  );
}

export default function SystemDesignPanel({ systemDesign, eraserDiagram, onGenerateEraserDiagram }) {
  const [generatingEraser, setGeneratingEraser] = useState(false);
  const [flowDiagramModal, setFlowDiagramModal] = useState(false);
  const [proDiagramModal, setProDiagramModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image error when new diagram is generated
  useEffect(() => {
    if (eraserDiagram?.imageUrl) {
      setImageError(false);
    }
  }, [eraserDiagram?.imageUrl]);

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
    <div className="p-3 rounded-lg animate-fade-in bg-white border border-gray-200">
      {/* Header */}
      <div className="mb-3 pb-2 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-800">System Design</span>
      </div>

      <div className="space-y-3">
        {/* Row 1: Overview - Full width */}
        {systemDesign.overview && (
          <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
            <h4 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Overview
            </h4>
            <p className="text-[12px] text-gray-600 leading-relaxed">{systemDesign.overview}</p>
          </div>
        )}

        {/* Row 2: Requirements - Functional & Non-Functional side by side */}
        {systemDesign.requirements && (
          <div className="grid grid-cols-2 gap-3">
            {/* Functional Requirements */}
            {systemDesign.requirements.functional && systemDesign.requirements.functional.length > 0 && (
              <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                <h4 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Functional
                </h4>
                <ul className="space-y-1">
                  {systemDesign.requirements.functional.map((req, i) => (
                    <li key={i} className="text-[11px] text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Non-Functional Requirements */}
            {systemDesign.requirements.nonFunctional && systemDesign.requirements.nonFunctional.length > 0 && (
              <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                <h4 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Non-Functional
                </h4>
                <ul className="space-y-1">
                  {systemDesign.requirements.nonFunctional.map((req, i) => (
                    <li key={i} className="text-[11px] text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Row 2: Architecture Components + Scalability side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Architecture Components */}
          {systemDesign.architecture && (
            <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
              <h4 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Components
              </h4>
              {systemDesign.architecture.components && systemDesign.architecture.components.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {systemDesign.architecture.components.map((component, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white text-gray-700 text-[10px] rounded border border-gray-300"
                    >
                      {component}
                    </span>
                  ))}
                </div>
              )}
              {systemDesign.architecture.description && (
                <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3">{systemDesign.architecture.description}</p>
              )}
            </div>
          )}

          {/* Scalability - Compact badges */}
          {systemDesign.scalability && systemDesign.scalability.length > 0 && (
            <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
              <h4 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Scalability
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {systemDesign.scalability.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded border border-emerald-200"
                    title={item}
                  >
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {item.length > 30 ? item.slice(0, 30) + '...' : item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Row 3: API Design - Collapsible */}
        {systemDesign.apiDesign && systemDesign.apiDesign.length > 0 && (
          <CollapsibleSection
            title="API Design"
            defaultOpen={false}
            badge={`${systemDesign.apiDesign.length}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {systemDesign.apiDesign.map((api, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded ${
                      api.method === 'GET' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      api.method === 'POST' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                      api.method === 'PUT' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                      api.method === 'DELETE' ? 'bg-gray-100 text-gray-500 border border-gray-300' :
                      'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {api.method}
                    </span>
                    <code className="text-[10px] font-mono text-gray-700 truncate">{api.endpoint}</code>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{api.description}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Row 4: Data Model - Collapsible */}
        {systemDesign.dataModel && systemDesign.dataModel.length > 0 && (
          <CollapsibleSection
            title="Data Model"
            defaultOpen={false}
            badge={`${systemDesign.dataModel.length} tables`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {systemDesign.dataModel.map((table, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-2.5 py-1.5 bg-gray-50 border-b border-gray-200">
                    <span className="text-[10px] font-semibold text-gray-700 font-mono">{table.table}</span>
                  </div>
                  <div className="p-2 max-h-28 overflow-y-auto">
                    {table.fields && table.fields.slice(0, 5).map((field, j) => (
                      <div key={j} className="flex items-center gap-2 text-[9px] py-0.5">
                        <span className="font-mono text-gray-700 truncate w-20">{field.name}</span>
                        <span className="font-mono text-gray-400 truncate w-16">{field.type}</span>
                      </div>
                    ))}
                    {table.fields && table.fields.length > 5 && (
                      <span className="text-[9px] text-gray-400">+{table.fields.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Row 5: Tech Justifications - Compact grid layout */}
        {systemDesign.techJustifications && systemDesign.techJustifications.length > 0 && (
          <CollapsibleSection
            title="Why These Technologies?"
            defaultOpen={true}
            badge={`${systemDesign.techJustifications.length}`}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {systemDesign.techJustifications.map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-emerald-300 transition-colors">
                  {/* Tech name + category header */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 bg-gray-800 text-white text-[9px] font-semibold rounded truncate max-w-[90px]" title={item.tech}>
                      {item.tech}
                    </span>
                    {item.category && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[8px] font-medium rounded truncate" title={item.category}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  {/* Why - main content */}
                  <p className="text-[10px] text-gray-600 leading-snug line-clamp-3 mb-1.5" title={item.why}>
                    {item.why}
                  </p>
                  {/* Without & Alternatives - compact */}
                  <div className="flex flex-wrap gap-1.5 text-[8px]">
                    {item.without && (
                      <span className="text-gray-500 truncate max-w-full" title={`Without: ${item.without}`}>
                        <span className="font-semibold text-gray-600">Risk:</span> {item.without.length > 25 ? item.without.slice(0, 25) + '...' : item.without}
                      </span>
                    )}
                    {item.alternatives && (
                      <span className="text-emerald-600 truncate max-w-full" title={`Alternatives: ${item.alternatives}`}>
                        <span className="font-semibold">Alt:</span> {item.alternatives.length > 20 ? item.alternatives.slice(0, 20) + '...' : item.alternatives}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Row 6: Diagrams - Full width, no scrolling */}
        <div className="space-y-3">
          {/* Architecture Diagram (Mermaid) - Full width, clickable */}
          {systemDesign.diagram && (
            <div
              className="rounded-lg p-3 bg-gray-50 border border-gray-200 cursor-pointer hover:border-emerald-300 transition-all group"
              onClick={() => setFlowDiagramModal(true)}
            >
              <h4 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span>Flow Diagram</span>
                <span className="text-[9px] text-gray-400 group-hover:text-emerald-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Expand
                </span>
              </h4>
              <div className="w-full">
                <MermaidDiagram chart={systemDesign.diagram} />
              </div>
            </div>
          )}

          {/* Professional Diagram (Eraser.io) - Full width, clickable when has diagram */}
          <div
            className={`rounded-lg p-3 bg-gray-50 border border-gray-200 ${eraserDiagram ? 'cursor-pointer hover:border-emerald-300 group' : ''} transition-all`}
            onClick={() => eraserDiagram && setProDiagramModal(true)}
          >
            <h4 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center justify-between">
              <span>Pro Diagram</span>
              <div className="flex items-center gap-2">
                {eraserDiagram && (
                  <span className="text-[9px] text-gray-400 group-hover:text-emerald-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Expand
                  </span>
                )}
                {onGenerateEraserDiagram && !eraserDiagram && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleGenerateEraser(); }}
                    disabled={generatingEraser}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium rounded border transition-all"
                    style={{
                      background: generatingEraser ? '#f3f4f6' : '#10b981',
                      color: generatingEraser ? '#9ca3af' : 'white',
                      border: generatingEraser ? '1px solid #e5e7eb' : '1px solid #10b981',
                    }}
                  >
                    {generatingEraser ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                        Generate
                      </>
                    )}
                  </button>
                )}
              </div>
            </h4>

            {eraserDiagram ? (
              <div className="w-full">
                {imageError ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-[11px] text-gray-600 mb-2">Failed to load diagram image</p>
                    <p className="text-[10px] text-gray-400 mb-2 break-all">URL: {eraserDiagram.imageUrl?.substring(0, 100)}...</p>
                    {eraserDiagram.editUrl && (
                      <a
                        href={eraserDiagram.editUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium rounded bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      >
                        View on Eraser.io
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img
                      src={eraserDiagram.imageUrl}
                      alt="Architecture Diagram"
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('Eraser image failed to load:', eraserDiagram.imageUrl);
                        setImageError(true);
                      }}
                    />
                  </div>
                )}
                {!imageError && eraserDiagram.editUrl && (
                  <a
                    href={eraserDiagram.editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium rounded bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Edit on Eraser.io
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <p className="text-[10px]">Click Generate for professional diagram</p>
              </div>
            )}
          </div>
        </div>

        {/* Flow Diagram Modal */}
        <DiagramModal
          isOpen={flowDiagramModal}
          onClose={() => setFlowDiagramModal(false)}
          title="Flow Diagram"
        >
          <div className="w-full h-full overflow-auto flex items-start justify-center p-4">
            <MermaidDiagram chart={systemDesign.diagram} expanded={true} />
          </div>
        </DiagramModal>

        {/* Pro Diagram Modal */}
        <DiagramModal
          isOpen={proDiagramModal}
          onClose={() => setProDiagramModal(false)}
          title="Pro Diagram"
        >
          {eraserDiagram && (
            <div className="max-w-full max-h-full">
              <img
                src={eraserDiagram.imageUrl}
                alt="Architecture Diagram"
                className="max-w-full max-h-[80vh] object-contain"
              />
              {eraserDiagram.editUrl && (
                <div className="mt-4 text-center">
                  <a
                    href={eraserDiagram.editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Edit on Eraser.io
                  </a>
                </div>
              )}
            </div>
          )}
        </DiagramModal>
      </div>
    </div>
  );
}
