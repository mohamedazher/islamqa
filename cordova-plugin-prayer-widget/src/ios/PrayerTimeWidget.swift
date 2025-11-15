import WidgetKit
import SwiftUI

/**
 * Prayer Time Widget for iOS
 * Displays next prayer time and countdown on home screen
 */

// MARK: - Data Model
struct PrayerTimeEntry: TimelineEntry {
    let date: Date
    // All 5 prayer times
    let fajrTime: String
    let dhuhrTime: String
    let asrTime: String
    let maghribTime: String
    let ishaTime: String
    // Current/Next prayer info
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
            fajrTime: "5:30 AM",
            dhuhrTime: "12:15 PM",
            asrTime: "3:45 PM",
            maghribTime: "6:45 PM",
            ishaTime: "8:15 PM",
            nextPrayer: "Maghrib",
            nextPrayerTime: "6:45 PM",
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

        // Load all 5 prayer times
        let fajrTime = userDefaults?.string(forKey: "fajr_time") ?? "--:--"
        let dhuhrTime = userDefaults?.string(forKey: "dhuhr_time") ?? "--:--"
        let asrTime = userDefaults?.string(forKey: "asr_time") ?? "--:--"
        let maghribTime = userDefaults?.string(forKey: "maghrib_time") ?? "--:--"
        let ishaTime = userDefaults?.string(forKey: "isha_time") ?? "--:--"

        // Load current/next prayer info
        let nextPrayer = userDefaults?.string(forKey: "next_prayer") ?? "Fajr"
        let nextPrayerTime = userDefaults?.string(forKey: "next_prayer_time") ?? "--:--"
        let timeRemaining = userDefaults?.string(forKey: "time_remaining") ?? "--:--"
        let currentPrayer = userDefaults?.string(forKey: "current_prayer") ?? ""

        return PrayerTimeEntry(
            date: Date(),
            fajrTime: fajrTime,
            dhuhrTime: dhuhrTime,
            asrTime: asrTime,
            maghribTime: maghribTime,
            ishaTime: ishaTime,
            nextPrayer: nextPrayer,
            nextPrayerTime: nextPrayerTime,
            timeRemaining: timeRemaining,
            currentPrayer: currentPrayer
        )
    }
}

// MARK: - Widget Views
struct PrayerTimeWidgetView: View {
    var entry: PrayerTimeEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Small Widget (Compact)
struct SmallWidgetView: View {
    var entry: PrayerTimeEntry

    var body: some View {
        ZStack {
            // Gradient background matching app theme (teal-500 to cyan-500)
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.078, green: 0.722, blue: 0.651),  // #14b8a6 teal-500
                    Color(red: 0.024, green: 0.714, blue: 0.831)   // #06b6d4 cyan-500
                ]),
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(spacing: 6) {
                // Mosque emoji
                Text("🕌")
                    .font(.system(size: 28))

                // Prayer name
                Text(entry.currentPrayer.isEmpty ? "Next: \(entry.nextPrayer)" : entry.currentPrayer)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)

                // Time remaining (large)
                Text(entry.timeRemaining)
                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)

                // Label
                Text(entry.currentPrayer.isEmpty ? "until prayer" : "until end")
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.8))

                // Prayer time
                Text(entry.nextPrayerTime)
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.9))
            }
            .padding()
        }
    }
}

// MARK: - Medium Widget (All Prayers)
struct MediumWidgetView: View {
    var entry: PrayerTimeEntry

    var activePrayer: String {
        entry.currentPrayer.isEmpty ? entry.nextPrayer : entry.currentPrayer
    }

    var body: some View {
        ZStack {
            // Gradient background matching app theme (teal-500 to cyan-500)
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.078, green: 0.722, blue: 0.651),  // #14b8a6 teal-500
                    Color(red: 0.024, green: 0.714, blue: 0.831)   // #06b6d4 cyan-500
                ]),
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("🕌")
                        .font(.system(size: 16))
                    Text("Prayer Times")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                    Spacer()
                    // Countdown badge
                    Text(entry.timeRemaining)
                        .font(.system(size: 15, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.white.opacity(0.25))
                        .cornerRadius(6)
                }
                .padding(.horizontal, 12)
                .padding(.top, 12)
                .padding(.bottom, 8)

                // Divider
                Rectangle()
                    .fill(Color.white.opacity(0.25))
                    .frame(height: 1)
                    .padding(.horizontal, 12)
                    .padding(.bottom, 6)

                // Prayer times list
                VStack(spacing: 3) {
                    PrayerRow(name: "Fajr", time: entry.fajrTime, isActive: activePrayer == "Fajr")
                    PrayerRow(name: "Dhuhr", time: entry.dhuhrTime, isActive: activePrayer == "Dhuhr")
                    PrayerRow(name: "Asr", time: entry.asrTime, isActive: activePrayer == "Asr")
                    PrayerRow(name: "Maghrib", time: entry.maghribTime, isActive: activePrayer == "Maghrib")
                    PrayerRow(name: "Isha", time: entry.ishaTime, isActive: activePrayer == "Isha")
                }
                .padding(.horizontal, 12)

                Spacer()

                // Footer
                Text(entry.currentPrayer.isEmpty ? "Next: \(entry.nextPrayer)" : "Current: \(entry.currentPrayer)")
                    .font(.system(size: 10, weight: .regular))
                    .italic()
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.bottom, 10)
            }
        }
    }
}

// MARK: - Prayer Row Component
struct PrayerRow: View {
    let name: String
    let time: String
    let isActive: Bool

    var body: some View {
        HStack {
            Text(name)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white)
            Spacer()
            Text(time)
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundColor(.white)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(isActive ? Color.white.opacity(0.25) : Color.clear)
        .cornerRadius(4)
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
        .description("Shows all 5 daily prayer times with live countdown")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview
struct PrayerTimeWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            // Small widget preview
            PrayerTimeWidgetView(entry: PrayerTimeEntry(
                date: Date(),
                fajrTime: "5:30 AM",
                dhuhrTime: "12:15 PM",
                asrTime: "3:45 PM",
                maghribTime: "6:45 PM",
                ishaTime: "8:15 PM",
                nextPrayer: "Maghrib",
                nextPrayerTime: "6:45 PM",
                timeRemaining: "3h 20m",
                currentPrayer: ""
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small Widget")

            // Medium widget preview
            PrayerTimeWidgetView(entry: PrayerTimeEntry(
                date: Date(),
                fajrTime: "5:30 AM",
                dhuhrTime: "12:15 PM",
                asrTime: "3:45 PM",
                maghribTime: "6:45 PM",
                ishaTime: "8:15 PM",
                nextPrayer: "Maghrib",
                nextPrayerTime: "6:45 PM",
                timeRemaining: "3h 20m",
                currentPrayer: "Asr"
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium Widget")
        }
    }
}
