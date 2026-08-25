#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const projectRoot = path.resolve(__dirname, '..', '..')
const geolocationSource = path.join(
  projectRoot,
  'node_modules',
  'cordova-plugin-geolocation',
  'src',
  'ios',
  'CDVLocation.m'
)

function replaceExactlyOnce(source, expected, replacement, filePath) {
  const occurrences = source.split(expected).length - 1
  if (occurrences !== 1) {
    throw new Error(`Expected exactly one matching section in ${filePath}, found ${occurrences}`)
  }
  return source.replace(expected, replacement)
}

function restrictGeolocationPluginToWhenInUse(filePath) {
  let source = fs.readFileSync(filePath, 'utf8')

  if (!source.includes('requestAlwaysAuthorization')) return

  source = replaceExactlyOnce(
    source,
    'if (code == kCLAuthorizationStatusNotDetermined && ([self.locationManager respondsToSelector:@selector(requestAlwaysAuthorization)] || [self.locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)])) { //iOS8+',
    'if (code == kCLAuthorizationStatusNotDetermined && [self.locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) { //iOS8+',
    filePath
  )
  source = replaceExactlyOnce(
    source,
    `if([[NSBundle mainBundle] objectForInfoDictionaryKey:@"NSLocationWhenInUseUsageDescription"]){\n            [self.locationManager requestWhenInUseAuthorization];\n        } else if([[NSBundle mainBundle] objectForInfoDictionaryKey:@"NSLocationAlwaysUsageDescription"]) {\n            [self.locationManager  requestAlwaysAuthorization];\n        } else {\n            NSLog(@"[Warning] No NSLocationAlwaysUsageDescription or NSLocationWhenInUseUsageDescription key is defined in the Info.plist file.");\n        }`,
    `NSAssert([[NSBundle mainBundle] objectForInfoDictionaryKey:@"NSLocationWhenInUseUsageDescription"], @"NSLocationWhenInUseUsageDescription is required");\n        [self.locationManager requestWhenInUseAuthorization];`,
    filePath
  )
  fs.writeFileSync(filePath, source)
}

function prepareIosPlatform() {
  const cordova = path.join(projectRoot, 'node_modules', '.bin', 'cordova')
  const iosPlatformPath = path.join(projectRoot, 'platforms', 'ios')
  const command = fs.existsSync(iosPlatformPath) ? ['prepare', 'ios'] : ['platform', 'add', 'ios']
  const result = spawnSync(cordova, command, {
    cwd: projectRoot,
    stdio: 'inherit'
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function assertGeneratedIosPrivacySurface() {
  const pluginDirectory = path.join(projectRoot, 'platforms', 'ios', 'App', 'Plugins', 'cordova.plugins.diagnostic')
  if (fs.existsSync(pluginDirectory)) {
    throw new Error('cordova.plugins.diagnostic must not be present in the generated iOS project')
  }

  const generatedGeolocation = path.join(projectRoot, 'platforms', 'ios', 'App', 'Plugins', 'cordova-plugin-geolocation', 'CDVLocation.m')
  const generatedSource = fs.readFileSync(generatedGeolocation, 'utf8')
  if (generatedSource.includes('requestAlwaysAuthorization')) {
    throw new Error('Generated iOS geolocation plugin still references always-location authorization')
  }

  const infoPlist = fs.readFileSync(path.join(projectRoot, 'platforms', 'ios', 'App', 'App-Info.plist'), 'utf8')
  const forbiddenKeys = [
    'NSLocationAlwaysUsageDescription',
    'NSLocationAlwaysAndWhenInUseUsageDescription',
    'NSBluetoothAlwaysUsageDescription',
    'NSContactsUsageDescription',
    'NSCalendarsUsageDescription',
    'NSMicrophoneUsageDescription',
    'NSMotionUsageDescription'
  ]
  for (const key of forbiddenKeys) {
    if (infoPlist.includes(`<key>${key}</key>`)) throw new Error(`Generated iOS Info.plist unexpectedly contains ${key}`)
  }
}

restrictGeolocationPluginToWhenInUse(geolocationSource)
prepareIosPlatform()
restrictGeolocationPluginToWhenInUse(path.join(projectRoot, 'platforms', 'ios', 'App', 'Plugins', 'cordova-plugin-geolocation', 'CDVLocation.m'))
assertGeneratedIosPrivacySurface()
