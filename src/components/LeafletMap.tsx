import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Courier, Invoice } from '../types';
import { Navigation, Battery, Gauge, Clock, Phone, MapPin, Play, RotateCcw, Building2, User, ChevronRight } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface LeafletMapProps {
  courier: Courier | null;
  activeInvoice: Invoice | null;
  onAdvanceStep: (courierId: number) => void;
  onResetRoute: (courierId: number) => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  courier,
  activeInvoice,
  onAdvanceStep,
  onResetRoute,
  onSelectInvoice,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const hubMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const passedPolylineRef = useRef<L.Polyline | null>(null);

  const [isFollowingCourier, setIsFollowingCourier] = useState(true);
  const [roadCoordinates, setRoadCoordinates] = useState<[number, number][]>([]);
  const [roadDistanceKm, setRoadDistanceKm] = useState<number | null>(null);
  const [roadDurationMin, setRoadDurationMin] = useState<number | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState<boolean>(false);

  // Printing Hub coordinates in Serang, Banten
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

      // Hub Marker Icon
      const hubIcon = L.divIcon({
        className: 'custom-hub-icon',
        html: `
          <div style="background-color: #4f46e5; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); border: 2px solid white;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <b style="color: #1e1b4b; font-size: 13px;">Sentra Cetak Mandiri (Serang Hub)</b>
            <p style="margin: 4px 0 0; color: #475569; font-size: 11px;">Jl. Raya Serang - Pandeglang, Ruko Golden Sempu</p>
            <span style="display:inline-block; margin-top: 4px; font-size: 10px; color: #4f46e5; font-weight: 600;">Asal Penjemputan Paket</span>
          </div>
        `);
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch real road navigation geometry from OSRM
  useEffect(() => {
    if (!courier) return;
    const destPos: [number, number] = activeInvoice
      ? [activeInvoice.lat_tujuan, activeInvoice.lng_tujuan]
      : [-6.1361, 106.1462];

    let isCancelled = false;
    setIsRoutingLoading(true);

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${courier.current_lng},${courier.current_lat};${destPos[1]},${destPos[0]}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM [lng, lat] -> Leaflet [lat, lng]
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
  }, [courier?.current_lat, courier?.current_lng, activeInvoice?.lat_tujuan, activeInvoice?.lng_tujuan]);

  // Update Courier Marker & Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !courier) return;

    const courierPos: [number, number] = [courier.current_lat, courier.current_lng];

    // Destination coords from active invoice
    const destPos: [number, number] = activeInvoice
      ? [activeInvoice.lat_tujuan, activeInvoice.lng_tujuan]
      : [-6.2088, 106.8228];

    // 1. Courier Marker
    const isMoving = courier.status_aktif === 'mengantar' && courier.kecepatan_kmh > 0;
    const vehicleIcon = courier.jenis_kendaraan === 'mobil' ? '🚐' : '🛵';

    const courierIcon = L.divIcon({
      className: 'custom-courier-icon',
      html: `
        <div style="position: relative; width: 44px; height: 44px;">
          ${isMoving ? `
            <div style="position: absolute; inset: -6px; border-radius: 9999px; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          ` : ''}
          <div style="position: relative; width: 44px; height: 44px; background-color: #0f172a; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #10b981; box-shadow: 0 4px 14px rgba(0,0,0,0.3); font-size: 20px;">
            <span>${vehicleIcon}</span>
          </div>
          <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
            ${courier.kecepatan_kmh} km/h
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
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

    // 2. Destination Marker
    const destIcon = L.divIcon({
      className: 'custom-dest-icon',
      html: `
        <div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); border: 2px solid white;">
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

    if (activeInvoice) {
      destMarkerRef.current.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif;">
          <div style="font-weight: 700; color: #0f172a; font-size: 13px;">Tujuan: ${activeInvoice.nama_pelanggan}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${activeInvoice.alamat_tujuan}</div>
          <div style="margin-top: 4px; font-size: 11px; color: #dc2626; font-weight: 600;">Invoice: ${activeInvoice.no_invoice}</div>
        </div>
      `);
    }

    // 3. Draw Route Polyline with Real Road Geometry (OSRM)
    const activeRouteCoords = roadCoordinates.length > 0 ? roadCoordinates : [courierPos, destPos];

    if (!routePolylineRef.current) {
      routePolylineRef.current = L.polyline(activeRouteCoords, {
        color: '#4f46e5',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else {
      routePolylineRef.current.setLatLngs(activeRouteCoords);
    }

    if (!passedPolylineRef.current) {
      passedPolylineRef.current = L.polyline([HUB_COORDS, courierPos], {
        color: '#10b981',
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
    } else {
      passedPolylineRef.current.setLatLngs([HUB_COORDS, courierPos]);
    }

    // Follow courier smoothly if toggled
    if (isFollowingCourier) {
      map.panTo(courierPos, { animate: true, duration: 0.8 });
    }
  }, [courier, activeInvoice, isFollowingCourier, roadCoordinates]);

  const fitAllBounds = () => {
    if (!mapInstanceRef.current || !courier) return;
    const destPos: [number, number] = activeInvoice
      ? [activeInvoice.lat_tujuan, activeInvoice.lng_tujuan]
      : [-6.2088, 106.8228];
    const bounds = L.latLngBounds([HUB_COORDS, [courier.current_lat, courier.current_lng], destPos]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    setIsFollowingCourier(false);
  };

  const centerCourier = () => {
    if (!mapInstanceRef.current || !courier) return;
    mapInstanceRef.current.setView([courier.current_lat, courier.current_lng], 16, { animate: true });
    setIsFollowingCourier(true);
  };

  return (
    <div className="relative w-full h-[640px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Action Quick Buttons (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={centerCourier}
          title="Pusatkan ke Kurir"
          className={`p-2.5 rounded-lg shadow-md transition-colors ${
            isFollowingCourier ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Navigation className="w-4 h-4" />
        </button>
        <button
          onClick={fitAllBounds}
          title="Lihat Seluruh Rute"
          className="p-2.5 bg-white text-slate-700 hover:bg-slate-50 rounded-lg shadow-md transition-colors"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Courier HUD Card (Bottom Left / Bottom Full on mobile) */}
      {courier && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[420px] z-10 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar
                foto={courier.foto}
                nama={courier.nama}
                level="kurir"
                size="lg"
                showBadge
              />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{courier.nama}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{courier.plat_nomor}</span>
                  <span>·</span>
                  <span className="capitalize">{courier.jenis_kendaraan}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {courier.is_real_gps ? (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  <span>GPS Satelit Riil</span>
                </div>
              ) : (
                <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  Mode Simulasi
                </div>
              )}
              <div className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono tabular-nums">{Math.round(courier.baterai_persen)}%</span>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-2 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                <Gauge className="w-3 h-3 text-indigo-500" />
                <span>Kecepatan</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-slate-900 text-sm mt-0.5">
                {courier.kecepatan_kmh} <span className="text-[10px] font-normal text-slate-500">km/h</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span>Estimasi Tiba</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-slate-900 text-sm mt-0.5">
                {activeInvoice?.status_pengiriman === 'terkirim'
                  ? 'Sampai'
                  : roadDurationMin !== null
                  ? `${roadDurationMin} menit`
                  : activeInvoice?.status_pengiriman === 'mendekati_lokasi'
                  ? '3 menit'
                  : '12 menit'}
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>Jarak Jalan</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-slate-900 text-sm mt-0.5">
                {activeInvoice?.status_pengiriman === 'terkirim'
                  ? '0 km'
                  : roadDistanceKm !== null
                  ? `${roadDistanceKm} km`
                  : activeInvoice?.status_pengiriman === 'mendekati_lokasi'
                  ? '0.4 km'
                  : '2.8 km'}
              </div>
            </div>
          </div>

          {/* Active Invoice Details Summary */}
          {activeInvoice && (
            <div className="mt-3 bg-indigo-50/70 border border-indigo-100 rounded-lg p-2.5 text-xs">
              <div className="flex items-center justify-between text-indigo-950 font-medium">
                <span>Pengiriman Aktif:</span>
                <span className="font-mono font-semibold">{activeInvoice.no_invoice}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-indigo-700">
                <span>No. Resi:</span>
                <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded text-indigo-900 border border-indigo-200">
                  {activeInvoice.id_sub_invoice}
                </span>
              </div>
              <div className="mt-1.5 text-slate-600 line-clamp-1">
                Tujuan: <span className="font-medium text-slate-900">{activeInvoice.nama_pelanggan}</span> ({activeInvoice.alamat_tujuan})
              </div>

              <div className="mt-2 flex items-center justify-between pt-2 border-t border-indigo-100">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      activeInvoice.diambil === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-[11px] font-medium text-slate-700">
                    {activeInvoice.diambil === 1 ? 'Paket Diambil dari Percetakan' : 'Menunggu Diambil'}
                  </span>
                </div>
                <button
                  onClick={() => onSelectInvoice(activeInvoice)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Detail Invoice
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Simulation & Controls Toolbar */}
          <div className="flex items-center gap-2 mt-3 pt-2">
            <button
              onClick={() => onAdvanceStep(courier.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Simulasi Maju GPS</span>
            </button>

            <button
              onClick={() => onResetRoute(courier.id)}
              title="Kembalikan Kurir ke Hub Percetakan"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/62${courier.no_hp.replace(/[^0-9]/g, '').substring(1)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WA Kurir</span>
            </a>
          </div>
        </div>
      )}

      {/* Map Legend Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-xs rounded-lg px-3 py-2 text-xs text-slate-700 shadow-md border border-slate-200 space-y-1 hidden sm:block">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
          <span>Sayuti.Com</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-emerald-500 inline-block" />
          <span>Kurir (Bergerak Live)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span>Lokasi Penerima</span>
        </div>
      </div>
    </div>
  );
};
