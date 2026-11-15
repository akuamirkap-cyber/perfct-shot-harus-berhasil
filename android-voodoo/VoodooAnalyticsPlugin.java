package com.amirkap.perfectshot;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import com.adjust.sdk.Adjust;
import com.adjust.sdk.AdjustConfig;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsConstants;
import com.facebook.appevents.AppEventsLogger;
import com.gameanalytics.sdk.GAProgressionStatus;
import com.gameanalytics.sdk.GameAnalytics;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "VoodooAnalytics")
public class VoodooAnalyticsPlugin extends Plugin {
  private static final String TAG = "VoodooAnalytics";
  private static boolean initialized = false;
  private static boolean lifecycleRegistered = false;
  private static boolean gaReady = false;
  private static boolean fbReady = false;

  @Override
  public void load() {
    // Intentionally do NOT initialize GameAnalytics, Adjust, or Facebook here.
    // Voodoo / EU GDPR compliance requires verifying user consent first;
    // JS calls initialize(...) only after the player accepts GDPR consent.
  }

  @PluginMethod
  public void initialize(PluginCall call) {
    String gaGameKey = firstNonEmpty(call.getString("gaGameKey"), readStringRes("ga_game_key"));
    String gaSecretKey = firstNonEmpty(call.getString("gaSecretKey"), readStringRes("ga_secret_key"));
    String adjustToken = firstNonEmpty(call.getString("adjustToken"), readStringRes("adjust_app_token"));
    Boolean sandboxOpt = call.getBoolean("adjustSandbox");
    boolean adjustSandbox = sandboxOpt != null
      ? sandboxOpt
      : "true".equalsIgnoreCase(readStringRes("adjust_sandbox"));
    String fbAppId = firstNonEmpty(call.getString("fbAppId"), readStringRes("facebook_app_id"));
    String fbClientToken = firstNonEmpty(call.getString("fbClientToken"), readStringRes("facebook_client_token"));

    initSdks(gaGameKey, gaSecretKey, adjustToken, adjustSandbox, fbAppId, fbClientToken);
    call.resolve();
  }

  @PluginMethod
  public void onGameStarted(PluginCall call) {
    int level = Math.max(1, call.getInt("level", 1));
    String progression = "Level_" + level;
    if (gaReady) {
      try {
        GameAnalytics.addProgressionEvent(GAProgressionStatus.Start, progression);
      } catch (Throwable t) {
        Log.w(TAG, "GA Start failed", t);
      }
    }
    call.resolve();
  }

  @PluginMethod
  public void onGameFinished(PluginCall call) {
    boolean isWinner = Boolean.TRUE.equals(call.getBoolean("isWinner", false));
    int level = Math.max(1, call.getInt("level", 1));
    int score = Math.max(0, call.getInt("score", 0));
    String progression = "Level_" + level;

    if (gaReady) {
      try {
        GAProgressionStatus status = isWinner ? GAProgressionStatus.Complete : GAProgressionStatus.Fail;
        GameAnalytics.addProgressionEvent(status, progression, (double) score);
      } catch (Throwable t) {
        Log.w(TAG, "GA Finish failed", t);
      }
    }

    if (fbReady && isWinner) {
      try {
        AppEventsLogger logger = AppEventsLogger.newLogger(getContext());
        Bundle params = new Bundle();
        params.putString(AppEventsConstants.EVENT_PARAM_LEVEL, String.valueOf(level));
        logger.logEvent(AppEventsConstants.EVENT_NAME_ACHIEVED_LEVEL, params);
      } catch (Throwable t) {
        Log.w(TAG, "FB AchievedLevel failed", t);
      }
    }

    call.resolve();
  }

  @PluginMethod
  public void onDesignEvent(PluginCall call) {
    String eventId = call.getString("eventId", "");
    Double value = call.getDouble("value");
    if (gaReady && eventId != null && !eventId.isEmpty()) {
      try {
        if (value != null) {
          GameAnalytics.addDesignEvent(eventId, value.doubleValue());
        } else {
          GameAnalytics.addDesignEvent(eventId);
        }
      } catch (Throwable t) {
        Log.w(TAG, "GA DesignEvent failed", t);
      }
    }
    call.resolve();
  }

  private synchronized void initSdks(
    String gaGameKey,
    String gaSecretKey,
    String adjustToken,
    boolean adjustSandbox,
    String fbAppId,
    String fbClientToken
  ) {
    if (initialized) return;

    Activity activity = getActivity();
    Context ctx = getContext();
    if (activity == null || ctx == null) return;
    Application app = activity.getApplication();

    boolean anyConfigured = false;

    if (!isEmpty(gaGameKey) && !isEmpty(gaSecretKey)) {
      anyConfigured = true;
      try {
        GameAnalytics.configureAutoDetectAppVersion(true);
        GameAnalytics.initialize(activity, gaGameKey, gaSecretKey);
        gaReady = true;
      } catch (Throwable t) {
        Log.w(TAG, "GameAnalytics init failed", t);
      }
    }

    if (!isEmpty(adjustToken)) {
      anyConfigured = true;
      try {
        String env = adjustSandbox
          ? AdjustConfig.ENVIRONMENT_SANDBOX
          : AdjustConfig.ENVIRONMENT_PRODUCTION;
        AdjustConfig config = new AdjustConfig(app, adjustToken, env);
        Adjust.onCreate(config);
        Adjust.onResume();
        if (!lifecycleRegistered) {
          lifecycleRegistered = true;
          app.registerActivityLifecycleCallbacks(new Application.ActivityLifecycleCallbacks() {
            @Override public void onActivityCreated(Activity a, Bundle b) {}
            @Override public void onActivityStarted(Activity a) {}
            @Override public void onActivityResumed(Activity a) { Adjust.onResume(); }
            @Override public void onActivityPaused(Activity a) { Adjust.onPause(); }
            @Override public void onActivityStopped(Activity a) {}
            @Override public void onActivitySaveInstanceState(Activity a, Bundle b) {}
            @Override public void onActivityDestroyed(Activity a) {}
          });
        }
      } catch (Throwable t) {
        Log.w(TAG, "Adjust init failed", t);
      }
    }

    if (!isEmpty(fbAppId) && !isEmpty(fbClientToken)) {
      anyConfigured = true;
      try {
        FacebookSdk.setApplicationId(fbAppId);
        FacebookSdk.setClientToken(fbClientToken);
        FacebookSdk.sdkInitialize(app);
        FacebookSdk.fullyInitialize();
        FacebookSdk.setAutoLogAppEventsEnabled(true);
        AppEventsLogger.activateApp(app);
        fbReady = true;
      } catch (Throwable t) {
        Log.w(TAG, "Facebook SDK init failed", t);
      }
    }

    if (anyConfigured) {
      initialized = true;
    }
  }

  private String readStringRes(String name) {
    try {
      Context ctx = getContext();
      if (ctx == null) return "";
      int id = ctx.getResources().getIdentifier(name, "string", ctx.getPackageName());
      return id != 0 ? ctx.getString(id).trim() : "";
    } catch (Throwable ignored) {
      return "";
    }
  }

  private static boolean isEmpty(String s) {
    return s == null || s.trim().isEmpty();
  }

  private static String firstNonEmpty(String primary, String fallback) {
    return !isEmpty(primary) ? primary.trim() : (!isEmpty(fallback) ? fallback.trim() : "");
  }
}
