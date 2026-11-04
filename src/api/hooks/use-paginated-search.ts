import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getPaginated } from "@/api/services/basic-operations.service";

export type UsePaginatedSearchOptions = {
  page?: number;
  limit?: number;
  minLength?: number;
  debounceMs?: number;
  enabled?: boolean;
};

export function usePaginatedSearch<T>(
  route: string,
  search: string,
  options?: UsePaginatedSearchOptions,
) {
  const {
    page = 1,
    limit = 20,
    minLength = 2,
    debounceMs = 400,
    enabled = true,
  } = options ?? {};

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const trimmedSearch = debouncedSearch.trim();
  const isSearchEnabled = enabled && trimmedSearch.length >= minLength;

  const query = useQuery({
    queryKey: ["search", route, trimmedSearch, page, limit],
    queryFn: () =>
      getPaginated<T>(route, { page, limit, search: trimmedSearch }),
    enabled: isSearchEnabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });

  return { ...query, debouncedSearch: trimmedSearch, isSearchEnabled };
}
