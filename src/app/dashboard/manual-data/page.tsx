// src/app/dashboard/manual-data/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PlayerSummary } from "@/lib/players";

type Mode = "weekly" | "ros";

type ManualStatRow = {
  id: string;      // player_id (Sleeper)
  name: string;
  team: string;
  pos: string;
  week: number;
  mode: Mode;     // "weekly" (this week) vs "ros" (rest of season)

  // QB
  qb_epa_per_play?: number;
  qb_cpoe?: number;
  qb_air_yds_per_att?: number;
  qb_scramble_yards?: number;
  qb_redzone_dropbacks?: number;

  // RB
  rb_rush_share?: number;
  rb_target_share?: number;
  rb_ypa?: number;
  rb_yprr?: number;
  rb_redzone_touches?: number;

  // WR / TE
  rec_target_share?: number;
  rec_air_yds_share?: number;
  rec_yprr?: number;
  rec_slot_rate?: number;
  rec_redzone_tgts?: number;

  // K
  k_fg_att?: number;
  k_fg_made?: number;
  k_50_plus_att?: number;
  k_xp_att?: number;

  // DEF
  def_pressure_rate?: number;
  def_turnover_rate?: number;
  def_pts_allowed?: number;
};

type StatsResponse = {
  status: "success" | "error";
  message?: string;
  week?: number;
  data?: ManualStatRow[];
};

type WeekResponse = {
  status: "success" | "error";
  week?: number;
};

