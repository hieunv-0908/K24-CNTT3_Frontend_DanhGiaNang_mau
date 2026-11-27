import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import api from '../api/axiosClient.js';

export default function useProductSearch(params) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const cleanParams = {
          page: params.page || 1,
          limit: params.limit || 10,
        };
        if (params.q !== undefined && params.q !== null && params.q.trim() !== '') {
          cleanParams.q = params.q.trim();
        }
        if (params.category) {
          cleanParams.category = params.category;
        }
        if (params.status) {
          cleanParams.status = params.status;
        }

        const res = await api.get('/products', {
          params: cleanParams,
          signal: controller.signal,
        });

        setData(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          // Request đã bị huỷ bởi AbortController, bỏ qua
          return;
        }
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [params.q, params.category, params.status, params.page, params.limit, reloadTrigger]);

  return { data, total, loading, error, refetch };
}
