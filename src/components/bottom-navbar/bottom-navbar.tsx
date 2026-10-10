import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bottomNavbarStyles as styles } from "./styles/bottom-navbar.styles";

export const BOTTOM_NAVBAR_BASE_HEIGHT = 84;

type NavbarItem = {
  label: string;
  href: "/inicio" | "/trilha" | "/cavernas" | "/perfil";
};

const ITEMS: NavbarItem[] = [
  { label: "Início", href: "/inicio" },
  { label: "Trilha", href: "/trilha" },
  { label: "Cavernas", href: "/cavernas" },
  { label: "Perfil", href: "/perfil" },
];

export type BottomNavbarProps = {
  testID?: string;
};

export function BottomNavbar({ testID }: BottomNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      {ITEMS.map((item) => {
        const selected = pathname === item.href;
        return (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            accessibilityLabel={`Ir para ${item.label}`}
            accessibilityState={{ selected }}
            hitSlop={10}
            onPress={() => {
              if (!selected) router.replace(item.href);
            }}
            style={({ pressed }) => [
              styles.item,
              pressed && !selected && styles.itemPressed,
            ]}
          >
            <View style={[styles.dot, selected && styles.dotSelected]} />
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
