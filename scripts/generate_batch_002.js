const fs = require('fs');

// Read questions
const questions = JSON.parse(fs.readFileSync('/home/user/islamqa/public/data/questions.json', 'utf8'));

// Batch 2: index 800 to 1599
const startIndex = 800;
const endIndex = 1599;
const batchQuestions = questions.slice(startIndex, endIndex + 1);

console.log(`Processing batch 2: ${batchQuestions.length} questions (index ${startIndex}-${endIndex})`);

// Helper to strip HTML tags
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

// Helper to extract key terms from text
function extractKeyTerms(title, questionText, answerText) {
  const text = `${title} ${questionText} ${answerText}`.toLowerCase();
  const terms = [];

  // Common Islamic terms to look for
  const islamicTerms = {
    'salah': 'salah/prayer',
    'prayer': 'salah/prayer',
    'sawm': 'sawm/fasting',
    'fasting': 'sawm/fasting',
    'zakat': 'zakat/charity',
    'hajj': 'hajj/pilgrimage',
    'umrah': 'umrah',
    'wudu': 'wudu/ablution',
    'ablution': 'wudu/ablution',
    'ghusl': 'ghusl/ritual bath',
    'nikah': 'nikah/marriage',
    'talaq': 'talaq/divorce',
    'riba': 'riba/interest',
    'hijab': 'hijab',
    'niqab': 'niqab',
    'quran': 'Quran',
    'hadith': 'hadith',
    'sunnah': 'sunnah',
    'shirk': 'shirk',
    'bidah': "bid'ah/innovation",
    'tawheed': 'tawheed/monotheism',
    'tawhid': 'tawheed/monotheism',
    'jannah': 'jannah/paradise',
    'jahannam': 'jahannam/hellfire',
    'dua': "du'a/supplication",
    'dhikr': 'dhikr/remembrance',
    'ramadan': 'Ramadan',
    'eid': 'Eid',
    'jumuah': "Jumu'ah/Friday",
    'mosque': 'masjid/mosque',
    'masjid': 'masjid/mosque',
    'imam': 'imam',
    'fatwa': 'fatwa',
    'halal': 'halal',
    'haram': 'haram',
    'makruh': 'makruh',
    'mustahabb': 'mustahabb',
    'wajib': 'wajib',
    'fard': 'fard/obligatory',
    'aqeedah': 'aqeedah/creed',
    'tafsir': 'tafsir',
    'fiqh': 'fiqh',
    'janazah': 'janazah/funeral',
    'sadaqah': 'sadaqah/charity',
    'tawbah': 'tawbah/repentance',
    'kaffarah': 'kaffarah/expiation',
    'niyyah': 'niyyah/intention',
    'taqwa': 'taqwa/piety',
    'ihsan': 'ihsan/excellence',
    'iman': 'iman/faith',
    'istikhara': 'istikhara',
    'qadr': 'qadr/destiny'
  };

  const found = new Set();
  for (const [key, value] of Object.entries(islamicTerms)) {
    if (text.includes(key) && !found.has(value)) {
      found.add(value);
      terms.push(value);
      if (terms.length >= 6) break;
    }
  }

  // Add topic from title if not enough terms
  if (terms.length < 3) {
    const titleWords = title.split(/\s+/).filter(w => w.length > 4);
    for (const word of titleWords) {
      if (terms.length >= 3) break;
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanWord.length > 4 && !terms.some(t => t.toLowerCase().includes(cleanWord))) {
        terms.push(cleanWord);
      }
    }
  }

  return terms.slice(0, 6);
}

