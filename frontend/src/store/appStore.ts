import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export type AscendMode = 'coding' | 'system-design' | 'behavioral';
export type DetailLevel = 'basic' | 'detailed' | 'full';
export type LoadingType = 'solve' | 'fetch' | 'screenshot' | 'testing' | 'fixing' | 'running' | null;
export type ErrorType = 'default' | 'solve' | 'fetch' | 'screenshot' | 'credits';

export interface Complexity {
  time: string;
  space: string;
}

export interface SystemDesign {
  included: boolean;
  overview?: string;
  architecture?: {
    description: string;
    components: string[];
  };
  requirements?: {
    functional: string[];
    nonFunctional: string[];
  };
  techJustifications?: Array<{ tech: string; why: string }>;
  scalability?: string[];
}

export interface PitchObject {
  summary?: string;
  approach?: string;
  tradeoffs?: string;
}

export interface Solution {
  code: string | null;
  language: string | null;
  pitch: string | PitchObject | null;
  explanations: unknown[] | null;
  complexity: Complexity | null;
  systemDesign: SystemDesign | null;
  examples?: unknown[];
  autoFixed?: boolean;
  fixAttempts?: number;
}

export interface StreamingContent {
  code: string | null;
  language: string | null;
  pitch: string | PitchObject | null;
  explanations: unknown[] | null;
  complexity: Complexity | null;
  systemDesign: SystemDesign | null;
}

export interface EraserDiagram {
  imageUrl: string;
  editUrl: string;
}

export interface AutoRunOutput {
  success: boolean;
  output: string;
  input: string;
}

export interface SwitchNotification {
  from: string;
  to: string;
  reason?: string;
}

export interface EditorSettings {
  theme: 'light' | 'dark';
  keyBindings: 'standard' | 'vim' | 'emacs';
  fontSize: number;
  tabSpacing: number;
  intelliSense: boolean;
  autoCloseBrackets: boolean;
}

// ============================================================================
// Store Slices
// ============================================================================

interface ProblemSlice {
  // Problem state
  extractedText: string;
  currentProblem: string;
  loadedProblem: string;
  problemExpanded: boolean;

  // Actions
  setExtractedText: (text: string) => void;
  setCurrentProblem: (problem: string) => void;
  setLoadedProblem: (problem: string) => void;
  setProblemExpanded: (expanded: boolean) => void;
  toggleProblemExpanded: () => void;
  clearProblem: () => void;
}

interface SolutionSlice {
  // Solution state
  solution: Solution | null;
  streamingText: string;
  streamingContent: StreamingContent;
  autoRunOutput: AutoRunOutput | null;
  eraserDiagram: EraserDiagram | null;

  // Actions
  setSolution: (solution: Solution | null) => void;
  updateSolution: (updates: Partial<Solution>) => void;
  setStreamingText: (text: string) => void;
  appendStreamingText: (chunk: string) => void;
  setStreamingContent: (content: StreamingContent) => void;
  setAutoRunOutput: (output: AutoRunOutput | null) => void;
  setEraserDiagram: (diagram: EraserDiagram | null) => void;
  clearSolution: () => void;
}

interface UISlice {
  // Loading & Error state
  isLoading: boolean;
  loadingType: LoadingType;
  error: string | null;
  errorType: ErrorType;
  switchNotification: SwitchNotification | null;
  copyToast: boolean;
  highlightedLine: number | null;

  // Modal visibility
  showSettings: boolean;
  showSetupWizard: boolean;
  showPlatformAuth: boolean;
  showAscendAssistant: boolean;
  showPrepTab: boolean;
  showSavedDesigns: boolean;
  showAdminPanel: boolean;
  showPricingPlans: boolean;
  showOnboarding: boolean;

  // Actions
  setIsLoading: (loading: boolean) => void;
  setLoadingType: (type: LoadingType) => void;
  setError: (error: string | null, type?: ErrorType) => void;
  clearError: () => void;
  setSwitchNotification: (notification: SwitchNotification | null) => void;
  setCopyToast: (show: boolean) => void;
  setHighlightedLine: (line: number | null) => void;

  // Modal actions
  setShowSettings: (show: boolean) => void;
  setShowSetupWizard: (show: boolean) => void;
  setShowPlatformAuth: (show: boolean) => void;
  setShowAscendAssistant: (show: boolean) => void;
  setShowPrepTab: (show: boolean) => void;
  setShowSavedDesigns: (show: boolean) => void;
  setShowAdminPanel: (show: boolean) => void;
  setShowPricingPlans: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;

  isModalOpen: () => boolean;
}

interface ModeSlice {
  // Mode state
  ascendMode: AscendMode;
  designDetailLevel: DetailLevel;
  codingDetailLevel: DetailLevel;
  codingLanguage: string;
  autoGenerateEraser: boolean;
  isProcessingFollowUp: boolean;

