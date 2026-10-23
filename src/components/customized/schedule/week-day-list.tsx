import { FlatList, Pressable, Text } from "react-native";

import { Spacing } from "@/constants/theme";
import type { ScheduleDay } from "@/types/schedule";
import { weekDayListStyles as styles } from "./styles/week-day-list.styles";

export type WeekDayListProps = {
  days: ScheduleDay[];
  selectedDayId: string;
  onSelectDay: (day: ScheduleDay) => void;
  testID?: string;
};

export function WeekDayList({
  days,
  selectedDayId,
  onSelectDay,
  testID,
}: WeekDayListProps) {
  return (
    <FlatList
      key={days[0]?.id}
      data={days}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      initialScrollIndex={Math.max(
        0,
        days.findIndex((day) => day.id === selectedDayId),
      )}
      getItemLayout={(_, index) => ({
        length: styles.day.width + Spacing.two,
        offset: (styles.day.width + Spacing.two) * index,
        index,
      })}
      style={styles.list}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => {
        const isSelected = item.id === selectedDayId;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Selecionar dia ${item.day} ${item.weekday}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectDay(item)}
            style={({ pressed }) => [
              styles.day,
              isSelected && styles.daySelected,
              pressed && styles.dayPressed,
            ]}
          >
            <Text
              style={[styles.weekday, isSelected && styles.weekdaySelected]}
            >
              {item.weekday}
            </Text>
            <Text style={[styles.date, isSelected && styles.dateSelected]}>
              {item.day}
            </Text>
          </Pressable>
        );
      }}
      testID={testID}
    />
  );
}
