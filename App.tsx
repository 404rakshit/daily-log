// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { db, initDb } from "./db";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    initDb();
    refreshLogs();
  }, []);

  const refreshLogs = () => {
    const results = db.getAllSync("SELECT * FROM logs ORDER BY id DESC");
    setLogs(results);
  };

  const addLog = () => {
    if (!text.trim()) return;
    db.runSync("INSERT INTO logs (content) VALUES (?)", text);
    setText("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    refreshLogs();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", }}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#fff",
          paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
        }}
      >
        <StatusBar style="dark" /> {/* 2. Add this line */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginLeft: 20,
            marginBottom: 10,
          }}
        >
          Logs
        </Text>
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 15,
                borderBottomWidth: 0.5,
                borderColor: "#eee",
              }}
            >
              <Text style={{ color: "#888", fontSize: 12 }}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </Text>
              <Text style={{ fontSize: 16, marginTop: 4 }}>{item.content}</Text>
            </View>
          )}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              padding: 20,
              flexDirection: "row",
              borderTopWidth: 1,
              borderColor: "#eee",
            }}
          >
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="What happened?"
              style={{
                flex: 1,
                height: 40,
                backgroundColor: "#f0f0f0",
                borderRadius: 20,
                paddingHorizontal: 15,
              }}
            />
            <TouchableOpacity
              onPress={addLog}
              style={{ marginLeft: 10, justifyContent: "center" }}
            >
              <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
