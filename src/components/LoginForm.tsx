import React, { useState } from 'react';
import { AppUser } from '../types';
import {
  Package,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

interface LoginFormProps {
  onLoginSuccess: (user: AppUser) => void;
  onContinueAsGuest?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'kurir'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playNotificationSound('success');
        onLoginSuccess(data.user);
      } else {
        playNotificationSound('alert');
        setErrorMsg(data.error || 'Login gagal. Periksa username dan password Anda.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-8 px-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-indigo-600/20 via-indigo-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Compact container width: max-w-[340px] (tidak terlalu lebar, pas dan elegan) */}
      <div className="w-full max-w-[340px] mx-auto relative z-10 space-y-3.5">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2 border border-indigo-400/20">
            <Package className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            KirimKilat
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Logistik Percetakan & Pelacakan Kurir
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-3.5">
          {/* Strict Role Selector Tab (Admin vs Kurir) */}
          <div>
            <div className="grid grid-cols-2 p-1 bg-slate-950/90 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setErrorMsg(null);
                }}
                className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('kurir');
                  setErrorMsg(null);
                }}
                className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === 'kurir'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Kurir</span>
              </button>
            </div>

            <p className="text-[10.5px] text-center text-slate-400 mt-2">
              {selectedRole === 'admin' ? (
                <span>
                  Hanya user berlevel <strong className="text-indigo-400 font-mono">admin</strong> di database
                </span>
              ) : (
                <span>
                  Hanya user berlevel <strong className="text-emerald-400 font-mono">kurir</strong> di database
                </span>
              )}
            </p>
          </div>

          {/* Error Notification */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug text-[11px]">{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Username:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'Username akun admin' : 'Username akun kurir'}
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Password:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password akun"
                  className="w-full pl-8 pr-8 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-3 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 disabled:opacity-50 ${
                selectedRole === 'admin'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifikasi level...</span>
                </>
              ) : (
                <>
                  <span>{selectedRole === 'admin' ? 'Masuk sebagai Admin' : 'Masuk sebagai Kurir'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Guest / Public Tracking Link */}
          {onContinueAsGuest && (
            <div className="pt-2 text-center border-t border-slate-800/80">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
              >
                Lacak Resi Sebagai Pelanggan / Tamu &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
