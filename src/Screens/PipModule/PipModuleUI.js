import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    NativeEventEmitter,
    NativeModules,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Video from 'react-native-video';

import PipModule from '../../Utils/PipModule';

import { getCachedVideo } from '../../Utils/videoCache';


export default function PipModuleUI() {
    const videoRef = useRef(null);
    const appState = useRef(AppState.currentState);
    const [videoPath, setVideoPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [paused, setPaused] = useState(false);
    const [isPipMode, setIsPipMode] = useState(false);

    useEffect(() => {
        loadVideo();
    }, []);


    useEffect(() => {
        const emitter = new NativeEventEmitter(NativeModules.PipModule);

        const subscription = emitter.addListener(
            'onPictureInPictureModeChanged',
            value => {
                setIsPipMode(value);
            },
        );

        return () => subscription.remove();
    }, []);


    const loadVideo = async () => {
        try {
            const result = await getCachedVideo(progress => {
                setDownloadProgress(progress);
            });

            setVideoPath('file://' + result.path);
        } finally {
            setLoading(false);
        }
    };
    return (
        <SafeAreaView
            style={[
                styles.container,
                isPipMode && styles.pipContainer,
            ]}>

            {!isPipMode && (
                <>
                    <Text style={styles.heading}>
                        Picture in Picture
                    </Text>

                    <Text style={styles.subtitle}>
                        Video is downloaded only once.
                    </Text>
                </>
            )}

            <View
                style={[
                    styles.videoCard,
                    isPipMode && styles.videoCardPip,
                ]}>

                {loading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#fff" />

                        <Text style={styles.downloadText}>
                            Downloading...

                            {'\n'}

                            {downloadProgress.toFixed(0)}%
                        </Text>
                    </View>
                ) : (
                    <Video
                        ref={videoRef}
                        source={{ uri: videoPath }}
                        style={styles.video}
                        controls
                        resizeMode="contain"
                        paused={paused}
                        playInBackground
                        playWhenInactive
                        pictureInPicture
                        ignoreSilentSwitch="ignore"
                        onPlaybackStateChanged={({ isPlaying }) => {
                            setPaused(!isPlaying);
                            PipModule.setVideoPlaying(isPlaying);
                        }}
                        onEnd={() => {
                            setPaused(true);
                            PipModule.setVideoPlaying(false);
                        }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 20,
        justifyContent: 'center',
    },

    heading: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '700',
    },

    subtitle: {
        color: '#B0B7C3',
        marginTop: 6,
        marginBottom: 25,
    },

    videoCard: {
        width: '100%',
        height: 260,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
    },

    video: {
        flex: 1,
    },

    loader: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },

    downloadText: {
        marginTop: 20,
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
    },

    pipContainer: {
        padding: 0,
        backgroundColor: '#000',
    },

    videoCardPip: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },

});