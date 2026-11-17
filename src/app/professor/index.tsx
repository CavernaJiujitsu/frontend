import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { SmallButton, StatusBadge, TeacherPage, ui } from "@/components/teacher/teacher-ui";
import { BrandColors } from "@/constants/theme";
import {
  useCurrentTeacher,
  usePendingValidations,
  useScheduledValidations,
  useUpcomingTeacherClasses,
} from "@/hooks/use-teacher-data";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { classTypeLabel, formatClassWhen } from "@/utils/date-time";

export default function TeacherDashboard() {
  const router = useRouter();
  const teacherQuery = useCurrentTeacher();
  const classesQuery = useUpcomingTeacherClasses(5);
  const pendingQuery = usePendingValidations();
  const scheduledQuery = useScheduledValidations();

  const firstName = teacherQuery.data?.name.split(" ")[0];
  const classes = classesQuery.data ?? [];
  const today = new Date().toDateString();

  const counters = [
    { label: "Aguardando agendamento", value: pendingQuery.data?.length },
    { label: "Agendadas nas suas aulas", value: scheduledQuery.data?.length },
  ];

  return (
    <TeacherPage
      title={firstName ? `Olá, ${firstName}` : "Olá, professor"}
      subtitle="Suas aulas e validações de faixa"
    >
      <View style={s.stats}>
        {counters.map((counter) => (
          <View key={counter.label} style={s.stat}>
            <Text style={s.value}>{counter.value ?? "—"}</Text>
            <Text style={s.body}>{counter.label}</Text>
          </View>
        ))}
      </View>
      <DefaultButton
        label="Ver validações de faixa"
        color={BrandColors.primary}
        action={() => router.replace("/professor/validacoes")}
      />

      <View style={s.card}>
        <View style={ui.between}>
          <Text style={s.title}>Próximas aulas</Text>
          <SmallButton
            label="+ Criar aula"
            variant="primary"
            onPress={() => router.push("/professor/aulas/criar")}
          />
        </View>
        {classesQuery.isLoading ? (
          <LoadingSpinner label="Carregando aulas…" size={40} />
        ) : classesQuery.isError ? (
          <Text style={s.body}>
            {backendMessage(classesQuery.error, "Não foi possível carregar suas aulas.")}
          </Text>
        ) : classes.length === 0 ? (
          <Text style={s.body}>Nenhuma aula agendada a partir de hoje.</Text>
        ) : (
          classes.map((item) => (
            <View key={item.id} style={{ gap: 6 }}>
              <View style={ui.divider} />
              <View style={ui.between}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={ui.row}>
                    <Text style={s.title}>{formatClassWhen(item.startsAt, item.endsAt)}</Text>
                    {new Date(item.startsAt).toDateString() === today ? (
                      <StatusBadge label="Hoje" tone="warning" />
                    ) : null}
                  </View>
                  <Text style={s.body}>
                    {classTypeLabel(item.type)} • {item.caveUnit?.name ?? "Unidade"}
                  </Text>
                </View>
                <SmallButton
                  label="Chamada"
                  onPress={() =>
                    router.push({
                      pathname: "/professor/aulas/[classId]/chamada",
                      params: { classId: item.id },
                    })
                  }
                />
              </View>
            </View>
          ))
        )}
        <SmallButton label="Ver todas as aulas" onPress={() => router.replace("/professor/aulas")} />
      </View>
    </TeacherPage>
  );
}
