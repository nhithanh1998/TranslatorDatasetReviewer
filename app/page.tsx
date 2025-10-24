"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState("");
  const [raw, setRaw] = useState("");
  const [polished, setPolished] = useState("");
  const [chunkSize, setChunkSize] = useState(5);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [accepted, setAccepted] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load datasets
  useEffect(() => {
    fetch("/api/list-datasets")
      .then((r) => r.json())
      .then((d) => setDatasets(d.datasets));
  }, []);

  // Load files when dataset selected
  useEffect(() => {
    if (selectedDataset) {
      fetch(`/api/list-files?dataset=${selectedDataset}`)
        .then((r) => r.json())
        .then((d) => setFiles(d.files));
    } else {
      setFiles([]);
      setCurrentFile("");
    }
  }, [selectedDataset]);

  // Load file content
  useEffect(() => {
    if (!currentFile || !selectedDataset) return;
    setLoading(true);
    Promise.all([
      fetch(
        `/api/read-file?dataset=${selectedDataset}&file=${currentFile}&type=raw`
      ).then((r) => r.json()),
      fetch(
        `/api/read-file?dataset=${selectedDataset}&file=${currentFile}&type=polished`
      ).then((r) => r.json()),
    ])
      .then(([rawRes, polRes]) => {
        setRaw(rawRes.text);
        setPolished(polRes.text);
        setChunkIndex(0);
      })
      .finally(() => setLoading(false));
  }, [currentFile]);

  // Split into chunks
  const splitChunks = (text: string) => {
    const lines = text.split(/\n+/).filter(Boolean);
    const chunks: string[][] = [];
    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const rawChunks = splitChunks(raw);
  const polishedChunks = splitChunks(polished);

  const currentRawChunk = rawChunks[chunkIndex]?.join("\n") || "";
  const currentPolishedChunk = polishedChunks[chunkIndex]?.join("\n") || "";

  const handleAccept = () => {
    setAccepted([
      ...accepted,
      { input: currentRawChunk, output: currentPolishedChunk },
    ]);
    setChunkIndex(chunkIndex + 1);
  };

  const handleSave = async () => {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset: selectedDataset, accepted }),
    });
    alert("💾 Đã lưu dataset reviewed!");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📘 Dataset Reviewer</h1>

      {/* --- Dataset + file selection --- */}
      <div className="flex gap-4 items-center">
        <select
          className="border p-2 rounded"
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
        >
          <option value="">-- Chọn dataset --</option>
          {datasets.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        {selectedDataset && (
          <select
            className="border p-2 rounded"
            value={currentFile}
            onChange={(e) => setCurrentFile(e.target.value)}
          >
            <option value="">-- Chọn chương --</option>
            {files.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        )}

        <label className="ml-4">Chunk size:</label>
        <input
          type="number"
          className="w-16 border p-1 rounded"
          min={1}
          max={20}
          value={chunkSize}
          onChange={(e) => setChunkSize(Number(e.target.value))}
        />
      </div>

      {/* --- Loading or no file selected --- */}
      {!selectedDataset ? (
        <p className="text-gray-500">
          👈 Hãy chọn một dataset để bắt đầu review.
        </p>
      ) : !currentFile ? (
        <p className="text-gray-500">
          📄 Hãy chọn một chương từ dataset “{selectedDataset}”.
        </p>
      ) : loading ? (
        <p className="text-gray-500">⏳ Đang tải nội dung...</p>
      ) : (
        <></>
      )}
      <>
        {/* --- Review panel --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2">📝 Origin</h2>
            <textarea
              value={currentRawChunk}
              onChange={(e) => setRaw(e.target.value)}
              className="w-full h-80 border rounded p-2"
            />
          </div>
          <div>
            <h2 className="font-semibold mb-2">✨ Enhanced</h2>
            <textarea
              value={currentPolishedChunk}
              onChange={(e) => setPolished(e.target.value)}
              className="w-full h-80 border rounded p-2"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            ✅ Accept
          </button>
          <button
            onClick={() => setChunkIndex(chunkIndex + 1)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            ⏭️ Skip
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            💾 Save
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Chunk {chunkIndex + 1}/{rawChunks.length} — Đã accept:{" "}
          {accepted.length}
        </p>
      </>
    </div>
  );
}
