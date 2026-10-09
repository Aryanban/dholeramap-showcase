/**
 * PlotBook Local-First IndexedDB Document & Land Registry Storage
 * Powered by Dexie.js
 * 
 * Securely persists property documents (Sale deeds, Form 7/12 Satbara extracts,
 * Form 8A mutations, Sanction blueprints, NOCs, Possession slips, Site photos)
 * directly in the browser's persistent IndexedDB without cloud server costs.
 */

import Dexie, { type Table } from 'dexie';
import type { AttachedDoc, AttachedDocType } from './types';

export class PlotBookRegistryDB extends Dexie {
  attachedDocs!: Table<AttachedDoc, string>;

  constructor() {
    super('plotbook_dholera_registry_v1');
    this.version(1).stores({
      attachedDocs: 'id, pinId, type, uploadedAt',
    });
  }
}

export const registryDB = typeof window !== 'undefined' ? new PlotBookRegistryDB() : null;

export const DOC_TYPE_INFO: Record<
  AttachedDocType,
  { label: string; short: string; icon: string; description: string; color: string }
> = {
  registry: {
    label: 'Registered Sale Deed / Title Deed',
    short: 'Sale Deed',
    icon: 'doc',
    description: 'Statutory registered deed executed at the Sub-Registrar Office (SRO)',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  satbara: {
    label: 'Form 7/12 (Satbara) & 8A Extract',
    short: 'Form 7/12',
    icon: 'doc',
    description: 'Anyror Gujarat revenue record showing survey ownership, area, and boja/liens',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  allotment: {
    label: 'Statutory Allotment Letter (Form 4/5)',
    short: 'Allotment',
    icon: 'doc',
    description: 'Gujarat Town Planning Act Form 4/5 Final Plot allotment gazette schedule',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  possession: {
    label: 'Possession Slip / Kabja Receipt',
    short: 'Possession',
    icon: 'doc',
    description: 'Physical handover acknowledgment or site possession memorandum',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  noc: {
    label: 'Authority NOC / Clear Title Opinion',
    short: 'NOC / Legal',
    icon: 'doc',
    description: 'Advocate search report, non-encumbrance certificate, or utility clearance',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  mutation: {
    label: 'Revenue Mutation Entry (Form 6/8A)',
    short: 'Mutation',
    icon: 'doc',
    description: 'Hakk Patrak mutation entry reflecting updated ownership in Talati records',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  sanction: {
    label: 'Approved Layout Plan / DGDCR Blueprint',
    short: 'Sanction Plan',
    icon: 'doc',
    description: 'Sanctioned architectural drawing with DGDCR FAR envelope & setback lines',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  photo: {
    label: 'Ground Demarcation Photo / Boundary Stone',
    short: 'Site Photo',
    icon: 'doc',
    description: 'Geotagged site photograph showing survey boundary peg, DP road frontage',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  other: {
    label: 'Other Legal / Supporting Document',
    short: 'Other Doc',
    icon: 'doc',
    description: 'Power of Attorney, tax receipt, lease deed, or buyer agreement',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

export async function saveDoc(doc: AttachedDoc): Promise<void> {
  if (!registryDB) return;
  await registryDB.attachedDocs.put(doc);
}

export async function getDocsByPin(pinId: string): Promise<AttachedDoc[]> {
  if (!registryDB || !pinId) return [];
  const docs = await registryDB.attachedDocs.where('pinId').equals(pinId).toArray();
  return docs.sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export async function getDocById(id: string): Promise<AttachedDoc | undefined> {
  if (!registryDB || !id) return undefined;
  return await registryDB.attachedDocs.get(id);
}

export async function deleteDoc(id: string): Promise<void> {
  if (!registryDB || !id) return;
  await registryDB.attachedDocs.delete(id);
}

export async function deleteDocsByPin(pinId: string): Promise<void> {
  if (!registryDB || !pinId) return;
  await registryDB.attachedDocs.where('pinId').equals(pinId).delete();
}

export async function purgeAllDocs(): Promise<void> {
  if (!registryDB) return;
  await registryDB.attachedDocs.clear();
}

export async function getAllDocsStats(): Promise<{ count: number; totalBytes: number }> {
  if (!registryDB) return { count: 0, totalBytes: 0 };
  const all = await registryDB.attachedDocs.toArray();
  const totalBytes = all.reduce((sum, d) => sum + (d.size || 0), 0);
  return { count: all.length, totalBytes };
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
