import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
    `The native module 'PipModule' doesn't seem to be linked.\n\n` +
    Platform.select({
        ios: "- Run 'pod install'\n",
        default: '',
    }) +
    '- Rebuild the app after adding the native module.';

const PipModule = NativeModules.PipModule
    ? NativeModules.PipModule
    : new Proxy(
        {},
        {
            get() {
                throw new Error(LINKING_ERROR);
            },
        },
    );

export default PipModule;