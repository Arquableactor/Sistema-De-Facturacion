import { useCallback, useEffect, useState } from 'react'

// Hook de carga reutilizable. Corre `fn` al montar y cuando cambian `deps`;
// expone reload() para reintentar/refrescar tras una mutación.
// Uso: const { data, loading, error, reload } = useApi(() => getClients(inc), [inc])
export default function useApi(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return run()
      .then(setData)
      .catch((e) => setError(e))
      .finally(() => setLoading(false))
  }, [run])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load, setData }
}
