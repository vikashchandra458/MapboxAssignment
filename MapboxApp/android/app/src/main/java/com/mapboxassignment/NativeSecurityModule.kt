package com.mapboxassignment

import android.app.Activity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NativeSecurityModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext),
    LifecycleEventListener {

    private val securityManager =
        SecurityManager(reactContext, ::sendEvent)

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return "NativeSecurity"
    }

    @ReactMethod
    fun enable(options: ReadableMap?, promise: Promise) {
        try {
            securityManager.enable(options)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ENABLE_ERROR", e)
        }
    }

    @ReactMethod
    fun disable(promise: Promise) {
        try {
            securityManager.disable()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("DISABLE_ERROR", e)
        }
    }

    @ReactMethod
    fun isScreenRecording(promise: Promise) {
        try {
            promise.resolve(securityManager.isScreenRecording())
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", e)
        }
    }

    @ReactMethod
    fun getProtectionStatus(promise: Promise) {
        try {
            promise.resolve(securityManager.getProtectionStatus())
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required by React Native EventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required by React Native EventEmitter
    }

    override fun onHostResume() {
        currentActivity?.let {
            securityManager.attachActivity(it)
        }
    }

    override fun onHostPause() {
        securityManager.detachActivity()
    }

    override fun onHostDestroy() {
        securityManager.detachActivity()
    }

    private fun sendEvent(
        event: String,
        params: WritableMap? = null
    ) {
        reactApplicationContext
            .getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
            )
            .emit(event, params)
    }
}