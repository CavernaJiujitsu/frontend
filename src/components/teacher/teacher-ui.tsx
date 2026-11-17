import { useRouter } from "expo-router";
import type { PropsWithChildren } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { TeacherNavbar } from "@/components/teacher-navbar/teacher-navbar";
import { BrandColors, Colors, Spacing } from "@/constants/theme";
import { inicioStyles } from "@/styles/private/inicio.styles";
import { studentStyles } from "@/styles/private/student-preview.styles";

type TeacherPageProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  /** Shows a back link (screens opened from a tab). */
  showBack?: boolean;
}>;

/** Teacher counterpart of `StudentPage`: header + scroll + teacher navbar. */
export function TeacherPage({ title, subtitle, showBack, children }: TeacherPageProps) {
  const router = useRouter();
  return (
    <ScreenLayout bottomNav={<TeacherNavbar />}>
      <View style={studentStyles.content}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={10}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/professor")
            }
          >
            <Text style={ui.back}>‹ Voltar</Text>
          </Pressable>
        ) : null}
        <View style={inicioStyles.header}>
          <Text accessibilityRole="header" style={inicioStyles.greeting}>
            {title}
          </Text>
          {subtitle ? <Text style={inicioStyles.greetingSub}>{subtitle}</Text> : null}
        </View>
        <ScrollView contentContainerStyle={ui.scroll} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function Chip({ label, selected = false, onPress, disabled }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[ui.chip, selected && ui.chipSelected, disabled && ui.disabled]}
    >
      <Text style={[ui.chipText, selected && ui.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

type SmallButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};

export function SmallButton({ label, onPress, variant = "secondary", disabled }: SmallButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ui.smallButton,
        variant === "primary" && ui.smallPrimary,
        variant === "danger" && ui.smallDanger,
        pressed && studentStyles.pressed,
        disabled && ui.disabled,
      ]}
    >
      <Text style={ui.smallButtonText}>{label}</Text>
    </Pressable>
  );
}

type BadgeTone = "neutral" | "success" | "warning" | "danger";

const BADGE_COLORS: Record<BadgeTone, string> = {
  neutral: Colors.light.textSecondary,
  success: BrandColors.success,
  warning: BrandColors.secondary,
  danger: BrandColors.danger,
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const color = BADGE_COLORS[tone];
  return (
    <View style={[ui.badge, { borderColor: color }]}>
      <Text style={[ui.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export const ui = StyleSheet.create({
  scroll: { gap: Spacing.three, paddingBottom: 48 },
  back: { color: BrandColors.borderSecondary, fontSize: 14, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two, alignItems: "center" },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipSelected: { borderColor: BrandColors.secondary, backgroundColor: BrandColors.secondary },
  chipText: { color: Colors.light.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: BrandColors.onPrimary },
  smallButton: {
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.light.backgroundSelected,
    minHeight: 40,
    justifyContent: "center",
  },
  smallPrimary: { backgroundColor: BrandColors.secondary },
  smallDanger: { backgroundColor: "#5A2323" },
  smallButtonText: { color: BrandColors.onPrimary, fontSize: 13, fontWeight: "700" },
  disabled: { opacity: 0.5 },
  badge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  label: { color: Colors.light.textSecondary, fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: BrandColors.border },
});
