import { describe, it, expect } from 'vitest';
import { parseStreamingContent } from './useStreamingParser';

describe('parseStreamingContent', () => {
  it('should return empty result for empty text', () => {
    const result = parseStreamingContent('');
    expect(result.code).toBeNull();
    expect(result.language).toBeNull();
    expect(result.pitch).toBeNull();
    expect(result.complexity).toBeNull();
    expect(result.systemDesign).toBeNull();
  });

  it('should extract language', () => {
    const text = '{"language": "python"}';
    const result = parseStreamingContent(text);
    expect(result.language).toBe('python');
  });

  it('should extract code after language', () => {
    const text = '{"language": "python", "code": "def hello():\\n    print(\\"hello\\")"}';
    const result = parseStreamingContent(text);
    expect(result.language).toBe('python');
    expect(result.code).toBe('def hello():\n    print("hello")');
  });

  it('should extract pitch as string', () => {
    const text = '{"pitch": "Use dynamic programming to solve this efficiently."}';
    const result = parseStreamingContent(text);
    expect(result.pitch).toBe('Use dynamic programming to solve this efficiently.');
  });

  it('should extract pitch as object', () => {
    const text = '{"pitch": {"summary": "Dynamic programming", "approach": "Bottom-up"}}';
    const result = parseStreamingContent(text);
    expect(result.pitch).toEqual({ summary: 'Dynamic programming', approach: 'Bottom-up' });
  });

  it('should extract complexity', () => {
    const text = '{"complexity": {"time": "O(n)", "space": "O(1)"}}';
    const result = parseStreamingContent(text);
    expect(result.complexity).toEqual({ time: 'O(n)', space: 'O(1)' });
  });

  it('should extract systemDesign with included flag', () => {
    const text = '{"systemDesign": {"included": true}}';
    const result = parseStreamingContent(text);
    expect(result.systemDesign).toEqual({ included: true });
  });

  it('should handle escaped characters in code', () => {
    const text = '{"language": "python", "code": "print(\\"hello\\\\nworld\\")"}';
    const result = parseStreamingContent(text);
    expect(result.code).toContain('hello');
  });

  it('should not confuse code in explanations array with top-level code', () => {
    const text = `{
      "language": "python",
      "code": "def solve(): pass",
      "explanations": [{"line": 1, "code": "def solve():", "explanation": "Function definition"}]
    }`;
    const result = parseStreamingContent(text);
    expect(result.code).toBe('def solve(): pass');
    expect(result.language).toBe('python');
  });

  it('should handle partial JSON during streaming', () => {
    // Simulate streaming where JSON is incomplete
    const partialText = '{"language": "python", "code": "def hello():';
    const result = parseStreamingContent(partialText);
    expect(result.language).toBe('python');
    // Code might not be extracted from incomplete JSON
  });

  it('should clean up pitch text', () => {
    const text = '{"pitch": "Use   dynamic    programming\\n\\n\\nto solve."}';
    const result = parseStreamingContent(text);
    // After cleanup, multiple spaces should be reduced
    expect(result.pitch).not.toContain('   ');
  });
});
