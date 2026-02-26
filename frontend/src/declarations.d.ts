// Type declarations for modules without TypeScript support

// Allow importing JSX files without type declarations
declare module '*.jsx' {
  import * as React from 'react';
  const Component: React.FC<unknown>;
  export default Component;
}

declare module './App' {
  import * as React from 'react';
  const App: React.FC;
  export default App;
}

declare module 'framer-motion' {
  import * as React from 'react';

  export interface MotionProps {
    initial?: object;
    animate?: object;
    exit?: object;
    transition?: object;
    variants?: object;
    whileHover?: object;
    whileTap?: object;
    whileFocus?: object;
    whileDrag?: object;
    whileInView?: object;
    layout?: boolean | 'position' | 'size';
    layoutId?: string;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }

  export const motion: {
    [K in keyof JSX.IntrinsicElements]: React.FC<
      MotionProps & JSX.IntrinsicElements[K]
    >;
  };

  export const AnimatePresence: React.FC<{
    children?: React.ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
  }>;
}

declare module '@monaco-editor/react' {
  import * as React from 'react';
  import type { editor } from 'monaco-editor';

  export interface EditorProps {
    value?: string;
    defaultValue?: string;
    language?: string;
    theme?: string;
    options?: editor.IStandaloneEditorConstructionOptions;
    onChange?: (value: string | undefined) => void;
    onMount?: OnMount;
    height?: string | number;
    width?: string | number;
    className?: string;
    loading?: React.ReactNode;
    line?: number;
    path?: string;
    saveViewState?: boolean;
    keepCurrentModel?: boolean;
    wrapperProps?: object;
    beforeMount?: (monaco: typeof import('monaco-editor')) => void;
    onValidate?: (markers: editor.IMarker[]) => void;
  }

  export type OnMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: typeof import('monaco-editor')
  ) => void;

  const Editor: React.FC<EditorProps>;
  export default Editor;
  export { Editor };
}

declare module 'monaco-editor' {
  export namespace editor {
    interface IEditorMouseEvent {
      target: IMouseTarget;
      event: MouseEvent;
    }

    interface IMouseTarget {
      position: IPosition | null;
      type: number;
      element: HTMLElement | null;
      detail: unknown;
      range: IRange | null;
    }

    interface IStandaloneCodeEditor {
      getValue(): string;
      setValue(value: string): void;
      getModel(): ITextModel | null;
      onDidChangeModelContent(listener: () => void): IDisposable;
      onMouseMove(listener: (e: IEditorMouseEvent) => void): IDisposable;
      onMouseLeave(listener: (e: IEditorMouseEvent) => void): IDisposable;
      deltaDecorations(oldDecorations: string[], newDecorations: IModelDeltaDecoration[]): string[];
      revealLineInCenter(lineNumber: number): void;
      getPosition(): IPosition | null;
      setPosition(position: IPosition): void;
      focus(): void;
      layout(): void;
      dispose(): void;
    }

    interface ITextModel {
      getValue(): string;
      setValue(value: string): void;
      getLineCount(): number;
      getLineContent(lineNumber: number): string;
    }

    interface IPosition {
      lineNumber: number;
      column: number;
    }

    interface IDisposable {
      dispose(): void;
    }

    interface IModelDeltaDecoration {
      range: IRange;
      options: IModelDecorationOptions;
    }

    interface IRange {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    }

    interface IModelDecorationOptions {
      isWholeLine?: boolean;
      className?: string;
      glyphMarginClassName?: string;
      linesDecorationsClassName?: string;
      marginClassName?: string;
      inlineClassName?: string;
      beforeContentClassName?: string;
      afterContentClassName?: string;
    }

    interface IStandaloneEditorConstructionOptions {
      value?: string;
      language?: string;
      theme?: string;
      readOnly?: boolean;
      automaticLayout?: boolean;
      minimap?: { enabled?: boolean };
      scrollBeyondLastLine?: boolean;
      fontSize?: number;
      fontFamily?: string;
      lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
      wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
      folding?: boolean;
      renderLineHighlight?: 'none' | 'gutter' | 'line' | 'all';
      [key: string]: unknown;
    }

    interface IMarker {
      severity: number;
      message: string;
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    }
  }
}
