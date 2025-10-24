import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dataset, file, reviewedIndexes } = body;

    if (!dataset || !file)
      return NextResponse.json({ error: "Missing dataset or file" }, { status: 400 });

    const stateDir = path.join(process.cwd(), "datasets", dataset);
    const statePath = path.join(stateDir, "reviewed_state.json");

    let current = {};
    try {
      const existing = await fs.readFile(statePath, "utf8");
      current = JSON.parse(existing);
    } catch {
      current = {};
    }

    // Cập nhật hoặc thêm mới
    current[file] = reviewedIndexes;

    await fs.writeFile(statePath, JSON.stringify(current, null, 2), "utf8");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
