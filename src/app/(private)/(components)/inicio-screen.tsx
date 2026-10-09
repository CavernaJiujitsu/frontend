import { Pressable, ScrollView, Text, View } from "react-native";

import type { InicioBelt, InicioNearby, InicioNextClass } from "@/types/inicio";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";
import { BeltProgressCard } from "./belt-progress-card";
import { NextClassCard } from "./next-class-card";
import { NearbyCavernasCard } from "./nearby-cavernas-card";

export type InicioScreenProps = {
  userName: string;
  belt: InicioBelt;
  nextClass: InicioNextClass | null;
  nearby: InicioNearby | null;
  onSeeAllBelts: () => void;
  onConfirmClass: () => void;
  onSeeAllNearby: () => void;
};

export function InicioScreen({
  userName,
  belt,
  nextClass,
  nearby,
  onSeeAllBelts,
  onConfirmClass,
  onSeeAllNearby,
}: InicioScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting} accessibilityRole="header">
          Olá, {userName} 👋
        </Text>
        <Text style={styles.greetingSub}>Continue evoluindo na sua trilha</Text>
      </View>

      <BeltProgressCard belt={belt} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver todas as faixas"
        onPress={onSeeAllBelts}
        hitSlop={10}
        style={styles.linkWrap}
      >
        <Text style={styles.link}>Ver todas as faixas →</Text>
      </Pressable>

      <NextClassCard nextClass={nextClass} onConfirmClass={onConfirmClass} />

      {nearby ? <NearbyCavernasCard nearby={nearby} onSeeAllNearby={onSeeAllNearby} /> : null}
    </ScrollView>
  );
}
