import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from "react-native";
// import * as SQLite from "expo-sqlite";
import * as Haptics from "expo-haptics";
import { db } from "../../db";

// Connect directly to the DB, bypassing Zustand
// const db = SQLite.openDatabaseSync("habits.db");

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

function DatabaseDebugPanel({ visible, onClose }: DebugPanelProps) {
  const [dbState, setDbState] = useState({
    habits: [],
    schedules: [],
    reminders: [],
  });

  const fetchRawData = async () => {
    try {
      // Using getAllAsync to fetch raw rows directly
      const habits = await db.getAllAsync(`SELECT * FROM habits;`);
      const schedules = await db.getAllAsync(`SELECT * FROM habit_schedules;`);
      const reminders = await db.getAllAsync(`SELECT * FROM habit_reminders;`);

      setDbState({ habits, schedules, reminders });
    } catch (error) {
      console.error("Debug Panel Error:", error);
    }
  };

  // const wipeOrphanedData = async () => {
  //   try {
  //     // Deletes any schedule where the habit_id no longer exists in the habits table
  //     await db.runAsync(
  //       `DELETE FROM habit_schedules WHERE habit_id NOT IN (SELECT id FROM habits);`,
  //     );
  //     await db.runAsync(
  //       `DELETE FROM habit_reminders WHERE habit_id NOT IN (SELECT id FROM habits);`,
  //     );
  //     console.log("🧹 Ghost data scrubbed!");
  //   } catch (error) {
  //     console.error("Cleanup failed:", error);
  //   }
  // };

  // Fetch fresh data every time the modal opens
  useEffect(() => {
    if (visible) {
      fetchRawData();
    }
  }, [visible]);

  // Helper to render the JSON cleanly
  const renderTableData = (tableName: string, data: any[]) => (
    <View style={styles.tableBlock}>
      <Text style={styles.tableHeader}>
        TABLE: {tableName} ({data.length} rows)
      </Text>
      {data.length === 0 ? (
        <Text style={styles.emptyText}>Empty</Text>
      ) : (
        <Text style={styles.jsonText}>{JSON.stringify(data, null, 2)}</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>🛠️ DB Inspector</Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                fetchRawData();
              }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Refresh</Text>
            </Pressable>
            {/* <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                wipeOrphanedData();
                fetchRawData();
              }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Wipe Orphane</Text>
            </Pressable> */}
            <Pressable onPress={onClose} style={[styles.btn, styles.closeBtn]}>
              <Text style={styles.btnText}>Close</Text>
            </Pressable>
          </View>
        </View>

        {/* DATA DUMP */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {renderTableData("habits", dbState.habits)}
          {renderTableData("habit_schedules", dbState.schedules)}
          {renderTableData("habit_reminders", dbState.reminders)}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" }, // Pitch black for terminal vibe
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  title: {
    color: "#00ff00",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Courier",
  },
  headerActions: { flexDirection: "row", gap: 12 },
  btn: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeBtn: { backgroundColor: "#ef4444" },
  btnText: { color: "#fff", fontWeight: "bold" },
  scrollArea: { flex: 1, padding: 16 },
  tableBlock: {
    marginBottom: 24,
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  tableHeader: {
    color: "#fbbf24",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Courier",
  },
  emptyText: { color: "#666", fontStyle: "italic" },
  jsonText: { color: "#00ff00", fontFamily: "Courier", fontSize: 12 }, // Classic hacker green
});

export default function DebugDatabase() {
  const [debugVisible, setDebugVisible] = useState(false);

  return (
    <>
      <Pressable
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setDebugVisible(true);
        }}
        delayLongPress={1000} // Requires a full 1-second hold
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: "800",
            opacity: 0.5,
          }}
        >
          Debug
        </Text>
      </Pressable>
      <DatabaseDebugPanel
        visible={debugVisible}
        onClose={() => setDebugVisible(false)}
      />
    </>
  );
}
