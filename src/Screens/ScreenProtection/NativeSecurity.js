import { NativeModules, NativeEventEmitter } from "react-native";

const { NativeSecurity } = NativeModules;

if (!NativeSecurity) {
    throw new Error(
        "NativeSecurity module is not linked. Rebuild the Android app."
    );
}

const emitter = new NativeEventEmitter(NativeSecurity);

const Security = {
    enable(options = {}) {
        return NativeSecurity.enable(options);
    },

    disable() {
        return NativeSecurity.disable();
    },

    getProtectionStatus() {
        return NativeSecurity.getProtectionStatus();
    },

    isScreenRecording() {
        return NativeSecurity.isScreenRecording();
    },

    addListener(callback) {
        return emitter.addListener("NativeSecurityEvent", callback);
    },

    removeAllListeners() {
        emitter.removeAllListeners("NativeSecurityEvent");
    },
};

export default Security;