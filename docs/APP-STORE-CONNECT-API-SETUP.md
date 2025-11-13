# App Store Connect API Setup Guide

This guide walks you through setting up automated deployment to App Store Connect (TestFlight) using Fastlane.

## Prerequisites

- Your app must already be published in App Store Connect
- You need Admin access to App Store Connect
- You need to be enrolled in the Apple Developer Program

## Step 1: Create App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click your name at the top right
3. Select **Keys** under **Users and Access**
4. Click the **+** button to create a new API key
5. Fill in the details:
   - **Name**: `Fastlane CI/CD`
   - **Access**: Choose **App Manager** (or custom role with upload permissions)
6. Click **Generate**
7. **Download** the API Key file (`.p8` file) - **you can only download this once!**
8. Note down:
   - **Issuer ID** (shown at top of page)
   - **Key ID** (shown in the key row)

## Step 2: Get Team IDs

### App Store Connect Team ID

1. Still in App Store Connect, look at the URL
2. It will look like: `https://appstoreconnect.apple.com/teams/XXXXXXXXXX`
3. The `XXXXXXXXXX` is your **App Store Connect Team ID**

Or:

1. Go to **Membership Details** in App Store Connect
2. Look for **Team ID**

### Developer Portal Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Click **Membership** in the sidebar
3. Note down the **Team ID**

## Step 3: Save Credentials Securely

### For Local Development

Create `.env.fastlane` file:

```bash
cat > .env.fastlane << 'EOF'
# Apple ID
APPLE_ID=mohamedazher@gmail.com

# Team IDs
ITC_TEAM_ID=YOUR_APP_STORE_CONNECT_TEAM_ID
TEAM_ID=YOUR_DEVELOPER_PORTAL_TEAM_ID

# API Key
APP_STORE_CONNECT_API_KEY_ID=YOUR_KEY_ID
APP_STORE_CONNECT_API_ISSUER_ID=YOUR_ISSUER_ID
EOF

# Add the private key content
cat /path/to/AuthKey_XXXXXXXXXX.p8 >> .env.fastlane
```

Or save the key file path:

```bash
# Save the .p8 file securely
cp ~/Downloads/AuthKey_*.p8 ~/.appstoreconnect/private_keys/

# Reference it in Fastfile or .env
APP_STORE_CONNECT_API_KEY_PATH=~/.appstoreconnect/private_keys/AuthKey_XXXXXXXXXX.p8
```

### For GitHub Actions

```bash
# Base64 encode the private key
cat /path/to/AuthKey_*.p8 | base64 > app-store-key-base64.txt

# Add secrets to GitHub
gh secret set APPLE_ID --body "mohamedazher@gmail.com"
gh secret set APP_STORE_CONNECT_API_KEY_ID --body "YOUR_KEY_ID"
gh secret set APP_STORE_CONNECT_API_ISSUER_ID --body "YOUR_ISSUER_ID"
gh secret set APP_STORE_CONNECT_API_KEY_CONTENT < /path/to/AuthKey_*.p8
```

## Step 4: Set Up Code Signing (Match)

Fastlane Match manages iOS code signing certificates and provisioning profiles.

### Option 1: Use Existing Certificates (Simpler)

If you already have certificates and provisioning profiles:

1. Export your distribution certificate (.p12) from Keychain Access
2. Download your distribution provisioning profile from Developer Portal
3. Store them as GitHub Secrets (as you've already done)

### Option 2: Use Fastlane Match (Recommended for teams)

Match stores certificates in a private Git repo:

```bash
# Create a private GitHub repo for certificates
gh repo create your-org/ios-certificates --private

# Initialize match
bundle exec fastlane match init

# Select git storage
# Enter your repo URL: git@github.com:your-org/ios-certificates.git

# Generate new certificates
bundle exec fastlane match appstore

# You'll be prompted for a passphrase - save this securely!
```

Add to `.env.fastlane`:

```bash
MATCH_GIT_URL=git@github.com:your-org/ios-certificates.git
MATCH_PASSWORD=your-secure-passphrase
```

## Step 5: Test Connection

```bash
# Install dependencies
bundle install --path vendor/bundle

# Test API connection
bundle exec fastlane run app_store_connect_api_key \
  key_id:"YOUR_KEY_ID" \
  issuer_id:"YOUR_ISSUER_ID" \
  key_filepath:"/path/to/AuthKey_*.p8"
```

## Step 6: GitHub Actions Secrets

Add these secrets to your GitHub repository:

```bash
# Go to: GitHub Repo > Settings > Secrets and variables > Actions

# Add the following secrets:
APPLE_ID                              # Your Apple ID email
APP_STORE_CONNECT_API_KEY_ID          # API Key ID
APP_STORE_CONNECT_API_ISSUER_ID       # Issuer ID
APP_STORE_CONNECT_API_KEY_CONTENT     # Contents of .p8 file (base64)
ITC_TEAM_ID                           # App Store Connect Team ID
TEAM_ID                               # Developer Portal Team ID

# If using Match:
MATCH_GIT_URL                         # Git repo URL for certificates
MATCH_PASSWORD                        # Passphrase for certificates
MATCH_DEPLOY_KEY                      # SSH deploy key for certificates repo
```

## Testing TestFlight Deployment

Once set up, you can deploy to TestFlight:

```bash
# Local deployment
bundle exec fastlane ios beta

# This will:
# 1. Build release IPA
# 2. Upload to TestFlight
# 3. Make the build available for internal testers
```

## Troubleshooting

### Error: "Authentication failed"

- Verify API Key ID and Issuer ID are correct
- Check that .p8 file contents are correct
- Ensure API key has not been revoked in App Store Connect

### Error: "Team not found"

- Verify ITC_TEAM_ID and TEAM_ID are correct
- Check that you're a member of the team
- Try using the numeric Team ID instead of alphanumeric

### Error: "Code signing failed"

- Ensure you have valid distribution certificates
- Check provisioning profiles are up to date
- Try regenerating certificates with Match
- Verify bundle identifier matches your app

### Error: "Invalid provisioning profile"

- Check that provisioning profile includes all required capabilities
- Ensure profile is not expired
- Regenerate profile if needed

## Code Signing Options Summary

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Manual** | Simple, familiar | Hard to share, expires | Solo developers |
| **Match** | Team-friendly, automated | Initial setup complex | Teams |
| **Xcode Cloud** | No local setup needed | Vendor lock-in, cost | Simple workflows |

## Next Steps

After successful setup:

1. Configure TestFlight internal testers
2. Test automated deployments
3. Set up external testing groups
4. Configure metadata and screenshots uploads
5. Set up automatic version bumping
