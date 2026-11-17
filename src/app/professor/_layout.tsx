import { Stack } from "expo-router";

import { RoleGuard } from "@/components/auth/role-guard";
import { BrandColors } from "@/constants/theme";

// Teacher area. Each screen renders its own TeacherNavbar through
// `TeacherPage`, mirroring the student area (`StudentPage` + BottomNavbar).
export default function TeacherLayout() {
  return (
    <RoleGuard role="TEACHER">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: BrandColors.background },
        }}
      />
    </RoleGuard>
  );
}
