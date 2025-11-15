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
        String nextPrayer = prefs.getString("next_prayer", "Fajr");
        String nextPrayerTime = prefs.getString("next_prayer_time", "--:--");
        String timeRemaining = prefs.getString("time_remaining", "--:--");
        String currentPrayer = prefs.getString("current_prayer", "");

        Log.d(TAG, "Updating widget with: " + nextPrayer + " at " + nextPrayerTime + " in " + timeRemaining);

        // Get layout ID
        int layoutId = context.getResources().getIdentifier(
            "widget_prayer_time", "layout", context.getPackageName());

        // Create RemoteViews
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

        // Update widget UI elements
        String displayPrayer = currentPrayer.isEmpty() ? "Next: " + nextPrayer : currentPrayer;

        views.setTextViewText(
            context.getResources().getIdentifier("prayer_name", "id", context.getPackageName()),
            displayPrayer
        );

        views.setTextViewText(
            context.getResources().getIdentifier("time_remaining", "id", context.getPackageName()),
            timeRemaining
        );

        views.setTextViewText(
            context.getResources().getIdentifier("prayer_time", "id", context.getPackageName()),
            nextPrayerTime
        );

        // Set label text
        String labelText = currentPrayer.isEmpty() ? "until prayer" : "until end";
        views.setTextViewText(
            context.getResources().getIdentifier("time_label", "id", context.getPackageName()),
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
