#!/usr/bin/env node

/**
 * Batch 1 AI Summary Generator
 * Processes questions 0-799 from questions.json
 * Generates AI metadata: summary, tags, ruling, key_terms, query_phrases
 */

const fs = require('fs');
const path = require('path');

// Load questions
const questionsPath = path.join(__dirname, '../public/data/questions.json');
const outputPath = path.join(__dirname, '../public/data/summaries/batch_001.json');

// Tag categories for classification
const VALID_TAGS = [
  'fiqh', 'aqeedah', 'tafsir', 'hadith', 'seerah', 'history', 'adab', 'dua', 'dhikr', 'quran',
  'halal', 'haram', 'makruh', 'mubah', 'mustahabb', 'wajib', 'bidah', 'shirk',
  'salah', 'prayer', 'fasting', 'sawm', 'zakat', 'hajj', 'umrah',
  'marriage', 'nikah', 'divorce', 'talaq', 'family', 'children', 'parenting',
  'food', 'drink', 'clothing', 'hijab', 'business', 'finance', 'riba', 'work', 'education',
  'health', 'medicine', 'death', 'janazah', 'inheritance',
  'women', 'men', 'youth', 'converts', 'elderly', 'travel',
  'ramadan', 'eid', 'friday', 'mosque'
];

// Ruling keywords detection with context
const RULING_PATTERNS = {
  haram: ['is haram', 'is haraam', 'is forbidden', 'is prohibited', 'not permissible', 'not allowed', 'impermissible', 'unlawful', 'considered haram'],
  halal: ['is halal', 'is permissible', 'is allowed', 'is lawful', 'is permitted', 'nothing wrong with'],
  makruh: ['is makruh', 'is makrooh', 'is disliked', 'is discouraged', 'better to avoid'],
  mustahabb: ['is mustahabb', 'is recommended', 'is sunnah', 'is encouraged', 'is meritorious'],
  wajib: ['is wajib', 'is obligatory', 'is mandatory', 'is fard', 'must be done', 'is required', 'is a duty'],
  mubah: ['is mubah', 'is permissible but', 'is neutral']
};

// Strip HTML tags and clean text
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Detect ruling from text - more careful matching
function detectRuling(text) {
  const lowerText = text.toLowerCase();

  // Check for explicit rulings in priority order
  for (const [ruling, patterns] of Object.entries(RULING_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        return ruling;
      }
    }
  }

  // Look for definitive statements
  const haramIndicators = lowerText.match(/\b(haram|haraam|forbidden|prohibited)\b/g);
  const halalIndicators = lowerText.match(/\b(halal|permissible|allowed|permitted)\b/g);

  if (haramIndicators && (!halalIndicators || haramIndicators.length > halalIndicators.length)) {
    return 'haram';
  }
  if (halalIndicators && (!haramIndicators || halalIndicators.length > haramIndicators.length)) {
    return 'halal';
  }

  if (lowerText.includes('wajib') || lowerText.includes('obligatory')) return 'wajib';
  if (lowerText.includes('mustahabb') || lowerText.includes('recommended')) return 'mustahabb';
  if (lowerText.includes('makruh') || lowerText.includes('disliked')) return 'makruh';

  return null;
}

