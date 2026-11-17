import { Text, View } from "react-native";

import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { TeacherPage } from "@/components/teacher/teacher-ui";
import { BrandColors } from "@/constants/theme";
import { useCurrentTeacher } from "@/hooks/use-teacher-data";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { enterMode, logout } from "@/utils/session";

export default function TeacherProfile() {
  const query = useCurrentTeacher();
  const isStudent = useAppStore((state) => state.user.roles.includes("STUDENT"));
  const teacher = query.data;

  return (
    <TeacherPage title="Perfil" subtitle="Seus dados de professor">
      {query.isLoading ? (
        <LoadingSpinner label="Carregando perfil…" />
      ) : teacher ? (
        <>
          <View style={s.card}>
            <Text style={s.title}>{teacher.name}</Text>
            <Text style={s.body}>{teacher.email}</Text>
          </View>
          <View style={s.card}>
            <Text style={s.title}>Unidades vinculadas</Text>
            {teacher.caveUnits.length === 0 ? (
              <Text style={s.body}>Nenhuma unidade vinculada.</Text>
            ) : (
              teacher.caveUnits.map((unit) => (
                <Text key={unit.id} style={s.body}>
                  {unit.caveName} • {unit.name}
                </Text>
              ))
            )}
          </View>
        </>
      ) : (
        <Text style={s.body}>{backendMessage(query.error, "Não foi possível carregar o perfil.")}</Text>
      )}
      {isStudent ? (
        <DefaultButton
          label="Entrar como aluno"
          color={BrandColors.secondary}
          action={() => enterMode("student")}
        />
      ) : null}
      <DefaultButton label="Sair da conta" color={BrandColors.primary} action={logout} />
    </TeacherPage>
  );
}
