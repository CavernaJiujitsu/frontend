import { useEffect, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { useErrorStore } from "@/store/useErrorStore";
import { errorToastStyles as styles } from "./styles/error-toast.styles";

/**
 * Popup global de erro. Montado uma vez no `_layout`, acima do `Stack`.
 * Invisível até `useErrorStore.show()` ser chamado pela tela que capturou
 * o erro — some sozinho após o `durationMs` (padrão 5s) ou no X.
 */
export function ErrorToast() {
  const visible = useErrorStore((state) => state.visible);
  const message = useErrorStore((state) => state.message);
  const hide = useErrorStore((state) => state.hide);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(16));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 16,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, visible]);

  if (!visible || !message) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <View
        style={styles.card}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <Text style={styles.text}>{message}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso de erro"
          onPress={hide}
          style={styles.closeHitArea}
        >
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
