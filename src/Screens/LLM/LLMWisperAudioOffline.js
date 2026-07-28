import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  DeviceEventEmitter,
  Easing,
  KeyboardAvoidingView,
  NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
const { WhisperModule, RNLiveAudioStream } = NativeModules;
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
// import AudioRecorderPlayer from 'react-native-audio-recorder-player';

// const recorder = new AudioRecorderPlayer();
import { Buffer } from 'buffer';
const MODEL_DOWNLOAD_KEY = 'WHISPER_MODEL_DOWNLOADED';
const DEFAULT_MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin';
const DEFAULT_MODEL_NAME = 'ggml-base.en.bin';
const DEFAULT_MODEL_PATH = `${RNFS.DocumentDirectoryPath}/${DEFAULT_MODEL_NAME}`;
const outputPath = `${RNFS.DocumentDirectoryPath}/recording.wav`;

if (WhisperModule) {
  WhisperModule.addListener = WhisperModule.addListener || (() => { });
  WhisperModule.removeListeners = WhisperModule.removeListeners || (() => { });
}

const LiveAudioStream = {
  init: options => RNLiveAudioStream?.init(options),
  start: () => RNLiveAudioStream?.start(),
  stop: () => RNLiveAudioStream?.stop(),
  on: (event, callback) => {
    if (event !== 'data') {
      throw new Error('Invalid audio stream event');
    }

    DeviceEventEmitter.removeAllListeners('data');
    return DeviceEventEmitter.addListener('data', callback);
  },
};

const collapseRepeatedTranscript = value => {
  const text = value?.trim().replace(/\s+/g, ' ');

  if (!text) {
    return '';
  }

  const sentenceParts = text.match(/[^.!?]+[.!?]?/g)
    ?.map(part => part.trim())
    .filter(Boolean);

  if (sentenceParts?.length > 1) {
    const uniqueSentences = [];

    sentenceParts.forEach(part => {
      const normalized = part.toLowerCase().replace(/[^\w\s]/g, '').trim();
      const last = uniqueSentences[uniqueSentences.length - 1];

      if (!last || last.normalized !== normalized) {
        uniqueSentences.push({ original: part, normalized });
      }
    });

    if (uniqueSentences.length < sentenceParts.length) {
      return uniqueSentences.map(item => item.original).join(' ');
    }
  }

  const words = text.split(' ');

  for (let size = 1; size <= Math.floor(words.length / 2); size += 1) {
    const first = words.slice(0, size).join(' ').toLowerCase();
    let index = size;
    let repeats = 1;

    while (
      index + size <= words.length &&
      words.slice(index, index + size).join(' ').toLowerCase() === first
    ) {
      repeats += 1;
      index += size;
    }

    if (repeats > 1 && index >= words.length - size) {
      return words.slice(0, size).join(' ');
    }
  }

  return text;
};

