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
                "widget_prayer_time_full", "layout", packageName);

            if (layoutId == 0) {
                Log.e(TAG, "Could not find widget_prayer_time_full layout in package: " + packageName);
                return;
            }

            Log.d(TAG, "Using layout ID: " + layoutId);

            // Create RemoteViews
            RemoteViews views = new RemoteViews(packageName, layoutId);

            // Safely update prayer times - each in try-catch to prevent single failure from breaking widget
            safeSetText(views, context, "fajr_time", fajrTime);
            safeSetText(views, context, "dhuhr_time", dhuhrTime);
            safeSetText(views, context, "asr_time", asrTime);
            safeSetText(views, context, "maghrib_time", maghribTime);
            safeSetText(views, context, "isha_time", ishaTime);

            // Update countdown timer
            safeSetText(views, context, "time_remaining", timeRemaining);

            // Update footer label
            String labelText = currentPrayer.isEmpty() ? "Next: " + nextPrayer : "Current: " + currentPrayer;
            safeSetText(views, context, "next_prayer_label", labelText);

            // Highlight current or next prayer row
            highlightPrayerRow(views, context, currentPrayer.isEmpty() ? nextPrayer : currentPrayer);

            Log.d(TAG, "Widget updated - Next: " + nextPrayer + ", Current: " + currentPrayer + ", Time: " + timeRemaining);

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

    /**
     * Safely set text on a TextView - won't crash widget if view not found
     */
    private void safeSetText(RemoteViews views, Context context, String viewName, String text) {
        try {
            int viewId = context.getResources().getIdentifier(viewName, "id", context.getPackageName());
            if (viewId != 0) {
                views.setTextViewText(viewId, text);
            } else {
                Log.w(TAG, "View not found: " + viewName);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting text for " + viewName + ": " + e.getMessage());
        }
    }

    /**
     * Highlight the row for current/next prayer
     */
    private void highlightPrayerRow(RemoteViews views, Context context, String prayerName) {
        try {
            // Reset all row backgrounds to transparent
            int transparentColor = android.graphics.Color.parseColor("#00FFFFFF");
            int highlightColor = android.graphics.Color.parseColor("#40FFFFFF"); // White with 25% opacity

            String[] prayers = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
            for (String prayer : prayers) {
                String rowName = prayer + "_row";
                int rowId = context.getResources().getIdentifier(rowName, "id", context.getPackageName());
                if (rowId != 0) {
                    views.setInt(rowId, "setBackgroundColor", transparentColor);
                }
            }

            // Highlight the active prayer row
            String activeRowName = prayerName.toLowerCase() + "_row";
            int activeRowId = context.getResources().getIdentifier(activeRowName, "id", context.getPackageName());
            if (activeRowId != 0) {
                views.setInt(activeRowId, "setBackgroundColor", highlightColor);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error highlighting prayer row: " + e.getMessage());
        }
    }
}
