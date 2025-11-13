# Google Play Console API Setup Guide

This guide walks you through setting up automated deployment to Google Play Console using Fastlane.

## Prerequisites

- Your app must already be published in Google Play Console
- You need Owner or Admin access to the Google Play Console account
- You need access to the Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing project
3. Note down your **Project ID**

## Step 2: Enable Google Play Developer API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Play Android Developer API"
3. Click **Enable**

## Step 3: Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Fill in the details:
   - **Name**: `fastlane-deployment`
   - **Description**: `Service account for automated Play Store deployments`
4. Click **Create and Continue**
5. **Grant permissions**: Skip this step (click **Continue**)
6. Click **Done**

## Step 4: Create JSON Key

1. Find your new service account in the list
2. Click the **three dots** (Actions) > **Manage keys**
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create**
6. A JSON file will download - **SAVE THIS SECURELY!**

## Step 5: Grant Play Console Access

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app
3. Go to **Setup** > **API access**
4. Click **Link** next to your Google Cloud project (if not already linked)
5. Scroll down to **Service accounts**
6. Find your service account (`fastlane-deployment@...`)
7. Click **Grant access**
8. Set permissions:
   - **App information**: View only
   - **Releases**: View and manage
   - **Release management**: Manage production releases, Manage testing tracks
   - **Store presence**: View only
9. Click **Invite user**
10. Click **Send invite**

## Step 6: Save JSON Key to GitHub Secrets

### Option A: Upload JSON Key (for local use)

```bash
# Copy your JSON key file to a secure location
cp ~/Downloads/your-service-account-key.json /secure/path/google-play-api-key.json

# Create .env.fastlane file (gitignored)
cat > .env.fastlane << EOF
PLAY_STORE_JSON_KEY=/secure/path/google-play-api-key.json
EOF
```

### Option B: Use JSON Key Content (for CI/CD)

```bash
# Base64 encode the JSON key
cat /path/to/your-service-account-key.json | base64 > play-store-key-base64.txt

# Add to GitHub Secrets
gh secret set PLAY_STORE_JSON_KEY_DATA < /path/to/your-service-account-key.json
```

## Step 7: Test Connection

```bash
# Install dependencies
bundle install --path vendor/bundle

# Test Fastlane access
bundle exec fastlane run validate_play_store_json_key json_key:/path/to/your-key.json
```

## GitHub Actions Setup

Add these secrets to your GitHub repository:

```bash
# Go to: GitHub Repo > Settings > Secrets and variables > Actions

# Add the following secrets:
PLAY_STORE_JSON_KEY_DATA    # Content of your JSON key file
```

## Testing Beta Deployment

Once set up, you can deploy to internal testing:

```bash
# Local deployment
bundle exec fastlane android beta

# This will:
# 1. Build release APK and AAB
# 2. Upload to Google Play Internal Testing track
# 3. Make the build available for internal testers
```

## Troubleshooting

### Error: "The current user has insufficient permissions"

- Make sure the service account has the correct permissions in Play Console
- Wait 5-10 minutes after granting access (propagation delay)
- Verify API is enabled in Google Cloud Console

### Error: "Invalid JSON key"

- Check that the JSON file is not corrupted
- Ensure you're using the correct JSON key file
- Try regenerating the key if needed

### Error: "Project not found"

- Verify the Google Cloud project is linked to Play Console
- Check that Google Play Android Developer API is enabled
- Ensure service account is created in the correct project

## Next Steps

After successful setup:

1. Configure internal testers in Play Console
2. Test automated deployments
3. Set up release promotion workflows
4. Configure metadata and screenshots uploads
