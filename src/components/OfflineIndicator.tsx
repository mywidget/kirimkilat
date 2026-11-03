import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Status Koneksi"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 text-white px-4 py-2.5 text-xs font-medium shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in slide-in-from-bottom"
    >
      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="font-bold text-amber-400 block">Mode Offline (PWA)</span>
        <span className="text-slate-300 text-[11px]">Menggunakan data cache lokal perangkat</span>
      </div>
    </aside>
  );
};
