import { forwardRef } from 'react';
import { Allotment } from 'allotment';
import CodeDisplay from '../CodeDisplay';
import ExplanationPanel from '../ExplanationPanel';

/**
 * Solution panel component that displays code and explanations side by side
 */
const SolutionPanel = forwardRef(function SolutionPanel(
  {
    // Solution data
    solution,
    streamingContent,
    autoRunOutput,
    highlightedLine,
    onHighlightLine,

    // Mode
    ascendMode,
    isLoading,
    loadingType,

    // Eraser diagram (system design)
    eraserDiagram,
    autoGenerateEraser,
    onAutoGenerateEraserChange,
    onGenerateEraser,

    // Follow-up
    isProcessingFollowUp,
    onFollowUp,
    currentProblem,

    // Callbacks
    onCopy,
    showCopyToast,

    // Editor settings
    editorSettings,
  },
  ref
) {
  // Determine what code to show
  const displayCode = solution?.code || streamingContent?.code;
  const displayLanguage = solution?.language || streamingContent?.language || 'python';
  const displayPitch = solution?.pitch || streamingContent?.pitch;
  const displayComplexity = solution?.complexity || streamingContent?.complexity;
  const displaySystemDesign = solution?.systemDesign || streamingContent?.systemDesign;

  const hasCode = !!displayCode;
  const hasSystemDesign = ascendMode === 'system-design' && displaySystemDesign?.included;

  // For system design, we show the design panel
  // For coding, we show code + explanation

  if (ascendMode === 'system-design') {
    return (
      <div className="flex-1 overflow-hidden">
        <Allotment vertical defaultSizes={[60, 40]}>
          {/* System Design / Code Display */}
          <Allotment.Pane minSize={200}>
            <CodeDisplay
              ref={ref}
              code={displayCode}
              language={displayLanguage}
              systemDesign={displaySystemDesign}
              mode={ascendMode}
              isLoading={isLoading}
              loadingType={loadingType}
              autoRunOutput={autoRunOutput}
              highlightedLine={highlightedLine}
              editorSettings={editorSettings}
              onCopy={onCopy}
              showCopyToast={showCopyToast}
            />
          </Allotment.Pane>

          {/* Eraser Diagram Panel (System Design only) */}
          {hasSystemDesign && (
            <Allotment.Pane minSize={150}>
              <div className="h-full bg-gray-800 border-t border-gray-700 p-4 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Architecture Diagram</h3>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={autoGenerateEraser}
                        onChange={(e) => onAutoGenerateEraserChange(e.target.checked)}
                        className="rounded bg-gray-700 border-gray-600"
                      />
                      Auto-generate
                    </label>
                    {!eraserDiagram && (
                      <button
                        onClick={onGenerateEraser}
                        className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors"
                      >
                        Generate Diagram
                      </button>
                    )}
                  </div>
                </div>

                {eraserDiagram ? (
                  <div className="space-y-3">
                    <img
                      src={eraserDiagram.imageUrl}
                      alt="System Architecture"
                      className="w-full rounded-lg border border-gray-600"
                    />
                    <a
                      href={eraserDiagram.editUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors"
                    >
                      Edit in Eraser.io
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500 border border-dashed border-gray-600 rounded-lg">
                    <p>Generate a diagram to visualize the architecture</p>
                  </div>
                )}
              </div>
            </Allotment.Pane>
          )}
        </Allotment>
      </div>
    );
  }

  // Coding mode: Code + Explanation side by side
  return (
    <div className="flex-1 overflow-hidden">
      <Allotment defaultSizes={[60, 40]}>
        {/* Code Display */}
        <Allotment.Pane minSize={300}>
          <CodeDisplay
            ref={ref}
            code={displayCode}
            language={displayLanguage}
            isLoading={isLoading}
            loadingType={loadingType}
            autoRunOutput={autoRunOutput}
            highlightedLine={highlightedLine}
            editorSettings={editorSettings}
            onCopy={onCopy}
            showCopyToast={showCopyToast}
          />
        </Allotment.Pane>

        {/* Explanation Panel */}
        <Allotment.Pane minSize={250}>
          <ExplanationPanel
            pitch={displayPitch}
            complexity={displayComplexity}
            explanations={solution?.explanations}
            highlightedLine={highlightedLine}
            onHighlightLine={onHighlightLine}
            isLoading={isLoading}
            isProcessingFollowUp={isProcessingFollowUp}
            onFollowUp={onFollowUp}
            problem={currentProblem}
            code={displayCode}
          />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
});

export default SolutionPanel;
