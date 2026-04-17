import { ClipboardEdit } from "lucide-react-native";
import { Text, View } from "react-native";

const EmptyState = ({ theme }: { theme: any }) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    }}
  >
    <ClipboardEdit size={60} color={theme.border} strokeWidth={1.5} />
    <Text
      style={{
        fontSize: 18,
        fontWeight: "600",
        color: theme.text,
        marginTop: 16,
        textAlign: "center",
      }}
    >
      Your day is a blank canvas.
    </Text>
    <Text
      style={{
        fontSize: 14,
        color: theme.secondary,
        marginTop: 8,
        textAlign: "center",
      }}
    >
      Start recording moments using the input below.
    </Text>
  </View>
);

export default EmptyState;
