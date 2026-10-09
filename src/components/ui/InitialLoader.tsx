'use client';

import React, { useEffect, useState } from 'react';

export default function InitialLoader() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let unmounted = false;
    function dismiss() {
      if (unmounted) return;
      setFading(true);
      setTimeout(() => {
        if (!unmounted) setMounted(false);
      }, 400);
    }
    (window as any).dismissPlotBookLoader = dismiss;
    window.addEventListener('plotbook:map-ready', dismiss);
    const timer = setTimeout(dismiss, 1200);
    return () => {
      unmounted = true;
      clearTimeout(timer);
      window.removeEventListener('plotbook:map-ready', dismiss);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        #plotbook-initial-loader {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ece9e2;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.4s;
          padding: 1rem;
          user-select: none;
          pointer-events: none;
        }
        .pb-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 20px;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.04);
          padding: 1.75rem;
          text-align: center;
          animation: pbFadeUp 0.4s ease-out;
        }
        @keyframes pbFadeUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pb-logo-wrap {
          position: relative;
          width: 58px;
          height: 58px;
          margin: 0 auto 1rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pb-radar-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          opacity: 0.4;
          animation: pbPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes pbPing {
          75%, 100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .pb-logo-img {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          object-fit: contain;
          background: #ffffff;
        }
        .pb-brand-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .pb-brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: #0f172a;
        }
        .pb-brand-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .pb-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }
        .pb-status-box {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          padding: 1rem 1.15rem;
          margin-bottom: 1.25rem;
        }
        .pb-spinner-row {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          text-align: left;
        }
        .pb-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: pbSpin 0.75s linear infinite;
          flex-shrink: 0;
        }
        @keyframes pbSpin {
          to { transform: rotate(360deg); }
        }
        .pb-msg-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.25;
        }
        .pb-msg-sub {
          font-size: 0.75rem;
          color: #475569;
          margin-top: 0.2rem;
          line-height: 1.35;
        }
        .pb-patience-callout {
          font-weight: 600;
          color: #2563eb;
        }
        .pb-progress-track {
          margin-top: 0.875rem;
          height: 4px;
          width: 100%;
          background: #e2e8f0;
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }
        .pb-progress-bar {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40%;
          background: linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8);
          border-radius: 9999px;
          animation: pbIndeterminate 1.4s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }
        @keyframes pbIndeterminate {
          0% { left: -40%; width: 40%; }
          50% { left: 40%; width: 60%; }
          100% { left: 100%; width: 30%; }
        }
        .pb-features-row {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .pb-feature-pill {
          font-size: 0.68rem;
          font-weight: 600;
          color: #475569;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.25rem 0.55rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
      `,
        }}
      />

      <div
        id="plotbook-initial-loader"
        aria-live="polite"
        aria-busy="true"
        style={{
          opacity: fading ? 0 : 1,
          pointerEvents: fading ? 'none' : 'auto',
          transition: 'opacity 0.5s ease-out',
        }}
      >
        <div className="pb-card">
          <div className="pb-logo-wrap">
            <div className="pb-radar-ring" />
            {/* Native <img> tag ensures immediate rendering without waiting for Next.js Image hydration */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-96.png"
              alt="DholeraMap — Dholera SIR Interactive Atlas and Town Planning Maps"
              width="54"
              height="54"
              className="pb-logo-img"
            />
          </div>

          <div className="pb-brand-row">
            <div className="pb-brand-title font-black">
              Dholera<span className="text-blue-600">Map</span>
            </div>
            <span className="pb-brand-badge font-black">GIS</span>
          </div>
          <p className="pb-subtitle">Official Interactive GIS Atlas & Land Records</p>

          <div className="pb-status-box">
            <div className="pb-spinner-row">
              <div className="pb-spinner" />
              <div>
                <div className="pb-msg-title">Initializing Interactive Atlas…</div>
                <div className="pb-msg-sub">
                  Loading 18,161 statutory survey numbers & vector tiles.{' '}
                  <span className="pb-patience-callout">Please wait patiently.</span>
                </div>
              </div>
            </div>

            <div className="pb-progress-track">
              <div className="pb-progress-bar" />
            </div>
          </div>

          <div className="pb-features-row">
            <span className="pb-feature-pill">TP Schemes 1–6</span>
            <span className="pb-feature-pill">DGDCR Regulations</span>
            <span className="pb-feature-pill">60 FPS DeepZoom</span>
          </div>
        </div>
      </div>
    </>
  );
}
