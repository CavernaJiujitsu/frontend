import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { BackendClass } from "@/api/services/classes.service";
import type { HomeSummary } from "@/api/services/home.service";
import ReservarEncontro from "@/app/(private)/reservar-encontro/[classId]";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);
jest.mock("@/components/customized/loading-spinner/loading-spinner", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return { LoadingSpinner: ({ label }: { label?: string }) => <MockText>{label}</MockText> };
});

const CLASS_ID = "5ba201de-6cdc-4ce0-afdb-3cd6b8c01539";
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useRouter: () => mockRouter,
  usePathname: () => "/reservar-encontro",
  useLocalSearchParams: () => ({ classId: "5ba201de-6cdc-4ce0-afdb-3cd6b8c01539" }),
}));

const mockGetClass = jest.fn();
const mockEnrollClass = jest.fn();
jest.mock("@/api/services/classes.service", () => ({
  getClass: (...args: unknown[]) => mockGetClass(...args),
  enrollClass: (...args: unknown[]) => mockEnrollClass(...args),
}));
const mockGetHomeSummary = jest.fn();
jest.mock("@/api/services/home.service", () => ({
  getHomeSummary: (...args: unknown[]) => mockGetHomeSummary(...args),
}));
const mockNotify = jest.fn();
jest.mock("@/utils/dialogs", () => ({
  notify: (...args: unknown[]) => mockNotify(...args),
}));

// Shapes mirror `GET /classes/:id`, `POST /classes/:id/enrollments` and the
// 409 bodies (curl, 17/11/2026).
function apiError(status: number, message: string, path: string) {
  const headers = new AxiosHeaders();
  return new AxiosError(message, String(status), { headers }, undefined, {
    status,
    statusText: "",
    headers,
    config: { headers },
    data: { message, timestamp: "2026-11-17T10:01:07.022Z", path },
  });
}

const CLASS: BackendClass = {
  id: CLASS_ID,
  startsAt: "2026-11-18T21:00:00.000Z",
  endsAt: "2026-11-18T22:30:00.000Z",
  capacity: 1,
  type: "SCHEDULED",
  caveUnit: { id: "unit-centro", name: "Centro", active: true, cave: { id: "cave-1", name: "Caverna Matriz" } },
  teacher: { id: "teacher-1", user: { id: "user-1", name: "Mestre Semente" } },
  belts: [],
};

function homeWith(nextClass: HomeSummary["nextClass"]): HomeSummary {
  return {
    practitioner: { id: "practitioner-1", fullName: "Exec B Aluno" },
    nextClass,
    nearbyCaves: { data: [], _meta: { total: 0, limit: 5, radiusKm: 5, locationSource: "none" } },
  };
}

async function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ReservarEncontro />
    </QueryClientProvider>,
  );
}

const confirmButton = () => screen.getByRole("button", { name: "Confirmar reserva" });

describe("ReservarEncontro screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState((state) => ({
      user: { ...state.user, practitionerId: "practitioner-1", accessToken: "token", location: null },
    }));
    mockGetHomeSummary.mockResolvedValue(homeWith(null));
  });

  afterEach(() => useErrorStore.getState().hide());

  it("shows a loading state while the class loads", async () => {
    mockGetClass.mockReturnValue(new Promise(() => {}));

    await renderScreen();

    expect(screen.getByText("Carregando aula…")).toBeOnTheScreen();
  });

  it("shows an error state with the API message and a retry", async () => {
    mockGetClass.mockRejectedValueOnce(apiError(404, "Aula não encontrada", `/api/v1/classes/${CLASS_ID}`));

    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar a aula")).toBeOnTheScreen();
    expect(screen.getByText("Aula não encontrada")).toBeOnTheScreen();

    mockGetClass.mockResolvedValueOnce(CLASS);
    await userEvent.setup().press(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Professor: Mestre Semente")).toBeOnTheScreen();
  });

  it("shows the class and books it with the enrollment status", async () => {
    mockGetClass.mockResolvedValue(CLASS);
    mockEnrollClass.mockResolvedValue({ id: "enrollment-1", status: "PENDING" });
    await renderScreen();

    await userEvent.setup().press(await screen.findByRole("button", { name: "Confirmar reserva" }));

    expect(mockEnrollClass).toHaveBeenCalledWith(CLASS_ID, { practitionerId: "practitioner-1" });
    expect(mockNotify).toHaveBeenCalledWith("Aula reservada", expect.stringContaining("inscrição pendente"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/inicio");
  });

  it("works without a teacher name (mutation may omit teacher.user)", async () => {
    mockGetClass.mockResolvedValue({ ...CLASS, teacher: { id: "teacher-1" } });

    await renderScreen();

    expect(await screen.findByRole("button", { name: "Confirmar reserva" })).toBeOnTheScreen();
    expect(screen.queryByText(/Professor:/)).not.toBeOnTheScreen();
  });

  it.each([
    "Aula lotada",
    "Aluno já inscrito nesta aula",
    "Faixa atual do aluno não é elegível para esta aula",
  ])("shows the API 409 message '%s'", async (message) => {
    mockGetClass.mockResolvedValue(CLASS);
    mockEnrollClass.mockRejectedValue(apiError(409, message, `/api/v1/classes/${CLASS_ID}/enrollments`));
    await renderScreen();

    await userEvent.setup().press(await screen.findByRole("button", { name: "Confirmar reserva" }));

    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(screen.getByText("Não foi possível reservar")).toBeOnTheScreen();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("books only once on a double tap", async () => {
    mockGetClass.mockResolvedValue(CLASS);
    mockEnrollClass.mockReturnValue(new Promise(() => {}));
    await renderScreen();
    const button = await screen.findByRole("button", { name: "Confirmar reserva" });
    const user = userEvent.setup();

    await user.press(button);
    await user.press(button);

    expect(mockEnrollClass).toHaveBeenCalledTimes(1);
  });

  it("does not redirect nor notify when the booking ends after leaving the screen", async () => {
    mockGetClass.mockResolvedValue(CLASS);
    let resolveEnroll: (value: unknown) => void = () => {};
    mockEnrollClass.mockReturnValue(new Promise((resolve) => { resolveEnroll = resolve; }));
    const view = await renderScreen();

    await userEvent.setup().press(await screen.findByRole("button", { name: "Confirmar reserva" }));
    await view.unmount();
    resolveEnroll({ id: "enrollment-1", status: "PENDING" });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("shows that the student is already enrolled instead of the booking button", async () => {
    mockGetClass.mockResolvedValue(CLASS);
    mockGetHomeSummary.mockResolvedValue(
      homeWith({
        enrollmentId: "enrollment-1",
        enrollmentStatus: "CONFIRMED",
        classId: CLASS_ID,
        classType: "SCHEDULED",
        startsAt: CLASS.startsAt,
        endsAt: CLASS.endsAt,
        caveUnit: { id: "unit-centro", name: "Centro", caveId: "cave-1", caveName: "Caverna Matriz", address: null, neighborhood: null },
        teacher: { id: "teacher-1", name: "Mestre Semente" },
      }),
    );

    await renderScreen();

    expect(await screen.findByText("Você já está inscrito nesta aula")).toBeOnTheScreen();
    expect(screen.getByText("Presença confirmada")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Confirmar reserva" })).not.toBeOnTheScreen();
  });

  it("keeps the confirm button reachable for a class the student is not enrolled in", async () => {
    mockGetClass.mockResolvedValue(CLASS);

    await renderScreen();

    expect(await screen.findByText("Professor: Mestre Semente")).toBeOnTheScreen();
    expect(confirmButton()).toBeEnabled();
  });
});
