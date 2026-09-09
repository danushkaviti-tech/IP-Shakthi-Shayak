"use client";

import React, { useState } from "react";
import { FeedbackMathMetrics } from "@/lib/feedbackAnalytics";
import {
  IconShield,
  IconSparkles,
  IconBarChart,
  IconScale,
  IconCpu,
} from "@/src/components/Icons";

interface FeedbackMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: FeedbackMathMetrics | null;
}

export default function FeedbackMathModal({
  isOpen,
  onClose,
  metrics,
}: FeedbackMathModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "formulas" | "languages" | "logs"
  >("overview");

  if (!isOpen || !metrics) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0c12] border border-[#222232] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-[#1b1b26] bg-[#09090e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <IconScale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Model Performance & Mathematical Poll Analytics
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  RLHF ALIGNED
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Rigorous statistical metrics computed over user Good/Bad feedback polls.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-[#14141c] hover:bg-[#1e1e2a] border border-[#242434] text-zinc-400 hover:text-white flex items-center justify-center text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* SUB-TABS */}
        <div className="px-5 py-2.5 border-b border-[#181824] bg-[#08080c] flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeSubTab === "overview"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <IconBarChart className="w-3.5 h-3.5" />
            <span>Statistical Summary</span>
          </button>
          <button
            onClick={() => setActiveSubTab("formulas")}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeSubTab === "formulas"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <IconCpu className="w-3.5 h-3.5" />
            <span>Mathematical Formulations</span>
          </button>
          <button
            onClick={() => setActiveSubTab("languages")}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeSubTab === "languages"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <IconSparkles className="w-3.5 h-3.5" />
            <span>Language Stratification</span>
          </button>
          <button
            onClick={() => setActiveSubTab("logs")}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeSubTab === "logs"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <IconShield className="w-3.5 h-3.5" />
            <span>Audit Feedback ({metrics.recentPolls?.length || 0})</span>
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === "overview" && (
            <div className="space-y-5">
              {/* PRIMARY STAT TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#08080c] border border-[#1b1b26]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                    Empirical Good Rate
                  </span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                    {metrics.empiricalGoodRate}%
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {metrics.goodPolls} Good / {metrics.badPolls} Bad
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#08080c] border border-[#1b1b26]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                    Wilson 95% CI Lower
                  </span>
                  <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
                    {metrics.wilsonLowerBound}%
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    ±{metrics.wilsonMarginOfError}% MoE (z=1.96)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#08080c] border border-[#1b1b26]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                    Bayes Laplace Mean
                  </span>
                  <div className="text-xl font-bold text-purple-400 font-mono mt-1">
                    {metrics.laplaceSmoothedMean}%
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Beta(1,1) Prior Posterior
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#08080c] border border-[#1b1b26]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                    Net Alignment Score
                  </span>
                  <div
                    className={`text-xl font-bold font-mono mt-1 ${
                      metrics.netModelAlignmentScore >= 0
                        ? "text-emerald-300"
                        : "text-rose-400"
                    }`}
                  >
                    {metrics.netModelAlignmentScore >= 0 ? "+" : ""}
                    {metrics.netModelAlignmentScore}%
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    (Good − Bad) / Total
                  </span>
                </div>
              </div>

              {/* STATISTICAL HYPOTHESIS & RLHF COMPOSITE */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Binomial Z-Test & Significance
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        metrics.isStatisticallySignificant
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      }`}
                    >
                      {metrics.isStatisticallySignificant
                        ? "Statistically Significant (p < 0.05)"
                        : "Collecting Sample (p ≥ 0.05)"}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono space-y-1">
                    <div>
                      • Null Hypothesis H₀: p = 0.50 (Random Guessing Baseline)
                    </div>
                    <div>
                      • Calculated Z-Score:{" "}
                      <span className="text-white font-bold font-mono">
                        Z = {metrics.zScore}
                      </span>
                    </div>
                    <div>
                      • Cumulative P-Value:{" "}
                      <span className="text-emerald-400 font-bold font-mono">
                        p = {metrics.pValue}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      RLHF Convergence & Reliability
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                      Composite Index
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">
                        Reliability (1 − Defect Rate):
                      </span>
                      <span className="text-white font-semibold">
                        {metrics.reliabilityIndex}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">
                        RLHF Composite Quality Score:
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {metrics.rlhfConvergenceScore} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#181824] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${metrics.rlhfConvergenceScore}%` }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TAGS BREAKDOWN */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                  <span className="text-xs font-semibold text-emerald-400">
                    Positive Alignment Factors (Good Polls)
                  </span>
                  <div className="space-y-1.5">
                    {Object.entries(metrics.tagBreakdown.positive).map(
                      ([tag, item]) => (
                        <div
                          key={tag}
                          className="flex items-center justify-between text-xs font-mono bg-[#101018] px-2.5 py-1 rounded-lg border border-[#1a1a24]"
                        >
                          <span className="text-zinc-300 truncate">{tag}</span>
                          <span className="text-emerald-400 font-bold shrink-0 ml-2">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                  <span className="text-xs font-semibold text-rose-400">
                    Targeted Correction Areas (Negative Polls)
                  </span>
                  <div className="space-y-1.5">
                    {Object.entries(metrics.tagBreakdown.negative).length > 0 ? (
                      Object.entries(metrics.tagBreakdown.negative).map(
                        ([tag, item]) => (
                          <div
                            key={tag}
                            className="flex items-center justify-between text-xs font-mono bg-[#101018] px-2.5 py-1 rounded-lg border border-[#1a1a24]"
                          >
                            <span className="text-zinc-300 truncate">{tag}</span>
                            <span className="text-rose-400 font-bold shrink-0 ml-2">
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-xs text-zinc-500 font-mono py-2">
                        No persistent defect tags identified.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATHEMATICAL FORMULATIONS */}
          {activeSubTab === "formulas" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300">
                    1. Wilson Score Confidence Interval (95% CI)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Binomial Proportion Estimation
                  </span>
                </div>
                <div className="p-3 bg-[#040406] rounded-lg border border-[#181822] font-mono text-xs text-emerald-300 overflow-x-auto">
                  {metrics.mathFormulas.wilsonScore}
                </div>
                <p className="text-xs text-zinc-400">
                  Provides a conservative lower bound on model response approval even for small sample sizes, preventing ranking bias when n is low.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-300">
                    2. Bayesian Laplace Rule of Succession
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Beta(1,1) Prior Posterior Mean
                  </span>
                </div>
                <div className="p-3 bg-[#040406] rounded-lg border border-[#181822] font-mono text-xs text-purple-300 overflow-x-auto">
                  {metrics.mathFormulas.laplaceBayes}
                </div>
                <p className="text-xs text-zinc-400">
                  Smoothed probability estimator that guarantees stability against 0% / 100% boundary singularities.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300">
                    3. Net Model Alignment Score (NMAS)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Bounded in [-100%, +100%]
                  </span>
                </div>
                <div className="p-3 bg-[#040406] rounded-lg border border-[#181822] font-mono text-xs text-emerald-300 overflow-x-auto">
                  {metrics.mathFormulas.netAlignment}
                </div>
                <p className="text-xs text-zinc-400">
                  Measures net positive margin over negative defect outputs, similar to Net Promoter Score (NPS).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300">
                    4. One-Sample Binomial Hypothesis Z-Test
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Null Hypothesis Testing
                  </span>
                </div>
                <div className="p-3 bg-[#040406] rounded-lg border border-[#181822] font-mono text-xs text-amber-300 overflow-x-auto">
                  {metrics.mathFormulas.zScoreTest}
                </div>
                <p className="text-xs text-zinc-400">
                  Evaluates whether the model performs significantly better than random chance (p = 0.50) with statistical rigor (α = 0.05).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-300">
                    5. Composite RLHF Convergence Quality Index
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Multi-Factor Weighting
                  </span>
                </div>
                <div className="p-3 bg-[#040406] rounded-lg border border-[#181822] font-mono text-xs text-blue-300 overflow-x-auto">
                  {metrics.mathFormulas.rlhfIndex}
                </div>
                <p className="text-xs text-zinc-400">
                  Weighted combination of conservative lower bound (40%), Bayesian mean (35%), and defect resistance (25%).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGES */}
          {activeSubTab === "languages" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs font-mono text-zinc-300">
                  <thead className="text-[10px] uppercase text-zinc-500 border-b border-[#1b1b26]">
                    <tr>
                      <th className="pb-2">Language</th>
                      <th className="pb-2">Total Polls</th>
                      <th className="pb-2">Good / Bad</th>
                      <th className="pb-2">Empirical %</th>
                      <th className="pb-2">Wilson Lower 95%</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181822]">
                    {Object.entries(metrics.languageBreakdown).map(
                      ([lang, info]) => (
                        <tr key={lang} className="hover:bg-[#101018]">
                          <td className="py-2.5 font-semibold text-white">
                            {lang}
                          </td>
                          <td className="py-2.5 text-zinc-400">{info.total}</td>
                          <td className="py-2.5 text-zinc-300">
                            <span className="text-emerald-400">
                              {info.good}
                            </span>{" "}
                            /{" "}
                            <span className="text-rose-400">{info.bad}</span>
                          </td>
                          <td className="py-2.5 text-emerald-400 font-bold">
                            {info.goodRate}%
                          </td>
                          <td className="py-2.5 text-cyan-400">
                            {info.wilsonScore}%
                          </td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                info.status === "Optimal"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                              }`}
                            >
                              {info.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RECENT AUDIT LOGS */}
          {activeSubTab === "logs" && (
            <div className="space-y-3">
              {metrics.recentPolls?.length ? (
                metrics.recentPolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="p-3.5 rounded-xl bg-[#08080c] border border-[#1b1b26] space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            poll.rating === "positive"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                          }`}
                        >
                          {poll.rating === "positive" ? "👍 GOOD POLL" : "👎 BAD POLL"}
                        </span>
                        <span className="text-zinc-400">{poll.language}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(poll.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-white font-medium">
                      Q: {poll.question}
                    </div>

                    <div className="text-zinc-400 text-[11px] bg-[#040406] p-2 rounded-lg border border-[#14141c]">
                      A: {poll.answerSnippet}
                    </div>

                    {poll.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {poll.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[#14141c] text-zinc-300 text-[10px] border border-[#22222e]"
                          >
                            🏷️ {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {poll.comment && (
                      <div className="text-zinc-300 text-[11px] italic">
                        "{poll.comment}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No feedback polls submitted yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-[#1b1b26] bg-[#09090e] flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Total Sample Size: n = {metrics.totalPolls} evaluations</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
