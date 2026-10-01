import { useMemo, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { magnifierCaverna } from "@/assets/images";
import { nearbyGymMocks } from "@/api/mocks/nearby-gym";
import CardComponent from "@/components/complex/card-component";
import { SearchInput } from "@/components/customized/search-input/search-input";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { nearbyGymStyles as styles } from "@/styles/onboarding/nearby-gym.styles";

// TODO: substituir o mock pelo service de nearby usando a localização do
// cliente (useAppStore user.location.coords + basicOperationsService.getPaginated).
// Contrato do back ainda indefinido. location === null (fluxo "pular") = busca manual.
// TODO: navegar para o detalhe da caverna no onPress dos cards.
export default function NearByGym() {
  const [search, setSearch] = useState("");
  const location = useAppStore((state) => state.user.location);
  void location;

  const filteredGyms = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length === 0) return nearbyGymMocks;
    return nearbyGymMocks.filter((gym) =>
      gym.title.toLowerCase().includes(term),
    );
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

        <FlatList
          data={filteredGyms}
          keyExtractor={(gym) => gym.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <CardComponent
              image={item.image}
              title={item.title}
              tags={item.tags}
              subtitle={item.subtitle}
              onPress={() =>
                Alert.alert(item.title, "Action do card chamada corretamente.")
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
