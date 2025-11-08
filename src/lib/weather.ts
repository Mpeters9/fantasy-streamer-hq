import { STADIUMS } from "./stadiums";
import { setCache, getCache } from "./cache";

/** Uses Open-Meteo (no key). */
export async function getWeatherForTeam(team: string, isoKickoff: string): Promise<string> {
  const st = STADIUMS[team];
  if (!st) return "n/a";
  if (st.indoor) return "indoors";

  const cacheKey = `wx_${team}_${isoKickoff.slice(0,10)}`;
  const c = getCache<string>(cacheKey);
  if (c) return c;

  try {
    const date = isoKickoff.slice(0,10);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${st.lat}&longitude=${st.lon}&hourly=temperature_2m,precipitation,wind_speed_10m&start_date=${date}&end_date=${date}`;
    const res = await fetch(url, { cache: "force-cache" });
    const data = await res.json();
    const idx = 16; // approx 4pm local
    const t = data.hourly?.temperature_2m?.[idx];
    const w = data.hourly?.wind_speed_10m?.[idx];
    const p = data.hourly?.precipitation?.[idx];
    const out = `${t ?? "?"}°C, wind ${w ?? "?"} km/h, precip ${p ?? "?"} mm`;
    setCache(cacheKey, out, 3*60*60*1000);
    return out;
  } catch {
    return "n/a";
  }
}
