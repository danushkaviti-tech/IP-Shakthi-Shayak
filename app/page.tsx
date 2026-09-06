"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
};

export default function Home() {
  const [active, setActive] = useState("Dashboard");
  const [showAssistant, setShowAssistant] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("English");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

const [documents, setDocuments] = useState(0);
const [chunks, setChunks] = useState(0);

const [documentList, setDocumentList] = useState<any[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);

  const [user, setUser] = useState<{
    name?: string | null;
    email?: string | null;
  } | null>(null);

  const [showProfile, setShowProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const menu = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Knowledge Base", icon: "▣" },
    { name: "AI Assistant", icon: "✦" },
    { name: "Documents", icon: "◫" },
    { name: "Analytics", icon: "◉" },
  ];

  // ================= LOAD USER =================

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/session");

      if (!response.ok) return;

      const data = await response.json();

      if (data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }

  // ================= PDF UPLOAD =================

  async function uploadPDF(file: File) {
    if (uploading) return;

    setUploading(true);
    setUploadStatus("Uploading and processing PDF...");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "PDF upload failed");
      }

      setDocuments((prev) => prev + 1);

      setChunks((prev) => prev + (data.totalChunks || 0));

      setUploadStatus(
        `✓ Successfully indexed ${data.totalChunks || 0} knowledge chunks`
      );
    } catch (err) {
      console.error(err);

      setUploadStatus("");

      setError(
        err instanceof Error ? err.message : "Failed to upload PDF"
      );
    } finally {
      setUploading(false);
    }
  }

  // ================= ASK AI =================

  async function askAI(customQuestion?: string) {
    const finalQuestion = customQuestion || question;

    if (!finalQuestion.trim() || loading) {
      return;
    }

    setLoading(true);
    setAnswer("");
    setError("");

    const userMessage: Message = {
      role: "user",
      content: finalQuestion.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setQuestion("");

    try {
      const response = await fetch("/api/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: finalQuestion.trim(),
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setAnswer(data.answer);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);

      setError(
        "IP-SAKTI is temporarily unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  }

  // ================= NAVIGATION =================

  function navigateTo(section: string) {
    setActive(section);

    if (section === "AI Assistant") {
      openAssistant();
      return;
    }

    const sectionIds: Record<string, string> = {
      Dashboard: "dashboard",
      "Knowledge Base": "knowledge-base",
      "AI Assistant": "ai-assistant",
      Documents: "documents",
      Analytics: "analytics",
    };

    const element = document.getElementById(sectionIds[section]);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  // ================= OPEN ASSISTANT =================

  function openAssistant() {
    setActive("AI Assistant");
    setShowAssistant(true);

    setTimeout(() => {
      document.getElementById("ai-assistant")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  // ================= NEW CHAT =================

  function newChat() {
    setMessages([]);
    setQuestion("");
    setAnswer("");
    setError("");
    setSelectedFile(null);
    setUploadStatus("");
  }

  // ================= SUGGESTION =================

  function handleSuggestion(text: string) {
    setQuestion(text);
  }

  // ================= LOGOUT =================

  async function handleLogout() {
    setShowProfile(false);

    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <main className="min-h-screen bg-[#080b12] text-white flex">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="w-[250px] border-r border-white/10 bg-[#0b0f18] px-5 py-6 hidden md:flex flex-col sticky top-0 h-screen">
        {/* LOGO */}

        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-500/10">
            I
          </div>

          <div>
            <h1 className="font-bold text-lg tracking-tight">
              IP-SAKTI
            </h1>

            <p className="text-[10px] text-gray-500 tracking-widest">
              SAHAYAK
            </p>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-3">
            Workspace
          </p>

          {menu.map((item) => (
            <button
              key={item.name}
              onClick={() => navigateTo(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                active === item.name
                  ? "bg-white/10 text-white border border-white/10 shadow-sm"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        {/* BOTTOM */}

        <div className="mt-auto">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-400/5 p-4">
            <p className="text-xs text-gray-400 mb-2">
              Knowledge Status
            </p>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                System Ready
              </span>

              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
            </div>

            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[82%] h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" />
            </div>

            <p className="text-[10px] text-gray-500 mt-2">
              Knowledge base synchronized
            </p>
          </div>

          <button className="w-full mt-4 text-left px-3 py-3 text-sm text-gray-400 hover:text-white transition">
            ⚙ Settings
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="flex-1 min-w-0">
        {/* TOPBAR */}

        <header className="h-[72px] border-b border-white/10 flex items-center justify-between px-5 md:px-10 bg-[#080b12]/90 backdrop-blur-xl sticky top-0 z-40">
          <div>
            <p className="text-xs text-gray-500">Workspace</p>

            <h2 className="font-semibold">{active}</h2>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* NOTIFICATIONS */}

            <button className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
              🔔
            </button>

            {/* PROFILE */}

            <div className="relative">
              <button
                onClick={() => setShowProfile((prev) => !prev)}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5 transition"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">
                    {user?.name || "Researcher"}
                  </p>

                  <p className="text-[10px] text-gray-500">
                    {user?.email || "IP-SAKTI Workspace"}
                  </p>
                </div>

                <span className="hidden sm:block text-xs text-gray-500">
                  ▾
                </span>
              </button>

              {/* PROFILE DROPDOWN */}

              {showProfile && (
                <div className="absolute right-0 top-12 w-60 rounded-2xl border border-white/10 bg-[#11151f] shadow-2xl shadow-black/40 p-2 z-[100]">
                  <div className="px-3 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.name || "Researcher"}
                        </p>

                        <p className="text-xs text-gray-500 truncate mt-1">
                          {user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 px-3 py-2.5 rounded-xl text-left text-sm text-red-400 hover:bg-red-500/10 transition"
                  >
                    ↪ Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="p-5 md:p-10 max-w-[1500px] mx-auto pb-28 md:pb-10">
          {/* =====================================================
              DASHBOARD / HERO
          ===================================================== */}

          <div
            id="dashboard"
            className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111526] via-[#0d111d] to-[#09131a] p-7 md:p-10 mb-7"
          >
            <div className="absolute -top-24 -right-20 h-64 w-64 bg-violet-600/20 blur-[100px]" />

            <div className="absolute -bottom-24 right-1/3 h-64 w-64 bg-cyan-500/10 blur-[100px]" />

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-300 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                AI-Powered IP Intelligence
              </div>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Navigate Intellectual Property
                <span className="block bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  with confidence.
                </span>
              </h1>

              <p className="mt-5 text-gray-400 max-w-2xl leading-relaxed">
                Explore patents, geographical indications, trademarks,
                traditional knowledge and regulatory frameworks using a
                source-grounded AI assistant.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  onClick={openAssistant}
                  className="px-5 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-200 transition"
                >
                  ✦ Ask AI Assistant
                </button>

                <button
                  onClick={() => navigateTo("Knowledge Base")}
                  disabled={uploading}
                  className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition disabled:opacity-50"
                >
                  + Add Knowledge
                </button>
              </div>
            </div>
          </div>

          {/* =====================================================
              STATS
          ===================================================== */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            <Stat
              title="Documents"
              value={documents.toString()}
              description="Knowledge sources"
              icon="▣"
            />

            <Stat
              title="Knowledge Chunks"
              value={chunks.toString()}
              description="Indexed content"
              icon="◈"
            />

            <Stat
              title="Queries"
              value={messages
                .filter((m) => m.role === "user")
                .length.toString()}
              description="AI interactions"
              icon="✦"
            />

            <Stat
              title="Sources"
              value={messages
                .reduce(
                  (total, message) =>
                    total + (message.sources?.length || 0),
                  0
                )
                .toString()}
              description="Retrieved references"
              icon="⌁"
            />
          </div>

          {/* =====================================================
              KNOWLEDGE BASE
          ===================================================== */}

          <div
            id="knowledge-base"
            className="grid lg:grid-cols-3 gap-6 scroll-mt-24"
          >
            {/* UPLOAD */}

            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0d111a] p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-lg">
                    Build your knowledge base
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Add authoritative documents and regulatory material.
                  </p>
                </div>

                <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-400">
                  Ready
                </span>
              </div>

              {/* FILE INPUT */}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setSelectedFile(file);
                    uploadPDF(file);
                  }

                  e.target.value = "";
                }}
              />

              {/* UPLOAD AREA */}

              <div
                onClick={() => {
                  if (!uploading) {
                    fileInputRef.current?.click();
                  }
                }}
                className="border border-dashed border-white/15 rounded-2xl p-8 md:p-10 text-center hover:border-violet-400/40 hover:bg-violet-400/[0.02] transition cursor-pointer"
              >
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/10 border border-white/10 flex items-center justify-center text-2xl mb-5">
                  ↑
                </div>

                <h4 className="font-medium">
                  Upload regulatory documents
                </h4>

                <p className="text-sm text-gray-500 mt-2">
                  PDF documents are supported
                </p>

                <button
                  disabled={uploading}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!uploading) {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm hover:bg-white/15 disabled:opacity-50"
                >
                  {uploading ? "Processing..." : "Choose files"}
                </button>

                {/* SELECTED FILE */}

                {selectedFile && (
                  <div className="mt-5 p-4 rounded-xl bg-violet-500/10 border border-violet-400/20">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 truncate">
                          📄 {selectedFile.name}
                        </p>

                        <p className="text-[11px] text-gray-500 mt-1">
                          {(
                            selectedFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>

                      {uploading && (
                        <div className="h-5 w-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin shrink-0" />
                      )}
                    </div>

                    {uploadStatus && (
                      <p
                        className={`text-[11px] mt-3 ${
                          uploadStatus.startsWith("✓")
                            ? "text-green-400"
                            : "text-violet-300"
                        }`}
                      >
                        {uploadStatus}
                      </p>
                    )}
                  </div>
                )}

                {!selectedFile && (
                  <p className="text-[11px] text-gray-600 mt-4">
                    Or drag & drop files here
                  </p>
                )}
              </div>

              {/* TEXT INPUT */}

              <div className="mt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px bg-white/10 flex-1" />

                  <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                    or
                  </span>

                  <div className="h-px bg-white/10 flex-1" />
                </div>

                <textarea
                  placeholder="Paste regulatory text, policy content, notes or other knowledge..."
                  className="w-full h-28 resize-none rounded-2xl bg-black/20 border border-white/10 p-4 text-sm text-gray-300 placeholder:text-gray-600 outline-none focus:border-violet-400/40 transition"
                />

                <div className="flex justify-end mt-3">
                  <button className="px-4 py-2 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-400/20 text-sm hover:bg-violet-500/25 transition">
                    Add Text
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="rounded-3xl border border-white/10 bg-[#0d111a] p-6">
              <h3 className="font-semibold text-lg">
                Quick actions
              </h3>

              <p className="text-sm text-gray-500 mt-1 mb-5">
                Jump directly into your workspace.
              </p>

              <div className="space-y-3">
                <Action
                  icon="✦"
                  title="Ask IP-SAKTI"
                  description="Query your knowledge base"
                  onClick={openAssistant}
                />

                <Action
                  icon="⌕"
                  title="Search sources"
                  description="Find relevant regulations"
                  onClick={() => navigateTo("Knowledge Base")}
                />

                <Action
                  icon="◈"
                  title="Explore knowledge"
                  description="Browse indexed material"
                  onClick={() => navigateTo("Documents")}
                />

                <Action
                  icon="◉"
                  title="View analytics"
                  description="Monitor your knowledge base"
                  onClick={() => navigateTo("Analytics")}
                />
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-400/5 border border-white/10">
                <p className="text-xs text-gray-400">
                  IP-SAKTI Sahayak
                </p>

                <p className="text-sm font-medium mt-1">
                  Source-grounded intelligence
                </p>

                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  Answers are generated using your verified knowledge
                  sources with citations.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              AI ASSISTANT
          ===================================================== */}

          {showAssistant && (
            <div
              id="ai-assistant"
              className="mt-7 scroll-mt-24 rounded-3xl border border-white/10 bg-[#0d111a] min-h-[650px] overflow-hidden"
            >
              {/* ASSISTANT HEADER */}

              <div className="border-b border-white/10 px-5 md:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-lg shadow-lg shadow-violet-500/10">
                    ✦
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      IP-SAKTI Sahayak
                    </h3>

                    <p className="text-xs text-gray-500">
                      Your AI assistant for IP & Ayurveda regulations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* LANGUAGE */}

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none"
                  >
                    <option value="English">English</option>

                    <option value="Telugu">తెలుగు</option>

                    <option value="Hindi">हिंदी</option>
                  </select>

                  {/* NEW CHAT */}

                  <button
                    onClick={newChat}
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition"
                  >
                    + New chat
                  </button>

                  {/* CLOSE */}

                  <button
                    onClick={() => setShowAssistant(false)}
                    className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white transition"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* CHAT AREA */}

              <div className="p-5 md:p-10 max-w-4xl mx-auto">
                {/* EMPTY STATE */}

                {messages.length === 0 && !loading && (
                  <div className="min-h-[360px] flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/10">
                      ✦
                    </div>

                    <h2 className="text-2xl md:text-3xl font-semibold mt-6">
                      How can I help with IP today?
                    </h2>

                    <p className="text-gray-500 text-sm mt-3 max-w-lg">
                      Ask about patents, trademarks, geographical
                      indications, Ayurveda regulations, traditional
                      knowledge or ABS compliance.
                    </p>

                    {/* SUGGESTIONS */}

                    <div className="grid sm:grid-cols-2 gap-3 mt-8 w-full">
                      <Suggestion
                        text="Can an Ayurvedic formulation be patented?"
                        onClick={handleSuggestion}
                      />

                      <Suggestion
                        text="What are the requirements for GI registration?"
                        onClick={handleSuggestion}
                      />

                      <Suggestion
                        text="Explain ABS compliance for traditional knowledge."
                        onClick={handleSuggestion}
                      />

                      <Suggestion
                        text="What IP protection is suitable for my product?"
                        onClick={handleSuggestion}
                      />
                    </div>
                  </div>
                )}

                {/* CHAT MESSAGES */}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-8 ${
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="max-w-[80%]">
                        <div className="rounded-3xl rounded-br-md bg-white/10 border border-white/10 px-5 py-4">
                          <p className="text-sm leading-6 text-gray-200 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="flex gap-4">
                          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                            ✦
                          </div>

                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-2">
                              IP-SAKTI
                            </p>

                            <div className="text-sm text-gray-300 leading-7 whitespace-pre-wrap">
                              {message.content}
                            </div>

                            {/* SOURCES */}

                            {message.sources &&
                              message.sources.length > 0 && (
                                <div className="mt-6">
                                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">
                                    Sources
                                  </p>

                                  <div className="grid gap-2">
                                    {message.sources.map(
                                      (source, sourceIndex) => (
                                        <div
                                          key={sourceIndex}
                                          className="rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:bg-white/[0.04] transition"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-xs">
                                              {sourceIndex + 1}
                                            </div>

                                            <div>
                                              <p className="text-xs font-medium text-gray-300">
                                                {source.document ||
                                                  source.source ||
                                                  "Knowledge Source"}
                                              </p>

                                              {source.section && (
                                                <p className="text-[10px] text-gray-600 mt-1">
                                                  {source.section}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* LOADING */}

                {loading && (
                  <div className="flex gap-4 mb-8">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                      ✦
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-3">
                        IP-SAKTI
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />

                        <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse [animation-delay:150ms]" />

                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:300ms]" />

                        <span className="text-xs text-gray-500 ml-2">
                          Analyzing your question...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERROR */}

                {error && (
                  <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
                    <p className="text-sm text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                {/* PROMPT */}

                <div className="sticky bottom-5 mt-8">
                  <div className="rounded-3xl border border-white/10 bg-[#11151f] shadow-2xl shadow-black/30 p-3 focus-within:border-violet-400/30 transition">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          askAI();
                        }
                      }}
                      placeholder={
                        language === "Telugu"
                          ? "మీ IP ప్రశ్నను అడగండి..."
                          : language === "Hindi"
                          ? "अपना IP प्रश्न पूछें..."
                          : "Ask IP-SAKTI anything..."
                      }
                      className="w-full h-20 resize-none bg-transparent outline-none px-3 pt-2 text-sm text-gray-200 placeholder:text-gray-600"
                    />

                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        {/* ATTACH */}

                        <button
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={uploading}
                          className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
                          title="Attach document"
                        >
                          📎
                        </button>

                        <span className="text-[11px] text-gray-600">
                          {language}
                        </span>

                        {selectedFile && (
                          <span className="text-[10px] text-violet-300 truncate max-w-[150px]">
                            {selectedFile.name}
                          </span>
                        )}
                      </div>

                      {/* SEND */}

                      <button
                        onClick={() => askAI()}
                        disabled={loading || !question.trim()}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition"
                      >
                        {loading ? "..." : "↑"}
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-[10px] text-gray-600 mt-3">
                    IP-SAKTI may make mistakes. Verify important information
                    with authoritative sources. This is not legal advice.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              DOCUMENTS
          ===================================================== */}

          <div
            id="documents"
            className="mt-7 scroll-mt-24 rounded-3xl border border-white/10 bg-[#0d111a] p-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
              <div>
                <h3 className="font-semibold text-lg">
                  Documents
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Manage your indexed regulatory knowledge sources.
                </p>
              </div>

              <button
                onClick={() => navigateTo("Knowledge Base")}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                + Add document
              </button>
            </div>

            {documents === 0 ? (
              <div className="py-14 text-center border border-white/5 rounded-2xl bg-black/10">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-2xl opacity-70">
                  ◫
                </div>

                <p className="text-sm text-gray-400 mt-4">
                  No documents indexed yet
                </p>

                <p className="text-xs text-gray-600 mt-1">
                  Upload your first regulatory document to build the
                  knowledge base.
                </p>

                <button
                  onClick={() => navigateTo("Knowledge Base")}
                  className="mt-5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  Upload document
                </button>
              </div>
            ) : (
              <div className="border border-white/5 rounded-2xl bg-black/10 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-600">
                  <div className="col-span-6">Document</div>

                  <div className="col-span-3">Chunks</div>

                  <div className="col-span-3 text-right">
                    Status
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 px-5 py-5 items-center">
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      📄
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-gray-300 truncate">
                        {selectedFile?.name || "Knowledge document"}
                      </p>

                      <p className="text-[10px] text-gray-600 mt-1">
                        Indexed knowledge source
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 text-xs text-gray-500">
                    {chunks}
                  </div>

                  <div className="col-span-3 flex justify-end">
                    <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-lg">
                      Indexed
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================
              ANALYTICS
          ===================================================== */}

          <div
            id="analytics"
            className="mt-7 scroll-mt-24 rounded-3xl border border-white/10 bg-[#0d111a] p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-lg">
                  Analytics
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Monitor your IP-SAKTI knowledge and AI activity.
                </p>
              </div>

              <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-400">
                Current session
              </div>
            </div>

            {/* ANALYTICS CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard
                title="Total Queries"
                value={messages
                  .filter((m) => m.role === "user")
                  .length.toString()}
                description="Questions asked"
                icon="✦"
              />

              <AnalyticsCard
                title="Documents"
                value={documents.toString()}
                description="Indexed documents"
                icon="◫"
              />

              <AnalyticsCard
                title="Knowledge Chunks"
                value={chunks.toString()}
                description="Indexed content"
                icon="◈"
              />

              <AnalyticsCard
                title="Sources Used"
                value={messages
                  .reduce(
                    (total, message) =>
                      total + (message.sources?.length || 0),
                    0
                  )
                  .toString()}
                description="Retrieved references"
                icon="⌁"
              />
            </div>

            {/* ACTIVITY */}

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-sm font-medium">
                    Knowledge Activity
                  </h4>

                  <p className="text-[11px] text-gray-600 mt-1">
                    Current workspace activity
                  </p>
                </div>

                <span className="text-[10px] px-2 py-1 rounded-lg bg-green-500/10 text-green-400">
                  LIVE
                </span>
              </div>

              <div className="space-y-4">
                <ActivityRow
                  icon="◈"
                  title="Knowledge chunks indexed"
                  description={`${chunks} chunks currently available`}
                />

                <ActivityRow
                  icon="✦"
                  title="AI interactions"
                  description={`${
                    messages.filter((m) => m.role === "user").length
                  } queries processed`}
                />

                <ActivityRow
                  icon="✓"
                  title="System status"
                  description="Knowledge system operational"
                  success
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex flex-col md:flex-row justify-between gap-3 mt-8 text-[11px] text-gray-600">
            <p>
              IP-SAKTI Sahayak · AI for Intellectual Property & Regulatory
              Guidance
            </p>

            <p>AI-generated information is not legal advice.</p>
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0f18]/95 backdrop-blur-xl px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {menu.map((item) => (
            <button
              key={item.name}
              onClick={() => navigateTo(item.name)}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition ${
                active === item.name
                  ? "bg-white/10 text-white"
                  : "text-gray-500"
              }`}
            >
              <span className="text-base">{item.icon}</span>

              <span className="text-[9px] truncate max-w-full px-1">
                {item.name === "Knowledge Base"
                  ? "Knowledge"
                  : item.name === "AI Assistant"
                  ? "AI"
                  : item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d111a] p-5 hover:border-white/20 hover:bg-white/[0.02] transition">
      <div className="flex justify-between">
        <span className="text-gray-500 text-sm">{title}</span>

        <span className="text-gray-500">{icon}</span>
      </div>

      <div className="text-2xl font-bold mt-4">{value}</div>

      <p className="text-[11px] text-gray-600 mt-1">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ANALYTICS CARD
========================================================= */

function AnalyticsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{title}</span>

        <span className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
          {icon}
        </span>
      </div>

      <p className="text-2xl font-bold mt-4">{value}</p>

      <p className="text-[11px] text-gray-600 mt-1">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ACTIVITY ROW
========================================================= */

function ActivityRow({
  icon,
  title,
  description,
  success = false,
}: {
  icon: string;
  title: string;
  description: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-xs text-gray-300">{title}</p>

        <p
          className={`text-[10px] mt-1 ${
            success ? "text-green-500/70" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ACTION
========================================================= */

function Action({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition text-left"
    >
      <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-lg">
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="text-[11px] text-gray-600 mt-1">
          {description}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   SUGGESTION
========================================================= */

function Suggestion({
  text,
  onClick,
}: {
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(text)}
      className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-violet-400/20 transition"
    >
      <p className="text-sm text-gray-400">{text}</p>

      <span className="block text-xs text-gray-600 mt-2">
        Ask IP-SAKTI →
      </span>
    </button>
  );
} 