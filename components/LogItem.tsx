import { Alert, Text, TouchableOpacity } from "react-native";
import { Themes } from "../constants/theme";

type LogItemType = {
  deleteLog: (id: number) => void;
  theme: (typeof Themes)["light"];
  item: any;
};

export default function LogItem({ deleteLog, theme, item }: LogItemType) {
  return (
    <TouchableOpacity
      onLongPress={() => {
        Alert.alert(
          "Delete Log",
          "Are you sure you want to remove this entry?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteLog(item.id),
            },
          ],
        );
      }}
      delayLongPress={500}
      activeOpacity={0.7}
      style={{ padding: 15, borderBottomWidth: 0.5, borderColor: theme.border }}
    >
      <Text style={{ color: theme.secondary, fontSize: 12 }}>
        {new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text style={{ fontSize: 16, marginTop: 4, color: theme.text }}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );
}
