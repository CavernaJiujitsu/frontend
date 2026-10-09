import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { inicioMock } from "@/api/mocks/inicio";
import { globalStyles } from "@/styles/global.styles";
import { inicioStyles as styles } from "@/styles/private/inicio.styles";
import { InicioScreen } from "@/components/customized/inicio/inicio-screen";

export default function Inicio() {
  const router = useRouter();
  const data = inicioMock;

  function handleSeeAllBelts() {
    router.push("/trilha");
  }

  function handleConfirmClass() {
    Alert.alert("Presença confirmada", "Nos vemos na próxima aula. Oss!");
  }

  function handleSeeAllNearby() {
    router.push("/cavernas");
  }

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={[globalStyles.container, styles.content]}>
        <InicioScreen
          userName={data.userName}
          belt={data.belt}
          nextClass={data.nextClass}
          nearby={data.nearby}
          onSeeAllBelts={handleSeeAllBelts}
          onConfirmClass={handleConfirmClass}
          onSeeAllNearby={handleSeeAllNearby}
        />
      </View>
    </SafeAreaView>
  );
}
