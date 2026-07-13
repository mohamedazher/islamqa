import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8')

describe('deployable Firestore leaderboard contract', () => {
  const rules = read('firestore.rules')

  it('is wired into repository-owned Firebase configuration', () => {
    const config = JSON.parse(read('firebase.json'))
    const indexes = JSON.parse(read('firestore.indexes.json'))
    expect(config.firestore).toEqual({
      rules: 'firestore.rules',
      indexes: 'firestore.indexes.json'
    })
    expect(indexes).toEqual({ indexes: [], fieldOverrides: [] })
  })

  it('requires authenticated ownership and a newly-created immutable event', () => {
    expect(rules).toContain('request.auth.uid == uid')
    expect(rules).toContain('!exists(eventPath(uid, eventId))')
    expect(rules).toContain('existsAfter(eventPath(uid, eventId))')
    expect(rules).toContain('allow update, delete: if false;')
    expect(rules).toContain("data.totalScore == resource.data.totalScore + event.points")
    expect(rules).toContain("data.score == resource.data.score + event.points")
  })

  it('denies unspecified data and never exposes event collection queries', () => {
    expect(rules).toContain('allow list: if false;')
    expect(rules).toMatch(/match \/\{document=\*\*\}[\s\S]*allow read, write: if false;/)
    expect(rules).not.toContain('allow write: if request.auth != null;')
  })

  it('permits one evidence-backed migration for each legacy daily aggregate', () => {
    expect(rules).toContain("data.kind == 'legacy_daily'")
    expect(rules).toContain("!('lastEventId' in get(dailyPath).data)")
    expect(rules).toContain("data.points == get(dailyPath).data.score")
    expect(rules).toContain("data.eventId == 'legacy_daily_' + data.dailyBucket")
    expect(rules).toContain("(('activityPoints' in resource.data) ? resource.data.activityPoints : 0)")
  })
})

describe('native prayer widget v2 contract', () => {
  const appService = read('src/services/prayerTimesService.js')
  const androidBridge = read('cordova-plugin-prayer-widget/src/android/PrayerWidget.java')
  const androidProvider = read('cordova-plugin-prayer-widget/src/android/PrayerTimeWidgetProvider.java')
  const iosBridge = read('cordova-plugin-prayer-widget/src/ios/PrayerWidget.swift')
  const iosWidget = read('cordova-plugin-prayer-widget/src/ios/PrayerTimeWidget.swift')
  const pluginXml = read('cordova-plugin-prayer-widget/plugin.xml')
  const pluginReadme = read('cordova-plugin-prayer-widget/README.md')
  const main = read('src/main.js')

  it('publishes and persists absolute instants with timezone metadata', () => {
    for (const source of [appService, androidBridge, iosBridge]) {
      expect(source).toContain('prayerTimestamps')
      expect(source).toContain('timezone')
      expect(source).toContain('nextFajr')
      expect(source).toContain('sunrise')
    }
    expect(appService).toContain('schemaVersion: 2')
    expect(appService).toMatch(/prayerTimestamps:\s*\{[\s\S]*?sunrise:\s*times\.sunrise\.getTime\(\)/)
    expect(androidBridge).toContain('next_fajr_timestamp')
    expect(iosBridge).toContain('next_fajr_timestamp')
  })

  it('derives native state and refreshes at prayer boundaries', () => {
    expect(androidProvider).toContain('derivePrayerState')
    expect(androidProvider).toContain('scheduleNextBoundary')
    expect(androidProvider).toContain('"sunrise_timestamp"')
    expect(androidProvider).toContain('setState(state, "", "Dhuhr"')
    expect(androidProvider).toContain('setInexactRepeating')
    expect(androidProvider).not.toContain('Widget update scheduled every 1 minute')
    expect(iosWidget).toContain('Text(nextPrayerDate, style: .timer)')
    expect(iosWidget).toContain('let boundaries = keys')
    expect(iosWidget).toContain('state = ("", "Dhuhr", 2, 2)')
    expect(iosWidget).toContain('state = ("Fajr", "Dhuhr", 2, 1)')
  })

  it('defines the Android launch action and accurately documents iOS integration', () => {
    expect(androidBridge).toContain('consumeLaunchAction')
    expect(androidBridge).toContain('clearWidget')
    expect(iosBridge).toContain('@objc(clearWidget:)')
    expect(androidProvider).toContain('putExtra("openPrayerTimes", true)')
    expect(main).toContain('consumeNativeLaunchAction')
    expect(main).toContain("router.push('/prayer-times')")
    expect(pluginReadme).toContain("action === 'prayer-times'")
    expect(pluginReadme).toContain('Cordova does **not** create or sign a Widget Extension target')
    expect(pluginXml).not.toContain('src/ios/PrayerTimeWidget.swift" />')
  })
})
