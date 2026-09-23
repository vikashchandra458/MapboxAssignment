import React, { useEffect, useState } from "react";
import { View } from "react-native";
import NativeSecurity from "./NativeSecurity";
import SecurityOverlay from "./SecurityOverlay";

const SecurityShield = ({
    enabled = true,

    screenshotProtection = true,
    recordingProtection = true,
    appSwitcherProtection = true,

    blurOverlay = true,

    onScreenshot,
    onRecordingStart,
    onRecordingStop,

    children,
}) => {
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        let subscription;

        const initialize = async () => {
            try {
                if (enabled) {
                    await NativeSecurity.enable({
                        screenshot: screenshotProtection,
                        record: recordingProtection,
                        appSwitcher: appSwitcherProtection,
                    });
                } else {
                    await NativeSecurity.disable();
                }

                // If recording was already active
                const status =
                    await NativeSecurity.getProtectionStatus();

                setIsRecording(status.isRecording);

                subscription = NativeSecurity.addListener((event) => {
                    console.log(
                        "Native Security Event:",
                        event
                    );

                    switch (event.type) {
                        case "SCREENSHOT_DETECTED":
                            onScreenshot?.();
                            break;

                        case "RECORDING_STARTED":
                            setIsRecording(true);
                            onRecordingStart?.();
                            break;

                        case "RECORDING_STOPPED":
                            setIsRecording(false);
                            onRecordingStop?.();
                            break;

                        case "PROTECTION_CHANGED":
                            if (event.status) {
                                setIsRecording(
                                    event.status.isRecording
                                );
                            }
                            break;

                        default:
                            break;
                    }
                });
            } catch (e) {
                console.log("Native Security Error:", e);
            }
        };

        initialize();

        return () => {
            subscription?.remove();
            NativeSecurity.disable();
        };
    }, [
        enabled,
        screenshotProtection,
        recordingProtection,
        appSwitcherProtection,
    ]);

    return (
        <View style={{ flex: 1 }}>
            {children}

            {blurOverlay && isRecording && (
                <SecurityOverlay />
            )}
        </View>
    );
};

export default SecurityShield;