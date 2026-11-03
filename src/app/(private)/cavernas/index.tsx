import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import CardComponent from "@/components/complex/card-component";
import { SearchInput } from "@/components/customized/search-input/search-input";
import { listCaves, listUnits, type Cave } from "@/api/services/caves.service";
import { getPractitioner } from "@/api/services/practitioners.service";
import { caveImage, magnifierCaverna } from "@/assets/images";
import { useAppStore } from "@/store/useAppStore";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";
import { formatDistanceKm, haversineKm } from "@/utils/distance";

type CaveFilter = "nearest" | "openNow" | "classesToday";

const filters: { key: CaveFilter; label: string }[] = [
  { key: "nearest", label: "Mais próximas" },
  { key: "openNow", label: "Abertas agora" },
  { key: "classesToday", label: "Aulas hoje" },
];

function getCaveDistanceKm(
  cave: Cave,
  origin?: { latitude: number; longitude: number },
): number | undefined {
  if (cave.distanceKm !== undefined) return cave.distanceKm;
  if (!origin || cave.units.length === 0) return undefined;

  const distances = cave.units.map((unit) =>
    haversineKm(origin, {
      latitude: Number(unit.latitude),
      longitude: Number(unit.longitude),
    }),
  ).filter(Number.isFinite);
  return distances.length > 0 ? Math.min(...distances) : undefined;
}

export default function Cavernas() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<CaveFilter>("nearest");
  const location = useAppStore((state) => state.user.location);
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const profileQuery = useQuery({
    queryKey: ["practitioner-location", practitionerId],
    queryFn: () => getPractitioner(practitionerId!),
    enabled: !location && Boolean(practitionerId),
  });
  const profileLatitude = profileQuery.data?.latitude;
  const profileLongitude = profileQuery.data?.longitude;
  const latitude =
    location?.coords.latitude ??
    (profileLatitude !== null && profileLatitude !== undefined
      ? Number(profileLatitude)
      : undefined);
  const longitude =
    location?.coords.longitude ??
    (profileLongitude !== null && profileLongitude !== undefined
      ? Number(profileLongitude)
      : undefined);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const query = useQuery({
    queryKey: [
      "caves",
      search,
      activeFilter,
      latitude,
      longitude,
    ],
    queryFn: async () => {
      const caves = await listCaves(
        search,
        hasCoordinates ? latitude : undefined,
        hasCoordinates ? longitude : undefined,
      );
      if (activeFilter === "nearest") return caves;

      const filtered = await Promise.all(
        caves.map(async (cave) => {
          const units = await listUnits(cave.id, {
            openNow: activeFilter === "openNow",
            classesToday: activeFilter === "classesToday",
          });
          return units.length > 0 ? { ...cave, units } : null;
        }),
      );
      return filtered.filter((cave): cave is Cave => cave !== null);
    },
  });
  useReportQueryError(query.error);

  return (
    <ScreenLayout bottomNav={<BottomNavbar />}>
      <View style={[globalStyles.container, styles.content]}>
        <View style={styles.header}>
          <Text style={styles.greeting} accessibilityRole="header">
            Cavernas
          </Text>
          <Text style={styles.greetingSub}>Encontre a caverna mais próxima de você</Text>
        </View>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar caverna..."
          icon={magnifierCaverna}
          width="full"
          onClear={() => setSearch("")}
        />
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
        {query.isLoading ? <LoadingSpinner label="Buscando cavernas…" /> : query.isError ? (
          <Text style={styles.emptyText}>Não foi possível carregar as cavernas.</Text>
        ) : (
          <FlatList
            data={query.data ?? []}
            keyExtractor={(cave) => cave.id}
            contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
            renderItem={({ item }: { item: Cave }) => {
              const distanceKm = getCaveDistanceKm(
                item,
                hasCoordinates
                  ? { latitude: latitude as number, longitude: longitude as number }
                  : undefined,
              );
              const distanceTag =
                distanceKm !== undefined ? formatDistanceKm(distanceKm) : "— km";
              return (
                <CardComponent
                  image={caveImage}
                  title={item.name}
                  tags={[
                    distanceTag,
                    ...(activeFilter === "openNow" ? ["Aberta agora"] : []),
                    ...(activeFilter === "classesToday" ? ["Aulas hoje"] : []),
                  ]}
                  subtitle={item.units[0]?.neighborhood ?? item.units[0]?.name ?? "Unidade sem endereço"}
                  onPress={() => router.push({ pathname: "/cavernas/[cavernaId]/aulas", params: { cavernaId: item.id, cavernaTitle: item.name } } as unknown as Href)}
                />
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma caverna encontrada.</Text>}
          />
        )}
      </View>
    </ScreenLayout>
  );
}
