import { getEntryCode } from "@/api/services/entries.service";

const mockGet = jest.fn();
jest.mock("@/api/bootstrap/axios-bootstrap", () => ({
  apiClient: { get: (...args: unknown[]) => mockGet(...args) },
}));

describe("getEntryCode", () => {
  beforeEach(() => mockGet.mockReset());

  it("requests the versioned entry route and unwraps its response", async () => {
    const code = {
      code: "CAV-EXAMPLE",
      used: false,
      classId: "class-id",
      enrollmentId: "enrollment-id",
    };
    mockGet.mockResolvedValueOnce({ data: { data: code } });

    await expect(getEntryCode(code.classId, code.enrollmentId)).resolves.toEqual(code);
    expect(mockGet).toHaveBeenCalledWith(
      "/api/v1/entries/classes/class-id/enrollments/enrollment-id/code",
    );
  });
});
