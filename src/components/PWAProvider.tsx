"use client";

import { useEffect, useState, createContext, useContext } from "react";

interface PWAContextType {
  canInstall: boolean;
  installApp: () => Promise<void>;
  isInstalled: boolean;
}

const PWAContext = createContext<PWAContextType>({
  canInstall: false,
  installApp: async () => {},
  isInstalled: false,
});

export function usePWA() {
  return useContext(PWAContext);
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("PWA Service Worker registration error:", err);
        });
    }

    // 2. Check if already installed
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");
      setIsInstalled(!!isStandalone);
    }

    // 3. Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) {
      alert("To install IP-SAKTI on your device:\n\n• On Chrome/Edge Desktop: Click the Install icon in your address bar.\n• On Mobile: Tap the 3-dots browser menu and choose 'Add to Home screen' / 'Install App'.");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Installation prompt error:", err);
    }
  }

  return (
    <PWAContext.Provider value={{ canInstall, installApp, isInstalled }}>
      {children}
    </PWAContext.Provider>
  );
}
