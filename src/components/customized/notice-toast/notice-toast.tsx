import { useEffect, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { useNoticeStore } from "@/store/useNoticeStore";
import { noticeToastStyles as styles, toneColors } from "./notice-toast.styles";

export function NoticeToast() {
  const notice = useNoticeStore((state) => state.notice);
  const hide = useNoticeStore((state) => state.hide);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-12));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: notice ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: notice ? 0 : -12,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [notice, opacity, translateY]);

  if (!notice) return null;

  const color = toneColors[notice.tone];
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}
    >
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion={notice.tone === "error" ? "assertive" : "polite"}
        style={[styles.card, { borderLeftColor: color }]}
      >
        <View style={[styles.icon, { backgroundColor: color }]}>
          <Text style={styles.iconText}>{notice.tone === "success" ? "✓" : "!"}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{notice.title}</Text>
          {notice.message ? <Text style={styles.message}>{notice.message}</Text> : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
          hitSlop={8}
          onPress={hide}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
