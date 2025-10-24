import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { dataset, file } = req.query;

  if (!dataset || !file) {
    return res.status(400).json({ error: "Missing params" });
  }

  const statePath = path.join(
    process.cwd(),
    "datasets",
    dataset.toString(),
    "reviewed_state.json"
  );

  try {
    if (!fs.existsSync(statePath)) {
      // chưa có file state -> chưa review gì
      return res.status(200).json([]);
    }

    const data = fs.readFileSync(statePath, "utf8");
    const parsed = JSON.parse(data);

    // Nếu file đã có review -> trả về danh sách dòng đã review
    return res.status(200).json(parsed[file.toString()] || []);
  } catch (err) {
    console.error("Error reading state:", err);
    return res.status(500).json({ error: "Failed to read state" });
  }
}
