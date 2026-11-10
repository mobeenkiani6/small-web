const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export type Person = { _id: string; name: string; isAuthor: boolean };

export type Site = {
  _id: string;
  address: string;
  title: string;
  html: string;
  text: string;
  author: { _id: string; name: string } | string;
};

export type ResolveResult =
  | { found: true; address: string; site: Site }
  | { found: false; address: string; site: null };

export type Visit = {
  _id: string;
  person: string;
  address: string;
  title: string;
  method: string;
  found: boolean;
  htmlSnapshot: string;
  visitedAt: string;
};

export type VisitMethod =
  | 'typed'
  | 'link'
  | 'back'
  | 'forward'
  | 'history'
  | 'search'
  | 'publish';

export const api = {
  people: () => req<Person[]>('/people'),
  createPerson: (body: { name: string; isAuthor?: boolean }) =>
    req<Person>('/people', { method: 'POST', body: JSON.stringify(body) }),
  resolve: (address: string) =>
    req<ResolveResult>(`/sites/resolve?address=${encodeURIComponent(address)}`),
  search: (q: string) =>
    req<Site[]>(`/search?q=${encodeURIComponent(q)}`),
  sites: () => req<Site[]>('/sites'),
  publish: (body: {
    address: string;
    title: string;
    html: string;
    authorId: string;
  }) =>
    req<Site>('/sites', { method: 'POST', body: JSON.stringify(body) }),
  visits: (personId: string) =>
    req<Visit[]>(`/visits?personId=${encodeURIComponent(personId)}`),
  recordVisit: (body: {
    personId: string;
    address: string;
    title?: string;
    method: VisitMethod;
    found: boolean;
    htmlSnapshot?: string;
  }) => req<Visit>('/visits', { method: 'POST', body: JSON.stringify(body) }),
};
