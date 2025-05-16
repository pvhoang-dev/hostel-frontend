import { useState } from "react";

const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc(...args);
      setData(result.data);
      return result;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred"
      );
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: error.response?.data?.data,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    error,
    loading,
    execute,
  };
};

export default useApi;
