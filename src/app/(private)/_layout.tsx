import { Stack } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BOTTOM_NAVBAR_BASE_HEIGHT } from "@/components/bottom-navbar/bottom-navbar";
import { CheckinFab } from "@/components/customized/checkin-fab/checkin-fab";
import { BrandColors } from "@/constants/theme";

export default function PrivateLayout() {
  const insets = useSafeAreaInsets();

  function handleCheckin() {
    Alert.alert(
      "Check-in",
      "O check-in rápido estará disponível em breve. Oss!",
    );
  }

  return (
    <View style={styles.host}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: BrandColors.background },
        }}
      />
      <CheckinFab
        onPress={handleCheckin}
        style={{ bottom: insets.bottom + BOTTOM_NAVBAR_BASE_HEIGHT + 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
});
