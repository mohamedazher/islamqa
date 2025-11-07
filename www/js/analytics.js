/**
 * Firebase Analytics Wrapper
 * Works seamlessly across Web, iOS, and Android platforms
 *
 * Usage:
 *   Analytics.logScreen('category_list');
 *   Analytics.logEvent('question_viewed', { question_id: 123, category: 'Fiqh' });
 */

var Analytics = (function() {
    'use strict';

    var isInitialized = false;
    var isCordova = !!window.cordova;
    var isWeb = !isCordova;

    // Firebase web config - REPLACE WITH YOUR ACTUAL CONFIG
    var firebaseWebConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
        measurementId: "YOUR_MEASUREMENT_ID"
    };

    /**
     * Initialize Firebase Analytics
     */
    function initialize() {
        if (isInitialized) {
            console.log('[Analytics] Already initialized');
            return;
        }

        if (isWeb) {
            // Initialize Firebase Web SDK
            try {
                if (typeof firebase !== 'undefined') {
                    firebase.initializeApp(firebaseWebConfig);
                    firebase.analytics();
                    isInitialized = true;
                    console.log('[Analytics] Firebase Web SDK initialized');
                } else {
                    console.warn('[Analytics] Firebase Web SDK not loaded');
                }
            } catch (error) {
                console.error('[Analytics] Web initialization error:', error);
            }
        } else {
            // Cordova plugin initializes automatically
            if (window.FirebasePlugin) {
                isInitialized = true;
                console.log('[Analytics] Firebase Cordova plugin ready');
            } else {
                console.warn('[Analytics] Firebase Cordova plugin not found');
            }
        }
    }

    /**
     * Log a screen view
     * @param {string} screenName - Name of the screen
     * @param {string} screenClass - Optional screen class/category
     */
    function logScreen(screenName, screenClass) {
        if (!isInitialized) {
            console.warn('[Analytics] Not initialized, skipping screen log');
            return;
        }

        var params = {
            screen_name: screenName,
            screen_class: screenClass || screenName
        };

        if (isWeb && typeof firebase !== 'undefined') {
            firebase.analytics().logEvent('screen_view', params);
            console.log('[Analytics] Web - Screen view:', screenName);
        } else if (window.FirebasePlugin) {
            window.FirebasePlugin.logEvent('screen_view', params);
            console.log('[Analytics] Cordova - Screen view:', screenName);
        }
    }

    /**
     * Log a custom event
     * @param {string} eventName - Name of the event
     * @param {object} params - Event parameters (max 25 params, key length 40 chars)
     */
    function logEvent(eventName, params) {
        if (!isInitialized) {
            console.warn('[Analytics] Not initialized, skipping event log');
            return;
        }

        params = params || {};

        if (isWeb && typeof firebase !== 'undefined') {
            firebase.analytics().logEvent(eventName, params);
            console.log('[Analytics] Web - Event:', eventName, params);
        } else if (window.FirebasePlugin) {
            window.FirebasePlugin.logEvent(eventName, params);
            console.log('[Analytics] Cordova - Event:', eventName, params);
        }
    }

    /**
     * Set user property
     * @param {string} name - Property name
     * @param {string} value - Property value
     */
    function setUserProperty(name, value) {
        if (!isInitialized) {
            console.warn('[Analytics] Not initialized, skipping user property');
            return;
        }

        if (isWeb && typeof firebase !== 'undefined') {
            firebase.analytics().setUserProperties({ [name]: value });
            console.log('[Analytics] Web - User property:', name, value);
        } else if (window.FirebasePlugin) {
            window.FirebasePlugin.setUserProperty(name, value);
            console.log('[Analytics] Cordova - User property:', name, value);
        }
    }

    /**
     * Set user ID
     * @param {string} userId - Unique user identifier
     */
    function setUserId(userId) {
        if (!isInitialized) {
            console.warn('[Analytics] Not initialized, skipping user ID');
            return;
        }

        if (isWeb && typeof firebase !== 'undefined') {
            firebase.analytics().setUserId(userId);
            console.log('[Analytics] Web - User ID set:', userId);
        } else if (window.FirebasePlugin) {
            window.FirebasePlugin.setUserId(userId);
            console.log('[Analytics] Cordova - User ID set:', userId);
        }
    }

    /**
     * Enable/disable analytics collection
     * @param {boolean} enabled - true to enable, false to disable
     */
    function setEnabled(enabled) {
        if (!isInitialized) {
            return;
        }

        if (isWeb && typeof firebase !== 'undefined') {
            firebase.analytics().setAnalyticsCollectionEnabled(enabled);
        } else if (window.FirebasePlugin) {
            window.FirebasePlugin.setEnabled(enabled);
        }
        console.log('[Analytics] Collection enabled:', enabled);
    }

    // Public API
    return {
        initialize: initialize,
        logScreen: logScreen,
        logEvent: logEvent,
        setUserProperty: setUserProperty,
        setUserId: setUserId,
        setEnabled: setEnabled,
        isWeb: isWeb,
        isCordova: isCordova
    };
})();
