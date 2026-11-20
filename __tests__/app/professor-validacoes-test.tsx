import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { BeltValidation } from "@/api/services/belt-validations.service";
import TeacherValidations from "@/app/professor/validacoes/index";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);
// Jest does not load the Expo public env; the screens only need the constant.
jest.mock("@/constants/api", () => ({
  API_URL: "http://api.test",
  toAbsoluteUrl: (url: string) => url,
}));
jest.mock("@/components/customized/loading-spinner/loading-spinner", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return { LoadingSpinner: ({ label }: { label?: string }) => <MockText>{label}</MockText> };
});

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/professor/validacoes",
}));

const mockUsePendingValidations = jest.fn();
const mockUseScheduledValidations = jest.fn();
const mockUseUpcomingTeacherClasses = jest.fn();
jest.mock("@/hooks/use-teacher-data", () => {
  const actual = jest.requireActual("@/hooks/use-teacher-data");
  return {
    teacherKeys: actual.teacherKeys,
    usePendingValidations: () => mockUsePendingValidations(),
    useScheduledValidations: () => mockUseScheduledValidations(),
    useUpcomingTeacherClasses: (...args: unknown[]) => mockUseUpcomingTeacherClasses(...args),
  };
});

// Shape mirrors `GET /belt-validations?status=PENDING` (curl, 17/11/2026).
const PENDING: BeltValidation = {
  id: "validation-1",
  status: "PENDING",
  practitioner: {
    id: "practitioner-1",
    user: { name: "Aluno Teste", email: "aluno@teste.caverna" },
  },
  currentBelt: null,
  targetBelt: { id: "belt-blue", name: "Faixa Azul" },
  class: null,
  certificateUrl: null,
  notes: null,
  scheduledAt: null,
  createdAt: "2026-11-17T10:00:00.000Z",
};

function apiError(status: number, message: string, path: string) {
  const headers = new AxiosHeaders();
  return new AxiosError(message, String(status), { headers }, undefined, {
    status,
    statusText: "",
    headers,
    config: { headers },
    data: { message, timestamp: "2026-11-17T10:00:00.000Z", path },
  });
}

function queryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  };
}

async function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <QueryClientProvider client={client}>
      <TeacherValidations />
    </QueryClientProvider>,
  );
}

describe("Teacher validations screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseScheduledValidations.mockReturnValue(queryResult({ data: [] }));
  });

  it("shows the pending loading state while the list is pending", async () => {
    mockUsePendingValidations.mockReturnValue(queryResult({ isLoading: true }));

    await renderScreen();

    expect(screen.getByText("Carregando validações…")).toBeOnTheScreen();
  });

  it("shows the pending error state instead of the empty list", async () => {
    mockUsePendingValidations.mockReturnValue(
      queryResult({
        isError: true,
        error: apiError(500, "Internal server error", "/api/v1/belt-validations"),
      }),
    );

    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar as validações.")).toBeOnTheScreen();
    expect(screen.queryByText("Nenhuma validação em aberto nas suas cavernas.")).not.toBeOnTheScreen();
  });

  it("shows the empty pending and scheduled states only for successful empty answers", async () => {
    mockUsePendingValidations.mockReturnValue(queryResult({ data: [] }));

    await renderScreen();

    expect(await screen.findByText("Nenhuma validação em aberto nas suas cavernas.")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar as validações.")).not.toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole("button", { name: "Agendadas (0)" }));

    expect(await screen.findByText("Nenhuma validação agendada nas suas aulas.")).toBeOnTheScreen();
  });

  it("shows scheduled students in the open queue with a link to attendance", async () => {
    mockUsePendingValidations.mockReturnValue(queryResult({
      data: [{ ...PENDING, status: "SCHEDULED", class: {
        id: "class-1", startsAt: "2026-11-20T10:00:00.000Z", endsAt: "2026-11-20T11:00:00.000Z",
      } }],
    }));

    await renderScreen();

    expect(await screen.findByText("Aluno Teste")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Em aberto (1)" })).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole("button", { name: "Abrir chamada" }));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/professor/aulas/[classId]/chamada",
      params: { classId: "class-1" },
    });
  });

  it("shows the class-picker loading state while the classes are pending", async () => {
    mockUsePendingValidations.mockReturnValue(queryResult({ data: [PENDING] }));
    mockUseUpcomingTeacherClasses.mockReturnValue(queryResult({ isLoading: true }));

    await renderScreen();
    await screen.findByText("Aluno Teste");
    await userEvent.setup().press(screen.getByRole("button", { name: "Agendar" }));

    expect(screen.getByText("Carregando suas aulas…")).toBeOnTheScreen();
  });

  it("shows the class-picker error state instead of 'no classes'", async () => {
    mockUsePendingValidations.mockReturnValue(queryResult({ data: [PENDING] }));
    mockUseUpcomingTeacherClasses.mockReturnValue(
      queryResult({
        isError: true,
        error: apiError(500, "Internal server error", "/api/v1/classes"),
      }),
    );

    await renderScreen();
    await screen.findByText("Aluno Teste");
    await userEvent.setup().press(screen.getByRole("button", { name: "Agendar" }));

    expect(await screen.findByText(/Não foi possível carregar suas aulas\./)).toBeOnTheScreen();
    expect(
      screen.queryByText("Você não tem aulas futuras de treino ou validação. Crie uma na aba Aulas."),
    ).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeOnTheScreen();
  });

  it("shows the class-picker empty state only when the classes load", async () => {
    mockUsePendingValidations.mockReturnValue(queryResult({ data: [PENDING] }));
    mockUseUpcomingTeacherClasses.mockReturnValue(queryResult({ data: [] }));

    await renderScreen();
    await screen.findByText("Aluno Teste");
    await userEvent.setup().press(screen.getByRole("button", { name: "Agendar" }));

    expect(
      await screen.findByText("Você não tem aulas futuras de treino ou validação. Crie uma na aba Aulas."),
    ).toBeOnTheScreen();
    expect(screen.queryByText(/Não foi possível carregar suas aulas\./)).not.toBeOnTheScreen();
  });
});
