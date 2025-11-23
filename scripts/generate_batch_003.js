const fs = require('fs');
const path = require('path');

// Helper function to strip HTML tags
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

// Determine ruling based on content analysis
function determineRuling(title, question, answer) {
  const text = `${title} ${question} ${answer}`.toLowerCase();
  const firstPart = text.substring(0, 2000);

  // Strong haram indicators
  if (/\b(is haram|it is haram|are haram|strictly forbidden|categorically forbidden|major sin|kaba'ir)\b/i.test(firstPart)) {
    return 'haram';
  }

  // Wajib/Fard indicators (check first)
  if (/\b(is obligatory|are obligatory|is wajib|is fard|must be done|duty upon|incumbent upon|fard 'ayn|fard kifayah)\b/i.test(firstPart)) {
    return 'wajib';
  }

  // Mustahabb/Recommended
  if (/\b(is mustahabb|is recommended|is sunnah|it is better|preferable to|encouraged to|virtuous to|rewarded for)\b/i.test(firstPart)) {
    return 'mustahabb';
  }

  // Makruh/Disliked
  if (/\b(is makruh|is disliked|discouraged|better to avoid|should not|not befitting)\b/i.test(firstPart)) {
    return 'makruh';
  }

  // Mubah/Permissible (general allowance)
  if (/\b(is permissible|is allowed|is halal|nothing wrong with|no sin in|no harm in|mubah)\b/i.test(firstPart)) {
    return 'mubah';
  }

  // Haram with context
  if (/\b(not permissible|not allowed|forbidden|prohibited|unlawful|sinful)\b/i.test(firstPart) &&
      !/\b(is permissible|is allowed|permissible to)\b/i.test(firstPart)) {
    return 'haram';
  }

  // Halal with context
  if (/\b(permissible|allowed|lawful|no problem|acceptable)\b/i.test(firstPart) &&
      !/\b(not permissible|not allowed|not halal)\b/i.test(firstPart)) {
    return 'mubah';
  }

  return null;
}

// Generate tags based on content
function generateTags(title, question, answer, existingTags) {
  const text = `${title} ${question} ${answer}`.toLowerCase();
  const tags = [];

  // Topic-based tags with priority
  const tagPatterns = [
    ['salah', /\b(salah|salat|prayer|namaz|pray|rak'ah|ruku|sujud|qiyam)\b/i],
    ['fasting', /\b(fast|fasting|sawm|siyam|iftar|suhoor|suhur)\b/i],
    ['ramadan', /\b(ramadan|ramadhaan)\b/i],
    ['zakat', /\b(zakat|zakah|zakaat)\b/i],
    ['hajj', /\b(hajj|pilgrimage|ihram|tawaf|sa'i|arafah|mina|muzdalifah)\b/i],
    ['umrah', /\b(umrah|umra|lesser pilgrimage)\b/i],
    ['marriage', /\b(marriage|marry|wedding|nikah|spouse|husband|wife|marital|matrimon)\b/i],
    ['divorce', /\b(divorce|talaq|khul|khula|iddah|waiting period)\b/i],
    ['family', /\b(family|parent|children|mother|father|son|daughter|relatives|kinship)\b/i],
    ['women', /\b(women|woman|sister|female|feminine|muslimah|ladies)\b/i],
    ['hijab', /\b(hijab|veil|niqab|jilbab|covering|awrah|modesty)\b/i],
    ['food', /\b(food|eat|eating|meat|slaughter|dhabiha|zabiha|drink|beverage)\b/i],
    ['business', /\b(business|trade|sell|buy|contract|transaction|commerce)\b/i],
    ['finance', /\b(finance|money|bank|loan|debt|credit|investment)\b/i],
    ['riba', /\b(riba|usury|interest|ribaa)\b/i],
    ['quran', /\b(quran|qur'an|recit|ayah|surah|verse|tilawah|tajweed)\b/i],
    ['hadith', /\b(hadith|hadeeth|narrat|prophet said|reported that)\b/i],
    ['sunnah', /\b(sunnah|sunnah of the prophet|prophetic tradition)\b/i],
    ['fiqh', /\b(fiqh|jurisprudence|ruling|fatwa|legal opinion|madhab|madhhab)\b/i],
    ['aqeedah', /\b(aqeedah|aqidah|belief|faith|iman|tawhid|creed|doctrine)\b/i],
    ['tafsir', /\b(tafsir|tafseer|interpret|exegesis|meaning of the verse)\b/i],
    ['dua', /\b(dua|du'a|supplication|invocation|pray for)\b/i],
    ['dhikr', /\b(dhikr|remembrance|tasbeeh|tasbih|tahmeed|takbeer|glorif)\b/i],
    ['bidah', /\b(bid'ah|bidah|innovation|innovated)\b/i],
    ['shirk', /\b(shirk|polythe|idol|associat partners)\b/i],
    ['death', /\b(death|die|dying|deceased|grave|afterlife|akhirah)\b/i],
    ['janazah', /\b(janazah|janaza|funeral|burial|shroud|kafan)\b/i],
    ['inheritance', /\b(inherit|estate|will|bequest|wasiyyah|faraid)\b/i],
    ['purification', /\b(wudu|wudhu|ablution|ghusl|tayammum|tahara|purif|najasah|impurity)\b/i],
    ['mosque', /\b(mosque|masjid)\b/i],
    ['friday', /\b(friday|jumuah|jumu'ah|khutbah)\b/i],
    ['eid', /\b(eid|'eid|eid al-fitr|eid al-adha)\b/i],
    ['seerah', /\b(seerah|sirah|prophet muhammad|messenger of allah|life of the prophet)\b/i],
    ['companions', /\b(companions|sahab|sahabah|abu bakr|umar|uthman|ali)\b/i],
    ['history', /\b(history|histor|caliphate|islamic civilization)\b/i],
    ['youth', /\b(youth|young|teenager|adolescent)\b/i],
    ['converts', /\b(convert|revert|new muslim|shahad|embraced islam)\b/i],
    ['travel', /\b(travel|journey|trip|safar|traveler|musafir)\b/i],
    ['work', /\b(work|job|employ|career|profession|occupation)\b/i],
    ['education', /\b(education|study|learn|school|university|knowledge|ilm)\b/i],
    ['health', /\b(health|medical|medicine|sick|illness|disease|doctor|treatment)\b/i],
    ['clothing', /\b(cloth|dress|wear|garment|attire|thawb)\b/i],
    ['etiquette', /\b(etiquette|manner|adab|behavior|conduct|akhlaq)\b/i],
    ['repentance', /\b(repent|tawbah|tawba|forgiv|istighfar|sin)\b/i],
    ['haram', /\b(haram|forbidden|prohibit|unlawful|impermissible)\b/i],
    ['halal', /\b(halal|permissible|lawful|allowed)\b/i],
    ['men', /\b(men\b|man\b|brother|male|masculine|muslim men)\b/i],
    ['children', /\b(child|children|kids|upbringing|tarbiyah|parenting)\b/i],
    ['dreams', /\b(dream|dreams|vision|ru'ya)\b/i],
    ['magic', /\b(magic|sihr|sorcery|witchcraft|evil eye|ayn|ruqyah)\b/i],
    ['jinn', /\b(jinn|jinns|shaytan|shaitan|devil|demon)\b/i],
    ['angels', /\b(angel|angels|mala'ika|jibreel|gabriel)\b/i],
    ['day-of-judgment', /\b(day of judgment|day of resurrection|qiyamah|hereafter|paradise|hell|jannah|jahannam)\b/i]
  ];

  for (const [tag, pattern] of tagPatterns) {
    if (pattern.test(text) && !tags.includes(tag)) {
      tags.push(tag);
      if (tags.length >= 8) break;
    }
  }

  // Add existing tags if we have room
  if (existingTags && Array.isArray(existingTags) && tags.length < 8) {
    existingTags.forEach(t => {
      const cleaned = t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
      if (cleaned && cleaned.length > 2 && !tags.includes(cleaned) && tags.length < 8) {
        tags.push(cleaned);
      }
    });
  }

  return tags.length >= 4 ? tags : [...tags, 'fiqh', 'islamic-ruling', 'fatwa', 'guidance'].slice(0, Math.max(4, tags.length));
}

// Generate key terms from content
function generateKeyTerms(title, question, answer) {
  const text = `${title} ${question} ${answer}`.toLowerCase();
  const terms = [];

  // Common Islamic terms with exact matching
  const islamicTerms = [
    'salah', 'salat', 'zakat', 'sawm', 'hajj', 'umrah',
    'wudu', 'ghusl', 'tayammum', 'tahara', 'janaba',
    'nikah', 'talaq', 'khula', 'mahr', 'iddah', 'walimah',
    'halal', 'haram', 'makruh', 'mubah', 'mustahabb', 'wajib', 'fard', 'sunnah', 'nafl',
    'quran', 'hadith', 'fiqh', 'aqeedah', 'tawhid', 'shirk', 'bidah', 'kufr',
    'imam', 'madhab', 'fatwa', 'ijma', 'qiyas', 'ijtihad',
    'janazah', 'kafan', 'dafn',
    'jihad', 'dawah', 'ummah', 'khalifah', 'shura',
    'jannah', 'jahannam', 'barzakh', 'qiyamah', 'akhirah',
    'tawbah', 'istighfar', 'dhikr', 'dua', 'wird',
    'riba', 'gharar',
    'hijab', 'niqab', 'awrah', 'satr',
    'ramadan', 'eid', 'ashura', 'muharram', 'dhul-hijjah',
    'masjid', 'mihrab', 'minbar', 'qiblah',
    'rak\'ah', 'sujud', 'ruku', 'qiyam', 'tashahhud', 'taslim',
    'adhan', 'iqamah', 'jumuah', 'khutbah',
    'sahabi', 'tabi\'i', 'salaf', 'khalaf',
    'hanafi', 'maliki', 'shafi\'i', 'hanbali',
    'sihr', 'ruqyah', 'ayn', 'hasad',
    'qadr', 'tawakkul', 'sabr', 'shukr', 'ikhlas', 'taqwa', 'ihsan',
    'istikhara', 'istishara'
  ];

  islamicTerms.forEach(term => {
    const pattern = new RegExp(`\\b${term.replace(/'/g, "'")}\\b`, 'i');
    if (pattern.test(text) && !terms.includes(term)) {
      terms.push(term);
    }
  });

  return terms.slice(0, 6);
}

// Generate search query phrases
function generateQueryPhrases(title, question, answer) {
  const phrases = [];
  const cleanTitle = title.toLowerCase().replace(/[?!]/g, '').trim();

  // Add simplified title as main query
  if (cleanTitle.length < 80) {
    phrases.push(cleanTitle);
  }

  // Extract specific patterns
  const text = `${title} ${question}`.toLowerCase();

  // Ruling questions
  const rulingMatch = text.match(/ruling on ([^?.]{10,60})/i);
  if (rulingMatch) phrases.push(`ruling on ${rulingMatch[1].trim()}`);

  // Is X halal/haram questions
  const halalHaramMatch = text.match(/is ([^?.]{5,40}) (halal|haram|permissible|allowed|forbidden)/i);
  if (halalHaramMatch) phrases.push(`is ${halalHaramMatch[1].trim()} ${halalHaramMatch[2]}`);

  // How to questions
  const howToMatch = text.match(/how to ([^?.]{10,50})/i);
  if (howToMatch) phrases.push(`how to ${howToMatch[1].trim()}`);

  // What is questions
  const whatIsMatch = text.match(/what is ([^?.]{5,50})/i);
  if (whatIsMatch) phrases.push(`what is ${whatIsMatch[1].trim()}`);

  // Can I/we questions
  const canMatch = text.match(/can (i|we|one|a muslim) ([^?.]{10,50})/i);
  if (canMatch) phrases.push(`can a muslim ${canMatch[2].trim()}`);

  // Add topic + Islam queries
  const topics = ['prayer', 'fasting', 'zakat', 'hajj', 'marriage', 'divorce', 'hijab', 'music', 'interest', 'alcohol', 'pork'];
  for (const topic of topics) {
    if (text.includes(topic) && !phrases.some(p => p.includes(topic))) {
      phrases.push(`${topic} in islam`);
      break;
    }
  }

  // Remove duplicates and limit
  return [...new Set(phrases)].slice(0, 4);
}

// Generate summary from question and answer
function generateSummary(title, question, answer) {
  const cleanQuestion = stripHtml(question);
  const cleanAnswer = stripHtml(answer);

  // Find key sentences from the answer
  let answerText = cleanAnswer
    .replace(/Table Of Contents.*?(?=[A-Z])/s, '')
    .replace(/Reference:.*$/s, '')
    .trim();

  const sentences = answerText
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.length > 30 && s.length < 300)
    .filter(s => !/^(And Allah knows|May Allah|For more|Please see|See also)/i.test(s));

  // Look for ruling statements
  const rulingPatterns = [
    /(?:the ruling is|it is|this is|scholars agree|the answer is)[^.]*(?:permissible|forbidden|haram|halal|obligatory|recommended|makruh|wajib|mustahabb)[^.]*\./i,
    /(?:is (?:not )?permissible|is (?:not )?allowed|is haram|is halal)[^.]*\./i,
    /according to (?:islam|islamic law|shari'ah|the quran|the sunnah|scholars)[^.]*\./i
  ];

  let rulingSentence = '';
  for (const pattern of rulingPatterns) {
    const match = answerText.match(pattern);
    if (match) {
      rulingSentence = match[0].trim();
      break;
    }
  }

  // Build the summary
  let summary = '';

  // Get topic from title
  const topic = title.replace(/[?!]/g, '').trim();

  // Determine the type of question
  if (/^(is|are|can|does|do|should|must|may)\b/i.test(title)) {
    // Yes/No type question
    if (rulingSentence) {
      summary = `Regarding "${topic.toLowerCase()}", ${rulingSentence.charAt(0).toLowerCase() + rulingSentence.slice(1)}`;
    } else {
      summary = `This fatwa addresses the question of ${topic.toLowerCase()}.`;
    }
  } else if (/^(what|how|why|when|where|who)\b/i.test(title)) {
    // Information-seeking question
    summary = `This answer explains ${topic.toLowerCase()}.`;
  } else if (/^ruling on/i.test(title)) {
    summary = `This fatwa discusses the ${topic.toLowerCase()}.`;
  } else {
    summary = `This response addresses ${topic.toLowerCase()}.`;
  }

  // Add key information from answer
  const keyInfo = sentences.find(s =>
    /\b(because|reason|evidence|proof|quran|hadith|prophet|scholar|islam)\b/i.test(s) &&
    s.length < 200
  );

  if (keyInfo && !summary.includes(keyInfo.substring(0, 30))) {
    summary += ' ' + keyInfo;
  } else if (sentences[0] && sentences[0].length < 200) {
    summary += ' ' + sentences[0];
  }

  // Add evidence reference if applicable
  if (/\bquran\b/i.test(answerText) && !/quran/i.test(summary)) {
    summary += ' Evidence from the Quran is cited.';
  } else if (/\bhadith\b/i.test(answerText) && !/hadith/i.test(summary)) {
    summary += ' Prophetic traditions (hadith) support this ruling.';
  }

  // Clean up and ensure proper length
  summary = summary
    .replace(/\s+/g, ' ')
    .replace(/\.\./g, '.')
    .trim();

  // Adjust length (target: 60-100 words)
  const words = summary.split(/\s+/);
  if (words.length > 100) {
    summary = words.slice(0, 95).join(' ');
    if (!summary.endsWith('.')) summary += '...';
  } else if (words.length < 50 && sentences.length > 1) {
    // Add more content if too short
    const addSentence = sentences.find(s => !summary.includes(s.substring(0, 20)) && s.length < 150);
    if (addSentence) {
      summary += ' ' + addSentence;
    }
  }

  return summary;
}

// Main processing function
async function processBatch() {
  console.log('Loading questions...');
  const questionsPath = path.join(__dirname, '../public/data/questions.json');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  const startIndex = 1600;
  const endIndex = 2400;
  const batchQuestions = questions.slice(startIndex, endIndex);

  console.log(`Processing ${batchQuestions.length} questions (index ${startIndex}-${endIndex - 1})...`);

  const summaries = {};

  for (let i = 0; i < batchQuestions.length; i++) {
    const q = batchQuestions[i];
    const cleanQuestion = stripHtml(q.question);
    const cleanAnswer = stripHtml(q.answer);

    const summary = generateSummary(q.title, q.question, q.answer);
    const tags = generateTags(q.title, cleanQuestion, cleanAnswer, q.tags);
    const ruling = determineRuling(q.title, cleanQuestion, cleanAnswer);
    const keyTerms = generateKeyTerms(q.title, cleanQuestion, cleanAnswer);
    const queryPhrases = generateQueryPhrases(q.title, cleanQuestion, cleanAnswer);

    summaries[q.reference] = {
      summary,
      tags,
      ruling,
      key_terms: keyTerms,
      query_phrases: queryPhrases
    };

    if ((i + 1) % 100 === 0) {
      console.log(`Processed ${i + 1}/${batchQuestions.length} questions...`);
    }
  }

  const output = {
    batch: 3,
    processed_at: new Date().toISOString(),
    start_index: startIndex,
    end_index: endIndex - 1,
    count: Object.keys(summaries).length,
    summaries
  };

  const outputPath = path.join(__dirname, '../public/data/summaries/batch_003.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\nBatch 3 complete!`);
  console.log(`Processed: ${output.count} questions`);
  console.log(`Output: ${outputPath}`);

  // Show samples
  const sampleRefs = Object.keys(summaries).slice(0, 5);
  console.log('\nSample entries:');
  sampleRefs.forEach(ref => {
    console.log(`\n--- Reference ${ref} ---`);
    console.log(JSON.stringify(summaries[ref], null, 2));
  });

  // Stats
  const rulingCounts = {};
  Object.values(summaries).forEach(s => {
    const r = s.ruling || 'null';
    rulingCounts[r] = (rulingCounts[r] || 0) + 1;
  });
  console.log('\nRuling distribution:', rulingCounts);
}

processBatch().catch(console.error);
