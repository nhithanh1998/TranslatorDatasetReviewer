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

    const repoRoot = process.env.REPO_ROOT!;
    const outputDir = path.join(repoRoot, "out", dataset);
    const outputFile = path.join(outputDir, "sample_1.jsonl");

    // ✅ Tạo thư mục nếu chưa có
    await fs.mkdir(outputDir, { recursive: true });
    const reviewedDir = path.join(repoRoot, "tracking-process", dataset);

    // ✅ Ghi dữ liệu dạng JSON Lines
    const jsonlContent = pairs
      .map((item: any) => JSON.stringify(item))
      .join("\n");

    await fs.writeFile(outputFile, jsonlContent, "utf-8");

    const reviewedFile = path.join(reviewedDir, `${file}`);
    await fs.mkdir(reviewedDir, { recursive: true });

    // Append reviewed mới
    await fs.writeFile(reviewedFile, JSON.stringify(reviewed, null), "utf-8");

    return res.status(200).send("Save success!");
  } catch (err: any) {
    console.error("❌ Lỗi khi lưu file:", err);
    return res
      .status(500)
      .json({ error: "Lỗi khi lưu file", details: err.message });
  }
}
