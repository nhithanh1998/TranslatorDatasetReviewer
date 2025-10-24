"use client";

import { useState, useEffect } from "react";

export default function ReviewPage() {
  const [chunkIndex, setChunkIndex] = useState(0);
  const [chunkSize, setChunkSize] = useState(5);

  const [datasets, setDatasets] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  const [selectedDataset, setSelectedDataset] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  const [pairs, setPairs] = useState<
    { raw: string; enhanced: string; reviewed: boolean }[]
  >([]);
  const [pastReview, setPastReview] = useState<number[]>([]);

  // 🔹 Load dataset folders
  useEffect(() => {
    fetch("/api/list-datasets")
      .then((res) => res.json())
      .then(setDatasets)
      .catch(console.error);
  }, []);

  // 🔹 Load files in selected dataset
  useEffect(() => {
    if (!selectedDataset) return;
    fetch(`/api/list-files?dataset=${selectedDataset}`)
      .then((res) => res.json())
      .then(setFiles)
      .catch(console.error);
  }, [selectedDataset]);

  // 🔹 Load file content + reviewed state
  useEffect(() => {
    if (!selectedDataset || !selectedFile) return;

    Promise.all([
      fetch(
        `/api/read-file?dataset=${selectedDataset}&type=raw&file=${selectedFile}`
      ).then((r) => r.text()),
      fetch(
        `/api/read-file?dataset=${selectedDataset}&type=polished&file=${selectedFile}`
      ).then((r) => r.text()),
      fetch(
        `/api/get-state?dataset=${selectedDataset}&file=${selectedFile}`
      ).then((r) => r.json()),
    ])
      .then(([raw, pol, reviewedIndexes]) => {
        const rawLines = raw
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");
        const polLines = pol
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");
        const max = Math.max(rawLines.length, polLines.length);

        const merged = Array.from({ length: max }, (_, i) => ({
          raw: rawLines[i] ?? "",
          enhanced: polLines[i] ?? "",
          reviewed: reviewedIndexes.includes(i),
        }));
        setPastReview(reviewedIndexes);
        setPairs(merged);
        setChunkIndex(0);
      })
      .catch(console.error);
  }, [selectedDataset, selectedFile]);

  const removeLine = (idx: number) => {
    setPairs((prev) => prev.filter((_, i) => i !== idx));
  };

  // 🔹 Pagination logic
  const start = chunkIndex * chunkSize;
  const end = start + chunkSize;
  const currentPairs = pairs.slice(start, end);
  const totalChunks = Math.ceil(pairs.length / chunkSize);

  const toggleReviewed = (globalIdx: number) => {
    setPairs((prev) =>
      prev.map((p, i) => (i === globalIdx ? { ...p, reviewed: true } : p))
    );
  };

  const saveCurrentBatch = async () => {
    const reviewedIndexes = pairs
      .map((p, i) => (p.reviewed ? i : null))
      .filter((v) => v !== null);

    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataset: selectedDataset,
        file: selectedFile,
        pairs: currentPairs,
        reviewed: reviewedIndexes,
      }),
    });

    if (res.status === 200) {
      alert("✅ Đã lưu thành công!");
    } else {
      alert("❌ Lỗi khi lưu!");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📝 Dataset Review Tool</h1>

      {/* Dataset + File selection */}
      <div className="flex gap-4">
        <select
          className="border rounded p-2 flex-1"
          value={selectedDataset}
          onChange={(e) => {
            setSelectedDataset(e.target.value);
            setSelectedFile("");
            setPairs([]);
          }}
        >
          <option value="">-- Chọn Dataset --</option>
          {datasets.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          className="border rounded p-2 flex-1"
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
        >
          <option value="">-- Chọn File --</option>
          {files.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border rounded p-2 w-24"
          min={1}
          max={50}
          value={chunkSize}
          onChange={(e) => setChunkSize(parseInt(e.target.value) || 1)}
          title="Số dòng mỗi lần review"
        />
      </div>

      {/* Review Section */}
      {selectedFile && (
        <div>
          <div className="grid grid-cols-2 font-semibold mb-2 gap-6">
            <div className="font-bold text-xl">Origin</div>
            <div className="font-bold text-xl">Enhanced</div>
          </div>

          <div className="space-y-2">
            {currentPairs.map((pair, i) => {
              const globalIdx = start + i;
              if (pastReview.includes(globalIdx)) return null; // ẩn dòng đã review
              return (
                <div
                  key={globalIdx}
                  className="grid grid-cols-2 gap-6 items-start relative rounded-lg bg-white"
                >
                  <textarea
                    className="border rounded px-2 py-3 w-full"
                    value={pair.raw}
                    onChange={(e) => {
                      const updated = [...pairs];
                      updated[globalIdx].raw = e.target.value;
                      setPairs(updated);
                    }}
                  />
                  <textarea
                    className="border rounded px-2 py-3 w-full"
                    value={pair.enhanced}
                    onChange={(e) => {
                      const updated = [...pairs];
                      updated[globalIdx].enhanced = e.target.value;
                      setPairs(updated);
                    }}
                  />
                  <button
                    onClick={() => toggleReviewed(globalIdx)}
                    className={`absolute top-1/2 -translate-y-1/2 px-2 py-1 rounded text-white shadow ${
                      pair.reviewed
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 hover:bg-gray-500"
                    }`}
                    title="Đánh dấu đã duyệt"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => removeLine(globalIdx)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 shadow"
                    title="Xóa dòng này"
                  >
                    ✖
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination + Save */}
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={chunkIndex === 0}
              onClick={() => setChunkIndex((i) => Math.max(0, i - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ⬅ Trước
            </button>

            <div className="flex items-center gap-4">
              <span>
                Trang {chunkIndex + 1}/{totalChunks}
              </span>
              {currentPairs.length > 0 && (
                <button
                  onClick={saveCurrentBatch}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  💾 Lưu batch này
                </button>
              )}
            </div>

            <button
              disabled={chunkIndex >= totalChunks - 1}
              onClick={() =>
                setChunkIndex((i) => Math.min(totalChunks - 1, i + 1))
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Tiếp ➡
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
