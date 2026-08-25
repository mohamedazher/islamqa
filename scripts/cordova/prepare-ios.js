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
const diagnosticLocationSource = path.join(
  projectRoot,
  'node_modules',
  'cordova.plugins.diagnostic',
  'src',
  'ios',
  'Diagnostic_Location.m'
)
const diagnosticPluginDirectory = path.dirname(path.dirname(path.dirname(diagnosticLocationSource)))

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

function restrictDiagnosticPluginToWhenInUse(filePath) {
  let source = fs.readFileSync(filePath, 'utf8')

  if (!source.includes('requestAlwaysAuthorization')) return

  source = replaceExactlyOnce(
    source,
    `                BOOL always = [[command argumentAtIndex:0] boolValue];\n                if(always){\n                    NSAssert([[[NSBundle mainBundle] infoDictionary] valueForKey:@"NSLocationAlwaysAndWhenInUseUsageDescription"], @"Your app must have a value for NSLocationAlwaysAndWhenInUseUsageDescription in its Info.plist");\n                    [self.locationManager requestAlwaysAuthorization];\n                    [diagnostic logDebug:@"Requesting location authorization: always"];\n                }else{\n                    NSAssert([[[NSBundle mainBundle] infoDictionary] valueForKey:@"NSLocationWhenInUseUsageDescription"], @"Your app must have a value for NSLocationWhenInUseUsageDescription in its Info.plist");\n                    [self.locationManager requestWhenInUseAuthorization];\n                    [diagnostic logDebug:@"Requesting location authorization: when in use"];\n                }`,
    `                NSAssert([[[NSBundle mainBundle] infoDictionary] valueForKey:@"NSLocationWhenInUseUsageDescription"], @"Your app must have a value for NSLocationWhenInUseUsageDescription in its Info.plist");\n                [self.locationManager requestWhenInUseAuthorization];\n                [diagnostic logDebug:@"Requesting location authorization: when in use"];`,
    filePath
  )
  fs.writeFileSync(filePath, source)
}

function applyDiagnosticLocationModuleSelection() {
  const result = spawnSync(process.execPath, ['scripts/apply-modules.js'], {
    cwd: diagnosticPluginDirectory,
    stdio: 'inherit'
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
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
  if (!fs.existsSync(pluginDirectory)) {
    throw new Error('cordova.plugins.diagnostic LOCATION module is missing from the generated iOS project')
  }

  const diagnosticLocation = path.join(pluginDirectory, 'Diagnostic_Location.m')
  const diagnosticSource = fs.readFileSync(diagnosticLocation, 'utf8')
  if (diagnosticSource.includes('requestAlwaysAuthorization')) {
    throw new Error('Generated iOS diagnostic location module still references always-location authorization')
  }

  const unsupportedDiagnosticModules = [
    'Diagnostic_Bluetooth',
    'Diagnostic_Calendar',
    'Diagnostic_Camera',
    'Diagnostic_Contacts',
    'Diagnostic_Microphone',
    'Diagnostic_Motion',
    'Diagnostic_Notifications',
    'Diagnostic_Reminders',
    'Diagnostic_Wifi'
  ]
  for (const module of unsupportedDiagnosticModules) {
    if (fs.existsSync(path.join(pluginDirectory, `${module}.m`))) {
      throw new Error(`Generated iOS diagnostic plugin unexpectedly includes ${module}`)
    }
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
applyDiagnosticLocationModuleSelection()
restrictDiagnosticPluginToWhenInUse(diagnosticLocationSource)
prepareIosPlatform()
restrictGeolocationPluginToWhenInUse(path.join(projectRoot, 'platforms', 'ios', 'App', 'Plugins', 'cordova-plugin-geolocation', 'CDVLocation.m'))
restrictDiagnosticPluginToWhenInUse(path.join(projectRoot, 'platforms', 'ios', 'App', 'Plugins', 'cordova.plugins.diagnostic', 'Diagnostic_Location.m'))
assertGeneratedIosPrivacySurface()
