"use client";
import React, { useEffect, useMemo, useState } from "react";

type Player = {
  id?: string;
  name: string;
  team: string;
  pos?: string;
  position?: string;
};

// ---------- MANUAL INPUT FIELDS (from your Google Sheet, auto fields removed) ----------
const QB_FIELDS = [
  "OppRank_vs_QB",
  "Opp_PressureRate_A",
  "Opp_ExplosivePass_A",
  "Recent3_FantasyAvg",
  "RushYds_perG",
  "PassAtt_perG",
  "DeepAtt_perG",
  "Top_PassCatchers_Active",
  "Available?",
  "Score",
  "Rank",
];

const RB_FIELDS = [
  "OppRank_vs_RB",
  "Opp_RunSuccess_A",
  "SnapShare%",
  "RushShare%",
  "Targets_perG",
  "RedZoneTouches",
  "GoalLineCarries",
  "ExplosiveRush%_Opp",
  "TwoMinRole",
  "ThirdDownRole",
  "YardsPerRouteRun",
  "RecentForm_RB",
  "Available?",
  "Score",
  "Rank",
];

const WR_FIELDS = [
  "OppRank_vs_WR",
  "Opp_ExplosivePass_A",
  "TargetShare%",
  "AirYards",
  "aDOT",
  "RedZoneTargets",
  "FirstReadShare",
  "YardsPerRouteRun",
  "RecentForm_WR",
  "Available?",
  "Score",
  "Rank",
];

const TE_FIELDS = [
  "OppRank_vs_TE",
  "Route%",
  "TargetShare%",
  "RedZoneTargets",
  "QB_Status",
  "YardsPerRouteRun",
  "Recent3_FantasyAvg",
  "Available?",
  "Score",
  "Rank",
];

// helper: field mapping
function getFieldsFor(pos?: string) {
  const p = (pos || "").toUpperCase();
  if (p === "QB") return QB_FIELDS;
  if (p === "RB") return RB_FIELDS;
  if (p === "WR") return WR_FIELDS;
  if (p === "TE") return TE_FIELDS;
  return [];
}

function isBoolean(label: string) {
  return /Available\?|QB_Status/i.test(label);
}
function isPercent(label: string) {
  return /%/.test(label);
}
function isText(label: string) {
  return /Top_PassCatchers_Active|QB_Status/.test(label);
}

export default function ManualDataEntry() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Player | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  // load players for search
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/scoring", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data?.data)) setPlayers(data.data);
      } catch (e) {
        console.error("Failed to load players", e);
      }
    })();
  }, []);

  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return players.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 15);
  }, [players, search]);

  const selectPlayer = (p: Player) => {
    setSelected({ ...p, pos: p.pos || p.position });
    setSearch("");
    setForm({});
    setStatus("");
  };

  const handleChange = (label: string, val: string) => {
    let v: any = val;
    if (isBoolean(label)) v = val === "true";
    else if (!isText(label)) {
      const n = Number(val);
      v = Number.isFinite(n) ? n : val;
    }
    setForm((f) => ({ ...f, [label]: v }));
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const body = {
        id: selected.id,
        name: selected.name,
        team: selected.team,
        pos: selected.pos,
        stats: form,
      };
      await fetch("/api/manual-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setStatus("✅ Saved successfully");
    } catch (e) {
      console.error(e);
      setStatus("❌ Save failed");
    } finally {
      setSaving(false);
    }
  };

  const fields = getFieldsFor(selected?.pos || selected?.position);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">🧠 Manual Stat Entry</h1>
          <p className="text-gray-400 text-sm">
            Enter weekly or ROS stats (Google Sheet manual fields only)
          </p>
        </div>
        <p className="text-sm text-gray-400">{status}</p>
      </header>

      {/* search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
        {search && results.length > 0 && (
          <ul className="absolute z-10 bg-gray-800 border border-gray-700 rounded mt-1 w-full max-h-64 overflow-y-auto">
            {results.map((r) => (
              <li
                key={r.id}
                onClick={() => selectPlayer(r)}
                className="p-2 hover:bg-blue-700 cursor-pointer"
              >
                {r.name} • {r.team} • {r.pos || r.position}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* entry form */}
      {selected && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{selected.name}</h2>
              <p className="text-gray-400 text-sm">
                {selected.team} • {(selected.pos || selected.position)?.toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setForm({});
              }}
              className="text-red-400 hover:text-red-500 text-sm"
            >
              ✖ Clear
            </button>
          </div>

          {fields.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {fields.map((label) => {
                if (isBoolean(label))
                  return (
                    <div key={label} className="flex flex-col">
                      <label className="text-xs text-gray-400 mb-1">{label}</label>
                      <select
                        value={
                          form[label] === true
                            ? "true"
                            : form[label] === false
                            ? "false"
                            : ""
                        }
                        onChange={(e) => handleChange(label, e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100"
                      >
                        <option value="">—</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                  );

                if (isText(label))
                  return (
                    <div key={label} className="flex flex-col">
                      <label className="text-xs text-gray-400 mb-1">{label}</label>
                      <input
                        type="text"
                        value={form[label] ?? ""}
                        onChange={(e) => handleChange(label, e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100"
                      />
                    </div>
                  );

                return (
                  <div key={label} className="flex flex-col">
                    <label className="text-xs text-gray-400 mb-1">{label}</label>
                    <input
                      type="number"
                      step="any"
                      value={form[label] ?? ""}
                      onChange={(e) => handleChange(label, e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              No manual fields for this position.
            </p>
          )}

          <button
            onClick={save}
            disabled={saving}
            className={`mt-3 px-4 py-2 rounded text-white ${
              saving ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "💾 Save Stats"}
          </button>
        </div>
      )}
    </div>
  );
}
