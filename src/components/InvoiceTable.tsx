import React, { useState } from 'react';
import { Invoice } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
} from 'lucide-react';

interface InvoiceTableProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onToggleDiambil: (invoiceId: number, currentDiambil: number) => void;
  onTrackOnMap: (invoice: Invoice) => void;
}

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
};

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onSelectInvoice,
  onToggleDiambil,
  onTrackOnMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusKirimFilter, setStatusKirimFilter] = useState<'all' | 'belum' | 'dikirim' | 'diterima'>('all');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredInvoices = invoices.filter((inv) => {
    // 1. HARD FILTER: HANYA tampilkan invoice dengan cara_ambil === 'dikirim' (selain itu jangan ditampilkan)
    if (inv.cara_ambil !== 'dikirim') {
      return false;
    }

    // 2. Search filter
    const matchesSearch =
      inv.no_invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id_sub_invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.no_referensi && inv.no_referensi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inv.nama_pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.alamat_tujuan.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 3. Filter by status_kirim (belum, dikirim, diterima)
    if (statusKirimFilter !== 'all') {
      const invStatusKirim = inv.status_kirim || (inv.status_pengiriman === 'terkirim' ? 'diterima' : inv.diambil === 1 ? 'dikirim' : 'belum');
      if (invStatusKirim !== statusKirimFilter) return false;
    }

    return true;
  });

  // Pagination calculations
  const totalItems = filteredInvoices.length;
  const effectivePageSize = pageSize === -1 ? (totalItems || 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * effectivePageSize;
  const endIndex = pageSize === -1 ? totalItems : Math.min(startIndex + effectivePageSize, totalItems);
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  const getStatusKirimBadge = (inv: Invoice) => {
    const status = inv.status_kirim || (inv.status_pengiriman === 'terkirim' ? 'diterima' : inv.diambil === 1 ? 'dikirim' : 'belum');

    switch (status) {
      case 'diterima':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai Diterima</span>
          </span>
        );
      case 'dikirim':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3.5 h-3.5" />
            <span>Sedang Dikirim</span>
          </span>
        );
      case 'belum':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Kirim</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Daftar Pesanan & Pengiriman Logistik
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Truck className="w-3 h-3 text-indigo-600" />
              <span>Khusus Pengiriman Kurir</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manifes pesanan pengiriman kurir percetakan (cara_ambil='dikirim') dan status serah terima
          </p>
        </div>

        {/* Filter, Search, and Limit Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari no. invoice, resi, nama..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Status Kirim */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => {
                setStatusKirimFilter('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                statusKirimFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Status
            </button>
            <button
              onClick={() => {
                setStatusKirimFilter('belum');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                statusKirimFilter === 'belum'
                  ? 'bg-white text-amber-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Menunggu
            </button>
            <button
              onClick={() => {
                setStatusKirimFilter('dikirim');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                statusKirimFilter === 'dikirim'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sedang Dikirim
            </button>
            <button
              onClick={() => {
                setStatusKirimFilter('diterima');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                statusKirimFilter === 'diterima'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selesai Diterima
            </button>
          </div>

          {/* Filter Limit Baris per Halaman */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Limit:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-2 py-0.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value={5}>5 baris</option>
              <option value={10}>10 baris</option>
              <option value={20}>20 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris</option>
              <option value={-1}>Semua ({filteredInvoices.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">No. Invoice & Resi</th>
              <th className="py-3 px-4">Pelanggan & Tujuan</th>
              <th className="py-3 px-4 text-center">Layanan Pengiriman</th>
              <th className="py-3 px-4 text-center">Status Manifest</th>
              <th className="py-3 px-4 text-center">Status Pengiriman</th>
              <th className="py-3 px-4">Kurir Ditugaskan</th>
              <th className="py-3 px-4 text-right">Tagihan & Sisa</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium">Tidak ada data invoice yang sesuai kriteria filter</p>
                  <p className="text-[11px] text-slate-400 mt-1">Coba sesuaikan pencarian atau reset filter</p>
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Invoice and Sub-Invoice Numbers */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900 text-xs">{inv.no_invoice}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      <span className="text-indigo-600 font-mono font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {inv.id_sub_invoice}
                      </span>
                      {inv.no_referensi && (
                        <span className="text-emerald-700 font-mono font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-[10px]" title="Nomor Referensi Struk">
                          {inv.no_referensi}
                        </span>
                      )}
                      <span>·</span>
                      <span>{inv.tanggal}</span>
                    </div>
                  </td>

                  {/* Customer and Address */}
                  <td className="py-3.5 px-4 max-w-[210px]">
                    <div className="font-semibold text-slate-900 truncate">{inv.nama_pelanggan}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{inv.alamat_tujuan}</div>
                    <div className="text-[10px] text-slate-400">{inv.no_telepon}</div>
                  </td>

                  {/* Layanan Pengiriman */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Truck className="w-3 h-3 text-indigo-600" />
                      <span>Pengiriman Kurir</span>
                    </span>
                  </td>

                  {/* Kolom `diambil` Interactive Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleDiambil(inv.id, inv.diambil)}
                      title={inv.diambil === 1 ? 'Klik untuk membatalkan status pickup' : 'Klik untuk konfirmasi paket siap diantar'}
                      className={`inline-flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        inv.diambil === 1
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${inv.diambil === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="font-semibold">{inv.diambil === 1 ? 'Siap Antar' : 'Menunggu Pickup'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        {inv.diambil === 1 ? inv.waktu_diambil?.substring(11, 16) || 'Sudah Diambil' : 'Siapkan Paket'}
                      </span>
                    </button>
                  </td>

                  {/* Status Pengiriman */}
                  <td className="py-3.5 px-4 text-center">
                    {getStatusKirimBadge(inv)}
                  </td>

                  {/* Assigned Courier */}
                  <td className="py-3.5 px-4">
                    {inv.kurir ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                          {inv.kurir.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-xs">{inv.kurir.nama}</div>
                          <div className="text-[10px] text-slate-500">{inv.kurir.plat_nomor}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Belum ditugaskan</span>
                    )}
                  </td>

                  {/* Tagihan & Pembayaran */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono tabular-nums font-semibold text-slate-900">
                      Rp {inv.total_tagihan.toLocaleString('id-ID')}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px]">
                      {inv.sisa_tagihan === 0 ? (
                        <span className="text-emerald-600 font-semibold">Lunas</span>
                      ) : (
                        <span className="text-amber-600 font-bold">
                          COD: Rp {inv.sisa_tagihan.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        title="Lihat Rincian Item Cetak & Pembayaran"
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onTrackOnMap(inv)}
                        title="Lacak Kurir di Peta"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Paging & Limit Controls */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        {/* Left: Range and Filter Summary */}
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Menampilkan{' '}
            <b className="font-mono text-slate-900 tabular-nums">
              {totalItems === 0 ? 0 : startIndex + 1}–{endIndex}
            </b>{' '}
            dari <b className="font-mono text-slate-900 tabular-nums">{totalItems}</b> pesanan pengiriman kurir
          </span>
          {pageSize !== -1 && totalPages > 1 && (
            <span className="text-slate-400">
              · Halaman <b className="font-mono text-slate-700">{validCurrentPage}</b> dari{' '}
              <b className="font-mono text-slate-700">{totalPages}</b>
            </span>
          )}
          <span className="hidden lg:inline text-slate-400">|</span>
          <span className="hidden lg:inline text-[11px] text-slate-500">
            (<b className="text-amber-700">{filteredInvoices.filter((i) => i.status_kirim === 'belum').length} Menunggu</b>,{' '}
            <b className="text-indigo-700">{filteredInvoices.filter((i) => i.status_kirim === 'dikirim').length} Sedang Dikirim</b>,{' '}
            <b className="text-emerald-700">{filteredInvoices.filter((i) => i.status_kirim === 'diterima').length} Selesai Diterima</b>)
          </span>
        </div>

        {/* Right: Paging Controls & Limit Selection */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Limit Selector in Footer */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Semua</option>
            </select>
          </div>

          {/* Paging Buttons */}
          {pageSize !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                title="Halaman Pertama"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                title="Halaman Sebelumnya"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers(validCurrentPage, totalPages).map((pageNum, idx) =>
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-slate-400 font-mono">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => setCurrentPage(Number(pageNum))}
                      className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-bold font-mono transition-all ${
                        validCurrentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                title="Halaman Selanjutnya"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 font-medium"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                title="Halaman Terakhir"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
