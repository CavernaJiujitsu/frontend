import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { queryClient } from "@/api/bootstrap/query-client";
import { cancelClassEnrollment } from "@/api/services/classes.service";
import { getHomeSummary } from "@/api/services/home.service";
import { getMyProfile } from "@/api/services/profile.service";
import { backendMessage } from "@/api/utils/backend-message";
import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors, Spacing } from "@/constants/theme";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";

const AVATAR_COLORS = ["#2E7CF6", "#8A4DFF", "#00E5C9"];

const cardStyles = StyleSheet.create({
  card: { width: "100%" },
  pressed: { opacity: 0.85 },
  contentGap: { gap: Spacing.two },
});

export default function Inicio() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.user.accessToken);
  const location = useAppStore((state) => state.user.location);
  const profileQuery = useQuery({
    queryKey: ["profile-me"],
    queryFn: getMyProfile,
    enabled: Boolean(accessToken),
  });
  useReportQueryError(profileQuery.error);
  const belt = profileQuery.data?.activeBelt;
  const homeQuery = useQuery({
    queryKey: [
      "home-summary",
      location?.coords.latitude,
      location?.coords.longitude,
    ],
    queryFn: () =>
      getHomeSummary({
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      }),
    enabled: Boolean(accessToken),
  });
  useReportQueryError(homeQuery.error);

  const home = homeQuery.data;
  const currentClass = home?.nextClass;
  const enrollmentMutation = useMutation({
    mutationFn: ({ classId, enrollmentId }: { classId: string; enrollmentId: string }) =>
      cancelClassEnrollment(classId, enrollmentId),
    onSuccess: async () => {
      await Promise.all([
        homeQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["profile-me"] }),
      ]);
      Alert.alert("Inscrição cancelada", "A vaga foi liberada.");
    },
    onError: (error: unknown) => Alert.alert("Não foi possível concluir", backendMessage(error, "A inscrição não está mais disponível.")),
  });
  const userName =
    home?.practitioner.fullName.split(" ")[0] ?? profileQuery.data?.name ?? "Aluno";
  const nextClass = home?.nextClass
    ? {
        weekday: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
          .format(new Date(home.nextClass.startsAt))
          .replace(".", ""),
        time: new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(home.nextClass.startsAt)),
        tag: home.nextClass.caveUnit.caveName,
        teacherName: home.nextClass.teacher.name,
      }
    : null;
  const nearby = home?.nearbyCaves.data.length
    ? {
        count: home.nearbyCaves._meta.total,
        radiusKm: home.nearbyCaves._meta.radiusKm,
        avatars: home.nearbyCaves.data
          .slice(0, 3)
          .map((cave, index) => ({ id: cave.id, color: AVATAR_COLORS[index] })),
        extraCount: Math.max(home.nearbyCaves._meta.total - 3, 0),
        closest: {
          name: home.nearbyCaves.data[0].caveName,
          neighborhood:
            home.nearbyCaves.data[0].neighborhood ??
            home.nearbyCaves.data[0].address ??
            home.nearbyCaves.data[0].name,
          distanceKm: home.nearbyCaves.data[0].distanceKm,
        },
      }
    : null;

  return (
    <ScreenLayout bottomNav={<BottomNavbar />}>
      <View style={[globalStyles.container, styles.content]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.greeting} accessibilityRole="header">
              Olá, {userName} 👋
            </Text>
            <Text style={styles.greetingSub}>
              Continue evoluindo na sua trilha
            </Text>
          </View>

          <View
            accessibilityLabel={belt ? belt.name : "Avaliação de faixa pendente"}
            style={[globalStyles.card, cardStyles.card]}
          >
            <View style={cardStyles.contentGap}>
              <View style={styles.beltRow}>
                <View style={[styles.beltDot, { backgroundColor: belt?.color ?? BrandColors.border }]} />
                <View>
                  <Text style={styles.beltName}>{belt?.name ?? "Avaliação pendente"}</Text>
                  <Text style={styles.beltProgressText}>Acompanhe sua evolução na trilha</Text>
                </View>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver todas as faixas"
            onPress={() => router.replace("/trilha")}
            hitSlop={10}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>Ver todas as faixas →</Text>
          </Pressable>

          <View style={[globalStyles.card, cardStyles.card]}>
            <View style={cardStyles.contentGap}>
              <Text style={styles.eyebrow}>PRÓXIMA AULA</Text>
              {homeQuery.isLoading ? (
                <LoadingSpinner
                  label="Carregando informações da sua próxima aula…"
                  size={44}
                />
              ) : nextClass && currentClass ? (
                <>
                  <View style={styles.nextClassRow}>
                    <Text style={styles.nextClassTime}>
                      {nextClass.weekday} • {nextClass.time}
                    </Text>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{nextClass.tag}</Text>
                    </View>
                  </View>
                  <View style={styles.nextClassFooter}>
                    <Text style={styles.teacher}>
                      Prof. {nextClass.teacherName}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Cancelar inscrição da próxima aula"
                      disabled={enrollmentMutation.isPending}
                      style={({ pressed }) => [styles.confirmBtn, pressed && styles.confirmBtnPressed]}
                      onPress={() => enrollmentMutation.mutate({ classId: currentClass.classId, enrollmentId: currentClass.enrollmentId })}
                    >
                      <Text style={styles.confirmBtnText}>Cancelar</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>
                  Você ainda não tem aula agendada. Escolha uma caverna e
                  reserve seu horário.
                </Text>
              )}
            </View>
          </View>

          {homeQuery.isLoading ? (
            <View
              style={[globalStyles.card, cardStyles.card, styles.feedbackCard]}
            >
              <LoadingSpinner label="Buscando cavernas próximas…" size={44} />
            </View>
          ) : homeQuery.isError ? (
            <View
              style={[globalStyles.card, cardStyles.card, styles.feedbackCard]}
            >
              <Text style={styles.nearbyTitle}>
                Não foi possível carregar o início
              </Text>
              <Text style={styles.emptyText}>
                Verifique sua conexão e tente novamente.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tentar carregar informações novamente"
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && cardStyles.pressed,
                ]}
                onPress={() => homeQuery.refetch()}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : nearby ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Cavernas mais próximas, ${nearby.count} cavernas em até ${nearby.radiusKm} km. Mais próxima: ${nearby.closest.name}`}
              onPress={() => router.push("/cavernas")}
              style={({ pressed }) => [
                globalStyles.card,
                cardStyles.card,
                pressed && cardStyles.pressed,
              ]}
            >
              <View style={cardStyles.contentGap}>
                <View style={styles.nearbyHeader}>
                  <Svg width={28} height={28} viewBox="0 0 100 100">
                    <Path
                      d="M50 12 C33 12 20 26 20 43 C20 66 50 92 50 92 C50 92 80 66 80 43 C80 26 67 12 50 12 Z"
                      fill="none"
                      stroke={BrandColors.secondary}
                      strokeWidth={7}
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M38 46 C38 36 43 31 50 31 C57 31 62 36 62 46 L62 51 L38 51 Z"
                      fill={BrandColors.secondary}
                    />
                  </Svg>
                  <View style={styles.nearbyHeaderText}>
                    <Text style={styles.nearbyTitle}>
                      Cavernas mais próximas
                    </Text>
                    <Text style={styles.nearbySub}>
                      {nearby.count} cavernas em até {nearby.radiusKm} km
                    </Text>
                  </View>
                </View>
                <View style={styles.avatarRow}>
                  {nearby.avatars.map((avatar, index) => (
                    <View
                      key={avatar.id}
                      style={[
                        styles.avatar,
                        { backgroundColor: avatar.color },
                        index > 0 && styles.avatarOverlap,
                      ]}
                    />
                  ))}
                  {nearby.extraCount > 0 ? (
                    <View
                      style={[
                        styles.avatar,
                        styles.avatarOverlap,
                        styles.avatarExtra,
                      ]}
                    >
                      <Text style={styles.avatarExtraText}>
                        +{nearby.extraCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.closestName}>{nearby.closest.name}</Text>
                <View style={styles.closestFooter}>
                  <Text style={styles.closestMeta} numberOfLines={1}>
                    {nearby.closest.neighborhood} • {nearby.closest.distanceKm}{" "}
                    km
                  </Text>
                  <Text style={styles.link}>Ver todas →</Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <View style={[globalStyles.card, cardStyles.card]}>
              <Text style={styles.nearbyTitle}>Cavernas mais próximas</Text>
              <Text style={styles.emptyText}>
                Não encontramos cavernas próximas da sua localização.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}
