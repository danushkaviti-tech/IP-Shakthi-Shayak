"use client";

import { useEffect, useState, createContext, useContext } from "react";

interface PWAContextType {
  canInstall: boolean;
  installApp: () => Promise<void>;
  isInstalled: boolean;
  isDownloaded: boolean;
  markDownloaded: () => void;
  markInstalled: () => void;
}

const PWAContext = createContext<PWAContextType>({
  canInstall: false,
  installApp: async () => {},
  isInstalled: false,
  isDownloaded: false,
  markDownloaded: () => {},
  markInstalled: () => {},
});

export function usePWA() {
  return useContext(PWAContext);
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

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

    // 2. Check if already installed or downloaded from storage or display-mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");
      
      const storedInstalled = localStorage.getItem("ipsakti_app_installed") === "true";
      const storedDownloaded = localStorage.getItem("ipsakti_app_downloaded") === "true";

      if (isStandalone || storedInstalled) {
        setIsInstalled(true);
      }
      if (storedDownloaded) {
        setIsDownloaded(true);
      }
    }

    // 3. Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only offer install if not already installed/downloaded
      const storedInstalled = typeof window !== "undefined" && localStorage.getItem("ipsakti_app_installed") === "true";
      const storedDownloaded = typeof window !== "undefined" && localStorage.getItem("ipsakti_app_downloaded") === "true";
      if (!storedInstalled && !storedDownloaded) {
        setCanInstall(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("ipsakti_app_installed", "true");
      }
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function markDownloaded() {
    setIsDownloaded(true);
    setCanInstall(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("ipsakti_app_downloaded", "true");
    }
  }

  function markInstalled() {
    setIsInstalled(true);
    setCanInstall(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("ipsakti_app_installed", "true");
    }
  }

  async function installApp() {
    if (!deferredPrompt) {
      alert("To install IP-SAKTI on your device:\n\n• On Chrome/Edge Desktop: Click the Install icon in your address bar.\n• On Mobile: Tap the 3-dots browser menu and choose 'Add to Home screen' / 'Install App'.");
      markInstalled();
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        markInstalled();
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Installation prompt error:", err);
    }
  }

  return (
    <PWAContext.Provider
      value={{
        canInstall: canInstall && !isInstalled && !isDownloaded,
        installApp,
        isInstalled,
        isDownloaded,
        markDownloaded,
        markInstalled,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}
