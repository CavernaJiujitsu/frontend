import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BOTTOM_NAVBAR_BASE_HEIGHT } from "@/components/bottom-navbar/bottom-navbar";
import { CheckinFab } from "@/components/customized/checkin-fab/checkin-fab";
import { useHomeSummary } from "@/hooks/use-home-summary";
import { notify } from "@/utils/dialogs";

export function CheckinShortcut() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const home = useHomeSummary();

  if (pathname.startsWith("/entrada/")) return null;

  const openCheckin = () => {
    if (home.isPending) {
      notify("Carregando próxima aula", "Aguarde um instante e tente novamente.");
      return;
    }
    if (home.isError) {
      notify("Não foi possível carregar sua aula", "Verifique a conexão e tente novamente.", "error");
      return;
    }
    const nextClass = home.data.nextClass;
    if (!nextClass) {
      notify("Nenhuma aula agendada", "Reserve uma aula em Cavernas para receber seu código de entrada.");
      return;
    }
    router.push({
      pathname: "/entrada/[classId]",
      params: { classId: nextClass.classId, enrollmentId: nextClass.enrollmentId },
    });
  };

  return (
    <CheckinFab
      onPress={openCheckin}
      label="Check-in"
      accessibilityLabel="Abrir check-in da próxima aula"
      style={{ bottom: insets.bottom + BOTTOM_NAVBAR_BASE_HEIGHT + 16 }}
    />
  );
}
