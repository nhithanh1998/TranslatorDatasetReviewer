"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [raw, setRaw] = useState("");
  const [polished, setPolished] = useState("");
  const [accepted, setAccepted] = useState([]);

  async function save() {
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted }),
    });
    const data = await res.json();
    alert(data.message);
  }

  return (
    <main className="p-6 grid grid-cols-2 gap-4">
      <div>
        <h2>📝 Origin</h2>
        <textarea value={raw} onChange={(e) => setRaw(e.target.value)} className="w-full h-80 border p-2" />
      </div>
      <div>
        <h2>✨ Enhanced</h2>
        <textarea value={polished} onChange={(e) => setPolished(e.target.value)} className="w-full h-80 border p-2" />
      </div>
      <button onClick={save} className="col-span-2 bg-blue-500 text-white px-4 py-2 rounded">
        💾 Save Dataset
      </button>
    </main>
  );
}
