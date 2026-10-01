import { useEffect } from "react";

import { reportError } from "@/store/useErrorStore";

/**
 * Espelha o erro de uma query/mutation do react-query no popup global.
 * Uso na tela que disparou a requisição — o erro "espalha" para a tela,
 * a tela aciona o gerenciador via este hook ou `reportError` no `catch`.
 *
 * @example
 * const gyms = usePaginatedSearch("/gyms", search);
 * useReportQueryError(gyms.error);
 */
export function useReportQueryError(error: unknown): void {
  useEffect(() => {
    if (error) {
      reportError(error);
    }
  }, [error]);
}
