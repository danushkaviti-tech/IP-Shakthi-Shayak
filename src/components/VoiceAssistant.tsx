"use client";

import { useEffect, useState, useRef } from "react";
import { IconMicrophone, IconSpeaker } from "./Icons";

interface VoiceAssistantProps {
  language: string;
  onTranscript: (text: string) => void;
  textToSpeak?: string;
  autoRead?: boolean;
}

const LANGUAGE_CODE_MAP: Record<string, { bcp47: string; short: string }> = {
  English: { bcp47: "en-US", short: "en" },
  Hindi: { bcp47: "hi-IN", short: "hi" },
  Sanskrit: { bcp47: "hi-IN", short: "sa" },
  Telugu: { bcp47: "te-IN", short: "te" },
  Tamil: { bcp47: "ta-IN", short: "ta" },
  Bengali: { bcp47: "bn-IN", short: "bn" },
  Marathi: { bcp47: "mr-IN", short: "mr" },
  Gujarati: { bcp47: "gu-IN", short: "gu" },
  Kannada: { bcp47: "kn-IN", short: "kn" },
  Malayalam: { bcp47: "ml-IN", short: "ml" },
  Spanish: { bcp47: "es-ES", short: "es" },
  French: { bcp47: "fr-FR", short: "fr" },
  German: { bcp47: "de-DE", short: "de" },
};

export default function VoiceAssistant({
  language,
  onTranscript,
  textToSpeak,
  autoRead = false,
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Auto-detect language if text contains Indic scripts
  function detectScriptLanguage(text: string, defaultLang: string): string {
    if (/[\u0C00-\u0C7F]/.test(text)) return "Telugu";
    if (/[\u0900-\u097F]/.test(text)) return "Hindi";
    if (/[\u0B80-\u0BFF]/.test(text)) return "Tamil";
    if (/[\u0C80-\u0CFF]/.test(text)) return "Kannada";
    if (/[\u0D00-\u0D7F]/.test(text)) return "Malayalam";
    if (/[\u0980-\u09FF]/.test(text)) return "Bengali";
    if (/[\u0A80-\u0AFF]/.test(text)) return "Gujarati";
    return defaultLang;
  }

  // Handle TTS autoRead
  useEffect(() => {
    if (autoRead && textToSpeak) {
      speakText(textToSpeak);
    }
  }, [textToSpeak, autoRead]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  function toggleListening() {
    setSpeechError("");
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function startListening() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition not supported in browser.");
      return;
    }

    try {
      finalTranscriptRef.current = "";
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      const langConfig = LANGUAGE_CODE_MAP[language] || { bcp47: "en-US", short: "en" };
      recognition.lang = langConfig.bcp47;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += chunk + " ";
          } else {
            interim += chunk;
          }
        }
        const fullText = (finalTranscriptRef.current + interim).trim();
        if (fullText) {
          onTranscript(fullText);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          setSpeechError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setSpeechError("Failed to start microphone.");
      setIsListening(false);
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }

  function stopAudio() {
    isCancelledRef.current = true;
    if (typeof window !== "undefined") {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if ((window as any).__IP_SAKTI_ACTIVE_AUDIO__) {
        try {
          (window as any).__IP_SAKTI_ACTIVE_AUDIO__.pause();
          (window as any).__IP_SAKTI_ACTIVE_AUDIO__.src = "";
          (window as any).__IP_SAKTI_ACTIVE_AUDIO__ = null;
        } catch (e) {
          // Ignore pause error
        }
      }
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
  }

  function cleanTextForSpeech(text: string): string {
    return text
      .replace(/[*#_`~>]/g, "") // Remove markdown format characters
      .replace(/\[\d+\]/g, "") // Remove source citation references like [1], [2]
      .replace(/https?:\/\/\S+/g, "") // Remove URLs
      .replace(/\s+/g, " ")
      .trim();
  }

  // Split large text into clean sentence chunks
  function splitTextIntoSentences(text: string, maxLen = 160): string[] {
    const rawParts = text.split(/(?<=[.?!;:\n|।])\s+/);
    const chunks: string[] = [];

    for (const part of rawParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.length <= maxLen) {
        chunks.push(trimmed);
      } else {
        const words = trimmed.split(" ");
        let current = "";
        for (const word of words) {
          if ((current + " " + word).trim().length <= maxLen) {
            current = (current + " " + word).trim();
          } else {
            if (current) chunks.push(current);
            current = word;
          }
        }
        if (current) chunks.push(current);
      }
    }

    return chunks.length > 0 ? chunks : [text];
  }

  // Full-length natural single-channel voice player (prevents dual-engine echo/resound)
  function speakText(rawText: string) {
    if (typeof window === "undefined") return;

    if (isPlaying) {
      stopAudio();
      return;
    }

    // Stop any existing audio or browser synthesis immediately
    stopAudio();

    const cleanText = cleanTextForSpeech(rawText);
    if (!cleanText) return;

    const activeLang = detectScriptLanguage(cleanText, language);
    const langConfig = LANGUAGE_CODE_MAP[activeLang] || LANGUAGE_CODE_MAP["English"];

    // Use High-Definition single-channel Sequential Audio Queue via /api/tts
    playSequentialAudio(cleanText, langConfig.short);
  }

  function playSequentialAudio(text: string, shortLang: string) {
    stopAudio();
    isCancelledRef.current = false;
    setIsPlaying(true);

    const chunks = splitTextIntoSentences(text, 160);
    let currentIndex = 0;

    function playNextChunk() {
      if (isCancelledRef.current || currentIndex >= chunks.length) {
        setIsPlaying(false);
        audioRef.current = null;
        return;
      }

      const chunk = chunks[currentIndex];
      const ttsUrl = `/api/tts?lang=${encodeURIComponent(
        shortLang
      )}&text=${encodeURIComponent(chunk)}`;

      const audio = new Audio(ttsUrl);
      audioRef.current = audio;
      if (typeof window !== "undefined") {
        (window as any).__IP_SAKTI_ACTIVE_AUDIO__ = audio;
      }

      audio.onended = () => {
        if (!isCancelledRef.current) {
          currentIndex++;
          playNextChunk();
        }
      };

      audio.onerror = (e) => {
        console.warn("Audio chunk ended or skipped:", e);
        if (!isCancelledRef.current) {
          currentIndex++;
          playNextChunk();
        }
      };

      audio.play().catch((err) => {
        console.warn("Audio playback exception for chunk:", err);
        if (!isCancelledRef.current) {
          currentIndex++;
          playNextChunk();
        }
      });
    }

    playNextChunk();
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* MIC STT BUTTON */}
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? "Listening... Click to stop" : "Voice input"}
        className={`relative flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 ${
          isListening
            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
            : "bg-[#141418] hover:bg-[#1f1f26] text-zinc-300 hover:text-white border border-zinc-800"
        }`}
      >
        <IconMicrophone className="w-3.5 h-3.5" />
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* TTS PLAY/PAUSE BUTTON IF TEXT IS PROVIDED */}
      {textToSpeak && (
        <button
          type="button"
          onClick={() => speakText(textToSpeak)}
          title={isPlaying ? "Stop audio" : "Listen to full answer in Telugu/selected language"}
          className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium transition-all ${
            isPlaying
              ? "bg-white text-black font-semibold shadow-sm animate-pulse"
              : "bg-[#141418] hover:bg-[#1f1f26] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <IconSpeaker className="w-3 h-3" />
          <span>{isPlaying ? "Stop" : "Listen"}</span>
        </button>
      )}

      {speechError && (
        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
          {speechError}
        </span>
      )}
    </div>
  );
}
