/**
 * Local-first dossier template storage (IndexedDB via Dexie).
 *
 * Developer PDFs never leave the device: uploads are stored here as bytes and
 * only ever read back locally to assemble client dossiers.
 */

import Dexie, { type Table } from 'dexie';
import type { StoredDossierTemplate } from './types';

class DossierTemplateDB extends Dexie {
  templates!: Table<StoredDossierTemplate, string>;

  constructor() {
    super('plotbook_dossier_templates_v1');
    this.version(1).stores({
      templates: 'id, definitionId, sha256, updatedAt',
    });
  }
}

let db: DossierTemplateDB | null = null;

function getDB(): DossierTemplateDB | null {
  if (typeof window === 'undefined') return null;
  if (!db) db = new DossierTemplateDB();
  return db;
}

export async function saveDossierTemplate(t: StoredDossierTemplate): Promise<void> {
  const database = getDB();
  if (!database) return;
  await database.templates.put({ ...t, updatedAt: Date.now() });
}

export async function listDossierTemplates(): Promise<StoredDossierTemplate[]> {
  const database = getDB();
  if (!database) return [];
  const all = await database.templates.orderBy('updatedAt').reverse().toArray();
  return all;
}

export async function getDossierTemplate(id: string): Promise<StoredDossierTemplate | undefined> {
  const database = getDB();
  if (!database || !id) return undefined;
  return database.templates.get(id);
}

export async function deleteDossierTemplate(id: string): Promise<void> {
  const database = getDB();
  if (!database || !id) return;
  await database.templates.delete(id);
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
