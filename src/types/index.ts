export interface InvoiceItem {
  id: number;
  id_invoice: number;
  id_sub_invoice?: string;
  nama_barang: string;
  spesifikasi: string; // e.g. "Art Paper 150gr, A5, Cetak 2 Sisi"
  qty: number;
  satuan: string; // pcs, rim, meter, box
  harga_satuan: number;
  subtotal: number;
  catatan_finishing?: string;
}

export interface BayarInvoiceDetail {
  id: number;
  id_invoice: number;
  no_transaksi: string;
  tanggal_bayar: string;
  jumlah_bayar: number;
  metode_pembayaran: 'transfer' | 'cash_kurir' | 'qris' | 'tempo';
  bank_channel?: string;
  status_bayar: 'lunas' | 'sebagian' | 'menunggu_verifikasi';
  keterangan?: string;
}

export type StatusKirim = 'belum' | 'dikirim' | 'diterima';
export type CaraAmbil = 'dikirim' | 'diambil' | 'ambil_sendiri' | string;

export interface AppUser {
  id: number;
  username: string;
  nama: string;
  level: 'admin' | 'kurir';
  id_kurir?: number | null;
  no_hp?: string;
  foto?: string;
  jabatan?: string;
  raw_level?: string;
  db_source?: string;
}

export interface Invoice {
  id: number;
  no_invoice: string;
  id_sub_invoice: string;
  tanggal: string;
  nama_pelanggan: string;
  no_telepon: string;
  alamat_tujuan: string;
  kota: string;
  lat_tujuan: number;
  lng_tujuan: number;
  cara_ambil: CaraAmbil; // e.g. 'dikirim' atau 'ambil_sendiri'
  diambil: number; // 0 = belum diambil percetakan, 1 = sudah diambil kurir
  waktu_diambil?: string | null;
  status_kirim: StatusKirim; // 'belum' | 'dikirim' | 'diterima'
  status_pengiriman?: string; // legacy mapping alias
  id_kurir?: number | null;
  kurir?: Courier | null;
  total_tagihan: number;
  total_terbayar: number;
  sisa_tagihan: number;
  status_pembayaran: 'lunas' | 'belum_lunas' | 'cod';
  catatan_kurir?: string;
  foto_bukti?: string | null;
  nama_penerima?: string | null;
  waktu_terkirim?: string | null;
  items?: InvoiceItem[];
  pembayaran?: BayarInvoiceDetail[];
  no_referensi?: string;
}

export interface Courier {
  id: number;
  nama: string;
  no_hp: string;
  plat_nomor: string;
  jenis_kendaraan: 'motor' | 'mobil';
  foto: string;
  current_lat: number;
  current_lng: number;
  kecepatan_kmh: number;
  baterai_persen: number;
  status_aktif: 'standby' | 'mengantar' | 'offline';
  heading_deg: number;
  id_invoice_aktif?: number | null;
}

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'status_update' | 'diambil' | 'approaching' | 'delivered' | 'info';
  invoice_id?: number;
  id_sub_invoice?: string;
  read?: boolean;
}

export interface DatabaseStatus {
  connected: boolean;
  host: string;
  port: number;
  database: string;
  user: string;
  mode: 'mysql_live' | 'mock_mirrored';
  tableCount?: number;
  invoicesCount?: number;
  lastChecked: string;
  message: string;
}
