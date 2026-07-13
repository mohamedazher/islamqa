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
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Prayer Time Widget Provider
 * Handles widget display and updates
 */
public class PrayerTimeWidgetProvider extends AppWidgetProvider {

    private static final String TAG = "PrayerTimeWidget";
    private static final String PREFS_NAME = "PrayerWidgetPrefs";
    private static final String ACTION_PRAYER_BOUNDARY =
        "com.dkurve.betterislamqa.prayerwidget.PRAYER_BOUNDARY";
    private static final String[] TIMESTAMP_KEYS = {
        "fajr_timestamp", "sunrise_timestamp", "dhuhr_timestamp", "asr_timestamp",
        "maghrib_timestamp", "isha_timestamp", "next_fajr_timestamp"
    };

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

            PrayerState state = derivePrayerState(prefs, System.currentTimeMillis());

            String fajrTime = state.formattedTimes[0];
            String dhuhrTime = state.formattedTimes[1];
            String asrTime = state.formattedTimes[2];
            String maghribTime = state.formattedTimes[3];
            String ishaTime = state.formattedTimes[4];
            String nextPrayer = state.nextPrayer;
            String timeRemaining = state.timeRemaining;
            String currentPrayer = state.currentPrayer;

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
            String labelText = currentPrayer.isEmpty()
                ? "Next: " + nextPrayer + " in " + timeRemaining
                : "Now: " + currentPrayer + " · ends in " + timeRemaining;
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
            scheduleNextBoundary(context, state.refreshTimestamp);
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

