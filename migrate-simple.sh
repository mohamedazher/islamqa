#!/bin/bash

# 🚀 Simple Migration Script (No GitHub CLI required)
# This script helps you migrate to a new repository manually

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     IslamQA Modern - Simple Migration Script        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Get repository information
echo -e "${BLUE}📝 Enter your GitHub username:${NC}"
read -r GH_USER

echo -e "${BLUE}📝 Enter new repository name (default: islamqa-modern):${NC}"
read -r REPO_NAME
REPO_NAME=${REPO_NAME:-islamqa-modern}

echo ""
echo -e "${YELLOW}⚠️  Before running this script:${NC}"
echo -e "  1. Create a new repository on GitHub:"
echo -e "     ${BLUE}https://github.com/new${NC}"
echo -e "  2. Name it: ${GREEN}$REPO_NAME${NC}"
echo -e "  3. Make it ${GREEN}Public${NC}"
echo -e "  4. ${YELLOW}Do NOT${NC} initialize with README, .gitignore, or license"
echo ""
echo -e "${YELLOW}Press Enter when repository is created, or Ctrl+C to cancel...${NC}"
read -r

# Update vite.config.web.js
echo ""
echo -e "${BLUE}📝 Updating vite.config.web.js...${NC}"
sed -i.bak "s|base: '/islamqa/',|base: '/$REPO_NAME/',|g" vite.config.web.js
echo -e "${GREEN}✅ Updated base path to: /$REPO_NAME/${NC}"

# Commit the change
git add vite.config.web.js
git commit -m "Update base path for new repository: $REPO_NAME"
echo -e "${GREEN}✅ Changes committed${NC}"

echo ""

# Add new remote
echo -e "${BLUE}📡 Adding new remote...${NC}"
NEW_REMOTE="https://github.com/$GH_USER/$REPO_NAME.git"
git remote add new-origin "$NEW_REMOTE" 2>/dev/null || git remote set-url new-origin "$NEW_REMOTE"
echo -e "${GREEN}✅ Remote added: $NEW_REMOTE${NC}"

echo ""

# Push to new repository
echo -e "${BLUE}📤 Pushing to new repository...${NC}"
CURRENT_BRANCH=$(git branch --show-current)

if git push -u new-origin "$CURRENT_BRANCH:main"; then
    echo -e "${GREEN}✅ Code pushed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to push. Check your credentials.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Migration Complete!                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "  1️⃣  ${YELLOW}Enable GitHub Pages:${NC}"
echo "     - Visit: https://github.com/$GH_USER/$REPO_NAME/settings/pages"
echo "     - Under 'Source', select: ${GREEN}GitHub Actions${NC}"
echo "     - Click 'Save'"
echo ""
echo -e "  2️⃣  ${YELLOW}Monitor deployment:${NC}"
echo "     - Visit: https://github.com/$GH_USER/$REPO_NAME/actions"
echo "     - Wait for green checkmark (2-3 minutes)"
echo ""
echo -e "  3️⃣  ${YELLOW}View your live app:${NC}"
echo -e "     ${GREEN}🌐 https://$GH_USER.github.io/$REPO_NAME/${NC}"
echo ""
echo -e "${BLUE}📚 Repository URL:${NC}"
echo "   https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo -e "${GREEN}🎉 Your app is ready to deploy!${NC}"
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Bookmark your live URL and share it for testing!"
echo ""
