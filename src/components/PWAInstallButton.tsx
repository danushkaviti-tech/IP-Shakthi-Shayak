"use client";

import { usePWA } from "./PWAProvider";
import { IconDownload } from "./Icons";

export default function PWAInstallButton({ className = "" }: { className?: string }) {
  const { canInstall, installApp, isInstalled, isDownloaded, markDownloaded } = usePWA();

  // If user has already installed the app and downloaded the desktop package, hide the container completely
  if (isInstalled && isDownloaded) {
    return null;
  }

  // If neither can be shown, return null
  const showInstall = canInstall && !isInstalled;
  const showDownload = !isDownloaded;

  if (!showInstall && !showDownload) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1 sm:gap-1.5 ${className}`}>
      {/* IF CAN INSTALL & NOT ALREADY INSTALLED -> SHOW INSTALL BUTTON, ELSE HIDE */}
      {showInstall ? (
        <button
          type="button"
          onClick={installApp}
          title="Install IP-SAKTI as a standalone app"
          className="inline-flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs transition shadow-sm shrink-0"
        >
          <IconDownload className="w-3.5 h-3.5 text-black" />
          <span className="hidden md:inline">Install</span>
        </button>
      ) : null}

      {/* IF NOT DOWNLOADED -> SHOW DESKTOP APP DOWNLOAD OPTION, ELSE HIDE WHEN DOWNLOADED */}
      {showDownload ? (
        <a
          href="/api/app/download"
          download="IP-SAKTI-Windows-App.zip"
          onClick={markDownloaded}
          title="Download IP-SAKTI Windows Desktop App (.zip installer)"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#181824] hover:bg-[#222232] border border-[#2a2a3e] hover:border-zinc-600 text-xs font-semibold text-zinc-200 hover:text-white transition shadow-sm group shrink-0"
        >
          <IconDownload className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
          <span className="hidden md:inline">Desktop App</span>
        </a>
      ) : null}
    </div>
  );
}

