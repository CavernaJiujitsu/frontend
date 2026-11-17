import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { caveImage, magnifierCaverna } from "@/assets/images";
import { listCaves, type Cave } from "@/api/services/caves.service";
import CardComponent from "@/components/complex/card-component";
import { DefaultButton } from "@/components/customized/default-button";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { SearchInput } from "@/components/customized/search-input/search-input";
import { getErrorMessage } from "@/constants/error-messages";
import { BrandColors, Colors, Spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { isLoadingKey, useLoadingStore } from "@/store/useLoadingStore";
import { globalStyles } from "@/styles/global.styles";
import { nearbyGymStyles as styles } from "@/styles/onboarding/nearby-gym.styles";
import { formatDistanceKm } from "@/utils/distance";
import { normalizeApiError } from "@/utils/normalize-api-error";

const SEARCH_DEBOUNCE_MS = 350;

const localStyles = StyleSheet.create({
  feedback: { alignItems: "center", gap: Spacing.three, marginTop: Spacing.five },
  feedbackText: { color: Colors.light.textSecondary, fontSize: 16, textAlign: "center" },
});

type GymCard = {
  id: string;
  image: typeof caveImage;
  title: string;
  tags: string[];
  subtitle: string;
};

function toGymCard(cave: Cave): GymCard {
  const units = cave.units ?? [];
  const nearest = units[0];
  const where = nearest?.neighborhood ?? nearest?.name ?? "";
  const subtitle =
    cave.distanceKm !== undefined
      ? `${formatDistanceKm(cave.distanceKm)}${where ? ` • ${where}` : ""}`
      : (where ?? cave.name);
  return {
    id: cave.id,
    image: caveImage,
    title: cave.name,
    tags: units.length > 1 ? [`${units.length} unidades`] : [],
    subtitle,
  };
}

export default function NearByGym() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [gyms, setGyms] = useState<GymCard[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const isLoading = useLoadingStore(isLoadingKey("nearby-gyms"));
  const requestRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const requestId = ++requestRef.current;
      const location = useAppStore.getState().user.location;
      const userLocation = location
        ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
        : null;
      const store = useLoadingStore.getState();
      store.show("nearby-gyms");

      void listCaves(
        search,
        userLocation?.latitude,
        userLocation?.longitude,
      )
        .then((caves: Cave[]) => {
          if (requestRef.current === requestId) {
            setLoadError(null);
            setGyms(caves.map((cave: Cave) => toGymCard(cave)));
          }
        })
        .catch((err: unknown) => {
          // Inline error state: a failed search must not read as "no caves".
          if (requestRef.current === requestId) {
            setGyms([]);
            setLoadError(getErrorMessage(normalizeApiError(err)));
          }
        })
        .finally(() => store.hide("nearby-gyms"));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, attempt]);

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={[globalStyles.container, styles.pageGap]}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Escolha sua caverna
          </Text>
          <Text style={styles.subtitle}>Encontramos estas perto de você</Text>
        </View>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar caverna..."
          icon={magnifierCaverna}
          width="full"
          onClear={() => setSearch("")}
        />

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <LoadingSpinner label="Buscando cavernas…" />
          </View>
        ) : loadError ? (
          <View style={localStyles.feedback}>
            <Text style={localStyles.feedbackText} accessibilityRole="alert">
              Não foi possível buscar cavernas. {loadError}
            </Text>
            <DefaultButton
              label="Tentar novamente"
              color={BrandColors.secondary}
              action={() => setAttempt((value) => value + 1)}
            />
          </View>
        ) : (
          <FlatList
            data={gyms}
            keyExtractor={(gym) => gym.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <CardComponent
                image={item.image}
                title={item.title}
                tags={item.tags}
                subtitle={item.subtitle}
                onPress={() =>
                  router.push({
                    pathname: "/onboarding/select-belt",
                    params: { cavernaId: item.id, cavernaTitle: item.title },
                  })
                }
              />
            )}
            ListEmptyComponent={
              <View style={localStyles.feedback}>
                <Text style={localStyles.feedbackText}>
                  Nenhuma caverna encontrada.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
