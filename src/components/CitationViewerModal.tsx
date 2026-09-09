"use client";

import { useState } from "react";
import { IconFileText, IconDownload, IconExternalLink, IconCopy, IconCheck, IconX, IconShield } from "./Icons";
import { getTranslation } from "@/src/lib/i18n";

export interface CitationData {
  id?: string;
  document: string;
  section: string;
  page?: string;
  jurisdiction?: string;
  ipType?: string;
  productType?: string;
  snippet: string;
  highlightPoint?: string;
  fullText: string;
  confidence: number;
  downloadUrl: string;
  viewUrl: string;
}

interface Props {
  citation: CitationData | null;
  isOpen: boolean;
  onClose: () => void;
  highlightKeyword?: string;
  language?: string;
}

export default function CitationViewerModal({
  citation,
  isOpen,
  onClose,
  highlightKeyword = "",
  language = "English",
}: Props) {
  const [copied, setCopied] = useState(false);
  const t = getTranslation(language);

  if (!isOpen || !citation) return null;

  function copyText() {
    if (!citation) return;
    navigator.clipboard.writeText(citation.fullText || citation.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderHighlightedText(text: string) {
    if (!text) return "No content excerpt available.";
    if (!highlightKeyword.trim()) {
      return (
        <span className="leading-relaxed whitespace-pre-wrap font-sans text-sm text-zinc-300">
          {text}
        </span>
      );
    }

    const words = highlightKeyword
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (words.length === 0) {
      return (
        <span className="leading-relaxed whitespace-pre-wrap font-sans text-sm text-zinc-300">
          {text}
        </span>
      );
    }

    const regex = new RegExp(`(${words.join("|")})`, "gi");
    const parts = text.split(regex);

    return (
      <span className="leading-relaxed whitespace-pre-wrap font-sans text-sm text-zinc-300">
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-amber-400/20 text-amber-200 font-semibold px-1 py-0.5 rounded border border-amber-400/30"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0e0e12] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-[#121216] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 shrink-0 mt-0.5">
              <IconFileText className="w-4 h-4 text-zinc-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-md">
                  {citation.document}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 truncate">
                  {citation.section}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2 font-mono text-[10px] sm:text-[11px] flex-wrap">
                <span>{t.jurisdictionLabel}: {citation.jurisdiction || "India"}</span>
                <span>•</span>
                <span>{t.domainLabel}: {citation.ipType || "General IP"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition shrink-0"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* CONFIDENCE BADGE */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141418] border border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono text-zinc-300">
                {t.factualGroundingAlignment}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {citation.confidence}% {t.confidenceBadge}
            </span>
          </div>

          {/* HIGHLIGHTED CITATION CONTENT */}
          <div className="space-y-3">
            {citation.highlightPoint && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed font-sans">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-semibold block mb-1">
                  {t.keyVerifiedPoint}
                </span>
                <p className="font-medium text-amber-100">{citation.highlightPoint}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                {t.fullSourceText}
              </span>
              <span className="text-[11px] text-amber-300/80 font-mono flex items-center gap-1">
                <span>✦</span>
                <span>{t.exactMatchText}</span>
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#08080a] border border-zinc-800/80 max-h-60 sm:max-h-72 overflow-y-auto">
              {renderHighlightedText(citation.fullText || citation.snippet)}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-800/80 bg-[#121216] flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={copyText}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.copiedAction}</span>
              </>
            ) : (
              <>
                <IconCopy className="w-3.5 h-3.5" />
                <span>{t.copyExcerpt}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={citation.viewUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition flex items-center gap-1.5"
            >
              <IconExternalLink className="w-3.5 h-3.5" />
              <span>{t.openDocument}</span>
            </a>

            <a
              href={citation.downloadUrl}
              download
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <IconDownload className="w-3.5 h-3.5" />
              <span>{t.download}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