        if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(action)
                || ACTION_PRAYER_BOUNDARY.equals(action)) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] ids = appWidgetManager.getAppWidgetIds(
                new android.content.ComponentName(context, PrayerTimeWidgetProvider.class));

            if (ids != null && ids.length > 0) {
                this.onUpdate(context, appWidgetManager, ids);
            }
        }
    }

    private PrayerState derivePrayerState(SharedPreferences prefs, long now) {
        PrayerState state = new PrayerState();
        long[] timestamps = new long[TIMESTAMP_KEYS.length];
        boolean hasAbsoluteTimes = true;
        for (int i = 0; i < TIMESTAMP_KEYS.length; i++) {
            timestamps[i] = prefs.getLong(TIMESTAMP_KEYS[i], 0L);
            if (timestamps[i] <= 0L || (i > 0 && timestamps[i] <= timestamps[i - 1])) {
                hasAbsoluteTimes = false;
            }
        }

        if (!hasAbsoluteTimes) {
            state.formattedTimes = new String[] {
                prefs.getString("fajr_time", "--:--"),
                prefs.getString("dhuhr_time", "--:--"),
                prefs.getString("asr_time", "--:--"),
                prefs.getString("maghrib_time", "--:--"),
                prefs.getString("isha_time", "--:--")
            };
            state.nextPrayer = prefs.getString("next_prayer", "Fajr");
            state.currentPrayer = prefs.getString("current_prayer", "");
            state.timeRemaining = prefs.getString("time_remaining", "--");
            state.nextPrayerTimestamp = 0L;
            return state;
        }

        TimeZone zone = resolveTimeZone(prefs.getString("timezone", ""));
        SimpleDateFormat formatter = new SimpleDateFormat("h:mm a", Locale.getDefault());
        formatter.setTimeZone(zone);
        state.formattedTimes = new String[] {
            formatter.format(new Date(timestamps[0])),
            formatter.format(new Date(timestamps[2])),
            formatter.format(new Date(timestamps[3])),
            formatter.format(new Date(timestamps[4])),
            formatter.format(new Date(timestamps[5]))
        };

        if (now < timestamps[0]) {
            setState(state, "", "Fajr", timestamps[0], now);
        } else if (now < timestamps[1]) {
            // Sunrise ends the Fajr window, but is not itself a prayer.
            setState(state, "Fajr", "Dhuhr", timestamps[2], now);
            state.refreshTimestamp = timestamps[1];
            state.timeRemaining = formatDuration(timestamps[1] - now);
        } else if (now < timestamps[2]) {
            setState(state, "", "Dhuhr", timestamps[2], now);
        } else if (now < timestamps[3]) {
            setState(state, "Dhuhr", "Asr", timestamps[3], now);
        } else if (now < timestamps[4]) {
            setState(state, "Asr", "Maghrib", timestamps[4], now);
        } else if (now < timestamps[5]) {
            setState(state, "Maghrib", "Isha", timestamps[5], now);
        } else if (now < timestamps[6]) {
            setState(state, "Isha", "Fajr", timestamps[6], now);
        } else {
            // The saved schedule is stale. Never display a negative/frozen countdown.
            state.nextPrayer = "Fajr";
            state.currentPrayer = "";
            state.timeRemaining = "refresh needed";
            state.nextPrayerTimestamp = 0L;
        }
        return state;
    }

    private void setState(PrayerState state, String currentPrayer, String nextPrayer,
                          long nextPrayerTimestamp, long now) {
        state.currentPrayer = currentPrayer;
        state.nextPrayer = nextPrayer;
        state.nextPrayerTimestamp = nextPrayerTimestamp;
        state.refreshTimestamp = nextPrayerTimestamp;
        state.timeRemaining = formatDuration(nextPrayerTimestamp - now);
    }

    private TimeZone resolveTimeZone(String identifier) {
        if (identifier == null || identifier.isEmpty()) {
            return TimeZone.getDefault();
        }
        TimeZone zone = TimeZone.getTimeZone(identifier);
        if ("GMT".equals(zone.getID()) && !"GMT".equalsIgnoreCase(identifier)) {
            Log.w(TAG, "Invalid timezone " + identifier + "; using device timezone");
            return TimeZone.getDefault();
        }
        return zone;
    }

    private String formatDuration(long milliseconds) {
        long totalMinutes = Math.max(0L, (milliseconds + 59999L) / 60000L);
        long hours = totalMinutes / 60L;
        long minutes = totalMinutes % 60L;
        return hours > 0L ? hours + "h " + minutes + "m" : minutes + "m";
    }

    private static class PrayerState {
        String[] formattedTimes;
        String nextPrayer;
        String currentPrayer;
        String timeRemaining;
        long nextPrayerTimestamp;
        long refreshTimestamp;
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

            // A battery-friendly fallback refresh. Prayer transitions additionally
            // schedule a one-shot boundary update from the absolute timestamps.
            long intervalMillis = 1800000; // 30 minutes
            long triggerAtMillis = SystemClock.elapsedRealtime() + intervalMillis;
            alarmManager.setInexactRepeating(
                AlarmManager.ELAPSED_REALTIME,
                triggerAtMillis,
                intervalMillis,
                pendingIntent
            );

            Log.d(TAG, "Widget update scheduled every 30 minutes");
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling widget update: " + e.getMessage(), e);
        }
    }

    private void scheduleNextBoundary(Context context, long nextPrayerTimestamp) {
        if (nextPrayerTimestamp <= System.currentTimeMillis()) return;
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, PrayerTimeWidgetProvider.class);
        intent.setAction(ACTION_PRAYER_BOUNDARY);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 1, intent, flags);
        long triggerElapsed = SystemClock.elapsedRealtime()
            + Math.max(1000L, nextPrayerTimestamp - System.currentTimeMillis());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                triggerElapsed, pendingIntent);
        } else {
            alarmManager.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerElapsed, pendingIntent);
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
            Intent boundaryIntent = new Intent(context, PrayerTimeWidgetProvider.class);
            boundaryIntent.setAction(ACTION_PRAYER_BOUNDARY);
            PendingIntent boundaryPendingIntent = PendingIntent.getBroadcast(
                context, 1, boundaryIntent, flags);
            alarmManager.cancel(boundaryPendingIntent);
            Log.d(TAG, "Widget update cancelled");
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling widget update: " + e.getMessage());
        }
    }
}
