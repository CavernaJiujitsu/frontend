import { Pressable, Text, View } from "react-native";

import { globalStyles } from "@/styles/global.styles";
import type { ClassItem } from "@/types/schedule";
import { classCardStyles as styles } from "./styles/class-card.styles";

export type ClassCardProps = {
  classItem: ClassItem;
  onPress: (classItem: ClassItem) => void;
  testID?: string;
};

export function ClassCard({ classItem, onPress, testID }: ClassCardProps) {
  const { startTime, endTime, professor, enrolled, capacity, tags } = classItem;
  const isEnrolled = classItem.isEnrolled === true;
  const isFull = enrolled >= capacity;
  const isDisabled = isFull || isEnrolled;
  const actionLabel = isEnrolled ? "Inscrito" : isFull ? "Lotado" : "Inscrever";

  return (
    <View
      testID={testID}
      style={[
        globalStyles.card,
        styles.cardLayout,
        isDisabled && styles.cardDisabled,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{startTime}</Text>
          <Text style={styles.separator}> — </Text>
          <Text style={styles.time}>{endTime}</Text>
        </View>

        <View style={styles.tags}>
          {tags.map((tag) => (
            <View
              key={tag.label}
              style={[
                styles.tag,
                tag.variant === "highlight" && styles.tagHighlight,
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  tag.variant === "highlight" && styles.tagTextHighlight,
                ]}
              >
                {tag.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.professor}>Prof. {professor}</Text>

      <View style={styles.footer}>
        <Text style={styles.capacity}>
          {enrolled}/{capacity} vagas
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} na aula das ${startTime} com ${professor}`}
          accessibilityState={{ disabled: isDisabled }}
          disabled={isDisabled}
          onPress={() => onPress(classItem)}
          style={({ pressed }) => [
            styles.enrollButton,
            isEnrolled && styles.enrollButtonEnrolled,
            isDisabled && styles.enrollButtonDisabled,
            pressed && !isDisabled && styles.enrollButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.enrollLabel,
              isEnrolled && styles.enrollLabelEnrolled,
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
