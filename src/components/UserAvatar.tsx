import React, { useState, useEffect } from 'react';
import { Shield, Truck, User } from 'lucide-react';

interface UserAvatarProps {
  foto?: string | null;
  nama?: string;
  username?: string;
  level?: 'admin' | 'kurir' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  foto,
  nama = 'User',
  username = '',
  level = 'admin',
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if foto changes
  useEffect(() => {
    setHasError(false);
  }, [foto]);

  // Dimensions
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  }[size];

  // Generate 1-2 initials from name
  const getInitials = (nameStr: string) => {
    if (!nameStr) return '';
    const clean = nameStr.trim();
    if (!clean) return '';
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(nama || username);
  const isKurir = level === 'kurir';

  // Determine if URL is a valid web path (must start with / or http or data:)
  const cleanFoto = typeof foto === 'string' ? foto.trim() : '';
  const isPlaceholderOnly =
    !cleanFoto ||
    cleanFoto === 'avatar04.png' ||
    cleanFoto === 'null' ||
    cleanFoto === 'undefined' ||
    cleanFoto === 'default.png';

  const isValidUrl =
    !isPlaceholderOnly &&
    !hasError &&
    (cleanFoto.startsWith('http://') ||
      cleanFoto.startsWith('https://') ||
      cleanFoto.startsWith('/') ||
      cleanFoto.startsWith('data:image/'));

  return (
    <div className="relative inline-flex shrink-0">
      {isValidUrl ? (
        <img
          src={cleanFoto}
          alt={nama}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          className={`${sizeClasses} rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs ${className}`}
        />
      ) : (
        /* Sleek Gradient Avatar Placeholder for users without a profile picture */
        <div
          title={`${nama} (${level}) - Avatar Placeholder`}
          className={`${sizeClasses} rounded-full flex items-center justify-center font-bold tracking-wider select-none shadow-xs border ${
            isKurir
              ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white border-emerald-400/30 shadow-emerald-500/20'
              : 'bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 text-white border-indigo-400/30 shadow-indigo-500/20'
          } ${className}`}
        >
          {initials ? (
            <span>{initials}</span>
          ) : (
            <User className="w-1/2 h-1/2 text-white/90" />
          )}
        </div>
      )}

      {/* Role Badge Indicator */}
      {showBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${
            isKurir ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
          }`}
          title={`Level: ${level}`}
        >
          {isKurir ? (
            <Truck className="w-2.5 h-2.5" />
          ) : (
            <Shield className="w-2.5 h-2.5" />
          )}
        </span>
      )}
    </div>
  );
};