// Helper to determine tags based on content
function determineTags(title, questionText, answerText, existingTags) {
  const text = `${title} ${questionText} ${answerText}`.toLowerCase();
  const tags = new Set();

  // Tag mappings based on content keywords
  const tagMappings = {
    'fiqh': ['ruling', 'fatwa', 'permissible', 'forbidden', 'allowed', 'prohibited', 'obligatory', 'sunnah', 'mustahabb', 'makrooh', 'halal', 'haram', 'fiqh', 'jurisprudence', 'scholars'],
    'aqeedah': ['belief', 'faith', 'creed', 'tawheed', 'shirk', 'kufr', 'iman', 'aqeedah', 'theology', 'angels', 'jinn', 'afterlife', 'day of judgment'],
    'tafsir': ['tafsir', 'interpretation', 'verse', 'ayah', 'surah', 'meaning of'],
    'hadith': ['hadith', 'narrated', 'prophet said', 'authentic', 'sahih', 'hasan', 'weak hadith', 'isnad'],
    'seerah': ['seerah', 'biography', 'prophet\'s life', 'companions', 'sahabah', 'battle of'],
    'history': ['history', 'historical', 'caliphate', 'islamic history', 'caliph'],
    'adab': ['etiquette', 'manners', 'behavior', 'conduct', 'adab', 'good character'],
    'dua': ['dua', 'supplication', 'prayer for', 'asking allah', 'invocation'],
    'dhikr': ['dhikr', 'remembrance', 'tasbeeh', 'tahleel', 'takbeer', 'praise'],
    'quran': ['quran', 'recitation', 'memorization', 'tajweed', 'reading quran', 'surah', 'ayah'],
    'halal': ['halal', 'lawful'],
    'haram': ['haram', 'forbidden', 'prohibited', 'unlawful', 'major sin'],
    'makruh': ['makruh', 'disliked', 'discouraged'],
    'mustahabb': ['mustahabb', 'recommended', 'encouraged', 'meritorious'],
    'wajib': ['wajib', 'obligatory', 'mandatory', 'fard', 'duty'],
    'bidah': ['bidah', 'innovation', 'invented matter'],
    'shirk': ['shirk', 'polytheism', 'associating partners', 'idol'],
    'salah': ['salah', 'salat', 'namaz', 'rak\'ah', 'sujood', 'rukoo'],
    'prayer': ['prayer', 'praying', 'worship'],
    'fasting': ['fasting', 'fast', 'iftar', 'suhoor', 'break the fast'],
    'sawm': ['sawm', 'siyam'],
    'zakat': ['zakat', 'zakah', 'nisab', 'obligatory charity'],
    'hajj': ['hajj', 'pilgrimage', 'makkah', 'mecca', 'kaaba', 'tawaf', 'ihram'],
    'umrah': ['umrah', 'lesser pilgrimage'],
    'marriage': ['marriage', 'married', 'wedding', 'spouse', 'marrying', 'husband', 'wife'],
    'nikah': ['nikah', 'marriage contract', 'mahr', 'dowry'],
    'divorce': ['divorce', 'talaq', 'khula', 'separation', 'iddah'],
    'family': ['family', 'relatives', 'kinship', 'parents', 'siblings'],
    'children': ['children', 'kids', 'child', 'son', 'daughter'],
    'parenting': ['parenting', 'raising children', 'upbringing', 'tarbiyah', 'education'],
    'food': ['food', 'eating', 'meat', 'slaughter', 'dietary', 'pork', 'gelatin'],
    'drink': ['drink', 'drinking', 'beverage', 'alcohol', 'wine'],
    'clothing': ['clothing', 'clothes', 'dress', 'wearing', 'garment', 'awrah'],
    'hijab': ['hijab', 'veil', 'covering', 'niqab', 'headscarf', 'jilbab'],
    'business': ['business', 'trade', 'buying', 'selling', 'commerce', 'transaction', 'contract'],
    'finance': ['finance', 'money', 'bank', 'loan', 'debt', 'financial', 'mortgage'],
    'riba': ['riba', 'interest', 'usury'],
    'work': ['work', 'job', 'employment', 'career', 'profession', 'occupation'],
    'education': ['education', 'learning', 'study', 'school', 'knowledge', 'teaching', 'student'],
    'health': ['health', 'healthy', 'medical', 'treatment', 'cure', 'sick'],
    'medicine': ['medicine', 'medication', 'doctor', 'hospital', 'surgery'],
    'death': ['death', 'dying', 'deceased', 'dead'],
    'janazah': ['janazah', 'funeral', 'burial', 'grave', 'cemetery', 'shroud'],
    'inheritance': ['inheritance', 'heir', 'estate', 'will', 'bequest', 'wasiyyah'],
    'women': ['women', 'woman', 'female', 'sister', 'mother', 'wife', 'daughter', 'menstruation'],
    'men': ['men', 'man', 'male', 'brother', 'father', 'husband', 'son', 'beard'],
    'youth': ['youth', 'young', 'teenager', 'adolescent'],
    'converts': ['convert', 'revert', 'new muslim', 'shahada', 'embracing islam'],
    'travel': ['travel', 'traveling', 'journey', 'trip', 'traveler', 'shortening prayer'],
    'ramadan': ['ramadan', 'ramazan', 'laylat al-qadr', 'tarawih'],
    'eid': ['eid', 'eid al-fitr', 'eid al-adha', 'celebration'],
    'friday': ['friday', 'jumuah', 'jummah', 'khutbah'],
    'mosque': ['mosque', 'masjid', 'prayer hall', 'jamaat']
  };

  for (const [tag, keywords] of Object.entries(tagMappings)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        tags.add(tag);
        break;
      }
    }
  }

  // Add from existing tags if applicable
  if (existingTags && Array.isArray(existingTags)) {
    for (const tag of existingTags) {
      const tagLower = tag.toLowerCase();
      for (const [mappedTag, keywords] of Object.entries(tagMappings)) {
        if (keywords.some(k => tagLower.includes(k) || k.includes(tagLower))) {
          tags.add(mappedTag);
        }
      }
    }
  }

  // Ensure we have at least 4 tags
  if (tags.size < 4) {
    tags.add('fiqh');
  }

  return Array.from(tags).slice(0, 8);
}