  // Actions
  setAscendMode: (mode: AscendMode) => void;
  setDesignDetailLevel: (level: DetailLevel) => void;
  setCodingDetailLevel: (level: DetailLevel) => void;
  setCodingLanguage: (language: string) => void;
  setAutoGenerateEraser: (auto: boolean) => void;
  setIsProcessingFollowUp: (processing: boolean) => void;
}

interface ProviderSlice {
  // Provider state
  provider: 'claude' | 'openai';
  model: string;
  autoSwitch: boolean;

  // Actions
  setProvider: (provider: 'claude' | 'openai') => void;
  setModel: (model: string) => void;
  setAutoSwitch: (autoSwitch: boolean) => void;
}

interface SettingsSlice {
  // Settings state
  editorSettings: EditorSettings;
  sidebarCollapsed: boolean;
  stealthMode: boolean;

  // Actions
  setEditorSettings: (settings: EditorSettings) => void;
  updateEditorSettings: (updates: Partial<EditorSettings>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setStealthMode: (enabled: boolean) => void;
}

// Combined store type
export type AppStore = ProblemSlice & SolutionSlice & UISlice & ModeSlice & ProviderSlice & SettingsSlice & {
  // Global actions
  resetState: () => void;
  clearAll: () => void;
};

// ============================================================================
// Initial State
// ============================================================================

const initialStreamingContent: StreamingContent = {
  code: null,
  language: null,
  pitch: null,
  explanations: null,
  complexity: null,
  systemDesign: null,
};

const initialEditorSettings: EditorSettings = {
  theme: 'dark',
  keyBindings: 'standard',
  fontSize: 12,
  tabSpacing: 4,
  intelliSense: true,
  autoCloseBrackets: true,
};

// ============================================================================
// Store Creation
// ============================================================================

// Base store creator function - used by both persisted and test stores
const createStoreSlices = (set: any, get: any): AppStore => ({
  // ========================================
  // Problem Slice
  // ========================================
  extractedText: '',
  currentProblem: '',
  loadedProblem: '',
  problemExpanded: true,

  setExtractedText: (text) => set({ extractedText: text }),
  setCurrentProblem: (problem) => set({ currentProblem: problem }),
  setLoadedProblem: (problem) => set({ loadedProblem: problem }),
  setProblemExpanded: (expanded) => set({ problemExpanded: expanded }),
  toggleProblemExpanded: () => set((state: AppStore) => ({ problemExpanded: !state.problemExpanded })),
  clearProblem: () => set({
    extractedText: '',
    currentProblem: '',
    loadedProblem: '',
    problemExpanded: true,
  }),

  // ========================================
  // Solution Slice
  // ========================================
  solution: null,
  streamingText: '',
  streamingContent: initialStreamingContent,
  autoRunOutput: null,
  eraserDiagram: null,

  setSolution: (solution) => set({ solution }),
  updateSolution: (updates) => set((state: AppStore) => ({
    solution: state.solution ? { ...state.solution, ...updates } : null,
  })),
  setStreamingText: (text) => set({ streamingText: text }),
  appendStreamingText: (chunk) => set((state: AppStore) => ({
    streamingText: state.streamingText + chunk
  })),
  setStreamingContent: (content) => set({ streamingContent: content }),
  setAutoRunOutput: (output) => set({ autoRunOutput: output }),
  setEraserDiagram: (diagram) => set({ eraserDiagram: diagram }),
  clearSolution: () => set({
    solution: null,
    streamingText: '',
    streamingContent: initialStreamingContent,
    autoRunOutput: null,
    eraserDiagram: null,
  }),

  // ========================================
  // UI Slice
  // ========================================
  isLoading: false,
  loadingType: null,
  error: null,
  errorType: 'default',
  switchNotification: null,
  copyToast: false,
  highlightedLine: null,

  showSettings: false,
  showSetupWizard: false,
  showPlatformAuth: false,
  showAscendAssistant: false,
  showPrepTab: false,
  showSavedDesigns: false,
  showAdminPanel: false,
  showPricingPlans: false,
  showOnboarding: false,

  setIsLoading: (loading) => set({ isLoading: loading }),
  setLoadingType: (type) => set({ loadingType: type }),
  setError: (error, type = 'default') => set({ error, errorType: type }),
  clearError: () => set({ error: null, errorType: 'default' }),
  setSwitchNotification: (notification) => set({ switchNotification: notification }),
  setCopyToast: (show) => set({ copyToast: show }),
  setHighlightedLine: (line) => set({ highlightedLine: line }),

  setShowSettings: (show) => set({ showSettings: show }),
  setShowSetupWizard: (show) => set({ showSetupWizard: show }),
  setShowPlatformAuth: (show) => set({ showPlatformAuth: show }),
  setShowAscendAssistant: (show) => set({ showAscendAssistant: show }),
  setShowPrepTab: (show) => set({ showPrepTab: show }),
  setShowSavedDesigns: (show) => set({ showSavedDesigns: show }),
  setShowAdminPanel: (show) => set({ showAdminPanel: show }),
  setShowPricingPlans: (show) => set({ showPricingPlans: show }),
  setShowOnboarding: (show) => set({ showOnboarding: show }),

  isModalOpen: () => {
    const state = get();
    return state.showSettings || state.showSetupWizard || state.showPlatformAuth ||
           state.showPrepTab || state.showAdminPanel || state.showSavedDesigns;
  },

  // ========================================
  // Mode Slice
  // ========================================
  ascendMode: 'coding',
  designDetailLevel: 'basic',
  codingDetailLevel: 'basic',
  codingLanguage: 'auto',
  autoGenerateEraser: false,
  isProcessingFollowUp: false,

  setAscendMode: (mode) => set({ ascendMode: mode }),
  setDesignDetailLevel: (level) => set({ designDetailLevel: level }),
  setCodingDetailLevel: (level) => set({ codingDetailLevel: level }),
  setCodingLanguage: (language) => set({ codingLanguage: language }),
  setAutoGenerateEraser: (auto) => set({ autoGenerateEraser: auto }),
  setIsProcessingFollowUp: (processing) => set({ isProcessingFollowUp: processing }),

  // ========================================
  // Provider Slice
  // ========================================
  provider: 'claude',
  model: 'claude-sonnet-4-20250514',
  autoSwitch: false,

  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
  setAutoSwitch: (autoSwitch) => set({ autoSwitch }),

  // ========================================
  // Settings Slice
  // ========================================
  editorSettings: initialEditorSettings,
  sidebarCollapsed: false,
  stealthMode: false,

  setEditorSettings: (settings) => set({ editorSettings: settings }),
  updateEditorSettings: (updates) => set((state: AppStore) => ({
    editorSettings: { ...state.editorSettings, ...updates },
  })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state: AppStore) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setStealthMode: (enabled) => set({ stealthMode: enabled }),

  // ========================================
  // Global Actions
  // ========================================
  resetState: () => set({
    solution: null,
    error: null,
    errorType: 'default',
    autoRunOutput: null,
    streamingText: '',
    streamingContent: initialStreamingContent,
  }),

  clearAll: () => set({
    solution: null,
    error: null,
    errorType: 'default',
    extractedText: '',
    loadedProblem: '',
    currentProblem: '',
    streamingText: '',
    streamingContent: initialStreamingContent,
    autoRunOutput: null,
    problemExpanded: true,
    eraserDiagram: null,
  }),
});

// Create a non-persisted store for testing
export const createTestStore = () => create<AppStore>()(createStoreSlices);

// Main persisted store for production use
export const useAppStore = create<AppStore>()(
  persist(
    createStoreSlices,
    {
      name: 'chundu-app-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        provider: state.provider,
        model: state.model,
        autoSwitch: state.autoSwitch,
        editorSettings: state.editorSettings,
        sidebarCollapsed: state.sidebarCollapsed,
        codingLanguage: state.codingLanguage,
        codingDetailLevel: state.codingDetailLevel,
        designDetailLevel: state.designDetailLevel,
      }),
    }
  )
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

