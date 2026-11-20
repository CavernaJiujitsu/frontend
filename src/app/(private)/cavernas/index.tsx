import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { listCaves, type Cave } from "@/api/services/caves.service";
import { getPractitioner } from "@/api/services/practitioners.service";
import { caveImage, magnifierCaverna } from "@/assets/images";
import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import CardComponent from "@/components/complex/card-component";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { SearchInput } from "@/components/customized/search-input/search-input";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { getErrorMessage } from "@/constants/error-messages";
import { BrandColors, Colors, Spacing } from "@/constants/theme";
import { studentKeys } from "@/hooks/query-keys";
import { useCaveAvailability } from "@/hooks/use-cave-availability";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";
import { formatDistanceKm, haversineKm } from "@/utils/distance";
import { normalizeApiError } from "@/utils/normalize-api-error";
import type { CaveAvailability } from "@/utils/schedule";

type CaveFilter = "nearest" | "openNow" | "classesToday";

const filters: { key: CaveFilter; label: string }[] = [
  { key: "nearest", label: "Mais próximas" },
  { key: "openNow", label: "Abertas agora" },
  { key: "classesToday", label: "Aulas hoje" },
];

const localStyles = StyleSheet.create({
  list: { gap: Spacing.three - Spacing.one, paddingVertical: Spacing.three },
  feedback: { alignItems: "flex-start", gap: Spacing.two, paddingVertical: Spacing.three },
  origin: { gap: Spacing.two },
  originLabel: { color: Colors.light.textSecondary, fontSize: 12 },
  originChoices: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  originButton: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: Colors.light.backgroundElement,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  originSelected: { borderColor: BrandColors.borderSecondary },
  originText: { color: Colors.light.textSecondary, fontSize: 13, fontWeight: "600" },
  originTextSelected: { color: BrandColors.borderSecondary },
});

function activeUnits(cave: Cave) {
  return (cave.units ?? []).filter((unit) => unit.active !== false);
}

function getCaveDistanceKm(
  cave: Cave,
  origin?: { latitude: number; longitude: number },
): number | undefined {
  if (cave.distanceKm !== undefined) return cave.distanceKm;
  const units = activeUnits(cave);
  if (!origin || units.length === 0) return undefined;

  const distances = units
    .map((unit) =>
      haversineKm(origin, {
        latitude: Number(unit.latitude),
        longitude: Number(unit.longitude),
      }),
    )
    .filter(Number.isFinite);
  return distances.length > 0 ? Math.min(...distances) : undefined;
}

/** Card tags come only from real data (distance and today's classes). */
function caveTags(distanceTag: string, availability?: CaveAvailability): string[] {
  return [
    distanceTag,
    ...(availability?.openNow ? ["Aberta agora"] : []),
    ...(availability?.classesToday ? ["Aulas hoje"] : []),
  ];
}

