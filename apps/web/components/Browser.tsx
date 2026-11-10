'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { api, Person, Site, Visit, VisitMethod } from '@/lib/api';
import {
  BrowserSession,
  canGoBack,
  canGoForward,
  current,
  emptySession,
  goBack,
  goForward,
  pushNavigation,
  SessionEntry,
} from '@/lib/session';
import {
  IconBack,
  IconClose,
  IconForward,
  IconGo,
  IconHistory,
  IconHome,
  IconPublish,
  IconSearch,
} from '@/components/icons';
import DirectoryTable from '@/components/DirectoryTable';

type Panel = 'none' | 'history' | 'search' | 'publish';

const PERSON_KEY = 'smallweb.personId';

function authorName(site: Site): string {
  if (typeof site.author === 'string') return site.author;
  return site.author?.name ?? 'unknown';
}

function panelTitle(panel: Panel): string {
  if (panel === 'history') return 'History';
  if (panel === 'search') return 'Search';
  if (panel === 'publish') return 'Publish';
  return '';
}

export default function Browser() {
  const [people, setPeople] = useState<Person[]>([]);
  const [directory, setDirectory] = useState<Site[]>([]);
  const [personId, setPersonId] = useState<string>('');
  const [session, setSession] = useState<BrowserSession>(emptySession);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [panel, setPanel] = useState<Panel>('none');
  const [history, setHistory] = useState<Visit[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchHits, setSearchHits] = useState<Site[]>([]);
  const [searching, setSearching] = useState(false);
  const [pub, setPub] = useState({ address: '', title: '', html: '' });
  const [pubMsg, setPubMsg] = useState<{ ok?: string; err?: string }>({});
  const [addingAuthor, setAddingAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [authorMsg, setAuthorMsg] = useState<{ ok?: string; err?: string }>({});
  const [bootError, setBootError] = useState('');

  const page = current(session);
  const personName = useMemo(
    () => people.find((p) => p._id === personId)?.name ?? '…',
    [people, personId],
  );

  const refreshDirectory = useCallback(() => {
    api.sites().then(setDirectory).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.people();
        if (cancelled) return;
        setPeople(list);
        const saved = localStorage.getItem(PERSON_KEY);
        const pick =
          list.find((p) => p._id === saved)?._id ?? list[0]?._id ?? '';
        setPersonId(pick);
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : 'Failed to load people');
        }
      }
      try {
        const sites = await api.sites();
        if (cancelled) return;
        setDirectory(Array.isArray(sites) ? sites : []);
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : 'Failed to load sites');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!personId) return;
    localStorage.setItem(PERSON_KEY, personId);
    setSession(emptySession());
    setAddressInput('');
  }, [personId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel('none');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const refreshHistory = useCallback(async () => {
    if (!personId) return;
    const rows = await api.visits(personId);
    setHistory(rows);
  }, [personId]);

  useEffect(() => {
    if (panel === 'history') {
      refreshHistory().catch(() => undefined);
    }
  }, [panel, refreshHistory]);

  const record = useCallback(
    async (entry: SessionEntry, method: VisitMethod) => {
      if (!personId) return;
      await api.recordVisit({
        personId,
        address: entry.address,
        title: entry.title,
        method,
        found: entry.found,
        htmlSnapshot: entry.html,
      });
    },
    [personId],
  );

  const navigate = useCallback(
    async (raw: string, method: VisitMethod) => {
      const address = raw.trim().toLowerCase().replace(/^small:\/\//, '');
      if (!address || !personId) return;
      setLoading(true);
      setPanel('none');
      try {
        const result = await api.resolve(address);
        const entry: SessionEntry = result.found
          ? {
              address: result.address,
              title: result.site.title,
              found: true,
              html: result.site.html,
              method,
            }
          : {
              address: result.address,
              title: '',
              found: false,
              html: '',
              method,
            };
        setSession((s) => pushNavigation(s, entry));
        setAddressInput(entry.address);
        await record(entry, method);
      } catch (e) {
        setBootError(e instanceof Error ? e.message : 'Navigation failed');
      } finally {
        setLoading(false);
      }
    },
    [personId, record],
  );

  const jumpToIndex = async (index: number) => {
    if (index < 0 || index >= session.stack.length || index === session.index) {
      return;
    }
    const next = { ...session, index };
    const entry = current(next);
    setSession(next);
    if (!entry) return;
    setAddressInput(entry.address);
    const method: VisitMethod = index < session.index ? 'back' : 'forward';
    await record({ ...entry, method }, method);
  };

  const goHome = () => {
    setSession(emptySession());
    setAddressInput('');
    setPanel('none');
  };

  const onBack = async () => {
    const next = goBack(session);
    if (!next) return;
    const entry = current(next);
    setSession(next);
    if (entry) {
      setAddressInput(entry.address);
      await record({ ...entry, method: 'back' }, 'back');
    }
  };

  const onForward = async () => {
    const next = goForward(session);
    if (!next) return;
    const entry = current(next);
    setSession(next);
    if (entry) {
      setAddressInput(entry.address);
      await record({ ...entry, method: 'forward' }, 'forward');
    }
  };

  const onAddressSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(addressInput, 'typed');
  };

  const onViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;
    e.preventDefault();
    const href =
      anchor.getAttribute('data-smallweb-link') ||
      anchor.getAttribute('href') ||
      '';
    if (!href || href.startsWith('mailto:')) return;
    let address = href;
    try {
      if (/^https?:\/\//i.test(href)) {
        const u = new URL(href);
        address = u.hostname + (u.pathname === '/' ? '' : u.pathname);
      }
    } catch {
      /* keep raw */
    }
    address = address.replace(/^\//, '');
    navigate(address, 'link');
  };

  const togglePanel = (next: Panel) => {
    setPanel((p) => (p === next ? 'none' : next));
  };

  const runSearch = async (e: FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const hits = await api.search(searchQ);
      setSearchHits(hits);
    } finally {
      setSearching(false);
    }
  };

  const addAuthor = async (e: FormEvent) => {
    e.preventDefault();
    setAuthorMsg({});
    const name = newAuthorName.trim();
    if (!name) return;
    try {
      const person = await api.createPerson({ name, isAuthor: true });
      setPeople((list) =>
        [...list, person].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setPersonId(person._id);
      setNewAuthorName('');
      setAddingAuthor(false);
      setAuthorMsg({ ok: `Added ${person.name}` });
    } catch (err) {
      setAuthorMsg({
        err: err instanceof Error ? err.message : 'Could not add author',
      });
    }
  };

  const publish = async (e: FormEvent) => {
    e.preventDefault();
    setPubMsg({});
    if (!personId) return;
    try {
      const site = await api.publish({
        address: pub.address,
        title: pub.title,
        html: pub.html,
        authorId: personId,
      });
      setPubMsg({ ok: `Published ${site.address}` });
      setPub({ address: '', title: '', html: '' });
      refreshDirectory();
      await navigate(site.address, 'publish');
    } catch (err) {
      setPubMsg({
        err: err instanceof Error ? err.message : 'Publish failed',
      });
    }
  };

  const jumpHistory = async (v: Visit) => {
    if (v.htmlSnapshot) {
      const entry: SessionEntry = {
        address: v.address,
        title: v.title,
        found: v.found,
        html: v.htmlSnapshot,
        method: 'history',
      };
      setSession((s) => pushNavigation(s, entry));
      setAddressInput(v.address);
      setPanel('none');
      await record(entry, 'history');
      return;
    }
    await navigate(v.address, 'history');
  };

  return (
    <div className="app-shell">
      <header className="chrome">
        <div className="chrome-inner">
          <div className="chrome-top">
            <button type="button" className="brand" onClick={goHome}>
              <span className="brand-mark">SW</span>
              Small<em>Web</em>
            </button>

            <div className="person-pick">
              <span>Browsing as</span>
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                aria-label="Select person"
              >
                {people.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                    {p.isAuthor ? ' · author' : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="tool-btn"
                onClick={() => {
                  setAddingAuthor((v) => !v);
                  setAuthorMsg({});
                }}
                aria-expanded={addingAuthor}
              >
                {addingAuthor ? 'Cancel' : 'Add author'}
              </button>
            </div>
          </div>

          {addingAuthor && (
            <form className="add-author" onSubmit={addAuthor}>
              <input
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                placeholder="New author name"
                aria-label="New author name"
                required
                maxLength={80}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newAuthorName.trim()}
              >
                Save author
              </button>
              {authorMsg.ok && <span className="ok-note inline">{authorMsg.ok}</span>}
              {authorMsg.err && <span className="err inline">{authorMsg.err}</span>}
            </form>
          )}

          <div className="nav-row">
            <div className="nav-cluster" role="group" aria-label="Navigation">
              <button
                type="button"
                className="icon-btn"
                aria-label="Back"
                disabled={!canGoBack(session) || loading}
                onClick={onBack}
              >
                <IconBack />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Forward"
                disabled={!canGoForward(session) || loading}
                onClick={onForward}
              >
                <IconForward />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Home"
                onClick={goHome}
              >
                <IconHome />
              </button>
            </div>

            <form className="address-form" onSubmit={onAddressSubmit}>
              <span className="station-dot" aria-hidden />
              <input
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Station address — tidepool.zz"
                spellCheck={false}
                aria-label="Address bar"
                autoComplete="off"
              />
              <button
                type="submit"
                className="go-btn"
                disabled={loading || !personId || !addressInput.trim()}
              >
                Go
                <IconGo size={16} />
              </button>
            </form>

            <div className="tools" role="toolbar" aria-label="Tools">
              <button
                type="button"
                className={`tool-btn ${panel === 'search' ? 'active' : ''}`}
                onClick={() => togglePanel('search')}
                aria-pressed={panel === 'search'}
              >
                <IconSearch size={16} />
                <span>Search</span>
              </button>
              <button
                type="button"
                className={`tool-btn ${panel === 'history' ? 'active' : ''}`}
                onClick={() => togglePanel('history')}
                aria-pressed={panel === 'history'}
              >
                <IconHistory size={16} />
                <span>History</span>
              </button>
              <button
                type="button"
                className={`tool-btn primary ${panel === 'publish' ? 'active' : ''}`}
                onClick={() => togglePanel('publish')}
                aria-pressed={panel === 'publish'}
              >
                <IconPublish size={16} />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="route" aria-label="Session route">
        <div className="route-inner">
          {!session.stack.length ? (
            <div className="route-empty">Your route appears as you browse</div>
          ) : (
            session.stack.map((stop, i) => (
              <div
                key={`${stop.address}-${i}`}
                className={`route-stop ${
                  i === session.index
                    ? 'current'
                    : i < session.index
                      ? 'past'
                      : 'future'
                } ${!stop.found ? 'miss' : ''}`}
              >
                {i > 0 && <div className="route-seg" aria-hidden />}
                <button
                  type="button"
                  className="route-pill"
                  onClick={() => jumpToIndex(i)}
                  aria-current={i === session.index ? 'page' : undefined}
                  title={stop.found ? stop.title || stop.address : 'Nowhere'}
                >
                  <span className="dot" aria-hidden />
                  <span className="lbl">{stop.address}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`workspace ${panel !== 'none' ? 'with-side' : ''}`}>
        <main className="viewport" onClick={onViewportClick}>
          {bootError && !people.length ? (
            <div className="state miss">
              <h1>
                Cannot reach <span>the web</span>
              </h1>
              <p>{bootError}. Start the API on port 4000, then refresh.</p>
            </div>
          ) : loading ? (
            <div className="loading">
              <span className="spinner" aria-hidden />
              Arriving…
            </div>
          ) : !page ? (
            <div className="state state-home">
              <h1>
                A small web.
                <br />
                <span>Your line.</span>
              </h1>
              <p>
                Type an address, follow a link, retrace the route, search the
                prose, or publish a station. History belongs to {personName}.
              </p>
              <DirectoryTable
                sites={directory}
                onOpen={(address) => navigate(address, 'typed')}
              />
            </div>
          ) : !page.found ? (
            <div className="state miss">
              <h1>
                End of the line at{' '}
                <span className="code">{page.address}</span>
              </h1>
              <p>
                That address was asked for and nothing answered. Back restores
                the station you left — broken links are part of the map.
              </p>
            </div>
          ) : (
            <div className="site-frame page-anim">
              <div className="site-meta">
                <span className="addr">{page.address}</span>
                <span className="title">{page.title}</span>
              </div>
              <div
                className="site-html"
                dangerouslySetInnerHTML={{ __html: page.html }}
              />
            </div>
          )}
        </main>

        {panel !== 'none' && (
          <aside className="side" aria-label={panelTitle(panel)}>
            <div className="side-head">
              <h2>{panelTitle(panel)}</h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close panel"
                onClick={() => setPanel('none')}
              >
                <IconClose />
              </button>
            </div>
            <div className="side-body">
              {panel === 'history' && (
                <ul className="history-list">
                  {history.map((v) => (
                    <li key={v._id}>
                      <button type="button" onClick={() => jumpHistory(v)}>
                        <div className="addr">{v.address}</div>
                        <div className="ttl">
                          {v.found ? v.title || v.address : 'Nowhere'}
                          {!v.found && (
                            <span className="badge badge-miss">missing</span>
                          )}
                        </div>
                        <div className="meta">
                          {new Date(v.visitedAt).toLocaleString()} · {v.method}
                        </div>
                      </button>
                    </li>
                  ))}
                  {!history.length && (
                    <p className="empty-panel">No visits yet for {personName}.</p>
                  )}
                </ul>
              )}

              {panel === 'search' && (
                <>
                  <form className="search-box" onSubmit={runSearch}>
                    <input
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      placeholder="Search what is written on the pages…"
                      aria-label="Search query"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={searching || !searchQ.trim()}
                    >
                      <IconSearch size={16} />
                      {searching ? 'Searching…' : 'Search the web'}
                    </button>
                  </form>
                  <ul className="result-list">
                    {searchHits.map((s) => (
                      <li key={s._id}>
                        <button
                          type="button"
                          onClick={() => navigate(s.address, 'search')}
                        >
                          <div className="addr">{s.address}</div>
                          <div className="ttl">{s.title}</div>
                          <div className="meta">by {authorName(s)}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {!searching && searchQ && !searchHits.length && (
                    <p className="empty-panel">No pages matched that search.</p>
                  )}
                </>
              )}

              {panel === 'publish' && (
                <form onSubmit={publish}>
                  <p className="help">
                    Publishing as <strong>{personName}</strong>. Scripts and
                    event handlers are stripped before the page is stored.
                  </p>
                  <div className="field">
                    <label htmlFor="pub-author">Author</label>
                    <select
                      id="pub-author"
                      value={personId}
                      onChange={(e) => setPersonId(e.target.value)}
                      aria-label="Publish as author"
                    >
                      {people.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                          {p.isAuthor ? ' · author' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ marginBottom: 12, width: '100%' }}
                    onClick={() => {
                      setAddingAuthor(true);
                      setAuthorMsg({});
                    }}
                  >
                    Add a new author
                  </button>
                  <div className="field">
                    <label htmlFor="pub-address">Address</label>
                    <input
                      id="pub-address"
                      value={pub.address}
                      onChange={(e) =>
                        setPub((p) => ({ ...p, address: e.target.value }))
                      }
                      placeholder="mypage.zz"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="pub-title">Title</label>
                    <input
                      id="pub-title"
                      value={pub.title}
                      onChange={(e) =>
                        setPub((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="A short title"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="pub-html">HTML</label>
                    <textarea
                      id="pub-html"
                      value={pub.html}
                      onChange={(e) =>
                        setPub((p) => ({ ...p, html: e.target.value }))
                      }
                      placeholder='<p>Hello. Link with href="other.zz"</p>'
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <IconPublish size={16} />
                    Publish page
                  </button>
                  {pubMsg.ok && <div className="ok-note">{pubMsg.ok}</div>}
                  {pubMsg.err && <div className="err">{pubMsg.err}</div>}
                </form>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
