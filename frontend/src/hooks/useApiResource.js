import { useCallback, useEffect, useState } from "react";
import { isApiConfigured } from "@/api/careconnect";

/**
 * Loads one CareConnect API resource.
 * When the API base URL is not configured the hook stays idle — the UI then
 * renders an explicit "not connected" panel instead of inventing data.
 */
export default function useApiResource(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isApiConfigured());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    if (!isApiConfigured()) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, error, loading, configured: isApiConfigured(), refresh: run };
}