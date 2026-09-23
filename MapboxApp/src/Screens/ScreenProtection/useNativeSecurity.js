import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import NativeSecurity from "./NativeSecurity";

const useNativeSecurity = ({
    enabled = true,

    screenshotProtection = true,
    recordingProtection = true,
    appSwitcherProtection = true,

    onScreenshot,
    onRecordingStart,
    onRecordingStop,
}) => {
    useFocusEffect(
        useCallback(() => {
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

                    subscription = NativeSecurity.addListener((event) => {
                        console.log("Native Security Event:", event);

                        switch (event.type) {
                            case "SCREENSHOT_DETECTED":
                                onScreenshot?.();
                                break;

                            case "RECORDING_STARTED":
                                onRecordingStart?.();
                                break;

                            case "RECORDING_STOPPED":
                                onRecordingStop?.();
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
            onScreenshot,
            onRecordingStart,
            onRecordingStop,
        ])
    );
};

export default useNativeSecurity;