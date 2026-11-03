import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Automatically register PWA Service Worker (non-intrusive without auto-reload loops)
try {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Keep running seamlessly without disrupting user session
      console.log('[PWA] Versi baru tersedia di latar belakang.');
    },
    onNeedReload() {
      // Explicitly override any workbox auto-reload to prevent infinite reload loops
      console.log('[PWA] Service Worker aktif.');
    },
    onOfflineReady() {
      console.log('[PWA] KirimKilat siap digunakan offline.');
    },
    onRegisterError(error) {
      console.warn('[PWA] SW register error:', error);
    },
  });
} catch (e) {
  console.warn('[PWA] registerSW init failed:', e);
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
