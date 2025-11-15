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

        Log.d(TAG, "Updating widget - Next: " + nextPrayer + ", Current: " + currentPrayer + ", Time: " + timeRemaining);

        // Get layout ID
        int layoutId = context.getResources().getIdentifier(
            "widget_prayer_time", "layout", context.getPackageName());

        // Create RemoteViews
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

        // Update all prayer times
        views.setTextViewText(
            context.getResources().getIdentifier("fajr_time", "id", context.getPackageName()),
            fajrTime
        );
        views.setTextViewText(
            context.getResources().getIdentifier("dhuhr_time", "id", context.getPackageName()),
            dhuhrTime
        );
        views.setTextViewText(
            context.getResources().getIdentifier("asr_time", "id", context.getPackageName()),
            asrTime
        );
        views.setTextViewText(
            context.getResources().getIdentifier("maghrib_time", "id", context.getPackageName()),
            maghribTime
        );
        views.setTextViewText(
            context.getResources().getIdentifier("isha_time", "id", context.getPackageName()),
            ishaTime
        );

        // Update countdown timer
        views.setTextViewText(
            context.getResources().getIdentifier("time_remaining", "id", context.getPackageName()),
            timeRemaining
        );

        // Reset all row backgrounds
        int transparentColor = android.graphics.Color.parseColor("#00FFFFFF");
        int highlightColor = android.graphics.Color.parseColor("#40FFFFFF"); // White with 25% opacity

        views.setInt(
            context.getResources().getIdentifier("fajr_row", "id", context.getPackageName()),
            "setBackgroundColor", transparentColor
        );
        views.setInt(
            context.getResources().getIdentifier("dhuhr_row", "id", context.getPackageName()),
            "setBackgroundColor", transparentColor
        );
        views.setInt(
            context.getResources().getIdentifier("asr_row", "id", context.getPackageName()),
            "setBackgroundColor", transparentColor
        );
        views.setInt(
            context.getResources().getIdentifier("maghrib_row", "id", context.getPackageName()),
            "setBackgroundColor", transparentColor
        );
        views.setInt(
            context.getResources().getIdentifier("isha_row", "id", context.getPackageName()),
            "setBackgroundColor", transparentColor
        );

        // Highlight current or next prayer row
        String activePrayer = currentPrayer.isEmpty() ? nextPrayer : currentPrayer;
        String rowName = activePrayer.toLowerCase() + "_row";
        int rowId = context.getResources().getIdentifier(rowName, "id", context.getPackageName());

        if (rowId != 0) {
            views.setInt(rowId, "setBackgroundColor", highlightColor);
        }

        // Update footer label
        String labelText = currentPrayer.isEmpty() ? "Next: " + nextPrayer : "Current: " + currentPrayer;
        views.setTextViewText(
            context.getResources().getIdentifier("next_prayer_label", "id", context.getPackageName()),
            labelText
        );

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
