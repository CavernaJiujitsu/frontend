import { Image } from "expo-image";
import { Text, View } from "react-native";

import { InicioCard } from "@/components/customized/inicio-card/inicio-card";
import type { InicioNearby } from "@/types/inicio";
import { inicioStyles } from "@/styles/private/inicio.styles";
import { PinIcon } from "./pin-icon";

type NearbyCavernasCardProps = {
  nearby: InicioNearby;
  onSeeAllNearby: () => void;
};

export function NearbyCavernasCard({ nearby, onSeeAllNearby }: NearbyCavernasCardProps) {
  return (
    <InicioCard
      onPress={onSeeAllNearby}
      accessibilityLabel={`Cavernas mais próximas, ${nearby.count} cavernas em até ${nearby.radiusKm} km. Mais próxima: ${nearby.closest.name}`}
    >
      <View style={inicioStyles.nearbyHeader}>
        <PinIcon />
        <View style={inicioStyles.nearbyHeaderText}>
          <Text style={inicioStyles.nearbyTitle}>Cavernas mais próximas</Text>
          <Text style={inicioStyles.nearbySub}>
            {nearby.count} cavernas em até {nearby.radiusKm} km
          </Text>
        </View>
      </View>

      <View style={inicioStyles.avatarRow}>
        {nearby.avatars.map((avatar, i) => (
          <View
            key={avatar.id}
            style={[
              inicioStyles.avatar,
              avatar.color ? { backgroundColor: avatar.color } : null,
              i > 0 && inicioStyles.avatarOverlap,
            ]}
          >
            {avatar.imageUrl ? (
              <Image source={{ uri: avatar.imageUrl }} style={inicioStyles.avatarImage} />
            ) : null}
          </View>
        ))}
        {nearby.extraCount > 0 && (
          <View style={[inicioStyles.avatar, inicioStyles.avatarOverlap, inicioStyles.avatarExtra]}>
            <Text style={inicioStyles.avatarExtraText}>+{nearby.extraCount}</Text>
          </View>
        )}
      </View>

      <Text style={inicioStyles.closestName}>{nearby.closest.name}</Text>

      <View style={inicioStyles.closestFooter}>
        <Text style={inicioStyles.closestMeta} numberOfLines={1}>
          {nearby.closest.neighborhood} • {nearby.closest.distanceKm}km •{" "}
          {nearby.closest.isOpen ? "Aberta" : "Fechada"}
        </Text>
        <Text style={inicioStyles.link}>Ver todas →</Text>
      </View>
    </InicioCard>
  );
}
