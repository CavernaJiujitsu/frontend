import { Alert, StyleSheet, View } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { CheckinFab } from "@/components/customized/checkin-fab/checkin-fab";
import { BottomTabInset, BrandColors, Colors } from "@/constants/theme";

export default function PrivateLayout() {
  function handleCheckin() {
    Alert.alert("Check-in", "O check-in rápido estará disponível em breve. Oss!");
  }

  return (
    <View style={styles.host}>
      <NativeTabs
        backgroundColor={BrandColors.background}
        iconColor={{
          default: Colors.light.textSecondary,
          selected: BrandColors.secondary,
        }}
        labelStyle={{
          default: { color: Colors.light.textSecondary },
          selected: { color: BrandColors.secondary },
        }}
        tintColor={BrandColors.secondary}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            md={{ default: "home", selected: "home_filled" }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="trilha">
          <NativeTabs.Trigger.Label>Trilha</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "map", selected: "map.fill" }}
            md={{ default: "route", selected: "route" }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="cavernas">
          <NativeTabs.Trigger.Label>Cavernas</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "mappin.and.ellipse", selected: "mappin.and.ellipse" }}
            md={{ default: "location_on", selected: "location_on" }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="perfil">
          <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person", selected: "person.fill" }}
            md={{ default: "person", selected: "person" }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>

      <CheckinFab onPress={handleCheckin} style={styles.fabOffset} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  fabOffset: {
    bottom: BottomTabInset + 24,
  },
});
