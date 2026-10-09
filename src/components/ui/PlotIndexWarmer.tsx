'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/store';
import { DATA_VERSION } from '@/lib/sheets';
import { prewarmPlotIndex } from '@/lib/tile-prewarm';

/**
 * Warms the active scheme's plots index (`plots.json`, 1.4-6.8 MB) into the
 * service-worker / HTTP cache as soon as the sheet changes — before the map
 * requests it — so the first sheet switch does not stall on a large fetch.
 * Renders nothing; purely a cache-warming side effect.
 */
export default function PlotIndexWarmer() {
  const activeSid = useApp((s) => s.activeSid);

  useEffect(() => {
    prewarmPlotIndex(activeSid, DATA_VERSION);
  }, [activeSid]);

  return null;
}
