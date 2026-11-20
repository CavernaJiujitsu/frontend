import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { getEntryCode } from "@/api/services/entries.service";
import { DefaultButton } from "@/components/customized/default-button";
import { EntryCodeDisplay } from "@/components/entry-code/entry-code";
import { StudentPage } from "@/components/student-preview/preview-kit";
import { BrandColors, Colors, Spacing } from "@/constants/theme";
import { useHomeSummary } from "@/hooks/use-home-summary";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";

const styles = StyleSheet.create({
  eyebrow: { color: BrandColors.borderSecondary, fontSize: 12, fontWeight: "700" },
  cave: { borderWidth: 1, borderColor: BrandColors.secondary },
  heading: { color: Colors.light.text, fontSize: 18, fontWeight: "700" },
  codeCard: { alignItems: "center", paddingVertical: Spacing.four, gap: Spacing.three },
  centered: { textAlign: "center" },
});

export default function Entrada() {
  const router = useRouter();
  const { classId, enrollmentId } = useLocalSearchParams<{ classId: string; enrollmentId: string }>();
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const home = useHomeSummary();
  const nextClass = home.data?.nextClass;
  const selectedClass = nextClass?.classId === classId && nextClass.enrollmentId === enrollmentId
    ? nextClass
    : null;
  const query = useQuery({
    queryKey: ["entry-code", practitionerId, classId, enrollmentId],
    queryFn: () => getEntryCode(classId, enrollmentId),
    enabled: Boolean(practitionerId && classId && enrollmentId),
    retry: false,
    staleTime: 0,
  });
  return (
    <StudentPage title="Realizar Check-in" subtitle="Entrada na academia · presença confirmada separadamente">
      {selectedClass ? (
        <>
          <View style={[s.card, styles.cave]}>
            <Text style={styles.eyebrow}>CAVERNA DA AULA</Text>
            <Text style={styles.heading}>{selectedClass.caveUnit.caveName} · {selectedClass.caveUnit.name}</Text>
            <Text style={s.body}>{selectedClass.caveUnit.address ?? selectedClass.caveUnit.neighborhood ?? "Endereço não informado"}</Text>
          </View>
          <View style={s.card}>
            <Text style={styles.eyebrow}>AULA AGENDADA</Text>
            <Text style={s.title}>{selectedClass.classType === "VALIDATION" ? "Validação de faixa" : selectedClass.classType === "EXAM" ? "Exame de faixa" : "Aula de Jiu-Jitsu"}</Text>
            <Text style={s.body}>
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(new Date(selectedClass.startsAt))}
              {" · "}{selectedClass.teacher?.name ? `Prof. ${selectedClass.teacher.name}` : "Professor não informado"}
            </Text>
          </View>
        </>
      ) : null}
      <View style={[s.card, styles.codeCard]}>
        {query.isPending ? <Text style={s.body}>{classId && enrollmentId ? "Carregando código…" : "Abra o check-in por uma aula agendada."}</Text> : query.isError ? (
          <>
            <Text style={s.title} accessibilityRole="alert">Código indisponível</Text>
            <Text style={s.body}>Confira a inscrição e tente novamente. O código é válido somente no dia da aula.</Text>
            <DefaultButton label="Tentar novamente" color={BrandColors.secondary} action={() => void query.refetch()} />
          </>
        ) : query.data.used ? (
          <Text style={[s.title, styles.centered]}>Entrada já liberada. O professor confirma sua presença separadamente.</Text>
        ) : (
          <>
            <Text style={[s.title, styles.centered]}>Apresente na recepção para liberar sua entrada</Text>
            <Text style={[s.body, styles.centered]}>O administrador da caverna confere o código no dia da aula. A presença na aula é confirmada separadamente.</Text>
            <EntryCodeDisplay code={query.data.code} />
          </>
        )}
      </View>
      <DefaultButton label="Voltar ao início" color={BrandColors.secondary} action={() => router.replace("/inicio")} />
    </StudentPage>
  );
}
