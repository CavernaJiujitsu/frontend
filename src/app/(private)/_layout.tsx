import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { RoleGuard } from "@/components/auth/role-guard";
import { CheckinShortcut } from "@/components/entry-code/checkin-shortcut";
import { BrandColors } from "@/constants/theme";

export default function PrivateLayout() {
  return (
    <RoleGuard role="STUDENT">
      <View style={styles.host}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: BrandColors.background },
          }}
        />
        <CheckinShortcut />
      </View>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
});
