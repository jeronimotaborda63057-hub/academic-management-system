/**
 * useEntityList — SRP + OCP
 *
 * Hook genérico que centraliza el patrón repetido en todas las páginas de listado:
 *   fetch inicial → estado de datos → búsqueda → filtros por clave/valor
 *
 * Antes: cada página (careers/List, semesters/List, subjects/List, users/List)
 *        tenía su propio useState<T[]>, useState(search), useState(filterValues),
 *        useEffect con fetchData, y la misma lógica de filtrado.
 *
 * Ahora: un único hook reutilizable. Solo se le pasa:
 *   - fetchFn: () => Promise<T[]>   (DIP: el hook no sabe qué servicio usa)
 *   - filterFn: función de filtrado específica de la entidad
 *   - deps: dependencias extra del useEffect (opcional)
 */

import { useCallback, useEffect, useState } from "react";

interface UseEntityListOptions<T> {
  /** Función que obtiene los datos del servicio */
  fetchFn: () => Promise<T[]>;
  /** Filtro aplicado sobre los datos cargados. Recibe item, search y filterValues */
  filterFn?: (item: T, search: string, filterValues: Record<string, string>) => boolean;
  /** Dependencias adicionales para el useEffect de carga */
  deps?: unknown[];
}

interface UseEntityListReturn<T> {
  data: T[];
  filteredData: T[];
  loading: boolean;
  search: string;
  filterValues: Record<string, string>;
  setSearch: (s: string) => void;
  handleFilterChange: (key: string, value: string) => void;
  handleClear: () => void;
  refresh: () => void;
}

export function useEntityList<T>({
  fetchFn,
  filterFn,
  deps = [],
}: UseEntityListOptions<T>): UseEntityListReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result ?? []);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (key: string, value: string) =>
    setFilterValues((prev) => ({ ...prev, [key]: value }));

  const handleClear = () => {
    setSearch("");
    setFilterValues({});
  };

  const filteredData = filterFn
    ? data.filter((item) => filterFn(item, search, filterValues))
    : data;

  return {
    data,
    filteredData,
    loading,
    search,
    filterValues,
    setSearch,
    handleFilterChange,
    handleClear,
    refresh: load,
  };
}