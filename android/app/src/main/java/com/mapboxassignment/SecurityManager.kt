package com.mapboxassignment

import android.app.Activity
import android.os.Build
import android.util.Log
import android.view.WindowManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap

class SecurityManager(
    private val reactContext: ReactApplicationContext,
    private val sendEvent: (String, WritableMap?) -> Unit
) {

    companion object {
        private const val TAG = "SecurityManager"
    }

    private var activity: Activity? = null
    private var screenCaptureManager: ScreenCaptureManager? = null

    private var screenshotEnabled = false
    private var recordingEnabled = false
    private var appSwitcherEnabled = false

    @Volatile
    private var isRecording = false

    fun attachActivity(activity: Activity) {

        this.activity = activity

        screenCaptureManager?.unregister()

        screenCaptureManager = ScreenCaptureManager(
            activity = activity,
            onRecordingStarted = {

                Log.d(TAG, "Recording Started Callback")

                if (!isRecording) {
                    isRecording = true
                    sendRecordingStarted()
                }
            },
            onRecordingStopped = {

                Log.d(TAG, "Recording Stopped Callback")

                if (isRecording) {
                    isRecording = false
                    sendRecordingStopped()
                }
            }
        )

        if (
            screenshotEnabled ||
            recordingEnabled ||
            appSwitcherEnabled
        ) {
            updateSecureFlag()
        }

        if (recordingEnabled) {
            screenCaptureManager?.register()
        }
    }

    fun detachActivity() {

        screenCaptureManager?.unregister()
        screenCaptureManager = null
        activity = null
    }

    fun enable(options: ReadableMap?) {

        screenshotEnabled =
            options?.getBoolean("screenshot") ?: true

        recordingEnabled =
            options?.getBoolean("record") ?: true

        appSwitcherEnabled =
            options?.getBoolean("appSwitcher") ?: true

        updateSecureFlag()

        if (recordingEnabled) {
            screenCaptureManager?.register()
        } else {
            screenCaptureManager?.unregister()
            isRecording = false
        }

        sendProtectionChanged()
    }

    fun disable() {

        screenshotEnabled = false
        recordingEnabled = false
        appSwitcherEnabled = false

        screenCaptureManager?.unregister()

        isRecording = false

        clearSecureFlag()

        sendProtectionChanged()
    }

    fun isScreenRecording(): Boolean = isRecording

    fun getProtectionStatus(): WritableMap {

        val map = Arguments.createMap()

        map.putBoolean("screenshot", screenshotEnabled)
        map.putBoolean("record", recordingEnabled)
        map.putBoolean("appSwitcher", appSwitcherEnabled)
        map.putBoolean("isRecording", isRecording)

        return map
    }

    private fun updateSecureFlag() {
        if (screenshotEnabled || appSwitcherEnabled) {
            applySecureFlag()
        } else {
            clearSecureFlag()
        }
    }

    private fun applySecureFlag() {

        val activity = currentActivity() ?: return

        activity.runOnUiThread {

            activity.window.addFlags(
                WindowManager.LayoutParams.FLAG_SECURE
            )

            Log.d(TAG, "FLAG_SECURE Applied")
        }
    }

    private fun clearSecureFlag() {

        val activity = currentActivity() ?: return

        activity.runOnUiThread {

            activity.window.clearFlags(
                WindowManager.LayoutParams.FLAG_SECURE
            )

            Log.d(TAG, "FLAG_SECURE Cleared")
        }
    }

    private fun sendProtectionChanged() {

        val map = Arguments.createMap()

        map.putString("type", "PROTECTION_CHANGED")
        map.putMap("status", getProtectionStatus())

        sendEvent("NativeSecurityEvent", map)
    }

    private fun sendRecordingStarted() {

        val map = Arguments.createMap()

        map.putString("type", "RECORDING_STARTED")

        sendEvent("NativeSecurityEvent", map)
    }

    private fun sendRecordingStopped() {

        val map = Arguments.createMap()

        map.putString("type", "RECORDING_STOPPED")

        sendEvent("NativeSecurityEvent", map)
    }

    private fun currentActivity(): Activity? {
        return activity ?: reactContext.currentActivity
    }
}
