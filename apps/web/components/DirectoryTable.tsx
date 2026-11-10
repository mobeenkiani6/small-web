'use client';

import { useMemo, useState } from 'react';
import type { Site } from '@/lib/api';
import { IconSort, IconSortAsc, IconSortDesc } from '@/components/icons';

type SortKey = 'address' | 'title' | 'author';
type SortDir = 'asc' | 'desc';

function authorOf(site: Site): string {
  if (typeof site.author === 'string') return site.author;
  return site.author?.name ?? '—';
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <IconSort />;
  return dir === 'asc' ? <IconSortAsc /> : <IconSortDesc />;
}

export default function DirectoryTable({
  sites,
  onOpen,
}: {
  sites: Site[];
  onOpen: (address: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('address');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const rows = useMemo(() => {
    const sorted = [...sites].sort((a, b) => {
      const av =
        sortKey === 'author'
          ? authorOf(a)
          : sortKey === 'title'
            ? a.title
            : a.address;
      const bv =
        sortKey === 'author'
          ? authorOf(b)
          : sortKey === 'title'
            ? b.title
            : b.address;
      return av.localeCompare(bv, undefined, { sensitivity: 'base' });
    });
    return sortDir === 'asc' ? sorted : sorted.reverse();
  }, [sites, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  if (!sites.length) {
    return (
      <p className="dir-empty">
        No sites yet — publish one or run <code>npm run seed</code>.
      </p>
    );
  }

  return (
    <div className="dir-shell">
      <div className="dir-toolbar">
        <div>
          <div className="dir-kicker">Network directory</div>
          <div className="dir-count">
            {sites.length} station{sites.length === 1 ? '' : 's'} on the small web
          </div>
        </div>
        <div className="dir-legend" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="dir-table-wrap">
        <table className="dir-table">
          <thead>
            <tr>
              {(
                [
                  ['address', 'Address'],
                  ['title', 'Title'],
                  ['author', 'Author'],
                ] as const
              ).map(([key, label]) => (
                <th key={key} scope="col">
                  <button
                    type="button"
                    className={`dir-sort ${sortKey === key ? 'active' : ''}`}
                    onClick={() => toggleSort(key)}
                    aria-sort={
                      sortKey === key
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {label}
                    <SortIcon active={sortKey === key} dir={sortDir} />
                  </button>
                </th>
              ))}
              <th scope="col" className="dir-col-action">
                <span className="dir-sort-label">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((site, i) => (
              <tr
                key={site._id}
                style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                onClick={() => onOpen(site.address)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen(site.address);
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={`Open ${site.address}`}
              >
                <td>
                  <span className="dir-addr">
                    <span className="dir-dot" aria-hidden />
                    {site.address}
                  </span>
                </td>
                <td>
                  <span className="dir-title">{site.title}</span>
                </td>
                <td>
                  <span className="dir-author">{authorOf(site)}</span>
                </td>
                <td className="dir-col-action">
                  <button
                    type="button"
                    className="dir-open"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(site.address);
                    }}
                  >
                    Go
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
