import { render, screen, userEvent } from "@testing-library/react-native";

import { CheckinShortcut } from "../checkin-shortcut";

const mockPush = jest.fn();
const mockNotify = jest.fn();
let mockPathname = "/inicio";
let mockHome: { isPending: boolean; isError: boolean; data?: { nextClass: { classId: string; enrollmentId: string } | null } };

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock("@/hooks/use-home-summary", () => ({
  useHomeSummary: () => mockHome,
}));
jest.mock("@/utils/dialogs", () => ({ notify: (...args: unknown[]) => mockNotify(...args) }));

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname = "/inicio";
  mockHome = { isPending: false, isError: false, data: { nextClass: { classId: "class-1", enrollmentId: "enrollment-1" } } };
});

it("opens the entry-code screen for the booked class", async () => {
  await render(<CheckinShortcut />);
  await userEvent.setup().press(screen.getByRole("button", { name: "Abrir check-in da próxima aula" }));
  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/entrada/[classId]",
    params: { classId: "class-1", enrollmentId: "enrollment-1" },
  });
});

it("explains when no class is booked instead of navigating to the home page", async () => {
  mockHome = { isPending: false, isError: false, data: { nextClass: null } };
  await render(<CheckinShortcut />);
  await userEvent.setup().press(screen.getByRole("button", { name: "Abrir check-in da próxima aula" }));
  expect(mockPush).not.toHaveBeenCalled();
  expect(mockNotify).toHaveBeenCalledWith("Nenhuma aula agendada", expect.any(String));
});

it("does not cover the entry code with the floating button", async () => {
  mockPathname = "/entrada/class-1";
  await render(<CheckinShortcut />);
  expect(screen.queryByRole("button", { name: "Abrir check-in da próxima aula" })).not.toBeOnTheScreen();
});
