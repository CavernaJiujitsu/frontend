import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { BackendClass } from "@/api/services/classes.service";
import AttendanceScreen from "@/app/professor/aulas/[classId]/chamada";
import { useAppStore } from "@/store/useAppStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);
// Jest does not load the Expo public env; the services only need the constant.
jest.mock("@/constants/api", () => ({ API_URL: "http://api.test" }));
jest.mock("@/components/customized/loading-spinner/loading-spinner", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return { LoadingSpinner: ({ label }: { label?: string }) => <MockText>{label}</MockText> };
});

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/professor/aulas/class-1/chamada",
  useLocalSearchParams: () => ({ classId: "class-1" }),
}));

const mockGetClass = jest.fn();
const mockListEnrollments = jest.fn();
const mockEnrollClass = jest.fn();
jest.mock("@/api/services/classes.service", () => ({
  getClass: (...args: unknown[]) => mockGetClass(...args),
  listEnrollments: (...args: unknown[]) => mockListEnrollments(...args),
  checkInClass: jest.fn(),
  cancelClassEnrollment: jest.fn(),
  enrollClass: (...args: unknown[]) => mockEnrollClass(...args),
  setClassParticipation: jest.fn(),
}));

const mockSearchPractitioners = jest.fn();
jest.mock("@/api/services/practitioners.service", () => ({
  searchPractitioners: (...args: unknown[]) => mockSearchPractitioners(...args),
}));

jest.mock("@/hooks/use-teacher-data", () => {
  const actual = jest.requireActual("@/hooks/use-teacher-data");
  return {
    teacherKeys: actual.teacherKeys,
    useScheduledValidations: () => ({ data: [], isLoading: false, isError: false, error: null }),
  };
});

// Shape mirrors `GET /classes/:id` (curl, 17/11/2026).
const CLASS_ITEM: BackendClass = {
  id: "class-1",
  startsAt: "2026-11-17T22:00:00.000Z",
  endsAt: "2026-11-17T23:30:00.000Z",
  capacity: 20,
  type: "SCHEDULED",
  caveUnit: { id: "unit-1", name: "Centro", active: true },
  teacher: { id: "teacher-1", user: { id: "user-1", name: "Mestre Semente" } },
  belts: [],
  enrolledCount: 0,
  presentCount: 0,
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

async function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <QueryClientProvider client={client}>
      <AttendanceScreen />
    </QueryClientProvider>,
  );
}

describe("Attendance screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState((state) => ({
      user: {
        ...state.user,
        teacherId: "teacher-1",
        accessToken: "token",
        roles: ["TEACHER"],
      },
    }));
    mockGetClass.mockResolvedValue(CLASS_ITEM);
    mockListEnrollments.mockResolvedValue([]);
  });

  it("shows the class loading state while the class is pending", async () => {
    mockGetClass.mockReturnValue(new Promise(() => {}));

    await renderScreen();

    expect(screen.getByText("Carregando aula…")).toBeOnTheScreen();
  });

  it("shows the enrollment loading state while the list is pending", async () => {
    mockListEnrollments.mockReturnValue(new Promise(() => {}));

    await renderScreen();

    expect(await screen.findByText("Carregando inscrições…")).toBeOnTheScreen();
  });

  it("shows the class error state instead of the attendance blocks", async () => {
    mockGetClass.mockRejectedValue(
      apiError(500, "Internal server error", "/api/v1/classes/class-1"),
    );

    await renderScreen();

    expect(await screen.findByText("Aula não encontrada.")).toBeOnTheScreen();
    expect(screen.queryByText("ALUNOS INSCRITOS")).not.toBeOnTheScreen();
  });

  it("shows the enrollment error state instead of 'no students'", async () => {
    mockListEnrollments.mockRejectedValue(
      apiError(500, "Internal server error", "/api/v1/classes/class-1/enrollments"),
    );

    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar as inscrições.")).toBeOnTheScreen();
    expect(screen.queryByText("Nenhum aluno inscrito nesta aula.")).not.toBeOnTheScreen();
  });

  it("shows the empty enrollment state only for a successful answer", async () => {
    await renderScreen();

    expect(await screen.findByText("Nenhum aluno inscrito nesta aula.")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar as inscrições.")).not.toBeOnTheScreen();
  });

  it("shows the student-search error state instead of 'no student found'", async () => {
    mockSearchPractitioners.mockRejectedValue(
      apiError(500, "Internal server error", "/api/v1/practitioners"),
    );

    await renderScreen();
    const input = await screen.findByLabelText("Digite pelo menos 2 letras");
    await userEvent.setup().type(input, "Al");

    expect(await screen.findByText(/Não foi possível buscar alunos\./)).toBeOnTheScreen();
    expect(screen.queryByText("Nenhum aluno encontrado.")).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeOnTheScreen();
  });

  it("shows 'no student found' only when the search succeeds empty", async () => {
    mockSearchPractitioners.mockResolvedValue([]);

    await renderScreen();
    const input = await screen.findByLabelText("Digite pelo menos 2 letras");
    await userEvent.setup().type(input, "Al");

    expect(await screen.findByText("Nenhum aluno encontrado.")).toBeOnTheScreen();
    expect(screen.queryByText(/Não foi possível buscar alunos\./)).not.toBeOnTheScreen();
  });

  it("shows a styled success dialog after enrolling instead of a browser alert", async () => {
    mockSearchPractitioners.mockResolvedValue([
      { id: "student-1", user: { name: "Aluno Novo", email: "aluno@teste.com" } },
    ]);
    mockEnrollClass.mockResolvedValue({});
    await renderScreen();
    await screen.findByText("Nenhum aluno inscrito nesta aula.");

    await userEvent.setup().type(screen.getByLabelText("Digite pelo menos 2 letras"), "Al");
    await userEvent.setup().press(await screen.findByRole("button", { name: "Inscrever" }));

    expect(await screen.findByText("Aluno inscrito com sucesso!")).toBeOnTheScreen();
    expect(mockEnrollClass).toHaveBeenCalledWith("class-1", { practitionerId: "student-1" });
    await userEvent.setup().press(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByText("Aluno inscrito com sucesso!")).not.toBeOnTheScreen();
  });
});
