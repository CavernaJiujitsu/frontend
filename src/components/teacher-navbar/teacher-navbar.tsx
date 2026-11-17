import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { teacherNavbarStyles as styles } from "./styles/teacher-navbar.styles";

type NavbarItem = {
  label: string;
  href:
    | "/professor"
    | "/professor/aulas"
    | "/professor/validacoes"
    | "/professor/perfil";
};

const ITEMS: NavbarItem[] = [
  { label: "Início", href: "/professor" },
  { label: "Aulas", href: "/professor/aulas" },
  { label: "Validações", href: "/professor/validacoes" },
  { label: "Perfil", href: "/professor/perfil" },
];

export function TeacherNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {ITEMS.map((item) => {
        // "/professor" prefixes every tab, so the home tab only matches exactly.
        const selected =
          pathname === item.href ||
          (item.href !== "/professor" && pathname.startsWith(`${item.href}/`));
        return (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            accessibilityLabel={`Ir para ${item.label}`}
            accessibilityState={{ selected }}
            hitSlop={10}
            onPress={() => {
              if (pathname !== item.href) router.replace(item.href);
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
