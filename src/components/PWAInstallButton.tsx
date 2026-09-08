"use client";

import { usePWA } from "./PWAProvider";
import { IconDownload } from "./Icons";

export default function PWAInstallButton({ className = "" }: { className?: string }) {
  const { canInstall, installApp } = usePWA();

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {canInstall ? (
        <button
          type="button"
          onClick={installApp}
          title="Install IP-SAKTI as a standalone desktop app"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs transition shadow-sm"
        >
          <IconDownload className="w-3.5 h-3.5 text-black" />
          <span>Install App</span>
        </button>
      ) : null}

      <a
        href="/api/app/download"
        download="IP-SAKTI-Windows-App.zip"
        title="Download IP-SAKTI Windows Desktop App (.zip installer)"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181824] hover:bg-[#222232] border border-[#2a2a3e] hover:border-zinc-600 text-xs font-semibold text-zinc-200 hover:text-white transition shadow-sm group"
      >
        <IconDownload className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
        <span>Download App</span>
      </a>
    </div>
  );
}
