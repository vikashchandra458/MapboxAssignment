import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
} from "react-native";
import SecurityShield from "./SecurityShield";

const Option = ({ title, subtitle, details = [], value, onValueChange }) => (
    <View style={styles.option}>
        <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
            {details.map((detail) => (
                <Text key={detail} style={styles.optionDetail}>
                    {detail}
                </Text>
            ))}
        </View>

        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor="#fff"
        />
    </View>
);

export default function ScreenProtection() {
    const [enableAll, setEnableAll] = useState(true);

    const [settings, setSettings] = useState({
        secureWindowProtection: true,
        recordingProtection: true,
    });

    const toggleAll = (value) => {
        setEnableAll(value);

        setSettings({
            secureWindowProtection: value,
            recordingProtection: value,
        });
    };

    const update = (key, value) => {
        setSettings((prev) => {
            const next = {
                ...prev,
                [key]: value,
            };

            setEnableAll(
                next.secureWindowProtection &&
                next.recordingProtection
            );

            return next;
        });
    };

    const isAnyProtectionEnabled =
        settings.secureWindowProtection ||
        settings.recordingProtection;

    return (
        <SecurityShield
            enabled={isAnyProtectionEnabled}
            screenshotProtection={settings.secureWindowProtection}
            recordingProtection={settings.recordingProtection}
            appSwitcherProtection={settings.secureWindowProtection}
            onRecordingStart={() =>
                console.log("Recording Started")
            }
            onRecordingStop={() =>
                console.log("Recording Stopped")
            }
            onScreenshot={() =>
                console.log("Screenshot Detected")
            }
        >
            <SafeAreaView style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.header}>
                        Security Protection
                    </Text>

                    <Option
                        title="Enable All Protections"
                        subtitle="Master switch"
                        value={enableAll}
                        onValueChange={toggleAll}
                    />

                    <Option
                        title="Secure Window Protection"
                        subtitle="Uses Android FLAG_SECURE"
                        details={[
                            "Blocks screenshots and screen-recording capture of this screen.",
                            "Also hides this screen in the app switcher preview.",
                        ]}
                        value={settings.secureWindowProtection}
                        onValueChange={(v) =>
                            update("secureWindowProtection", v)
                        }
                    />

                    <Option
                        title="Screen Recording Protection"
                        subtitle="Shows overlay while this screen is being recorded"
                        details={[
                            "Detection works on Android 15 and newer.",
                            "Android 14 cannot reliably notify recording start; use Secure Window Protection there.",
                        ]}
                        value={settings.recordingProtection}
                        onValueChange={(v) =>
                            update("recordingProtection", v)
                        }
                    />
                </ScrollView>
            </SafeAreaView>
        </SecurityShield>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#101827",
        padding: 20,
    },

    scrollContainer: {
        paddingBottom: 40,
    },

    header: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 25,
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F2937",
        padding: 18,
        borderRadius: 15,
        marginBottom: 15,
    },

    optionTitle: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },

    optionSubtitle: {
        color: "#A1A1AA",
        marginTop: 4,
        fontSize: 13,
    },

    optionDetail: {
        color: "#C7CBD1",
        marginTop: 8,
        fontSize: 12,
        lineHeight: 17,
    },
});
