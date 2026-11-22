import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";

import Entrada from "@/app/(private)/entrada/[classId]";
import { useAppStore } from "@/store/useAppStore";

const mockGetEntryCode = jest.fn();
let mockNextClass: Record<string, unknown> | null;
jest.mock("@/api/services/entries.service", () => ({
  getEntryCode: (...args: unknown[]) => mockGetEntryCode(...args),
}));
jest.mock("@/hooks/use-home-summary", () => ({
  useHomeSummary: () => ({ data: { nextClass: mockNextClass } }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useLocalSearchParams: () => ({ classId: "class-1", enrollmentId: "enrollment-1" }),
}));
jest.mock("@/components/student-preview/preview-kit", () => {
  const { View: MockView, Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    StudentPage: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <MockView><MockText>{title}</MockText>{children}</MockView>
    ),
  };
});
jest.mock("@/components/entry-code/entry-code", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return { EntryCodeDisplay: ({ code }: { code: string }) => <MockText>{code}</MockText> };
});

beforeEach(() => {
  mockGetEntryCode.mockReset();
  useAppStore.setState((state) => ({
    user: { ...state.user, practitionerId: "practitioner-1", accessToken: "token" },
  }));
  mockNextClass = {
    classId: "class-1",
    enrollmentId: "enrollment-1",
    classType: "SCHEDULED",
    startsAt: "2026-11-21T22:00:00Z",
    caveUnit: { caveName: "Caverna SP Grande Norte", name: "Franco da Rocha", address: "Centro, Franco da Rocha - SP" },
    teacher: { name: "Professor Demonstração" },
  };
});

async function renderEntry() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  await render(<QueryClientProvider client={client}><Entrada /></QueryClientProvider>);
}

it("shows booked class details and the code, without a self-confirmation action", async () => {
  mockGetEntryCode.mockResolvedValue({ code: "CAV-8942", used: false });
  await renderEntry();
  expect(await screen.findByText("CAV-8942")).toBeOnTheScreen();
  expect(screen.getByText("Caverna SP Grande Norte · Franco da Rocha")).toBeOnTheScreen();
  expect(screen.getByText("Centro, Franco da Rocha - SP")).toBeOnTheScreen();
  expect(screen.getByText(/Prof. Professor Demonstração/)).toBeOnTheScreen();
  expect(screen.queryByText("Confirmar Check-in")).not.toBeOnTheScreen();
  expect(mockGetEntryCode).toHaveBeenCalledWith("class-1", "enrollment-1");
});

it("does not expose an already used entry code", async () => {
  mockGetEntryCode.mockResolvedValue({ code: "", used: true });
  await renderEntry();
  expect(await screen.findByText(/Entrada já liberada/)).toBeOnTheScreen();
  expect(screen.queryByText("CAV-8942")).not.toBeOnTheScreen();
});
