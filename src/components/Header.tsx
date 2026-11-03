import React from 'react';
import {
  Package,
  MapPin,
  FileText,
  Smartphone,
  Search,
  Database,
  Bell,
  CheckCircle2,
  BarChart3,
  LogOut,
  User,
  Shield,
  Truck,
  LogIn,
  Edit3,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import { AppUser } from '../types';
import { UserAvatar } from './UserAvatar';
import { getPathFromTab } from '../utils/routes';
import { HelpCenterModal } from './HelpCenterModal';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'map' | 'invoices' | 'courier' | 'tracking' | 'analytics' | 'database';
  setActiveTab: (tab: 'map' | 'invoices' | 'courier' | 'tracking' | 'analytics' | 'database') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  hasPushPermission: boolean;
  onRequestPushPermission: () => void;
  isDbConnected: boolean;
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenEditProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenNotifications,
  hasPushPermission,
  onRequestPushPermission,
  isDbConnected,
  currentUser,
  onLogout,
  onOpenLogin,
  onOpenEditProfile,
}) => {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const isAdmin = currentUser?.level === 'admin';
  const isKurir = currentUser?.level === 'kurir';
  const isGuest = !currentUser;
  const defaultTab = isAdmin ? 'map' : isKurir ? 'courier' : 'tracking';

  // Compute initials for avatar (e.g., "AS" for Ahmad Sayuti)
  const userInitials = React.useMemo(() => {
    if (!currentUser?.nama) return 'AS';
    const parts = currentUser.nama.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return currentUser.nama.slice(0, 2).toUpperCase();
  }, [currentUser?.nama]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs w-full m-0 p-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-16 w-full">
          {/* Zone 1 (Left): Brand Wordmark with 3D Cube Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={getPathFromTab(defaultTab)}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(defaultTab);
              }}
              className="flex items-center gap-2.5 text-left focus:outline-hidden cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 group-hover:from-indigo-600 group-hover:to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 transition-all">
                <Package className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  KirimKilat
                </span>
                <span className="text-[11px] font-semibold text-slate-500 tracking-normal mt-0.5">
                  Logistik
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2 (Center): Navigation Links with Pill Style */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 text-sm font-medium text-slate-600 px-2">
            {/* Guest (Tamu): ONLY 'Lacak Resi' */}
            {isGuest && (
              <a
                href={getPathFromTab('tracking')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('tracking');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 shadow-md whitespace-nowrap cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lacak Resi Pengiriman</span>
              </a>
            )}

            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <a
                  href={getPathFromTab('map')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('map');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'map'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Peta Live</span>
                </a>

                <a
                  href={getPathFromTab('invoices')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('invoices');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'invoices'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Data Invoice</span>
                </a>

                <a
                  href={getPathFromTab('courier')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('courier');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'courier'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Portal Kurir</span>
                </a>

                <a
                  href={getPathFromTab('tracking')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('tracking');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'tracking'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Lokasi Resi</span>
                </a>

                <a
                  href={getPathFromTab('analytics')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('analytics');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analitik</span>
                </a>

                <a
                  href={getPathFromTab('database')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('database');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'database'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Database</span>
                </a>

                {/* Pusat Bantuan (Mint Green Pill) */}
                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-800 bg-[#EAFBF3] hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer ml-1"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pusat Bantuan</span>
                </button>

                {/* Tombol Install Android PWA */}
                <PWAInstallButton variant="header" />
              </>
            )}

            {/* Kurir Navigation */}
            {isKurir && (
              <>
                <a
                  href={getPathFromTab('courier')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('courier');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'courier'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Portal Kurir</span>
                </a>

                <a
                  href={getPathFromTab('map')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('map');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'map'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Peta Live</span>
                </a>

                <a
                  href={getPathFromTab('tracking')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('tracking');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'tracking'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Lokasi Resi</span>
                </a>

                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-800 bg-[#EAFBF3] hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer ml-1"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pusat Bantuan</span>
                </button>

                {/* Tombol Install Android PWA untuk Kurir */}
                <PWAInstallButton variant="header" />
              </>
            )}
          </nav>

          {/* Zone 3 (Right): Notifications & User Profile Chip */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Install Button for Mobile & Tablet top bar */}
            <PWAInstallButton variant="header" className="lg:hidden text-[11px] px-2.5 py-1" />

            {!isGuest && (
              <>
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Pemberitahuan Status"
                  title="Notifikasi Sistem"
                >
                  <Bell className="w-5 h-5 text-slate-700" />
                  {unreadCount > 0 ? (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                  )}
                </button>
              </>
            )}

            {/* User Profile Chip matching mockup */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  title="Menu Profil Akun"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-left border border-slate-200/80 bg-white"
                >
                  {/* Purple Circle Avatar with Initials */}
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {userInitials}
                  </div>

                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[110px]">
                      {currentUser.nama || 'Ahmad Sayuti'}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">
                      {currentUser.level === 'admin' ? (
                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono">
                          ADMIN
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono">
                          KURIR
                        </span>
                      )}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 truncate">{currentUser.nama}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{currentUser.level}</div>
                    </div>

                    <div className="p-2 border-b border-slate-100">
                      <PWAInstallButton variant="header" className="w-full justify-center text-xs py-2" />
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenEditProfile();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Profil & Foto</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsHelpOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 lg:hidden"
                    >
                      <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pusat Bantuan</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>

        {/* Backdrop for open user menu */}
        {isUserMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsUserMenuOpen(false)}
          />
        )}

        {/* Mobile Grid Navigation (100% Responsive, Zero Horizontal Scroll) */}
      {!isGuest && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-2 py-2 w-full">
          {isAdmin && (
            <div className="grid grid-cols-3 gap-1.5 w-full">
              <a
                href={getPathFromTab('map')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('map');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <MapPin className={`w-4 h-4 mb-1 ${activeTab === 'map' ? 'text-white' : 'text-indigo-600'}`} />
                <span className="text-[11px] leading-tight">Peta Live</span>
              </a>

              <a
                href={getPathFromTab('invoices')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('invoices');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'invoices'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <FileText className={`w-4 h-4 mb-1 ${activeTab === 'invoices' ? 'text-white' : 'text-indigo-600'}`} />
                <span className="text-[11px] leading-tight">Invoice</span>
              </a>

              <a
                href={getPathFromTab('courier')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('courier');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'courier'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <Smartphone className={`w-4 h-4 mb-1 ${activeTab === 'courier' ? 'text-white' : 'text-indigo-600'}`} />
                <span className="text-[11px] leading-tight">Kurir</span>
              </a>

              <a
                href={getPathFromTab('tracking')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('tracking');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'tracking'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <Search className={`w-4 h-4 mb-1 ${activeTab === 'tracking' ? 'text-white' : 'text-indigo-600'}`} />
                <span className="text-[11px] leading-tight">Lacak Resi</span>
              </a>

              <a
                href={getPathFromTab('analytics')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('analytics');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <BarChart3 className={`w-4 h-4 mb-1 ${activeTab === 'analytics' ? 'text-white' : 'text-indigo-600'}`} />
                <span className="text-[11px] leading-tight">Analitik</span>
              </a>

              <a
                href={getPathFromTab('database')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('database');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'database'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <Database className={`w-4 h-4 mb-1 ${activeTab === 'database' ? 'text-white' : 'text-indigo-600'}`} />
                <span className="text-[11px] leading-tight">MySQL DB</span>
              </a>
            </div>
          )}

          {isKurir && (
            <div className="grid grid-cols-3 gap-1.5 w-full">
              <a
                href={getPathFromTab('courier')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('courier');
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'courier'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <Smartphone className={`w-4 h-4 mb-1 ${activeTab === 'courier' ? 'text-white' : 'text-emerald-600'}`} />
                <span className="text-xs font-semibold leading-tight">Portal Kurir</span>
              </a>

              <a
                href={getPathFromTab('map')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('map');
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <MapPin className={`w-4 h-4 mb-1 ${activeTab === 'map' ? 'text-white' : 'text-emerald-600'}`} />
                <span className="text-xs font-semibold leading-tight">Rute Peta</span>
              </a>

              <a
                href={getPathFromTab('tracking')}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('tracking');
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeTab === 'tracking'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <Search className={`w-4 h-4 mb-1 ${activeTab === 'tracking' ? 'text-white' : 'text-emerald-600'}`} />
                <span className="text-xs font-semibold leading-tight">Lacak Resi</span>
              </a>
            </div>
          )}
        </div>
      )}
    </header>

    {/* Pusat Bantuan Modal */}
    <HelpCenterModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
  </>
);
};
