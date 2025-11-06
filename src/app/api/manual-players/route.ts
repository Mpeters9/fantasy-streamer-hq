import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "tmp", "manual-players.json");

export async function GET() {
  const data = fs.existsSync(FILE_PATH)
    ? JSON.parse(fs.readFileSync(FILE_PATH, "utf8"))
    : [];
  return NextResponse.json({ status: "success", data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const existing = fs.existsSync(FILE_PATH)
    ? JSON.parse(fs.readFileSync(FILE_PATH, "utf8"))
    : [];
  const newList = [...existing.filter((p: any) => p.id !== body.id), body];
  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(newList, null, 2));
  return NextResponse.json({ status: "success", data: newList });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const existing = fs.existsSync(FILE_PATH)
    ? JSON.parse(fs.readFileSync(FILE_PATH, "utf8"))
    : [];
  const newList = existing.filter((p: any) => p.id !== body.id);
  fs.writeFileSync(FILE_PATH, JSON.stringify(newList, null, 2));
  return NextResponse.json({ status: "success", data: newList });
}
