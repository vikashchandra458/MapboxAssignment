package com.mapboxassignment

import android.app.PictureInPictureParams
import android.os.Build
import android.util.Rational
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class PipModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {

        @JvmStatic
        var instance: PipModule? = null
            private set

        @JvmStatic
        private var isVideoPlaying = false
    }

    init {
        instance = this
    }

    override fun getName(): String = "PipModule"

    @ReactMethod
    fun setVideoPlaying(isPlaying: Boolean) {
        isVideoPlaying = isPlaying
    }

    fun enterPipIfNeeded() {

        if (!isVideoPlaying) return

        val activity = currentActivity ?: return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            try {

                val params = PictureInPictureParams.Builder()
                    .setAspectRatio(Rational(16, 9))
                    .build()

                activity.enterPictureInPictureMode(params)

            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun notifyPipModeChanged(isInPip: Boolean) {

        val params = Arguments.createMap().apply {
            putBoolean("isInPictureInPictureMode", isInPip)
        }

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(
                "onPictureInPictureModeChanged",
                params
            )
    }

    @ReactMethod
    fun isInPip(promise: com.facebook.react.bridge.Promise) {
        promise.resolve(currentActivity?.isInPictureInPictureMode ?: false)
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}