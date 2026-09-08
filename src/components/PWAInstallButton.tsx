"use client";

import { useState } from "react";
import { usePWA } from "./PWAProvider";
import { IconDownload, IconX, IconCheck } from "./Icons";

export default function PWAInstallButton({ className = "" }: { className?: string }) {
  const { canInstall, installApp } = usePWA();
  const [showModal, setShowModal] = useState(false);

  function handleClick() {
    if (canInstall) {
      installApp();
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
        <button
          type="button"
          onClick={handleClick}
          title="Install IP-SAKTI App on your device"
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition shadow-sm active:scale-95 shrink-0"
        >
          <IconDownload className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="font-semibold text-[11px] sm:text-xs">Download App</span>
        </button>
      </div>

      {/* INSTALL & DOWNLOAD INSTRUCTIONS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-2xl bg-[#0e0e14] border border-[#222230] p-4 sm:p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c1c28] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-zinc-100 text-black flex items-center justify-center font-bold text-xs">
                  IP
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-white">
                  Install IP-SAKTI App
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-[#1a1a24]"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 font-sans">
              <div className="p-3 rounded-xl bg-[#14141c] border border-[#22222e] space-y-2">
                <p className="font-semibold text-white text-[11px] uppercase tracking-wider font-mono">
                  📱 Mobile Installation (Android / iOS)
                </p>
                <ul className="space-y-1.5 text-[11px] text-zinc-400 list-disc list-inside">
                  <li>
                    <strong className="text-zinc-200">Chrome / Edge:</strong> Tap the 3 dots menu (⋮) → select <span className="text-white font-medium">"Install app"</span> or <span className="text-white font-medium">"Add to Home screen"</span>.
                  </li>
                  <li>
                    <strong className="text-zinc-200">iOS Safari:</strong> Tap the Share button (<span className="text-white">⎋</span>) → select <span className="text-white font-medium">"Add to Home Screen"</span>.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-[#14141c] border border-[#22222e] space-y-2">
                <p className="font-semibold text-white text-[11px] uppercase tracking-wider font-mono">
                  💻 Desktop Windows App
                </p>
                <p className="text-[11px] text-zinc-400">
                  Download the standalone Windows desktop bundle with offline support.
                </p>
                <a
                  href="/api/app/download"
                  download="IP-SAKTI-Windows-App.zip"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition shadow-sm"
                >
                  <IconDownload className="w-3.5 h-3.5" />
                  <span>Download Windows App (.zip)</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2 rounded-xl bg-[#1a1a24] hover:bg-[#242432] text-zinc-300 text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
