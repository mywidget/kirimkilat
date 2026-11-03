import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LeafletMap } from './components/LeafletMap';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { CourierPortal } from './components/CourierPortal';
import { CustomerTrackingView } from './components/CustomerTrackingView';
import { PushNotificationManager } from './components/PushNotificationManager';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { CourierAnalyticsDashboard } from './components/CourierAnalyticsDashboard';
import { LoginForm } from './components/LoginForm';
import { EditProfileModal } from './components/EditProfileModal';
import { MetricCards } from './components/MetricCards';
import { AppUser, Courier, Invoice, PushNotificationPayload, DatabaseStatus } from './types';
import { playNotificationSound } from './utils/audio';
import { getTabFromPath, getPathFromTab, AppTab } from './utils/routes';
import { Truck, Package, Clock, ShieldCheck, Database, RefreshCw, AlertCircle, Search, Lock, User, X, MapPin } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kirimkilat_user');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to parse saved user session:', e);
      }
    }
    return null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined') {
      let savedUser: AppUser | null = null;
      try {
        const saved = localStorage.getItem('kirimkilat_user');
        if (saved) savedUser = JSON.parse(saved);
      } catch {
        // ignore
      }

      // Check current URL route first
      const routeTab = getTabFromPath(window.location.pathname);
      if (routeTab) {
        if (!savedUser && routeTab !== 'tracking') {
          return 'tracking';
        }
        if (savedUser?.level === 'kurir' && (routeTab === 'invoices' || routeTab === 'analytics' || routeTab === 'database')) {
          return 'courier';
        }
        return routeTab;
      }

      if (savedUser?.level === 'kurir') return 'courier';
      if (!savedUser) return 'tracking';
    }
    return 'map';
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCourierIdOnMap, setSelectedCourierIdOnMap] = useState<number | null>(null);
  const [trackedInvoiceId, setTrackedInvoiceId] = useState<number | null>(null);
  const [activeToast, setActiveToast] = useState<PushNotificationPayload | null>(null);
  const [notifications, setNotifications] = useState<PushNotificationPayload[]>([]);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const [isReconnectingDb, setIsReconnectingDb] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check Web Push Notification API support & initial permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPushPermission(window.Notification.permission === 'granted');
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await window.Notification.requestPermission();
        if (permission === 'granted') {
          setHasPushPermission(true);
          playNotificationSound('success');
          triggerNotification({
            id: `perm-${Date.now()}`,
            title: 'Notifikasi Web Push Aktif!',
            body: 'Anda akan menerima pembaruan langsung setiap kali paket diambil atau tiba di lokasi.',
            timestamp: new Date().toISOString(),
            type: 'info',
          });
        }
      } catch (e) {
        console.error('Error requesting push permission:', e);
      }
    }
  };

  // Helper to trigger audio and native Web Push Notification
  const triggerNotification = useCallback((notif: PushNotificationPayload) => {
    setActiveToast(notif);
    playNotificationSound(notif.type === 'delivered' ? 'success' : 'ding');

    // Trigger Native Browser Web Notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification(notif.title, {
          body: notif.body,
          icon: '/src/assets/images/courier_rider_avatar_1792303374167.jpg',
        });
      } catch {
        // Notification failed or blocked in iframe
      }
    }

    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const [invRes, courRes, dbRes, notifRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/couriers'),
        fetch('/api/db/status'),
        fetch('/api/notifications'),
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(invData);
      }

      if (courRes.ok) {
        const courData = await courRes.json();
        setCouriers(courData);
      }

      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStatus(dbData);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Connect to Real-Time SSE Stream for Courier GPS & Status updates
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('courier_update', (e) => {
      try {
        const updatedCourier: Courier = JSON.parse(e.data);
        setCouriers((prev) =>
          prev.map((c) => (c.id === updatedCourier.id ? { ...c, ...updatedCourier } : c))
        );
      } catch (err) {
        console.error('SSE courier update parse error:', err);
      }
    });

    eventSource.addEventListener('invoice_update', (e) => {
      try {
        const updatedInvoice: Invoice = JSON.parse(e.data);
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === updatedInvoice.id ? { ...inv, ...updatedInvoice } : inv))
        );
        setSelectedInvoice((prev) => (prev?.id === updatedInvoice.id ? { ...prev, ...updatedInvoice } : prev));
      } catch (err) {
        console.error('SSE invoice update parse error:', err);
      }
    });

    eventSource.addEventListener('push_notification', (e) => {
      try {
        const notif: PushNotificationPayload = JSON.parse(e.data);
        triggerNotification(notif);
      } catch (err) {
        console.error('SSE push notification parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [triggerNotification]);

  // Auto-dismiss floating toast after 7 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Handlers
  const handleToggleDiambil = async (invoiceId: number, currentDiambil: number) => {
    const nextDiambil = currentDiambil === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/diambil`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diambil: nextDiambil }),
      });
      if (res.ok) {
        const result = await res.json();
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invoiceId ? { ...inv, ...result.invoice } : inv))
        );
      }
    } catch (e) {
      console.error('Error toggling diambil status:', e);
    }
  };

  const handleUpdateStatus = async (
    invoiceId: number,
    status: Invoice['status_pengiriman'],
    meta?: { catatan_kurir?: string; nama_penerima?: string }
  ) => {
    try {
      const isDelivered = status === 'terkirim';
      const res = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          status_kirim: isDelivered ? 'diterima' : 'dikirim',
          ...meta,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  ...result.invoice,
                  status_pengiriman: status,
                  status_kirim: isDelivered ? 'diterima' : inv.status_kirim,
                  nama_penerima: meta?.nama_penerima || result.invoice?.nama_penerima || inv.nama_penerima,
                }
              : inv
          )
        );
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleSendCourierGps = async (
    courierId: number,
    lat: number,
    lng: number,
    speed?: number,
    heading?: number,
    battery?: number,
    accuracy?: number
  ) => {
    try {
      const res = await fetch(`/api/couriers/${courierId}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          speed: speed !== undefined && speed !== null ? Math.round(speed > 100 ? speed : speed * 3.6) : undefined,
          heading,
          battery,
          accuracy,
          is_real_gps: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCouriers((prev) =>
          prev.map((c) => (c.id === courierId ? { ...c, ...data.courier } : c))
        );
      }
    } catch (e) {
      console.error('Error sending courier GPS:', e);
    }
  };

  const handleAdvanceStep = async (courierId: number) => {
    try {
      await fetch(`/api/couriers/${courierId}/step`, { method: 'POST' });
    } catch (e) {
      console.error('Error advancing courier step:', e);
    }
  };

  const handleResetRoute = async (courierId: number) => {
    try {
      await fetch(`/api/couriers/${courierId}/reset-route`, { method: 'POST' });
    } catch (e) {
      console.error('Error resetting courier route:', e);
    }
  };

  const handleScanSubInvoice = async (id_sub_invoice: string, courierId: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/invoices/scan-sub-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_sub_invoice, id_kurir: courierId }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === data.invoice.id ? { ...inv, ...data.invoice } : inv))
        );
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error scanning sub-invoice:', e);
      return false;
    }
  };

  const handleSendTestPush = async () => {
    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Uji Coba Push Notification Real-Time',
          body: 'Notifikasi status pengiriman paket berhasil diterima dengan audio chime!',
          type: 'status_update',
        }),
      });
    } catch (e) {
      console.error('Error sending test push:', e);
    }
  };

  const handleReconnectDb = async (config: {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
  }) => {
    setIsReconnectingDb(true);
    try {
      const res = await fetch('/api/db/reconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const status = await fetch('/api/db/status');
        const dbJson = await status.json();
        setDbStatus(dbJson);
      }
    } catch (e) {
      console.error('Failed to reconnect database:', e);
    } finally {
      setIsReconnectingDb(false);
    }
  };

  // Strict Role-Based Access Control (RBAC) Guard for tab switching & Browser URL routing
  const handleTabChange = useCallback((tab: AppTab) => {
    // 1. Guest (Tamu / Pelanggan): HANYA boleh mengakses 'tracking'
    if (!currentUser) {
      if (tab !== 'tracking') {
        setIsLoginModalOpen(true);
        return;
      }
      setActiveTab('tracking');
      const targetPath = getPathFromTab('tracking');
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        window.history.pushState({ tab: 'tracking' }, '', targetPath);
      }
      return;
    }

    // 2. Kurir: Boleh akses 'courier', 'map', dan 'tracking' (Dilarang akses keuangan & database)
    if (currentUser.level === 'kurir') {
      if (tab === 'invoices' || tab === 'analytics' || tab === 'database') {
        return;
      }
    }

    // 3. Admin: Akses penuh
    if (tab === 'database') {
      if (currentUser.level === 'admin') {
        setIsDbModalOpen(true);
      }
    } else {
      setActiveTab(tab);
      const targetPath = getPathFromTab(tab);
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  }, [currentUser]);

  // Browser Back/Forward navigation support (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const routeTab = getTabFromPath(window.location.pathname);
      if (routeTab) {
        if (!currentUser && routeTab !== 'tracking') {
          setActiveTab('tracking');
        } else if (currentUser?.level === 'kurir' && (routeTab === 'invoices' || routeTab === 'analytics' || routeTab === 'database')) {
          setActiveTab('courier');
        } else if (routeTab === 'database') {
          if (currentUser?.level === 'admin') setIsDbModalOpen(true);
        } else {
          setActiveTab(routeTab);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Sync browser URL whenever activeTab changes or on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const expectedPath = getPathFromTab(activeTab);
      const currentTabInUrl = getTabFromPath(window.location.pathname);
      if (window.location.pathname === '/' || currentTabInUrl !== activeTab) {
        window.history.replaceState({ tab: activeTab }, '', expectedPath);
      }
    }
  }, [activeTab]);

  // Enforce RBAC guard on activeTab whenever auth state changes
  useEffect(() => {
    if (!currentUser && activeTab !== 'tracking') {
      setActiveTab('tracking');
    } else if (currentUser?.level === 'kurir' && (activeTab === 'invoices' || activeTab === 'analytics' || activeTab === 'database')) {
      setActiveTab('courier');
    }
  }, [currentUser, activeTab]);

  // Active courier for map display
  const activeCourierForMap =
    couriers.find((c) => c.id === selectedCourierIdOnMap) || couriers[0] || null;

  // Filter hanya invoice yang berstatus 'dikirim' (persis seperti data invoice)
  const dikirimInvoices = invoices.filter((inv) => {
    if (inv.cara_ambil !== undefined && inv.cara_ambil !== 'dikirim') return false;
    if (inv.status_kirim === 'diterima' || inv.status_pengiriman === 'terkirim') return false;
    const effectiveStatusKirim =
      inv.status_kirim || (inv.diambil === 1 ? 'dikirim' : 'belum');
    return (
      effectiveStatusKirim === 'dikirim' ||
      inv.status_pengiriman === 'dalam_perjalanan' ||
      inv.status_pengiriman === 'mendekati_lokasi'
    );
  });

  // Dynamic invoice for map display:
  // 1. If user explicitly selected an invoice to track, show that (if not completed)
  // 2. Otherwise, if the courier is actively delivering and has an active invoice in dikirimInvoices, show that
  // 3. Otherwise, return null (Kurir Standby / Clean Map - NO phantom destination or route)
  const activeInvoiceForCourier = (() => {
    if (trackedInvoiceId !== null) {
      const found = invoices.find((inv) => inv.id === trackedInvoiceId);
      if (found && found.status_pengiriman !== 'terkirim' && found.status_kirim !== 'diterima') {
        return found;
      }
    }
    if (activeCourierForMap?.id_invoice_aktif) {
      const found = dikirimInvoices.find((inv) => inv.id === activeCourierForMap.id_invoice_aktif);
      if (found) return found;
    }
    const inTransit = dikirimInvoices.find(
      (inv) => inv.id_kurir === activeCourierForMap?.id
    );
    if (inTransit) return inTransit;

    return null;
  })();

  const handleTrackInvoiceOnMap = (invoice: Invoice) => {
    setTrackedInvoiceId(invoice.id);
    if (invoice.id_kurir) {
      setSelectedCourierIdOnMap(invoice.id_kurir);
    }
    handleTabChange('map');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans m-0 p-0 w-full max-w-full overflow-x-hidden">
      {/* Universal Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        unreadCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        hasPushPermission={hasPushPermission}
        onRequestPushPermission={requestPushPermission}
        isDbConnected={!!dbStatus?.connected}
        currentUser={currentUser}
        onLogout={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('kirimkilat_user');
          }
          setCurrentUser(null);
          setIsGuestMode(false);
          setIsLoginModalOpen(true);
          setActiveTab('tracking');
          if (typeof window !== 'undefined') {
            window.history.pushState({ tab: 'tracking' }, '', getPathFromTab('tracking'));
          }
        }}
        onOpenLogin={() => {
          setIsGuestMode(false);
          setIsLoginModalOpen(true);
        }}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
        {/* Metric Summary Strip - Matching Mockup 4 Cards */}
        {currentUser && (
          <MetricCards invoices={invoices} couriers={couriers} dbStatus={dbStatus} />
        )}

        {/* Tab 1: Live Interactive Map (Admin & Kurir only) */}
        {activeTab === 'map' && currentUser && (
          <div className="space-y-4">
            {/* Title & Action Row matching Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Purple square with MapPin icon */}
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Pelacakan Kurir Real-Time & Rute Pengantaran
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Pantau pergerakan kurir, rute tercepat, dan status pengantaran secara langsung.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                {/* Optional sleek quick selector if multiple couriers exist */}
                {couriers.length > 1 && (
                  <div className="hidden md:flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-full px-3 py-1.5 text-xs shadow-xs">
                    <span className="text-slate-500 font-medium">Kurir:</span>
                    <select
                      value={selectedCourierIdOnMap || activeCourierForMap?.id || ''}
                      onChange={(e) => setSelectedCourierIdOnMap(Number(e.target.value))}
                      className="font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer text-xs"
                    >
                      {couriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama} ({c.plat_nomor})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => handleAdvanceStep(activeCourierForMap?.id || 1)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Posisi Kurir</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Map with all Floating HUD overlays */}
            <LeafletMap
              courier={activeCourierForMap}
              activeInvoice={activeInvoiceForCourier}
              invoices={dikirimInvoices}
              couriers={couriers}
              selectedCourierId={selectedCourierIdOnMap || activeCourierForMap?.id || null}
              onSelectCourier={(cId) => setSelectedCourierIdOnMap(cId)}
              selectedInvoiceId={activeInvoiceForCourier?.id || null}
              onSelectTrackedInvoice={(invId) => setTrackedInvoiceId(invId)}
              onAdvanceStep={handleAdvanceStep}
              onResetRoute={handleResetRoute}
              onSelectInvoice={(inv) => setSelectedInvoice(inv)}
            />
          </div>
        )}

        {/* Tab 2: Invoices Data Grid (Admin only) */}
        {activeTab === 'invoices' && currentUser?.level === 'admin' && (
          <InvoiceTable
            invoices={invoices}
            onSelectInvoice={(inv) => setSelectedInvoice(inv)}
            onToggleDiambil={handleToggleDiambil}
            onTrackOnMap={handleTrackInvoiceOnMap}
          />
        )}

        {/* Tab 3: Courier Operational App (Admin & Kurir) */}
        {activeTab === 'courier' && currentUser && (
          <CourierPortal
            couriers={couriers}
            invoices={invoices}
            onToggleDiambil={handleToggleDiambil}
            onUpdateStatus={handleUpdateStatus}
            onSendCourierGps={handleSendCourierGps}
            onAdvanceStep={handleAdvanceStep}
            onScanSubInvoice={handleScanSubInvoice}
            onTrackOnMap={handleTrackInvoiceOnMap}
            currentUser={currentUser}
          />
        )}

        {/* Tab 4: Customer Tracking Resi (Public, Guest, Kurir, Admin) */}
        {activeTab === 'tracking' && (
          <CustomerTrackingView
            invoices={invoices}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onSelectTrackInvoice={(inv) => {
              setSelectedInvoice(inv);
              if (currentUser) {
                handleTrackInvoiceOnMap(inv);
              }
            }}
            onOpenMap={() => {
              if (currentUser) {
                handleTabChange('map');
              } else {
                setIsLoginModalOpen(true);
              }
            }}
          />
        )}

        {/* Tab 5: Courier Performance Analytics Dashboard (Admin only) */}
        {activeTab === 'analytics' && currentUser?.level === 'admin' && (
          <CourierAnalyticsDashboard
            couriers={couriers}
            invoices={invoices}
          />
        )}
      </main>

      {/* Floating Push Notification Toast & History Drawer */}
      <PushNotificationManager
        notifications={notifications}
        activeToast={activeToast}
        onDismissToast={() => setActiveToast(null)}
        isOpenDrawer={isNotifDrawerOpen}
        onCloseDrawer={() => setIsNotifDrawerOpen(false)}
        onSendTestPush={handleSendTestPush}
        hasPushPermission={hasPushPermission}
        onRequestPermission={requestPushPermission}
      />

      {/* Invoice Multi-Table Relations Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onToggleDiambil={handleToggleDiambil}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* MySQL Database Configuration Modal */}
      {isDbModalOpen && (
        <DatabaseStatusModal
          dbStatus={dbStatus}
          onClose={() => setIsDbModalOpen(false)}
          onReconnect={handleReconnectDb}
          isReconnecting={isReconnectingDb}
        />
      )}

      {/* Login Form Modal (Admin & Kurir level='kurir') */}
      {(isLoginModalOpen || (!currentUser && !isGuestMode)) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <LoginForm
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setIsGuestMode(false);
              if (typeof window !== 'undefined') {
                localStorage.setItem('kirimkilat_user', JSON.stringify(user));
              }
              setIsLoginModalOpen(false);
              const targetTab = user.level === 'kurir' ? 'courier' : 'map';
              setActiveTab(targetTab);
              if (typeof window !== 'undefined') {
                window.history.pushState({ tab: targetTab }, '', getPathFromTab(targetTab));
              }
            }}
            onContinueAsGuest={() => {
              setIsGuestMode(true);
              setIsLoginModalOpen(false);
              setActiveTab('tracking');
              if (typeof window !== 'undefined') {
                window.history.pushState({ tab: 'tracking' }, '', getPathFromTab('tracking'));
              }
            }}
          />
        </div>
      )}

      {/* Edit Profile Modal */}
      {currentUser && (
        <EditProfileModal
          currentUser={currentUser}
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          onProfileUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
            if (typeof window !== 'undefined') {
              localStorage.setItem('kirimkilat_user', JSON.stringify(updatedUser));
            }
            // Sync with couriers list if this user is a courier
            setCouriers((prev) =>
              prev.map((c) =>
                c.id === updatedUser.id
                  ? {
                      ...c,
                      nama: updatedUser.nama,
                      no_hp: updatedUser.no_hp || c.no_hp,
                      foto: updatedUser.foto || c.foto,
                    }
                  : c
              )
            );
          }}
        />
      )}
    </div>
  );
}
