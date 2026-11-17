import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { cancelClassEnrollment } from "@/api/services/classes.service";
import { getMyProfile } from "@/api/services/profile.service";
import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BeltColors, BrandColors, Spacing } from "@/constants/theme";
import { studentKeys } from "@/hooks/query-keys";
import { useHomeSummary } from "@/hooks/use-home-summary";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";
import { confirmAction, notify, notifyError } from "@/utils/dialogs";
import { enrollmentStatusLabel } from "@/utils/schedule";

const AVATAR_COLORS = [BeltColors.blue, BeltColors.purple, BrandColors.borderSecondary];

// The API only cancels enrollments that are still pending (or in progress).
const CANCELLABLE_STATUSES = new Set(["PENDING", "IN_PROGRESS"]);

const cardStyles = StyleSheet.create({
  card: { width: "100%" },
  pressed: { opacity: 0.85 },
  contentGap: { gap: Spacing.two },
});

export default function Inicio() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.user.accessToken);
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const profileQuery = useQuery({
    queryKey: studentKeys.profile(practitionerId),
    queryFn: getMyProfile,
    enabled: Boolean(accessToken && practitionerId),
  });
  useReportQueryError(profileQuery.error);
  const belt = profileQuery.data?.activeBelt;
  const homeQuery = useHomeSummary();
  useReportQueryError(homeQuery.error);

  const home = homeQuery.data;
  const currentClass = home?.nextClass;
  const enrollmentMutation = useMutation({
    mutationFn: ({ classId, enrollmentId }: { classId: string; enrollmentId: string }) =>
      cancelClassEnrollment(classId, enrollmentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentKeys.homeAll(practitionerId) }),
        queryClient.invalidateQueries({ queryKey: studentKeys.profile(practitionerId) }),
      ]);
      notify("Inscrição cancelada", "A vaga foi liberada.");
    },
    onError: (error: unknown) => notifyError("Não foi possível cancelar", error),
  });
  const handleCancel = (classId: string, enrollmentId: string) => {
    if (enrollmentMutation.isPending) return;
    confirmAction(
      "Cancelar inscrição?",
      "A vaga desta aula será liberada.",
      () => enrollmentMutation.mutate({ classId, enrollmentId }),
      "Cancelar inscrição",
    );
  };
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
        teacherName: home.nextClass.teacher?.name,
        statusLabel: enrollmentStatusLabel(home.nextClass.enrollmentStatus),
        canCancel: CANCELLABLE_STATUSES.has(home.nextClass.enrollmentStatus),
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

          {profileQuery.isLoading ? (
            <View style={[globalStyles.card, cardStyles.card, styles.feedbackCard]}>
              <LoadingSpinner label="Carregando sua faixa…" size={44} />
            </View>
          ) : profileQuery.isError ? (
            // A failed load must not look like "no belt yet".
            <View style={[globalStyles.card, cardStyles.card, styles.feedbackCard]}>
              <Text style={styles.nearbyTitle} accessibilityRole="alert">
                Não foi possível carregar sua faixa
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tentar carregar sua faixa novamente"
                style={({ pressed }) => [styles.retryButton, pressed && cardStyles.pressed]}
                onPress={() => void profileQuery.refetch()}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
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
          )}

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
              ) : homeQuery.isError ? (
                // Error state of its own: a failed load is not "no class booked".
                <>
                  <Text style={styles.emptyText} accessibilityRole="alert">
                    Não foi possível carregar sua próxima aula.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Tentar carregar sua próxima aula novamente"
                    style={({ pressed }) => [styles.retryButton, pressed && cardStyles.pressed]}
                    onPress={() => void homeQuery.refetch()}
                  >
                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                  </Pressable>
                </>
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
                  {nextClass.statusLabel ? (
                    <Text style={styles.beltProgressText}>{nextClass.statusLabel}</Text>
                  ) : null}
                  <View style={styles.nextClassFooter}>
                    <Text style={styles.teacher}>
                      {nextClass.teacherName ? `Prof. ${nextClass.teacherName}` : "Professor não informado"}
                    </Text>
                    {nextClass.canCancel ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cancelar inscrição da próxima aula"
                        accessibilityState={{ disabled: enrollmentMutation.isPending }}
                        disabled={enrollmentMutation.isPending}
                        style={({ pressed }) => [styles.confirmBtn, pressed && styles.confirmBtnPressed]}
                        onPress={() => handleCancel(currentClass.classId, currentClass.enrollmentId)}
                      >
                        <Text style={styles.confirmBtnText}>
                          {enrollmentMutation.isPending ? "Cancelando…" : "Cancelar"}
                        </Text>
                      </Pressable>
                    ) : null}
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
              <Text style={styles.nearbyTitle} accessibilityRole="alert">
                Não foi possível carregar as cavernas próximas
              </Text>
              <Text style={styles.emptyText}>
                Verifique sua conexão e tente novamente.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tentar carregar as cavernas próximas novamente"
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
