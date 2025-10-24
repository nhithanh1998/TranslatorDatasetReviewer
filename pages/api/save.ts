import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { accepted } = req.body;
  if (!accepted || !Array.isArray(accepted)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const outputPath = path.join(process.cwd(), "datasets", "reviewed_dataset.txt");
  const content = accepted
    .map((s) => `${s.input}\n[end]\n${s.output}\n`)
    .join("\n");

  fs.writeFileSync(outputPath, content, "utf-8");
  return res.status(200).json({ success: true, message: "Saved successfully!" });
}
