/**
 * B6: decode a scheme's parcels.bin into flat typed arrays and answer
 * point-in-polygon hit queries. Runs entirely in a Web Worker so the main
 * thread never blocks on a scan.
 *
 * Format (all little-endian), written by extract/encode.py:
 *   header    "DPB1" + canvas(f2) + nParcels + nVertices + nStrings + scale(f)
 *   strings   nStrings x (uint16 len + utf-8)
 *   parcels   nParcels x 44 B: origin(i2) bbox(i4) voff(I) vcount(H) flags(H) key(I) centroid(f2)
 *   vertices  nVertices x (int32 dx, int32 dy)
 *
 * A ring vertex is reconstructed by a running sum of int32 deltas from the
 * parcel's int32 origin, then divided by coordScale to get back site units.
 */

const PARCEL_SIZE = 44;

export interface ParcelHit {
  key: string;
  isEstimated: boolean;
  centroid: [number, number];
  nVertices: number;
  /** index of the parcel record, for callers that need array identity */
  index: number;
}

export interface DecodedParcels {
  nParcels: number;
  canvas: [number, number];
  keys: string[];
  keyIndex: Uint32Array;
  isEstimated: Uint8Array;
  centroids: Float32Array;
  bboxes: Int32Array;
  origins: Int32Array;
  voffs: Uint32Array;
  vcounts: Uint16Array;
  verts: Int32Array;
  coordScale: number;
}

export function decode(buf: ArrayBuffer): DecodedParcels {
  const dv = new DataView(buf);
  const magic = String.fromCharCode(...new Uint8Array(buf, 0, 4));
  if (magic !== "DPB1") throw new Error(`bad parcels.bin magic: ${magic}`);

  let p = 4;
  const canvas: [number, number] = [dv.getFloat32(p, true), dv.getFloat32(p + 4, true)];
  p += 8;
  const nParcels = dv.getUint32(p, true); p += 4;
  const nVertices = dv.getUint32(p, true); p += 4;
  const nStrings = dv.getUint32(p, true); p += 4;
  const coordScale = dv.getFloat32(p, true); p += 4;

  const keys: string[] = new Array(nStrings);
  for (let i = 0; i < nStrings; i++) {
    const len = dv.getUint16(p, true); p += 2;
    keys[i] = new TextDecoder().decode(new Uint8Array(buf, p, len));
    p += len;
  }
  // the variable-length string table is padded so the parcel section starts on
  // a 4-byte boundary (it is aliased as Int32Array below)
  p = (p + 3) & ~3;

  const parcelBase = p;
  const vertexBase = parcelBase + nParcels * PARCEL_SIZE;

  // alias the fixed fields without copying
  const i32 = new Int32Array(buf, parcelBase, (nParcels * PARCEL_SIZE) / 4);
  const f32 = new Float32Array(buf, parcelBase, (nParcels * PARCEL_SIZE) / 4);
  const u16 = new Uint16Array(buf, parcelBase, (nParcels * PARCEL_SIZE) / 2);

  const origins = new Int32Array(nParcels * 2);
  const bboxes = new Int32Array(nParcels * 4);
  const voffs = new Uint32Array(nParcels);
  const vcounts = new Uint16Array(nParcels);
  const isEstimated = new Uint8Array(nParcels);
  const centroids = new Float32Array(nParcels * 2);

  // struct layout (44 B = 11 int32 slots): origin(2) bbox(4) voff(1) vcount+flags(1) key(1) centroid(2 floats)
  const I32 = 11;
  const keyIndex = new Uint32Array(nParcels);
  for (let i = 0; i < nParcels; i++) {
    const b = i * I32;
    origins[i * 2] = i32[b];
    origins[i * 2 + 1] = i32[b + 1];
    bboxes[i * 4] = i32[b + 2];
    bboxes[i * 4 + 1] = i32[b + 3];
    bboxes[i * 4 + 2] = i32[b + 4];
    bboxes[i * 4 + 3] = i32[b + 5];
    voffs[i] = i32[b + 6] >>> 0;
    // vcount(H) + flags(H) share slot 7
    const cf = i32[b + 7];
    vcounts[i] = cf & 0xffff;
    isEstimated[i] = (cf >>> 16) & 1;
    keyIndex[i] = i32[b + 8] >>> 0;
    centroids[i * 2] = f32[b + 9];
    centroids[i * 2 + 1] = f32[b + 10];
  }

  const verts = new Int32Array(buf, vertexBase, nVertices * 2);
  return { nParcels, canvas, keys, keyIndex, isEstimated, centroids, bboxes, origins, voffs, vcounts, verts, coordScale };
}

/** Ray-casting containment on the decoded ring. */
export function contains(d: DecodedParcels, i: number, x: number, y: number): boolean {
  const bx = d.bboxes[i * 4], by = d.bboxes[i * 4 + 1];
  const bx2 = d.bboxes[i * 4 + 2], by2 = d.bboxes[i * 4 + 3];
  const ix = x * d.coordScale, iy = y * d.coordScale;
  if (ix < bx || ix > bx2 || iy < by || iy > by2) return false;

  const n = d.vcounts[i];
  let cx = d.origins[i * 2];
  let cy = d.origins[i * 2 + 1];
  const off = d.voffs[i] * 2;
  const v = d.verts;

  // first vertex is the origin itself; each stored vertex is an int32 delta
  // from the previous one (8 B/vertex), so the stride is two int32 slots
  let px = cx, py = cy;
  let inside = false;
  for (let k = 0; k < n; k++) {
    cx += v[off + k * 2];
    cy += v[off + k * 2 + 1];
    const qx = cx, qy = cy;
    if (((py > iy) !== (qy > iy)) &&
        (ix < (px - qx) * (iy - qy) / ((py - qy) || 1e-12) + qx)) {
      inside = !inside;
    }
    px = qx;
    py = qy;
  }
  return inside;
}

/** Full scan; returns the topmost (largest-area is NOT used -- first hit wins
 *  since cadastral rings are non-overlapping by construction). */
export function hitTest(d: DecodedParcels, x: number, y: number): ParcelHit | null {
  for (let i = 0; i < d.nParcels; i++) {
    if (contains(d, i, x, y)) {
      return {
        key: d.keys[d.keyIndex[i]],
        isEstimated: !!d.isEstimated[i],
        centroid: [d.centroids[i * 2], d.centroids[i * 2 + 1]],
        nVertices: d.vcounts[i],
        index: i,
      };
    }
  }
  return null;
}
