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
 * Compact Prayer Time Widget Provider (2x2)
 * Shows next 3 prayers in a compact format
 */
public class PrayerTimeWidgetProviderCompact extends AppWidgetProvider {

    private static final String TAG = "PrayerTimeWidgetCompact";
    private static final String PREFS_NAME = "PrayerWidgetPrefs";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "onUpdate called for " + appWidgetIds.length + " widgets");

        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
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
            String currentPrayer = prefs.getString("current_prayer", "");

            String packageName = context.getPackageName();
            Log.d(TAG, "Updating compact widget - Next: " + nextPrayer + ", Current: " + currentPrayer);

            // Get layout ID
            int layoutId = context.getResources().getIdentifier(
                "widget_prayer_time_compact", "layout", packageName);

            if (layoutId == 0) {
                Log.e(TAG, "Could not find widget_prayer_time_compact layout");
                return;
            }

            // Create RemoteViews
            RemoteViews views = new RemoteViews(packageName, layoutId);

            // Update header label
            String labelText = currentPrayer.isEmpty() ? "Next: " + nextPrayer : "Now: " + currentPrayer;
            safeSetText(views, context, "next_prayer_label_compact", labelText);

            // Determine which 3 prayers to show based on current/next prayer
            String activePrayer = currentPrayer.isEmpty() ? nextPrayer : currentPrayer;
            updateCompactPrayerTimes(views, context, activePrayer, fajrTime, dhuhrTime, asrTime, maghribTime, ishaTime);

            // Create intent to open app when widget is clicked
            Intent launchIntent = context.getPackageManager()
                .getLaunchIntentForPackage(context.getPackageName());

            if (launchIntent != null) {
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
                    context.getResources().getIdentifier("widget_container_compact", "id", packageName),
                    pendingIntent
                );
            }

            // Update the widget
            appWidgetManager.updateAppWidget(appWidgetId, views);
            Log.d(TAG, "Compact widget updated successfully");

        } catch (Exception e) {
            Log.e(TAG, "Error updating compact widget", e);
        }
    }

    /**
     * Update the 3 prayer rows based on current/next prayer
     */
    private void updateCompactPrayerTimes(RemoteViews views, Context context, String activePrayer,
                                         String fajr, String dhuhr, String asr, String maghrib, String isha) {
        String[] prayers = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};
        String[] times = {fajr, dhuhr, asr, maghrib, isha};

        // Find the index of the active prayer
        int activeIndex = 0;
        for (int i = 0; i < prayers.length; i++) {
            if (prayers[i].equalsIgnoreCase(activePrayer)) {
                activeIndex = i;
                break;
            }
        }

        // Show current/next 3 prayers
        for (int i = 0; i < 3; i++) {
            int prayerIndex = (activeIndex + i) % prayers.length;
            String prayerName = prayers[prayerIndex];
            String prayerTime = times[prayerIndex];

            safeSetText(views, context, "prayer" + (i + 1) + "_name", prayerName);
            safeSetText(views, context, "prayer" + (i + 1) + "_time", prayerTime);

            // Highlight the first row (active prayer)
            if (i == 0) {
                highlightRow(views, context, "prayer" + (i + 1) + "_row");
            } else {
                unhighlightRow(views, context, "prayer" + (i + 1) + "_row");
            }
        }
    }

    /**
     * Safely set text on a TextView
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
            Log.e(TAG, "Error setting text for " + viewName, e);
        }
    }

    /**
     * Highlight a prayer row
     */
    private void highlightRow(RemoteViews views, Context context, String rowName) {
        try {
            int rowId = context.getResources().getIdentifier(rowName, "id", context.getPackageName());
            if (rowId != 0) {
                int highlightDrawableId = context.getResources().getIdentifier(
                    "prayer_row_highlight", "drawable", context.getPackageName());
                if (highlightDrawableId != 0) {
                    views.setInt(rowId, "setBackgroundResource", highlightDrawableId);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error highlighting row: " + rowName, e);
        }
    }

    /**
     * Remove highlight from a prayer row
     */
    private void unhighlightRow(RemoteViews views, Context context, String rowName) {
        try {
            int rowId = context.getResources().getIdentifier(rowName, "id", context.getPackageName());
            if (rowId != 0) {
                views.setInt(rowId, "setBackgroundColor", android.graphics.Color.TRANSPARENT);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error unhighlighting row: " + rowName, e);
        }
    }
}
