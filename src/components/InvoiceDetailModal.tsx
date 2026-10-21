import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Invoice } from '../types';
import { X, Package, CreditCard, User, MapPin, Truck, Calendar, Printer, CheckCircle, Clock } from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onToggleDiambil: (invoiceId: number, currentDiambil: number) => void;
  onUpdateStatus: (invoiceId: number, status: Invoice['status_pengiriman']) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  onClose,
  onToggleDiambil,
  onUpdateStatus,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Generate crisp QR code for public receipt tracking
  useEffect(() => {
    if (!invoice?.id_sub_invoice) {
      setQrCodeUrl(null);
      return;
    }

    const trackingUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}?track=${invoice.id_sub_invoice}`
        : `https://kirimkilat.app/track/${invoice.id_sub_invoice}`;

    QRCode.toDataURL(trackingUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating receipt QR code:', err));
  }, [invoice?.id_sub_invoice]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const currentTimeStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <>
      {/* =====================================================================
          1. Interactive On-Screen Modal View (Hidden during window.print())
          ===================================================================== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:hidden">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{invoice.no_invoice}</h2>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {invoice.id_sub_invoice}
                  </span>
                  {invoice.no_referensi && (
                    <span
                      className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                      title="Kode Referensi Keamanan Pelacakan"
                    >
                      Ref: {invoice.no_referensi}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tanggal Order: {invoice.tanggal} · Terhubung Sistem Transaksi Percetakan
                </p>
              </div>
            </div>

            {/* Action Buttons: Print & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Cetak Struk Kasir Termal 80mm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk (80mm)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Section 1: Informasi Pesanan & Logistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-medium text-[10px] tracking-wider block">Pelanggan</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{invoice.nama_pelanggan}</span>
                <span className="text-slate-500 mt-0.5 block">{invoice.no_telepon}</span>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium text-[10px]">Layanan:</span>
                    <span className="text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded border border-indigo-200">
                      {invoice.cara_ambil === 'dikirim' ? 'Pengiriman Kurir' : 'Ambil Sendiri di Toko'}
                    </span>
                  </div>
                  {invoice.no_referensi && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium text-[10px]">No. Ref Struk:</span>
                      <span className="text-emerald-700 bg-emerald-50 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {invoice.no_referensi}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-medium text-[10px] tracking-wider block">Alamat Tujuan Pengiriman</span>
                <span className="text-slate-800 font-medium mt-0.5 block">{invoice.alamat_tujuan}</span>
                <span className="text-slate-500 text-[11px] mt-0.5 block">{invoice.kota}</span>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium text-[10px]">Status Pengiriman:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      (invoice.status_kirim || 'belum') === 'diterima'
                        ? 'bg-emerald-100 text-emerald-800'
                        : (invoice.status_kirim || 'belum') === 'dikirim'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {(invoice.status_kirim || 'belum') === 'diterima'
                      ? 'Selesai Diterima'
                      : (invoice.status_kirim || 'belum') === 'dikirim'
                      ? 'Sedang Dikirim'
                      : 'Menunggu Kirim'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-medium text-[10px] tracking-wider block">Status Penjemputan Manifest</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                      invoice.diambil === 1
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {invoice.diambil === 1 ? 'Siap Diantar (Sudah Diambil)' : 'Belum Diambil'}
                  </span>
                  <button
                    onClick={() => onToggleDiambil(invoice.id, invoice.diambil)}
                    className="px-2 py-1 text-[11px] bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-100 transition-colors font-medium shadow-xs cursor-pointer"
                  >
                    {invoice.diambil === 1 ? 'Batalkan' : 'Ambil Sekarang'}
                  </button>
                </div>
                {invoice.waktu_diambil && (
                  <span className="text-[10px] text-slate-400 mt-1 block">Waktu: {invoice.waktu_diambil}</span>
                )}
              </div>
            </div>

            {/* Section 2: Rincian Barang Cetakan */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Rincian Barang Cetakan & Spesifikasi Produk
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {invoice.items?.length || 0} Item Terdaftar
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">Nama Produk Cetak</th>
                      <th className="py-2.5 px-3">Spesifikasi & Finishing</th>
                      <th className="py-2.5 px-3 text-center">Jumlah</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-medium text-slate-900">
                            {item.nama_barang}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <div>{item.spesifikasi}</div>
                            {item.catatan_finishing && (
                              <div className="text-[11px] text-indigo-600 mt-0.5">
                                Finishing: {item.catatan_finishing}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono tabular-nums">
                            {item.qty} {item.satuan}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                            Rp {item.harga_satuan.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                            Rp {item.subtotal.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          Tidak ada detail item pada sub-invoice ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Riwayat Pembayaran */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Riwayat & Rincian Pembayaran
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Status Pembayaran:</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                      invoice.status_pembayaran === 'lunas'
                        ? 'bg-emerald-100 text-emerald-800'
                        : invoice.status_pembayaran === 'cod'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {invoice.status_pembayaran}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">No. Transaksi</th>
                      <th className="py-2.5 px-3">Waktu Bayar</th>
                      <th className="py-2.5 px-3">Metode & Saluran</th>
                      <th className="py-2.5 px-3">Keterangan</th>
                      <th className="py-2.5 px-3 text-right">Jumlah Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.pembayaran && invoice.pembayaran.length > 0 ? (
                      invoice.pembayaran.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                            {pay.no_transaksi}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{pay.tanggal_bayar}</td>
                          <td className="py-2.5 px-3">
                            <span className="capitalize font-medium text-slate-800">{pay.metode_pembayaran.replace('_', ' ')}</span>
                            {pay.bank_channel && (
                              <span className="text-slate-400 block text-[11px]">{pay.bank_channel}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{pay.keterangan || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                            Rp {pay.jumlah_bayar.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          Belum ada riwayat pembayaran yang tercatat
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Balance Summary */}
              <div className="mt-3 flex justify-end">
                <div className="w-full sm:w-80 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Tagihan:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      Rp {invoice.total_tagihan.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Terbayar:</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-600">
                      Rp {invoice.total_terbayar.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm">
                    <span>Sisa Tagihan (COD):</span>
                    <span className={`font-mono tabular-nums ${invoice.sisa_tagihan > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      Rp {invoice.sisa_tagihan.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Courier Delivery Actions */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-indigo-950 block">Ubah Status Pengiriman Langsung:</span>
                <span className="text-slate-600 text-[11px]">Setiap perubahan status otomatis memicu Push Notification ke pembeli</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onUpdateStatus(invoice.id, 'dalam_perjalanan')}
                  className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Dalam Perjalanan
                </button>
                <button
                  onClick={() => onUpdateStatus(invoice.id, 'mendekati_lokasi')}
                  className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Mendekati Tujuan (500m)
                </button>
                <button
                  onClick={() => onUpdateStatus(invoice.id, 'terkirim')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Tandai Terkirim (Selesai)
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer with Print and Close Button */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk Termal (80mm)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. Dedicated Thermal Receipt Output (80mm POS Standard)
          Activates strictly on window.print(), hidden on screen.
          ===================================================================== */}
      <div id="thermal-receipt-area" className="hidden print:block text-black bg-white">
        {/* Brand Header */}
        <div className="text-center pb-2">
          <div className="text-base font-bold tracking-tight uppercase">
            KIRIMKILAT LOGISTICS
          </div>
          <div className="text-[10px] font-semibold">
            Hub Percetakan & Logistik Pengiriman
          </div>
          <div className="text-[9px] mt-0.5">
            Jl. Raya Serang - Pandeglang KM 3, Serang, Banten
          </div>
          <div className="text-[9px]">
            Telp / WA: 0812-9844-3311 · POS Kasir
          </div>
        </div>

        {/* Double dashed divider */}
        <div className="border-b-2 border-dashed border-black my-1" />

        {/* Invoice Metadata */}
        <div className="text-[10px] space-y-0.5 font-mono">
          <div className="flex justify-between">
            <span>NO. INVOICE</span>
            <span className="font-bold">{invoice.no_invoice}</span>
          </div>
          <div className="flex justify-between">
            <span>NO. RESI</span>
            <span className="font-bold">{invoice.id_sub_invoice}</span>
          </div>
          {invoice.no_referensi && (
            <div className="flex justify-between">
              <span>KODE REF</span>
              <span className="font-bold">{invoice.no_referensi}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>TANGGAL ORDER</span>
            <span>{invoice.tanggal}</span>
          </div>
          <div className="flex justify-between">
            <span>WAKTU CETAK</span>
            <span>{currentDateStr} {currentTimeStr}</span>
          </div>
          <div className="flex justify-between">
            <span>LAYANAN</span>
            <span>{invoice.cara_ambil === 'dikirim' ? 'PENGIRIMAN KURIR' : 'AMBIL DI TOKO'}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-1.5" />

        {/* Customer & Courier Information */}
        <div className="text-[10px] space-y-0.5 font-mono">
          <div className="font-bold uppercase">PENERIMA:</div>
          <div className="pl-1">
            <span className="font-bold">{invoice.nama_pelanggan}</span> ({invoice.no_telepon})
          </div>
          <div className="pl-1 leading-tight text-[9.5px]">
            {invoice.alamat_tujuan}, {invoice.kota}
          </div>
          <div className="flex justify-between pt-0.5">
            <span>KURIR:</span>
            <span className="font-bold">
              {invoice.kurir?.nama || 'Kurir Logistik'} {invoice.kurir?.plat_nomor ? `(${invoice.kurir.plat_nomor})` : ''}
            </span>
          </div>
        </div>

        <div className="border-b-2 border-dashed border-black my-1.5" />

        {/* Itemized Order Table */}
        <div className="font-mono text-[10px]">
          <div className="flex justify-between font-bold border-b border-black pb-0.5 mb-1">
            <span className="flex-1">ITEM CETAKAN</span>
            <span className="w-12 text-center">QTY</span>
            <span className="w-20 text-right">TOTAL</span>
          </div>

          <div className="space-y-1">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div key={item.id || idx} className="space-y-0.5">
                  <div className="font-bold leading-tight">{item.nama_barang}</div>
                  {item.spesifikasi && (
                    <div className="text-[9px] leading-tight text-neutral-800">
                      {item.spesifikasi}
                      {item.catatan_finishing ? ` · Fin: ${item.catatan_finishing}` : ''}
                    </div>
                  )}
                  <div className="flex justify-between text-[9.5px]">
                    <span className="text-neutral-700 pl-1">
                      {item.qty} {item.satuan || 'pcs'} @ Rp {item.harga_satuan.toLocaleString('id-ID')}
                    </span>
                    <span className="font-semibold tabular-nums">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <span>Pesanan Cetak Percetakan</span>
                <span>1 pesanan</span>
                <span className="font-semibold">
                  Rp {invoice.total_tagihan.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-b-2 border-dashed border-black my-1.5" />

        {/* Financial Summary */}
        <div className="text-[10px] space-y-0.5 font-mono">
          <div className="flex justify-between">
            <span>TOTAL TAGIHAN:</span>
            <span className="font-bold tabular-nums">
              Rp {invoice.total_tagihan.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>TOTAL TERBAYAR:</span>
            <span className="tabular-nums">
              Rp {invoice.total_terbayar.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-[11px] font-bold border-t border-black pt-1 mt-0.5">
            <span>SISA TAGIHAN (COD):</span>
            <span className="tabular-nums">
              Rp {invoice.sisa_tagihan.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-[9px] pt-0.5">
            <span>STATUS PEMBAYARAN:</span>
            <span className="font-bold uppercase">
              {invoice.sisa_tagihan === 0 ? 'LUNAS' : 'BELUM LUNAS (BAYAR SAAT TIBA)'}
            </span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-2" />

        {/* QR Code Tracking Section */}
        {qrCodeUrl && (
          <div className="text-center my-1.5">
            <div className="inline-block p-1 bg-white border border-black rounded">
              <img
                src={qrCodeUrl}
                alt="QR Code Pelacakan Resi"
                className="w-24 h-24 mx-auto object-contain block"
              />
            </div>
            <div className="font-mono text-[9px] font-bold mt-1">
              SCAN QR PELACAKAN RESI
            </div>
            <div className="font-mono text-[8px] text-neutral-800">
              No. Resi: {invoice.id_sub_invoice}
            </div>
          </div>
        )}

        <div className="border-b border-dashed border-black my-2" />

        {/* Delivery Handover Signature Slip */}
        <div className="font-mono text-[9px] pt-1">
          <div className="text-center font-bold mb-3 uppercase tracking-wider">
            BUKTI SERAH TERIMA PENGIRIMAN
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="flex flex-col justify-between h-18">
              <span>Kurir / Pengantar,</span>
              <div>
                <div className="border-b border-black w-24 mx-auto mb-0.5" />
                <span className="text-[8px]">( {invoice.kurir?.nama || '....................'} )</span>
              </div>
            </div>

            <div className="flex flex-col justify-between h-18">
              <span>Penerima Paket,</span>
              <div>
                <div className="border-b border-black w-24 mx-auto mb-0.5" />
                <span className="text-[8px]">( .................... )</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[8.5px] font-mono mt-3 pt-2 border-t border-dashed border-black leading-tight">
          <div>*** TERIMA KASIH ATAS PESANAN ANDA ***</div>
          <div className="mt-0.5 text-[8px]">
            Simpan struk ini sebagai bukti pembayaran dan surat jalan sah percetakan.
          </div>
        </div>
      </div>
    </>
  );
};
