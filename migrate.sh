#!/bin/bash

# 🚀 Automated Migration Script for IslamQA Modern
# This script creates a new GitHub repository and migrates your code

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     IslamQA Modern - Automated Migration Script     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo -e "${YELLOW}Please install it first:${NC}"
    echo "  macOS:   brew install gh"
    echo "  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: https://github.com/cli/cli#installation"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo -e "${BLUE}Running: gh auth login${NC}"
    gh auth login
fi

echo -e "${GREEN}✅ GitHub CLI is ready${NC}"
echo ""

# Get repository name
echo -e "${BLUE}📝 Enter new repository name (default: islamqa-modern):${NC}"
read -r REPO_NAME
REPO_NAME=${REPO_NAME:-islamqa-modern}

# Get repository description
REPO_DESC="Modern Islamic Q&A app with Vue 3, dark mode, and responsive design"

echo ""
echo -e "${BLUE}Creating repository: ${REPO_NAME}${NC}"
echo -e "${BLUE}Description: ${REPO_DESC}${NC}"
echo ""
echo -e "${YELLOW}Press Enter to continue or Ctrl+C to cancel...${NC}"
read -r

# Create repository
echo -e "${BLUE}🚀 Creating GitHub repository...${NC}"
if gh repo create "$REPO_NAME" --public --description "$REPO_DESC" --source=. --remote=new-origin; then
    echo -e "${GREEN}✅ Repository created: $REPO_NAME${NC}"
else
    echo -e "${RED}❌ Failed to create repository${NC}"
    exit 1
fi

echo ""

# Update vite.config.web.js with correct base path
echo -e "${BLUE}📝 Updating vite.config.web.js with base path...${NC}"
sed -i "s|base: '/islamqa/',|base: '/$REPO_NAME/',|g" vite.config.web.js
echo -e "${GREEN}✅ Updated base path to: /$REPO_NAME/${NC}"

# Commit the change
git add vite.config.web.js
git commit -m "Update base path for new repository: $REPO_NAME"

echo ""

# Push to new repository
echo -e "${BLUE}📤 Pushing code to new repository...${NC}"
CURRENT_BRANCH=$(git branch --show-current)

if git push new-origin "$CURRENT_BRANCH:main"; then
    echo -e "${GREEN}✅ Code pushed to main branch${NC}"
else
    echo -e "${RED}❌ Failed to push code${NC}"
    exit 1
fi

echo ""

# Get GitHub username
GH_USER=$(gh api user --jq '.login')

# Enable GitHub Pages
echo -e "${BLUE}📄 Enabling GitHub Pages...${NC}"
echo -e "${YELLOW}Note: GitHub Pages must be enabled manually in repository settings${NC}"
echo ""
echo -e "${BLUE}Opening repository settings...${NC}"
sleep 2
gh repo view "$GH_USER/$REPO_NAME" --web

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Migration Complete!                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "  1️⃣  ${YELLOW}Enable GitHub Pages:${NC}"
echo "     - Go to: Settings → Pages"
echo "     - Source: Select 'GitHub Actions'"
echo "     - Click Save"
echo ""
echo -e "  2️⃣  ${YELLOW}Wait for deployment (2-3 minutes)${NC}"
echo "     - Check: https://github.com/$GH_USER/$REPO_NAME/actions"
echo ""
echo -e "  3️⃣  ${YELLOW}Visit your live app:${NC}"
echo -e "     ${GREEN}🌐 https://$GH_USER.github.io/$REPO_NAME/${NC}"
echo ""
echo -e "${BLUE}📚 Repository:${NC} https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo -e "${GREEN}🎉 Your modern Islamic Q&A app is ready!${NC}"
echo ""
