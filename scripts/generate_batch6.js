const fs = require('fs');

// Helper to strip HTML
function stripHtml(html) {
  return (html || '')
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

// Tag list for categorization
const validTags = [
  'fiqh', 'aqeedah', 'tafsir', 'hadith', 'seerah', 'history', 'adab', 'dua', 'dhikr', 'quran',
  'halal', 'haram', 'makruh', 'mubah', 'mustahabb', 'wajib', 'bidah', 'shirk',
  'salah', 'prayer', 'fasting', 'sawm', 'zakat', 'hajj', 'umrah',
  'marriage', 'nikah', 'divorce', 'talaq', 'family', 'children', 'parenting',
  'food', 'drink', 'clothing', 'hijab', 'business', 'finance', 'riba', 'work', 'education',
  'health', 'medicine', 'death', 'janazah', 'inheritance', 'women', 'men', 'youth', 'converts',
  'elderly', 'travel', 'ramadan', 'eid', 'friday', 'mosque'
];

// Generate tags based on content analysis
function generateTags(title, question, answer) {
  const text = `${title} ${question} ${answer}`.toLowerCase();
  const tags = [];

  // Topic detection
  if (/\b(prayer|salah|pray|salat|rak[\'\`]?ah|sujood|rukoo|prostrat|wudu|wudoo|ablution|tayammum)\b/i.test(text)) tags.push('salah', 'prayer');
  if (/\b(fast|fasting|sawm|siyam|iftar|suhoor|ramadan|ramadaan)\b/i.test(text)) tags.push('fasting', 'sawm');
  if (/\b(ramadan|ramadaan)\b/i.test(text)) tags.push('ramadan');
  if (/\b(zakah|zakat|zakaah|charity|sadaqah|alms)\b/i.test(text)) tags.push('zakat');
  if (/\b(hajj|pilgrimage|makkah|mecca|ka[\'\`]?bah|tawaf|sa[\'\`]?i|ihram|arafat|mina|muzdalifah)\b/i.test(text)) tags.push('hajj');
  if (/\b(umrah|[\'\`]umrah)\b/i.test(text)) tags.push('umrah');
  if (/\b(marr|wife|husband|spouse|nikah|wedding|walimah|mahr|dowry|wali)\b/i.test(text)) tags.push('marriage', 'nikah');
  if (/\b(divorce|talaq|khula|iddah|idda|divorced)\b/i.test(text)) tags.push('divorce', 'talaq');
  if (/\b(family|parent|mother|father|son|daughter|brother|sister|relative|kinship)\b/i.test(text)) tags.push('family');
  if (/\b(child|children|baby|infant|upbring|nurtur|offspring)\b/i.test(text)) tags.push('children', 'parenting');
  if (/\b(food|eat|meat|halal food|slaughter|zabiha|dhabiha|drink|beverage|alcohol|wine|intoxic)\b/i.test(text)) tags.push('food', 'drink');
  if (/\b(cloth|dress|garment|awrah|hijab|niqab|jilbab|abaya|modesty)\b/i.test(text)) tags.push('clothing');
  if (/\b(hijab|headscarf|veil|cover)\b/i.test(text)) tags.push('hijab');
  if (/\b(business|trade|sell|buy|contract|transact|money|wealth|income|loan|debt)\b/i.test(text)) tags.push('business', 'finance');
  if (/\b(riba|interest|usury|bank)\b/i.test(text)) tags.push('riba', 'finance');
  if (/\b(work|job|employ|career|occupation|profession)\b/i.test(text)) tags.push('work');
  if (/\b(educat|school|study|learn|teach|student|knowledge)\b/i.test(text)) tags.push('education');
  if (/\b(health|sick|illness|disease|medicine|medic|treatment|cure|doctor|hospital)\b/i.test(text)) tags.push('health', 'medicine');
  if (/\b(death|die|dying|dead|deceased|grave|burial|funeral)\b/i.test(text)) tags.push('death');
  if (/\b(janazah|janaazah|funeral|burial|shroud|kafan)\b/i.test(text)) tags.push('janazah');
  if (/\b(inherit|estate|bequest|wasiyyah|will)\b/i.test(text)) tags.push('inheritance');
  if (/\b(women|woman|female|sister|wife|mother|daughter|girl)\b/i.test(text)) tags.push('women');
  if (/\b(men|man|male|brother|husband|father|son|boy)\b/i.test(text)) tags.push('men');
  if (/\b(youth|young|teenager|adolescent)\b/i.test(text)) tags.push('youth');
  if (/\b(convert|revert|new muslim|shahad|enter.*islam)\b/i.test(text)) tags.push('converts');
  if (/\b(travel|journey|trip|flight|airport|safar)\b/i.test(text)) tags.push('travel');
  if (/\b(eid|[\'\`]?eid)\b/i.test(text)) tags.push('eid');
  if (/\b(friday|jumu[\'\`]?ah|jumuah)\b/i.test(text)) tags.push('friday');
  if (/\b(mosque|masjid)\b/i.test(text)) tags.push('mosque');
  if (/\b(quran|qur[\'\`]?an|recit|surah|ayah|verse|tafsir|tafseer)\b/i.test(text)) tags.push('quran');
  if (/\b(tafsir|tafseer|interpret.*quran|explain.*verse)\b/i.test(text)) tags.push('tafsir');
  if (/\b(hadith|hadeeth|sunnah|prophet.*said|narrat)\b/i.test(text)) tags.push('hadith');
  if (/\b(seerah|sirah|prophet.*life|prophet.*biography)\b/i.test(text)) tags.push('seerah');
  if (/\b(history|historical|caliphate|companion|sahab|sahabah)\b/i.test(text)) tags.push('history');
  if (/\b(dua|du[\'\`]?a|supplicat|invoke|call.*upon)\b/i.test(text)) tags.push('dua');
  if (/\b(dhikr|remembr|tasbeeh|tahleel|takbeer|istighfar)\b/i.test(text)) tags.push('dhikr');
  if (/\b(aqeedah|aqidah|creed|belief|tawheed|tawhid|iman|faith)\b/i.test(text)) tags.push('aqeedah');
  if (/\b(bid[\'\`]?ah|innovat|newly.*invented)\b/i.test(text)) tags.push('bidah');
  if (/\b(shirk|polythe|idolat|associate.*partner)\b/i.test(text)) tags.push('shirk');
  if (/\b(adab|etiquette|manner|conduct|behaviour|behavior)\b/i.test(text)) tags.push('adab');
  if (/\b(halal|halaal|permissible|lawful|allowed)\b/i.test(text)) tags.push('halal');
  if (/\b(haram|haraam|forbidden|prohibit|unlawful|impermissible)\b/i.test(text)) tags.push('haram');
  if (/\b(makruh|makrooh|disliked|discouraged)\b/i.test(text)) tags.push('makruh');
  if (/\b(mustahabb|recommend|sunnah|preferable|encouraged)\b/i.test(text)) tags.push('mustahabb');
  if (/\b(wajib|obligat|fard|mandatory|required|must)\b/i.test(text)) tags.push('wajib');
  if (/\b(fiqh|ruling|jurisprud|scholar|fatwa|fatwas)\b/i.test(text)) tags.push('fiqh');

  // Deduplicate and limit
  const uniqueTags = [...new Set(tags)].filter(t => validTags.includes(t));
  return uniqueTags.slice(0, 8);
}

// Determine ruling
function determineRuling(title, question, answer) {
  const text = `${title} ${answer}`.toLowerCase();

  // Look for clear ruling indicators in answer
  if (/\b(it is haram|this is haram|haraam|forbidden|not permissible|impermissible|prohibited|not allowed|not lawful|unlawful)\b/i.test(text)) return 'haram';
  if (/\b(it is wajib|this is wajib|obligatory|fard|mandatory|must be done|required)\b/i.test(text)) return 'wajib';
  if (/\b(it is mustahabb|this is mustahabb|recommended|sunnah|encouraged|preferable|meritorious)\b/i.test(text)) return 'mustahabb';
  if (/\b(it is makruh|this is makruh|disliked|discouraged|better to avoid)\b/i.test(text)) return 'makruh';
  if (/\b(it is halal|this is halal|permissible|allowed|lawful|there is nothing wrong|no harm|permitted)\b/i.test(text)) return 'halal';
  if (/\b(it is mubah|this is mubah|neutral|neither.*nor)\b/i.test(text)) return 'mubah';

  return null;
}

// Generate key terms
function generateKeyTerms(title, question, answer) {
  const text = `${title} ${question} ${answer}`.toLowerCase();
  const terms = [];

  // Islamic terminology
  const islamicTerms = [
    'salah', 'sawm', 'zakat', 'hajj', 'umrah', 'wudu', 'ghusl', 'tayammum',
    'nikah', 'talaq', 'khula', 'iddah', 'mahr', 'walimah',
    'halal', 'haram', 'makruh', 'mustahabb', 'wajib', 'mubah',
    'sunnah', 'bidah', 'shirk', 'kufr', 'iman', 'tawbah',
    'quran', 'hadith', 'fiqh', 'aqeedah', 'tafsir', 'seerah',
    'dua', 'dhikr', 'istighfar', 'tasbih', 'takbir',
    'janazah', 'kafan', 'qiblah', 'masjid', 'imam', 'khutbah',
    'ramadan', 'eid', 'jumu\'ah', 'laylatul qadr',
    'mahram', 'awrah', 'hijab', 'niqab', 'istihadah', 'hayd',
    'riba', 'gharar', 'sadaqah', 'waqf', 'wasiyyah', 'inheritance',
    'tawakkul', 'sabr', 'shukr', 'ikhlas', 'taqwa', 'khushoo',
    'niyyah', 'qadr', 'rizq', 'barakah', 'fitrah', 'jahannam', 'jannah'
  ];

  for (const term of islamicTerms) {
    if (text.includes(term)) {
      terms.push(term);
    }
  }

  // Unique and limit
  return [...new Set(terms)].slice(0, 6);
}

// Generate query phrases
function generateQueryPhrases(title, question, answer) {
  const phrases = [];
  const titleLower = title.toLowerCase();
  const text = `${question} ${answer}`.toLowerCase();

  // Extract from title patterns
  if (/ruling on/i.test(title)) phrases.push(title.replace(/ruling on/i, 'what is the ruling on').toLowerCase());
  if (/is it permissible/i.test(title)) phrases.push(titleLower);
  if (/can (i|we|a muslim)/i.test(title)) phrases.push(titleLower);
  if (/how to/i.test(title)) phrases.push(titleLower);
  if (/what is/i.test(title)) phrases.push(titleLower);
  if (/does.*break/i.test(title)) phrases.push(titleLower);

  // Generate common query patterns based on content
  if (/prayer|salah/i.test(text)) phrases.push('prayer rules in Islam');
  if (/fasting|sawm/i.test(text)) phrases.push('fasting rules in Ramadan');
  if (/marriage|nikah/i.test(text)) phrases.push('Islamic marriage rules');
  if (/divorce|talaq/i.test(text)) phrases.push('divorce in Islam');
  if (/haram|forbidden/i.test(text)) phrases.push('is it haram');
  if (/halal|permissible/i.test(text)) phrases.push('is it halal');

  // Deduplicate and limit
  return [...new Set(phrases)].slice(0, 4);
}

// Generate summary
function generateSummary(title, question, answer) {
  const q = stripHtml(question).slice(0, 200);
  const a = stripHtml(answer).slice(0, 400);

  // Create a comprehensive summary
  let summary = '';

  // Start with the question intent
  if (q.length > 20) {
    summary += `This question addresses ${title.toLowerCase().replace(/\?$/, '')}. `;
  } else {
    summary += `This addresses ${title.toLowerCase().replace(/\?$/, '')}. `;
  }

  // Add key answer points
  const answerSentences = a.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 3);
  if (answerSentences.length > 0) {
    const keyPoint = answerSentences[0].trim();
    if (keyPoint.length > 30) {
      summary += keyPoint.charAt(0).toUpperCase() + keyPoint.slice(1);
      if (!keyPoint.endsWith('.')) summary += '.';
    }
  }

  // Add ruling indicator if present
  if (/permissible|allowed|halal/i.test(a)) {
    summary += ' The ruling indicates permissibility under stated conditions.';
  } else if (/not permissible|haram|forbidden|prohibited/i.test(a)) {
    summary += ' The ruling indicates prohibition based on Islamic principles.';
  } else if (/obligatory|wajib|must/i.test(a)) {
    summary += ' The ruling indicates obligation upon Muslims.';
  } else if (/recommended|mustahabb|sunnah/i.test(a)) {
    summary += ' The ruling indicates recommendation.';
  }

  // Trim to target length (60-100 words)
  const words = summary.split(/\s+/);
  if (words.length > 100) {
    summary = words.slice(0, 95).join(' ') + '...';
  } else if (words.length < 60 && answerSentences.length > 1) {
    summary += ' ' + answerSentences[1].trim() + '.';
  }

  return summary.replace(/\s+/g, ' ').trim();
}

// Main processing
function processQuestions() {
  console.log('Reading questions...');
  const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8'));
  const batch = questions.slice(4000, 4800);

  console.log(`Processing ${batch.length} questions (indices 4000-4799)...`);

  const summaries = {};

  for (const q of batch) {
    const title = q.title || '';
    const question = stripHtml(q.question);
    const answer = stripHtml(q.answer);

    summaries[q.reference] = {
      summary: generateSummary(title, question, answer),
      tags: generateTags(title, question, answer),
      ruling: determineRuling(title, question, answer),
      key_terms: generateKeyTerms(title, question, answer),
      query_phrases: generateQueryPhrases(title, question, answer)
    };
  }

  const output = {
    batch: 6,
    processed_at: new Date().toISOString(),
    start_index: 4000,
    end_index: 4799,
    count: Object.keys(summaries).length,
    summaries: summaries
  };

  // Ensure directory exists
  if (!fs.existsSync('public/data/summaries')) {
    fs.mkdirSync('public/data/summaries', { recursive: true });
  }

  fs.writeFileSync('public/data/summaries/batch_006.json', JSON.stringify(output, null, 2));
  console.log(`Wrote ${output.count} summaries to public/data/summaries/batch_006.json`);
}

processQuestions();
