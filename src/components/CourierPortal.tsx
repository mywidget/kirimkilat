import React, { useState } from 'react';
import { Courier, Invoice, AppUser } from '../types';
import {
  Truck,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  Scan,
  Check,
  ShieldCheck,
  Play,
  Navigation,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Barcode,
  Clock,
  Shield,
} from 'lucide-react';
import { CourierScannerModal } from './CourierScannerModal';

interface CourierPortalProps {
  couriers: Courier[];
  invoices: Invoice[];
  onToggleDiambil: (invoiceId: number, currentDiambil: number) => void;
  onUpdateStatus: (
    invoiceId: number,
    status: Invoice['status_pengiriman'],
    meta?: { catatan_kurir?: string; nama_penerima?: string }
  ) => void;
  onSendCourierGps: (courierId: number, lat: number, lng: number) => void;
  onAdvanceStep: (courierId: number) => void;
  onScanSubInvoice: (id_sub_invoice: string, courierId: number) => Promise<boolean>;
  currentUser?: AppUser | null;
}

export const CourierPortal: React.FC<CourierPortalProps> = ({
  couriers,
  invoices,
  onToggleDiambil,
  onUpdateStatus,
  onAdvanceStep,
  onScanSubInvoice,
  currentUser,
}) => {
  // If logged in as courier, bind to their courier ID
  const defaultCourierId =
    currentUser?.level === 'kurir' && currentUser.id_kurir
      ? currentUser.id_kurir
      : couriers[0]?.id || 1;

  const [selectedCourierId, setSelectedCourierId] = useState<number>(defaultCourierId);
  const [recipientName, setRecipientName] = useState('');
  const [showDeliveryCompleteModal, setShowDeliveryCompleteModal] = useState(false);
  const [completingInvoice, setCompletingInvoice] = useState<Invoice | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeTabManifest, setActiveTabManifest] = useState<'akan_diantar' | 'selesai'>('akan_diantar');
  const [deliveredSuccessNotice, setDeliveredSuccessNotice] = useState<string | null>(null);

  const activeCourier = couriers.find((c) => c.id === selectedCourierId) || couriers[0];

  // Helper to determine if an invoice has already been delivered & handed over
  const isInvoiceCompleted = (inv: Invoice) => {
    return inv.status_pengiriman === 'terkirim' || inv.status_kirim === 'diterima';
  };

  // All packages assigned to this courier where delivery method is kurir/dikirim
  const courierAllPackages = invoices.filter(
    (inv) =>
      (inv.cara_ambil === undefined || inv.cara_ambil === 'dikirim') &&
      (inv.id_kurir === activeCourier?.id || inv.id === activeCourier?.id_invoice_aktif)
  );

  // 1. ACTIVE MANIFEST: Only packages that are pending delivery (NOT yet delivered/received)
  const activeManifestList = courierAllPackages.filter((inv) => !isInvoiceCompleted(inv));

  // 2. COMPLETED HISTORY: Packages that have been confirmed arrived & handed over
  const completedManifestList = courierAllPackages.filter((inv) => isInvoiceCompleted(inv));

  // Unscanned invoices (diambil === 0 & cara_ambil === 'dikirim' & not yet delivered)
  const unscannedInvoices = invoices.filter(
    (inv) =>
      (inv.cara_ambil === undefined || inv.cara_ambil === 'dikirim') &&
      inv.diambil === 0 &&
      !isInvoiceCompleted(inv)
  );

  const handleStartDelivery = (inv: Invoice) => {
    onUpdateStatus(inv.id, 'dalam_perjalanan');
    onAdvanceStep(activeCourier.id);
  };

  const handleOpenCompleteModal = (inv: Invoice) => {
    setCompletingInvoice(inv);
    setShowDeliveryCompleteModal(true);
  };

  const handleConfirmDelivered = () => {
    if (!completingInvoice) return;
    const recipient = recipientName.trim() || completingInvoice.nama_pelanggan;
    onUpdateStatus(completingInvoice.id, 'terkirim', {
      nama_penerima: recipient,
      catatan_kurir: 'Paket diserahterimakan langsung dalam kondisi baik.',
    });
    setDeliveredSuccessNotice(
      `Paket ${completingInvoice.id_sub_invoice} telah selesai diantar ke "${recipient}". Paket otomatis dipindahkan dari daftar antar.`
    );
    setShowDeliveryCompleteModal(false);
    setCompletingInvoice(null);
    setRecipientName('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner: Courier Profile Switcher & Barcode Scan CTA */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={activeCourier?.foto}
              alt={activeCourier?.nama}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{activeCourier?.nama}</h2>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                {activeCourier?.plat_nomor}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manifes Antar: <span className="font-semibold text-slate-800">{activeManifestList.length} Paket Aktif</span>
              {completedManifestList.length > 0 && (
                <span className="text-emerald-700 font-semibold ml-1.5">
                  · {completedManifestList.length} Selesai Diserahterimakan
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Select Courier Profile */}
          {currentUser?.level === 'kurir' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Akun Kurir Lapangan</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Kurir:</span>
              <select
                value={selectedCourierId}
                onChange={(e) => setSelectedCourierId(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama} ({c.plat_nomor})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Primary Action: Scan Barcode / Resi Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Resi Paket Sebelum Antar</span>
          </button>
        </div>
      </div>

      {/* Notice Banner when a package is delivered */}
      {deliveredSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold leading-relaxed">{deliveredSuccessNotice}</span>
          </div>
          <button
            onClick={() => setDeliveredSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 rounded-md hover:bg-emerald-100 transition-colors shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Manifest Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {activeTabManifest === 'akan_diantar'
              ? 'Daftar Manifes Paket yang Akan Diantar & Alamat Tujuan'
              : 'Riwayat Paket yang Sudah Selesai Diantar & Serah Terima'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTabManifest === 'akan_diantar'
              ? 'Hanya menampilkan paket aktif yang perlu diantar. Paket yang sudah diserahterimakan otomatis tidak ditampilkan di sini.'
              : 'Daftar paket yang telah sampai di tujuan dan sukses diserahterimakan kepada pihak penerima.'}
          </p>
        </div>

        {/* Segmented Filter: Akan Diantar vs Riwayat Selesai */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTabManifest('akan_diantar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTabManifest === 'akan_diantar'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Akan Diantar</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTabManifest === 'akan_diantar'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeManifestList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTabManifest('selesai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTabManifest === 'selesai'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai Diterima</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTabManifest === 'selesai'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {completedManifestList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Manifest List Display */}
      <div className="space-y-4">
        {activeTabManifest === 'akan_diantar' ? (
          /* TAB 1: PAKET YANG AKAN DIANTAR (Hanya paket aktif / belum selesai) */
          activeManifestList.length === 0 ? (
            completedManifestList.length > 0 ? (
              <div className="bg-emerald-50/80 rounded-2xl border-2 border-dashed border-emerald-300 p-10 text-center text-slate-700 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Semua Paket Pada Manifes Telah Selesai Diantar!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Seluruh <b>{completedManifestList.length} paket</b> pada manifes kurir ini telah berhasil tiba di tujuan dan diserahterimakan kepada pihak penerima.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTabManifest('selesai')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lihat {completedManifestList.length} Riwayat Paket Selesai</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Paket di Manifes Kurir Ini</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Silakan klik tombol <b>Scan Resi Paket Sebelum Antar</b> untuk memindai paket percetakan yang siap diantar.
                </p>
              </div>
            )
          ) : (
            activeManifestList.map((inv, index) => {
              const isScanned = inv.diambil === 1;
              const isInTransit =
                inv.status_pengiriman === 'dalam_perjalanan' ||
                inv.status_pengiriman === 'mendekati_lokasi';

              return (
                <div
                  key={inv.id}
                  className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    !isScanned
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {/* Manifest Item Top Row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                            {inv.id_sub_invoice}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">({inv.no_invoice})</span>
                          {inv.no_referensi && (
                            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ref: {inv.no_referensi}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Order Cetak: {inv.tanggal}
                        </span>
                      </div>
                    </div>

                    {/* Scan Status Badge */}
                    <div className="flex items-center gap-2">
                      {isScanned ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SUDAH DI-SCAN (Siap Diantar)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <Barcode className="w-3.5 h-3.5" />
                          <span>BELUM DI-SCAN (Wajib Scan Paket)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Destination & Address Section (Balanced Equal-Height Grid) */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {/* Left Sub-Card: Alamat Tujuan Lengkap & Kontak Pemesan */}
                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between h-full space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Penerima & Alamat Pengantaran
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                              {inv.nama_pelanggan}
                            </h4>
                            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                              {inv.alamat_tujuan}, <span className="font-semibold text-slate-900">{inv.kota}</span>
                            </p>
                            {inv.catatan_kurir && (
                              <p className="text-[11px] text-indigo-700 bg-indigo-50/80 p-2 rounded-lg mt-1.5 border border-indigo-100">
                                <b>Instruksi Khusus:</b> {inv.catatan_kurir}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Navigation Buttons Pinned to Bottom */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/80 mt-auto">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${inv.alamat_tujuan}, ${inv.kota}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Buka Google Maps</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        <a
                          href={`https://wa.me/62${inv.no_telepon.replace(/[^0-9]/g, '').substring(1)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WA: {inv.no_telepon}</span>
                        </a>
                      </div>
                    </div>

                    {/* Right Sub-Card: Rincian Barang Cetakan & Keuangan */}
                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between h-full space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Rincian Item Produk Pesanan:
                          </span>
                          {inv.no_referensi && (
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ref: {inv.no_referensi}
                            </span>
                          )}
                        </div>
                        <div className="divide-y divide-slate-200/80 max-h-[140px] overflow-y-auto pr-1">
                          {inv.items && inv.items.length > 0 ? (
                            inv.items.map((item) => (
                              <div key={item.id} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                                <span className="font-semibold text-slate-800 truncate">{item.nama_barang}</span>
                                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/80 shrink-0">
                                  {item.qty} {item.satuan}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="py-2 text-slate-400 text-xs italic">Item percetakan standar</div>
                          )}
                        </div>
                      </div>

                      {/* Status Bayar Pinned to Bottom */}
                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between mt-auto">
                        <span className="text-slate-600 text-xs font-medium">Status Bayar:</span>
                        {inv.sisa_tagihan > 0 ? (
                          <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded text-xs border border-amber-200">
                            Wajib Tagih COD: Rp {inv.sisa_tagihan.toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded text-xs border border-emerald-200">
                            LUNAS (Tanpa COD)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Footer per Manifest Item */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      {isScanned ? (
                        <span>Di-scan pada: <b className="text-slate-800">{inv.waktu_diambil || 'Hari ini'}</b></span>
                      ) : (
                        <span className="text-amber-800 font-semibold">⚠️ Scan barcode resi sebelum armada berangkat</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isScanned ? (
                        <button
                          onClick={() => onScanSubInvoice(inv.id_sub_invoice, activeCourier.id)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Scan className="w-4 h-4" />
                          <span>Scan Paket Ini Sekarang</span>
                        </button>
                      ) : (
                        <>
                          {!isInTransit && (
                            <button
                              onClick={() => handleStartDelivery(inv)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Mulai Antar Paket Ini</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenCompleteModal(inv)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Konfirmasi Tiba & Serah Terima</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* TAB 2: RIWAYAT PAKET SELESAI (Paket yang sudah dikonfirmasi tiba & serah terima) */
          completedManifestList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Belum Ada Paket Selesai</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Setelah kurir menyelesaikan pengantaran dan menekan tombol <b>Konfirmasi Tiba & Serah Terima</b>, paket akan otomatis tercatat di sini.
              </p>
            </div>
          ) : (
            completedManifestList.map((inv, index) => {
              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden"
                >
                  {/* Top Bar for Delivered Package */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50/60">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                            {inv.id_sub_invoice}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">({inv.no_invoice})</span>
                          {inv.no_referensi && (
                            <span className="text-[11px] font-mono font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                              Ref: {inv.no_referensi}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600 mt-0.5 block">
                          Diterima oleh: <b className="text-slate-900">{inv.nama_penerima || inv.nama_pelanggan}</b>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>SUDAH DITERIMA & SELESAI</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Info (Balanced Equal-Height Grid) */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between h-full space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Alamat Pengantaran Sukses
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                              {inv.nama_pelanggan}
                            </h4>
                            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                              {inv.alamat_tujuan}, <span className="font-semibold text-slate-900">{inv.kota}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 mt-auto">
                        Kontak: <span className="font-mono font-medium text-slate-700">{inv.no_telepon}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between h-full space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Item yang Telah Diserahterimakan:
                          </span>
                          {inv.no_referensi && (
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ref: {inv.no_referensi}
                            </span>
                          )}
                        </div>
                        <div className="divide-y divide-slate-200/80 max-h-[140px] overflow-y-auto pr-1">
                          {inv.items?.map((item) => (
                            <div key={item.id} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-slate-800 truncate">{item.nama_barang}</span>
                              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/80 shrink-0">
                                {item.qty} {item.satuan}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between mt-auto">
                        <span className="text-slate-600 text-xs font-medium">Status Pembayaran:</span>
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded text-xs border border-emerald-200">
                          LUNAS / SELESAI DITERIMA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Notice */}
                  <div className="p-3 bg-emerald-50/40 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Paket ini telah diserahterimakan dan otomatis tidak muncul lagi di antrean aktif pengantaran.</span>
                    </span>
                    <span className="font-mono text-slate-400">Order: {inv.tanggal}</span>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Completion Modal */}
      {showDeliveryCompleteModal && completingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Paket Telah Sampai</h3>
            <p className="text-xs text-slate-600">
              Menyelesaikan pengantaran pesanan <b className="font-mono text-indigo-700">{completingInvoice.id_sub_invoice}</b> ke alamat: <br />
              <b className="text-slate-900">{completingInvoice.alamat_tujuan}</b>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Penerima / Pihak yang Menerima:
              </label>
              <input
                type="text"
                placeholder="Contoh: Ibu Linda / Pak Budi (Security)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {completingInvoice.status_pembayaran === 'cod' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                <span className="font-bold flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span>Uang COD Diterima: Rp {completingInvoice.sisa_tagihan.toLocaleString('id-ID')}</span>
                </span>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Pastikan pembayaran tunai atau transfer QRIS telah berhasil diverifikasi.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeliveryCompleteModal(false);
                  setCompletingInvoice(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelivered}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
              >
                Konfirmasi Terkirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode & Sub-Invoice Scanner Modal */}
      <CourierScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={async (code) => {
          return await onScanSubInvoice(code, activeCourier.id);
        }}
        unscannedInvoices={unscannedInvoices}
        courierName={activeCourier?.nama || 'Kurir'}
      />
    </div>
  );
};
