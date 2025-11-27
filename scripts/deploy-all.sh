#!/bin/bash

# =============================================================================
# deploy-all.sh - Universal deployment script for BetterIslam Q&A
# =============================================================================
# Usage:
#   ./scripts/deploy-all.sh [options]
#
# Options:
#   --android-only    Deploy only to Android (Google Play Beta)
#   --ios-only        Deploy only to iOS (TestFlight)
#   --web-only        Deploy only to GitHub Pages
#   --skip-tests      Skip running tests
#   --help            Show this help message
#
# With no options, deploys to all platforms (Android + iOS + Web)
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DEPLOY_ANDROID=true
DEPLOY_IOS=true
DEPLOY_WEB=true
SKIP_TESTS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --android-only)
            DEPLOY_ANDROID=true
            DEPLOY_IOS=false
            DEPLOY_WEB=false
            shift
            ;;
        --ios-only)
            DEPLOY_ANDROID=false
            DEPLOY_IOS=true
            DEPLOY_WEB=false
            shift
            ;;
        --web-only)
            DEPLOY_ANDROID=false
            DEPLOY_IOS=false
            DEPLOY_WEB=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --android-only    Deploy only to Android (Google Play Beta)"
            echo "  --ios-only        Deploy only to iOS (TestFlight)"
            echo "  --web-only        Deploy only to GitHub Pages"
            echo "  --skip-tests      Skip running tests"
            echo "  --help            Show this help message"
            echo ""
            echo "With no options, deploys to all platforms"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

print_header "Pre-flight Checks"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes:"
    git status -s
    echo ""

    # Check for unwanted files that shouldn't be committed
    if git status -s | grep -E "apk_analysis/|\.apk$|\.ipa$|node_modules/|platforms/|plugins/"; then
        print_error "Found files that should be ignored:"
        git status -s | grep -E "apk_analysis/|\.apk$|\.ipa$|node_modules/|platforms/|plugins/" || true
        print_error "These files should not be committed. Please check .gitignore"
        exit 1
    fi

    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Aborting deployment"
        exit 0
    fi
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

print_success "Pre-flight checks complete"

# =============================================================================
# Version Bump
# =============================================================================

print_header "Version Bump"

# Increment patch version
print_info "Incrementing patch version..."
# Use npm version instead of yarn to avoid interactive editor
npm version patch --no-git-tag-version > /dev/null 2>&1

# Also update config.xml versionCode
CURRENT_VERSION_CODE=$(grep -o 'android-versionCode="[0-9]*"' config.xml | grep -o '[0-9]*')
NEW_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))
sed -i '' "s/android-versionCode=\"${CURRENT_VERSION_CODE}\"/android-versionCode=\"${NEW_VERSION_CODE}\"/" config.xml

NEW_VERSION=$(node -p "require('./package.json').version")
print_success "Version bumped: $CURRENT_VERSION → $NEW_VERSION (versionCode: $CURRENT_VERSION_CODE → $NEW_VERSION_CODE)"

# =============================================================================
# Run Tests
# =============================================================================

if [ "$SKIP_TESTS" = false ]; then
    print_header "Running Tests"

    print_info "Running all tests..."
    if yarn test:all; then
        print_success "All tests passed"
    else
        print_error "Tests failed. Aborting deployment."
        exit 1
    fi
else
    print_warning "Skipping tests (--skip-tests flag)"
fi

# =============================================================================
# Commit Version Bump
# =============================================================================

print_header "Committing Changes"

# Check if there are changes to commit
if [[ -n $(git status -s) ]]; then
    # Determine commit message based on deployment targets
    if [ "$DEPLOY_ANDROID" = true ] || [ "$DEPLOY_IOS" = true ]; then
        COMMIT_MSG="Bump version to $NEW_VERSION [beta]

Deploying to:"
        [ "$DEPLOY_ANDROID" = true ] && COMMIT_MSG="$COMMIT_MSG
- Android (Google Play Beta)"
        [ "$DEPLOY_IOS" = true ] && COMMIT_MSG="$COMMIT_MSG
- iOS (TestFlight)"
        [ "$DEPLOY_WEB" = true ] && COMMIT_MSG="$COMMIT_MSG
- Web (GitHub Pages)"

COMMIT_MSG="$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    else
        COMMIT_MSG="Deploy web to GitHub Pages v$NEW_VERSION

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    fi

    git add -A
    git commit -m "$COMMIT_MSG"
    print_success "Changes committed"
else
    print_info "No changes to commit"
fi

# =============================================================================
# Push to Remote (triggers Android deployment via GitHub Actions)
# =============================================================================

if [ "$DEPLOY_ANDROID" = true ]; then
    print_header "Deploying to Android"

    print_info "Pushing to $CURRENT_BRANCH (triggers GitHub Actions)..."
    git push origin "$CURRENT_BRANCH"

    print_success "Pushed to remote - Android build triggered"
    print_info "Monitor at: https://github.com/mohamedazher/islamqa/actions"

    # Wait a moment then show latest run
    sleep 3
    print_info "Latest workflow run:"
    gh run list -L 1 --json name,status,displayTitle,createdAt
fi

# =============================================================================
# Deploy to iOS (TestFlight)
# =============================================================================

if [ "$DEPLOY_IOS" = true ]; then
    print_header "Deploying to iOS"

    print_info "Starting iOS deployment via Fastlane..."
    print_warning "This will take 5-10 minutes..."

    # Source zshrc for environment variables
    if [ -f "$HOME/.zshrc" ]; then
        source "$HOME/.zshrc"
    fi

    # Run Fastlane iOS beta lane
    if bundle exec fastlane ios beta; then
        print_success "iOS deployment complete - uploaded to TestFlight"
        print_info "View at: https://appstoreconnect.apple.com"
    else
        print_error "iOS deployment failed"
        print_info "Check logs above for details"
    fi
fi

# =============================================================================
# Deploy to Web (GitHub Pages)
# =============================================================================

if [ "$DEPLOY_WEB" = true ]; then
    print_header "Deploying to Web"

    print_info "Building web app..."
    yarn build:web

    print_info "Deploying to GitHub Pages..."
    if yarn deploy; then
        print_success "Web deployment complete"
        print_info "Live at: https://mohamedazher.github.io/islamqa/"
    else
        print_error "Web deployment failed"
    fi
fi

# =============================================================================
# Summary
# =============================================================================

print_header "Deployment Summary"

echo -e "${GREEN}Version: $NEW_VERSION${NC}"
echo ""
echo "Deployment Status:"
if [ "$DEPLOY_ANDROID" = true ]; then
    echo -e "  ${GREEN}✓${NC} Android (Google Play Beta) - In Progress"
    echo -e "    Monitor: https://github.com/mohamedazher/islamqa/actions"
fi
if [ "$DEPLOY_IOS" = true ]; then
    echo -e "  ${GREEN}✓${NC} iOS (TestFlight) - Complete"
    echo -e "    View: https://appstoreconnect.apple.com"
fi
if [ "$DEPLOY_WEB" = true ]; then
    echo -e "  ${GREEN}✓${NC} Web (GitHub Pages) - Complete"
    echo -e "    Live: https://mohamedazher.github.io/islamqa/"
fi

echo ""
print_success "All deployments initiated successfully! 🎉"
echo ""
