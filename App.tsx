import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  TouchableOpacity,
  SectionList,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import useLog from "./hooks/useLog";

import { Sun, Moon, Monitor, Trash2 } from "lucide-react-native";
import LogItem from "./components/LogItem";
import { Calendar as FilterIcon, XCircle } from "lucide-react-native";
import EmptyState from "./components/EmptyState";
import { DateFilterModal } from "./components/CalenderPicker";

export default function App() {
  const [filterVisible, setFilterVisible] = useState(false);
  const {
    handleAddLog,
    setText,
    text,
    theme,
    toggleTheme,
    themeMode,
    activeScheme,
    sectionedLogs,
    sectionListRef,
    deleteLog,
    clearAllLogs,
    isEmpty,
    setDateRange,
    dateRange,
    refreshLogs,
    clearFilter,
  } = useLog();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.bg,
          paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
        }}
      >
        <StatusBar style={activeScheme === "dark" ? "light" : "dark"} />{" "}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 24, fontWeight: "bold", color: theme.text }}
              >
                Logs
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Clear All Data",
                    "This will permanently erase all your logs. This cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Clear Everything",
                        style: "destructive",
                        onPress: clearAllLogs,
                      },
                    ],
                  );
                }}
                style={{ padding: 8 }}
              >
                <Trash2 size={22} color="#da554e" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => setFilterVisible(true)}
                style={{ padding: 8 }}
              >
                <FilterIcon
                  size={22}
                  color={dateRange.from ? "#007AFF" : theme.text}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleTheme} style={{ padding: 8 }}>
                {themeMode === "system" && (
                  <Monitor size={24} color={theme.text} />
                )}
                {themeMode === "light" && <Sun size={24} color={theme.text} />}
                {themeMode === "dark" && <Moon size={24} color={theme.text} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Filter Badge */}
          {dateRange.from && (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: theme.inputBg,
                margin: 10,
                padding: 8,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.text, fontSize: 12 }}>
                Showing: {dateRange.from} to {dateRange.to}
              </Text>
              <TouchableOpacity
                onPress={clearFilter}
                style={{ marginLeft: 10 }}
              >
                <XCircle size={16} color="#da554e" />
              </TouchableOpacity>
            </View>
          )}

          <DateFilterModal
            visible={filterVisible}
            theme={theme}
            onClose={() => setFilterVisible(false)}
            onApply={(from: string, to: string) => {
              setDateRange({ from, to });
              refreshLogs({ from, to });
            }}
          />

          <SectionList
            ListEmptyComponent={
              <EmptyState theme={theme} isFiltering={!!dateRange.from} />
            }
            contentContainerStyle={isEmpty ? { flex: 1 } : {}}
            ref={sectionListRef}
            sections={sectionedLogs}
            keyExtractor={(item) => item.id.toString()}
            stickySectionHeadersEnabled={true} // Keeps the day title at the top as you scroll
            renderSectionHeader={({ section: { title } }) => (
              <View
                style={{
                  backgroundColor: theme.bg,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontWeight: "bold",
                    fontSize: 14,
                    textTransform: "uppercase",
                  }}
                >
                  {title}
                </Text>
              </View>
            )}
            renderItem={
              ({ item }) => (
                <LogItem deleteLog={deleteLog} item={item} theme={theme} />
              )
              //   ({ item }) => (
              //   <View
              //     style={{
              //       padding: 15,
              //       borderBottomWidth: 0.5,
              //       borderColor: theme.border,
              //     }}
              //   >
              //     <Text style={{ color: theme.secondary, fontSize: 12 }}>
              //       {new Date(item.timestamp).toLocaleTimeString([], {
              //         hour: "2-digit",
              //         minute: "2-digit",
              //       })}
              //     </Text>
              //     <Text style={{ fontSize: 16, marginTop: 4, color: theme.text }}>
              //       {item.content}
              //     </Text>
              //   </View>
              // )
            }
          />
          {/* Input Area */}

          <View
            style={{
              padding: 14,
              flexDirection: "row",
              borderTopWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.bg,
            }}
          >
            <TextInput
              value={text}
              multiline={true}
              numberOfLines={4}
              onChangeText={setText}
              placeholder="What happened?"
              placeholderTextColor={theme.secondary}
              textAlignVertical="top" // Ensures text starts at the top on Android
              style={{
                flex: 1,
                height: 40,
                backgroundColor: theme.inputBg,
                borderRadius: 20,
                paddingHorizontal: 20,
                color: theme.text,
              }}
            />
            <TouchableOpacity
              onPress={handleAddLog}
              style={{ marginLeft: 15, justifyContent: "center" }}
            >
              <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
