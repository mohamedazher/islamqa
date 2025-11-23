/**
 * Generate embeddings for AI summaries using Gemini API
 *
 * Usage: node scripts/generate-embeddings-gemini.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GEMINI_API_KEY = 'AIzaSyAEma46H6zePFRvQnp8ccfkOPI9eb7mbR8';
const BATCH_SIZE = 100; // Process 100 at a time
const DELAY_MS = 100; // Delay between batches to avoid rate limits

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

// Paths
const summariesDir = path.join(__dirname, '../public/data/summaries');
const outputPath = path.join(__dirname, '../public/data/embeddings.json');
const checkpointPath = path.join(__dirname, '.embeddings-checkpoint.json');

/**
 * Load all summaries from batch files
 */
function loadSummaries() {
  const summaries = {};

  for (let i = 1; i <= 20; i++) {
    const batchNum = String(i).padStart(3, '0');
    const batchPath = path.join(summariesDir, `batch_${batchNum}.json`);

    if (fs.existsSync(batchPath)) {
      const batch = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
      Object.assign(summaries, batch.summaries);
      console.log(`Loaded batch ${batchNum}: ${Object.keys(batch.summaries).length} summaries`);
    }
  }

  return summaries;
}

/**
 * Load checkpoint if exists
 */
function loadCheckpoint() {
  if (fs.existsSync(checkpointPath)) {
    return JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
  }
  return { completed: [], embeddings: {} };
}

/**
 * Save checkpoint
 */
function saveCheckpoint(checkpoint) {
  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
}

/**
 * Generate embedding for a single text
 */
async function generateEmbedding(text) {
  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding error:', error.message);
    throw error;
  }
}

/**
 * Process summaries in batches
 */
async function processEmbeddings(summaries) {
  const checkpoint = loadCheckpoint();
  const references = Object.keys(summaries);
  const toProcess = references.filter(ref => !checkpoint.completed.includes(ref));

  console.log(`\nTotal summaries: ${references.length}`);
  console.log(`Already processed: ${checkpoint.completed.length}`);
  console.log(`Remaining: ${toProcess.length}\n`);

  if (toProcess.length === 0) {
    console.log('All embeddings already generated!');
    return checkpoint.embeddings;
  }

  let processed = 0;
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const batchPromises = batch.map(async (ref) => {
      const summary = summaries[ref];
      const text = summary.summary || '';

      if (!text) {
        return { ref, embedding: null };
      }

      try {
        const embedding = await generateEmbedding(text);
        return { ref, embedding };
      } catch (error) {
        console.error(`Error for ref ${ref}:`, error.message);
        return { ref, embedding: null };
      }
    });

    const results = await Promise.all(batchPromises);

    // Update checkpoint
    for (const { ref, embedding } of results) {
      if (embedding) {
        checkpoint.embeddings[ref] = embedding;
        checkpoint.completed.push(ref);
      }
    }

    processed += batch.length;

    // Save checkpoint periodically
    if (processed % 500 === 0 || i + BATCH_SIZE >= toProcess.length) {
      saveCheckpoint(checkpoint);
    }

    // Progress
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed;
    const remaining = (toProcess.length - processed) / rate;

    console.log(`Progress: ${processed}/${toProcess.length} (${((processed/toProcess.length)*100).toFixed(1)}%) - ${rate.toFixed(1)}/sec - ETA: ${remaining.toFixed(0)}s`);

    // Rate limiting delay
    if (i + BATCH_SIZE < toProcess.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  return checkpoint.embeddings;
}

/**
 * Save final embeddings file
 */
function saveEmbeddings(embeddings) {
  const output = {
    metadata: {
      generated_at: new Date().toISOString(),
      model: 'text-embedding-004',
      dimensions: 768,
      total: Object.keys(embeddings).length
    },
    embeddings
  };

  fs.writeFileSync(outputPath, JSON.stringify(output));

  // Calculate file size
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\nSaved embeddings to: ${outputPath}`);
  console.log(`File size: ${sizeMB} MB`);
  console.log(`Total embeddings: ${Object.keys(embeddings).length}`);
}

/**
 * Main function
 */
async function main() {
  console.log('=== Gemini Embedding Generation ===\n');

  // Load summaries
  const summaries = loadSummaries();
  console.log(`\nLoaded ${Object.keys(summaries).length} total summaries\n`);

  if (Object.keys(summaries).length === 0) {
    console.error('No summaries found! Run summary generation first.');
    process.exit(1);
  }

  // Generate embeddings
  const embeddings = await processEmbeddings(summaries);

  // Save final output
  saveEmbeddings(embeddings);

  // Clean up checkpoint
  if (fs.existsSync(checkpointPath)) {
    fs.unlinkSync(checkpointPath);
    console.log('Cleaned up checkpoint file');
  }

  console.log('\nDone!');
}

main().catch(console.error);
