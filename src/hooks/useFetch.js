import { useState, useEffect } from "react";
import api from "../services/api";

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(options.params || {});

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(url, { params });
      setData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData, setParams };
}
