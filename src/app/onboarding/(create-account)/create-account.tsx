import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createPractitioner } from "@/api/services/practitioners.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { FormField } from "@/components/customized/form-field/form-field";
import { BrandColors } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { styles } from "@/styles/onboarding/create-account.styles";

export type CriarContaPayload = {
  nome: string;
  email: string;
  senha: string;
};

type FieldErrors = Partial<Record<"nome" | "email" | "senha", string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function validate(nome: string, email: string, senha: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!nome.trim()) {
    errors.nome = "Informe seu nome completo.";
  }

  if (!email.trim()) {
    errors.email = "Informe seu e-mail.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "E-mail inválido.";
  }

  if (!senha) {
    errors.senha = "Informe uma senha.";
  } else if (!SENHA_REGEX.test(senha)) {
    errors.senha = "Mínimo de 8 caracteres, com letras e números.";
  }

  return errors;
}

export default function CreateAccountScreen() {
  const router = useRouter();
  const setProfile = useAppStore((state) => state.setProfile);
  const setPractitionerId = useAppStore((state) => state.setPractitionerId);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const fieldErrors = validate(nome, email, senha);
    setErrors(fieldErrors);
    setSubmitError(null);

    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const practitioner = await createPractitioner({
        user: { name: nome.trim(), email: email.trim(), password: senha },
      });
      setProfile({ nome: nome.trim(), email: email.trim() });
      setPractitionerId(practitioner.id);
      router.replace("/onboarding/location-permission");
    } catch (err) {
      setSubmitError(
        backendMessage(
          err,
          "Não foi possível criar sua conta. Tente novamente.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.replace("/onboarding/start");
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <KeyboardAvoidingView
        style={globalStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Criar conta
            </Text>
            <Text style={styles.subtitle}>
              Vamos começar sua jornada na Caverna
            </Text>
          </View>

          <FormField
            label="NOME COMPLETO"
            placeholder="Seu nome"
            value={nome}
            onChangeText={setNome}
            error={errors.nome}
            autoCapitalize="words"
          />

          <FormField
            label="E-MAIL"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            label="SENHA"
            placeholder="••••••••"
            value={senha}
            onChangeText={setSenha}
            error={errors.senha}
            secureTextEntry={!showSenha}
            rightAction={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showSenha ? "Ocultar senha" : "Mostrar senha"
                }
                onPress={() => setShowSenha((v) => !v)}
                hitSlop={10}
              >
                <Text style={styles.eyeToggle}>
                  {showSenha ? "Ocultar" : "Mostrar"}
                </Text>
              </Pressable>
            }
          />

          {!errors.senha && (
            <Text style={styles.hint}>
              Mínimo de 8 caracteres, com letras e números.
            </Text>
          )}

          {submitError && <Text style={styles.submitError}>{submitError}</Text>}

          <View style={styles.actions}>
            <DefaultButton
              label={loading ? "Criando conta..." : "Criar conta"}
              color={BrandColors.secondary}
              action={handleSubmit}
              disabled={loading}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Já tem conta? Entrar"
              onPress={handleGoToLogin}
              disabled={loading}
              style={styles.loginPressable}
            >
              <Text style={styles.loginText}>
                Já tem conta? <Text style={styles.loginLink}>Entrar</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
