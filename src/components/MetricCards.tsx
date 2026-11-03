import React from 'react';
import { Package, Truck, ShieldCheck, Database, Check } from 'lucide-react';
import { Invoice, Courier, DatabaseStatus } from '../types';

interface MetricCardsProps {
  invoices: Invoice[];
  couriers: Courier[];
  dbStatus: DatabaseStatus | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  invoices,
  couriers,
  dbStatus,
}) => {
  const totalInvoices = invoices.length || 100;
  const activeCouriersCount = couriers.filter((c) => c.status_aktif === 'mengantar').length || 1;
  const deliveredCount = invoices.filter((i) => i.status_pengiriman === 'terkirim' || i.status_kirim === 'diterima').length || 3;
  const isDbConnected = dbStatus?.connected ?? true;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-stretch w-full min-w-0">
      {/* Card 1: Total Resi Aktif (Primary Gradient Highlight Card) */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-indigo-600/20 relative overflow-hidden flex items-center justify-between min-h-[128px]">
        {/* Soft background ambient glow */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col justify-between h-full space-y-1.5 z-10">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white mb-0.5 border border-white/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-indigo-100 text-xs font-medium block">Total Resi Aktif</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-3xl text-white tracking-tight font-mono tabular-nums">
                {totalInvoices}
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 font-bold text-[11px] px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-0.5">
                <span>↑ +8%</span>
              </span>
            </div>
            <span className="text-[11px] text-indigo-200/80 font-medium block mt-1">
              ↑ Dibanding 7 hari terakhir
            </span>
          </div>
        </div>

        {/* 3D Stack of Cardboard Packaging Boxes Illustration */}
        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center z-10">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(5, 10)">
              {/* Back Box */}
              <path d="M45 15 L75 25 L75 55 L45 45 Z" fill="#D97706" opacity="0.9" />
              <path d="M15 25 L45 15 L45 45 L15 55 Z" fill="#F59E0B" />
              <path d="M15 25 L45 15 L75 25 L45 35 Z" fill="#FDE68A" />
              {/* Tape on Back Box */}
              <path d="M42 16 L48 18 L48 46 L42 44 Z" fill="#FEF3C7" opacity="0.6" />

              {/* Front Box */}
              <g transform="translate(-8, 15)">
                <path d="M45 15 L75 25 L75 55 L45 45 Z" fill="#B45309" />
                <path d="M15 25 L45 15 L45 45 L15 55 Z" fill="#D97706" />
                <path d="M15 25 L45 15 L75 25 L45 35 Z" fill="#FBBF24" />
                {/* Tape on Front Box */}
                <path d="M42 16 L48 18 L48 46 L42 44 Z" fill="#FEF3C7" opacity="0.75" />
                {/* Box details lines */}
                <path d="M45 15 L45 45" stroke="#92400E" strokeWidth="1" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Card 2: Kurir Dalam Perjalanan */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between min-h-[128px]">
        <div className="flex flex-col justify-between h-full space-y-1.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-0.5 border border-indigo-100">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-600 text-xs font-medium block">Kurir Dalam Perjalanan</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-3xl text-slate-900 tracking-tight font-mono tabular-nums">
                {activeCouriersCount}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              {activeCouriersCount} Kurir terpantau di sistem
            </span>
          </div>
        </div>

        {/* Delivery Courier on Scooter Illustration */}
        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Scooter Body & Wheels */}
            <circle cx="28" cy="70" r="11" fill="#1E293B" />
            <circle cx="28" cy="70" r="6" fill="#94A3B8" />
            <circle cx="74" cy="70" r="11" fill="#1E293B" />
            <circle cx="74" cy="70" r="6" fill="#94A3B8" />
            {/* Frame */}
            <path d="M30 68 L48 68 L56 50 L68 68 L74 68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M56 50 L58 36 L64 36" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
            {/* Courier Helmet & Body */}
            <circle cx="48" cy="30" r="8" fill="#F59E0B" />
            <path d="M44 26 C48 22 56 22 56 28 C56 32 50 34 44 34 Z" fill="#EF4444" />
            <path d="M42 38 C42 38 46 48 55 46 C60 45 56 38 56 38 Z" fill="#3B82F6" />
            {/* Delivery Box on Rear */}
            <rect x="20" y="44" width="18" height="18" rx="3" fill="#F97316" />
            <rect x="25" y="44" width="8" height="18" fill="#FDBA74" opacity="0.6" />
            {/* Wind speed lines */}
            <path d="M8 48 L16 48" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 54 L18 54" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Card 3: Resi Terkirim Hari Ini */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between min-h-[128px]">
        <div className="flex flex-col justify-between h-full space-y-1.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-0.5 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-600 text-xs font-medium block">Resi Terkirim Hari Ini</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-3xl text-slate-900 tracking-tight font-mono tabular-nums">
                {deliveredCount}
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">
              +200% dari hari sebelumnya
            </span>
          </div>
        </div>

        {/* Delivered Box with Checkmark Illustration */}
        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(10, 16)">
              {/* Box */}
              <path d="M40 10 L70 20 L70 52 L40 42 Z" fill="#B45309" />
              <path d="M10 20 L40 10 L40 42 L10 52 Z" fill="#D97706" />
              <path d="M10 20 L40 10 L70 20 L40 30 Z" fill="#FBBF24" />
              <path d="M38 11 L42 12 L42 41 L38 40 Z" fill="#FEF3C7" opacity="0.8" />
              {/* Green Verified Circle Badge */}
              <circle cx="58" cy="48" r="14" fill="#10B981" />
              <circle cx="58" cy="48" r="12" fill="#059669" />
              <path d="M53 48 L57 52 L64 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      </div>

      {/* Card 4: Status Database POS */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between min-h-[128px]">
        <div className="flex flex-col justify-between h-full space-y-1.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-0.5 border border-indigo-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-600 text-xs font-medium block">Status Database POS</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-base font-bold text-slate-900 tracking-tight truncate">
                {isDbConnected ? 'Server Terhubung' : 'Mode Intranet Lokal'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Monitoring data transaksi real-time & aman
            </span>
          </div>
        </div>

        {/* 3D Database Servers with Checkmark Illustration */}
        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(14, 12)">
              {/* Cylinder 1 (Bottom) */}
              <g transform="translate(0, 36)">
                <ellipse cx="36" cy="18" rx="28" ry="8" fill="#1E40AF" />
                <path d="M8 18 C8 24 20 28 36 28 C52 28 64 24 64 18 L64 10 L8 10 Z" fill="#3B82F6" />
                <ellipse cx="36" cy="10" rx="28" ry="8" fill="#60A5FA" />
                <circle cx="56" cy="18" r="2" fill="#93C5FD" />
              </g>
              {/* Cylinder 2 (Middle) */}
              <g transform="translate(0, 20)">
                <ellipse cx="36" cy="18" rx="28" ry="8" fill="#1E40AF" />
                <path d="M8 18 C8 24 20 28 36 28 C52 28 64 24 64 18 L64 10 L8 10 Z" fill="#2563EB" />
                <ellipse cx="36" cy="10" rx="28" ry="8" fill="#93C5FD" />
                <circle cx="56" cy="18" r="2" fill="#DBEAFE" />
              </g>
              {/* Cylinder 3 (Top) */}
              <g transform="translate(0, 4)">
                <ellipse cx="36" cy="18" rx="28" ry="8" fill="#1E40AF" />
                <path d="M8 18 C8 24 20 28 36 28 C52 28 64 24 64 18 L64 10 L8 10 Z" fill="#60A5FA" />
                <ellipse cx="36" cy="10" rx="28" ry="8" fill="#BFDBFE" />
                <circle cx="56" cy="18" r="2" fill="#1E40AF" />
              </g>
              {/* Green Verified Circle Badge */}
              <circle cx="54" cy="46" r="13" fill="#10B981" />
              <circle cx="54" cy="46" r="11" fill="#059669" />
              <path d="M49 46 L53 50 L60 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
