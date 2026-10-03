import { useEffect, useState } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";

import { loadingPaw, loadingRing } from "@/assets/images";
import {
  DEFAULT_SPINNER_SIZE,
  loadingSpinnerStyles as styles,
} from "./styles/loading-spinner.styles";

type LoadingSpinnerProps = {
  label?: string;
  size?: number;
};

const FULL_TURN = "360deg";

export function LoadingSpinner({
  label,
  size = DEFAULT_SPINNER_SIZE,
}: LoadingSpinnerProps) {
  const [rotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", FULL_TURN],
  });
  const pawSize = Math.round(size * 0.58);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? "Carregando"}
    >
      <View style={[styles.artwork, { width: size, height: size }]}>
        <Animated.Image
          source={loadingRing}
          style={[styles.ring, { width: size, height: size, transform: [{ rotate }] }]}
          resizeMode="contain"
        />
        <Image
          source={loadingPaw}
          style={{ width: pawSize, height: pawSize }}
          resizeMode="contain"
        />
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}