export default function LLMWisperAudioOffline() {
  const pcmChunks = useRef([]);

  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(0);
  const [edit, setEdit] = useState(false);

  const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
  const [modelName, setModelName] = useState(DEFAULT_MODEL_NAME);
  const [modelPath, setModelPath] = useState(DEFAULT_MODEL_PATH);

  const [isRecording, setIsRecording] = useState(false);

  const [audioPath, setAudioPath] = useState('');

  const [transcript, setTranscript] = useState('');
  const requestMicPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'App needs microphone access.',
        buttonPositive: 'Allow',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  useEffect(() => {
    LiveAudioStream.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      bufferSize: 4096,
    });

    const subscription = LiveAudioStream.on("data", data => {
      pcmChunks.current.push(Buffer.from(data, "base64"));
    });

    return () => {
      LiveAudioStream.stop();
      subscription?.remove();
    };
  }, []);

  const createWavHeader = (pcmLength) => {
    const header = Buffer.alloc(44);

    header.write("RIFF", 0);
    header.writeUInt32LE(36 + pcmLength, 4);
    header.write("WAVE", 8);

    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(16000, 24);
    header.writeUInt32LE(16000 * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);

    header.write("data", 36);
    header.writeUInt32LE(pcmLength, 40);

    return header;
  };

  const onUrlChange = text => {
    setModelUrl(text);

    // try {
    //   const url = text.split('?')[0];
    //   const name = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));

    //   if (name) {
    //     setModelName(name);
    //   }
    // } catch {}
  };

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!uploading) return;

    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [uploading]);
  useEffect(() => {
    (async () => {
      await loadModelInfo();
      await checkModel();
    })();
  }, []);
  const loadModelInfo = async () => {
    try {
      const values = await AsyncStorage.multiGet([
        'MODEL_URL',
        'MODEL_NAME',
        'MODEL_PATH',
      ]);

      const data = Object.fromEntries(values);
      // console.log('Get : ', {...data});

      setModelUrl(prev => data.MODEL_URL || prev || DEFAULT_MODEL_URL);
      setModelName(prev => data.MODEL_NAME || prev || DEFAULT_MODEL_NAME);
      setModelPath(prev => data.MODEL_PATH || prev || DEFAULT_MODEL_PATH);
    } catch (error) {
      console.log('loadModelInfo error:', error);

      setModelUrl(prev => prev || DEFAULT_MODEL_URL);
      setModelName(prev => prev || DEFAULT_MODEL_NAME);
      setModelPath(prev => prev || DEFAULT_MODEL_PATH);
    }
  };

  const saveModelInfo = async ({ url, name, path }) => {
    try {
      // console.log('Save : ', {url, name, path});
      const finalUrl = url || modelUrl || DEFAULT_MODEL_URL;
      const finalName = name || modelName || DEFAULT_MODEL_NAME;
      const finalPath = path || modelPath || DEFAULT_MODEL_PATH;

      await AsyncStorage.multiSet([
        [MODEL_DOWNLOAD_KEY, 'true'],
        ['MODEL_URL', finalUrl],
        ['MODEL_NAME', finalName],
        ['MODEL_PATH', finalPath],
      ]);

      setModelUrl(finalUrl);
      setModelName(finalName);
      setModelPath(finalPath);
    } catch (error) {
      console.log('saveModelInfo error:', error);

      // Keep UI consistent even if AsyncStorage fails
      setModelUrl(prev => prev || url || DEFAULT_MODEL_URL);
      setModelName(prev => prev || name || DEFAULT_MODEL_NAME);
      setModelPath(prev => prev || path || DEFAULT_MODEL_PATH);
    }
  };
  const checkModel = async () => {
    try {
      const downloaded = await AsyncStorage.getItem(MODEL_DOWNLOAD_KEY);

      if (downloaded !== 'true') {
        setModelLoaded(false);
        return;
      }

      const exists = await RNFS.exists(modelPath);

      if (!exists) {
        await AsyncStorage.removeItem(MODEL_DOWNLOAD_KEY);
        setModelLoaded(false);
        return;
      }

      await loadModel();
    } catch (e) {
      console.log(e);
      setModelLoaded(false);
    }
  };

  const loadModel = async () => {
    try {
      const loaded = await WhisperModule.loadModel(modelPath);

      setModelLoaded(loaded);

      if (!loaded) return;

    } catch (e) {
      console.log(e);
    }
  };
  const pickModel = async () => {
    try {
      const file = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      const fileName = file.name || file.fileCopyUri?.split('/').pop();

      const valid =
        fileName &&
        (
          fileName.toLowerCase().endsWith('.bin') ||
          fileName.toLowerCase().endsWith('.gguf')
        );

      if (!valid) {
        alert('Please select a Whisper model (.bin or .gguf).');
        return;
      }
      setUploading(true);

      const destinationPath = DEFAULT_MODEL_PATH;
      // Remove existing model if present
      if (await RNFS.exists(destinationPath)) {
        await RNFS.unlink(destinationPath);
      }

      const sourcePath = (file.fileCopyUri || file.uri).replace('file://', '');

      await RNFS.copyFile(sourcePath, destinationPath);
      if (file.fileCopyUri) {
        await RNFS.unlink(file.fileCopyUri.replace('file://', ''));
      }
      // Save latest model informationxw
      await saveModelInfo({
        url: modelUrl,
        name: DEFAULT_MODEL_NAME,
        path: destinationPath,
      });

      const loaded = await WhisperModule.loadModel(destinationPath);
      setModelLoaded(loaded);

      if (loaded) {

        setEdit(false);
      }
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        console.log('pickModel error:', e);
        alert('Failed to import model.');
      }
    } finally {
      setUploading(false);
    }
  };
  const pickAudioFile = async () => {
    try {

      const file = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio],
        copyTo: 'cachesDirectory',
      });

      const allowed = ['.wav', '.mp3', '.m4a', '.aac'];

      const ext = file.name?.toLowerCase();

      if (ext && !allowed.some(item => ext.endsWith(item))) {
        alert('Unsupported audio format.');
        return;
      }

      const path = (file.fileCopyUri || file.uri).replace(
        'file://',
        '',
      );

      setAudioPath(path);

      await transcribeAudio(path);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        console.log(e);
        alert('Failed to pick audio file.');
      }
    }
  };
  const transcribeAudio = async path => {
    try {
      if (!modelLoaded) {
        alert('Load a Whisper model first.');
        return;
      }

      if (!path) {
        alert('Audio path missing.');
        return;
      }

      const exists = await RNFS.exists(path);

      if (!exists) {
        alert('Audio file not found.');
        return;
      }

      setLoading(true);
      console.log("path : ", path)
      const text = await WhisperModule.transcribe(path);
      console.log("text : ", text)
      setTranscript(collapseRepeatedTranscript(text) || 'No speech detected.');
    } catch (e) {
      console.log(e);
      alert(e.message || 'Transcription failed.');
    } finally {
      setLoading(false);
    }
  };
  const toggleRecording = async () => {
    try {
      if (!modelLoaded) {
        alert('Please load a Whisper model first.');
        return;
      }

      const granted = await requestMicPermission();

      if (!granted) {
        alert('Microphone permission denied');
        return;
      }

      if (!isRecording) {
        setTranscript('');

        const recordedPath = await startRecording();

        setAudioPath(recordedPath);

        // setIsRecording(true);

        return;
      }

      const recordedPath = await stopRecording();

      setIsRecording(false);

      setAudioPath(recordedPath);
      console.log("recorded Path : ", recordedPath)
      await transcribeAudio(recordedPath);
    } catch (e) {
      console.log(e);

      setIsRecording(false);

      alert('Recording failed.');
    }
  };
  const downloadModel = async newUrl => {
    try {
      const url = newUrl || modelUrl;

      const modelName = DEFAULT_MODEL_NAME;

      const modelPath = DEFAULT_MODEL_PATH;
      setDownloading(true);
      setProgress(0);
      setDownloadedMB(0);
      setTotalMB(0);

      const download = RNFS.downloadFile({
        fromUrl: url,
        toFile: modelPath,
        progressDivider: 1,

        begin: res => {
          setTotalMB((res.contentLength / 1024 / 1024).toFixed(1));
        },

        progress: res => {
          setProgress((res.bytesWritten / res.contentLength) * 100);
          setDownloadedMB((res.bytesWritten / 1024 / 1024).toFixed(1));
        },
      });

      const result = await download.promise;

      if (result.statusCode !== 200) {
        throw new Error('Download failed');
      }

      await saveModelInfo({
        url,
        name: DEFAULT_MODEL_NAME,
        path: DEFAULT_MODEL_PATH,
      });

      setDownloading(false);

      const loaded = await WhisperModule.loadModel(modelPath);
      console.log("loaded : ", loaded)
      setModelLoaded(loaded);

      if (loaded) {
        setEdit(false);
      }
    } catch (e) {
      console.log(e);

      setDownloading(false);
      setModelLoaded(false);

      alert('Failed to download model.');
    }
  };


  const startRecording = async () => {
    pcmChunks.current = [];

    if (await RNFS.exists(outputPath)) {
      await RNFS.unlink(outputPath);
    }

    LiveAudioStream.start();

    setIsRecording(true);

    return outputPath;
  };

  const stopRecording = async () => {

    LiveAudioStream.stop();

    await new Promise(resolve => setTimeout(resolve, 100));

    setIsRecording(false);

    const pcm = Buffer.concat(pcmChunks.current);

    const wavHeader = createWavHeader(pcm.length);

    const wav = Buffer.concat([wavHeader, pcm]);

    await RNFS.writeFile(
      outputPath,
      wav.toString("base64"),
      "base64",
    );
    const stat = await RNFS.stat(outputPath);

    console.log("WAV size:", stat.size);

    return outputPath;
  };



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 22 }} />
            <View style={[styles.headerRow, edit && { marginBottom: 15 }]}>
              <Ionicons name="hardware-chip-outline" size={24} color="#fff" />

              <Text style={styles.headerText}>Offline Whisper Model</Text>
            </View>
            {modelLoaded ? (
              <TouchableOpacity onPress={() => setEdit(prev => !prev)}>
                <Ionicons name="pencil-outline" size={22} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 22 }} />
            )}
          </View>
          {edit ? (
            <View style={styles.modelCard}>
              <View style={styles.inputRow}>
                <Ionicons name="link-outline" size={20} color="#666" />

                <TextInput
                  value={modelUrl}
                  onChangeText={onUrlChange}
                  placeholder="Model download URL"
                  style={styles.input}
                />
              </View>

              {/* <View style={styles.inputRow}>
                <Ionicons name="document-outline" size={20} color="#666" />

                <TextInput
                  value={modelName}
                  onChangeText={setModelName}
                  placeholder="Model filename"
                  style={styles.input}
                />
              </View> */}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => downloadModel(modelUrl)}>
                <Ionicons
                  name="cloud-download-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.actionText}>Download Whisper Model</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#1565C0' }]}
                onPress={pickModel}>
                <Ionicons name="folder-open-outline" size={20} color="#fff" />
                <Text style={styles.actionText}>Import Whisper Model</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Download Screen */}
        {/* Initial Setup */}
        {!modelLoaded && !downloading && !uploading && (
          <View style={styles.downloadContainer}>
            <Text style={styles.downloadTitle}>🎙 Offline Whisper</Text>

            <Text style={styles.downloadDescription}>
              Download or import a Whisper speech recognition model.
            </Text>

            <View style={[styles.modelCard, { width: '100%' }]}>
              <View style={styles.inputRow}>
                <Ionicons name="link-outline" size={20} color="#666" />
                <TextInput
                  value={modelUrl}
                  onChangeText={onUrlChange}
                  placeholder="Model download URL"
                  style={styles.input}
                />
              </View>

              {/* <View style={styles.inputRow}>
                <Ionicons name="document-outline" size={20} color="#666" />
                <TextInput
                  value={modelName}
                  onChangeText={setModelName}
                  placeholder="Model filename"
                  style={styles.input}
                />
              </View> */}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => downloadModel(modelUrl)}>
                <Ionicons
                  name="cloud-download-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.actionText}>Download Whisper Model</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#1565C0' }]}
                onPress={pickModel}>
                <Ionicons name="folder-open-outline" size={20} color="#fff" />
                <Text style={styles.actionText}>Import Whisper Model</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Download Progress */}
        {downloading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />

            <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>

            <Text style={styles.progressSize}>
              {downloadedMB} MB / {totalMB} MB
            </Text>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {uploading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />

            <Text style={styles.progressPercent}>Preparing Whisper model</Text>

            <Text style={styles.progressSize}>
              Please wait while the Whisper model is being imported.
            </Text>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressIndicator,
                  {
                    transform: [
                      {
                        translateX: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-250, 250],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Chat Screen */}
        {/* Whisper Screen */}
        {modelLoaded && !downloading && !uploading && (
          <View style={styles.whisperContainer}>
            <View style={styles.whisperContent}>
              <View style={styles.statusCard}>
                <View style={styles.statusIcon}>
                  <Ionicons name="checkmark" color="#0F766E" size={22} />
                </View>

                <View style={styles.statusCopy}>
                  <Text style={styles.statusTitle}>Ready to Transcribe</Text>
                  <Text style={styles.statusSubtitle}>
                    {audioPath ? audioPath.split('/').pop() : modelName}
                  </Text>
                </View>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Transcript</Text>
                  {loading ? (
                    <View style={styles.inlineLoading}>
                      <ActivityIndicator size="small" color="#0F766E" />
                      <Text style={styles.inlineLoadingText}>Transcribing</Text>
                    </View>
                  ) : null}
                </View>

                <ScrollView
                  style={styles.transcriptScroll}
                  contentContainerStyle={styles.transcriptContent}>
                  <Text
                    style={[
                      styles.transcript,
                      !transcript && styles.transcriptPlaceholder,
                    ]}>
                    {transcript || "No transcript yet"}
                  </Text>
                </ScrollView>
              </View>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={[
                  styles.fileButton,
                  (loading || isRecording) && styles.disabledSecondaryButton,
                ]}
                activeOpacity={0.85}
                onPress={pickAudioFile}
                disabled={loading || isRecording}>
                <Ionicons name="document-outline" color="#334155" size={22} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.stopButton,
                  loading && styles.disabledButton,
                ]}
                activeOpacity={0.9}
                disabled={loading}
                onPress={toggleRecording}>
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={24}
                  color="#fff"
                />

                <Text style={styles.recordText}>
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // header: {
  //   height: 60,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: '#2E7D32',
  // },

  // headerText: {
  //   color: '#fff',
  //   fontWeight: 'bold',
  //   fontSize: 20,
  // },

  bubble: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '85%',
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#81C784',
  },

  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },

  title: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
  },

  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },

  inputBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },

  input2: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    maxHeight: 120,
    color: '#222',
  },

  send: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: 10,
  },
  thinkingContainer: {
    paddingHorizontal: 5,
    paddingBottom: 5,
    justifyContent: 'center',
  },

  thinkingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarText: {
    fontSize: 24,
  },

  thinkingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  thinkingSubtitle: {
    color: '#777',
    marginTop: 3,
    fontSize: 13,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 12,
  },

  progressText: {
    marginLeft: 10,
    color: '#2E7D32',
    fontWeight: '600',
  },
  downloadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  downloadCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  downloadIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  downloadTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },

  downloadDescription: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },

  downloadButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },

  downloadButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },

  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  progressPercent: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
  },

  progressSize: {
    marginTop: 8,
    fontSize: 15,
    color: '#666',
  },

  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginTop: 25,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 10,
  },

  header: {
    backgroundColor: '#2E7D32',
    padding: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },

  modelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 10,
    color: '#222',
  },

  actionButton: {
    height: 48,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },

  actionText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },

  systemBubble: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '90%',
  },

  systemText: {
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },

  progressIndicator: {
    width: '35%',
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 10,
  },
  whisperContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  whisperContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  statusCopy: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },

  statusSubtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 13,
  },

  recordButton: {
    flex: 1,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  stopButton: {
    backgroundColor: '#DC2626',
  },

  disabledButton: {
    backgroundColor: '#94A3B8',
  },

  recordText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: '700',
    fontSize: 16,
  },

  fileButton: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 12,
  },

  disabledSecondaryButton: {
    opacity: 0.5,
  },

  resultCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  inlineLoadingText: {
    marginLeft: 6,
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '700',
  },

  transcriptScroll: {
    flex: 1,
  },

  transcriptContent: {
    flexGrow: 1,
  },

  transcript: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1E293B',
  },

  transcriptPlaceholder: {
    color: '#94A3B8',
  },

  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
