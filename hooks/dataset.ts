import { useState, useEffect } from "react";

export function useDatasets() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("/api/list-datasets")
      .then(res => res.json())
      .then(data => setDatasets(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { datasets, loading, error };
}
