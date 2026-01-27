// API Types

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ExecutionMode = 'fast' | 'verified' | 'comprehensive';
export type OptimizationGoal = 'time' | 'space' | 'readability';
export type TargetLevel = 'beginner' | 'intermediate';

export interface LineExplanation {
  line_number: number;
  code: string;
  explanation: string;
  complexity_note: string | null;
  is_key_line: boolean;
}

export interface ComplexityInfo {
  notation: string;
  explanation: string;
}

export interface Complexity {
  time: ComplexityInfo;
  space: ComplexityInfo;
}

export interface EdgeCase {
  case: string;
  handled: boolean;
  how: string;
  line_reference: number | null;
}

export interface CommonMistake {
  mistake: string;
  why_wrong: string;
  how_avoided: string;
}

export interface AlternativeApproach {
  name: string;
  time_complexity: string;
  space_complexity: string;
  when_to_use: string;
  code_snippet: string | null;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface SolutionData {
  code: string;
  language: string;
  lines: LineExplanation[];
  complexity: Complexity;
  edge_cases: EdgeCase[];
  common_mistakes: CommonMistake[];
  alternative_approaches: AlternativeApproach[];
  test_results: TestResult[];
}

export interface ResponseMetadata {
  request_id: string;
  mode: string;
  primary_model: string;
  verification_model: string | null;
  verification_status: string | null;
  generated_at: string;
  latency_ms: number;
  cached: boolean;
  cost_estimate_usd: number | null;
}

export interface AnalyzeResponse {
  success: boolean;
  data: SolutionData;
  metadata: ResponseMetadata;
  warnings: string[];
}

export interface ErrorDetails {
  code: string;
  message: string;
  details: Record<string, unknown> | null;
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetails;
  metadata: ResponseMetadata;
}

export interface OCRResponse {
  extracted_text: string;
  confidence: number;
  warnings: string[];
}

export interface SimplifiedStep {
  step: number;
  title: string;
  explanation: string;
  analogy: string | null;
}

export interface KeyConcept {
  term: string;
  simple_definition: string;
  example: string | null;
}

export interface SimplifiedExplanation {
  simplified_explanation: string;
  step_by_step: SimplifiedStep[];
  key_concepts: KeyConcept[];
}

export interface ExplainSimpleResponse {
  success: boolean;
  data: SimplifiedExplanation;
  metadata: ResponseMetadata;
  warnings: string[];
}

// Request Types

export interface AnalyzeRequest {
  problem_text: string;
  sample_input?: string;
  sample_output?: string;
  difficulty?: DifficultyLevel;
  mode?: ExecutionMode;
}

export interface OCRRequest {
  image_base64: string;
  image_type: 'png' | 'jpg' | 'jpeg' | 'webp';
}

export interface OptimizeRequest {
  problem_text: string;
  current_code: string;
  optimization_goal?: OptimizationGoal;
}

export interface ExplainSimpleRequest {
  problem_text: string;
  code: string;
  target_level?: TargetLevel;
}

// App State Types

export interface TestCase {
  id: string;
  input: string;
  output: string;
}

export interface AppState {
  // Problem input
  problemText: string;
  sampleInput: string;
  sampleOutput: string;
  testCases: TestCase[];
  difficulty: DifficultyLevel | null;

  // Execution
  mode: ExecutionMode;
  isLoading: boolean;
  error: string | null;

  // Result
  result: SolutionData | null;
  metadata: ResponseMetadata | null;
  warnings: string[];

  // Streaming
  streamingText: string;
  isStreaming: boolean;

  // UI state
  theme: 'light' | 'dark';
  highlightedLine: number | null;

  // Actions
  setProblemText: (text: string) => void;
  setSampleInput: (text: string) => void;
  setSampleOutput: (text: string) => void;
  setDifficulty: (level: DifficultyLevel | null) => void;
  setMode: (mode: ExecutionMode) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setHighlightedLine: (line: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: SolutionData | null, metadata: ResponseMetadata | null, warnings: string[]) => void;
  setStreaming: (isStreaming: boolean) => void;
  appendStreamingText: (text: string) => void;
  clearStreaming: () => void;
  addTestCase: () => void;
  removeTestCase: (id: string) => void;
  updateTestCase: (id: string, field: 'input' | 'output', value: string) => void;
  clearAll: () => void;
}
