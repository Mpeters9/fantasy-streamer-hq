import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadJSON<T = any>(file: string, fallback: T): T {
  try {
    ensureDir();
    const full = path.join(DATA_DIR, file);
    if (!fs.existsSync(full)) return fallback;
    const raw = fs.readFileSync(full, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(file: string, data: any) {
  ensureDir();
  const full = path.join(DATA_DIR, file);
  fs.writeFileSync(full, JSON.stringify(data, null, 2), "utf-8");
}
