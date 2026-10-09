/**
 * PlotBook — IndexedDB persistence for the parsed search index
 * (Map Performance Plan, Phase 4.3).
 *
 * `search_index.json` is 1.73 MB and takes 100–300 ms of main-thread JSON.parse
 * on every visit. The already-parsed, per-scheme survey map is stored here via
 * Dexie (same pattern as doc-storage.ts); a structured clone of the object graph
 * is far cheaper to read than re-parsing the raw payload, so repeat visits skip
 * both the network fetch and the parse entirely.
 *
 * Entries are keyed by the DATA_VERSION used in sheets.ts: bumping that version
 * invalidates the cache automatically, and stale entries are evicted on write.
 */

import Dexie, { type Table } from 'dexie';
import type { CadastralSurveyPoint } from './types';

const CACHE_KEY = 'search_index';

interface CachedSearchIndex {
  key: string;
  version: string;
  data: Record<string, CadastralSurveyPoint[]>;
  storedAt: number;
}

class SearchCacheDB extends Dexie {
  searchIndex!: Table<CachedSearchIndex, string>;

  constructor() {
    super('plotbook_search_cache_v1');
    this.version(1).stores({
      searchIndex: 'key, version',
    });
  }
}

let db: SearchCacheDB | null = null;
function getDB(): SearchCacheDB | null {
  if (typeof window === 'undefined') return null;
  if (!db) db = new SearchCacheDB();
  return db;
}

/** Read the parsed index for a data version, or undefined if absent/mismatched. */
export async function readSearchIndex(
  version: string
): Promise<Record<string, CadastralSurveyPoint[]> | undefined> {
  try {
    const database = getDB();
    if (!database) return undefined;
    const hit = await database.searchIndex
      .where('version')
      .equals(version)
      .first();
    return hit?.data;
  } catch (err) {
    console.warn('IndexedDB search index read failed:', err);
    return undefined;
  }
}

/** Persist the parsed index, evicting entries from any older data version. */
export async function writeSearchIndex(
  version: string,
  data: Record<string, CadastralSurveyPoint[]>
): Promise<void> {
  try {
    const database = getDB();
    if (!database) return;
    await database.transaction('rw', database.searchIndex, async () => {
      await database.searchIndex.where('version').notEqual(version).delete();
      await database.searchIndex.put({
        key: CACHE_KEY,
        version,
        data,
        storedAt: Date.now(),
      });
    });
  } catch (err) {
    console.warn('IndexedDB search index write failed:', err);
  }
}
