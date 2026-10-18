import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";

import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import CardComponent from "@/components/complex/card-component";
import { SearchInput } from "@/components/customized/search-input/search-input";
import { listCaves, type Cave } from "@/api/services/caves.service";
import { caveImage, magnifierCaverna } from "@/assets/images";
import { useAppStore } from "@/store/useAppStore";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";
import { formatDistanceKm } from "@/utils/distance";

export default function Cavernas() {
  const [search, setSearch] = useState("");
  const location = useAppStore((state) => state.user.location);
  const query = useQuery({
    queryKey: ["caves", search, location?.coords.latitude, location?.coords.longitude],
    queryFn: () =>
      listCaves(
        search,
        location?.coords.latitude,
        location?.coords.longitude,
      ),
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
        {query.isLoading ? <LoadingSpinner label="Buscando cavernas…" /> : query.isError ? (
          <Text style={styles.emptyText}>Não foi possível carregar as cavernas.</Text>
        ) : (
          <FlatList
            data={query.data ?? []}
            keyExtractor={(cave) => cave.id}
            contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
            renderItem={({ item }: { item: Cave }) => (
              <CardComponent
                image={caveImage}
                title={item.name}
                tags={item.distanceKm !== undefined ? [formatDistanceKm(item.distanceKm)] : []}
                subtitle={item.units[0]?.neighborhood ?? item.units[0]?.name ?? "Unidade sem endereço"}
                onPress={() => undefined}
              />
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma caverna encontrada.</Text>}
          />
        )}
      </View>
    </ScreenLayout>
  );
}
