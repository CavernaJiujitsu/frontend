import { useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { queryClient } from "@/api/bootstrap/query-client";
import { deleteMyProfilePhoto, replaceMyProfilePhoto, type MyProfile, type ProfilePhotoFile } from "@/api/services/profile.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { BrandColors, Colors } from "@/constants/theme";
import { API_URL } from "@/constants/api";

type Props = { photoUrl?: string | null; practitionerId: string | null };

export function ProfilePhoto({ photoUrl, practitionerId }: Props) {
  const [panel, setPanel] = useState<"menu" | "update" | "view" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const uri = photoUrl ? new URL(photoUrl, API_URL).href : null;
  const close = () => { if (!locked.current) { setPanel(null); setError(null); } };

  async function changePhoto(source: "camera" | "file" | "remove") {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      let updatedPhoto: string | null = null;
      if (source === "remove") {
        await deleteMyProfilePhoto();
      } else {
        let file: ProfilePhotoFile;
        let size: number | undefined;
        if (source === "camera") {
          if (Platform.OS !== "web") {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) throw new Error("Permita o acesso à câmera nas configurações para tirar sua foto.");
          }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
          if (result.canceled || !result.assets[0]) return;
          const asset = result.assets[0];
          size = asset.fileSize;
          file = { uri: asset.uri, name: asset.fileName ?? "perfil.jpg", mimeType: asset.mimeType ?? "image/jpeg", file: asset.file };
        } else {
          const result = await DocumentPicker.getDocumentAsync({ type: ["image/jpeg", "image/png"], copyToCacheDirectory: true });
          if (result.canceled || !result.assets[0]) return;
          const asset = result.assets[0];
          size = asset.size;
          file = { uri: asset.uri, name: asset.name, mimeType: asset.mimeType, file: asset.file };
        }
        if (size && size > 5 * 1024 * 1024) throw new Error("A foto deve ter no máximo 5 MB.");
        if (file.mimeType && !["image/jpeg", "image/png"].includes(file.mimeType)) throw new Error("Escolha uma imagem JPG ou PNG.");
        updatedPhoto = (await replaceMyProfilePhoto(file)).photoUrl ?? null;
      }
      queryClient.setQueryData<MyProfile>(["profile-me", practitionerId], (current) => current ? { ...current, photoUrl: updatedPhoto } : current);
      await queryClient.invalidateQueries({ queryKey: ["profile-me", practitionerId] });
      setPanel(null);
    } catch (cause) {
      setError(backendMessage(cause, "Não foi possível atualizar a foto. Tente novamente."));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Opções da foto do perfil" onPress={() => setPanel("menu")}>
      <Image source={uri ? { uri } : require("../../assets/images/student-preview/avatar.svg")} style={styles.avatar} contentFit="cover" accessibilityLabel="Foto do perfil" />
    </Pressable>
    <Modal visible={panel !== null} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fechar opções da foto" accessibilityRole="button" />
        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title} accessibilityRole="header">{panel === "view" ? "Foto do perfil" : panel === "update" ? "Atualizar foto" : "Foto do perfil"}</Text>
          {panel === "view" ? uri ? <Image source={{ uri }} style={styles.preview} contentFit="contain" accessibilityLabel="Foto do perfil ampliada" /> : <Text style={styles.text}>Você ainda não tem uma foto de perfil.</Text> : null}
          {panel === "menu" ? <>
            <DefaultButton label="Ver foto" color={BrandColors.primary} action={() => setPanel("view")} disabled={busy} />
            <DefaultButton label="Atualizar" color={BrandColors.primary} action={() => setPanel("update")} disabled={busy} />
            {uri ? <DefaultButton label="Remover foto" color={BrandColors.primary} action={() => void changePhoto("remove")} disabled={busy} /> : null}
          </> : null}
          {panel === "update" ? <>
            <Text style={styles.text}>Envie uma imagem JPG ou PNG de até 5 MB.</Text>
            <DefaultButton label="Tirar foto" color={BrandColors.primary} action={() => void changePhoto("camera")} disabled={busy} />
            <DefaultButton label="Escolher arquivo" color={BrandColors.primary} action={() => void changePhoto("file")} disabled={busy} />
          </> : null}
          {busy ? <Text style={styles.text} accessibilityLiveRegion="polite">Atualizando foto…</Text> : null}
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <DefaultButton label="Fechar" color={BrandColors.primary} action={close} disabled={busy} />
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  avatar: { width: 80, height: 80, borderRadius: 40 },
  overlay: { flex: 1, backgroundColor: `${BrandColors.background}E6`, justifyContent: "center", alignItems: "center", padding: 24 },
  card: { width: "100%", maxWidth: 420, padding: 20, gap: 12, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  title: { color: Colors.dark.text, fontSize: 20, fontWeight: "700" },
  text: { color: Colors.dark.textSecondary },
  error: { color: BrandColors.danger },
  preview: { width: "100%", height: 260 },
});