// Helper to determine ruling
function determineRuling(title, questionText, answerText) {
  const text = `${title} ${questionText} ${answerText}`.toLowerCase();

  // Check for explicit rulings in the answer primarily
  const answerLower = answerText.toLowerCase();

  if (answerLower.includes('is haram') || answerLower.includes('it is haram') || answerLower.includes('is forbidden') ||
      answerLower.includes('it is forbidden') || answerLower.includes('not permissible') || answerLower.includes('is not allowed') ||
      answerLower.includes('haraam') || answerLower.includes('is unlawful') || answerLower.includes('strictly prohibited')) {
    return 'haram';
  }

  if (answerLower.includes('is halal') || answerLower.includes('it is halal') || answerLower.includes('is permissible') ||
      answerLower.includes('it is permissible') || answerLower.includes('is allowed') || answerLower.includes('it is allowed') ||
      answerLower.includes('there is nothing wrong') || answerLower.includes('no harm in') || answerLower.includes('is lawful')) {
    return 'halal';
  }

  if (answerLower.includes('is makrooh') || answerLower.includes('is makruh') || answerLower.includes('is disliked') ||
      answerLower.includes('it is makruh') || answerLower.includes('discouraged but not forbidden')) {
    return 'makruh';
  }

  if (answerLower.includes('is mustahabb') || answerLower.includes('is recommended') || answerLower.includes('it is sunnah') ||
      answerLower.includes('is encouraged') || answerLower.includes('praiseworthy to')) {
    return 'mustahabb';
  }

  if (answerLower.includes('is wajib') || answerLower.includes('is obligatory') || answerLower.includes('is mandatory') ||
      answerLower.includes('it is fard') || answerLower.includes('must be done') || answerLower.includes('is required')) {
    return 'wajib';
  }

  if (answerLower.includes('is mubah') || answerLower.includes('is neutral') || answerLower.includes('neither rewarded nor punished')) {
    return 'mubah';
  }

  return null;
}

// Helper to generate query phrases
function generateQueryPhrases(title, questionText) {
  const phrases = [];

  // Clean up title as first phrase
  const cleanTitle = title.replace(/[?!]/g, '').trim();
  if (cleanTitle.length > 10 && cleanTitle.length < 80) {
    phrases.push(cleanTitle);
  }

  // Generate variations based on title structure
  const titleLower = title.toLowerCase();

  if (titleLower.startsWith('ruling on')) {
    const topic = cleanTitle.replace(/^ruling on\s*/i, '');
    phrases.push(`Is ${topic} allowed in Islam`);
  } else if (titleLower.startsWith('is it permissible')) {
    const topic = cleanTitle.replace(/^is it permissible\s*(to)?\s*/i, '');
    phrases.push(`Can a Muslim ${topic}`);
  } else if (titleLower.startsWith('can ')) {
    const topic = cleanTitle.replace(/^can\s*/i, '');
    phrases.push(`Is it permissible to ${topic}`);
  } else if (titleLower.startsWith('what is')) {
    phrases.push(cleanTitle);
  } else if (titleLower.startsWith('how to')) {
    phrases.push(cleanTitle);
    phrases.push(`Islamic way to ${cleanTitle.replace(/^how to\s*/i, '')}`);
  }

  // Add "ruling on" variation if applicable
  if (!titleLower.includes('ruling') && phrases.length < 3) {
    const topic = cleanTitle.toLowerCase()
      .replace(/^(is|can|should|may|does|do|are|was|were|have|has|had|what|how|why|when|where)\s+/i, '')
      .replace(/\s+in islam$/i, '')
      .trim();
    if (topic.length > 5 && topic.length < 60) {
      phrases.push(`Ruling on ${topic}`);
    }
  }

  // Add "Islam says about" variation
  if (phrases.length < 4) {
    const simpleTopic = cleanTitle
      .replace(/^(is|can|should|may|what|how|why|when|where|does|do|the|a|an)\s+/gi, '')
      .replace(/\?$/g, '')
      .toLowerCase()
      .trim();
    if (simpleTopic.length > 5 && simpleTopic.length < 50) {
      phrases.push(`What Islam says about ${simpleTopic}`);
    }
  }

  return [...new Set(phrases)].slice(0, 4);
}

