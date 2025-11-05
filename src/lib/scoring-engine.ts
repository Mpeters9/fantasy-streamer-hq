// src/lib/scoring-engine.ts
export interface PlayerStats {
  position: string;
  fantasyPointsLast3: number;
  targetShare?: number;
  snapShare?: number;
  yardsPerRouteRun?: number;
  passAttempts?: number;
  rushShare?: number;
  oppRank?: number;
  totalPoints?: number;
  consistency?: number;
}

export interface ScoreOutput {
  streamerScore: number;
  rosScore: number;
  tierStreamer: string;
  tierROS: string;
  colorStreamer: string;
  colorROS: string;
}

export function calculateScores(s: PlayerStats): ScoreOutput {
  const fp = s.fantasyPointsLast3 || 0;
  const tgt = s.targetShare || 0;
  const snap = s.snapShare || 0;
  const yprr = s.yardsPerRouteRun || 0;
  const passAtt = s.passAttempts || 0;
  const rushShare = s.rushShare || 0;
  const opp = s.oppRank ?? 16;
  const total = s.totalPoints ?? 45;
  const cons = s.consistency ?? 10;

  const diff = 100 - opp;
  const gameEnv = total >= 50 ? 1.1 : total <= 40 ? 0.9 : 1;

  // ⚡ Streamer (next-week)
  const streamerScore =
    fp * 0.35 +
    snap * 0.2 +
    tgt * 0.15 +
    yprr * 0.15 +
    diff * 0.1 +
    gameEnv * 5;

  // 📈 ROS (trend)
  const rosScore =
    fp * 0.4 +
    snap * 0.2 +
    tgt * 0.15 +
    yprr * 0.15 +
    (100 - cons) * 0.1;

  const tierStreamer = getTier(streamerScore);
  const tierROS = getTier(rosScore);
  const colorStreamer = getColor(streamerScore);
  const colorROS = getColor(rosScore);

  return { streamerScore, rosScore, tierStreamer, tierROS, colorStreamer, colorROS };
}

function getTier(v: number) {
  if (v >= 90) return "🔥 S";
  if (v >= 75) return "✅ A";
  if (v >= 60) return "⚙️ B";
  if (v >= 45) return "⚠️ C";
  return "🚫 D";
}

function getColor(v: number) {
  if (v >= 90) return "bg-gradient-to-r from-cyan-400 to-green-400";
  if (v >= 75) return "bg-gradient-to-r from-blue-400 to-purple-500";
  if (v >= 60) return "bg-gradient-to-r from-amber-400 to-orange-500";
  if (v >= 45) return "bg-gradient-to-r from-red-400 to-pink-500";
  return "bg-gray-600";
}
