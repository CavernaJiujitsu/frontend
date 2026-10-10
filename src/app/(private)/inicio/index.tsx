import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { inicioMock } from "@/api/mocks/inicio";
import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors, Spacing } from "@/constants/theme";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";

const cardStyles = StyleSheet.create({
  card: {
    width: "100%",
  },
  pressed: {
    opacity: 0.85,
  },
  contentGap: {
    gap: Spacing.two,
  },
});

export default function Inicio() {
  const router = useRouter();
  const data = inicioMock;

  const beltProgress =
    data.belt.totalCheckpoints > 0
      ? Math.min(
          Math.max(
            data.belt.completedCheckpoints / data.belt.totalCheckpoints,
            0,
          ),
          1,
        )
      : 0;

  function handleSeeAllBelts() {
    router.push("/trilha");
  }

  function handleConfirmClass() {
    Alert.alert("Presença confirmada", "Nos vemos na próxima aula. Oss!");
  }

  function handleSeeAllNearby() {
    router.push("/cavernas");
  }

  return (
    <ScreenLayout bottomNav={<BottomNavbar />}>
      <View style={[globalStyles.container, styles.content]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.greeting} accessibilityRole="header">
              Olá, {data.userName} 👋
            </Text>
            <Text style={styles.greetingSub}>
              Continue evoluindo na sua trilha
            </Text>
          </View>

          <View
            accessibilityLabel={`${data.belt.name}, ${data.belt.completedCheckpoints} de ${data.belt.totalCheckpoints} checkpoints`}
            style={[globalStyles.card, cardStyles.card]}
          >
            <View style={cardStyles.contentGap}>
              <View style={styles.beltRow}>
                <View
                  style={[
                    styles.beltDot,
                    { backgroundColor: data.belt.color },
                  ]}
                />
                <View>
                  <Text style={styles.beltName}>{data.belt.name}</Text>
                  <Text style={styles.beltProgressText}>
                    {data.belt.completedCheckpoints} /{" "}
                    {data.belt.totalCheckpoints} checkpoints
                  </Text>
                </View>
              </View>

              <View
                style={styles.progressTrack}
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: data.belt.totalCheckpoints,
                  now: data.belt.completedCheckpoints,
                }}
              >
                <View
                  style={[
                    styles.progressFill,
                    { width: `${beltProgress * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver todas as faixas"
            onPress={handleSeeAllBelts}
            hitSlop={10}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>Ver todas as faixas →</Text>
          </Pressable>

          <View style={[globalStyles.card, cardStyles.card]}>
            <View style={cardStyles.contentGap}>
              <Text style={styles.eyebrow}>PRÓXIMA AULA</Text>

              {data.nextClass ? (
                <>
                  <View style={styles.nextClassRow}>
                    <Text style={styles.nextClassTime}>
                      {data.nextClass.weekday} • {data.nextClass.time}
                    </Text>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{data.nextClass.tag}</Text>
                    </View>
                  </View>

                  <View style={styles.nextClassFooter}>
                    <Text style={styles.teacher}>
                      Prof. {data.nextClass.teacherName}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Confirmar presença na próxima aula"
                      style={({ pressed }) => [
                        styles.confirmBtn,
                        pressed && styles.confirmBtnPressed,
                      ]}
                      onPress={handleConfirmClass}
                    >
                      <Text style={styles.confirmBtnText}>Confirmar</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>
                  Você ainda não tem aula agendada. Escolha uma caverna e
                  reserve seu horário.
                </Text>
              )}
            </View>
          </View>

          {data.nearby ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Cavernas mais próximas, ${data.nearby.count} cavernas em até ${data.nearby.radiusKm} km. Mais próxima: ${data.nearby.closest.name}`}
              onPress={handleSeeAllNearby}
              style={({ pressed }) => [
                globalStyles.card,
                cardStyles.card,
                pressed && cardStyles.pressed,
              ]}
            >
              <View style={cardStyles.contentGap}>
                <View style={styles.nearbyHeader}>
                  <Svg width={28} height={28} viewBox="0 0 100 100">
                    <Path
                      d="M50 12 C33 12 20 26 20 43 C20 66 50 92 50 92 C50 92 80 66 80 43 C80 26 67 12 50 12 Z"
                      fill="none"
                      stroke={BrandColors.secondary}
                      strokeWidth={7}
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M38 46 C38 36 43 31 50 31 C57 31 62 36 62 46 L62 51 L38 51 Z"
                      fill={BrandColors.secondary}
                    />
                  </Svg>
                  <View style={styles.nearbyHeaderText}>
                    <Text style={styles.nearbyTitle}>
                      Cavernas mais próximas
                    </Text>
                    <Text style={styles.nearbySub}>
                      {data.nearby.count} cavernas em até {data.nearby.radiusKm}{" "}
                      km
                    </Text>
                  </View>
                </View>

                <View style={styles.avatarRow}>
                  {data.nearby.avatars.map((avatar, i) => (
                    <View
                      key={avatar.id}
                      style={[
                        styles.avatar,
                        avatar.color
                          ? { backgroundColor: avatar.color }
                          : null,
                        i > 0 && styles.avatarOverlap,
                      ]}
                    >
                      {avatar.imageUrl ? (
                        <Image
                          source={{ uri: avatar.imageUrl }}
                          style={styles.avatarImage}
                        />
                      ) : null}
                    </View>
                  ))}
                  {data.nearby.extraCount > 0 && (
                    <View
                      style={[
                        styles.avatar,
                        styles.avatarOverlap,
                        styles.avatarExtra,
                      ]}
                    >
                      <Text style={styles.avatarExtraText}>
                        +{data.nearby.extraCount}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.closestName}>
                  {data.nearby.closest.name}
                </Text>

                <View style={styles.closestFooter}>
                  <Text style={styles.closestMeta} numberOfLines={1}>
                    {data.nearby.closest.neighborhood} •{" "}
                    {data.nearby.closest.distanceKm}km •{" "}
                    {data.nearby.closest.isOpen ? "Aberta" : "Fechada"}
                  </Text>
                  <Text style={styles.link}>Ver todas →</Text>
                </View>
              </View>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}
