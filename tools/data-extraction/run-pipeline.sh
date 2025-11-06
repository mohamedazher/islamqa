#!/bin/bash
# run-pipeline.sh
# Complete data pipeline: Extract → Transform → Bundle
#
# Usage:
#   ./run-pipeline.sh               # Full extraction (1-250000)
#   ./run-pipeline.sh --test        # Test mode (1-100)
#   ./run-pipeline.sh --quick       # Quick mode (skip extraction)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
START_REF=1
END_REF=250000
DELAY=2.0
LANG="en"
SKIP_EXTRACTION=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --test)
      START_REF=1
      END_REF=100
      DELAY=0.3
      echo -e "${YELLOW}🧪 Test mode: extracting references 1-100${NC}"
      shift
      ;;
    --quick)
      SKIP_EXTRACTION=true
      echo -e "${YELLOW}⚡ Quick mode: skipping extraction${NC}"
      shift
      ;;
    --range)
      START_REF=$2
      END_REF=$3
      shift 3
      ;;
    --delay)
      DELAY=$2
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   IslamQA Data Pipeline                ║"
echo "║   Extract → Transform → Bundle         ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Show configuration
echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Range: $START_REF - $END_REF"
echo "  Delay: $DELAY seconds"
echo "  Language: $LANG"
echo ""

# Check dependencies
echo -e "${BLUE}🔍 Checking dependencies...${NC}"
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ python3 not found${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ node not found${NC}"; exit 1; }
echo -e "${GREEN}✅ All dependencies found${NC}"
echo ""

# Create directories
mkdir -p raw transformed
echo -e "${GREEN}✅ Created working directories${NC}"
echo ""

# ==================== STAGE 1: EXTRACT ====================
if [ "$SKIP_EXTRACTION" = false ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📥 STAGE 1: Extracting from API${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # Estimate time
  TOTAL_REQUESTS=$((END_REF - START_REF + 1))
  ESTIMATED_HOURS=$(echo "scale=1; ($TOTAL_REQUESTS * $DELAY) / 3600" | bc)
  echo -e "${YELLOW}⏱️  Estimated time: $ESTIMATED_HOURS hours for $TOTAL_REQUESTS requests${NC}"
  echo ""

  # Confirm if large range
  if [ $TOTAL_REQUESTS -gt 1000 ]; then
    read -p "Continue with $TOTAL_REQUESTS requests? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}❌ Cancelled${NC}"
      exit 1
    fi
  fi

  # Run extraction
  python3 extract_fresh.py \
    --range $START_REF $END_REF \
    --output raw \
    --delay $DELAY \
    --lang $LANG

  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Extraction failed${NC}"
    exit 1
  fi

  echo -e "${GREEN}✅ Extraction complete${NC}"
  echo ""
else
  echo -e "${YELLOW}⚡ Skipping extraction (using existing data)${NC}"
  echo ""
fi

# ==================== STAGE 2: TRANSFORM ====================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 STAGE 2: Transforming to app format${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

node transform.cjs \
  --input raw \
  --output transformed

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Transformation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Transformation complete${NC}"
echo ""

# ==================== STAGE 3: BUNDLE ====================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 STAGE 3: Bundling for app${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

node bundle.cjs \
  --input transformed \
  --output ../../public/data

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Bundling failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Bundling complete${NC}"
echo ""

# ==================== SUMMARY ====================
echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║   ✨ Pipeline Complete!                ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}📂 Data Location:${NC}"
echo "  $(cd ../../public/data && pwd)"
echo ""

echo -e "${BLUE}📊 Files Generated:${NC}"
ls -lh ../../public/data/*.json | awk '{print "  " $9 " (" $5 ")"}'
echo ""

echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "  1. cd ../.."
echo "  2. yarn dev"
echo "  3. Open ImportView and test data import"
echo "  4. Verify categories, questions, and answers load correctly"
echo ""

echo -e "${GREEN}✨ All done!${NC}"
