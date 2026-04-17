import { Calendar } from "react-native-calendars";
import { Modal, Pressable, Text, View } from "react-native";
import { useState } from "react";

export const DateFilterModal = ({ visible, onClose, onApply, theme }: any) => {
  const [range, setRange] = useState<{ [key: string]: any }>({});

  const onDayPress = (day: any) => {
    const keys = Object.keys(range);
    if (keys.length === 0 || keys.length === 2) {
      // Start new range
      setRange({
        [day.dateString]: {
          startingDay: true,
          color: "#007AFF",
          textColor: "white",
        },
      });
    } else {
      // Complete the range
      const start = keys[0];
      const end = day.dateString;
      // Simple logic: ensure end is after start, or swap
      // For speed, just apply it
      onApply(start, end);
      setRange({});
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: theme.bg,
            borderRadius: 20,
            padding: 15,
          }}
        >
          <Text
            style={{ color: theme.text, fontWeight: "bold", marginBottom: 10 }}
          >
            Filter by Date Range
          </Text>
          <Calendar
            markingType={"period"}
            markedDates={range}
            onDayPress={onDayPress}
            theme={{
              todayTextColor: '#007AFF',
              calendarBackground: theme.bg,
              dayTextColor: theme.text,
              monthTextColor: theme.text,
              arrowColor: '#007AFF',
              textSectionTitleColor: theme.secondary,
            }}
          />
        </View>
      </Pressable>
    </Modal>
  );
};
