import { renderHook } from "@testing-library/react-native";

import { useReportQueryError } from "@/hooks/use-report-query-error";
import { reportError } from "@/store/useErrorStore";

jest.mock("@/store/useErrorStore", () => ({ reportError: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useReportQueryError", () => {
  it("does nothing while there is no error", async () => {
    await renderHook(() => useReportQueryError(null));

    expect(reportError).not.toHaveBeenCalled();
  });

  it("reports each new error once, not on every render", async () => {
    const first = new Error("first");
    const { rerender } = await renderHook(
      ({ error }: { error: Error | null }) => useReportQueryError(error),
      { initialProps: { error: first as Error | null } },
    );

    await rerender({ error: first });
    const second = new Error("second");
    await rerender({ error: second });

    expect(jest.mocked(reportError).mock.calls).toEqual([[first], [second]]);
  });
});
