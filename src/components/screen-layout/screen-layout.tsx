import type { ReactNode } from "react";
import { StatusBar, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandColors } from "@/constants/theme";
import { globalStyles } from "@/styles/global.styles";
import { screenLayoutStyles as styles } from "./styles/screen-layout.styles";

export type ScreenLayoutProps = {
  children: ReactNode;
  // Slot opcional pro menu inferior. O menu é renderizado fora do navigator
  // (Stack), então cada tela o passa aqui — ele cuida do próprio inset inferior.
  // Telas sem menu usam a borda inferior do SafeAreaView.
  bottomNav?: ReactNode;
  // Sobrescreve o respiro padrão (ex.: tela cheia sem padding).
  contentStyle?: ViewStyle;
};

export function ScreenLayout({
  children,
  bottomNav,
  contentStyle,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView
      style={styles.safeArea}
      // Quando há navbar própria, ela cuida do inset inferior; senão a tela cuida.
      edges={bottomNav ? ["top"] : ["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={BrandColors.background}
      />
      <View style={[globalStyles.screen, contentStyle]}>{children}</View>
      {bottomNav}
    </SafeAreaView>
  );
}
