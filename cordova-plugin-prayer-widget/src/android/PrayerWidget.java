package com.dkurve.betterislamqa.prayerwidget;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.SharedPreferences;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.util.Log;

/**
 * PrayerWidget Cordova Plugin
 * Bridges JavaScript calls to native Android widget updates
 */
public class PrayerWidget extends CordovaPlugin {

    private static final String TAG = "PrayerWidget";
    private static final String PREFS_NAME = "PrayerWidgetPrefs";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext)
            throws JSONException {

        Log.d(TAG, "Execute action: " + action);

        if (action.equals("updateWidget")) {
            JSONObject prayerData = args.getJSONObject(0);
            this.updateWidget(prayerData, callbackContext);
            return true;
        }
        else if (action.equals("isWidgetInstalled")) {
            this.isWidgetInstalled(callbackContext);
            return true;
        }
        else if (action.equals("forceUpdate")) {
            this.forceUpdate(callbackContext);
            return true;
        }

        return false;
    }

    /**
     * Update widget with new prayer time data
     */
    private void updateWidget(JSONObject prayerData, CallbackContext callbackContext) {
        Context context = cordova.getActivity().getApplicationContext();

        // Save data to SharedPreferences so widget can access it
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        // All prayer times
        editor.putString("fajr_time", prayerData.optString("fajr", "--:--"));
        editor.putString("dhuhr_time", prayerData.optString("dhuhr", "--:--"));
        editor.putString("asr_time", prayerData.optString("asr", "--:--"));
        editor.putString("maghrib_time", prayerData.optString("maghrib", "--:--"));
        editor.putString("isha_time", prayerData.optString("isha", "--:--"));

        // Current/Next prayer info
        editor.putString("next_prayer", prayerData.optString("nextPrayer", "Fajr"));
        editor.putString("next_prayer_time", prayerData.optString("nextPrayerTime", "--:--"));
        editor.putString("time_remaining", prayerData.optString("timeRemaining", "--:--"));
        editor.putString("current_prayer", prayerData.optString("currentPrayer", ""));
        editor.putString("current_prayer_end", prayerData.optString("currentPrayerEnd", ""));
        editor.putLong("last_updated", System.currentTimeMillis());
        editor.apply();

        Log.d(TAG, "Widget data saved: " + prayerData.toString());

        // Trigger widget update
        this.triggerWidgetUpdate(context);

        callbackContext.success("Widget updated successfully");
    }

    /**
     * Check if widget is installed (added to home screen)
     */
    private void isWidgetInstalled(CallbackContext callbackContext) {
        try {
            Context context = cordova.getActivity().getApplicationContext();
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);

            int[] ids = appWidgetManager.getAppWidgetIds(
                new ComponentName(context, PrayerTimeWidgetProvider.class));

            boolean isInstalled = ids.length > 0;
            Log.d(TAG, "Widget installed: " + isInstalled + " (count: " + ids.length + ")");

            callbackContext.success(isInstalled ? 1 : 0);
        } catch (Exception e) {
            Log.e(TAG, "Error checking widget installation: " + e.getMessage());
            callbackContext.error("Failed to check widget installation: " + e.getMessage());
        }
    }

    /**
     * Force widget update (useful for testing)
     */
    private void forceUpdate(CallbackContext callbackContext) {
        try {
            Context context = cordova.getActivity().getApplicationContext();
            this.triggerWidgetUpdate(context);
            callbackContext.success("Widget force update triggered");
        } catch (Exception e) {
            Log.e(TAG, "Error forcing widget update: " + e.getMessage());
            callbackContext.error("Failed to force widget update: " + e.getMessage());
        }
    }

    /**
     * Trigger widget update broadcast
     */
    private void triggerWidgetUpdate(Context context) {
        Intent intent = new Intent(context, PrayerTimeWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);

        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] ids = appWidgetManager.getAppWidgetIds(
            new ComponentName(context, PrayerTimeWidgetProvider.class));

        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);

        Log.d(TAG, "Widget update broadcast sent to " + ids.length + " widgets");
    }
}
