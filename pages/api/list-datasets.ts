import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const datasetsDir = path.join(process.cwd(), "datasets");

  if (!fs.existsSync(datasetsDir)) {
    return res.status(404).json({ error: "datasets directory not found" });
  }

  const dirs = fs
    .readdirSync(datasetsDir)
    .filter((f) => fs.statSync(path.join(datasetsDir, f)).isDirectory());

  return res.status(200).json(dirs);
}
