import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { dataset } = req.query;
  if (!dataset) return res.status(400).json({ error: "Missing dataset param" });

  const rawDir = path.join(process.cwd(), "datasets", dataset.toString(), "raw");
  const polishedDir = path.join(process.cwd(), "datasets", dataset.toString(), "polished");

  if (!fs.existsSync(rawDir) || !fs.existsSync(polishedDir)) {
    return res.status(404).json({ error: "raw or polished folder not found" });
  }

  const files = fs
    .readdirSync(rawDir)
    .filter((f) => fs.existsSync(path.join(polishedDir, f)) && f.endsWith(".txt"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return res.status(200).json(files);
}
