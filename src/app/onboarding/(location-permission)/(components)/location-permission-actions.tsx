import { Pressable, Text, View } from "react-native";
import { DefaultButton } from "@/components/customized/default-button";
import { BottomTabInset, BrandColors, Spacing } from "@/constants/theme";
import { styles } from "@/styles/onboarding/location-permission.style";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LocationPermissionActionsProps = {
  isRequestingPermission: boolean;
  handleRequestLocation: () => void;
  onSkip?: () => void;
};

export function LocationPermissionActions({
  isRequestingPermission,
  handleRequestLocation,
  onSkip,
}: LocationPermissionActionsProps) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.actions,
        { paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three },
      ]}
    >
      <DefaultButton
        label="Permitir localização"
        color={BrandColors.secondary}
        action={handleRequestLocation}
        disabled={isRequestingPermission}
      />

      <Pressable style={styles.skipButton} onPress={onSkip} disabled={isRequestingPermission}>
        <Text style={styles.skipButtonText}>Agora não, prefiro buscar manualmente</Text>
      </Pressable>
    </View>
  );
}
