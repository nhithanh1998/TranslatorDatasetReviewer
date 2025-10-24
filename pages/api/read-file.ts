import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { dataset, file, type } = req.query;
  if (!dataset || !file || !type)
    return res.status(400).json({ error: "Missing params" });

  const filePath = path.join(
    process.cwd(),
    "datasets",
    dataset.toString(),
    type.toString(),
    file.toString()
  );
  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "File not found" });

  const text = fs.readFileSync(filePath, "utf-8");
  return res.status(200).send(text);
}
