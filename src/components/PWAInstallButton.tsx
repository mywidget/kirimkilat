import React, { useState } from 'react';
import { Smartphone, Check, Loader2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstalled, isIOS, isInstalling, executeDirectInstall } = usePWAInstall();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // If already running in standalone mode (already installed as PWA), don't show the install button
  if (isInstalled) {
    return null;
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInstalling) return;

    // Direct execution: triggers native OS/Chrome install prompt dialog immediately
    const result = await executeDirectInstall();

    if (result === 'accepted') {
      showToast('Aplikasi KirimKilat berhasil dipasang ke Layar Utama!');
    } else if (result === 'dismissed') {
      // User cancelled browser prompt; do nothing intrusive
    } else if (result === 'unsupported') {
      if (isIOS) {
        showToast("Di Safari iPhone: Ketuk tombol Share (⎋) lalu pilih 'Tambah ke Layar Utama'");
      } else {
        // Fallback notification if browser hasn't fired beforeinstallprompt
        showToast('Meminta instalasi sistem ke browser Android Anda...');
      }
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="Pasang aplikasi KirimKilat langsung ke layar utama Android"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-75 disabled:cursor-wait ${className}`}
        >
          {isInstalling ? (
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          ) : (
            <Smartphone className="w-3.5 h-3.5 text-emerald-100" />
          )}
          <span>{isInstalling ? 'Memproses...' : 'Install Android'}</span>
          {!isInstalling && <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />}
        </button>
      )}

      {variant === 'floating' && (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="Pasang KirimKilat ke Layar Utama"
          className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-emerald-600 shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer border border-white/20 disabled:opacity-75 disabled:cursor-wait ${className}`}
        >
          {isInstalling ? (
            <Loader2 className="w-4 h-4 text-emerald-200 animate-spin" />
          ) : (
            <Smartphone className="w-4 h-4 text-emerald-200" />
          )}
          <span>{isInstalling ? 'Memproses Instalasi...' : 'Install KirimKilat (Android)'}</span>
          {!isInstalling && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
        </button>
      )}

      {/* Lightweight non-intrusive Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-200 max-w-[90vw] text-center">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
