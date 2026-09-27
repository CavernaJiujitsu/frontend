/* eslint-disable react-hooks/refs */
import React, { useRef, useState } from "react";
import { Image, PanResponder, Pressable, Text, View } from "react-native";

import { globalStyles } from "@/styles/global.styles";
import { styles } from "./styles/multi-card-carousel.styles";

export type CardCarousel = {
  id: number;
  image: string | number;
  title: string;
  subtitle: string;
};

export type MultiCardCarouselProps<T = void, U = void> = {
  cards: CardCarousel[];
  secondaryBtn: {
    action: (index: U) => void;
    label: string;
  };
  primaryBtn: {
    action: () => void;
    label: string;
  };
};

const SWIPE_THRESHOLD = 50;

export function MultiCardCarousel<T = void, U = void>({
  cards,
  primaryBtn,
  secondaryBtn,
}: MultiCardCarouselProps<T, U>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastCard = activeIndex === cards.length - 1;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -SWIPE_THRESHOLD) {
          setActiveIndex((current) => Math.min(current + 1, cards.length - 1));
        } else if (gesture.dx > SWIPE_THRESHOLD) {
          setActiveIndex((current) => Math.max(current - 1, 0));
        }
      },
    }),
  ).current;

  return (
    <View style={globalStyles.container}>
      <View style={styles.content} {...panResponder.panHandlers}>
        {cards.map(
          (card, index) =>
            index === activeIndex && (
              <React.Fragment key={index}>
                <View key={card.id} style={styles.card}>
                  <Image
                    source={card.image as number}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title}>{card.title}</Text>
                <Text style={styles.description}>{card.subtitle}</Text>
              </React.Fragment>
            ),
        )}
      </View>

      <View style={styles.dots}>
        {cards.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        {!isLastCard && (
          <Pressable
            onPress={primaryBtn.action}
            disabled={isLastCard}
            style={{
              display: isLastCard ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={styles.skipText}>{primaryBtn.label}</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.nextButton, isLastCard && { width: "100%" }]}
          onPress={() => {
            setActiveIndex((current) => (current + 1) % cards.length);
            secondaryBtn.action(activeIndex as U);
          }}
        >
          <Text style={styles.nextButtonText}>{secondaryBtn.label}</Text>
        </Pressable>
      </View>
    </View>
  );
}
