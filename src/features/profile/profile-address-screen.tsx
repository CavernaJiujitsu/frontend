import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { searchAddresses, updatePractitioner, type AddressResult } from "@/api/services/practitioners.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors } from "@/constants/theme";
import { studentKeys } from "@/hooks/query-keys";
import { useAppStore } from "@/store/useAppStore";
import { profileAddressStyles as a } from "@/styles/private/profile-address.styles";
import { notify } from "@/utils/dialogs";

export function ProfileAddressScreen() {
  const navigation = useRouter();
  const queryClient = useQueryClient();
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AddressResult | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const search = useMutation({
    mutationFn: (term: string) => searchAddresses(term),
    onError: (error: unknown) => notify("Busca indisponível", backendMessage(error, "Tente novamente mais tarde."), "error"),
  });
  const save = useMutation({
    mutationFn: () => updatePractitioner(practitionerId!, selected!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.practitioner(practitionerId) });
      notify("Endereço atualizado", "Sua localização foi salva.", "success");
    },
    onError: (error: unknown) => notify("Não foi possível salvar", backendMessage(error, "Tente novamente."), "error"),
  });

  async function requestCurrentLocation() {
    if (locating) return;
    setLocating(true);
    setLocationError("");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationError("Permita o acesso à localização para usar sua posição atual.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let address = `Localização atual (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`;
      if (Platform.OS !== "web") {
        try {
          const [place] = await Location.reverseGeocodeAsync(coords);
          if (place) {
            const parts = [place.street, place.streetNumber, place.district, place.city, place.region].filter(Boolean);
            if (parts.length) address = parts.join(", ");
          }
        } catch {
          // Keep the coordinates usable when reverse geocoding is unavailable.
        }
      }
      setQuery(address);
      setSelected({ address, latitude: coords.latitude, longitude: coords.longitude });
      search.reset();
    } catch {
      setLocationError("Não foi possível obter sua localização. Busque um endereço ou tente novamente.");
    } finally {
      setLocating(false);
    }
  }

  const results = search.data ?? [];
  const options = selected && !results.some((item) => item.address === selected.address) ? [selected, ...results] : results;
  const canSearch = query.trim().length >= 5 && !search.isPending;

  return (
    <ScreenLayout>
      <View style={a.page}>
        <ScrollView contentContainerStyle={a.scroll} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar às configurações" onPress={() => navigation.replace("/perfil/configuracoes")} style={a.back}>
            <Text style={a.backArrow}>‹</Text>
          </Pressable>
          <View style={a.header}>
            <Text accessibilityRole="header" style={a.title}>Endereço</Text>
            <Text style={a.subtitle}>Usamos para encontrar as cavernas mais próximas</Text>
          </View>
          <View style={a.map} accessible accessibilityLabel="Ilustração de mapa com marcador de localização">
            {[0, 1, 2].map((row) => <View key={row} style={a.mapRow}>
              {[0, 1, 2, 3, 4].map((column) => <View key={column} style={a.mapBlock} />)}
            </View>)}
            <View style={a.mapRoad} />
            <View style={a.mapHalo}><View style={a.pin}><View style={a.pinCenter} /></View></View>
          </View>
          <View style={a.searchBox}>
            <Pressable accessibilityRole="button" accessibilityLabel="Buscar endereço" disabled={!canSearch} onPress={() => { setSelected(null); search.mutate(query.trim()); }} style={a.searchIcon}>
              <Text style={a.searchIconText}>⌕</Text>
            </Pressable>
            <TextInput
              accessibilityLabel="Endereço para busca"
              value={query}
              onChangeText={(value) => { setQuery(value); setSelected(null); search.reset(); }}
              onSubmitEditing={() => { if (canSearch) { setSelected(null); search.mutate(query.trim()); } }}
              returnKeyType="search"
              autoCorrect={false}
              placeholder="Rua, número, cidade e estado"
              placeholderTextColor={a.placeholder.color}
              style={a.searchInput}
            />
            {query ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => { setQuery(""); setSelected(null); search.reset(); }} style={a.clear}><Text style={a.clearText}>×</Text></Pressable> : null}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Usar minha localização atual" accessibilityState={{ disabled: locating }} disabled={locating} onPress={() => void requestCurrentLocation()} style={a.locationButton}>
            <Text style={a.locationIcon}>⌖</Text>
            <Text style={a.locationText}>{locating ? "Obtendo localização…" : "Usar minha localização atual"}</Text>
          </Pressable>
          {locationError ? <Text accessibilityRole="alert" style={a.error}>{locationError}</Text> : null}
          <View style={a.sectionHeader}>
            <Text style={a.eyebrow}>ESCOLHA UM ENDEREÇO</Text>
            <Text style={a.hint}>Toque para confirmar a localização correta.</Text>
          </View>
          {search.isPending ? <Text style={a.hint}>Buscando endereços…</Text> : null}
          {search.isSuccess && !options.length ? <Text style={a.hint}>Nenhum endereço encontrado. Confira os dados e tente novamente.</Text> : null}
          <View style={a.list}>
            {options.map((result, index) => {
              const active = selected?.address === result.address && selected.latitude === result.latitude && selected.longitude === result.longitude;
              const [title, ...details] = result.address.split(", ");
              return (
                <Pressable
                  key={`${result.address}-${result.latitude}-${result.longitude}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={result.address}
                  accessibilityState={{ selected: active }}
                  onPress={() => setSelected(result)}
                  style={({ pressed }) => [a.option, active && a.optionSelected, pressed && a.pressed]}
                >
                  <View style={[a.radio, active && a.radioSelected]}>{active ? <View style={a.radioDot} /> : null}</View>
                  <View style={a.optionCopy}>
                    <Text style={a.optionText}>{title}</Text>
                    {details.length ? <Text style={a.optionDetail}>{details.join(", ")}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        <View style={a.footer}>
          <DefaultButton
            label={save.isPending ? "Confirmando…" : "Confirmar endereço"}
            color={BrandColors.secondary}
            textColor={BrandColors.background}
            disabled={!selected || save.isPending || !practitionerId}
            action={() => save.mutate()}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}
