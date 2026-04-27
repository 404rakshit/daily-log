import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

// --- STYLES ---
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    opacity: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  emoji: { fontSize: 48 },
  cardData: { gap: 4 },
  title: { color: "#ffffff", fontSize: 16, fontWeight: "700" },

  // FAB Styles
  fab: {
    position: "absolute",
    bottom: 60,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  fabIcon: { fontSize: 32, fontWeight: "400", color: "#0f172a", marginTop: -4 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
  closeText: { color: "#94a3b8", fontSize: 16, fontWeight: "600" },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  emojiInput: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: 32,
    width: 64,
    height: 64,
    borderRadius: 16,
    textAlign: "center",
  },
  titleInput: {
    flex: 1,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: 18,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, opacity: 0.5 },
  colorSelected: { opacity: 1, borderWidth: 3, borderColor: "#ffffff" },
  createBtn: {
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: "center",
  },
  createBtnText: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
  onboardingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  onboardingDesc: {
    color: "#94a3b8",
    fontSize: 18,
    marginTop: 12,
    marginBottom: 40,
  },
  presetCardSelected: {
    borderColor: "rgba(255,255,255,0.5)",
    transform: [{ scale: 1.05 }],
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  startBtn: {
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    borderRadius: 100,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  startBtnDisabled: { backgroundColor: "#334155", shadowOpacity: 0 },
  startBtnText: { color: "#0f172a", fontSize: 18, fontWeight: "900" },

  // OVERWRITE THESE HEADER STYLES
  header: { marginBottom: 32 },
  dateText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: -1,
  },
  summaryBox: {
    marginTop: 16,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  summaryHighlight: { color: "#ffffff", fontWeight: "800" },

  // OVERWRITE THESE CARD STYLES
  // card: {
  //   width: (width - 56) / 2,
  //   aspectRatio: 1,
  //   borderRadius: 24,
  //   padding: 20,
  //   justifyContent: "space-between",
  //   backgroundColor: "#1e293b",
  //   borderTopWidth: 4,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 8,
  //   elevation: 5,
  // },
  streak: { fontSize: 14, fontWeight: "800" },

  // OVERWRITE THE ONBOARDING PRESET CARD STYLE
  presetCard: {
    width: (width - 56) / 2,
    aspectRatio: 1.2,
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1e293b",
    backgroundColor: "#0f172a",
  },

  // CARD STYLES
  cardDone: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderTopWidth: 2,
    shadowOpacity: 0,
    elevation: 0,
  },
  progressText: { fontSize: 20, fontWeight: "900" },

  // ONBOARDING
  presetTarget: {
    fontSize: 12,
    color: "#475569",
    marginTop: 4,
    fontWeight: "600",
  },
  // Add these to your styles
  undoBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Ensures it sits above the card tap area
  },
  undoText: {
    color: "#94a3b8",
    fontSize: 20,
    fontWeight: "600",
    marginTop: -2,
  },

  actionRow: {
    flexDirection: "column-reverse",
    position: "absolute",
    top: 12,
    // left: 12,
    right: 12,
    zIndex: 10,
    gap: 4,
  },
  iconBtn: {
    width: 35,
    height: 35,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: "rgba(255,255,255,0.2)", // Slightly brighter for emphasis
  },
  addText: { color: "#ffffff", fontSize: 20, fontWeight: "600", marginTop: -2 },

  // COMPLETED SECTION STYLES
  completedSection: {
    marginTop: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  completedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  completedHeaderText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  completedHeaderIcon: {
    color: "#64748b",
    fontSize: 14,
  },

  // NEW VISUAL PROGRESS STYLES
  progressWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 4,
  },
  pipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    flex: 1,
    paddingRight: 8,
  },
  pip: {
    width: 14,
    height: 14,
    borderRadius: 4, // 4px makes it a nice rounded checkbox. (Use 7 for perfect circles).
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  pipOverflowText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
    alignSelf: "center",
  },
  smallProgressText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },

  cardWrapper: {
    width: (width - 56) / 2,
    aspectRatio: 1,
  },
  card: {
    flex: 1, // Let it fill the wrapper
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1, // Keeps it above the pulse ring
  },

  // ADD THIS NEW STYLE
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 4,
    zIndex: 0,
  },

  // NEW HEADER ROW ALIGNMENT
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  viewToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  viewToggleText: {
    color: "#94a3b8",
    fontSize: 20,
  },
  cardList: {
    padding: 16,
    borderTopWidth: 0,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 80,
  },
  listInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  emojiList: {
    fontSize: 32,
  },
  cardDataList: {
    flex: 1,
    gap: 4,
  },
  actionRowList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // --- 1. SEPARATED WRAPPERS ---
  cardWrapperGrid: {
    width: (width - 56) / 2,
    aspectRatio: 1, // Strictly 1:1 for grid
  },
  cardWrapperList: {
    width: "100%",
    // NO aspectRatio here. We let the content dictate the height natively.
  },

  // --- 2. SHARED BASE STYLES ---
  cardBase: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1,
  },

  // --- 3. EXPLICIT GRID LAYOUT ---
  cardGrid: {
    flex: 1, // Safe to use here because the wrapper has a strict aspectRatio: 1
    padding: 20,
    justifyContent: "space-between",
    borderTopWidth: 4,
  },

  emptyStateBox: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed", // Dashed border gives it a nice "drop zone" or "cleared" vibe
    marginTop: 16,
  },
  emptyStateEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptyStateText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
