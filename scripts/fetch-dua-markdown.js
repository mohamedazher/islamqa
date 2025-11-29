#!/usr/bin/env node

/**
 * Fetch Dua Content from LifeWithAllah.com with Rate Limiting
 * Uses urltomarkdown service to convert pages to markdown
 * Features:
 *  - Sequential fetching with configurable delays
 *  - Timeout handling (30 seconds per request)
 *  - Content validation (minimum 500 bytes + proper markdown markers)
 *  - Automatic retry logic with exponential backoff
 *  - Saves valid markdown files only
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Category definitions with their CORRECT URLs from lifewithallah.com
const CATEGORIES = [
  { id: 'morning', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/morning/' },
  { id: 'evening', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/evening/' },
  { id: 'before-sleep', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/before-sleep/' },
  { id: 'salah', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/salah/' },
  { id: 'after-salah', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/after-salah/' },
  { id: 'ruqyah-illness', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/ruqyah-and-illness-quran/' },
  { id: 'praises-allah', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/praises-of-allah/' },
  { id: 'salawat', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/salawat/' },
  { id: 'quranic-duas', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/quranic-duas/' },
  { id: 'sunnah-duas', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/sunnah-duas/' },
  { id: 'names-allah', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/name-of-allah/' },
  { id: 'dhikr-all-times', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/dhikr-for-all-times/' },
  { id: 'istighfar', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/istighfar/' },
  { id: 'waking-up', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/waking-up/' },
  { id: 'nightmares', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/nightmares/' },
  { id: 'clothes', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/clothes/' },
  { id: 'lavatory-wudu', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/lavatory-and-wudu/' },
  { id: 'home', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/home/' },
  { id: 'adhan-masjid', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/adhan-and-masjid/' },
  { id: 'istikhara', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/istikharah/' },
  { id: 'gatherings', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/gatherings/' },
  { id: 'food-drink', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/food-and-drink/' },
  { id: 'travel', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/travel/' },
  { id: 'death', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/death/' },
  { id: 'nature', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/nature/' },
  { id: 'social-interactions', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/social-interactions/' },
  { id: 'protection-iman', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/protection-of-iman/' },
  { id: 'difficulties-happiness', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/difficulties-and-happiness/' },
  { id: 'hajj-umrah', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/hajj-and-umrah/' },
  { id: 'money-shopping', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/money-and-shopping/' },
  { id: 'marriage-children', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/marriage-and-children/' }
];

// Configuration
const CONFIG = {
  TIMEOUT_MS: 30000,              // 30 second timeout per request
  DELAY_BETWEEN_REQUESTS_MS: 3000, // 3 second delay between sequential requests
  MAX_RETRIES: 3,                 // Maximum retry attempts
  RETRY_DELAY_MS: 5000,           // Initial retry delay (exponential backoff)
  MIN_CONTENT_SIZE: 500,          // Minimum bytes for valid content
  CONTENT_INDICATORS: ['#', '##', '###', '####', '#####'] // Markdown heading markers
};

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Validate fetched content
function isValidContent(markdown) {
  if (!markdown) {
    return false;
  }

  // Check for markdown heading markers (most important indicator)
  const hasMarkdownMarkers = CONFIG.CONTENT_INDICATORS.some(marker => markdown.includes(marker));

  // Check for common error messages (placeholder content)
  const hasErrors = [
    'rate limit exceeded',
    'could not fetch and convert',
    'status code 404',
    'sorry,'
  ].some(err => markdown.toLowerCase().includes(err));

  // Valid if has markdown markers and no errors
  // (ignore MIN_CONTENT_SIZE check as the converter may return varying sizes)
  return hasMarkdownMarkers && !hasErrors;
}

// Fetch markdown with timeout
function fetchMarkdownWithTimeout(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const converterUrl = `https://urltomarkdown.herokuapp.com/?url=${encodeURIComponent(url)}&title=true&links=true&clean=true`;

    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    https.get(converterUrl, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        clearTimeout(timeout);
        resolve(data);
      });
    }).on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Fetch with retry logic
async function fetchWithRetry(category, retryCount = 0) {
  try {
    console.log(`  Fetching: ${category.id}${retryCount > 0 ? ` (attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES + 1})` : ''}`);

    const markdown = await fetchMarkdownWithTimeout(category.url, CONFIG.TIMEOUT_MS);

    // Validate content
    if (!isValidContent(markdown)) {
      throw new Error(`Invalid content: too small or error response (${markdown.length} bytes)`);
    }

    return { success: true, data: markdown };
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      const retryDelay = CONFIG.RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
      console.log(`    ⚠️  Retry in ${retryDelay}ms... (${error.message})`);
      await sleep(retryDelay);
      return fetchWithRetry(category, retryCount + 1);
    } else {
      return { success: false, error: error.message };
    }
  }
}

// Check if file is complete and valid
function isFileComplete(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Invalid if too small (less than 500 bytes)
    if (content.length < CONFIG.MIN_CONTENT_SIZE) {
      return false;
    }

    // Invalid if contains error messages
    const hasErrors = [
      'rate limit exceeded',
      'could not fetch',
      'status code 404',
      'error',
      'not found'
    ].some(err => content.toLowerCase().includes(err));

    if (hasErrors) {
      return false;
    }

    // Valid if has markdown markers
    const hasMarkdownMarkers = CONFIG.CONTENT_INDICATORS.some(marker => content.includes(marker));
    return hasMarkdownMarkers;
  } catch {
    return false;
  }
}

// Main execution
async function fetchAllMarkdown() {
  const outputDir = path.join(__dirname, '../.dua-markdown');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check which files need to be fetched
  const categoriesToFetch = CATEGORIES.filter(category => {
    const filePath = path.join(outputDir, `${category.id}.md`);
    const isComplete = isFileComplete(filePath);

    if (!isComplete) {
      const status = fs.existsSync(filePath) ? '(incomplete)' : '(missing)';
      console.log(`  ⚠️  ${category.id.padEnd(20)} ${status}`);
    } else {
      const fileSize = fs.statSync(filePath).size;
      console.log(`  ✅ ${category.id.padEnd(20)} (${fileSize} bytes - already complete)`);
    }

    return !isComplete;
  });

  console.log(`\n📥 Files to fetch: ${categoriesToFetch.length}/${CATEGORIES.length}\n`);

  if (categoriesToFetch.length === 0) {
    console.log(`✨ All files are complete! No fetching needed.\n`);
    console.log(`📖 Next step: Run task agent to parse markdown and create JSON files\n`);
    process.exit(0);
  }

  console.log(`⏱️  Configuration:`);
  console.log(`   - Timeout per request: ${CONFIG.TIMEOUT_MS}ms`);
  console.log(`   - Delay between requests: ${CONFIG.DELAY_BETWEEN_REQUESTS_MS}ms`);
  console.log(`   - Max retries: ${CONFIG.MAX_RETRIES}`);
  console.log(`   - Min content size: ${CONFIG.MIN_CONTENT_SIZE} bytes\n`);

  const results = [];
  let successful = 0;
  let failed = 0;

  for (const category of categoriesToFetch) {
    const result = await fetchWithRetry(category);

    if (result.success) {
      const filePath = path.join(outputDir, `${category.id}.md`);
      fs.writeFileSync(filePath, result.data);
      const fileSize = fs.statSync(filePath).size;
      console.log(`✅ ${category.id.padEnd(20)} → ${fileSize} bytes\n`);
      results.push({ ...result, id: category.id });
      successful++;
    } else {
      console.log(`❌ ${category.id.padEnd(20)} → Failed: ${result.error}\n`);
      results.push({ success: false, id: category.id, error: result.error });
      failed++;
    }

    // Rate limiting: wait before next request (except for last one)
    if (categoriesToFetch.indexOf(category) < categoriesToFetch.length - 1) {
      await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ Fetch Complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful: ${successful}/${categoriesToFetch.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${categoriesToFetch.length}`);
  }
  console.log(`\n📂 Markdown files saved to: ${outputDir}`);
  console.log(`📖 Next step: Run task agent to parse markdown and create JSON files\n`);

  // Exit with error code if any failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run
fetchAllMarkdown().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
