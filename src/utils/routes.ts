export type AppTab = 'map' | 'invoices' | 'courier' | 'tracking' | 'analytics' | 'database';

/**
 * Maps browser pathname to internal AppTab
 * Supports English routes as well as natural Indonesian aliases
 */
export function getTabFromPath(pathname: string): AppTab | null {
  if (!pathname) return null;
  const clean = pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
  switch (clean) {
    case 'map':
    case 'peta':
    case 'live':
      return 'map';
    case 'invoices':
    case 'invoice':
    case 'data-invoice':
      return 'invoices';
    case 'courier':
    case 'kurir':
    case 'portal-kurir':
    case 'portal':
      return 'courier';
    case 'tracking':
    case 'lacak':
    case 'lacak-resi':
    case 'resi':
      return 'tracking';
    case 'analytics':
    case 'analitik':
    case 'performa':
      return 'analytics';
    case 'database':
    case 'mysql':
    case 'db':
      return 'database';
    default:
      return null;
  }
}

/**
 * Returns canonical browser URL path for each tab
 */
export function getPathFromTab(tab: AppTab): string {
  switch (tab) {
    case 'map':
      return '/map';
    case 'invoices':
      return '/invoices';
    case 'courier':
      return '/courier';
    case 'tracking':
      return '/tracking';
    case 'analytics':
      return '/analytics';
    case 'database':
      return '/database';
    default:
      return '/';
  }
}
