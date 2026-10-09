import { Text, View } from "react-native";

import { InicioCard } from "@/components/customized/inicio-card/inicio-card";
import type { InicioBelt } from "@/types/inicio";
import { inicioStyles } from "@/styles/private/inicio.styles";

type BeltProgressCardProps = {
  belt: InicioBelt;
};

export function BeltProgressCard({ belt }: BeltProgressCardProps) {
  const progress =
    belt.totalCheckpoints > 0
      ? Math.min(Math.max(belt.completedCheckpoints / belt.totalCheckpoints, 0), 1)
      : 0;

  return (
    <InicioCard accessibilityLabel={`${belt.name}, ${belt.completedCheckpoints} de ${belt.totalCheckpoints} checkpoints`}>
      <View style={inicioStyles.beltRow}>
        <View style={[inicioStyles.beltDot, { backgroundColor: belt.color }]} />
        <View>
          <Text style={inicioStyles.beltName}>{belt.name}</Text>
          <Text style={inicioStyles.beltProgressText}>
            {belt.completedCheckpoints} / {belt.totalCheckpoints} checkpoints
          </Text>
        </View>
      </View>

      <View
        style={inicioStyles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: belt.totalCheckpoints, now: belt.completedCheckpoints }}
      >
        <View style={[inicioStyles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </InicioCard>
  );
}
