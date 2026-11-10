import type { VisitMethod } from './api';

/** One entry in the browser session stack — the page as it was when left. */
export type SessionEntry = {
  address: string;
  title: string;
  found: boolean;
  /** Exact HTML shown; restored on back/forward. */
  html: string;
  method: VisitMethod;
};

export type BrowserSession = {
  stack: SessionEntry[];
  index: number;
};

export function canGoBack(s: BrowserSession): boolean {
  return s.index > 0;
}

export function canGoForward(s: BrowserSession): boolean {
  return s.index >= 0 && s.index < s.stack.length - 1;
}

export function current(s: BrowserSession): SessionEntry | null {
  if (s.index < 0 || s.index >= s.stack.length) return null;
  return s.stack[s.index];
}

/** Navigate to a new page: drop any forward branch, push, land on tip. */
export function pushNavigation(
  s: BrowserSession,
  entry: SessionEntry,
): BrowserSession {
  const base = s.index < 0 ? [] : s.stack.slice(0, s.index + 1);
  const stack = [...base, entry];
  return { stack, index: stack.length - 1 };
}

export function goBack(s: BrowserSession): BrowserSession | null {
  if (!canGoBack(s)) return null;
  return { ...s, index: s.index - 1 };
}

export function goForward(s: BrowserSession): BrowserSession | null {
  if (!canGoForward(s)) return null;
  return { ...s, index: s.index + 1 };
}

export const emptySession = (): BrowserSession => ({ stack: [], index: -1 });