export const selectProblem = (state: AppStore) => ({
  extractedText: state.extractedText,
  currentProblem: state.currentProblem,
  loadedProblem: state.loadedProblem,
  problemExpanded: state.problemExpanded,
});

export const selectSolution = (state: AppStore) => ({
  solution: state.solution,
  streamingContent: state.streamingContent,
  autoRunOutput: state.autoRunOutput,
  eraserDiagram: state.eraserDiagram,
});

export const selectUI = (state: AppStore) => ({
  isLoading: state.isLoading,
  loadingType: state.loadingType,
  error: state.error,
  errorType: state.errorType,
});

export const selectMode = (state: AppStore) => ({
  ascendMode: state.ascendMode,
  designDetailLevel: state.designDetailLevel,
  codingDetailLevel: state.codingDetailLevel,
  codingLanguage: state.codingLanguage,
});

export const selectProvider = (state: AppStore) => ({
  provider: state.provider,
  model: state.model,
  autoSwitch: state.autoSwitch,
});

export const selectSettings = (state: AppStore) => ({
  editorSettings: state.editorSettings,
  sidebarCollapsed: state.sidebarCollapsed,
  stealthMode: state.stealthMode,
});

// ============================================================================
// Hooks for specific use cases
// ============================================================================

export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => ({ error: state.error, errorType: state.errorType }));
export const useAscendMode = () => useAppStore((state) => state.ascendMode);
export const useProvider = () => useAppStore((state) => ({ provider: state.provider, model: state.model }));
export const useSolution = () => useAppStore((state) => state.solution);
export const useStreamingContent = () => useAppStore((state) => state.streamingContent);
