import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const PRIMARY = "#2563EB";
export const BG = "#F4F7FC";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },

    /* ===========================
       HEADER
    =========================== */

    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 20 : 15,
    },

    title: {
        fontSize: 23,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: 0.3,
    },

    subtitle: {
        marginTop: 8,
        fontSize: 15,
        color: "#6B7280",
        fontWeight: "500",
    },

    /* ===========================
       HORIZONTAL LIST
    =========================== */

    list: {
        paddingHorizontal: 15,
        paddingTop: 25,
        paddingBottom: 15,
    },

    lessonButton: {
        width: 115,
        height: 95,
        marginRight: 14,
        borderRadius: 22,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#FFFFFF",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.08,
        shadowRadius: 10,

        elevation: 5,
    },

    lessonButtonSelected: {
        backgroundColor: PRIMARY,
        transform: [
            {
                scale: 1.05,
            },
        ],

        shadowOpacity: 0.18,
        elevation: 10,
    },

    icon: {
        fontSize: 30,
        marginBottom: 8,
    },

    lessonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#222",
        textAlign: "center",
        paddingHorizontal: 6,
    },

    lessonTextSelected: {
        color: "#FFFFFF",
    },

    /* ===========================
       CARD
    =========================== */

    card: {
        marginHorizontal: 20,
        marginTop: 10,

        padding: 25,

        backgroundColor: "#FFFFFF",

        borderRadius: 28,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.08,
        shadowRadius: 18,

        elevation: 8,
    },

    bigIcon: {
        alignSelf: "center",
        fontSize: 70,
    },

    lessonTitle: {
        marginTop: 15,
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        textAlign: "center",
    },

    /* ===========================
       BADGES
    =========================== */

    badgeRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },

    badge: {
        backgroundColor: "#EEF3FF",

        paddingHorizontal: 18,
        paddingVertical: 8,

        borderRadius: 30,

        marginHorizontal: 6,
    },

    badgeText: {
        color: PRIMARY,
        fontWeight: "700",
        fontSize: 14,
    },

    description: {
        marginTop: 22,
        textAlign: "center",
        fontSize: 16,
        color: "#6B7280",
        lineHeight: 24,
    },

    /* ===========================
       LESSON COMPONENT
    =========================== */

    lessonContainer: {
        marginTop: 25,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    componentCard: {
        width: "100",

        backgroundColor: "#FFFFFF",

        borderRadius: 24,

        padding: 20,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.08,
        shadowRadius: 10,

        elevation: 5,
    },

    componentTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 15,
    },

    componentDescription: {
        color: "#6B7280",
        lineHeight: 22,
        fontSize: 15,
        marginBottom: 20,
    },

    /* ===========================
       BUTTON
    =========================== */

    actionButton: {
        height: 50,

        borderRadius: 15,

        backgroundColor: PRIMARY,

        justifyContent: "center",
        alignItems: "center",

        marginTop: 20,
    },

    actionButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 17,
    },

    /* ===========================
       EMPTY SCREEN
    =========================== */

    emptyCard: {
        marginHorizontal: 20,
        marginTop: 40,

        backgroundColor: "#FFFFFF",

        borderRadius: 30,

        padding: 35,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.08,
        shadowRadius: 15,

        elevation: 6,
    },

    emptyEmoji: {
        fontSize: 75,
        marginBottom: 20,
    },

    emptyTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#111827",
    },

    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
    },

    /* ===========================
       SEPARATOR
    =========================== */

    separator: {
        height: 25,
    },

    lessonHeader: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 15,
    },

    lessonInfo: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#fff",

        padding: 16,

        borderRadius: 18,

        elevation: 4,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },

    selectedIcon: {
        fontSize: 38,
        marginRight: 15,
    },

    selectedTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },

    selectedMeta: {
        marginTop: 5,
        color: "#6B7280",
        fontSize: 14,
    },
});