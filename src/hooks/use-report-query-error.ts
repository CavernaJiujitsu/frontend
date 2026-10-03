import { useEffect } from "react";

import { reportError } from "@/store/useErrorStore";

export function useReportQueryError(error: unknown): void {
  useEffect(() => {
    if (error) {
      reportError(error);
    }
  }, [error]);
}
