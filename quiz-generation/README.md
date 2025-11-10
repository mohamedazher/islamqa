# Quiz Generation System

## 📖 Documentation

**See the complete guide**: [QUIZ_GENERATION_GUIDE.md](../QUIZ_GENERATION_GUIDE.md) in the project root.

The main documentation covers:
- System overview and architecture
- Quick start and step-by-step workflow
- All CLI commands and modes
- Data formats and integration
- Troubleshooting and scaling path

---

## Quick Reference

### Process a Batch (6 steps, ~1-2 hours)

```bash
cd quiz-generation/scripts

# 1. Select 100 questions
node generate-quiz.js --mode=select --count=100

# 2. Generate with Claude (manual - use generate-quiz-prompt.md)
#    → Takes 30-45 minutes

# 3. Validate output
node generate-quiz.js --mode=validate --input=batch-TIMESTAMP-output.json

# 4. Merge into metadata
node generate-quiz.js --mode=merge --input=batch-TIMESTAMP-output.json

# 5. Update app data
node -e "const fs = require('fs'); const m = JSON.parse(fs.readFileSync('../batches/batch-TIMESTAMP-output-merged.json')); fs.writeFileSync('../../public/data/enhancements.json', JSON.stringify(m.generatedEnhancements, null, 2));"

# 6. Commit and push
cd ../..
git add public/data/enhancements.json
git commit -m "Add [N] quiz enhancements from new batch"
git push
```

### Check Progress

```bash
cd quiz-generation/scripts
node generate-quiz.js --mode=stats
```

### Files in This Directory

| File | Purpose |
|------|---------|
| `README.md` | This file (quick reference) |
| `generate-quiz-prompt.md` | Claude AI prompt template |
| `QUIZ_WORKFLOW_V2.md` | Detailed workflow documentation (archived) |
| `scripts/generate-quiz.js` | Main CLI tool |
| `scripts/init-metadata.js` | Metadata management utility |
| `scripts/transform-to-v2.js` | Format conversion utility |
| `batches/` | Input/output batch files |
| `enhancement-metadata.json` | Processing tracker |

---

## Current Status

```
📊 Coverage: 150 / 15,615 questions (1.0%)
🎯 Last Updated: November 10, 2025
✅ Status: Production Ready
📈 Processing Speed: 100 questions per batch
⚡ Quality: 100% validation pass rate
```

---

## For Complete Details

👉 See: **[QUIZ_GENERATION_GUIDE.md](../QUIZ_GENERATION_GUIDE.md)**

It includes:
- Complete architecture overview
- Step-by-step instructions for all phases
- All CLI command documentation
- Data format specifications
- App integration details
- Troubleshooting guide
- Scaling and progress tracking

---

## Key Features

✅ **LLM-Only**: Claude AI generates professional quizzes
✅ **Tracked**: Metadata prevents duplicate processing
✅ **Validated**: Format and content verification required
✅ **Scalable**: Process 50-100 questions per batch
✅ **Integrated**: Automatic app import on first load
✅ **Tested**: 100% validation pass rate

---

## Related Documentation

- **QUIZ_ENHANCEMENTS_INTEGRATION.md** - How enhancements load into the app
- **generate-quiz-prompt.md** - Template for Claude AI prompts
- **public/data/enhancements.json** - Generated quiz data (app loads this)

---

## Support

Questions? Check the **Troubleshooting** section in [QUIZ_GENERATION_GUIDE.md](../QUIZ_GENERATION_GUIDE.md).

