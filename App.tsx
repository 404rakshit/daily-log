import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  TouchableOpacity,
  SectionList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import useLog from "./hooks/useLog";

import { Sun, Moon, Monitor } from "lucide-react-native";

export default function App() {
  const {
    addLog,
    setText,
    text,
    theme,
    toggleTheme,
    themeMode,
    activeScheme,
    sectionedLogs,
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
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: theme.text }}
            >
              Logs
            </Text>

            <TouchableOpacity onPress={toggleTheme} style={{ padding: 8 }}>
              {themeMode === "system" && (
                <Monitor size={24} color={theme.text} />
              )}
              {themeMode === "light" && <Sun size={24} color={theme.text} />}
              {themeMode === "dark" && <Moon size={24} color={theme.text} />}
            </TouchableOpacity>
          </View>
          <SectionList
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
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 15,
                  borderBottomWidth: 0.5,
                  borderColor: theme.border,
                }}
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
              </View>
            )}
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
              onChangeText={setText}
              placeholder="What happened?"
              placeholderTextColor={theme.secondary}
              style={{
                flex: 1,
                height: 40,
                backgroundColor: theme.inputBg,
                borderRadius: 20,
                paddingHorizontal: 15,
                color: theme.text,
              }}
            />
            <TouchableOpacity
              onPress={addLog}
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
