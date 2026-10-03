import { useEffect, useState } from "react";
import { Animated, Easing, Image, View, useWindowDimensions } from "react-native";

import { loadingPaw } from "@/assets/images";
import {
  SKELETON_ROWS,
  classSkeletonStyles as styles,
} from "./styles/class-skeleton.styles";

const PAW_THUMB = 44;

export function ClassSkeleton({ rows = SKELETON_ROWS }: { rows?: number }) {
  const { width: windowWidth } = useWindowDimensions();
  const [sweep] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const translateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, windowWidth],
  });

  return (
    <View
      style={styles.block}
      accessibilityRole="progressbar"
      accessibilityLabel="Buscando aulas"
    >
      {Array.from({ length: rows }, (_, index) => (
        <View key={`skeleton-row-${index}`} style={styles.row}>
          <View style={styles.bars}>
            <View style={[styles.bar, styles.titleBar]} />
            <View style={[styles.bar, styles.subtitleBar]} />
          </View>
          <Image
            source={loadingPaw}
            style={[styles.paw, { width: PAW_THUMB, height: PAW_THUMB }]}
            resizeMode="contain"
          />
          <Animated.View style={[styles.sweep, { transform: [{ translateX }] }]} />
        </View>
      ))}
    </View>
  );
}
