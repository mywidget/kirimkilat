import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Courier, Invoice } from '../types';
import {
  Navigation,
  Battery,
  Gauge,
  Clock,
  Phone,
  MapPin,
  Play,
  RotateCcw,
  Building2,
  User,
  ChevronRight,
  Package,
  CheckCircle2,
  Crosshair,
  Wifi,
  Send,
  Route,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface LeafletMapProps {
  courier: Courier | null;
  activeInvoice: Invoice | null;
  invoices?: Invoice[];
  couriers?: Courier[];
  selectedCourierId?: number | null;
  onSelectCourier?: (courierId: number) => void;
  selectedInvoiceId?: number | null;
  onSelectTrackedInvoice?: (invoiceId: number | null) => void;
  onAdvanceStep: (courierId: number) => void;
  onResetRoute: (courierId: number) => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  courier,
  activeInvoice,
  invoices = [],
  couriers = [],
  selectedCourierId,
  onSelectCourier,
  selectedInvoiceId,
  onSelectTrackedInvoice,
  onAdvanceStep,
  onResetRoute,
  onSelectInvoice,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const hubMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const corridorPolylineRef = useRef<L.Polyline | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const passedPolylineRef = useRef<L.Polyline | null>(null);

  const [isFollowingCourier, setIsFollowingCourier] = useState(true);
  const [roadCoordinates, setRoadCoordinates] = useState<[number, number][]>([]);
  const [roadDistanceKm, setRoadDistanceKm] = useState<number | null>(null);
  const [roadDurationMin, setRoadDurationMin] = useState<number | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState<boolean>(false);

  // Printing Hub coordinates in Serang, Banten (Sayuti.Com Sentra Cetak Mandiri)
  const HUB_COORDS: [number, number] = [-6.1215, 106.1505];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: HUB_COORDS,
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Hub Marker Icon (Sayuti.Com)
      const hubIcon = L.divIcon({
        className: 'custom-hub-icon',
        html: `
          <div style="background-color: #10b981; width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45); border: 2.5px solid white;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/>
              <rect x="6" y="14" width="12" height="8" rx="1"/>
            </svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      hubMarkerRef.current = L.marker(HUB_COORDS, { icon: hubIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 6px; font-family: sans-serif;">
            <b style="color: #065f46; font-size: 13px;">Sayuti.Com (Hub Sentra Cetak)</b>
            <p style="margin: 4px 0 0; color: #475569; font-size: 11px;">Jl. Raya Serang - Pandeglang, Ruko Golden Sempu</p>
            <span style="display:inline-block; margin-top: 4px; font-size: 10px; color: #059669; font-weight: 700;">🟢 Titik Asal Penjemputan Paket</span>
          </div>
        `);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch real road navigation geometry from OSRM
  useEffect(() => {
    if (!courier || !activeInvoice) {
      setRoadCoordinates([]);
      setRoadDistanceKm(null);
      setRoadDurationMin(null);
      return;
    }

    const destPos: [number, number] = [activeInvoice.lat_tujuan, activeInvoice.lng_tujuan];

    let isCancelled = false;
    setIsRoutingLoading(true);

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${courier.current_lng},${courier.current_lat};${destPos[1]},${destPos[0]}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );
          setRoadCoordinates(coords);
          setRoadDistanceKm(parseFloat((route.distance / 1000).toFixed(1)));
          setRoadDurationMin(Math.max(1, Math.round(route.duration / 60)));
        } else {
          setRoadCoordinates([[courier.current_lat, courier.current_lng], destPos]);
        }
      })
      .catch((err) => {
        console.warn('OSRM routing fetch failed:', err);
        if (!isCancelled) {
          setRoadCoordinates([[courier.current_lat, courier.current_lng], destPos]);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsRoutingLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [courier?.current_lat, courier?.current_lng, activeInvoice?.lat_tujuan, activeInvoice?.lng_tujuan, activeInvoice?.id]);

  // Update Courier Marker & Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !courier) return;

    const courierPos: [number, number] = [courier.current_lat, courier.current_lng];

    // 1. Courier Marker with KU-001 green tag below scooter
    const courierCode = courier.plat_nomor ? courier.plat_nomor.replace(/\s+/g, '-').slice(0, 7) : 'KU-001';

    const courierIcon = L.divIcon({
      className: 'custom-courier-icon',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; width: 64px;">
          <div style="position: relative; width: 44px; height: 44px; background-color: #064e3b; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #10b981; box-shadow: 0 4px 14px rgba(0,0,0,0.35); font-size: 20px;">
            <span style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));">🛵</span>
          </div>
          <div style="margin-top: -6px; background-color: #059669; color: white; font-size: 10px; font-weight: 800; padding: 1.5px 8px; border-radius: 9999px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 1.5px solid white; letter-spacing: 0.5px;">
            ${courierCode}
          </div>
        </div>
      `,
      iconSize: [64, 60],
      iconAnchor: [32, 22],
    });

    if (!courierMarkerRef.current) {
      courierMarkerRef.current = L.marker(courierPos, { icon: courierIcon }).addTo(map);
    } else {
      courierMarkerRef.current.setLatLng(courierPos);
      courierMarkerRef.current.setIcon(courierIcon);
    }

    courierMarkerRef.current.bindPopup(`
      <div style="padding: 6px; font-family: sans-serif;">
        <div style="font-weight: 700; color: #0f172a; font-size: 13px;">Kurir: ${courier.nama}</div>
        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${courier.plat_nomor} · ${courier.jenis_kendaraan.toUpperCase()}</div>
        <div style="margin-top: 6px; font-size: 11px; color: #059669; font-weight: 600;">Status: ${courier.status_aktif.toUpperCase()} (${courier.kecepatan_kmh} km/h)</div>
        ${courier.is_real_gps ? '<div style="margin-top: 4px; font-size: 10px; color: #047857; font-weight: bold;">🟢 GPS Satelit Asli Perangkat</div>' : ''}
      </div>
    `);

    // 2. Destination Marker & Route Polyline handling
    if (!activeInvoice) {
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      if (corridorPolylineRef.current) {
        corridorPolylineRef.current.remove();
        corridorPolylineRef.current = null;
      }
    } else {
      const destPos: [number, number] = [activeInvoice.lat_tujuan, activeInvoice.lng_tujuan];

      const destIcon = L.divIcon({
        className: 'custom-dest-icon',
        html: `
          <div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker(destPos, { icon: destIcon }).addTo(map);
      } else {
        destMarkerRef.current.setLatLng(destPos);
      }

      destMarkerRef.current.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif;">
          <div style="font-weight: 700; color: #0f172a; font-size: 13px;">Tujuan: ${activeInvoice.nama_pelanggan}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${activeInvoice.alamat_tujuan}</div>
          <div style="margin-top: 4px; font-size: 11px; color: #dc2626; font-weight: 600;">Invoice: ${activeInvoice.no_invoice}</div>
          <div style="margin-top: 2px; font-size: 10px; color: #4338ca; font-weight: 600;">Resi: ${activeInvoice.id_sub_invoice}</div>
        </div>
      `);

      // 3. Draw Route Polyline with Orange Highway Corridor & Blue Line (Matching Mockup)
      const activeRouteCoords = roadCoordinates.length > 0 ? roadCoordinates : [courierPos, destPos];

      // Orange Corridor Band underneath
      if (!corridorPolylineRef.current) {
        corridorPolylineRef.current = L.polyline(activeRouteCoords, {
          color: '#fb923c',
          weight: 14,
          opacity: 0.65,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      } else {
        corridorPolylineRef.current.setLatLngs(activeRouteCoords);
      }

      // Main Blue Path
      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(activeRouteCoords, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(activeRouteCoords);
      }
    }

    // Passed trajectory from Hub
    if (!passedPolylineRef.current) {
      passedPolylineRef.current = L.polyline([HUB_COORDS, courierPos], {
        color: '#10b981',
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
    } else {
      passedPolylineRef.current.setLatLngs([HUB_COORDS, courierPos]);
    }

    if (isFollowingCourier) {
      map.panTo(courierPos, { animate: true, duration: 0.8 });
    }
  }, [courier, activeInvoice, isFollowingCourier, roadCoordinates]);

  const fitAllBounds = () => {
    if (!mapInstanceRef.current || !courier) return;
    const points: [number, number][] = [HUB_COORDS, [courier.current_lat, courier.current_lng]];
    if (activeInvoice) {
      points.push([activeInvoice.lat_tujuan, activeInvoice.lng_tujuan]);
    }
    const bounds = L.latLngBounds(points);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    setIsFollowingCourier(false);
  };

  const centerCourier = () => {
    if (!mapInstanceRef.current || !courier) return;
    mapInstanceRef.current.setView([courier.current_lat, courier.current_lng], 16, { animate: true });
    setIsFollowingCourier(true);
  };

  // Mockup fallback values for the card display
  const displayCourierName = courier?.nama || 'Kurir';
  const displayCourierCode = courier?.plat_nomor || 'KU-001';
  const displayBattery = courier ? Math.round(courier.baterai_persen) : 92;
  const displayInvoiceNo = activeInvoice?.no_invoice || 'INV/297123';
  const displayResiNo = activeInvoice?.id_sub_invoice || 'B883714';
  const displayTujuan = activeInvoice?.alamat_tujuan
    ? `${activeInvoice.alamat_tujuan}, Serang`
    : 'Jl. A. Yani Hasan, Serang';
  const displayDuration = roadDurationMin !== null ? `± ${roadDurationMin} menit` : '± 4 menit';
  const displayDistance = roadDistanceKm !== null ? `${roadDistanceKm} km` : '3.6 km';

  return (
    <div className="relative w-full h-[480px] sm:h-[580px] md:h-[680px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 min-w-0 max-w-full">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay (Top Left - Matching Mockup) */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 text-xs text-slate-800 shadow-lg border border-slate-200/80 space-y-2 hidden sm:block">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0 shadow-xs" />
          <span className="font-bold text-xs text-slate-800">Sayuti.Com</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shrink-0 shadow-xs" />
          <span className="font-semibold text-xs text-slate-700">Kurir (Bergerak Live)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shrink-0 shadow-xs" />
          <span className="font-semibold text-xs text-slate-700">Lokasi Penerima</span>
        </div>
      </div>

      {/* Map Action Quick Buttons (Top Right - Matching Mockup) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2.5">
        <button
          onClick={centerCourier}
          title="Pusatkan ke Kurir"
          className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-5 h-5 -rotate-45 ml-0.5" />
        </button>
        <button
          onClick={fitAllBounds}
          title="Lihat Seluruh Area Rute"
          className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Crosshair className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Floating Courier HUD Card (Bottom Left - Matching Exact Mockup) */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto sm:w-[420px] md:w-[450px] z-10 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-200/90 max-w-full">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Dark green circular avatar with 'KU' */}
            <div className="w-12 h-12 rounded-full bg-[#064e3b] text-white font-extrabold text-sm flex items-center justify-center border-2 border-emerald-500 shadow-md shrink-0">
              KU
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">{displayCourierName}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{displayCourierCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* GPS Stabil badge */}
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>GPS Stabil</span>
            </div>
            {/* Battery & Signal badge */}
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              <Wifi className="w-3 h-3 text-slate-500" />
              <Battery className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono tabular-nums">{displayBattery}%</span>
            </div>
          </div>
        </div>

        {/* 3 KPI Telemetry Boxes in a Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-3.5 pt-3 border-t border-slate-100">
          {/* Box 1: Penjemputan */}
          <div className="bg-slate-50/90 border border-slate-100 p-2 sm:p-2.5 rounded-2xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 font-medium truncate">Penjemputan</div>
              <div className="font-bold text-slate-900 text-xs truncate">4 titik</div>
            </div>
          </div>

          {/* Box 2: Estimasi Tiba */}
          <div className="bg-slate-50/90 border border-slate-100 p-2 sm:p-2.5 rounded-2xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 font-medium truncate">Estimasi Tiba</div>
              <div className="font-bold text-slate-900 text-xs truncate">{displayDuration}</div>
            </div>
          </div>

          {/* Box 3: Jarak Jalan */}
          <div className="bg-slate-50/90 border border-slate-100 p-2 sm:p-2.5 rounded-2xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Route className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 font-medium truncate">Jarak Jalan</div>
              <div className="font-bold text-slate-900 text-xs truncate">{displayDistance}</div>
            </div>
          </div>
        </div>

        {/* Delivery Details Section */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-700 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Pengiriman Aktif</span>
            <span className="font-mono font-bold text-slate-900">: {displayInvoiceNo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">No. Resi</span>
            <span className="font-mono font-bold text-slate-900">: {displayResiNo}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-slate-500 shrink-0">Tujuan</span>
            <span className="font-medium text-slate-900 text-right truncate ml-2">
              : {displayTujuan}
            </span>
          </div>
        </div>

        {/* Status Line + Detail Tracking Link */}
        <div className="mt-3 flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Status: Dalam Perjalanan</span>
          </div>
          {activeInvoice ? (
            <button
              onClick={() => onSelectInvoice(activeInvoice)}
              className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-0.5 cursor-pointer"
            >
              <span>Detail Tracking</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-indigo-600 font-bold text-xs flex items-center gap-0.5">
              <span>Detail Tracking</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Bottom Action Buttons matching mockup */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => courier && onAdvanceStep(courier.id)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 fill-white -rotate-45" />
            <span>Simulasi Rute (GPS)</span>
          </button>

          <a
            href={
              courier?.no_hp
                ? `https://wa.me/62${courier.no_hp.replace(/[^0-9]/g, '').substring(1)}`
                : 'https://wa.me/6281288889999'
            }
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-500 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hubungi Kurir</span>
          </a>
        </div>
      </div>
    </div>
  );
};