export default function ManualDataPage() {
  const [week, setWeek] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("weekly");
  const [allPlayers, setAllPlayers] = useState<PlayerSummary[]>([]);
  const [stats, setStats] = useState<ManualStatRow[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("Loading…");

  // ---- Load week + players + existing stats ----
  useEffect(() => {
    const init = async () => {
      try {
        setStatus("Loading week…");
        const weekRes = await fetch("/api/cron/week");
        const weekJson: WeekResponse = await weekRes.json();
        const currentWeek = weekJson.week ?? 1;
        setWeek(currentWeek);

        setStatus("Loading player pool…");
        const playersRes = await fetch("/api/cron/players");
        const playersJson = await playersRes.json();
        const players = Array.isArray(playersJson) ? playersJson : [];
        setAllPlayers(players);

        setStatus("Loading saved manual stats…");
        const statsRes = await fetch("/api/manual-stats");
        const statsJson: StatsResponse = await statsRes.json();
        if (statsJson.status === "success" && Array.isArray(statsJson.data)) {
          setStats(statsJson.data);
          setStatus("✅ Loaded manual stats");
        } else {
          setStats([]);
          setStatus("No saved stats yet – start adding players below.");
        }
      } catch (err) {
        console.error("Failed to init manual-data:", err);
        setStatus("❌ Failed to load data");
      }
    };

    init();
  }, []);

  // ---- Derived: filtered stats + player search ----

  const filteredStats = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = stats;

    if (mode) {
      base = base.filter((row) => row.mode === mode);
    }

    if (!q) return base;

    return base.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.team.toLowerCase().includes(q) ||
        row.pos.toLowerCase().includes(q)
    );
  }, [stats, search, mode]);

  // For the "Add Player" dropdown
  const selectablePlayers = useMemo(() => {
    const takenIds = new Set(stats.map((s) => s.id));
    return allPlayers.filter((p) => !takenIds.has(p.id));
  }, [allPlayers, stats]);

  // ---- Handlers ----

  const addPlayer = (playerId: string) => {
    if (!week) return;
    const p = allPlayers.find((pl) => pl.id === playerId);
    if (!p) return;

    setStats((prev) => [
      ...prev,
      {
        id: p.id,
        name: p.name,
        team: p.team,
        pos: p.pos,
        week,
        mode,
      },
    ]);
  };

  const removeRow = (playerId: string, rowMode: Mode) => {
    setStats((prev) =>
      prev.filter((row) => !(row.id === playerId && row.mode === rowMode))
    );
  };

  const updateField = (
    playerId: string,
    rowMode: Mode,
    key: keyof ManualStatRow,
    value: number | undefined
  ) => {
    setStats((prev) =>
      prev.map((row) => {
        if (row.id === playerId && row.mode === rowMode) {
          return { ...row, [key]: value };
        }
        return row;
      })
    );
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      setStatus("Saving manual stats…");

      const res = await fetch("/api/manual-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: stats }),
      });

      const json: StatsResponse = await res.json();

      if (!res.ok || json.status === "error") {
        throw new Error(json.message || "Save failed");
      }

      setStatus("✅ Manual stats saved");
    } catch (err) {
      console.error("Save error:", err);
      setStatus("❌ Failed to save manual stats");
    } finally {
      setSaving(false);
    }
  };

  // ---- Per-position field config ----

  type FieldDef = {
    key: keyof ManualStatRow;
    label: string;
    hint?: string;
  };

  const getFieldsForPos = (pos: string): FieldDef[] => {
    const p = pos.toUpperCase();

    if (p === "QB") {
      return [
        {
          key: "qb_epa_per_play",
          label: "EPA / Play (last 3)",
          hint: "Expected points added per play, last 3 games.",
        },
        {
          key: "qb_cpoe",
          label: "CPOE (last 3)",
          hint: "Completion % over expected.",
        },
        {
          key: "qb_air_yds_per_att",
          label: "Air Yards / Att",
          hint: "Average air yards per attempt.",
        },
        {
          key: "qb_scramble_yards",
          label: "Scramble Rush Yds",
          hint: "Rushing yards on scrambles (not designed runs).",
        },
        {
          key: "qb_redzone_dropbacks",
          label: "RZ Dropbacks",
          hint: "Total red zone dropbacks last 3.",
        },
      ];
    }

    if (p === "RB") {
      return [
        {
          key: "rb_rush_share",
          label: "Rush Share %",
          hint: "Team rushing attempts share.",
        },
        {
          key: "rb_target_share",
          label: "Target Share %",
          hint: "Team target share.",
        },
        {
          key: "rb_ypa",
          label: "Yards / Carry",
          hint: "Rushing yards per attempt.",
        },
        {
          key: "rb_yprr",
          label: "Yards / Route Run",
          hint: "Receiving efficiency.",
        },
        {
          key: "rb_redzone_touches",
          label: "RZ Touches",
          hint: "Carries + targets inside the red zone.",
        },
      ];
    }

    if (p === "WR" || p === "TE") {
      return [
        {
          key: "rec_target_share",
          label: "Target Share %",
          hint: "Team target share.",
        },
        {
          key: "rec_air_yds_share",
          label: "Air Yards Share %",
          hint: "Team air yards share.",
        },
        {
          key: "rec_yprr",
          label: "Yards / Route Run",
          hint: "Receiving efficiency.",
        },
        {
          key: "rec_slot_rate",
          label: "Slot Rate %",
          hint: "Share of routes from slot (if applicable).",
        },
        {
          key: "rec_redzone_tgts",
          label: "RZ Targets",
          hint: "Red zone targets last 3.",
        },
      ];
    }

    if (p === "K") {
      return [
        {
          key: "k_fg_att",
          label: "FG Att",
          hint: "Field goal attempts last 3.",
        },
        {
          key: "k_fg_made",
          label: "FG Made",
          hint: "Field goals made last 3.",
        },
        {
          key: "k_50_plus_att",
          label: "50+ Att",
          hint: "FG attempts from 50+ yards.",
        },
        {
          key: "k_xp_att",
          label: "XP Att",
          hint: "Extra point attempts.",
        },
      ];
    }

    if (p === "DEF" || p === "D/ST" || p === "DST") {
      return [
        {
          key: "def_pressure_rate",
          label: "Pressure Rate %",
          hint: "QB pressure rate last 3.",
        },
        {
          key: "def_turnover_rate",
          label: "Turnover Rate %",
          hint: "Takeaways per opponent dropback.",
        },
        {
          key: "def_pts_allowed",
          label: "Pts Allowed / G",
          hint: "Points allowed per game (last 3).",
        },
      ];
    }

    // fallback – should basically never be used
    return [];
  };

  // ---- Render ----

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            ✏️ Manual Predictive Stats
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Week {week ?? "-"} • Mode:{" "}
            <span className="font-semibold uppercase">{mode}</span> • {status}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
          >
            <option value="weekly">Weekly (this week’s matchup)</option>
            <option value="ros">Rest of Season</option>
          </select>
          <button
            onClick={saveAll}
            disabled={saving}
            className={`px-4 py-2 rounded text-sm font-medium shadow ${
              saving
                ? "bg-slate-600 cursor-wait"
                : "bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
            }`}
          >
            {saving ? "💾 Saving…" : "💾 Save All"}
          </button>
        </div>
      </header>

      {/* Add Player row */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">Add player to this mode</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search players by name, team, or position…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            onChange={(e) => {
              if (e.target.value) {
                addPlayer(e.target.value);
                e.target.value = "";
              }
            }}
            className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">+ Add Player…</option>
            {selectablePlayers.map((p) => (
              <option key={`${p.id}-${p.pos}-${p.team}`} value={p.id}>
                {p.name} • {p.team} • {p.pos}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500">
          Players already in this mode ({mode.toUpperCase()}) won’t show in the
          dropdown.
        </p>
      </section>

      {/* Stats grid */}
      <section className="space-y-4">
        {filteredStats.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No manual stats yet for this mode. Add a player above to begin.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredStats.map((row) => {
              const fields = getFieldsForPos(row.pos);
              return (
                <div
                  key={`${row.id}-${row.mode}`}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {row.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {row.team} • {row.pos} •{" "}
                        <span className="uppercase">{row.mode}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeRow(row.id, row.mode)}
                      className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-red-600 hover:text-white"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  {fields.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No configured fields for position <b>{row.pos}</b>.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {fields.map((field) => (
                        <label
                          key={field.key}
                          className="flex flex-col text-xs gap-1"
                        >
                          <span className="text-slate-300">
                            {field.label}
                            {field.hint && (
                              <span className="text-slate-500">
                                {" "}
                                – {field.hint}
                              </span>
                            )}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={
                              row[field.key] !== undefined
                                ? Number(row[field.key])
                                : ""
                            }
                            onChange={(e) => {
                              const v = e.target.value.trim();
                              updateField(
                                row.id,
                                row.mode,
                                field.key,
                                v === "" ? undefined : Number(v)
                              );
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
