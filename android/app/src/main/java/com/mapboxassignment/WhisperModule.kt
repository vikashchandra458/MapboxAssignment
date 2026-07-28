package com.mapboxassignment

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.Executors

class WhisperModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val ENABLE_WHISPER_LOGS = false
        private const val TAG = "WhisperRN"

        private fun logD(message: String) {
            if (ENABLE_WHISPER_LOGS) {
                Log.d(TAG, message)
            }
        }

        private fun logE(message: String, throwable: Throwable? = null) {
            if (ENABLE_WHISPER_LOGS) {
                if (throwable != null) {
                    Log.e(TAG, message, throwable)
                } else {
                    Log.e(TAG, message)
                }
            }
        }

        init {
            logD("Loading native-lib...")
            System.loadLibrary("native-lib")
            logD("native-lib loaded")
        }

        private val whisperExecutor = Executors.newSingleThreadExecutor()
    }

    override fun getName() = "WhisperModule"

    @ReactMethod
    fun loadModel(modelPath: String, promise: Promise) {
        logD("loadModel()")
        logD("Model path: $modelPath")

        whisperExecutor.execute {
            try {
                val loaded = nativeLoadModel(modelPath)

                logD("nativeLoadModel finished")

                promise.resolve(loaded)
            } catch (t: Throwable) {
                logE("loadModel failed", t)
                promise.reject("LOAD_MODEL_ERROR", t)
            }
        }
    }

    @ReactMethod
    fun transcribe(audioPath: String, promise: Promise) {
        logD("================================")
        logD("transcribe() called")
        logD("Audio path: $audioPath")

        whisperExecutor.execute {
            try {
                logD("Calling nativeTranscribe()")

                val result = nativeTranscribe(audioPath)

                logD("nativeTranscribe returned")
                logD("Result: $result")

                promise.resolve(result)

            } catch (t: Throwable) {
                logE("transcribe failed", t)
                promise.reject("TRANSCRIBE_ERROR", t)
            }
        }
    }

    @ReactMethod
    fun releaseModel(promise: Promise) {
        logD("releaseModel()")

        whisperExecutor.execute {
            try {
                nativeReleaseModel()

                logD("nativeReleaseModel finished")

                promise.resolve(true)

            } catch (t: Throwable) {
                logE("release failed", t)
                promise.reject("RELEASE_MODEL_ERROR", t)
            }
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    private external fun nativeLoadModel(modelPath: String): Boolean
    private external fun nativeTranscribe(audioPath: String): String
    private external fun nativeReleaseModel()
}