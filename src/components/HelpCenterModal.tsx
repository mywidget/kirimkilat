import React from 'react';
import { X, Headphones, Phone, MessageSquare, Clock, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Pusat Bantuan & Layanan Logistik</h2>
              <p className="text-emerald-100 text-xs">KirimKilat Sentra Cetak Mandiri (Sayuti.Com)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://wa.me/6281288889999?text=Halo%20KirimKilat%20Sayuti,%20saya%20butuh%20bantuan%20terkait%20pengiriman"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors flex flex-col gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block group-hover:text-emerald-800">
                  WhatsApp Dispatcher
                </span>
                <span className="text-slate-500 text-[11px]">Respon instan 24/7</span>
              </div>
              <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 mt-auto">
                Chat Sekarang <ExternalLink className="w-3 h-3" />
              </span>
            </a>

            <a
              href="tel:0254200000"
              className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors flex flex-col gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block group-hover:text-indigo-800">
                  Hotline Kantor Hub
                </span>
                <span className="text-slate-500 text-[11px]">(0254) 200-000</span>
              </div>
              <span className="text-indigo-700 font-semibold text-[11px] flex items-center gap-1 mt-auto">
                Panggil Kantor <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </div>

          {/* Operational Info */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Jam Operasional Kurir & Pengiriman</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pengantaran kurir dilakukan setiap hari Senin - Sabtu pukul 08:00 - 18:00 WIB. Pelacakan GPS real-time aktif selama kurir dalam status perjalanan pengantaran.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Lokasi Hub Utama (Sentra Cetak Mandiri)</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Jl. Raya Serang - Pandeglang KM 3.5, Ruko Golden Sempu Blok B-12, Kota Serang, Banten.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sistem Terintegrasi Sayuti.Com POS & Real-Time GPS Tracking</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