// Detect relevant tags based on title and content - more precise
function detectTags(title, question, answer, existingTags) {
  const titleLower = title.toLowerCase();
  const textLower = `${question} ${answer}`.toLowerCase();
  const detectedTags = new Set();

  // Title-based detection (most reliable)
  const titlePatterns = {
    'salah': [/\bpray(er|ing)?\b/, /\bsalah\b/, /\bsalat\b/, /\bwudu\b/, /\bablution\b/],
    'prayer': [/\bpray(er|ing)?\b/],
    'fasting': [/\bfast(ing)?\b/, /\bsawm\b/, /\bsiyam\b/, /\biftar\b/, /\bsuhoor\b/],
    'sawm': [/\bfast(ing)?\b/, /\bsawm\b/],
    'zakat': [/\bzakat\b/, /\bcharity\b/, /\bsadaqah\b/],
    'hajj': [/\bhajj\b/, /\bpilgrimage\b/, /\bumrah\b/, /\bmecca\b/, /\btawaf\b/],
    'umrah': [/\bumrah\b/],
    'marriage': [/\bmarriage\b/, /\bnikah\b/, /\bwedding\b/, /\bspouse\b/, /\bhusband\b/, /\bwife\b/],
    'nikah': [/\bnikah\b/],
    'divorce': [/\bdivorce\b/, /\btalaq\b/, /\bkhula\b/],
    'talaq': [/\btalaq\b/],
    'family': [/\bfamily\b/, /\bparent\b/, /\bmother\b/, /\bfather\b/, /\bchildren\b/],
    'children': [/\bchild(ren)?\b/, /\bson\b/, /\bdaughter\b/],
    'food': [/\bfood\b/, /\beat(ing)?\b/, /\bmeat\b/, /\bpork\b/, /\bslaughter\b/],
    'drink': [/\bdrink\b/, /\balcohol\b/, /\bwine\b/, /\bintoxicant\b/],
    'clothing': [/\bcloth(ing|es)?\b/, /\bdress\b/, /\bwear(ing)?\b/],
    'hijab': [/\bhijab\b/, /\bniqab\b/, /\bveil\b/, /\bcovering\b/],
    'business': [/\bbusiness\b/, /\btrade\b/, /\bselling\b/, /\bbuying\b/],
    'finance': [/\bmoney\b/, /\binterest\b/, /\briba\b/, /\bloan\b/, /\bbank\b/],
    'riba': [/\briba\b/, /\binterest\b/, /\busury\b/],
    'work': [/\bwork\b/, /\bjob\b/, /\bemployment\b/],
    'health': [/\bhealth\b/, /\bsick\b/, /\billness\b/, /\bdisease\b/],
    'medicine': [/\bmedicine\b/, /\bmedical\b/, /\bdoctor\b/, /\btreatment\b/],
    'death': [/\bdeath\b/, /\bdead\b/, /\bdie\b/, /\bdeceased\b/],
    'janazah': [/\bjanazah\b/, /\bfuneral\b/, /\bburial\b/, /\bgrave\b/],
    'inheritance': [/\binheritance\b/, /\binherit\b/],
    'women': [/\bwom[ae]n\b/, /\bfemale\b/, /\bsister\b/, /\bmenstruation\b/, /\bperiod\b/],
    'men': [/\bmen\b(?!struation)/, /\bmale\b/, /\bbrother\b/],
    'quran': [/\bquran\b/, /\bqur'an\b/, /\bsurah\b/, /\bayah\b/, /\bverse\b/],
    'hadith': [/\bhadith\b/, /\bhadeeth\b/, /\bnarrated\b/, /\bprophet.*said\b/],
    'tafsir': [/\btafsir\b/, /\bexegesis\b/, /\binterpretation\b/],
    'aqeedah': [/\baqeedah\b/, /\bbelief\b/, /\btawhid\b/, /\bfaith\b/, /\biman\b/],
    'ramadan': [/\bramadan\b/, /\bramadhaan\b/],
    'eid': [/\beid\b/, /\b'eid\b/],
    'friday': [/\bfriday\b/, /\bjumu'ah\b/, /\bjumuah\b/],
    'mosque': [/\bmosque\b/, /\bmasjid\b/],
    'dua': [/\bdua\b/, /\bdu'a\b/, /\bsupplication\b/],
    'dhikr': [/\bdhikr\b/, /\bremembrance\b/],
    'travel': [/\btravel\b/, /\bjourney\b/],
    'bidah': [/\bbid'ah\b/, /\bbidah\b/, /\binnovation\b/],
    'shirk': [/\bshirk\b/, /\bpolytheism\b/, /\bidolatry\b/],
    'adab': [/\badab\b/, /\betiquette\b/, /\bmanners\b/]
  };

  // Check title first (most relevant)
  for (const [tag, patterns] of Object.entries(titlePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(titleLower)) {
        detectedTags.add(tag);
        break;
      }
    }
  }

  // Check ruling-based tags from answer
  if (textLower.includes('haram') || textLower.includes('forbidden')) detectedTags.add('haram');
  if (textLower.includes('halal') || textLower.includes('permissible')) detectedTags.add('halal');

  // Add fiqh for ruling questions
  if (detectedTags.has('haram') || detectedTags.has('halal') || detectedTags.has('wajib') ||
      detectedTags.has('makruh') || detectedTags.has('mustahabb')) {
    detectedTags.add('fiqh');
  }

  // Add from existing tags if they match
  if (existingTags) {
    for (const tag of existingTags) {
      const lowerTag = tag.toLowerCase();
      for (const validTag of VALID_TAGS) {
        if (lowerTag === validTag || lowerTag.includes(validTag)) {
          detectedTags.add(validTag);
        }
      }
    }
  }

  // If no specific tags, add general ones based on content type
  if (detectedTags.size < 2) {
    detectedTags.add('fiqh');
    if (textLower.includes('scholar') || textLower.includes('imam')) {
      detectedTags.add('fiqh');
    }
  }

  // Convert to array and filter valid tags
  let tags = Array.from(detectedTags).filter(t => VALID_TAGS.includes(t));

  // Limit to 4-8 tags
  if (tags.length > 8) tags = tags.slice(0, 8);

  // Ensure minimum 4 tags
  while (tags.length < 4) {
    const defaults = ['fiqh', 'adab', 'aqeedah', 'hadith'];
    for (const d of defaults) {
      if (!tags.includes(d)) {
        tags.push(d);
        break;
      }
    }
    if (tags.length < 4 && defaults.every(d => tags.includes(d))) {
      tags.push('quran');
      break;
    }
  }

  return tags;
}

// Extract key terms from content
function extractKeyTerms(title, question, answer) {
  const titleLower = title.toLowerCase();
  const textLower = `${question} ${answer}`.toLowerCase();
  const terms = [];

  // Islamic terms with transliterations
  const islamicTerms = [
    { term: 'salah', alt: 'prayer', pattern: /\bsalah\b|\bsalat\b/ },
    { term: 'sawm', alt: 'fasting', pattern: /\bsawm\b|\bsiyam\b/ },
    { term: 'zakat', alt: 'charity', pattern: /\bzakat\b|\bzakah\b/ },
    { term: 'hajj', alt: 'pilgrimage', pattern: /\bhajj\b/ },
    { term: 'umrah', alt: 'lesser pilgrimage', pattern: /\bumrah\b/ },
    { term: 'nikah', alt: 'marriage', pattern: /\bnikah\b/ },
    { term: 'talaq', alt: 'divorce', pattern: /\btalaq\b/ },
    { term: 'wudu', alt: 'ablution', pattern: /\bwudu\b|\bwudhu\b/ },
    { term: 'ghusl', alt: 'ritual bath', pattern: /\bghusl\b/ },
    { term: 'halal', alt: 'permissible', pattern: /\bhalal\b/ },
    { term: 'haram', alt: 'forbidden', pattern: /\bharam\b|\bharaam\b/ },
    { term: 'makruh', alt: 'disliked', pattern: /\bmakruh\b|\bmakrooh\b/ },
    { term: 'mustahabb', alt: 'recommended', pattern: /\bmustahabb\b/ },
    { term: 'wajib', alt: 'obligatory', pattern: /\bwajib\b/ },
    { term: 'fard', alt: 'obligatory', pattern: /\bfard\b/ },
    { term: 'sunnah', alt: 'prophetic practice', pattern: /\bsunnah\b/ },
    { term: 'hadith', alt: 'prophetic narration', pattern: /\bhadith\b|\bhadeeth\b/ },
    { term: 'Quran', alt: 'holy book', pattern: /\bquran\b|\bqur'an\b/ },
    { term: 'tafsir', alt: 'exegesis', pattern: /\btafsir\b/ },
    { term: 'aqeedah', alt: 'creed', pattern: /\baqeedah\b/ },
    { term: 'shirk', alt: 'polytheism', pattern: /\bshirk\b/ },
    { term: 'tawhid', alt: 'monotheism', pattern: /\btawhid\b|\btawheed\b/ },
    { term: 'tawbah', alt: 'repentance', pattern: /\btawbah\b/ },
    { term: 'dua', alt: 'supplication', pattern: /\bdua\b|\bdu'a\b/ },
    { term: 'dhikr', alt: 'remembrance', pattern: /\bdhikr\b/ },
    { term: 'hijab', alt: 'head covering', pattern: /\bhijab\b/ },
    { term: 'niqab', alt: 'face veil', pattern: /\bniqab\b/ },
    { term: 'awrah', alt: 'private parts', pattern: /\bawrah\b/ },
    { term: 'janazah', alt: 'funeral prayer', pattern: /\bjanazah\b|\bjanaza\b/ },
    { term: 'mahr', alt: 'dowry', pattern: /\bmahr\b/ },
    { term: 'iddah', alt: 'waiting period', pattern: /\biddah\b|\b'iddah\b/ },
    { term: 'riba', alt: 'interest/usury', pattern: /\briba\b/ },
    { term: 'sadaqah', alt: 'charity', pattern: /\bsadaqah\b/ },
    { term: 'istikharah', alt: 'guidance prayer', pattern: /\bistikharah\b/ },
    { term: "bid'ah", alt: 'innovation', pattern: /\bbid'ah\b|\bbidah\b/ }
  ];

  // Check for Islamic terms
  for (const { term, alt, pattern } of islamicTerms) {
    if (pattern.test(textLower) || pattern.test(titleLower)) {
      terms.push(`${term}/${alt}`);
      if (terms.length >= 6) break;
    }
  }

  // Extract key topic words from title
  const titleWords = title.split(/\s+/).filter(w => w.length > 4);
  const stopWords = ['what', 'which', 'where', 'when', 'that', 'this', 'with', 'from', 'about', 'islam', 'islamic', 'muslim', 'does', 'have', 'your', 'their', 'there', 'during', 'should', 'would', 'could', 'after', 'before'];

  for (const word of titleWords) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 4 && !stopWords.includes(clean) && terms.length < 6) {
      if (!terms.some(t => t.toLowerCase().includes(clean))) {
        terms.push(clean);
      }
    }
  }

  // Ensure minimum 3 terms
  while (terms.length < 3) {
    const defaults = ['fiqh/jurisprudence', 'islamic ruling', 'sharia'];
    for (const d of defaults) {
      if (!terms.includes(d)) {
        terms.push(d);
        break;
      }
    }
  }

  return terms.slice(0, 6);
}

// Generate search query phrases
function generateQueryPhrases(title, ruling) {
  const phrases = [];
  const cleanTitle = title.replace(/[?!]/g, '').trim();
  const lowerTitle = cleanTitle.toLowerCase();

  // Generate natural queries based on title structure
  if (lowerTitle.startsWith('is ')) {
    phrases.push(lowerTitle);
    const topic = lowerTitle.substring(3);
    phrases.push(`ruling on ${topic}`);
  } else if (lowerTitle.startsWith('what is ')) {
    phrases.push(lowerTitle);
  } else if (lowerTitle.startsWith('how to ')) {
    phrases.push(lowerTitle);
    phrases.push(`way to ${lowerTitle.substring(7)}`);
  } else if (lowerTitle.startsWith('can ')) {
    phrases.push(lowerTitle);
    phrases.push(`is it allowed to ${lowerTitle.substring(4)}`);
  } else if (lowerTitle.startsWith('does ')) {
    phrases.push(lowerTitle);
  } else if (lowerTitle.startsWith('ruling on ')) {
    phrases.push(lowerTitle);
    const topic = lowerTitle.substring(10);
    phrases.push(`is ${topic} allowed in islam`);
  } else {
    // Default format
    phrases.push(`what is the ruling on ${lowerTitle}`);
    phrases.push(`${lowerTitle} in islam`);
  }

  // Add ruling-specific query if applicable
  if (ruling && phrases.length < 4) {
    const topic = lowerTitle.replace(/^(is |what is |the |a |an |ruling on )/g, '');
    phrases.push(`is ${topic} ${ruling}`);
  }

  return phrases.slice(0, 4);
}

// Generate summary from question and answer
function generateSummary(title, question, answer, ruling) {
  const cleanAnswer = answer;

  // Get substantive sentences from answer (skip TOC and references)
  const sentences = cleanAnswer.split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s =>
      s.length > 30 &&
      !s.toLowerCase().includes('table of contents') &&
      !s.toLowerCase().includes('click here') &&
      !s.toLowerCase().includes('see also') &&
      !s.toLowerCase().includes('for more information') &&
      !s.toLowerCase().includes('please see') &&
      !/^\s*\d+\s*$/.test(s) // Skip number-only lines
    );

  let summary = '';

  // Build summary with title context
  const questionType = title.endsWith('?') ? 'question' : 'topic';

  if (questionType === 'question') {
    summary = `${title} `;
  } else {
    summary = `Explanation of ${title}. `;
  }

  // Add ruling if detected
  if (ruling) {
    const rulingText = {
      haram: 'This is haram (forbidden) in Islam.',
      halal: 'This is halal (permissible) in Islam.',
      makruh: 'This is makruh (disliked) in Islam.',
      mustahabb: 'This is mustahabb (recommended) in Islam.',
      wajib: 'This is wajib (obligatory) in Islam.',
      mubah: 'This is mubah (permissible) in Islam.'
    };
    summary += rulingText[ruling] + ' ';
  }

  // Add key points from answer
  let wordCount = summary.split(/\s+/).length;
  for (const sentence of sentences) {
    if (wordCount >= 90) break;

    const sentenceWords = sentence.split(/\s+/).length;
    if (sentenceWords > 5 && sentenceWords < 40) {
      summary += sentence + '. ';
      wordCount += sentenceWords;
    }
  }

  // Trim to 60-100 words
  const words = summary.split(/\s+/);
  if (words.length > 100) {
    summary = words.slice(0, 100).join(' ');
    if (!summary.endsWith('.')) summary += '...';
  }

  return summary.trim();
}

// Process a single question
function processQuestion(q) {
  const title = q.title || '';
  const question = stripHtml(q.question || '');
  const answer = stripHtml(q.answer || '');
  const fullText = `${title} ${question} ${answer}`;

  // Detect ruling
  const ruling = detectRuling(fullText);

  // Detect tags
  const tags = detectTags(title, question, answer, q.tags);

  // Extract key terms
  const key_terms = extractKeyTerms(title, question, answer);

  // Generate query phrases
  const query_phrases = generateQueryPhrases(title, ruling);

  // Generate summary
  const summary = generateSummary(title, question, answer, ruling);

  return {
    summary,
    tags,
    ruling,
    key_terms,
    query_phrases
  };
}

// Main execution
async function main() {
  console.log('Loading questions.json...');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

  console.log(`Total questions: ${questions.length}`);
  console.log('Processing batch 1 (questions 0-799)...');

  const batch = questions.slice(0, 800);
  const summaries = {};

  for (let i = 0; i < batch.length; i++) {
    const q = batch[i];
    const ref = String(q.reference);

    try {
      summaries[ref] = processQuestion(q);

      if ((i + 1) % 100 === 0) {
        console.log(`Processed ${i + 1}/800 questions...`);
      }
    } catch (err) {
      console.error(`Error processing question ${ref}:`, err.message);
      summaries[ref] = {
        summary: q.title || 'No summary available',
        tags: ['fiqh', 'adab', 'aqeedah', 'hadith'],
        ruling: null,
        key_terms: ['fiqh/jurisprudence', 'islamic ruling', 'sharia'],
        query_phrases: [q.title?.toLowerCase() || 'islamic question']
      };
    }
  }

  const output = {
    batch: 1,
    processed_at: new Date().toISOString(),
    start_index: 0,
    end_index: 799,
    count: Object.keys(summaries).length,
    summaries
  };

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\nBatch 1 complete!`);
  console.log(`Output written to: ${outputPath}`);
  console.log(`Total summaries: ${output.count}`);

  // Show samples
  console.log('\n--- SAMPLE OUTPUTS ---\n');

  const sampleRefs = ['329', '5000', '10680', '82344', '2217'];
  for (const ref of sampleRefs) {
    if (summaries[ref]) {
      console.log(`Reference ${ref}:`);
      console.log(JSON.stringify(summaries[ref], null, 2));
      console.log('');
    }
  }
}

main().catch(console.error);
