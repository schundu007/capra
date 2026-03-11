import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Create a proper localStorage mock that implements Storage interface
// This must be set BEFORE any imports that use localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

// Set up localStorage mock immediately (before other modules are imported)
const localStorageMock = createLocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: undefined,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
});
