package com.dkurve.betterislamqa.prayerwidget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.app.PendingIntent;
import android.app.AlarmManager;
import android.content.Intent;
import android.util.Log;
import android.os.Build;
import android.os.SystemClock;

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
        Log.d(TAG, "First widget added - scheduling updates");
        scheduleWidgetUpdate(context);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        Log.d(TAG, "Last widget removed - cancelling updates");
        cancelWidgetUpdate(context);
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

            // Update header label
            String labelText = currentPrayer.isEmpty() ? "Next: " + nextPrayer : "Now: " + currentPrayer;
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
            // Get drawable resource for highlight
            int highlightDrawableId = context.getResources().getIdentifier(
                "prayer_row_highlight", "drawable", context.getPackageName());

            // Reset all row backgrounds to transparent
            String[] prayers = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
            for (String prayer : prayers) {
                String rowName = prayer + "_row";
                int rowId = context.getResources().getIdentifier(rowName, "id", context.getPackageName());
                if (rowId != 0) {
                    // Set transparent background
                    views.setInt(rowId, "setBackgroundColor", android.graphics.Color.TRANSPARENT);
                }
            }

            // Highlight the active prayer row with gradient drawable
            String activeRowName = prayerName.toLowerCase() + "_row";
            int activeRowId = context.getResources().getIdentifier(activeRowName, "id", context.getPackageName());
            if (activeRowId != 0 && highlightDrawableId != 0) {
                views.setInt(activeRowId, "setBackgroundResource", highlightDrawableId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error highlighting prayer row: " + e.getMessage());
        }
    }

    /**
     * Schedule periodic widget updates using AlarmManager
     * Updates every 1 minute for accurate countdown
     */
    private void scheduleWidgetUpdate(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) {
                Log.e(TAG, "AlarmManager not available");
                return;
            }

            Intent intent = new Intent(context, PrayerTimeWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                flags
            );

            // Schedule update every 30 minutes (1800000 milliseconds)
            // Static widget doesn't need frequent updates - just to refresh current/next prayer indicator
            long intervalMillis = 1800000; // 30 minutes
            long triggerAtMillis = SystemClock.elapsedRealtime() + intervalMillis;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                // For Android 6.0+, use setRepeating for regular updates
                alarmManager.setRepeating(
                    AlarmManager.ELAPSED_REALTIME,
                    triggerAtMillis,
                    intervalMillis,
                    pendingIntent
                );
            } else {
                alarmManager.setRepeating(
                    AlarmManager.ELAPSED_REALTIME,
                    triggerAtMillis,
                    intervalMillis,
                    pendingIntent
                );
            }

            Log.d(TAG, "Widget update scheduled every 30 minutes");
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling widget update: " + e.getMessage(), e);
        }
    }

    /**
     * Cancel scheduled widget updates
     */
    private void cancelWidgetUpdate(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) {
                return;
            }

            Intent intent = new Intent(context, PrayerTimeWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                flags
            );

            alarmManager.cancel(pendingIntent);
            Log.d(TAG, "Widget update cancelled");
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling widget update: " + e.getMessage());
        }
    }
}
