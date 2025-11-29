#!/usr/bin/env node

/**
 * Fetch Remaining Dua Content from LifeWithAllah.com
 * Re-fetches 7 missing/failed categories
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Only the 7 missing/failed categories
const CATEGORIES = [
  { id: 'names-allah', url: 'https://lifewithallah.com/dhikr-dua/main-adhkar/name-of-allah/' },
  { id: 'social-interactions', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/social-interactions/' },
  { id: 'protection-iman', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/protection-of-iman/' },
  { id: 'difficulties-happiness', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/difficulties-and-happiness/' },
  { id: 'hajj-umrah', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/hajj-and-umrah/' },
  { id: 'money-shopping', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/money-and-shopping/' },
  { id: 'marriage-children', url: 'https://lifewithallah.com/dhikr-dua/other-adhkar/marriage-and-children/' }
];

const CONFIG = {
  TIMEOUT_MS: 30000,
  DELAY_BETWEEN_REQUESTS_MS: 3000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidContent(markdown) {
  if (!markdown) return false;
  const hasMarkdownMarkers = ['#', '##', '###', '####', '#####'].some(marker => markdown.includes(marker));
  const hasErrors = ['rate limit exceeded', 'could not fetch and convert', 'status code 404', 'sorry'].some(err => markdown.toLowerCase().includes(err));
  return hasMarkdownMarkers && !hasErrors;
}

function fetchMarkdownWithTimeout(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const converterUrl = `https://urltomarkdown.herokuapp.com/?url=${encodeURIComponent(url)}&title=true&links=true&clean=true`;

    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    https.get(converterUrl, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
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

async function fetchWithRetry(category, retryCount = 0) {
  try {
    console.log(`  Fetching: ${category.id}${retryCount > 0 ? ` (attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES + 1})` : ''}`);

    const markdown = await fetchMarkdownWithTimeout(category.url, CONFIG.TIMEOUT_MS);

    if (!isValidContent(markdown)) {
      throw new Error(`Invalid content: ${markdown.length} bytes`);
    }

    return { success: true, data: markdown };
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      const retryDelay = CONFIG.RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`    ⚠️  Retry in ${retryDelay}ms... (${error.message})`);
      await sleep(retryDelay);
      return fetchWithRetry(category, retryCount + 1);
    } else {
      return { success: false, error: error.message };
    }
  }
}

async function fetchAllMarkdown() {
  const outputDir = path.join(__dirname, '../.dua-markdown');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📥 Fetching remaining ${CATEGORIES.length} markdown files...\n`);
  console.log(`⏱️  Configuration:`);
  console.log(`   - Timeout per request: ${CONFIG.TIMEOUT_MS}ms`);
  console.log(`   - Delay between requests: ${CONFIG.DELAY_BETWEEN_REQUESTS_MS}ms`);
  console.log(`   - Max retries: ${CONFIG.MAX_RETRIES}\n`);

  let successful = 0;
  let failed = 0;

  for (const category of CATEGORIES) {
    const result = await fetchWithRetry(category);

    if (result.success) {
      const filePath = path.join(outputDir, `${category.id}.md`);
      fs.writeFileSync(filePath, result.data);
      const fileSize = fs.statSync(filePath).size;
      console.log(`✅ ${category.id.padEnd(25)} → ${fileSize} bytes\n`);
      successful++;
    } else {
      console.log(`❌ ${category.id.padEnd(25)} → Failed: ${result.error}\n`);
      failed++;
    }

    // Rate limiting: wait before next request (except for last one)
    if (CATEGORIES.indexOf(category) < CATEGORIES.length - 1) {
      await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ Fetch Complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful: ${successful}/${CATEGORIES.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${CATEGORIES.length}`);
  }
  console.log(`\n📂 Markdown files saved to: ${outputDir}`);
  console.log(`📖 Next step: Parse markdown files into JSON\n`);

  process.exit(failed > 0 ? 1 : 0);
}

fetchAllMarkdown().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
