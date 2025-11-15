package com.dkurve.betterislamqa.prayerwidget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.app.PendingIntent;
import android.content.Intent;
import android.util.Log;
import android.os.Build;

/**
 * Prayer Time Widget Provider
 * Handles widget display and updates
 */
public class PrayerTimeWidgetProvider extends AppWidgetProvider {

    private static final String TAG = "PrayerTimeWidget";
    private static final String PREFS_NAME = "PrayerWidgetPrefs";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "onUpdate called for " + appWidgetIds.length + " widgets");

        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        Log.d(TAG, "First widget added");
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        Log.d(TAG, "Last widget removed");
    }

    /**
     * Update a single widget instance
     */
    private void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            // Read prayer data from SharedPreferences
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

            // All prayer times
            String fajrTime = prefs.getString("fajr_time", "--:--");
            String dhuhrTime = prefs.getString("dhuhr_time", "--:--");
            String asrTime = prefs.getString("asr_time", "--:--");
            String maghribTime = prefs.getString("maghrib_time", "--:--");
            String ishaTime = prefs.getString("isha_time", "--:--");

            // Current/Next prayer info
            String nextPrayer = prefs.getString("next_prayer", "Fajr");
            String timeRemaining = prefs.getString("time_remaining", "--:--");
            String currentPrayer = prefs.getString("current_prayer", "");

            String packageName = context.getPackageName();
            Log.d(TAG, "Updating widget - Package: " + packageName + ", Next: " + nextPrayer + ", Current: " + currentPrayer + ", Time: " + timeRemaining);

            // Get layout ID
            int layoutId = context.getResources().getIdentifier(
                "widget_prayer_time_simple", "layout", packageName);

            if (layoutId == 0) {
                Log.e(TAG, "Could not find widget_prayer_time_simple layout in package: " + packageName);
                return;
            }

            Log.d(TAG, "Using layout ID: " + layoutId);

            // Create RemoteViews
            RemoteViews views = new RemoteViews(packageName, layoutId);

            // Update countdown timer with next prayer info
            String displayText = (currentPrayer.isEmpty() ? "Next: " : "Current: ") +
                                 (currentPrayer.isEmpty() ? nextPrayer : currentPrayer) +
                                 " in " + timeRemaining;

            int timeRemainingId = context.getResources().getIdentifier("time_remaining", "id", packageName);
            if (timeRemainingId != 0) {
                views.setTextViewText(timeRemainingId, displayText);
                Log.d(TAG, "Updated time_remaining with: " + displayText);
            } else {
                Log.e(TAG, "Could not find time_remaining TextView");
            }

        // Create intent to open app when widget is clicked
        Intent launchIntent = context.getPackageManager()
            .getLaunchIntentForPackage(context.getPackageName());

        if (launchIntent != null) {
            // Add deep link to prayer times view
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            launchIntent.putExtra("openPrayerTimes", true);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                launchIntent,
                flags
            );

            views.setOnClickPendingIntent(
                context.getResources().getIdentifier("widget_container", "id", context.getPackageName()),
                pendingIntent
            );
        }

            // Update widget
            appWidgetManager.updateAppWidget(appWidgetId, views);
            Log.d(TAG, "Widget " + appWidgetId + " updated successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error updating widget: " + e.getMessage(), e);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        String action = intent.getAction();
        Log.d(TAG, "onReceive: " + action);

        if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(action)) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] ids = appWidgetManager.getAppWidgetIds(
                new android.content.ComponentName(context, PrayerTimeWidgetProvider.class));

            if (ids != null && ids.length > 0) {
                this.onUpdate(context, appWidgetManager, ids);
            }
        }
    }
}
