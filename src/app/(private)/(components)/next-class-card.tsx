import { Pressable, Text, View } from "react-native";

import { InicioCard } from "@/components/customized/inicio-card/inicio-card";
import type { InicioNextClass } from "@/types/inicio";
import { inicioStyles } from "@/styles/private/inicio.styles";

type NextClassCardProps = {
  nextClass: InicioNextClass | null;
  onConfirmClass: () => void;
};

export function NextClassCard({ nextClass, onConfirmClass }: NextClassCardProps) {
  return (
    <InicioCard>
      <Text style={inicioStyles.eyebrow}>PRÓXIMA AULA</Text>

      {nextClass ? (
        <>
          <View style={inicioStyles.nextClassRow}>
            <Text style={inicioStyles.nextClassTime}>
              {nextClass.weekday} • {nextClass.time}
            </Text>
            <View style={inicioStyles.tag}>
              <Text style={inicioStyles.tagText}>{nextClass.tag}</Text>
            </View>
          </View>

          <View style={inicioStyles.nextClassFooter}>
            <Text style={inicioStyles.teacher}>Prof. {nextClass.teacherName}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirmar presença na próxima aula"
              style={({ pressed }) => [
                inicioStyles.confirmBtn,
                pressed && inicioStyles.confirmBtnPressed,
              ]}
              onPress={onConfirmClass}
            >
              <Text style={inicioStyles.confirmBtnText}>Confirmar</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Text style={inicioStyles.emptyText}>
          Você ainda não tem aula agendada. Escolha uma caverna e reserve seu horário.
        </Text>
      )}
    </InicioCard>
  );
}
