import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

import { getClass } from "@/api/services/classes.service";
import { backendMessage } from "@/api/utils/backend-message";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { ClassForm } from "@/components/teacher/class-form";
import { TeacherPage } from "@/components/teacher/teacher-ui";
import { studentStyles as s } from "@/styles/private/student-preview.styles";

export default function EditClassScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const query = useQuery({
    queryKey: ["class", classId],
    queryFn: () => getClass(classId),
    enabled: Boolean(classId),
  });

  return (
    <TeacherPage title="Editar aula" subtitle="Altere tipo, horário, vagas e faixas" showBack>
      {query.isLoading ? (
        <LoadingSpinner label="Carregando aula…" />
      ) : query.data ? (
        // Remount the form when the class changes so its initial state is fresh.
        <ClassForm key={query.data.id} existing={query.data} />
      ) : (
        <Text style={s.body}>
          {backendMessage(query.error, "Não foi possível carregar a aula.")}
        </Text>
      )}
    </TeacherPage>
  );
}