export default function Cavernas() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<CaveFilter>("nearest");
  const [originMode, setOriginMode] = useState<"saved" | "device">("saved");
  const location = useAppStore((state) => state.user.location);
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const accessToken = useAppStore((state) => state.user.accessToken);
  const profileQuery = useQuery({
    queryKey: studentKeys.practitioner(practitionerId),
    queryFn: () => getPractitioner(practitionerId!),
    enabled: Boolean(practitionerId && accessToken),
  });
  const savedLatitude = Number(profileQuery.data?.latitude);
  const savedLongitude = Number(profileQuery.data?.longitude);
  const hasSavedCoordinates =
    profileQuery.data?.latitude != null &&
    profileQuery.data.longitude != null &&
    Number.isFinite(savedLatitude) &&
    Number.isFinite(savedLongitude);
  const hasSavedAddress = Boolean(profileQuery.data?.address && hasSavedCoordinates);
  const useSaved = hasSavedCoordinates && (!location || (hasSavedAddress && originMode === "saved"));
  const latitude = useSaved ? savedLatitude : location?.coords.latitude;
  const longitude = useSaved ? savedLongitude : location?.coords.longitude;
  const hasCoordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude);
  // `listCaves` normalizes the coordinates (max. 8 decimal places).
  const query = useQuery({
    queryKey: ["caves", search, hasCoordinates ? latitude : null, hasCoordinates ? longitude : null],
    queryFn: () =>
      listCaves(
        search,
        hasCoordinates ? latitude : undefined,
        hasCoordinates ? longitude : undefined,
      ),
    enabled: (!profileQuery.isPending && !profileQuery.isFetching) || !practitionerId,
  });
  useReportQueryError(query.error);
  const needsAvailability = activeFilter !== "nearest";
  const availabilityQuery = useCaveAvailability(query.data, needsAvailability);
  useReportQueryError(availabilityQuery.error);
  const availability = needsAvailability ? availabilityQuery.data : undefined;

  const caves = (query.data ?? []).filter((cave) => {
    if (activeFilter === "openNow") return availability?.[cave.id]?.openNow === true;
    if (activeFilter === "classesToday") return availability?.[cave.id]?.classesToday === true;
    return true;
  });
  const isLoading =
    ((profileQuery.isPending || profileQuery.isFetching) && Boolean(practitionerId && accessToken)) ||
    query.isLoading ||
    (needsAvailability && query.isSuccess && availabilityQuery.isLoading);
  const failedQuery = query.isError ? query : needsAvailability && availabilityQuery.isError ? availabilityQuery : null;
  const emptyMessage =
    activeFilter === "openNow"
      ? "Nenhuma caverna com aula acontecendo agora."
      : activeFilter === "classesToday"
        ? "Nenhuma caverna com aula hoje."
        : "Nenhuma caverna encontrada.";

  return (
    <ScreenLayout bottomNav={<BottomNavbar />}>
      <View style={[globalStyles.container, styles.content]}>
        <View style={styles.header}>
          <Text style={styles.greeting} accessibilityRole="header">
            Cavernas
          </Text>
          <Text style={styles.greetingSub}>
            Encontre a caverna mais próxima de você
          </Text>
        </View>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar caverna..."
          icon={magnifierCaverna}
          width="full"
          onClear={() => setSearch("")}
        />
        {!profileQuery.isPending ? (
          <View style={localStyles.origin}>
            <Text style={localStyles.originLabel}>
              Distâncias a partir de {useSaved ? (hasSavedAddress ? "seu endereço salvo" : "sua localização do perfil") : location ? "sua localização do dispositivo" : "localização não disponível"}
            </Text>
            {hasSavedAddress && location ? (
              <View style={localStyles.originChoices}>
                {([
                  { key: "saved", label: "Endereço salvo" },
                  { key: "device", label: "Localização do dispositivo" },
                ] as const).map(({ key, label }) => (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={`Usar ${label.toLowerCase()}`}
                    accessibilityState={{ selected: originMode === key }}
                    onPress={() => setOriginMode(key)}
                    style={[localStyles.originButton, originMode === key && localStyles.originSelected]}
                  >
                    <Text style={[localStyles.originText, originMode === key && localStyles.originTextSelected]}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            {filters.map((filter) => {
              const selected = activeFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Filtrar por ${filter.label}`}
                  onPress={() => setActiveFilter(filter.key)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                    pressed && styles.filterChipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selected && styles.filterChipTextSelected,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        {isLoading ? (
          <LoadingSpinner label="Buscando cavernas…" />
        ) : failedQuery ? (
          <View style={localStyles.feedback}>
            <Text style={styles.nearbyTitle} accessibilityRole="alert">
              {query.isError
                ? "Não foi possível carregar as cavernas"
                : "Não foi possível consultar as aulas de hoje"}
            </Text>
            <Text style={styles.emptyText}>
              {getErrorMessage(normalizeApiError(failedQuery.error))}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tentar carregar as cavernas novamente"
              style={styles.retryButton}
              onPress={() => void failedQuery.refetch()}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={caves}
            keyExtractor={(cave) => cave.id}
            contentContainerStyle={localStyles.list}
            renderItem={({ item }: { item: Cave }) => {
              const distanceKm = getCaveDistanceKm(
                item,
                hasCoordinates
                  ? {
                      latitude: latitude as number,
                      longitude: longitude as number,
                    }
                  : undefined,
              );
              const distanceTag =
                distanceKm !== undefined
                  ? formatDistanceKm(distanceKm)
                  : "— km";
              const firstUnit = activeUnits(item)[0];
              return (
                <CardComponent
                  image={caveImage}
                  title={item.name}
                  tags={caveTags(distanceTag, availability?.[item.id])}
                  subtitle={
                    firstUnit?.neighborhood ??
                    firstUnit?.name ??
                    "Unidade sem endereço"
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/cavernas/[cavernaId]/aulas",
                      params: { cavernaId: item.id, cavernaTitle: item.name },
                    })
                  }
                />
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            }
          />
        )}
      </View>
    </ScreenLayout>
  );
}
