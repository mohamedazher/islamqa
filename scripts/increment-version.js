#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

// Parse command line arguments
const args = process.argv.slice(2)
const versionType = args[0] || 'patch' // patch, minor, or major

/**
 * Increments a semantic version string
 * @param {string} version - Current version (e.g., "1.6.1")
 * @param {string} type - Type of increment: 'major', 'minor', or 'patch'
 * @returns {string} New version string
 */
function incrementVersion(version, type = 'patch') {
  const [major, minor, patch] = version.split('.').map(Number)

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`
  }
}

/**
 * Updates package.json with new version
 * @param {string} newVersion - New version string
 */
function updatePackageJson(newVersion) {
  const packagePath = path.join(rootDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  const oldVersion = packageJson.version
  packageJson.version = newVersion

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')
  console.log(`✓ Updated package.json: ${oldVersion} → ${newVersion}`)

  return oldVersion
}

/**
 * Updates config.xml with new version and versionCode
 * @param {string} newVersion - New version string
 */
function updateConfigXml(newVersion) {
  const configPath = path.join(rootDir, 'config.xml')
  let configXml = fs.readFileSync(configPath, 'utf8')

  // Extract current version and versionCode
  const versionMatch = configXml.match(/version="([^"]+)"/)
  const versionCodeMatch = configXml.match(/android-versionCode="(\d+)"/)

  const oldVersion = versionMatch ? versionMatch[1] : 'unknown'
  const oldVersionCode = versionCodeMatch ? parseInt(versionCodeMatch[1]) : 99
  const newVersionCode = oldVersionCode + 1

  // Update version attribute
  configXml = configXml.replace(
    /version="[^"]+"/,
    `version="${newVersion}"`
  )

  // Update android-versionCode
  configXml = configXml.replace(
    /android-versionCode="\d+"/,
    `android-versionCode="${newVersionCode}"`
  )

  fs.writeFileSync(configPath, configXml)
  console.log(`✓ Updated config.xml: ${oldVersion} → ${newVersion}`)
  console.log(`✓ Updated android-versionCode: ${oldVersionCode} → ${newVersionCode}`)
}

/**
 * Updates SettingsView.vue with new version
 * Note: SettingsView now uses __APP_VERSION__ constant injected by Vite,
 * so this function is mainly for backwards compatibility or manual updates.
 * @param {string} newVersion - New version string
 */
function updateSettingsView(newVersion) {
  const settingsPath = path.join(rootDir, 'src/views/SettingsView.vue')
  let settingsContent = fs.readFileSync(settingsPath, 'utf8')

  // Check if using __APP_VERSION__ constant (preferred method)
  if (settingsContent.includes('__APP_VERSION__')) {
    console.log(`✓ SettingsView.vue uses __APP_VERSION__ (injected by Vite from package.json)`)
    return
  }

  // Legacy: Extract current version from hardcoded string
  const versionMatch = settingsContent.match(/const appVersion = ['"]([^'"]+)['"]/)
  const oldVersion = versionMatch ? versionMatch[1] : 'unknown'

  // Update the appVersion constant
  settingsContent = settingsContent.replace(
    /const appVersion = ['"][^'"]+['"]/,
    `const appVersion = '${newVersion}'`
  )

  fs.writeFileSync(settingsPath, settingsContent)
  console.log(`✓ Updated SettingsView.vue: ${oldVersion} → ${newVersion}`)
}

/**
 * Main function to increment version across all files
 */
function main() {
  try {
    console.log(`\n📦 Incrementing ${versionType} version...\n`)

    // Read current version from package.json
    const packagePath = path.join(rootDir, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    const currentVersion = packageJson.version

    // Calculate new version
    const newVersion = incrementVersion(currentVersion, versionType)

    console.log(`Current version: ${currentVersion}`)
    console.log(`New version: ${newVersion}\n`)

    // Update all files
    updatePackageJson(newVersion)
    updateConfigXml(newVersion)
    updateSettingsView(newVersion)

    console.log(`\n✅ Version successfully incremented to ${newVersion}`)
    console.log(`\nFiles updated:`)
    console.log(`  - package.json`)
    console.log(`  - config.xml`)
    console.log(`  - src/views/SettingsView.vue`)
    console.log(`\nDon't forget to commit these changes!\n`)

  } catch (error) {
    console.error(`\n❌ Error incrementing version:`, error.message)
    process.exit(1)
  }
}

main()
