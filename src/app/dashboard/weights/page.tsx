// src/app/dashboard/weights/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";

type Pos = "QB" | "RB" | "WR" | "TE";
type Weights = Record<string, number>;

const POS_KEYS: Record<Pos, string[]> = {
  QB: [
    "Recent3_FantasyAvg",
    "PassAtt_perG",
    "DeepAtt_perG",
    "RushYds_perG",
    "Opp_PressureRate_A",
    "Opp_ExplosivePass_A",
  ],
  RB: [
    "SnapShare",
    "RushShare",
    "Targets_perG",
    "RedZoneTouches",
    "GoalLineCarries",
    "Opp_RunSuccess_A",
    "RecentForm_RB",
    "TwoMinRole",
    "ThirdDownRole",
  ],
  WR: [
    "TargetShare",
    "AirYards",
    "aDOT",
    "RedZoneTargets",
    "YardsPerRouteRun",
    "RecentForm_WR",
  ],
  TE: [
    "Route",
    "TargetShare",
    "RedZoneTargets",
    "YardsPerRouteRun",
    "Recent3_FantasyAvg",
  ],
};

export default function WeightsPage() {
  const [status, setStatus] = useState("Loading…");
  const [weights, setWeights] = useState<Record<Pos, Weights>>({
    QB: {} as Weights, RB: {} as Weights, WR: {} as Weights, TE: {} as Weights,
  });
  const [active, setActive] = useState<Pos>("QB");

  useEffect(() => {
    const init = async () => {
      setStatus("Loading weights…");
      try {
        const res = await fetch("/api/weights", { cache: "no-store" });
        const json = await res.json();
        if (json.status === "success" && json.data) {
          setWeights((prev) => ({ ...prev, ...json.data }));
          setStatus("✅ Loaded");
        } else {
          setStatus("⚠️ Using defaults");
        }
      } catch {
        setStatus("⚠️ Using defaults");
      }
    };
    init();
  }, []);

  const activeKeys = useMemo(() => POS_KEYS[active], [active]);

  const updateWeight = (k: string, v: number) => {
    setWeights((prev) => ({
      ...prev,
      [active]: { ...(prev[active] || {}), [k]: v },
    }));
  };

  const save = async () => {
    setStatus("💾 Saving…");
    const res = await fetch("/api/weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weights),
    });
    const json = await res.json();
    if (json.status === "success") setStatus("✅ Saved");
    else setStatus("❌ Save failed");
  };

  return (
    <div className="min-h-screen p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">⚙️ Weights</h1>
          <p className="text-gray-400 text-sm">{status}</p>
        </div>
        <button
          onClick={save}
          className="mt-3 sm:mt-0 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Weights
        </button>
      </header>

      <div className="bg-gray-900/60 border border-gray-800 rounded-lg">
        <div className="border-b border-gray-800 flex">
          {(["QB","RB","WR","TE"] as Pos[]).map((p) => (
            <button
              key={p}
              onClick={() => setActive(p)}
              className={`px-4 py-2 text-sm ${
                active === p ? "bg-gray-800 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="p-4 grid md:grid-cols-2 gap-4">
          {activeKeys.map((k) => {
            const val = Number((weights[active] || {})[k] ?? 0);
            return (
              <div key={k} className="bg-gray-900 border border-gray-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{k}</p>
                    <p className="text-xs text-gray-400">
                      Tip: Positive favors higher numbers; negative penalizes.
                    </p>
                  </div>
                  <input
                    className="w-24 bg-gray-950 border border-gray-800 rounded px-2 py-1 text-right"
                    type="number"
                    step="0.1"
                    value={isNaN(val) ? 0 : val}
                    onChange={(e) => updateWeight(k, Number(e.target.value))}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Changes affect scores in <code>/api/scoring?mode=weekly</code> and <code>/api/scoring?mode=ros</code>.
      </div>
    </div>
  );
}
