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
} from 'lucide-react';
import { AppUser } from '../types';
import { UserAvatar } from './UserAvatar';

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
  const isAdmin = currentUser?.level === 'admin';
  const isKurir = currentUser?.level === 'kurir';
  const isGuest = !currentUser;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs w-full m-0 p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 w-full">
        {/* Zone 1 (Left): Brand Wordmark - Fixed Balanced Width */}
        <div className="flex items-center gap-3 w-52 sm:w-64 shrink-0">
          <button
            onClick={() => setActiveTab(isAdmin ? 'map' : isKurir ? 'courier' : 'tracking')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 flex items-center justify-center text-white shadow-xs transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                KirimKilat
              </span>
              <span className="hidden xl:inline-block ml-1.5 text-xs font-medium text-slate-500">
                · Logistik
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2 (Center): Navigation Links - Mathematically Centered */}
        <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2 flex-1 text-sm font-medium text-slate-600">
          {/* Guest (Tamu): ONLY 'Lacak Resi' */}
          {isGuest && (
            <button
              onClick={() => setActiveTab('tracking')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 shadow-xs whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>Lacak Resi Pengiriman</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Publik
              </span>
            </button>
          )}

          {/* Admin Navigation (Tersentralisasi) */}
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'map'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Peta Live</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'invoices'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Data Invoice</span>
              </button>

              <button
                onClick={() => setActiveTab('courier')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'courier'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Portal Kurir</span>
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'tracking'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lacak Resi</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analitik</span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'database'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Database</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isDbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isDbConnected ? 'Live' : 'Off'}
                </span>
              </button>
            </>
          )}

          {/* Kurir Navigation (Tersentralisasi) */}
          {isKurir && (
            <>
              <button
                onClick={() => setActiveTab('courier')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'courier'
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Portal Tugas</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Kurir
                </span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'map'
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Rute Peta</span>
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'tracking'
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lacak Resi</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3 (Right): User Session, Notifications & Edit Profile - Fixed Balanced Width */}
        <div className="flex items-center justify-end gap-2.5 w-52 sm:w-64 shrink-0">
          {!isGuest && (
            <>
              {!hasPushPermission ? (
                <button
                  onClick={onRequestPushPermission}
                  title="Aktifkan Notifikasi Push Browser"
                  className="hidden xl:flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Bell className="w-3 h-3 text-amber-600" />
                  <span>Push</span>
                </button>
              ) : (
                <div className="hidden xl:flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Push On</span>
                </div>
              )}

              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Pemberitahuan Status"
                title="Notifikasi Sistem"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-3.5 h-3.5 text-[9px] font-bold text-white bg-rose-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* User Account Chip with Edit Profile & Avatar Placeholder */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                onClick={onOpenEditProfile}
                title="Klik untuk Edit Profil & Avatar"
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left group"
              >
                <UserAvatar
                  foto={currentUser.foto}
                  nama={currentUser.nama}
                  username={currentUser.username}
                  level={currentUser.level}
                  size="sm"
                  showBadge
                />
                <div className="hidden sm:block text-left">
                  <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[100px] lg:max-w-[120px]">
                    {currentUser.nama}
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span
                      className={`font-mono font-bold uppercase px-1 rounded ${
                        currentUser.level === 'admin'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentUser.level}
                    </span>
                    <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 font-medium transition-colors">
                      · Edit
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={onOpenEditProfile}
                title="Edit Profil Akun"
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onLogout}
                title="Keluar / Ganti Akun"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row (Centered) */}
      {!isGuest && (
        <div className="flex md:hidden items-center justify-center gap-1.5 px-2 py-2 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-600 overflow-x-auto">
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-2 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'map' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                Peta Live
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-2 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'invoices' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                Invoice
              </button>

              <button
                onClick={() => setActiveTab('courier')}
                className={`px-2 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'courier' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                Kurir
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`px-2 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'tracking' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                Lacak Resi
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-2 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'analytics' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                Analitik
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`px-2 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'database' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                MySQL
              </button>
            </>
          )}

          {isKurir && (
            <>
              <button
                onClick={() => setActiveTab('courier')}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'courier' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                Portal Kurir
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'map' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                Rute Peta
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap text-xs ${
                  activeTab === 'tracking' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
                }`}
              >
                Lacak Resi
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
