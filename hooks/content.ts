import { useState, useEffect } from "react";

export function useFileContent(selectedDataset?: string, selectedFile?: string) {
  const [pairs, setPairs] = useState<{ raw: string; enhanced: string; reviewed: boolean }[]>([]);
  const [pastReview, setPastReview] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!selectedDataset || !selectedFile) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/read-file?dataset=${selectedDataset}&type=raw&file=${selectedFile}`).then(r => r.text()),
      fetch(`/api/read-file?dataset=${selectedDataset}&type=polished&file=${selectedFile}`).then(r => r.text()),
      fetch(`/api/get-state?dataset=${selectedDataset}&file=${selectedFile}`).then(r => r.json()),
    ])
      .then(([raw, pol, reviewedIndexes]) => {
        const rawLines = raw.split(/\r?\n/).filter(line => line.trim() !== "");
        const polLines = pol.split(/\r?\n/).filter(line => line.trim() !== "");
        const max = Math.max(rawLines.length, polLines.length);

        const merged = Array.from({ length: max }, (_, i) => ({
          raw: rawLines[i] ?? "",
          enhanced: polLines[i] ?? "",
          reviewed: reviewedIndexes.includes(i),
        }));

        setPairs(merged);
        setPastReview(reviewedIndexes);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [selectedDataset, selectedFile]);

  return { pairs, pastReview, loading, error };
}
