import QRCode from "qrcode";
import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { BrandColors } from "@/constants/theme";

export function EntryCodeDisplay({ code }: { code: string }) {
  const qr = useMemo(() => {
    const modules = QRCode.create(code, { errorCorrectionLevel: "M" }).modules;
    const segments: string[] = [];
    for (let row = 0; row < modules.size; row += 1) {
      for (let col = 0; col < modules.size; col += 1) {
        if (modules.data[row * modules.size + col]) {
          segments.push(`M${col + 4} ${row + 4}h1v1h-1z`);
        }
      }
    }
    return { path: segments.join(""), size: modules.size + 8 };
  }, [code]);

  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <Svg width={220} height={220} viewBox={`0 0 ${qr.size} ${qr.size}`} accessibilityLabel={`QR de entrada ${code}`}>
        <Rect x={0} y={0} width={qr.size} height={qr.size} fill="white" />
        <Path d={qr.path} fill="black" />
      </Svg>
      <Text selectable style={{ color: BrandColors.onPrimary, fontSize: 22, fontWeight: "700", letterSpacing: 1 }}>{code}</Text>
    </View>
  );
}
