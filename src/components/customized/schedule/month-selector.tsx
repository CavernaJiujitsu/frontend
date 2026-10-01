import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

import { globalStyles } from "@/styles/global.styles";
import type { ScheduleMonth } from "@/types/schedule";
import { monthSelectorStyles as styles } from "./styles/month-selector.styles";

export type MonthSelectorProps = {
  months: ScheduleMonth[];
  selectedMonthIndex: number;
  onSelectMonth: (month: ScheduleMonth) => void;
  testID?: string;
};

export function MonthSelector({
  months,
  selectedMonthIndex,
  onSelectMonth,
  testID,
}: MonthSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected =
    months.find((month) => month.index === selectedMonthIndex) ?? months[0];

  const handleSelect = (month: ScheduleMonth) => {
    setOpen(false);
    onSelectMonth(month);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Selecionar mês, mês atual ${selected?.label ?? ""}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
        ]}
        testID={testID}
      >
        <Text style={styles.triggerLabel}>{selected?.label}</Text>
        <Text style={styles.chevron}>{open ? "▴" : "▾"}</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção de mês"
            onPress={() => setOpen(false)}
            style={styles.backdropLayer}
          />
          <View style={[globalStyles.card, styles.sheetLayout]}>
            <FlatList
              data={months}
              keyExtractor={(item) => `${item.year}-${item.index}`}
              contentContainerStyle={styles.optionsContent}
              renderItem={({ item }) => {
                const isSelected = item.index === selectedMonthIndex;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar mês ${item.label}`}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleSelect(item)}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
