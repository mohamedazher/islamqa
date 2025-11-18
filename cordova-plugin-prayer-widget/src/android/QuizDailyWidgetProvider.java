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
import java.util.Calendar;

/**
 * Quiz Daily Widget Provider
 * Shows a daily Islamic quiz question
 */
public class QuizDailyWidgetProvider extends AppWidgetProvider {

    private static final String TAG = "QuizDailyWidget";
    private static final String PREFS_NAME = "QuizWidgetPrefs";
    private static final String ACTION_SHOW_ANSWER = "com.dkurve.betterislamqa.SHOW_ANSWER";
    private static final String ACTION_NEXT_QUESTION = "com.dkurve.betterislamqa.NEXT_QUESTION";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "onUpdate called for " + appWidgetIds.length + " widgets");

        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        String action = intent.getAction();
        if (ACTION_SHOW_ANSWER.equals(action) || ACTION_NEXT_QUESTION.equals(action)) {
            int appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, -1);
            if (appWidgetId != -1) {
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);

                if (ACTION_SHOW_ANSWER.equals(action)) {
                    showAnswer(context, appWidgetManager, appWidgetId);
                } else {
                    nextQuestion(context, appWidgetManager, appWidgetId);
                }
            }
        }
    }

    /**
     * Update widget with today's question
     */
    private void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

            // Get quiz data from preferences (set by app)
            String question = prefs.getString("quiz_question", "What is the first pillar of Islam?");
            String optionA = prefs.getString("quiz_option_a", "A. Shahada");
            String optionB = prefs.getString("quiz_option_b", "B. Salah");
            String optionC = prefs.getString("quiz_option_c", "C. Zakat");
            String optionD = prefs.getString("quiz_option_d", "D. Hajj");
            String correctAnswer = prefs.getString("quiz_correct_answer", "A");
            boolean showingAnswer = prefs.getBoolean("quiz_showing_answer_" + appWidgetId, false);

            String packageName = context.getPackageName();
            int layoutId = context.getResources().getIdentifier("widget_quiz_daily", "layout", packageName);

            if (layoutId == 0) {
                Log.e(TAG, "Could not find widget_quiz_daily layout");
                return;
            }

            RemoteViews views = new RemoteViews(packageName, layoutId);

            // Set question and options
            safeSetText(views, context, "quiz_question", question);
            safeSetText(views, context, "quiz_option_a", optionA);
            safeSetText(views, context, "quiz_option_b", optionB);
            safeSetText(views, context, "quiz_option_c", optionC);
            safeSetText(views, context, "quiz_option_d", optionD);

            // Set footer text based on state
            String footerText = showingAnswer ? "Answer: " + correctAnswer + " - Tap for next" : "Tap to see answer";
            safeSetText(views, context, "quiz_footer", footerText);

            // Set click handler
            Intent clickIntent = new Intent(context, QuizDailyWidgetProvider.class);
            clickIntent.setAction(showingAnswer ? ACTION_NEXT_QUESTION : ACTION_SHOW_ANSWER);
            clickIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getBroadcast(context, appWidgetId, clickIntent, flags);
            views.setOnClickPendingIntent(
                context.getResources().getIdentifier("widget_container_quiz", "id", packageName),
                pendingIntent
            );

            appWidgetManager.updateAppWidget(appWidgetId, views);
            Log.d(TAG, "Quiz widget updated");

        } catch (Exception e) {
            Log.e(TAG, "Error updating quiz widget", e);
        }
    }

    /**
     * Show the answer
     */
    private void showAnswer(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean("quiz_showing_answer_" + appWidgetId, true).apply();
        updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    /**
     * Show next question
     */
    private void nextQuestion(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean("quiz_showing_answer_" + appWidgetId, false).apply();
        // Trigger app to load new question
        updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    /**
     * Safely set text on a TextView
     */
    private void safeSetText(RemoteViews views, Context context, String viewName, String text) {
        try {
            int viewId = context.getResources().getIdentifier(viewName, "id", context.getPackageName());
            if (viewId != 0) {
                views.setTextViewText(viewId, text);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting text for " + viewName, e);
        }
    }
}
