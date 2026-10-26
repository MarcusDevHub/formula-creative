import { useCallback, useEffect, useState } from 'react';

// Carrega dados de uma função assíncrona e controla loading/erro.
// Uso: const { data, loading, error, reload, setData } = useAsync(() => api.listRules(), []);
export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    return run()
      .then((d) => { setData(d); return d; })
      .catch((e) => setError(e.message || 'Algo deu errado.'))
      .finally(() => setLoading(false));
  }, [run]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload, setData };
}
