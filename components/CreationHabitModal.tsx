import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import EmojiPicker from "rn-emoji-keyboard";

import DateTimePicker from "@react-native-community/datetimepicker";

const DAYS_OF_WEEK = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
];

const PRESET_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habitData: any) => void; // We will type this properly when wiring the DB
}

export default function CreateHabitModal({
  visible,
  onClose,
  onSave,
}: CreateHabitModalProps) {
  // --- CORE STATE ---
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📖");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [dailyTarget, setDailyTarget] = useState(1);

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // --- SCHEDULE STATE ---
  const [isDaily, setIsDaily] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 6]); // Default to weekends if toggled

  // --- REMINDER STATE ---
  const [reminders, setReminders] = useState<string[]>([]);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // (In a real app, you'd use @react-native-community/datetimepicker here.
  // For the MVP UI, we use a simple text input for HH:MM to keep it dependency-free)
  const [tempTime, setTempTime] = useState("");

  // --- NEW PLATFORM-AWARE TIME HANDLERS ---
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    // 1. ANDROID FLOW: The native modal has its own OK/Cancel buttons
    if (Platform.OS === "android") {
      setShowPicker(false); // Always close the modal first

      // event.type === 'set' means the user tapped the native "OK"
      if (event.type === "set" && selectedDate) {
        setPickerDate(selectedDate);
        addTimeToList(selectedDate);
      }
      return;
    }

    // 2. IOS FLOW: Just update the scrolling wheel state natively
    if (selectedDate) {
      setPickerDate(selectedDate);
    }
  };

  // Helper to extract HH:MM and append to state
  const addTimeToList = (dateObj: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;

    if (!reminders.includes(formattedTime)) {
      setReminders((prev) => [...prev, formattedTime]);
    }
  };

  // 3. IOS ONLY: The custom Confirm button handler
  const confirmIOSReminder = () => {
    addTimeToList(pickerDate);
    setShowPicker(false);
  };

  const confirmAndAddReminder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Extract the HH:MM format in 24h or 12h format safely
    const hours = pickerDate.getHours().toString().padStart(2, "0");
    const minutes = pickerDate.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;

    if (!reminders.includes(formattedTime)) {
      setReminders([...reminders, formattedTime]);
    }

    // Close picker on iOS after adding
    if (Platform.OS === "ios") setShowPicker(false);
  };

  // --- HANDLERS ---
  const toggleDay = (dayValue: number) => {
    Haptics.selectionAsync();
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue],
    );
  };

  const addReminder = () => {
    if (tempTime.length === 5 && tempTime.includes(":")) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setReminders([...reminders, tempTime]);
      setTempTime("");
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Package the data exactly how our decoupled DB expects it
    const newHabitPayload = {
      title,
      emoji,
      color,
      dailyTarget,
      schedule: {
        frequencyType: isDaily ? "DAILY" : "SPECIFIC_DAYS",
        daysOfWeek: isDaily ? null : selectedDays.join(","), // e.g., "0,6"
      },
      reminders: reminders, // e.g., ["09:00", "20:00"]
    };

    onSave(newHabitPayload);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setEmoji("📖");
    setColor(PRESET_COLORS[0]);
    setDailyTarget(1);
    setIsDaily(true);
    setSelectedDays([0, 6]);
    setReminders([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              onClose();
            }}
            hitSlop={20}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>New Habit</Text>
          <Pressable onPress={handleSave} disabled={!title}>
            <Text style={[styles.saveText, !title && { opacity: 0.5 }]}>
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 1: IDENTITY */}
          {/* SECTION 1: IDENTITY & THEME */}
          <View style={styles.section}>
            {/* The Input Container (Creates a distinct "Text Box" feel) */}
            <View style={styles.inputContainer}>
              {/* UPGRADED: Tappable Emoji Button */}
              <Pressable
                style={[
                  styles.emojiPicker,
                  { backgroundColor: `${color}20`, borderColor: color },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setIsEmojiPickerOpen(true);
                }}
              >
                <Text style={styles.emojiInput}>{emoji}</Text>
              </Pressable>

              <TextInput
                style={styles.titleInput}
                placeholder="E.g., Read a book..."
                placeholderTextColor="#64748b"
                value={title}
                onChangeText={setTitle}
                autoFocus={true} // Automatically opens the standard keyboard for the title
              />
            </View>
            <View style={styles.divider} />

            {/* Color Palette (Labeled and spaced beautifully) */}
            <View style={styles.themeRow}>
              <Text style={styles.themeLabel}>Accent Color</Text>
              <View style={styles.colorPalette}>
                {PRESET_COLORS.map((c) => {
                  const isActive = color === c;
                  return (
                    <Pressable
                      key={c}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: c },
                        isActive && styles.colorSwatchActive,
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setColor(c);
                      }}
                    >
                      {/* Adds a premium inner dot when selected */}
                      {isActive && <View style={styles.activeDot} />}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* SECTION 2: TARGET & SCHEDULE */}
          <Text style={styles.sectionTitle}>Target & Schedule</Text>
          <View style={styles.section}>
            {/* Target Counter */}
            <View style={styles.settingRow}>
              {/* NEW: Grouped Icon, Label, and Subtitle */}
              <View style={styles.settingInfo}>
                <View
                  style={[styles.iconBox, { backgroundColor: `${color}20` }]}
                >
                  <Feather name="target" size={18} color={color} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Daily Target</Text>
                  <Text style={styles.settingSubtext}>Times per day</Text>
                </View>
              </View>

              {/* NEW: Tactile Pill Counter */}
              <View style={styles.counterBox}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDailyTarget(Math.max(1, dailyTarget - 1));
                  }}
                  style={styles.counterBtn}
                >
                  <Feather name="minus" size={16} color="#94a3b8" />
                </Pressable>

                <Text style={styles.counterValue}>{dailyTarget}</Text>

                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDailyTarget(dailyTarget + 1);
                  }}
                  style={styles.counterBtn}
                >
                  <Feather name="plus" size={16} color="#94a3b8" />
                </Pressable>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Daily vs Specific Days Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View
                  style={[styles.iconBox, { backgroundColor: `${color}20` }]}
                >
                  <Feather name="calendar" size={18} color={color} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Repeat Everyday</Text>
                  <Text style={styles.settingSubtext}>
                    Or pick specific days
                  </Text>
                </View>
              </View>

              <Switch
                value={isDaily}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setIsDaily(val);
                }}
                trackColor={{ false: "#334155", true: color }}
              />
            </View>

            {/* Conditional Day Picker */}
            {!isDaily && (
              <View style={styles.daysGrid}>
                {DAYS_OF_WEEK.map((day) => {
                  const isActive = selectedDays.includes(day.value);
                  return (
                    <Pressable
                      key={day.value}
                      onPress={() => toggleDay(day.value)}
                      style={[
                        styles.dayChip,
                        isActive && {
                          backgroundColor: color,
                          borderColor: color,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isActive && styles.dayTextActive,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* SECTION 3: REMINDERS (Upgraded UI/UX) */}
          <Text style={styles.sectionTitle}>Reminders & Notifications</Text>
          <View style={styles.section}>
            {/* 1. Styled Reminder List Cards */}
            {reminders.map((time, index) => (
              <View key={index} style={styles.reminderCard}>
                {/* Contextual Icon Box */}
                <View
                  style={[styles.iconBox, { backgroundColor: `${color}20` }]}
                >
                  <Feather name="bell" size={16} color={color} />
                </View>

                {/* Text Group */}
                <View style={styles.reminderTextGroup}>
                  <Text style={styles.reminderTime}>{time}</Text>
                  <Text style={styles.reminderSubtext}>
                    Notification sent at this time
                  </Text>
                </View>

                {/* UPGRADED: Recognizeable Trash Icon Button */}
                <Pressable
                  style={styles.trashBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setReminders(reminders.filter((_, i) => i !== index));
                  }}
                  hitSlop={15} // Extra tappable area for UX
                >
                  <Feather name="trash-2" size={18} color="#ef4444" />
                </Pressable>
              </View>
            ))}

            {/* 2. THE WHEEL PICKER UI (Keep existing logic) */}
            {showPicker && (
              <View style={Platform.OS === "ios" ? styles.pickerContainer : {}}>
                <DateTimePicker
                  value={pickerDate}
                  mode="time"
                  display="inline"
                  onChange={handleTimeChange}
                  textColor="#ffffff"
                />

                {Platform.OS === "ios" && (
                  <Pressable
                    style={[
                      styles.addBtn,
                      { backgroundColor: color, marginTop: 16 },
                    ]}
                    onPress={confirmIOSReminder}
                  >
                    <Text style={styles.addBtnText}>Confirm Time</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* 3. UPGRADED: Tappable, tinted Add Button */}
            {!showPicker && (
              <Pressable
                style={[
                  styles.openPickerBtn,
                  { backgroundColor: `${color}15`, borderColor: color },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowPicker(true);
                }}
              >
                <Feather
                  name="plus"
                  size={16}
                  color={color}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.openPickerText, { color: color }]}>
                  Add New Reminder
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
        {/* THE NATIVE EMOJI BOTTOM SHEET */}
        <EmojiPicker
          onEmojiSelected={(emojiObject) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setEmoji(emojiObject.emoji);
          }}
          open={isEmojiPickerOpen}
          enableSearchBar
          onClose={() => setIsEmojiPickerOpen(false)}
          expandable={false} // Keeps it a clean, half-screen height
          theme={{
            backdrop: "#00000088",
            knob: color, // The pull-down knob matches your active theme color!
            container: "#1e293b", // Matches your section background
            header: "#ffffff",
            // skinBackground: "#0f172a",
            search: {
              background: "#0f172a", // Matches your dark inset background
              text: "#ffffff",
              placeholder: "#64748b",
            },
          }}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  cancelText: { color: "#94a3b8", fontSize: 17 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  saveText: { color: "#3b82f6", fontSize: 17, fontWeight: "bold" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 24,
    paddingLeft: 4,
  },
  identityRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  colorRow: { flexDirection: "row", gap: 12 },
  counterBtnText: { color: "#94a3b8", fontSize: 20, fontWeight: "bold" },
  reminderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  removeText: { color: "#ef4444", fontWeight: "bold" },
  addReminderRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  timeInput: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 18,
  },
  // addBtn: {
  //   paddingHorizontal: 20,
  //   paddingVertical: 12,
  //   borderRadius: 12,
  //   justifyContent: "center",
  // },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  pickerContainer: {
    marginTop: 16,
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
  },
  // Ensure your existing addBtn stretches
  addBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  // --- SECTION 1 UI UPGRADES ---
  section: {
    backgroundColor: "#1e293b",
    borderRadius: 24, // Softer, modern corners
    padding: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a", // Darker inset background
    borderRadius: 16,
    padding: 8,
    paddingRight: 16,
  },
  emojiPicker: {
    width: 56,
    height: 56,
    borderRadius: 16, // Squircle instead of a perfect circle
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    // The background color is dynamically set to a 20% opacity of the active color in the JSX!
  },
  emojiInput: {
    fontSize: 28,
    textAlign: "center",
  },
  titleInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 16,
    borderRadius: 1,
  },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  themeLabel: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
  },
  colorPalette: {
    flexDirection: "row",
    gap: 12,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  // --- SECTION 2 UI UPGRADES ---
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  settingSubtext: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },

  // --- UPGRADED COUNTER UX ---
  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 4, // Creates an inner padding so buttons look embedded
  },
  counterBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#1e293b", // Slightly lighter than the box to look raised
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    width: 36,
    textAlign: "center",
  },

  // --- DAY PICKER UPGRADES ---
  daysGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21, // Perfect circles look cleaner for days
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#334155",
  },
  dayText: {
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: 15,
  },
  dayTextActive: {
    color: "#ffffff",
  },
  // --- UPGRADED REMINDERS UI ---
  reminderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a", // Darker inset than the section
    padding: 16,
    borderRadius: 16,
    marginBottom: 12, // Spacing between reminders
  },
  // reuse iconBox styles from previous section, or define here:
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reminderTextGroup: {
    flex: 1, // Stretches to fill space
    gap: 3,
  },
  reminderTime: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700", // Heavy weight for the time
  },
  reminderSubtext: {
    color: "#64748b", // Descriptive subtitle
    fontSize: 13,
    fontWeight: "500",
  },
  // UPGRADED: Tactile Trash Button
  trashBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#1e293b", // Raises slightly against the card
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // --- UPGRADED ADD TRIGGER ---
  openPickerBtn: {
    flexDirection: "row", // Align icon + text
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    marginTop: 8,
    // Note: color and tinted backgroundColor set dynamically in JSX
  },
  openPickerText: {
    fontSize: 16,
    fontWeight: "700", // Bolder font
  },
});
