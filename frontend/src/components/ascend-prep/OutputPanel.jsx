import { useState, useCallback, Component } from 'react';

// Markdown renderer that handles code blocks, headers, lists, and inline formatting
function renderMarkdown(text) {
  if (!text) return null;

  const elements = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block (triple backticks)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim() || 'code';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={`code-${elements.length}`} className="prep-code-block my-3">
          <div className="prep-code-header">
            <span className="prep-code-lang">{lang}</span>
          </div>
          <pre className="prep-code-content">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      i++; // Skip closing ```
      continue;
    }

    // Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // Headers - book-style hierarchy
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-semibold mt-4 mb-2" style={{ color: '#374151' }}>
          {processInlineJsx(trimmed.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-semibold mt-5 mb-2" style={{ color: '#1e40af' }}>
          {processInlineJsx(trimmed.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <div key={`h2-${i}`} className="prep-section-heading mt-6 mb-3">
          <span className="text-lg font-bold" style={{ color: '#111827' }}>{processInlineJsx(trimmed.slice(2))}</span>
          <div className="prep-section-heading-line" />
        </div>
      );
      i++;
      continue;
    }

    // Bullet list - tree-style
    if (trimmed.match(/^[-*•]\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].trim().match(/^[-*•]\s+/)) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${elements.length}`} className="prep-markdown my-2">
          {listItems.map((item, j) => (
            <li key={j} className="relative pl-5 py-1 text-sm" style={{ color: 'var(--content-text)' }}>
              <span className="absolute left-1 top-[11px] w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
              <span dangerouslySetInnerHTML={{ __html: processInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (trimmed.match(/^\d+\.\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 space-y-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--content-text)' }}>
              <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: '#eff6ff', color: '#1e40af' }}>{j + 1}</span>
              <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: processInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--content-text)' }} dangerouslySetInnerHTML={{ __html: processInline(trimmed) }} />
    );
    i++;
  }

  return elements;
}

// Process inline markdown returning plain JSX (no dangerouslySetInnerHTML)
function processInlineJsx(str) {
  if (!str) return '';
  // For headers we just return the text - no HTML injection needed
  return str;
}

// Process inline markdown (bold, italic, code, links)
function processInline(str) {
  if (!str) return '';
  // Escape HTML entities first to prevent XSS
  str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Bold: **text** or __text__
  str = str.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #047857;">$1</strong>');
  str = str.replace(/__(.+?)__/g, '<strong style="color: #047857;">$1</strong>');
  // Italic: *text* or _text_
  str = str.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  str = str.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
  // Inline code: `text`
  str = str.replace(/`([^`]+)`/g, '<code style="padding: 2px 6px; background: #f1f5f9; border-radius: 4px; color: #0369a1; font-size: 12px; font-family: Monaco, Consolas, monospace;">$1</code>');
  return str;
}

// Error boundary to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('OutputPanel Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-2">Failed to render content</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1 bg-emerald-500 text-white rounded text-sm landing-body"
          >
            Try Again
          </button>
          <pre className="mt-2 text-xs text-left bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Safe array helper - ensures we always have an array with valid objects
const safeArray = (arr) => Array.isArray(arr) ? arr.filter(item => item != null && typeof item !== 'undefined') : [];

// Safe string helper - handles strings, arrays, and other types
const safeStr = (val) => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.filter(v => v != null).map(v => String(v)).join('\n');
  if (val == null) return '';
  return String(val);
};

// Safe property access helper for potentially undefined objects
const safeProp = (obj, prop, defaultVal = '') => {
  if (!obj || typeof obj !== 'object') return defaultVal;
  const val = obj[prop];
  return val != null ? val : defaultVal;
};

// Color palette using explicit dark text for light backgrounds
const colors = {
  bg: 'var(--content-bg)',
  paper: 'var(--content-bg-secondary)',
  accent: 'var(--accent-green)',
  accentLight: 'var(--accent-green-bg)',
  text: 'var(--content-text)',
  textMuted: 'var(--content-text-secondary)',
  textLight: 'var(--content-text-muted)',
  border: 'var(--content-border)',
};

// JD is now displayed in a dedicated popup - removed from section pages

export default function OutputPanel({ section, content, streamingContent, isGenerating, onRegenerate, onGenerate, hasInputs, jobDescription }) {
  const [copied, setCopied] = useState(false);
  const [failedDiagrams, setFailedDiagrams] = useState({});

  // Handle diagram image load error - fall back to ASCII
  const handleDiagramError = useCallback((questionIndex) => {
    setFailedDiagrams(prev => ({ ...prev, [questionIndex]: true }));
  }, []);

  const handleCopy = async () => {
    try {
      let text = typeof content === 'string' ? content : content?.rawContent || JSON.stringify(content, null, 2);
      // Clean up: trim and remove excessive newlines
      text = text.trim().replace(/\n{3,}/g, '\n\n');
      if (window.electronAPI?.copyToClipboard) {
        window.electronAPI.copyToClipboard(text);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Parse content if it's a JSON string or has rawContent that's JSON
  const parsedContent = (() => {
    if (!content) return content;

    // Helper to try parsing a string as JSON - with repair for common LLM issues
    const tryParseJSON = (str) => {
      if (typeof str !== 'string') return null;
      let trimmed = str.trim();

      // Try direct parse first
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Try to repair common JSON issues from LLM output
        try {
          // Extract JSON object
          const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return null;

          let jsonStr = jsonMatch[0];

          // Fix common issues:
          // 1. Remove trailing commas before ] or }
          jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

          // 2. Find the last valid JSON structure by tracking depth
          let depth = 0;
          let lastValidEnd = 0;
          let inString = false;
          let escape = false;

          for (let i = 0; i < jsonStr.length; i++) {
            const char = jsonStr[i];
            if (escape) { escape = false; continue; }
            if (char === '\\') { escape = true; continue; }
            if (char === '"') { inString = !inString; continue; }
            if (inString) continue;

            if (char === '{' || char === '[') depth++;
            if (char === '}' || char === ']') {
              depth--;
              if (depth === 0) lastValidEnd = i + 1;
            }
          }

          // If we found a complete JSON structure, use it
          if (lastValidEnd > 0) {
            jsonStr = jsonStr.substring(0, lastValidEnd);
            try {
              return JSON.parse(jsonStr);
            } catch (e3) {
              // Still failed, try more aggressive repair
            }
          }

          // More aggressive repair: find array cutoff points and close them
          // This handles cases where the array was cut off mid-element
          let repairedJson = jsonStr;

          // Close unclosed strings
          const quoteCount = (repairedJson.match(/"/g) || []).length;
          if (quoteCount % 2 !== 0) {
            // Find the last quote and truncate after it, or add closing quote
            const lastQuote = repairedJson.lastIndexOf('"');
            if (lastQuote > 0) {
              // Check if this is a value that needs closing
              const afterQuote = repairedJson.substring(lastQuote + 1);
              if (!afterQuote.match(/^\s*[,}\]]/)) {
                repairedJson = repairedJson.substring(0, lastQuote + 1);
              }
            }
          }

          // Close unclosed brackets/braces
          let openBraces = 0, openBrackets = 0;
          inString = false;
          escape = false;
          for (let i = 0; i < repairedJson.length; i++) {
            const char = repairedJson[i];
            if (escape) { escape = false; continue; }
            if (char === '\\') { escape = true; continue; }
            if (char === '"') { inString = !inString; continue; }
            if (inString) continue;
            if (char === '{') openBraces++;
            if (char === '}') openBraces--;
            if (char === '[') openBrackets++;
            if (char === ']') openBrackets--;
          }

          // Remove trailing incomplete elements (after last comma)
          repairedJson = repairedJson.replace(/,\s*[^,}\]]*$/, '');

          // Add closing brackets/braces
          while (openBrackets > 0) { repairedJson += ']'; openBrackets--; }
          while (openBraces > 0) { repairedJson += '}'; openBraces--; }

          return JSON.parse(repairedJson);
        } catch (e2) {
          console.error('[OutputPanel] JSON repair failed:', e2.message);
          return null;
        }
      }
    };

    // If content is an object with rawContent, try to parse it as JSON
    if (typeof content === 'object' && content !== null) {
      if (content.rawContent) {
        console.log('[OutputPanel] rawContent type:', typeof content.rawContent);
        console.log('[OutputPanel] rawContent first 100 chars:', String(content.rawContent).substring(0, 100));
        console.log('[OutputPanel] rawContent starts with {:', String(content.rawContent).trim().startsWith('{'));
        console.log('[OutputPanel] rawContent length:', String(content.rawContent).length);
        // Log the area around position 11126 where the error typically occurs
        const raw = String(content.rawContent);
        if (raw.length > 11100) {
          console.log('[OutputPanel] Content around error position 11126:', JSON.stringify(raw.substring(11100, 11150)));
        }

        const parsed = tryParseJSON(content.rawContent);
        if (parsed) {
          console.log('[OutputPanel] Parsed rawContent as JSON, keys:', Object.keys(parsed));
          return parsed;
        }
        // rawContent exists but isn't valid JSON - try extracting JSON manually
        console.log('[OutputPanel] Direct parse failed, trying to extract JSON...');
        const rawStr = String(content.rawContent);
        const jsonMatch = rawStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extracted = JSON.parse(jsonMatch[0]);
            console.log('[OutputPanel] Extracted JSON successfully, keys:', Object.keys(extracted));
            return extracted;
          } catch (e) {
            console.error('[OutputPanel] Extract JSON failed:', e.message);
          }
        }
        console.log('[OutputPanel] rawContent is not valid JSON');
      }
      return content;
    }

    // If content is a string, try to parse it
    if (typeof content === 'string') {
      const parsed = tryParseJSON(content);
      if (parsed) {
        console.log('[OutputPanel] Parsed string content as JSON');
        return parsed;
      }
    }

    return content;
  })();

  const displayContent = isGenerating ? streamingContent : parsedContent;

  return (
    <div className="h-full flex flex-col overflow-hidden landing-root" style={{ background: colors.bg }}>
      {/* Minimal Header */}
      <div className="px-5 py-2.5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: colors.text }}>{section?.name}</span>
          {isGenerating && (
            <div className="flex items-center gap-2" style={{ color: colors.accent }}>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Generating...</span>
            </div>
          )}
        </div>
        {content && !isGenerating && (
          <div className="flex items-center gap-3">
            <button onClick={handleCopy} className="text-xs px-2 py-1 rounded hover:bg-black/5" style={{ color: colors.textLight }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onRegenerate} className="text-xs px-2 py-1 rounded hover:bg-black/5" style={{ color: colors.accent }}>
              Regenerate
            </button>
          </div>
        )}
      </div>



      {/* Content Area - Fit to Page */}
      <div className="flex-1 overflow-auto p-4">
        <ErrorBoundary>
        {!displayContent && !isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: colors.textLight }}>{section?.description}</p>
              {hasInputs ? (
                <button onClick={onGenerate} className="px-5 py-2 rounded text-sm font-medium text-white landing-body" style={{ background: colors.accent }}>
                  Generate
                </button>
              ) : (
                <p className="text-xs" style={{ color: colors.textLight }}>Add JD & Resume first</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg p-5" style={{ background: colors.paper, border: `1px solid ${colors.border}` }}>
            {typeof displayContent === 'string' ? (
              <div className="text-sm leading-relaxed" style={{ color: colors.text }}>
                {/* Check if streaming content looks like JSON - show cleaner loading state */}
                {isGenerating && displayContent.trim().startsWith('{') ? (
                  <div className="flex items-center gap-3 py-8">
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }} />
                    <span style={{ color: colors.textMuted }}>Generating detailed content...</span>
                  </div>
                ) : (
                  <>
                    {renderMarkdown(displayContent)}
                    {isGenerating && <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: colors.accent }} />}
                  </>
                )}
              </div>
            ) : displayContent && typeof displayContent === 'object' ? (
              <div className="space-y-4 text-sm" style={{ color: colors.text, lineHeight: '1.6' }}>
                {/* Summary - Book chapter intro */}
                {displayContent.summary?.trim() && (
                  <div className="prep-chapter-intro">{displayContent.summary?.trim()}</div>
                )}

                {/* Pitch Sections - Modern Numbered Paragraphs */}
                {safeArray(displayContent.pitchSections).length > 0 && (
                  <div className="space-y-3">
                    {safeArray(displayContent.pitchSections).filter(section => section && typeof section === 'object').map((section, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#10b981', color: 'white', boxShadow: '0 2px 4px rgba(16,185,129,0.3)' }}>{i + 1}</span>
                        <div className="flex-1 pt-0.5">
                          {safeArray(section?.bullets).length > 0 && (
                            <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                              {safeArray(section.bullets).filter(b => b != null).map((bullet, j) => (
                                <span key={j}>
                                  {j === 0 ? <strong style={{ color: '#1e40af' }}>{String(bullet).split(' ').slice(0, 3).join(' ')}</strong> : null}
                                  {j === 0 ? ' ' + String(bullet).split(' ').slice(3).join(' ') : String(bullet)}
                                  {j < section.bullets.length - 1 ? ' ' : ''}
                                </span>
                              ))}
                            </p>
                          )}
                          {section?.duration && (
                            <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded" style={{ background: '#f1f5f9', color: '#64748b' }}>{section.duration}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legacy: Pitch Paragraphs fallback */}
                {safeArray(displayContent.pitchParagraphs).length > 0 && !displayContent.pitchSections && (
                  <div className="pl-3 space-y-3" style={{ borderLeft: `3px solid ${colors.accent}` }}>
                    {safeArray(displayContent.pitchParagraphs).filter(p => p != null && (typeof p !== 'string' || p.trim?.())).map((p, i) => (
                      <p key={i}>{typeof p === 'string' ? p.trim() : String(p)}</p>
                    ))}
                  </div>
                )}

                {/* Old pitch fallback */}
                {displayContent.pitch && !displayContent.pitchParagraphs && !displayContent.pitchSections && (
                  <div className="pl-3" style={{ borderLeft: `3px solid ${colors.accent}` }}>
                    <p>{displayContent.pitch?.trim()}</p>
                  </div>
                )}

                {/* Key Talking Points - inline */}
                {safeArray(displayContent.talkingPoints).length > 0 && (
                  <p>
                    <span className="font-semibold" style={{ color: colors.accent }}>Key Points: </span>
                    {safeArray(displayContent.talkingPoints).filter(p => p != null && (typeof p !== 'string' || p.trim?.())).map(p => String(p)).join(' • ')}
                  </p>
                )}

                {/* Tips */}
                {displayContent.tips?.trim() && (
                  <div className="px-3 py-2 rounded" style={{ background: colors.accentLight }}>
                    <span className="font-semibold" style={{ color: colors.accent }}>Tip: </span>
                    {displayContent.tips?.trim()}
                  </div>
                )}

                {/* Tech Stack - table style */}
                {safeArray(displayContent.techStack).length > 0 && (
                  <div className="mb-4">
                    <div className="prep-section-heading">
                      <span className="prep-section-heading-text">Tech Stack Overview</span>
                      <div className="prep-section-heading-line" />
                    </div>
                    <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                      <div className="grid grid-cols-4 gap-0 text-xs">
                        <span className="font-semibold p-2.5" style={{ color: '#374151', background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>Technology</span>
                        <span className="font-semibold p-2.5" style={{ color: '#374151', background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>Category</span>
                        <span className="font-semibold p-2.5" style={{ color: '#374151', background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>Experience</span>
                        <span className="font-semibold p-2.5" style={{ color: '#374151', background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>Relevance</span>
                        {safeArray(displayContent.techStack).filter(t => t && typeof t === 'object').map((t, i) => (
                          <div key={i} className="contents">
                            <span className="p-2.5 font-medium" style={{ color: '#10b981', borderBottom: `1px solid ${colors.border}` }}>{t?.technology || ''}</span>
                            <span className="p-2.5" style={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{t?.category || ''}</span>
                            <span className="p-2.5" style={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{t?.experience || ''}</span>
                            <span className="p-2.5" style={{ color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{t?.relevance || ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions - handles both simple and complex (coding/system-design) formats */}
                {safeArray(displayContent.questions).length > 0 && (
                  <div className="space-y-5">
                    {safeArray(displayContent.questions).filter(q => q && (q.question?.trim?.() || q.title?.trim?.())).map((q, i) => (
                      <div key={i} className="prep-question-item">
                        {/* Question/Title with number badge */}
                        <div className="flex items-start gap-3 mb-2">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#eff6ff', color: '#1e40af' }}>{i + 1}</span>
                          <p className="prep-question-text flex-1" style={{ marginBottom: 0 }}>
                            {(q.title || q.question)?.trim()}
                          </p>
                        </div>

                        {/* Difficulty & Frequency */}
                        {(q.difficulty || q.frequency) && (
                          <div className="flex items-center gap-2 mb-3 ml-10">
                            {q.difficulty && (
                              <span className={`prep-difficulty-badge ${q.difficulty.toLowerCase() === 'hard' ? 'hard' : q.difficulty.toLowerCase() === 'medium' ? 'medium' : 'easy'}`}>{q.difficulty}</span>
                            )}
                            {q.frequency && <span className="text-xs" style={{ color: colors.textMuted }}>{q.frequency}</span>}
                          </div>
                        )}

                        {/* Problem Statement */}
                        {q.problemStatement && (
                          <p className="mb-3 p-2 rounded bg-gray-50" style={{ color: colors.text }}>{q.problemStatement}</p>
                        )}

                        {/* Examples */}
                        {safeArray(q.examples).length > 0 && (
                          <div className="mb-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: colors.textLight }}>Examples</p>
                            {safeArray(q.examples).filter(ex => ex && typeof ex === 'object').map((ex, j) => (
                              <div key={j} className="text-xs font-mono p-2 rounded mb-1" style={{ background: '#f1f5f9' }}>
                                <span style={{ color: '#0369a1' }}>Input:</span> {ex?.input || ''}<br/>
                                <span style={{ color: '#047857' }}>Output:</span> {ex?.output || ''}
                                {ex?.explanation && <><br/><span style={{ color: colors.textMuted }}>→ {ex.explanation}</span></>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Approaches (for coding) */}
                        {safeArray(q.approaches).length > 0 && (
                          <div className="space-y-4 ml-10">
                            <div className="prep-section-heading" style={{ marginTop: '12px' }}>
                              <span className="prep-section-heading-text" style={{ color: '#047857' }}>Solutions</span>
                              <div className="prep-section-heading-line" />
                            </div>
                            {safeArray(q.approaches).filter(approach => approach && typeof approach === 'object').map((approach, j) => (
                              <div key={j} className="rounded-xl p-4" style={{ background: '#fafbfc', border: '1px solid #e5e7eb' }}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-sm" style={{ color: '#047857' }}>{approach.name}</p>
                                  <div className="flex gap-2">
                                    {approach.timeComplexity && <span className="prep-pill" style={{ background: '#ecfdf5', color: '#047857' }}>Time: {approach.timeComplexity}</span>}
                                    {approach.spaceComplexity && <span className="prep-pill" style={{ background: '#eff6ff', color: '#1e40af' }}>Space: {approach.spaceComplexity}</span>}
                                  </div>
                                </div>
                                {approach.description && <p className="mb-3 text-sm leading-relaxed" style={{ color: colors.text }}>{approach.description}</p>}

                                {/* Code */}
                                {approach.code && (
                                  <pre className="text-xs p-3 rounded-lg overflow-x-auto mb-3" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: "'Source Code Pro', Monaco, monospace" }}>
                                    {approach.code.replace(/\\n/g, '\n')}
                                  </pre>
                                )}

                                {/* Line by Line - tree style */}
                                {safeArray(approach.lineByLine).length > 0 && (
                                  <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${colors.border}` }}>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: colors.accent }}>Line-by-Line Explanation</p>
                                    <div className="prep-tree">
                                      {safeArray(approach.lineByLine).filter(line => line && typeof line === 'object').map((line, k) => (
                                        <div key={k} className="prep-tree-item" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                                          <div className="prep-tree-dot" style={{ width: '6px', height: '6px' }} />
                                          <code className="font-mono px-1.5 py-0.5 rounded text-xs" style={{ background: '#e2e8f0', color: '#1e40af' }}>{line?.line || ''}</code>
                                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{line?.explanation || ''}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Edge Cases */}
                        {safeArray(q.edgeCases).length > 0 && (
                          <div className="mt-4 ml-10 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)', border: '1px solid #fecaca' }}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ background: '#fee2e2', color: '#b91c1c' }}>!</span>
                              <p className="font-semibold text-xs uppercase tracking-wide" style={{ color: '#B91C1C' }}>Edge Cases</p>
                            </div>
                            {safeArray(q.edgeCases).filter(edge => edge && typeof edge === 'object').map((edge, j) => (
                              <div key={j} className="mb-3 last:mb-0">
                                <p className="text-sm"><span className="font-semibold" style={{ color: '#b91c1c' }}>{edge?.case || ''}:</span> <span style={{ color: '#374151' }}>{edge?.explanation || ''}</span></p>
                                <div className="font-mono text-xs mt-1 px-2 py-1 rounded" style={{ background: '#fff1f2', color: '#6B7280' }}>
                                  Input: {edge?.input || ''} &rarr; Output: {edge?.expectedOutput || ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Common Mistakes */}
                        {safeArray(q.commonMistakes).length > 0 && (
                          <div className="mt-3 ml-10">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: '#DC2626' }}>Common Mistakes to Avoid</p>
                            {safeArray(q.commonMistakes).filter(m => m != null).map((m, j) => (
                              <div key={j} className="flex items-start gap-2 mb-1">
                                <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs mt-0.5" style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '9px' }}>!</span>
                                <span className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>{String(m)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {safeArray(q.followUpQuestions).length > 0 && (
                          <div className="mt-3 ml-10 pt-3" style={{ borderTop: `1px dashed ${colors.border}` }}>
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.accent }}>Follow-up Questions</p>
                            {safeArray(q.followUpQuestions).filter(f => f != null).map((f, j) => (
                              <div key={j} className="flex items-start gap-2 mb-1.5">
                                <span className="text-xs mt-0.5" style={{ color: colors.accent }}>&#8627;</span>
                                <span className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>{String(f)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Requirements (System Design) */}
                        {q.requirements && typeof q.requirements === 'object' && (
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            {safeArray(q.requirements.functional).length > 0 && (
                              <div>
                                <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: '#047857' }}>Functional</p>
                                {safeArray(q.requirements.functional).filter(r => r != null).map((r, j) => (
                                  <p key={j} className="text-xs" style={{ color: colors.text }}>✓ {String(r)}</p>
                                ))}
                              </div>
                            )}
                            {safeArray(q.requirements.nonFunctional).length > 0 && (
                              <div>
                                <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: '#10b981' }}>Non-Functional</p>
                                {safeArray(q.requirements.nonFunctional).filter(r => r != null).map((r, j) => (
                                  <p key={j} className="text-xs" style={{ color: colors.text }}>✓ {String(r)}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Capacity Estimation */}
                        {q.capacityEstimation && typeof q.capacityEstimation === 'object' && (
                          <div className="mt-3 p-3 rounded" style={{ background: '#F0FDF4' }}>
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#047857' }}>Capacity Estimation</p>
                            {safeArray(q.capacityEstimation.calculations).filter(calc => calc && typeof calc === 'object').map((calc, j) => (
                              <p key={j} className="text-xs font-mono">{calc?.metric || ''}: {calc?.result || ''}</p>
                            ))}
                          </div>
                        )}

                        {/* Architecture Diagram - Image or Description */}
                        {(q.diagramBase64 || q.diagramUrl || q.architecture?.diagramDescription || q.architecture?.asciiDiagram) && (
                          <div className="mt-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.accent }}>Architecture Diagram</p>
                            {(q.diagramBase64 || q.diagramUrl) && !failedDiagrams[i] ? (
                              <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                                <img
                                  src={q.diagramBase64 || q.diagramUrl}
                                  alt={`Architecture diagram for ${q.title || 'system design'}`}
                                  className="w-full"
                                  style={{ background: '#ffffff' }}
                                  onError={() => !q.diagramBase64 && handleDiagramError(i)}
                                />
                                {q.diagramBase64 && (
                                  <p className="text-xs p-2 flex items-center gap-1" style={{ background: '#f0fdf4', color: '#15803d' }}>
                                    <span>✓</span> Cached locally
                                  </p>
                                )}
                                {q.diagramDescription && (
                                  <p className="text-xs p-2 bg-gray-50" style={{ color: colors.textMuted }}>{q.diagramDescription}</p>
                                )}
                              </div>
                            ) : q.architecture?.asciiDiagram ? (
                              <pre className="text-xs p-3 rounded overflow-x-auto" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: "'Source Code Pro', Monaco, monospace", lineHeight: '1.3' }}>
                                {q.architecture.asciiDiagram.replace(/\\n/g, '\n')}
                              </pre>
                            ) : q.architecture?.diagramDescription ? (
                              <div className="p-3 rounded" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                                <p className="text-sm italic" style={{ color: '#1D4ED8' }}>
                                  📊 {q.architecture.diagramDescription}
                                </p>
                                {failedDiagrams[i] && (
                                  <p className="text-xs mt-1" style={{ color: '#DC2626' }}>(Diagram expired - regenerate section to create new diagram)</p>
                                )}
                              </div>
                            ) : failedDiagrams[i] ? (
                              <div className="p-3 rounded" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                <p className="text-xs" style={{ color: '#DC2626' }}>Diagram expired - regenerate this section to create a new diagram</p>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Components - tree structure */}
                        {safeArray(q.architecture?.components).length > 0 && (
                          <div className="mt-4 ml-10">
                            <div className="prep-section-heading" style={{ marginTop: 0 }}>
                              <span className="prep-section-heading-text" style={{ color: colors.accent }}>System Components</span>
                              <div className="prep-section-heading-line" />
                            </div>
                            <div className="prep-tree">
                              {safeArray(q.architecture.components).filter(comp => comp && typeof comp === 'object').map((comp, j) => (
                                <div key={j} className="prep-tree-item">
                                  <div className="prep-tree-dot" />
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="prep-tree-item-title" style={{ marginBottom: 0 }}>{comp?.name || ''}</span>
                                    {comp?.technology && <span className="prep-pill" style={{ background: '#e0e7ff', color: '#3730a3' }}>{comp.technology}</span>}
                                  </div>
                                  {comp?.responsibility && <p className="prep-tree-item-desc mt-1">{comp.responsibility}</p>}
                                  {comp?.whyThisChoice && <p className="text-xs italic mt-1" style={{ color: colors.textLight }}>Why: {comp.whyThisChoice}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trade-offs */}
                        {safeArray(q.tradeOffs).length > 0 && (
                          <div className="mt-4 ml-10">
                            <div className="prep-section-heading" style={{ marginTop: 0 }}>
                              <span className="prep-section-heading-text" style={{ color: '#DC2626' }}>Trade-offs</span>
                              <div className="prep-section-heading-line" />
                            </div>
                            {safeArray(q.tradeOffs).filter(t => t && typeof t === 'object').map((t, j) => (
                              <div key={j} className="prep-antipattern" style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', borderColor: '#fde68a' }}>
                                <p className="prep-antipattern-title" style={{ color: '#92400e' }}>{t?.decision || ''}</p>
                                <div className="prep-antipattern-row">
                                  <span className="prep-antipattern-label" style={{ color: '#047857' }}>Chose:</span>
                                  <span style={{ color: '#374151' }}>{t?.chose || ''} &mdash; {t?.reason || ''}</span>
                                </div>
                                {t?.alternative && (
                                  <div className="prep-antipattern-row">
                                    <span className="prep-antipattern-label" style={{ color: '#6b7280' }}>Alternative:</span>
                                    <span style={{ color: '#6b7280' }}>{t.alternative}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Simple answer/approach for basic questions */}
                        {(q.answer || q.suggestedAnswer) && !q.approaches && (
                          <div className="mt-2" style={{ color: colors.text }}>
                            {renderMarkdown((q.answer || q.suggestedAnswer)?.trim())}
                          </div>
                        )}
                        {q.approach && !q.approaches && (
                          <p className="mt-1"><span className="font-semibold" style={{ color: colors.accent }}>Approach: </span>{q.approach?.trim()}</p>
                        )}
                        {q.keyConsiderations?.length > 0 && (
                          <p className="mt-1"><span className="font-semibold" style={{ color: colors.accent }}>Consider: </span>{q.keyConsiderations.join(' | ')}</p>
                        )}

                        {/* Behavioral Question Context */}
                        {(q.whyThisCompanyAsks || q.companyValue || q.companyConnection) && (
                          <div className="mt-2 mb-2 p-2 rounded text-xs" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                            {q.companyValue && <p><span className="font-semibold" style={{ color: '#1D4ED8' }}>Tests:</span> {q.companyValue}</p>}
                            {q.whyThisCompanyAsks && <p><span className="font-semibold" style={{ color: '#1D4ED8' }}>Why Asked:</span> {q.whyThisCompanyAsks}</p>}
                            {q.companyConnection && <p className="mt-1 italic" style={{ color: '#047857' }}>Connect to: {q.companyConnection}</p>}
                          </div>
                        )}

                        {/* STAR Format - Enterprise Display */}
                        {(q.situation || q.task || q.action || q.result) && (
                          <div className="prep-star-section mt-4">
                            {q.category && (
                              <span className="prep-content-card-badge info mb-3">{q.category}</span>
                            )}
                            <div className="space-y-3">
                              {q.situation && (
                                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                  <div className="prep-star-label situation">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                    Situation
                                  </div>
                                  <p className="text-sm leading-relaxed" style={{ color: '#166534' }}>{safeStr(q.situation).trim()}</p>
                                </div>
                              )}
                              {q.task && (
                                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                  <div className="prep-star-label task">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                    Task
                                  </div>
                                  <p className="text-sm leading-relaxed" style={{ color: '#1e40af' }}>{safeStr(q.task).trim()}</p>
                                </div>
                              )}
                              {q.action && (
                                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                  <div className="prep-star-label action">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                    Action
                                  </div>
                                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#92400e' }}>{safeStr(q.action).trim()}</p>
                                </div>
                              )}
                              {q.result && (
                                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                  <div className="prep-star-label result">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Result
                                  </div>
                                  <p className="text-sm leading-relaxed" style={{ color: '#059669' }}>{safeStr(q.result).trim()}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {q.tips && <p className="mt-2 p-2 rounded italic text-xs bg-gray-50" style={{ color: colors.accent }}>💡 {safeStr(q.tips).trim()}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Topics - handles both string array and object array */}
                {safeArray(displayContent.keyTopics).length > 0 && (
                  <div className="mb-4">
                    <div className="prep-section-heading">
                      <span className="prep-section-heading-text">Key Topics to Focus On</span>
                      <div className="prep-section-heading-line" />
                    </div>
                    {typeof safeArray(displayContent.keyTopics)[0] === 'string' ? (
                      <div className="flex flex-wrap">
                        {safeArray(displayContent.keyTopics).filter(t => typeof t === 'string' && t.trim?.()).map((t, i) => (
                          <span key={i} className="prep-pill">{t}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="prep-tree">
                        {safeArray(displayContent.keyTopics).filter(topic => topic && typeof topic === 'object').map((topic, i) => (
                          <div key={i} className="prep-tree-item">
                            <div className="prep-tree-dot" />
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="prep-tree-item-title" style={{ marginBottom: 0 }}>{topic?.topic || ''}</span>
                              {topic?.frequency && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: topic.frequency === 'Very High' ? '#FEE2E2' : '#E0E7FF', color: topic.frequency === 'Very High' ? '#B91C1C' : '#3730A3' }}>{topic.frequency}</span>
                              )}
                            </div>
                            {topic?.whyImportant && <p className="prep-tree-item-desc mt-1">{topic.whyImportant}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Technologies (TechStack section) - Book-style chapters */}
                {safeArray(displayContent.technologies).length > 0 && (
                  <div className="space-y-6">
                    {safeArray(displayContent.technologies).filter(tech => tech && typeof tech === 'object').map((tech, i) => (
                      <div key={i} className="prep-tech-chapter">
                        {/* Chapter Header */}
                        <div className="prep-tech-chapter-header">
                          <div className="prep-tech-chapter-icon">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="prep-tech-chapter-title">{tech.name}</span>
                            {tech.importance && (
                              <span className={`prep-difficulty-badge ${tech.importance === 'high' || tech.importance === 'critical' ? 'hard' : tech.importance === 'medium' ? 'medium' : 'easy'}`}>
                                {tech.importance}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="prep-tech-chapter-body">
                          {/* Why Important - chapter description */}
                          {tech.whyImportant && (
                            <p className="prep-tech-chapter-desc">{tech.whyImportant}</p>
                          )}

                          {/* Core Concepts - Tree Structure */}
                          {safeArray(tech.conceptsToKnow).length > 0 && (
                            <div className="mb-6">
                              <div className="prep-section-heading">
                                <span className="prep-section-heading-text" style={{ color: '#10b981' }}>Core Concepts</span>
                                <div className="prep-section-heading-line" />
                              </div>
                              <div className="prep-tree">
                                {safeArray(tech.conceptsToKnow).filter(c => c && typeof c === 'object').map((c, j) => (
                                  <div key={j} className="prep-tree-item">
                                    <div className="prep-tree-dot" />
                                    <p className="prep-tree-item-title">{c?.concept || ''}</p>
                                    {c?.explanation && (
                                      <div className="prep-tree-item-desc">
                                        {renderMarkdown(String(c.explanation).replace(/\\n/g, '\n'))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Interview Questions */}
                          {safeArray(tech.questions).length > 0 && (
                            <div className="mb-6">
                              <div className="prep-section-heading">
                                <span className="prep-section-heading-text" style={{ color: '#1e40af' }}>Interview Questions</span>
                                <div className="prep-section-heading-line" />
                              </div>
                              <div className="space-y-3">
                                {safeArray(tech.questions).filter(q => q && typeof q === 'object').map((q, j) => (
                                  <div key={j} className="prep-question-item">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <p className="prep-question-text" style={{ marginBottom: 0 }}>{q?.question || ''}</p>
                                      {q?.difficulty && (
                                        <span className={`prep-difficulty-badge flex-shrink-0 ${q.difficulty.toLowerCase() === 'hard' ? 'hard' : q.difficulty.toLowerCase() === 'medium' ? 'medium' : 'easy'}`}>
                                          {q.difficulty}
                                        </span>
                                      )}
                                    </div>
                                    {q?.answer && (
                                      <div className="text-sm mt-3 leading-relaxed" style={{ color: colors.text }}>
                                        {renderMarkdown(String(q.answer).replace(/\\n/g, '\n'))}
                                      </div>
                                    )}
                                    {q?.codeExample && (
                                      <pre className="text-xs p-3 rounded-lg mt-3 overflow-x-auto" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: "'Source Code Pro', Monaco, monospace" }}>
                                        {String(q.codeExample).replace(/\\n/g, '\n')}
                                      </pre>
                                    )}
                                    {safeArray(q?.followUps).length > 0 && (
                                      <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${colors.border}` }}>
                                        <p className="text-xs font-semibold mb-1" style={{ color: colors.accent }}>Follow-up Questions:</p>
                                        {safeArray(q.followUps).filter(f => f != null).map((f, k) => (
                                          <div key={k} className="flex items-start gap-2 ml-1 mb-1">
                                            <span className="text-xs mt-0.5" style={{ color: colors.accent }}>&#8627;</span>
                                            <span className="text-xs" style={{ color: colors.textMuted }}>{String(f)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {safeArray(q?.commonMistakes).length > 0 && (
                                      <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${colors.border}` }}>
                                        <p className="text-xs font-semibold mb-1" style={{ color: '#DC2626' }}>Common Mistakes to Avoid:</p>
                                        {safeArray(q.commonMistakes).filter(m => m != null).map((m, k) => (
                                          <div key={k} className="flex items-start gap-2 ml-1 mb-1">
                                            <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '9px' }}>!</span>
                                            <span className="text-xs" style={{ color: colors.textMuted }}>{String(m)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Best Practices - Checklist style */}
                          {safeArray(tech.bestPractices).length > 0 && (
                            <div className="mb-6">
                              <div className="prep-section-heading">
                                <span className="prep-section-heading-text" style={{ color: '#047857' }}>Best Practices</span>
                                <div className="prep-section-heading-line" />
                              </div>
                              {safeArray(tech.bestPractices).filter(bp => bp && typeof bp === 'object').map((bp, j) => (
                                <div key={j} className="prep-checklist-item">
                                  <span className="prep-checklist-icon check">&#10003;</span>
                                  <div className="flex-1">
                                    <span className="text-sm font-semibold" style={{ color: '#111827' }}>{bp?.practice || ''}</span>
                                    {bp?.when && <span className="text-xs ml-1" style={{ color: colors.textMuted }}> &mdash; {bp.when}</span>}
                                    {bp?.codeExample && (
                                      <pre className="text-xs p-2.5 rounded-lg mt-2 overflow-x-auto" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: "'Source Code Pro', Monaco, monospace" }}>
                                        {String(bp.codeExample).replace(/\\n/g, '\n')}
                                      </pre>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Anti-patterns - Warning cards */}
                          {safeArray(tech.antiPatterns).length > 0 && (
                            <div className="mb-6">
                              <div className="prep-section-heading">
                                <span className="prep-section-heading-text" style={{ color: '#B91C1C' }}>Anti-Patterns to Avoid</span>
                                <div className="prep-section-heading-line" />
                              </div>
                              {safeArray(tech.antiPatterns).filter(ap => ap && typeof ap === 'object').map((ap, j) => (
                                <div key={j} className="prep-antipattern">
                                  <p className="prep-antipattern-title">{ap?.pattern || ''}</p>
                                  <div className="prep-antipattern-row">
                                    <span className="prep-antipattern-label" style={{ color: '#b91c1c' }}>Problem:</span>
                                    <span style={{ color: '#6b7280' }}>{ap?.problem || ''}</span>
                                  </div>
                                  <div className="prep-antipattern-row">
                                    <span className="prep-antipattern-label" style={{ color: '#047857' }}>Solution:</span>
                                    <span style={{ color: '#047857' }}>{ap?.solution || ''}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Performance Topics - Pill tags */}
                          {safeArray(tech.performanceTopics).length > 0 && (
                            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: colors.textLight }}>Performance Topics</p>
                              <div className="flex flex-wrap">
                                {safeArray(tech.performanceTopics).filter(t => t != null).map((t, j) => (
                                  <span key={j} className="prep-pill">{String(t)}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Company Context/Insights - handles both string and object formats */}
                {(displayContent.companyContext || displayContent.companyInsights || displayContent.companyTechContext) && (
                  <div className="mb-4 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', border: '1px solid #bfdbfe' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#dbeafe' }}>
                        <svg className="w-3.5 h-3.5" style={{ color: '#2563eb' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
                      </span>
                      <p className="font-semibold text-sm" style={{ color: '#1D4ED8' }}>Company Insights</p>
                    </div>
                    {(() => {
                      const ctx = displayContent.companyContext || displayContent.companyInsights || displayContent.companyTechContext;
                      if (typeof ctx === 'string') {
                        return <p className="text-sm">{ctx}</p>;
                      }
                      if (typeof ctx === 'object' && ctx !== null) {
                        return (
                          <div className="space-y-2 text-sm">
                            {ctx.interviewFormat && <p><span className="font-semibold">Interview Format:</span> {ctx.interviewFormat}</p>}
                            {ctx.culture && <p><span className="font-semibold">Culture:</span> {ctx.culture}</p>}
                            {ctx.culturalFit && <p><span className="font-semibold">Cultural Fit:</span> {ctx.culturalFit}</p>}
                            {safeArray(ctx.whatTheyLookFor).length > 0 && (
                              <p><span className="font-semibold">What They Look For:</span> {safeArray(ctx.whatTheyLookFor).join(', ')}</p>
                            )}
                            {safeArray(ctx.knownQuestions).length > 0 && (
                              <div>
                                <span className="font-semibold">Known Questions:</span>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {safeArray(ctx.knownQuestions).map((q, i) => <li key={i}>{String(q)}</li>)}
                                </ul>
                              </div>
                            )}
                            {safeArray(ctx.values).length > 0 && (
                              <p><span className="font-semibold">Company Values:</span> {safeArray(ctx.values).join(', ')}</p>
                            )}
                            {ctx.recentNews && <p><span className="font-semibold">Recent News:</span> {ctx.recentNews}</p>}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {/* Architecture Topics - handles both string array and object array */}
                {safeArray(displayContent.architectureTopics).length > 0 && (
                  <div className="mb-4">
                    <div className="prep-section-heading">
                      <span className="prep-section-heading-text">Architecture Topics</span>
                      <div className="prep-section-heading-line" />
                    </div>
                    {typeof safeArray(displayContent.architectureTopics)[0] === 'string' ? (
                      <div className="flex flex-wrap">
                        {safeArray(displayContent.architectureTopics).filter(t => typeof t === 'string' && t.trim?.()).map((t, i) => (
                          <span key={i} className="prep-pill">{t}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="prep-tree">
                        {safeArray(displayContent.architectureTopics).filter(topic => topic && typeof topic === 'object').map((topic, i) => (
                          <div key={i} className="prep-tree-item">
                            <div className="prep-tree-dot" />
                            <p className="prep-tree-item-title">{topic?.topic || ''}</p>
                            {topic?.relevance && <p className="prep-tree-item-desc">{topic.relevance}</p>}
                            {safeArray(topic?.keyPoints).length > 0 && (
                              <div className="flex flex-wrap mt-2">
                                {safeArray(topic.keyPoints).map((kp, j) => (
                                  <span key={j} className="prep-pill">{kp}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* System Integrations (TechStack section) */}
                {safeArray(displayContent.systemIntegrations).length > 0 && (
                  <div className="mb-4">
                    <div className="prep-section-heading">
                      <span className="prep-section-heading-text">System Integrations</span>
                      <div className="prep-section-heading-line" />
                    </div>
                    <div className="prep-tree">
                      {safeArray(displayContent.systemIntegrations).filter(int => int && typeof int === 'object').map((int, i) => (
                        <div key={i} className="prep-tree-item">
                          <div className="prep-tree-dot" />
                          <p className="prep-tree-item-title">{int?.integration || ''}</p>
                          {safeArray(int?.patterns).length > 0 && (
                            <div className="flex flex-wrap mt-1">
                              {safeArray(int.patterns).map((p, j) => (
                                <span key={j} className="prep-pill">{p}</span>
                              ))}
                            </div>
                          )}
                          {int?.codeExample && (
                            <pre className="text-xs p-2.5 rounded-lg mt-2 overflow-x-auto" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: "'Source Code Pro', Monaco, monospace" }}>
                              {String(int.codeExample).replace(/\\n/g, '\n')}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Recommendations - handles both string array and object array */}
                {safeArray(displayContent.practiceRecommendations).length > 0 && (
                  <div className="mb-4">
                    <div className="prep-section-heading">
                      <span className="prep-section-heading-text" style={{ color: '#047857' }}>Practice Recommendations</span>
                      <div className="prep-section-heading-line" />
                    </div>
                    {typeof safeArray(displayContent.practiceRecommendations)[0] === 'string' ? (
                      <div className="flex flex-wrap">
                        {safeArray(displayContent.practiceRecommendations).filter(r => typeof r === 'string' && r.trim?.()).map((r, i) => (
                          <span key={i} className="prep-pill">{r}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {safeArray(displayContent.practiceRecommendations).filter(rec => rec && typeof rec === 'object').map((rec, i) => (
                          <div key={i} className="prep-checklist-item" style={{ background: '#f0fdf4' }}>
                            <span className="prep-checklist-icon check">&#10003;</span>
                            <div className="flex-1">
                              <span className="text-sm font-semibold" style={{ color: '#047857' }}>{rec?.platform || ''}</span>
                              {safeArray(rec?.problems).length > 0 && (
                                <p className="text-xs mt-1" style={{ color: colors.text }}>{safeArray(rec.problems).join(', ')}</p>
                              )}
                              {rec?.reason && <p className="text-xs italic mt-0.5" style={{ color: colors.textMuted }}>{rec.reason}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Tips */}
                {safeArray(displayContent.interviewTips).length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1px solid #a7f3d0' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#d1fae5' }}>
                        <svg className="w-3.5 h-3.5" style={{ color: '#047857' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      </span>
                      <p className="font-semibold text-sm" style={{ color: '#047857' }}>Interview Tips</p>
                    </div>
                    {safeArray(displayContent.interviewTips).filter(tip => tip != null).map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: '#10b981' }} />
                        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{String(tip)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* General Tips (system design) */}
                {safeArray(displayContent.generalTips).length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1px solid #a7f3d0' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#d1fae5' }}>
                        <svg className="w-3.5 h-3.5" style={{ color: '#047857' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      </span>
                      <p className="font-semibold text-sm" style={{ color: '#047857' }}>Tips</p>
                    </div>
                    {safeArray(displayContent.generalTips).filter(tip => tip != null).map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: '#10b981' }} />
                        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{String(tip)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Questions to Ask */}
                {safeArray(displayContent.questionsToAsk).length > 0 && (
                  <div className="mb-4">
                    <div className="prep-section-heading">
                      <span className="prep-section-heading-text">Questions to Ask Them</span>
                      <div className="prep-section-heading-line" />
                    </div>
                    {safeArray(displayContent.questionsToAsk).filter(q => q != null && (typeof q !== 'string' || q.trim?.())).map((q, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="flex-shrink-0 text-xs mt-0.5" style={{ color: '#1e40af' }}>&#8594;</span>
                        <p className="text-sm" style={{ color: colors.text }}>{String(q)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Framework Tips */}
                {displayContent.frameworkTips?.trim() && (
                  <div className="px-3 py-2 rounded" style={{ background: colors.bg }}>
                    <span className="font-semibold" style={{ color: colors.accent }}>Framework: </span>
                    {displayContent.frameworkTips?.trim()}
                  </div>
                )}

                {/* Key Themes */}
                {safeArray(displayContent.keyThemes).length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: colors.textLight }}>Themes</p>
                    <div className="flex flex-wrap">
                      {safeArray(displayContent.keyThemes).filter(t => t != null && (typeof t !== 'string' || t.trim?.())).map((t, i) => (
                        <span key={i} className="prep-pill">{String(t)}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Content - intelligently extract and render even if JSON parsing fails */}
                {displayContent.rawContent?.trim() && (() => {
                  const raw = displayContent.rawContent.trim();

                  // Function to extract readable content from malformed JSON
                  const extractReadableContent = (str) => {
                    const sections = [];

                    // Extract summary
                    const summaryMatch = str.match(/"summary"\s*:\s*"([^"]+)"/);
                    if (summaryMatch) sections.push({ type: 'summary', content: summaryMatch[1] });

                    // Extract technologies array items
                    const techMatches = str.matchAll(/"name"\s*:\s*"([^"]+)"[^}]*"whyImportant"\s*:\s*"([^"]+)"/g);
                    for (const match of techMatches) {
                      sections.push({ type: 'tech', name: match[1], description: match[2] });
                    }

                    // Extract questions
                    const questionMatches = str.matchAll(/"question"\s*:\s*"([^"]+)"[^}]*?"answer"\s*:\s*"([^"]+)"/gs);
                    for (const match of questionMatches) {
                      sections.push({ type: 'question', question: match[1], answer: match[2] });
                    }

                    // Extract system design questions (use "title" field)
                    const sdTitleMatches = str.matchAll(/"title"\s*:\s*"([^"]+)"/g);
                    for (const match of sdTitleMatches) {
                      // Only add if it looks like a system design question
                      if (match[1].toLowerCase().includes('design') || match[1].toLowerCase().includes('system')) {
                        sections.push({ type: 'sd-question', title: match[1] });
                      }
                    }

                    // Extract architecture diagram descriptions
                    const diagramMatches = str.matchAll(/"diagramDescription"\s*:\s*"([^"]+)"/g);
                    for (const match of diagramMatches) {
                      sections.push({ type: 'diagram', description: match[1] });
                    }

                    // Extract concepts
                    const conceptMatches = str.matchAll(/"concept"\s*:\s*"([^"]+)"[^}]*"explanation"\s*:\s*"([^"]+)"/gs);
                    for (const match of conceptMatches) {
                      sections.push({ type: 'concept', concept: match[1], explanation: match[2] });
                    }

                    return sections;
                  };

                  // Try to extract content even from malformed JSON
                  if (raw.startsWith('{')) {
                    const extracted = extractReadableContent(raw);
                    if (extracted.length > 0) {
                      return (
                        <div className="space-y-4">
                          {extracted.map((item, i) => {
                            if (item.type === 'summary') {
                              return <p key={i} className="pb-3" style={{ borderBottom: `1px solid ${colors.border}` }}>{item.content}</p>;
                            }
                            if (item.type === 'tech') {
                              return (
                                <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                  <span className="font-bold text-base" style={{ color: '#1e40af' }}>{item.name}</span>
                                  <p className="text-sm mt-1" style={{ color: colors.textMuted }}>{item.description}</p>
                                </div>
                              );
                            }
                            if (item.type === 'question') {
                              return (
                                <div key={i} className="pb-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
                                  <p className="font-semibold mb-1 text-base" style={{ color: '#1e40af' }}>{item.question}</p>
                                  <div className="text-sm">{renderMarkdown(item.answer.replace(/\\n/g, '\n'))}</div>
                                </div>
                              );
                            }
                            if (item.type === 'concept') {
                              return (
                                <div key={i} className="mb-3 pl-2" style={{ borderLeft: '2px solid #10b981' }}>
                                  <p className="font-semibold text-sm">{item.concept}</p>
                                  <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{renderMarkdown(item.explanation.replace(/\\n/g, '\n'))}</div>
                                </div>
                              );
                            }
                            if (item.type === 'sd-question') {
                              return (
                                <div key={i} className="p-3 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                                  <span className="font-bold text-base" style={{ color: '#166534' }}>{item.title}</span>
                                </div>
                              );
                            }
                            if (item.type === 'diagram') {
                              return (
                                <div key={i} className="p-3 rounded-lg" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
                                  <p className="text-sm" style={{ color: '#92400e' }}>{item.description}</p>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      );
                    }
                  }

                  // Final fallback: render as formatted text
                  // Clean up JSON artifacts for readable display
                  const cleanedContent = raw
                    .replace(/^\{|\}$/g, '')  // Remove outer braces
                    .replace(/"([^"]+)":/g, '\n**$1:**')  // Convert keys to bold headers
                    .replace(/","/g, '", "')  // Add spaces after commas
                    .replace(/\\n/g, '\n')  // Convert escaped newlines
                    .replace(/[\[\]{}]/g, '')  // Remove remaining brackets
                    .replace(/",?\s*$/gm, '')  // Remove trailing quotes
                    .replace(/^"/gm, '')  // Remove leading quotes
                    .trim();

                  return <div className="text-sm whitespace-pre-wrap">{renderMarkdown(cleanedContent)}</div>;
                })()}

                {/* Abbreviations - glossary style */}
                {safeArray(displayContent.abbreviations).length > 0 && (
                  <div className="mt-6 pt-4" style={{ borderTop: `2px solid ${colors.border}` }}>
                    <div className="prep-section-heading" style={{ marginTop: 0 }}>
                      <span className="prep-section-heading-text">Glossary</span>
                      <div className="prep-section-heading-line" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {safeArray(displayContent.abbreviations).filter(item => item && typeof item === 'object').map((item, i) => (
                        <div key={i} className="flex items-baseline gap-2 text-sm">
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded text-xs" style={{ background: '#f0fdf4', color: '#047857' }}>{item?.abbr || ''}</span>
                          <span style={{ color: colors.textMuted }}>{item?.full || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback - render any unhandled object structure in readable format */}
                {!displayContent.summary && !displayContent.questions && !displayContent.talkingPoints &&
                 !displayContent.pitch && !displayContent.pitchParagraphs && !displayContent.pitchSections && !displayContent.rawContent &&
                 !displayContent.technologies && !displayContent.keyTopics && !displayContent.keyThemes &&
                 !displayContent.questionsToAsk && !displayContent.tips && !displayContent.abbreviations &&
                 !displayContent.techStack && !displayContent.companyTechContext && !displayContent.systemIntegrations && (
                  <div className="space-y-4">
                    {Object.entries(displayContent).map(([key, value]) => (
                      <div key={key}>
                        <p className="font-semibold text-sm capitalize mb-2" style={{ color: '#1e40af' }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        {typeof value === 'string' ? (
                          <div className="text-sm" style={{ color: colors.text }}>{renderMarkdown(value)}</div>
                        ) : Array.isArray(value) ? (
                          <div className="space-y-2">
                            {value.map((item, idx) => (
                              <div key={idx} className="p-3 rounded bg-gray-50 border border-gray-200">
                                {typeof item === 'string' ? (
                                  <p className="text-sm">{item}</p>
                                ) : typeof item === 'object' && item ? (
                                  <div className="space-y-1">
                                    {Object.entries(item).map(([k, v]) => (
                                      <p key={k} className="text-sm">
                                        <span className="font-medium" style={{ color: colors.accent }}>{k}: </span>
                                        {typeof v === 'string' ? v : JSON.stringify(v)}
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm">{JSON.stringify(item)}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : typeof value === 'object' && value ? (
                          <div className="p-3 rounded bg-gray-50 border border-gray-200">
                            {Object.entries(value).map(([k, v]) => (
                              <p key={k} className="text-sm mb-1">
                                <span className="font-medium" style={{ color: colors.accent }}>{k}: </span>
                                {typeof v === 'string' ? v : JSON.stringify(v)}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm">{String(value)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
