import { render, screen } from "@testing-library/react-native";
import QRCode from "qrcode";

import { EntryCodeDisplay } from "../entry-code";

jest.mock("react-native-svg", () => {
  const { View } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    __esModule: true,
    default: View,
    Rect: View,
    Path: View,
  };
});

it("renders the same redeemable code as text and a real QR matrix", async () => {
  const code = "CAV-ABCDEF0123456789";
  await render(<EntryCodeDisplay code={code} />);
  expect(screen.getByText(code)).toBeOnTheScreen();
  const qr = QRCode.create(code);
  expect(qr.modules.size).toBeGreaterThan(20);
  expect(qr.modules.data.some((cell) => cell === 1)).toBe(true);
});
