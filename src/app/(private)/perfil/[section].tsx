import { Redirect, useLocalSearchParams } from "expo-router";

import { ProfileScreen } from "@/features/profile/profile-screen";

export default function ProfileSection() {
  const { section } = useLocalSearchParams<{ section: string }>();
  if (section !== "dados" && section !== "certificados" && section !== "configuracoes") {
    return <Redirect href="/perfil" />;
  }
  return <ProfileScreen section={section} />;
}
