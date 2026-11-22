import { ClassForm } from "@/components/teacher/class-form";
import { TeacherPage } from "@/components/teacher/teacher-ui";

export default function CreateClassScreen() {
  return (
    <TeacherPage title="Criar aula" subtitle="Defina unidade, tipo, horário e vagas" showBack>
      <ClassForm />
    </TeacherPage>
  );
}
