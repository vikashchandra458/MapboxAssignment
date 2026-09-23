package com.mapboxassignment

import android.app.Activity
import android.hardware.display.DisplayManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Display
import android.view.WindowManager
import java.util.concurrent.Executor
import java.util.function.Consumer

class ScreenCaptureManager(
    private val activity: Activity,
    private val onRecordingStarted: () -> Unit,
    private val onRecordingStopped: () -> Unit
) {
    private val executor = Executor { command ->
        Handler(Looper.getMainLooper()).post(command)
    }

    private val mainHandler = Handler(Looper.getMainLooper())

    private val displayManager =
        activity.getSystemService(DisplayManager::class.java)

    private var callback: Activity.ScreenCaptureCallback? = null
    private var screenRecordingCallback: Consumer<Int>? = null

    private var isRegistered = false
    private var isRecording = false

    private val displayListener = object : DisplayManager.DisplayListener {
        override fun onDisplayAdded(displayId: Int) {
            evaluateRecordingState()
        }

        override fun onDisplayRemoved(displayId: Int) {
            evaluateRecordingState()
        }

        override fun onDisplayChanged(displayId: Int) {
            evaluateRecordingState()
        }
    }

    private val recordingPoll = object : Runnable {
        override fun run() {
            evaluateRecordingState()
            mainHandler.postDelayed(this, RECORDING_POLL_INTERVAL_MS)
        }
    }

    fun register() {

        if (isRegistered)
            return

        if (registerScreenRecordingCallback()) {
            isRegistered = true
            Log.d(TAG, "Screen recording callback registered")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            callback = Activity.ScreenCaptureCallback {

                Log.d(TAG, "Screen capture detected")

                evaluateRecordingState()

            }
        }

        try {

            callback?.let {
                activity.registerScreenCaptureCallback(
                    executor,
                    it
                )
            }

            displayManager.registerDisplayListener(
                displayListener,
                mainHandler
            )

            mainHandler.post(recordingPoll)

            isRegistered = true

            evaluateRecordingState()

            Log.d(TAG, "Screen capture monitoring registered")

        } catch (e: Exception) {

            Log.e(TAG, "Register Error", e)

        }
    }

    fun unregister() {

        if (!isRegistered)
            return

        try {
            unregisterScreenRecordingCallback()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                callback?.let {

                    activity.unregisterScreenCaptureCallback(it)

                }
            }

            mainHandler.removeCallbacks(recordingPoll)
            displayManager.unregisterDisplayListener(displayListener)

            isRegistered = false

            setRecording(false)

            Log.d(TAG, "Screen capture monitoring unregistered")

        } catch (e: Exception) {

            Log.e(TAG, "Unregister Error", e)

        }
    }

    fun isScreenRecording(): Boolean {
        evaluateRecordingState()
        return isRecording
    }

    private fun registerScreenRecordingCallback(): Boolean {
        if (Build.VERSION.SDK_INT < ANDROID_15_API_LEVEL)
            return false

        return try {
            val windowManager = activity.getSystemService(WindowManager::class.java)
            val addCallbackMethod = WindowManager::class.java.getMethod(
                "addScreenRecordingCallback",
                Executor::class.java,
                Consumer::class.java
            )
            val visibleState = WindowManager::class.java
                .getField("SCREEN_RECORDING_STATE_VISIBLE")
                .getInt(null)

            val callback = Consumer<Int> { state ->
                setRecording(state == visibleState)
            }

            screenRecordingCallback = callback

            val currentState = addCallbackMethod.invoke(
                windowManager,
                executor,
                callback
            ) as Int

            setRecording(currentState == visibleState)

            true
        } catch (e: Exception) {
            Log.e(TAG, "Screen recording callback unavailable", e)
            screenRecordingCallback = null
            false
        }
    }

    private fun unregisterScreenRecordingCallback() {
        val callback = screenRecordingCallback ?: return

        if (Build.VERSION.SDK_INT < ANDROID_15_API_LEVEL)
            return

        try {
            val windowManager = activity.getSystemService(WindowManager::class.java)
            val removeCallbackMethod = WindowManager::class.java.getMethod(
                "removeScreenRecordingCallback",
                Consumer::class.java
            )

            removeCallbackMethod.invoke(windowManager, callback)
        } catch (e: Exception) {
            Log.e(TAG, "Screen recording callback unregister error", e)
        } finally {
            screenRecordingCallback = null
        }
    }

    private fun evaluateRecordingState() {
        if (screenRecordingCallback != null)
            return

        setRecording(hasCaptureDisplay())
    }

    private fun hasCaptureDisplay(): Boolean {
        return displayManager.displays.any { display ->
            val displayName = display.name.lowercase()

            display.displayId != Display.DEFAULT_DISPLAY &&
                CAPTURE_DISPLAY_KEYWORDS.any { keyword ->
                    displayName.contains(keyword)
                }
        }
    }

    private fun setRecording(recording: Boolean) {
        if (isRecording == recording)
            return

        isRecording = recording

        if (recording) {
            onRecordingStarted()
        } else {
            onRecordingStopped()
        }
    }

    companion object {
        private const val TAG = "ScreenCaptureManager"
        private const val ANDROID_15_API_LEVEL = 35
        private const val RECORDING_POLL_INTERVAL_MS = 1000L
        private val CAPTURE_DISPLAY_KEYWORDS =
            listOf("virtual", "record", "capture", "mirror", "cast", "scrcpy")
    }
}
