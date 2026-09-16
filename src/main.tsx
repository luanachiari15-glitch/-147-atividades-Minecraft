import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Sanitize console logging to prevent crashes when external scripts (like pixel trackers) log DOM elements with React fiber circular structures
if (typeof window !== 'undefined') {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  const sanitizeArg = (arg: unknown, seen = new WeakSet<object>()): unknown => {
    if (arg === null || typeof arg !== 'object') {
      return arg;
    }
    if (arg instanceof Element) {
      return `<${arg.tagName.toLowerCase()}${arg.id ? ` id="${arg.id}"` : ''}${arg.className ? ` class="${arg.className}"` : ''}>`;
    }
    if (seen.has(arg)) {
      return '[Circular]';
    }
    seen.add(arg);
    return arg;
  };

  console.log = (...args: unknown[]) => {
    try {
      const seen = new WeakSet<object>();
      originalLog.apply(console, args.map(a => sanitizeArg(a, seen)));
    } catch {
      // Fallback
    }
  };

  console.error = (...args: unknown[]) => {
    try {
      const seen = new WeakSet<object>();
      originalError.apply(console, args.map(a => sanitizeArg(a, seen)));
    } catch {
      // Fallback
    }
  };

  console.warn = (...args: unknown[]) => {
    try {
      const seen = new WeakSet<object>();
      originalWarn.apply(console, args.map(a => sanitizeArg(a, seen)));
    } catch {
      // Fallback
    }
  };

  console.info = (...args: unknown[]) => {
    try {
      const seen = new WeakSet<object>();
      originalInfo.apply(console, args.map(a => sanitizeArg(a, seen)));
    } catch {
      // Fallback
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
