import { useCallback, useEffect, useState } from 'react';
import { CatalogBox, CatalogRoll } from '../types';
import { storeCatalogApi, toApiError } from '../services/api';

interface UseCatalogResult {
  boxes: CatalogBox[];
  rolls: CatalogRoll[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useCatalog(): UseCatalogResult {
  const [boxes, setBoxes] = useState<CatalogBox[]>([]);
  const [rolls, setRolls] = useState<CatalogRoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [boxData, rollData] = await Promise.all([
        storeCatalogApi.getBoxes(),
        storeCatalogApi.getRolls(),
      ]);
      setBoxes(boxData);
      setRolls(rollData);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { boxes, rolls, loading, error, reload: load };
}
