import React, { useState } from 'react';
import { Download, Smartphone, Check, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone mode (already installed), don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      const success = await install();
      setIsInstalling(false);
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          title="Pasang aplikasi KirimKilat di HP Android / Perangkat Anda"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-100" />
          <span>Install Android</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
        </button>
      )}

      {variant === 'floating' && (
        <button
          onClick={handleInstallClick}
          className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-emerald-600 shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer border border-white/20 ${className}`}
        >
          <Smartphone className="w-4 h-4 text-emerald-200" />
          <span>Install KirimKilat (Android)</span>
          <Download className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Android & PWA Install Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-5 relative">
              <button
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Install KirimKilat PWA</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Aplikasi Android & Perangkat Ringan Tanpa PlayStore
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Pelacakan Cepat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Hemat Kuota & Memori</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Notifikasi Pesanan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Layar Penuh (Full App)</span>
                </div>
              </div>

              {/* Direct Prompt Button if Browser Trigger is Ready */}
              {isInstallable && (
                <button
                  onClick={async () => {
                    const ok = await install();
                    if (ok) setShowGuideModal(false);
                  }}
                  disabled={isInstalling}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstalling ? 'Memproses Pasang...' : 'Pasang Sekarang ke Layar Utama'}</span>
                </button>
              )}

              {/* Android Chrome Step-by-Step Instructions */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Cara Pasang di HP Android (Google Chrome):</span>
                </h4>

                <ol className="space-y-2 pl-1">
                  <li className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="text-[11px] text-slate-700 leading-snug">
                      Buka aplikasi ini di browser <strong>Google Chrome</strong> di HP Android Anda.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="text-[11px] text-slate-700 leading-snug">
                      Ketuk menu titik tiga <strong>(⋮)</strong> di pojok kanan atas browser.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="text-[11px] text-slate-700 leading-snug">
                      Pilih <strong>"Pasang aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span className="text-[11px] text-slate-700 leading-snug">
                      Konfirmasi <strong>"Pasang"</strong>. Ikon <strong>KirimKilat</strong> akan langsung terpasang di menu HP Android Anda!
                    </span>
                  </li>
                </ol>
              </div>

              {/* iOS Note if on iPhone */}
              {isIOS && (
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">Pengguna iPhone / iOS Safari:</span>
                  <span>
                    Ketuk tombol <strong>Share</strong> (ikon kotak berpanah ke atas) di Safari, lalu pilih <strong>"Add to Home Screen"</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PWA Terverifikasi Standar W3C</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
