import { useCallback, useEffect, useState } from 'react';
import { Order } from '../types';
import { storeOrdersApi, toApiError } from '../services/api';

interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeOrdersApi.getAll();
      setOrders(data);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { orders, loading, error, reload: load };
}

interface UseOrderResult {
  order: Order | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  reload: () => void;
}

export function useOrder(uuid: string | undefined): UseOrderResult {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!uuid) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await storeOrdersApi.getByUuid(uuid);
      setOrder(data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(toApiError(err).message);
      }
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    load();
  }, [load]);

  return { order, loading, error, notFound, reload: load };
}
