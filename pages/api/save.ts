import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { dataset, file, pairs, reviewed } = req.body;
    if (!dataset || !file || !pairs) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin dataset, file hoặc pairs" });
    }

    const datasetDir = path.join(process.cwd(), "datasets", dataset);

    // 🔹 Ghi lại file raw
    const rawPath = path.join(datasetDir, "raw", file);
    const enhancedPath = path.join(datasetDir, "polished", file);

    const rawText = pairs.map((p: any) => p.raw.trim()).join("\n");
    const enhancedText = pairs.map((p: any) => p.enhanced.trim()).join("\n");

    await fs.mkdir(path.dirname(rawPath), { recursive: true });
    await fs.mkdir(path.dirname(enhancedPath), { recursive: true });

    await fs.writeFile(rawPath, rawText, "utf-8");
    await fs.writeFile(enhancedPath, enhancedText, "utf-8");

    return res.json({ success: true });
  } catch (err: any) {
    console.error("❌ Lỗi khi lưu file:", err);
    return res
      .status(500)
      .json({ error: "Lỗi khi lưu file", details: err.message });
  }
}
