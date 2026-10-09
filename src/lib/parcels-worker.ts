/**
 * B6: Web Worker holding one scheme's decoded parcels.bin.
 *
 * The main thread posts the ArrayBuffer (transferred, zero-copy) and then asks
 * hit queries; the worker answers from its already-decoded typed arrays so a
 * click costs no JSON parse and no per-click allocation.
 */
import { decode, hitTest, DecodedParcels, ParcelHit } from '@/lib/parcels-bin';

let current: DecodedParcels | null = null;
let currentScheme: number | null = null;

self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (msg.type === 'load') {
    current = decode(msg.buffer);
    currentScheme = msg.scheme;
    (self as any).postMessage({
      type: 'ready',
      scheme: msg.scheme,
      nParcels: current.nParcels,
      canvas: current.canvas,
    });
    return;
  }
  if (msg.type === 'hit') {
    if (!current) {
      (self as any).postMessage({ type: 'hit', id: msg.id, hit: null });
      return;
    }
    const hit = hitTest(current, msg.x, msg.y);
    const out: (ParcelHit & { ring?: number[][] }) | null = hit
      ? { ...hit }
      : null;
    (self as any).postMessage({ type: 'hit', id: msg.id, hit: out, scheme: currentScheme });
    return;
  }
  // Testability: let a verifier enumerate parcel centroids without pulling the
  // whole vertex array across the thread boundary.
  if (msg.type === 'probe') {
    if (!current) {
      (self as any).postMessage({ type: 'probe', id: msg.id, items: [] });
      return;
    }
    const items = [];
    for (let i = 0; i < current.nParcels; i++) {
      items.push({
        key: current.keys[current.keyIndex[i]],
        cx: current.centroids[i * 2],
        cy: current.centroids[i * 2 + 1],
        n: current.vcounts[i],
        est: !!current.isEstimated[i],
      });
    }
    (self as any).postMessage({ type: 'probe', id: msg.id, items });
    return;
  }
};
