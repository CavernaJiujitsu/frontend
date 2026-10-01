import { useEffect, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { magnifierCaverna } from "@/assets/images";
import { fetchNearbyGyms, type NearbyGymMock } from "@/api/mocks/nearby-gym";
import CardComponent from "@/components/complex/card-component";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { SearchInput } from "@/components/customized/search-input/search-input";
import { useAppStore } from "@/store/useAppStore";
import { isLoadingKey, useLoadingStore } from "@/store/useLoadingStore";
import { globalStyles } from "@/styles/global.styles";
import { nearbyGymStyles as styles } from "@/styles/onboarding/nearby-gym.styles";

const SEARCH_DEBOUNCE_MS = 350;

// TODO: substituir o mock pelo service de nearby usando a localização do
// cliente (useAppStore user.location.coords + basicOperationsService.getPaginated).
// Contrato do back ainda indefinido. location === null (fluxo "pular") = busca manual.
export default function NearByGym() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [gyms, setGyms] = useState<NearbyGymMock[]>([]);
  const isLoading = useLoadingStore(isLoadingKey("nearby-gyms"));
  const requestRef = useRef(0);
  const location = useAppStore((state) => state.user.location);
  void location;

  useEffect(() => {
    const timer = setTimeout(() => {
      const requestId = ++requestRef.current;
      const store = useLoadingStore.getState();
      store.show("nearby-gyms");
      void fetchNearbyGyms(search)
        .then((result) => {
          if (requestRef.current === requestId) setGyms(result);
        })
        .finally(() => store.hide("nearby-gyms"));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

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
                  pathname: "/onboarding/schedule",
                  params: { cavernaId: item.id, cavernaTitle: item.title },
                })
              }
            />
          )}
        />
        )}
      </View>
    </SafeAreaView>
  );
}
