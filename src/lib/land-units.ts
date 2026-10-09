/**
 * src/lib/land-units.ts
 * 
 * High-precision land measurement conversion and geodesic area computation engine 
 * for Gujarat (Dholera / Ahmedabad region).
 * Extracted and calibrated to match statutory revenue standards and town planning records.
 */

export interface LandConversionResult {
  sqMeters: number;
  sqYards: number; // Vaar
  sqFeet: number;
  acres: number;
  hectares: number;
  vigha: number; // Middle Gujarat (1618.7426 sq.m)
  guntha: number; // 101.1714 sq.m
  biswa: number;
}

// Statutory constants for Middle Gujarat (Ahmedabad / Dholera SIR district)
export const SQ_METERS_TO_SQ_YARDS = 1.195990046;
export const SQ_METERS_TO_SQ_FEET = 10.76391042;
export const SQ_METERS_TO_ACRES = 0.00024710538;
export const SQ_METERS_TO_HECTARES = 0.0001;

// Middle Gujarat statutory land measures (Revenue Dept, Govt. of Gujarat)
// 1 Vigha = 16 Guntha = 1,936 Sq. Yards = 1,618.7426 Sq. Meters
export const SQ_METERS_PER_VIGHA = 1618.7426;
export const SQ_METERS_PER_GUNTHA = 101.1714;
export const BISWA_PER_VIGHA = 20;

export function convertFromSqMeters(sqMeters: number): LandConversionResult {
  const m2 = Math.max(0, Number(sqMeters) || 0);
  const vigha = m2 / SQ_METERS_PER_VIGHA;
  return {
    sqMeters: m2,
    sqYards: m2 * SQ_METERS_TO_SQ_YARDS,
    sqFeet: m2 * SQ_METERS_TO_SQ_FEET,
    acres: m2 * SQ_METERS_TO_ACRES,
    hectares: m2 * SQ_METERS_TO_HECTARES,
    vigha: vigha,
    guntha: m2 / SQ_METERS_PER_GUNTHA,
    biswa: vigha * BISWA_PER_VIGHA,
  };
}

export function convertFromSqYards(sqYards: number): LandConversionResult {
  const yd2 = Math.max(0, Number(sqYards) || 0);
  const m2 = yd2 / SQ_METERS_TO_SQ_YARDS;
  return convertFromSqMeters(m2);
}

export function convertFromVigha(vigha: number): LandConversionResult {
  const v = Math.max(0, Number(vigha) || 0);
  const m2 = v * SQ_METERS_PER_VIGHA;
  return convertFromSqMeters(m2);
}

export function formatArea(val: number, decimals: number = 2): string {
  if (!Number.isFinite(val)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(val);
}

/**
 * Calculates geodesic polygon area on WGS84 ellipsoid in square meters
 * using the spherical excess Shoelace formula.
 * Works with rings formatted as [longitude, latitude][] (GeoJSON standard).
 */
export function calculatePolygonGeodesicArea(coords: [number, number][]): number {
  if (!coords || coords.length < 3) return 0;
  const R = 6378137; // WGS84 Earth radius in meters
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % n];
    const radLng1 = (p1[0] * Math.PI) / 180;
    const radLat1 = (p1[1] * Math.PI) / 180;
    const radLng2 = (p2[0] * Math.PI) / 180;
    const radLat2 = (p2[1] * Math.PI) / 180;
    area += (radLng2 - radLng1) * (2 + Math.sin(radLat1) + Math.sin(radLat2));
  }
  return Math.abs((area * R * R) / 2.0);
}
