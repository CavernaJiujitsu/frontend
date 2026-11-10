import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { queryClient } from "@/api/bootstrap/query-client";
import { getCave, listUnitsPage } from "@/api/services/caves.service";
import { setPractitionerOrigin } from "@/api/services/practitioners.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { SearchInput } from "@/components/customized/search-input/search-input";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { originUnitStyles as styles } from "@/styles/onboarding/origin-unit.styles";
import { magnifierCaverna } from "@/assets/images";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function OriginUnit() {
  const params = useLocalSearchParams<{ cavernaId?: string | string[] }>();
  const caveId = Array.isArray(params.cavernaId)
    ? params.cavernaId[0]
    : params.cavernaId;
  const validCave = typeof caveId === "string" && UUID.test(caveId);
  const { practitionerId, accessToken } = useAppStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const locked = useRef(false);
  const active = useRef(true);
  const currentCave = useRef(caveId);
  useEffect(() => {
    active.current = true;
    currentCave.current = caveId;
    return () => {
      active.current = false;
    };
  }, [caveId]);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const cave = useQuery({
    queryKey: ["origin-cave", caveId],
    queryFn: () => getCave(caveId!),
    enabled: validCave,
  });
  const units = useQuery({
    queryKey: ["origin-units", caveId, debouncedSearch, page],
    queryFn: ({ signal }) =>
      listUnitsPage(
        caveId!,
        { page, limit: 20, search: debouncedSearch || undefined },
        signal,
      ),
    enabled: validCave,
  });
  const save = useMutation({
    mutationFn: (variables: {
      id: string;
      caveId: string;
      caveUnitId: string;
    }) =>
      setPractitionerOrigin(variables.id, {
        caveId: variables.caveId,
        caveUnitId: variables.caveUnitId,
      }),
  });
  const selected = units.data?.data.find((unit) => unit.id === selectedId);
  const isSearching = search.trim() !== debouncedSearch;

  async function confirm() {
    if (
      locked.current ||
      !selected ||
      !practitionerId ||
      !accessToken ||
      !validCave ||
      units.isFetching ||
      isSearching
    )
      return;
    locked.current = true;
    const requestToken = accessToken;
    try {
      const origin = await save.mutateAsync({
        id: practitionerId,
        caveId: caveId!,
        caveUnitId: selected.id,
      });
      if (
        !active.current ||
        currentCave.current !== caveId ||
        useAppStore.getState().user.accessToken !== requestToken ||
        !origin
      )
        return;
      await queryClient.invalidateQueries({
        queryKey: ["practitioner-origin", practitionerId],
      });
      if (
        !active.current ||
        currentCave.current !== caveId ||
        useAppStore.getState().user.accessToken !== requestToken
      )
        return;
      router.push({
        pathname: "/onboarding/select-belt",
        params: { cavernaId: origin.caveId, cavernaTitle: origin.caveName },
      });
    } catch {
      // The mutation retains the error so the selection can be retried.
    } finally {
      locked.current = false;
    }
  }

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Escolha sua unidade de origem
          </Text>
          <Text style={styles.body}>{cave.data?.name ?? "Sua caverna"}</Text>
          <Text style={styles.body}>
            Esta será sua unidade de referência. Você continua livre para
            treinar em outras unidades.
          </Text>
        </View>
        {!practitionerId || !accessToken ? (
          <>
            <Text style={styles.body}>
              Entre na sua conta para confirmar a origem.
            </Text>
            <DefaultButton
              label="Entrar"
              color={BrandColors.primary}
              action={() => router.replace("/onboarding/login")}
            />
          </>
        ) : !validCave ? (
          <Text style={styles.error} accessibilityRole="alert">
            Caverna inválida. Volte e escolha uma caverna disponível.
          </Text>
        ) : (
          <>
            <SearchInput
              value={search}
              editable={!save.isPending}
              icon={magnifierCaverna}
              placeholder="Buscar unidade..."
              onChangeText={(value) => {
                if (locked.current) return;
                setSearch(value);
                setPage(1);
                setSelectedId(null);
                save.reset();
              }}
            />
            {cave.isError || units.isError ? (
              <>
                <Text style={styles.error} accessibilityRole="alert">
                  Não foi possível carregar as unidades.
                </Text>
                <DefaultButton
                  label="Tentar novamente"
                  color={BrandColors.primary}
                  action={() => {
                    void cave.refetch();
                    void units.refetch();
                  }}
                />
              </>
            ) : units.isPending || cave.isPending || isSearching ? (
              <LoadingSpinner label="Carregando unidades..." />
            ) : (
              <>
                <FlatList
                  data={units.data?.data ?? []}
                  keyExtractor={(unit) => unit.id}
                  contentContainerStyle={styles.list}
                  renderItem={({ item }) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: selectedId === item.id,
                        disabled: save.isPending,
                      }}
                      disabled={save.isPending}
                      accessibilityLabel={`Selecionar unidade ${item.name}`}
                      onPress={() => {
                        setSelectedId(item.id);
                        save.reset();
                      }}
                      style={[
                        styles.unit,
                        selectedId === item.id && styles.selected,
                      ]}
                    >
                      <Text style={styles.unitName}>{item.name}</Text>
                      <Text style={styles.body}>
                        {[item.address, item.neighborhood]
                          .filter(Boolean)
                          .join(" • ") || "Endereço não informado"}
                      </Text>
                      {selectedId === item.id ? (
                        <Text style={styles.selection}>Selecionada</Text>
                      ) : null}
                    </Pressable>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.body}>
                      Nenhuma unidade encontrada. Tente outra busca ou escolha
                      outra caverna.
                    </Text>
                  }
                />
                {(units.data?._meta.totalPage ?? 0) > 1 ? (
                  <View style={styles.pagination}>
                    <Text style={styles.body}>
                      Página {page} de {units.data?._meta.totalPage}
                    </Text>
                    <View style={styles.pageActions}>
                      <View style={styles.pageAction}>
                        <DefaultButton
                          label="Anterior"
                          color={BrandColors.primary}
                          disabled={
                            page <= 1 || save.isPending || units.isFetching
                          }
                          action={() => {
                            if (locked.current) return;
                            setPage((p) => p - 1);
                            setSelectedId(null);
                          }}
                        />
                      </View>
                      <View style={styles.pageAction}>
                        <DefaultButton
                          label="Próxima"
                          color={BrandColors.primary}
                          disabled={
                            !units.data?._links.next ||
                            save.isPending ||
                            units.isFetching
                          }
                          action={() => {
                            if (locked.current) return;
                            setPage((p) => p + 1);
                            setSelectedId(null);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}
              </>
            )}
            {save.isError ? (
              <Text style={styles.error} accessibilityRole="alert">
                {backendMessage(
                  save.error,
                  "Não foi possível confirmar a origem. Tente novamente.",
                )}
              </Text>
            ) : null}
            <DefaultButton
              label={
                save.isPending
                  ? "Confirmando..."
                  : "Confirmar unidade de origem"
              }
              color={BrandColors.secondary}
              disabled={
                !selected ||
                save.isPending ||
                units.isFetching ||
                units.isError ||
                cave.isError ||
                isSearching
              }
              action={() => void confirm()}
            />
          </>
        )}
        <DefaultButton
          label="Escolher outra caverna"
          color={BrandColors.primary}
          disabled={save.isPending}
          action={() => router.replace("/onboarding/nearby-gym")}
        />
      </View>
    </ScreenLayout>
  );
}
