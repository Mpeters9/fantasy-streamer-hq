// src/lib/constants.ts

// Normalization helpers
export const TEAM_ABBR_NORMALIZE: Record<string, string> = {
  "49ERS": "SF", "SAN FRANCISCO 49ERS": "SF",
  "BEARS": "CHI", "CHICAGO BEARS": "CHI",
  "BENGALS": "CIN", "CINCINNATI BENGALS": "CIN",
  "BILLS": "BUF", "BUFFALO BILLS": "BUF",
  "BRONCOS": "DEN", "DENVER BRONCOS": "DEN",
  "BROWNS": "CLE", "CLEVELAND BROWNS": "CLE",
  "BUCCANEERS": "TB", "TAMPA BAY BUCCANEERS": "TB",
  "CARDINALS": "ARI", "ARIZONA CARDINALS": "ARI",
  "CHARGERS": "LAC", "LOS ANGELES CHARGERS": "LAC",
  "CHIEFS": "KC", "KANSAS CITY CHIEFS": "KC",
  "COLTS": "IND", "INDIANAPOLIS COLTS": "IND",
  "COMMANDERS": "WSH", "WASHINGTON COMMANDERS": "WSH", "WASHINGTON": "WSH",
  "COWBOYS": "DAL", "DALLAS COWBOYS": "DAL",
  "DOLPHINS": "MIA", "MIAMI DOLPHINS": "MIA",
  "EAGLES": "PHI", "PHILADELPHIA EAGLES": "PHI",
  "FALCONS": "ATL", "ATLANTA FALCONS": "ATL",
  "GIANTS": "NYG", "NEW YORK GIANTS": "NYG",
  "JAGUARS": "JAX", "JACKSONVILLE JAGUARS": "JAX",
  "JETS": "NYJ", "NEW YORK JETS": "NYJ",
  "LIONS": "DET", "DETROIT LIONS": "DET",
  "PACKERS": "GB", "GREEN BAY PACKERS": "GB",
  "PANTHERS": "CAR", "CAROLINA PANTHERS": "CAR",
  "PATRIOTS": "NE", "NEW ENGLAND PATRIOTS": "NE",
  "RAIDERS": "LV", "LAS VEGAS RAIDERS": "LV",
  "RAMS": "LAR", "LOS ANGELES RAMS": "LAR",
  "RAVENS": "BAL", "BALTIMORE RAVENS": "BAL",
  "SAINTS": "NO", "NEW ORLEANS SAINTS": "NO",
  "SEAHAWKS": "SEA", "SEATTLE SEAHAWKS": "SEA",
  "STEELERS": "PIT", "PITTSBURGH STEELERS": "PIT",
  "TEXANS": "HOU", "HOUSTON TEXANS": "HOU",
  "TITANS": "TEN", "TENNESSEE TITANS": "TEN",
  "VIKINGS": "MIN", "MINNESOTA VIKINGS": "MIN",
};

// A simple dome indicator by home team abbreviation.
// This covers current domes/retractables used as domes on game day.
// (We still compute isDome via ESPN venue when present; this is fallback.)
export const DOME_TEAMS = new Set<string>([
  "ATL", // Mercedes-Benz Stadium (retractable)
  "ARI", // State Farm Stadium (retractable)
  "DAL", // AT&T Stadium (retractable)
  "DET", // Ford Field
  "HOU", // NRG Stadium (retractable)
  "IND", // Lucas Oil (retractable)
  "LA", "LAR", // SoFi (retractable) - use LAR
  "MIN", // U.S. Bank
  "NO",  // Caesars Superdome
  "LV"   // Allegiant
]);

export function normAbbr(s: string): string {
  const k = s.trim().toUpperCase();
  return TEAM_ABBR_NORMALIZE[k] ?? k;
}

export function namesMatch(teamNameOrAbbr: string, targetAbbr: string) {
  return normAbbr(teamNameOrAbbr) === normAbbr(targetAbbr);
}
