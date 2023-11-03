import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";

export async function GET(request: NextRequest) {
  try {
    const file = await fs.readFile(
      process.cwd() + "/node_modules/world-atlas/countries-50m.json",
      "utf8"
    );
    const json = JSON.parse(file);
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: "failed to load data" }, { status: 500 });
  }
  return;
}
