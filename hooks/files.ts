import { useState, useEffect } from "react";

export function useFiles(dataset?: string) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!dataset) return;
    setLoading(true);
    fetch(`/api/list-files?dataset=${dataset}`)
      .then(res => res.json())
      .then(data => setFiles(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [dataset]);

  return { files, loading, error };
}
