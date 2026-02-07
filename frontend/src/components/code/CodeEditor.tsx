import { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useAppStore } from '../../store/appStore';

interface CodeEditorProps {
  onLineHover?: (lineNumber: number | null) => void;
}

export function CodeEditor({ onLineHover }: CodeEditorProps) {
  const { result, theme, highlightedLine } = useAppStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;

    // Add mouse move listener for line hover
    editor.onMouseMove((e) => {
      if (e.target.position) {
        onLineHover?.(e.target.position.lineNumber);
      }
    });

    editor.onMouseLeave(() => {
      onLineHover?.(null);
    });
  };

  // Update line highlighting
  useEffect(() => {
    if (!editorRef.current) return;

    // Clear previous decorations
    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      highlightedLine
        ? [
            {
              range: {
                startLineNumber: highlightedLine,
                startColumn: 1,
                endLineNumber: highlightedLine,
                endColumn: 1,
              },
              options: {
                isWholeLine: true,
                className: 'highlighted-line',
                glyphMarginClassName: 'highlighted-glyph',
              },
            },
          ]
        : []
    );
  }, [highlightedLine]);

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <p className="text-lg font-medium">Solution will appear here</p>
          <p className="text-sm mt-1">Enter a problem and click Analyze</p>
        </div>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language="python"
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      value={result.code}
      onMount={handleEditorMount}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 10,
        renderLineHighlight: 'none',
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
        padding: { top: 16 },
      }}
    />
  );
}
