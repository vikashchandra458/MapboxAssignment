package com.mapboxassignment

import android.app.PictureInPictureParams
import android.os.Build
import android.util.Rational
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PipModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PipModule"

    @ReactMethod
    fun enterPip(promise: Promise) {

        val activity = currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity is null")
            return
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            promise.reject("NOT_SUPPORTED", "PiP requires Android 8+")
            return
        }

        try {
            val params = PictureInPictureParams.Builder()
                .setAspectRatio(Rational(16, 9))
                .build()

            val success = activity.enterPictureInPictureMode(params)

            promise.resolve(success)

        } catch (e: Exception) {
            promise.reject("PIP_ERROR", e)
        }
    }

    @ReactMethod
    fun isInPip(promise: Promise) {

        val activity = currentActivity

        if (activity == null) {
            promise.resolve(false)
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            promise.resolve(activity.isInPictureInPictureMode)
        } else {
            promise.resolve(false)
        }
    }

    /**
     * Required by NativeEventEmitter.
     */
    @ReactMethod
    fun addListener(eventName: String) {
        // Keep empty
    }

    /**
     * Required by NativeEventEmitter.
     */
    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep empty
    }
}