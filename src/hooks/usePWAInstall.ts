import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt) {
      return window.__deferredPWAInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://')
      );
    }
    return false;
  });
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(ua));
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    // Capture global prompt if already caught
    if (window.__deferredPWAInstallPrompt) {
      setDeferredPrompt(window.__deferredPWAInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPWAInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = () => {
      if (window.__deferredPWAInstallPrompt) {
        setDeferredPrompt(window.__deferredPWAInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredPWAInstallPrompt = null;
      setIsInstalling(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Direct execution function - triggers native installation prompt immediately
  const executeDirectInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    setIsInstalling(true);

    let promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPWAInstallPrompt : null);

    // If prompt is not ready immediately, wait briefly (up to 800ms) in case it's currently dispatching
    if (!promptEvent && typeof window !== 'undefined') {
      await new Promise<void>((resolve) => {
        let timer: any = null;
        const onReady = () => {
          cleanup();
          resolve();
        };
        const cleanup = () => {
          window.removeEventListener('pwa-prompt-ready', onReady);
          if (timer) clearTimeout(timer);
        };
        window.addEventListener('pwa-prompt-ready', onReady, { once: true });
        timer = setTimeout(() => {
          cleanup();
          resolve();
        }, 800);
      });
      promptEvent = deferredPrompt || window.__deferredPWAInstallPrompt;
    }

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        setIsInstalling(false);

        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') {
            window.__deferredPWAInstallPrompt = null;
          }
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('[PWA] Direct install prompt execution failed:', err);
        setIsInstalling(false);
        return 'unsupported';
      }
    }

    setIsInstalling(false);
    return 'unsupported';
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt || (typeof window !== 'undefined' && !!window.__deferredPWAInstallPrompt),
    isInstalled,
    isAndroid,
    isIOS,
    isInstalling,
    deferredPrompt,
    executeDirectInstall,
  };
}
