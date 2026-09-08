"use client";

import { IconGlobe } from "./Icons";

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "English", name: "English", native: "EN" },
  { code: "Hindi", name: "Hindi", native: "हिन्दी" },
  { code: "Sanskrit", name: "Sanskrit", native: "संस्कृतम्" },
  { code: "Telugu", name: "Telugu", native: "తెలుగు" },
  { code: "Tamil", name: "Tamil", native: "தமிழ்" },
  { code: "Bengali", name: "Bengali", native: "বাংলা" },
  { code: "Marathi", name: "Marathi", native: "मराठी" },
  { code: "Gujarati", name: "Gujarati", native: "ગુજરાતી" },
  { code: "Kannada", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "Malayalam", name: "Malayalam", native: "മലയാളം" },
  { code: "Spanish", name: "Spanish", native: "ES" },
  { code: "French", name: "French", native: "FR" },
  { code: "German", name: "German", native: "DE" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  className?: string;
}

export default function LanguageSelector({
  value,
  onChange,
  className = "",
}: LanguageSelectorProps) {
  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`}>
      <span className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
        <IconGlobe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141418] hover:bg-[#1a1a20] text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg pl-6 sm:pl-8 pr-5 sm:pr-7 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all cursor-pointer appearance-none max-w-[95px] sm:max-w-none truncate"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-[#141418] text-zinc-100">
            {lang.name} ({lang.native})
          </option>
        ))}
      </select>
      <span className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-[8px] sm:text-[9px]">
        ▼
      </span>
    </div>
  );
}
