import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { queryClient } from "@/api/bootstrap/query-client";
import { deleteClass, listClassesPage, type BackendClass } from "@/api/services/classes.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { SmallButton, StatusBadge, TeacherPage, ui } from "@/components/teacher/teacher-ui";
import { BrandColors } from "@/constants/theme";
import { teacherKeys } from "@/hooks/use-teacher-data";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { classTypeLabel, formatClassWhen, startOfToday } from "@/utils/date-time";
import { confirmAction, notify } from "@/utils/dialogs";

const PAGE_SIZE = 10;

export default function TeacherClasses() {
  const router = useRouter();
  const teacherId = useAppStore((state) => state.user.teacherId);

  const query = useInfiniteQuery({
    queryKey: [...teacherKeys.classes, "paged", teacherId],
    queryFn: ({ pageParam }) =>
      listClassesPage({
        teacherId: teacherId!,
        from: startOfToday().toISOString(),
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last._meta.page < last._meta.totalPage ? last._meta.page + 1 : undefined,
    enabled: Boolean(teacherId),
  });
  const classes = query.data?.pages.flatMap((page) => page.data) ?? [];

  const deleteMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.classes });
      notify("Aula excluída");
    },
    onError: (error) =>
      notify("Não foi possível excluir", backendMessage(error, "Tente novamente.")),
  });

  const handleDelete = (item: BackendClass) =>
    confirmAction(
      "Excluir aula?",
      `${formatClassWhen(item.startsAt, item.endsAt)} — esta ação não pode ser desfeita.`,
      () => deleteMutation.mutate(item.id),
      "Excluir",
    );

  return (
    <TeacherPage title="Minhas aulas" subtitle="Aulas a partir de hoje">
      <DefaultButton
        label="+ Criar aula"
        color={BrandColors.secondary}
        action={() => router.push("/professor/aulas/criar")}
      />

      {query.isLoading ? (
        <LoadingSpinner label="Carregando aulas…" />
      ) : query.isError ? (
        <View style={s.card}>
          <Text style={s.title}>Não foi possível carregar suas aulas</Text>
          <Text style={s.body}>{backendMessage(query.error, "Tente novamente.")}</Text>
          <SmallButton label="Tentar novamente" onPress={() => void query.refetch()} />
        </View>
      ) : classes.length === 0 ? (
        <View style={s.card}>
          <Text style={s.body}>Nenhuma aula agendada a partir de hoje.</Text>
        </View>
      ) : (
        classes.map((item) => {
          const belts = (item.belts ?? []).map((b) => b.belt?.name).filter(Boolean);
          return (
            <View key={item.id} style={s.card}>
              <View style={ui.between}>
                <Text style={[s.title, { flex: 1 }]}>
                  {formatClassWhen(item.startsAt, item.endsAt)}
                </Text>
                <StatusBadge
                  label={classTypeLabel(item.type)}
                  tone={item.type === "SCHEDULED" ? "neutral" : "warning"}
                />
              </View>
              <Text style={s.body}>
                {item.caveUnit?.cave?.name ? `${item.caveUnit.cave.name} • ` : ""}
                {item.caveUnit?.name ?? "Unidade"} • {item.capacity} vagas
              </Text>
              <Text style={s.body}>Faixas: {belts.length ? belts.join(", ") : "Todas"}</Text>
              <View style={ui.row}>
                <SmallButton
                  label="Chamada"
                  variant="primary"
                  onPress={() =>
                    router.push({
                      pathname: "/professor/aulas/[classId]/chamada",
                      params: { classId: item.id },
                    })
                  }
                />
                <SmallButton
                  label="Editar"
                  onPress={() =>
                    router.push({
                      pathname: "/professor/aulas/[classId]/editar",
                      params: { classId: item.id },
                    })
                  }
                />
                <SmallButton
                  label="Excluir"
                  variant="danger"
                  disabled={deleteMutation.isPending}
                  onPress={() => handleDelete(item)}
                />
              </View>
            </View>
          );
        })
      )}

      {query.hasNextPage ? (
        <SmallButton
          label={query.isFetchingNextPage ? "Carregando…" : "Carregar mais"}
          disabled={query.isFetchingNextPage}
          onPress={() => void query.fetchNextPage()}
        />
      ) : null}
    </TeacherPage>
  );
}
