'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="relative group">
      <pre className="bg-slate-950 text-slate-100 text-xs sm:text-sm font-mono p-4 rounded-2xl overflow-x-auto border border-slate-800 selection:bg-blue-600">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className={`absolute top-3 right-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer shadow-sm ${
          copied
            ? 'bg-emerald-600 text-white border-emerald-500'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
        }`}
        title="Copy embed code to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Snippet</span>
          </>
        )}
      </button>
    </div>
  );
}
