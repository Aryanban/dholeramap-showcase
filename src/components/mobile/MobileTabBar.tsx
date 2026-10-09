'use client';
import React from 'react';
import { Search, Map as MapIcon, FileText, Bookmark, MoreHorizontal } from 'lucide-react';
import { useApp } from '@/lib/store';
export default function MobileTabBar() {
  const sheet = useApp((s) => s.mobileSheet);
  const setMobileSheet = useApp((s) => s.setMobileSheet);
  const setMobileSearchOpen = useApp((s) => s.setMobileSearchOpen);
  const mobileMoreOpen = useApp((s) => s.mobileMoreOpen);
  const setMobileMoreOpen = useApp((s) => s.setMobileMoreOpen);
  const bookmarks = useApp((s) => s.bookmarks);
  return (
    <nav aria-label="Primary" className="md:hidden fixed bottom-0 inset-x-0 z-[1060] bg-white/95 backdrop-blur-md border-t border-slate-200" style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}>
      <div className="grid grid-cols-5 px-1 pt-1">
        <TabBtn active={false} onClick={() => setMobileSearchOpen(true)} icon={<Search className="w-[22px] h-[22px]" />} label="Search" />
        <TabBtn active={sheet==='schemes'} onClick={() => setMobileSheet(sheet==='schemes' ? 'none' : 'schemes')} icon={<MapIcon className="w-[22px] h-[22px]" />} label="Schemes" />
        <TabBtn active={sheet==='plot'} onClick={() => setMobileSheet(sheet==='plot' ? 'none' : 'plot')} icon={<FileText className="w-[22px] h-[22px]" />} label="Plot" dot={false} />
        <TabBtn active={sheet==='saved'} onClick={() => setMobileSheet(sheet==='saved' ? 'none' : 'saved')} icon={<Bookmark className="w-[22px] h-[22px]" />} label="Saved" badge={bookmarks.length} />
        <TabBtn active={mobileMoreOpen} onClick={() => setMobileMoreOpen(!mobileMoreOpen)} icon={<MoreHorizontal className="w-[22px] h-[22px]" />} label="More" />
      </div>
    </nav>
  );
}
function TabBtn({ active, onClick, icon, label, badge, dot }: any) {
  return (
    <button onClick={onClick} className={"relative flex flex-col items-center justify-center py-1.5 rounded-xl transition active:scale-95 min-h-[52px] " + (active ? 'text-blue-600' : 'text-slate-500')}>
      {active ? <span className="absolute top-0 w-8 h-1 rounded-full bg-blue-600" /> : null}
      <span className="relative">{icon}
        {typeof badge === 'number' && badge > 0 ? (<span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">{badge > 99 ? '99+' : badge}</span>) : null}
        {dot ? <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500" /> : null}
      </span>
      <span className={"text-[10.5px] mt-0.5 " + (active ? 'font-extrabold' : 'font-semibold')}>{label}</span>
    </button>
  );
}
