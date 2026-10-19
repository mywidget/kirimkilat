import React, { useState } from 'react';
import { AppUser, Invoice } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Package,
  Phone,
  AlertCircle,
  Shield,
  ShieldCheck,
  Lock,
  ArrowRight,
  UserCheck,
  Building2,
} from 'lucide-react';

interface CustomerTrackingViewProps {
  invoices: Invoice[];
  currentUser: AppUser | null;
  onOpenLogin: () => void;
  onSelectTrackInvoice: (invoice: Invoice) => void;
  onOpenMap: () => void;
}

export const CustomerTrackingView: React.FC<CustomerTrackingViewProps> = ({
  invoices,
  currentUser,
  onOpenLogin,
  onSelectTrackInvoice,
  onOpenMap,
}) => {
  const isStaff = currentUser?.level === 'admin' || currentUser?.level === 'kurir';

  // State: Staff can see default invoice; Guest starts empty or with default resi
  const [searchQuery, setSearchQuery] = useState(isStaff ? (invoices[0]?.id_sub_invoice || '') : '');
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    isStaff ? (invoices[0] || null) : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to mask phone number for public privacy
  const formatMaskedPhone = (phone: string) => {
    if (!phone || phone === '-') return '-';
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length <= 6) return phone;
    const prefix = digits.slice(0, 4);
    const suffix = digits.slice(-3);
    return `${prefix}-****-${suffix}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const query = searchQuery.trim().toLowerCase();
    const securityInput = phoneSuffix.trim();

    if (!query) {
      setErrorMsg('Silakan masukkan Nomor Resi atau Nomor Invoice.');
      return;
    }

    // Match by sub invoice (B00...), invoice number (INV/...), ID, or reference number (REF-...)
    const found = invoices.find(
      (inv) =>
        inv.id_sub_invoice.toLowerCase() === query ||
        inv.no_invoice.toLowerCase() === query ||
        String(inv.id) === query ||
        `inv-${inv.id}`.toLowerCase() === query ||
        `inv/${inv.id}`.toLowerCase() === query ||
        (inv.no_referensi && inv.no_referensi.toLowerCase() === query)
    );

    if (!found) {
      setErrorMsg(
        'Nomor Resi atau Invoice tidak ditemukan. Pastikan format nomor yang Anda masukkan benar (contoh: B001712 atau INV/201712).'
      );
      return;
    }

    // Security Verification: If guest, require matching 4 digits of customer phone OR matching reference number
    if (!isStaff) {
      if (!securityInput) {
        setErrorMsg(
          'Untuk keamanan dan perlindungan privasi data pesanan, masukkan 4 digit terakhir No. HP pemesan ATAU Nomor Referensi Struk.'
        );
        return;
      }

      const rawPhone = (found.no_telepon || '').replace(/[^0-9]/g, '');
      const last4 = rawPhone.slice(-4);
      const digitsOnly = securityInput.replace(/[^0-9]/g, '');

      // Check match by phone (last 4 digits or full phone)
      const isPhoneMatched =
        digitsOnly.length >= 4 &&
        (digitsOnly === last4 || rawPhone.endsWith(digitsOnly) || digitsOnly === rawPhone);

      // Check match by No Referensi Struk (e.g. REF-201691 or 201691)
      const isReferenceMatched = Boolean(
        found.no_referensi &&
          (found.no_referensi.toLowerCase() === securityInput.toLowerCase() ||
            found.no_referensi.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ===
              securityInput.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ||
            found.no_referensi.toLowerCase().endsWith(securityInput.toLowerCase()))
      );

      if (!isPhoneMatched && !isReferenceMatched) {
        setErrorMsg(
          'Verifikasi Keamanan Gagal: 4 digit No. HP atau Nomor Referensi tidak sesuai dengan data pemesan resi ini. Hal ini untuk mencegah pihak lain mengintip data pesanan Anda.'
        );
        return;
      }
    }

    setSelectedInvoice(found);
    onSelectTrackInvoice(found);
  };

  const getStepActiveState = (stepNumber: number) => {
    if (!selectedInvoice) return false;
    const statusKirim =
      selectedInvoice.status_kirim ||
      (selectedInvoice.status_pengiriman === 'terkirim'
        ? 'diterima'
        : selectedInvoice.diambil === 1
        ? 'dikirim'
        : 'belum');

    switch (stepNumber) {
      case 1:
        return true; // Selesai cetak
      case 2:
        return selectedInvoice.diambil === 1; // Diambil kurir
      case 3:
        return statusKirim === 'dikirim' || statusKirim === 'diterima';
      case 4:
        return (
          selectedInvoice.status_pengiriman === 'mendekati_lokasi' ||
          statusKirim === 'diterima'
        );
      case 5:
        return statusKirim === 'diterima';
      default:
        return false;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Unified Hero Search & Security Card (Uniform full-width container) */}
      <div className="w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/50 shadow-xl relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pelacakan Resmi Percetakan Sayuti.Com</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-2">
                Lacak Posisi Kurir & Status Paket Real-Time
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Pantau proses pengerjaan cetakan, penjemputan oleh kurir lapangan, dan estimasi waktu serah terima pesanan Anda.
              </p>
            </div>

            {!currentUser && (
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/15 transition-all flex items-center gap-2 shrink-0 cursor-pointer w-fit"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Petugas / Kurir</span>
              </button>
            )}
          </div>

          {/* Dual-Factor Security Search Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Field 1: Nomor Resi / Sub-Invoice */}
              <div className="md:col-span-6 relative">
                <label className="block text-[11px] font-semibold text-indigo-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nomor Resi / Invoice</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B001712 atau INV-201712"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3.5 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: 4 Digit Terakhir No. HP Pemesan atau No. Referensi Struk (Keamanan Data) */}
              <div className="md:col-span-4 relative">
                <label className="block text-[11px] font-semibold text-indigo-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4 Digit HP atau No. Ref {isStaff && '(Opsional Petugas)'}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isStaff ? 'Mode Petugas (Bebas)' : 'Misal: 3311 atau REF-2016'}
                    value={phoneSuffix}
                    onChange={(e) => setPhoneSuffix(e.target.value)}
                    className="w-full pl-3.5 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all"
                  />
                </div>
              </div>

              {/* Search Submit Button */}
              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer h-[46px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Lacak Paket</span>
                </button>
              </div>
            </div>

            {/* Error / Alert Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}
          </form>

          {/* Privacy & Security Guide Box */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400">
                🔒 <b>Keamanan Pelacakan (Dual-Factor):</b> Masukkan 4 digit No. HP pemesan ATAU No. Referensi Struk untuk melindungi privasi data pesanan Anda dari pihak luar.
              </span>
            </div>

            {isStaff && (
              <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Terotentikasi sebagai {currentUser?.level.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Section */}
      {selectedInvoice ? (
        <div className="w-full space-y-6">
          {/* Card 1: Status Live Tracker (Uniform full width) */}
          <div className="w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nomor Resi Pengiriman
                </span>
                <div className="flex flex-wrap items-center gap-2.5 mt-1">
                  <h2 className="text-2xl font-bold font-mono text-indigo-700 tracking-tight">
                    {selectedInvoice.id_sub_invoice}
                  </h2>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedInvoice.no_invoice}
                  </span>
                  {selectedInvoice.no_referensi && (
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ref: {selectedInvoice.no_referensi}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenMap}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Lihat Kurir di Peta Live</span>
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar (Responsive 5-step) */}
            <div className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {/* Step 1 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(1)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Selesai Cetak</h4>
                    <p className="text-[11px] text-slate-500">Workshop Percetakan</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(2)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Diambil Kurir</h4>
                    <p className="text-[11px] text-slate-500">
                      {selectedInvoice.diambil === 1 ? 'Sudah Diambil Kurir' : 'Menunggu Penjemputan'}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(3)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Dalam Perjalanan</h4>
                    <p className="text-[11px] text-slate-500">Menuju Alamat Anda</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(4)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Mendekati Tujuan</h4>
                    <p className="text-[11px] text-slate-500">Radius ~500 Meter</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(5)
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    5
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Paket Diterima</h4>
                    <p className="text-[11px] text-slate-500">
                      {selectedInvoice.nama_penerima || 'Serah Terima'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courier Info & Live Status Box */}
            {selectedInvoice.kurir && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedInvoice.kurir.foto}
                    alt={selectedInvoice.kurir.nama}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      Kurir: {selectedInvoice.kurir.nama}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Armada Pengantar · Plat Nomor:{' '}
                      <span className="font-mono font-bold text-slate-800">
                        {selectedInvoice.kurir.plat_nomor}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/62${selectedInvoice.kurir.no_hp
                      .replace(/[^0-9]/g, '')
                      .substring(1)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hubungi Kurir via WA</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Card 2 & 3: Order Details & Payment (Balanced 2-column grid, uniform width) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
            {/* Column 1: Barang Cetakan */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-full min-h-[350px]">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Rincian Barang Cetakan</span>
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-semibold text-slate-900 block text-xs">
                            {item.nama_barang}
                          </span>
                          <span className="text-slate-500 text-[11px] block mt-0.5">
                            {item.spesifikasi || 'Spesifikasi cetak standar'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                          {item.qty} {item.satuan}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-slate-400 text-xs text-center">
                      Tidak ada rincian item tambahan.
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-1">
                <span className="text-slate-400 text-[11px] block font-semibold uppercase">
                  Alamat Pengantaran:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedInvoice.alamat_tujuan || selectedInvoice.kota || 'Serang, Banten'}
                </p>
              </div>
            </div>

            {/* Column 2: Status Pembayaran & Tagihan */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-full min-h-[350px]">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Status Pembayaran & Penerima</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Nama Pemesan:</span>
                    <span className="font-semibold text-slate-900">
                      {isStaff
                        ? selectedInvoice.nama_pelanggan
                        : selectedInvoice.nama_pelanggan.slice(0, 3) + '***'}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Kontak Pemesan:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {isStaff
                        ? selectedInvoice.no_telepon
                        : formatMaskedPhone(selectedInvoice.no_telepon)}
                    </span>
                  </div>

                  {selectedInvoice.no_referensi && (
                    <div className="flex justify-between py-2 border-b border-slate-100 items-center">
                      <span className="text-slate-500">No. Referensi Struk:</span>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                        {selectedInvoice.no_referensi}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Total Nilai Tagihan:</span>
                    <span className="font-mono font-bold text-slate-900">
                      Rp {selectedInvoice.total_tagihan.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 items-center">
                    <span className="text-slate-500">Status Pembayaran:</span>
                    <span
                      className={`font-bold uppercase text-[11px] px-2.5 py-1 rounded-lg ${
                        selectedInvoice.status_pembayaran === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedInvoice.status_pembayaran}
                    </span>
                  </div>
                </div>
              </div>

              {/* COD Warning Box if remaining debt */}
              {selectedInvoice.sisa_tagihan > 0 ? (
                <div className="mt-4 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Tagihan COD: Rp {selectedInvoice.sisa_tagihan.toLocaleString('id-ID')}</span>
                  </div>
                  <span className="text-[11px] text-amber-700 mt-1 block leading-relaxed">
                    Harap siapkan uang pas saat kurir tiba di alamat Anda untuk serah terima paket cetakan.
                  </span>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-[11px]">
                    Pesanan telah lunas. Tidak ada tagihan pembayaran saat paket diserahkan.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Initial State Guide */
        <div className="w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              Masukkan Nomor Resi & 4 Digit No. HP
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gunakan form di atas untuk memeriksa posisi kurir dan status pesanan cetak Anda secara akurat dan aman.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
