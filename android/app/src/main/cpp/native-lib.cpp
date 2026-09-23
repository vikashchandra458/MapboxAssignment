#define DR_WAV_IMPLEMENTATION
#include "dr_wav.h"

#include <jni.h>
#include <string>
#include <vector>
#include <thread>
#include <algorithm>
#include <cmath>
#include <mutex>
#include <android/log.h>

#include "whisper.h"

#define TAG "WhisperJNI"

// Set to 1 to enable logs, 0 to disable logs
#define ENABLE_WHISPER_LOGS 0

#if ENABLE_WHISPER_LOGS
    #define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)
    #define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)
#else
    #define LOGI(...) ((void)0)
    #define LOGE(...) ((void)0)
#endif
static whisper_context *g_ctx = nullptr;
static std::mutex g_whisper_mutex;

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_mapboxassignment_WhisperModule_nativeLoadModel(
        JNIEnv *env,
        jobject,
        jstring modelPath) {

    LOGI("========== nativeLoadModel ==========");

    std::lock_guard<std::mutex> lock(g_whisper_mutex);

    if (g_ctx != nullptr) {
        whisper_free(g_ctx);
        g_ctx = nullptr;
    }

    const char *path = env->GetStringUTFChars(modelPath, nullptr);

    LOGI("Model Path : %s", path);

    whisper_context_params ctxParams = whisper_context_default_params();
    ctxParams.use_gpu = false;

    #if ENABLE_WHISPER_LOGS
whisper_log_set([](ggml_log_level level, const char *text, void *) {
    __android_log_print(
            ANDROID_LOG_INFO,
            "WHISPER_CORE",
            "[%d] %s",
            level,
            text);
}, nullptr);
#else
whisper_log_set(nullptr, nullptr);
#endif

    g_ctx = whisper_init_from_file_with_params(path, ctxParams);

    env->ReleaseStringUTFChars(modelPath, path);

    if (g_ctx == nullptr) {
        LOGE("Failed to load Whisper model");
        return JNI_FALSE;
    }

    LOGI("Context     : %p", g_ctx);
    LOGI("Vocabulary  : %d", whisper_n_vocab(g_ctx));

    if (whisper_n_vocab(g_ctx) <= 0) {
        LOGE("Invalid Whisper model");

        whisper_free(g_ctx);
        g_ctx = nullptr;

        return JNI_FALSE;
    }

    LOGI("Model loaded successfully");

    LOGI("%s", whisper_print_system_info());

    LOGI("====================================");

    return JNI_TRUE;
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_mapboxassignment_WhisperModule_nativeTranscribe(
        JNIEnv *env,
        jobject,
        jstring audioPath,
        jstring language,
        jboolean translate) {

    LOGI("========== nativeTranscribe ==========");

    std::lock_guard<std::mutex> lock(g_whisper_mutex);

    if (g_ctx == nullptr) {
        LOGE("Context is NULL");
        return env->NewStringUTF("Model not loaded");
    }

    const char *path = env->GetStringUTFChars(audioPath, nullptr);

    if (language != nullptr) {
        const char *languageChars = env->GetStringUTFChars(language, nullptr);
        if (languageChars != nullptr) {
            env->ReleaseStringUTFChars(language, languageChars);
        }
    }

    LOGI("Audio Path : %s", path);

    drwav wav;

    LOGI("Opening WAV...");

    if (!drwav_init_file(&wav, path, nullptr)) {

        LOGE("Failed to open WAV");

        env->ReleaseStringUTFChars(audioPath, path);

        return env->NewStringUTF("Unable to open WAV");
    }

    LOGI("WAV opened successfully");

    LOGI("Channels        : %d", wav.channels);
    LOGI("Sample Rate     : %u", wav.sampleRate);
    LOGI("Bits Per Sample : %d", wav.bitsPerSample);
    LOGI("Frames          : %llu",
         (unsigned long long) wav.totalPCMFrameCount);

    const uint64_t totalFrames = wav.totalPCMFrameCount;
    const uint32_t sampleRate = wav.sampleRate;
    const float durationSec = totalFrames / (float) sampleRate;

    LOGI("Duration        : %.2f sec", durationSec);

    if (wav.channels != 1) {

        LOGE("Audio is not mono");

        drwav_uninit(&wav);
        env->ReleaseStringUTFChars(audioPath, path);

        return env->NewStringUTF("Whisper requires mono audio");
    }

    if (wav.bitsPerSample != 16) {

        LOGE("Audio is not 16-bit PCM");

        drwav_uninit(&wav);
        env->ReleaseStringUTFChars(audioPath, path);

        return env->NewStringUTF("Only 16-bit PCM WAV supported");
    }

    if (wav.totalPCMFrameCount == 0) {

        LOGE("Empty WAV");

        drwav_uninit(&wav);
        env->ReleaseStringUTFChars(audioPath, path);

        return env->NewStringUTF("Empty WAV");
    }

    if (wav.sampleRate != 16000) {
        LOGI("WARNING: Sample rate is %u (expected 16000)",
             wav.sampleRate);
    }

    LOGI("Allocating PCM buffer...");

    std::vector<int16_t> pcm16(totalFrames);

    LOGI("Reading PCM...");

    uint64_t framesRead =
            drwav_read_pcm_frames_s16(
                    &wav,
                    totalFrames,
                    pcm16.data());

    LOGI("Frames Read : %llu",
         (unsigned long long) framesRead);

    drwav_uninit(&wav);

    env->ReleaseStringUTFChars(audioPath, path);

    if (framesRead != totalFrames) {

        LOGE("Failed to read complete WAV (%llu/%llu)",
             (unsigned long long) framesRead,
             (unsigned long long) totalFrames);

        return env->NewStringUTF("Failed to read WAV");
    }

    LOGI("Converting PCM -> Float...");

    std::vector<float> pcmf32(pcm16.size());

    for (size_t i = 0; i < pcm16.size(); ++i) {
        pcmf32[i] = pcm16[i] / 32768.0f;
    }

    LOGI("First 10 Samples:");

    for (int i = 0; i < 10 && i < (int)pcmf32.size(); ++i) {
        LOGI("[%d] = %f", i, pcmf32[i]);
    }

    // ---------------------------------------------------
    // Check if audio is basically silent
    // ---------------------------------------------------

    float maxAmp = 0.0f;

    for (float s : pcmf32) {
        maxAmp = std::max(maxAmp, std::abs(s));
    }

    LOGI("Max amplitude = %f", maxAmp);

    if (maxAmp < 0.0005f) {
        LOGE("Audio appears silent");
        return env->NewStringUTF("Audio is silent");
    }

    whisper_full_params params =
            whisper_full_default_params(
                    WHISPER_SAMPLING_GREEDY);

    // Safe thread count
    const unsigned int hw = std::thread::hardware_concurrency();
    params.n_threads = hw == 0 ? 4 : std::min(4u, hw);

    params.print_progress = false;
    params.print_special = false;
    params.print_realtime = false;
    params.print_timestamps = false;

    params.translate = false;
    params.language = "en";
    params.detect_language = false;

    params.no_context = true;
    params.no_timestamps = true;
    params.single_segment = true;

    params.offset_ms = 0;
    params.duration_ms = 0;

    params.max_tokens = 48;

    params.suppress_blank = false;
    params.suppress_nst = false;

    params.temperature = 0.0f;
    params.temperature_inc = 0.2f;

    params.greedy.best_of = 1;
    params.thold_pt = 0.01f;
    params.thold_ptsum = 0.01f;
    params.no_speech_thold = 0.95f;

    const int maxAudioCtx = whisper_n_audio_ctx(g_ctx);
    if (durationSec > 0.0f && maxAudioCtx > 0) {
        const int requestedAudioCtx =
                std::max(128, (int) std::ceil(durationSec * 50.0f) + 24);
        params.audio_ctx = std::min(maxAudioCtx, requestedAudioCtx);
    } else {
        params.audio_ctx = 128;
    }

    LOGI("========== Whisper ==========");
    LOGI("Context  : %p", g_ctx);
    LOGI("Samples  : %d", (int)pcmf32.size());
    LOGI("Threads  : %d", params.n_threads);
    LOGI("Language : %s", params.language);
    LOGI("Translate: %d", params.translate);
    LOGI("AudioCtx : %d", params.audio_ctx);
    LOGI("MaxTokens: %d", params.max_tokens);
    LOGI("=============================");

    LOGI("Calling whisper_full()...");

    const int ret =
            whisper_full(
                    g_ctx,
                    params,
                    pcmf32.data(),
                    (int)pcmf32.size());

    LOGI("whisper_full returned %d", ret);

    if (ret != 0) {

        LOGE("whisper_full failed");

        return env->NewStringUTF("Transcription failed");
    }

    whisper_print_timings(g_ctx);

    LOGI("Collecting transcript...");

    std::string transcript;

    const int n = whisper_full_n_segments(g_ctx);

    LOGI("Segments : %d", n);

    for (int i = 0; i < n; ++i) {

        const char *text =
                whisper_full_get_segment_text(g_ctx, i);

        LOGI("Segment %d : %s", i, text);

        transcript += text;
    }

   transcript.erase(0, transcript.find_first_not_of(" \n\r\t"));

size_t end = transcript.find_last_not_of(" \n\r\t");
if (end != std::string::npos) {
    transcript.erase(end + 1);
}

if (transcript.empty()) {
    transcript = "No speech detected.";
}

    LOGI("Transcript : %s", transcript.c_str());

    LOGI("========== nativeTranscribe DONE ==========");

    return env->NewStringUTF(transcript.c_str());
}

extern "C"
JNIEXPORT void JNICALL
Java_com_mapboxassignment_WhisperModule_nativeReleaseModel(
        JNIEnv *,
        jobject) {

    LOGI("========== nativeReleaseModel ==========");

    std::lock_guard<std::mutex> lock(g_whisper_mutex);

    if (g_ctx != nullptr) {
        whisper_free(g_ctx);
        g_ctx = nullptr;
    }

    LOGI("Model released");
}
