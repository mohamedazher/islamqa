import WidgetKit
import SwiftUI

/**
 * Prayer Time Widget for iOS
 * Displays next prayer time and countdown on home screen
 */

// MARK: - Data Model
struct PrayerTimeEntry: TimelineEntry {
    let date: Date
    let nextPrayer: String
    let nextPrayerTime: String
    let timeRemaining: String
    let currentPrayer: String
}

// MARK: - Timeline Provider
struct PrayerTimeProvider: TimelineProvider {
    private let appGroupName = "group.com.dkurve.betterislamqa"

    func placeholder(in context: Context) -> PrayerTimeEntry {
        PrayerTimeEntry(
            date: Date(),
            nextPrayer: "Fajr",
            nextPrayerTime: "5:30 AM",
            timeRemaining: "2h 15m",
            currentPrayer: ""
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerTimeEntry) -> ()) {
        let entry = loadPrayerData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerTimeEntry>) -> ()) {
        let entry = loadPrayerData()

        // Update widget every minute
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

        completion(timeline)
    }

    private func loadPrayerData() -> PrayerTimeEntry {
        let userDefaults = UserDefaults(suiteName: appGroupName)

        let nextPrayer = userDefaults?.string(forKey: "next_prayer") ?? "Fajr"
        let nextPrayerTime = userDefaults?.string(forKey: "next_prayer_time") ?? "--:--"
        let timeRemaining = userDefaults?.string(forKey: "time_remaining") ?? "--:--"
        let currentPrayer = userDefaults?.string(forKey: "current_prayer") ?? ""

        return PrayerTimeEntry(
            date: Date(),
            nextPrayer: nextPrayer,
            nextPrayerTime: nextPrayerTime,
            timeRemaining: timeRemaining,
            currentPrayer: currentPrayer
        )
    }
}

// MARK: - Widget View
struct PrayerTimeWidgetView: View {
    var entry: PrayerTimeEntry

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.08, green: 0.72, blue: 0.65),
                    Color(red: 0.03, green: 0.54, blue: 0.70)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 8) {
                // Mosque emoji
                Text("🕌")
                    .font(.system(size: 32))

                // Prayer name
                Text(entry.currentPrayer.isEmpty ? "Next: \(entry.nextPrayer)" : entry.currentPrayer)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)

                // Time remaining (large)
                Text(entry.timeRemaining)
                    .font(.system(size: 36, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)

                // Label
                Text(entry.currentPrayer.isEmpty ? "until prayer" : "until end")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.8))

                // Prayer time
                Text(entry.nextPrayerTime)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.9))
            }
            .padding()
        }
    }
}

// MARK: - Widget Configuration
@main
struct PrayerTimeWidget: Widget {
    let kind: String = "PrayerTimeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerTimeProvider()) { entry in
            PrayerTimeWidgetView(entry: entry)
        }
        .configurationDisplayName("Prayer Times")
        .description("Shows next prayer time and countdown")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview
struct PrayerTimeWidget_Previews: PreviewProvider {
    static var previews: some View {
        PrayerTimeWidgetView(entry: PrayerTimeEntry(
            date: Date(),
            nextPrayer: "Maghrib",
            nextPrayerTime: "6:45 PM",
            timeRemaining: "3h 20m",
            currentPrayer: ""
        ))
        .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
