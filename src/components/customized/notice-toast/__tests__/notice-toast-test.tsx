import { render, screen, userEvent } from "@testing-library/react-native";

import { NoticeToast } from "../notice-toast";
import { useNoticeStore } from "@/store/useNoticeStore";
import { notify } from "@/utils/dialogs";

afterEach(() => useNoticeStore.getState().hide());

it("shows a dismissible in-app success notice instead of a browser popup", async () => {
  await render(<NoticeToast />);
  notify("Perfil atualizado", "Seus dados foram salvos.", "success");

  expect(await screen.findByText("Perfil atualizado")).toBeOnTheScreen();
  expect(screen.getByText("Seus dados foram salvos.")).toBeOnTheScreen();
  expect(useNoticeStore.getState().notice?.tone).toBe("success");

  await userEvent.setup().press(screen.getByRole("button", { name: "Fechar aviso" }));
  expect(screen.queryByText("Perfil atualizado")).not.toBeOnTheScreen();
});
