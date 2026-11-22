import { render, screen, userEvent } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";

import { CaveMapShell, type MapCanvasProps } from "./cave-map-shell";

jest.mock("react-native-safe-area-context", () => jest.requireActual("react-native-safe-area-context/jest/mock").default);

function MockCanvas({ units, is3D, onUnitPress }: MapCanvasProps) {
  return (
    <View>
      <Text>{is3D ? "mapa-3d" : "mapa-2d"}</Text>
      {units.map((unit) => (
        <Pressable
          key={unit.id}
          accessibilityRole="button"
          accessibilityLabel={`Pino ${unit.unitName}`}
          onPress={() => onUnitPress?.(unit)}
        >
          <Text>{unit.unitName}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const CENTER = { latitude: -23.55, longitude: -46.63 };
const UNIT = {
  id: "cave-1:unit-1",
  caveId: "cave-1",
  caveName: "Caverna A",
  unitName: "Centro",
  address: "Rua A",
  latitude: -23.55,
  longitude: -46.63,
};

describe("CaveMapShell", () => {
  it("opens the fullscreen map and shares the 3D state", async () => {
    const user = userEvent.setup();
    await render(<CaveMapShell Canvas={MockCanvas} center={CENTER} units={[UNIT]} />);

    expect(screen.getAllByText("mapa-2d")).toHaveLength(1);
    expect(screen.queryByLabelText("Fechar mapa")).toBeNull();

    await user.press(screen.getByLabelText("Expandir mapa"));

    expect(screen.getAllByText("mapa-2d")).toHaveLength(2);
    expect(screen.getByLabelText("Fechar mapa")).toBeTruthy();

    await user.press(screen.getAllByLabelText("Ativar visão 3D")[0]);
    expect(screen.getAllByText("mapa-3d")).toHaveLength(2);
    expect(screen.getAllByLabelText("Desativar visão 3D")).toHaveLength(2);

    await user.press(screen.getByLabelText("Fechar mapa"));
    expect(screen.getAllByText("mapa-3d")).toHaveLength(1);
    expect(screen.queryByLabelText("Fechar mapa")).toBeNull();
  });

  it("forwards marker presses from the inline map and the fullscreen map", async () => {
    const user = userEvent.setup();
    const onUnitPress = jest.fn();
    await render(<CaveMapShell Canvas={MockCanvas} center={CENTER} units={[UNIT]} onUnitPress={onUnitPress} />);

    await user.press(screen.getByLabelText("Pino Centro"));
    expect(onUnitPress).toHaveBeenCalledWith(UNIT);

    await user.press(screen.getByLabelText("Expandir mapa"));
    await user.press(screen.getAllByLabelText("Pino Centro")[1]);
    expect(onUnitPress).toHaveBeenCalledTimes(2);
  });

  it("does not offer map controls without a center or units", async () => {
    await render(<CaveMapShell Canvas={MockCanvas} units={[]} />);
    expect(screen.queryByLabelText("Expandir mapa")).toBeNull();
    expect(screen.queryByLabelText("Ativar visão 3D")).toBeNull();
  });
});
