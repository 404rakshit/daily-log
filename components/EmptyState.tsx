import { ClipboardEdit, SearchX } from "lucide-react-native";
import { Text, View } from "react-native";

export default function EmptyState({
  theme,
  isFiltering,
}: {
  theme: any;
  isFiltering: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      {isFiltering ? (
        <>
          <SearchX size={60} color={theme.border} strokeWidth={1.5} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: theme.text,
              marginTop: 16,
            }}
          >
            No logs in this range
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.secondary,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Try selecting a different date or clear the filter.
          </Text>
        </>
      ) : (
        <>
          <ClipboardEdit size={60} color={theme.border} strokeWidth={1.5} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: theme.text,
              marginTop: 16,
            }}
          >
            Your day is a blank canvas.
          </Text>
          <Text style={{ fontSize: 14, color: theme.secondary, marginTop: 8 }}>
            Start recording moments below.
          </Text>
        </>
      )}
    </View>
  );
}
