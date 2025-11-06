import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WAIVER_FILE = path.join(process.cwd(), "tmp", "waiver-last.json");

export async function GET() {
  try {
    if (!fs.existsSync(WAIVER_FILE)) {
      return NextResponse.json({ status: "error", message: "No waiver data found." });
    }
    const data = JSON.parse(fs.readFileSync(WAIVER_FILE, "utf-8"));
    const csv = [
      "Rank,Player,Team,Pos,FP_Last3,Snap%,Target%,Spread,Weather,Score",
      ...data.map(
        (p: any, i: number) =>
          `${i + 1},"${p.name}",${p.team},${p.position},${p.fpLast3},${p.snap},${p.target},${p.spread},${p.weather},${p.score}`
      ),
    ].join("\n");

    const res = new NextResponse(csv);
    res.headers.set("Content-Type", "text/csv");
    res.headers.set("Content-Disposition", `attachment; filename="waiver-rankings-week.csv"`);
    return res;
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}