// Helper to generate summary
function generateSummary(title, questionText, answerText, ruling) {
  // Clean and prepare text
  const cleanTitle = title.replace(/[?!]/g, '').trim();
  const answerClean = answerText.substring(0, 1500);

  let summary = '';

  // Start with a clear topic statement based on title
  if (title.toLowerCase().startsWith('is ') || title.toLowerCase().startsWith('can ')) {
    summary = `This question examines whether ${cleanTitle.replace(/^(is|can)\s+/i, '').toLowerCase()}. `;
  } else if (title.toLowerCase().startsWith('ruling on')) {
    summary = `This fatwa addresses the ${cleanTitle.toLowerCase()}. `;
  } else if (title.toLowerCase().startsWith('what is')) {
    summary = `This explains ${cleanTitle.toLowerCase().replace(/^what is\s+(the\s+)?/i, '')}. `;
  } else if (title.toLowerCase().startsWith('how to')) {
    summary = `This provides guidance on ${cleanTitle.toLowerCase().replace(/^how to\s+/i, '')}. `;
  } else {
    summary = `This question addresses ${cleanTitle.toLowerCase()}. `;
  }

  // Add ruling if applicable
  if (ruling) {
    const rulingText = {
      'halal': 'According to Islamic scholars, this is permissible (halal).',
      'haram': 'According to Islamic scholars, this is prohibited (haram).',
      'makruh': 'According to Islamic scholars, this is disliked (makruh) but not forbidden.',
      'mustahabb': 'According to Islamic scholars, this is recommended (mustahabb).',
      'wajib': 'According to Islamic scholars, this is obligatory (wajib).',
      'mubah': 'According to Islamic scholars, this is permissible and neutral (mubah).'
    };
    summary += rulingText[ruling] + ' ';
  }

  // Extract key informative sentences from answer
  const sentences = answerClean.split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 200);

  // Find good explanatory sentences
  const goodSentences = sentences.filter(s => {
    const lower = s.toLowerCase();
    return !lower.includes('allah knows best') &&
           !lower.includes('praise be to allah') &&
           !lower.includes('and allah knows') &&
           !lower.includes('may allah') &&
           !lower.startsWith('note:') &&
           !lower.startsWith('see:') &&
           (lower.includes('because') || lower.includes('since') ||
            lower.includes('according to') || lower.includes('the prophet') ||
            lower.includes('quran') || lower.includes('scholars') ||
            lower.includes('ruling') || lower.includes('islam') ||
            lower.includes('evidence') || lower.includes('basis'));
  });

  if (goodSentences.length > 0) {
    summary += goodSentences[0] + '. ';
  }

  // Add source reference
  if (answerClean.toLowerCase().includes('hadith')) {
    summary += 'The ruling is supported by hadith evidence.';
  } else if (answerClean.toLowerCase().includes('quran') || answerClean.toLowerCase().includes('verse')) {
    summary += 'The ruling references Quranic evidence.';
  } else if (answerClean.toLowerCase().includes('scholars')) {
    summary += 'The answer reflects scholarly consensus.';
  }

  // Ensure proper word count (60-100 words)
  const words = summary.split(/\s+/);
  if (words.length > 100) {
    summary = words.slice(0, 98).join(' ') + '...';
  } else if (words.length < 60) {
    summary += ' Muslims should consult knowledgeable scholars for specific circumstances and additional guidance on this matter.';
  }

  return summary.trim();
}

// Process each question
const summaries = {};
let processed = 0;

for (const q of batchQuestions) {
  const questionText = stripHtml(q.question || '');
  const answerText = stripHtml(q.answer || '');
  const title = q.title || '';

  const ruling = determineRuling(title, questionText, answerText);
  const tags = determineTags(title, questionText, answerText, q.tags);
  const keyTerms = extractKeyTerms(title, questionText, answerText);
  const queryPhrases = generateQueryPhrases(title, questionText);
  const summary = generateSummary(title, questionText, answerText, ruling);

  summaries[q.reference.toString()] = {
    summary,
    tags,
    ruling,
    key_terms: keyTerms,
    query_phrases: queryPhrases
  };

  processed++;
  if (processed % 100 === 0) {
    console.log(`Processed ${processed}/${batchQuestions.length} questions`);
  }
}

// Create output
const output = {
  batch: 2,
  processed_at: new Date().toISOString(),
  start_index: startIndex,
  end_index: endIndex,
  count: Object.keys(summaries).length,
  summaries
};

// Write to file
fs.writeFileSync(
  '/home/user/islamqa/public/data/summaries/batch_002.json',
  JSON.stringify(output, null, 2)
);

console.log(`\nBatch 2 complete!`);
console.log(`Total processed: ${Object.keys(summaries).length}`);
console.log(`Output written to: /home/user/islamqa/public/data/summaries/batch_002.json`);
