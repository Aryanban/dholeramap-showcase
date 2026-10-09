/**
 * WebKit and Chromium cross-platform device memory tier detection.
 * Resolves Safari/WKWebView limitation where navigator.deviceMemory is undefined.
 */
export function isLowMemoryDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Chromium deviceMemory API
  if ('deviceMemory' in navigator && typeof (navigator as any).deviceMemory === 'number') {
    return (navigator as any).deviceMemory < 4;
  }

  // 2. WebKit / iOS WKWebView Heuristic:
  // Detect low-spec iOS hardware (iPhone SE 1st-3rd gen, iPhone 8/mini) via screen dimensions & cores
  const isNarrowScreen = window.screen.width <= 390;
  const isLowCores = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  
  // 3. WebGL texture size constraint check (low-spec GPU / unified memory ceiling)
  let isConstrainedGPU = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const maxTextureSize = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE);
      isConstrainedGPU = maxTextureSize <= 4096;
    }
  } catch {
    isConstrainedGPU = false;
  }

  return (isNarrowScreen && isLowCores) || isConstrainedGPU;
}
