/**
 * Per-user dossier branding (logo + contact details).
 *
 * Stored locally in IndexedDB, keyed by the user's id (the Clerk user id when
 * signed in). Saved once from the Settings page, then applied automatically to
 * every generated dossier: logo + name on the cover, a full contact block on the
 * closing page, and a compact footer on every generated page.
 */

import Dexie, { type Table } from 'dexie';
import type { DossierBranding } from './types';

export type { DossierBranding };

class BrandingDB extends Dexie {
  branding!: Table<DossierBranding, string>;

  constructor() {
    super('plotbook_branding_v1');
    this.version(1).stores({
      branding: 'userId',
    });
  }
}

let db: BrandingDB | null = null;

function getDB(): BrandingDB | null {
  if (typeof window === 'undefined') return null;
  if (!db) db = new BrandingDB();
  return db;
}

export async function getBranding(userId: string): Promise<DossierBranding | undefined> {
  const database = getDB();
  if (!database || !userId) return undefined;
  return database.branding.get(userId);
}

/**
 * Resolve the key branding is stored under. Signed-in users key off their Clerk
 * user id (so branding is separate per user); anonymous visitors fall back to a
 * stable per-device id so branding still persists locally and never collides
 * between devices.
 */
export function currentUserId(user: { id?: string } | null | undefined): string {
  if (user?.id) return user.id;
  if (typeof window === 'undefined') return '';
  try {
    let id = window.localStorage.getItem('dholera-anon-id');
    if (!id) {
      id = `anon-${crypto.randomUUID()}`;
      window.localStorage.setItem('dholera-anon-id', id);
    }
    return id;
  } catch {
    return '';
  }
}

export async function saveBranding(b: Omit<DossierBranding, 'updatedAt'>): Promise<void> {
  const database = getDB();
  if (!database) return;
  await database.branding.put({ ...b, updatedAt: Date.now() });
}

/** Downscale an uploaded image to a compact square logo, returned as a data URL. */
export async function fileToLogoDataUrl(file: File, maxSize = 360): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Could not decode the image.'));
    el.src = dataUrl;
  });
  const s = Math.min(maxSize / img.width, maxSize / img.height, 1);
  const w = Math.max(1, Math.round(img.width * s));
  const h = Math.max(1, Math.round(img.height * s));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/png');
}
