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
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Valid tags for categorization
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
  const tags = new Set();

  const tagPatterns = [
    { pattern: /\b(prayer|salah|salat|rak[\'\`]?ah|sujood|rukoo|prostrat|qiyam|tashahhud)\b/i, tags: ['salah', 'prayer'] },
    { pattern: /\b(wudu|wudoo|ablution|tayammum|purif|tahara)\b/i, tags: ['salah', 'fiqh'] },
    { pattern: /\b(fast|fasting|sawm|siyam|iftar|suhoor)\b/i, tags: ['fasting', 'sawm'] },
    { pattern: /\b(ramadan|ramadaan)\b/i, tags: ['ramadan', 'fasting'] },
    { pattern: /\b(zakah|zakat|zakaah)\b/i, tags: ['zakat', 'fiqh'] },
    { pattern: /\b(charity|sadaqah|alms)\b/i, tags: ['zakat'] },
    { pattern: /\b(hajj|pilgrimage|tawaf|sa[\'\`]?i|ihram|arafat|mina)\b/i, tags: ['hajj'] },
    { pattern: /\b(makkah|mecca|ka[\'\`]?bah|kaaba)\b/i, tags: ['hajj'] },
    { pattern: /\b(umrah|[\'\`]umrah)\b/i, tags: ['umrah'] },
    { pattern: /\b(marr|wife|husband|spouse|wedding|conjugal)\b/i, tags: ['marriage', 'nikah'] },
    { pattern: /\b(nikah|mahr|dowry|walimah|wali)\b/i, tags: ['nikah', 'marriage'] },
    { pattern: /\b(divorce|talaq|khula|divorced)\b/i, tags: ['divorce', 'talaq'] },
    { pattern: /\b(iddah|idda|waiting period)\b/i, tags: ['divorce', 'women'] },
    { pattern: /\b(family|parent|mother|father|relative|kinship)\b/i, tags: ['family'] },
    { pattern: /\b(son|daughter|brother|sister)\b/i, tags: ['family'] },
    { pattern: /\b(child|children|baby|infant|upbring|nurtur)\b/i, tags: ['children', 'parenting'] },
    { pattern: /\b(orphan)\b/i, tags: ['children', 'family'] },
    { pattern: /\b(food|eat|meat|slaughter)\b/i, tags: ['food'] },
    { pattern: /\b(zabiha|dhabiha|halal food)\b/i, tags: ['food', 'halal'] },
    { pattern: /\b(drink|beverage|alcohol|wine|intoxic)\b/i, tags: ['drink'] },
    { pattern: /\b(cloth|dress|garment|awrah)\b/i, tags: ['clothing'] },
    { pattern: /\b(hijab|headscarf|veil|niqab|jilbab|abaya)\b/i, tags: ['hijab', 'clothing', 'women'] },
    { pattern: /\b(business|trade|sell|buy|transact)\b/i, tags: ['business'] },
    { pattern: /\b(money|wealth|income|loan|debt|contract)\b/i, tags: ['finance'] },
    { pattern: /\b(riba|interest|usury|bank)\b/i, tags: ['riba', 'finance', 'haram'] },
    { pattern: /\b(work|job|employ|career|occupation)\b/i, tags: ['work'] },
    { pattern: /\b(educat|school|study|learn|teach|knowledge)\b/i, tags: ['education'] },
    { pattern: /\b(health|sick|illness|disease)\b/i, tags: ['health'] },
    { pattern: /\b(medicine|medic|treatment|cure|doctor)\b/i, tags: ['medicine', 'health'] },
    { pattern: /\b(death|die|dying|dead|deceased)\b/i, tags: ['death'] },
    { pattern: /\b(grave|burial|funeral|cemetery)\b/i, tags: ['death', 'janazah'] },
    { pattern: /\b(janazah|janaazah|shroud|kafan)\b/i, tags: ['janazah', 'death'] },
    { pattern: /\b(inherit|estate|bequest|wasiyyah)\b/i, tags: ['inheritance'] },
    { pattern: /\b(women|woman|female|sister|girl)\b/i, tags: ['women'] },
    { pattern: /\b(men|man|male|boy)\b/i, tags: ['men'] },
    { pattern: /\b(youth|young|teenager|adolescent)\b/i, tags: ['youth'] },
    { pattern: /\b(convert|revert|new muslim|shahad|enter.*islam)\b/i, tags: ['converts'] },
    { pattern: /\b(elderly|old age)\b/i, tags: ['elderly'] },
    { pattern: /\b(travel|journey|trip|safar|flight)\b/i, tags: ['travel'] },
    { pattern: /\b(eid|[\'\`]?eid)\b/i, tags: ['eid'] },
    { pattern: /\b(friday|jumu[\'\`]?ah|jumuah)\b/i, tags: ['friday'] },
    { pattern: /\b(mosque|masjid)\b/i, tags: ['mosque'] },
    { pattern: /\b(quran|qur[\'\`]?an|surah|ayah|recit)\b/i, tags: ['quran'] },
    { pattern: /\b(tafsir|tafseer|interpret.*quran)\b/i, tags: ['tafsir', 'quran'] },
    { pattern: /\b(hadith|hadeeth|prophet.*said|narrat)\b/i, tags: ['hadith'] },
    { pattern: /\b(sunnah)\b/i, tags: ['hadith', 'mustahabb'] },
    { pattern: /\b(seerah|sirah|prophet.*life|biography)\b/i, tags: ['seerah'] },
    { pattern: /\b(history|historical|caliphate|companion|sahab)\b/i, tags: ['history'] },
    { pattern: /\b(dua|du[\'\`]?a|supplicat|invoke)\b/i, tags: ['dua'] },
    { pattern: /\b(dhikr|remembr|tasbeeh|tahleel|takbeer|istighfar)\b/i, tags: ['dhikr'] },
    { pattern: /\b(aqeedah|aqidah|creed|belief|tawheed|tawhid)\b/i, tags: ['aqeedah'] },
    { pattern: /\b(iman|faith)\b/i, tags: ['aqeedah'] },
    { pattern: /\b(bid[\'\`]?ah|innovat|newly.*invented)\b/i, tags: ['bidah'] },
    { pattern: /\b(shirk|polythe|idolat|associate.*partner)\b/i, tags: ['shirk', 'aqeedah'] },
    { pattern: /\b(adab|etiquette|manner|conduct)\b/i, tags: ['adab'] },
    { pattern: /\b(haram|haraam|forbidden|prohibit|unlawful|impermissible)\b/i, tags: ['haram'] },
    { pattern: /\b(halal|halaal|permissible|lawful|allowed)\b/i, tags: ['halal'] },
    { pattern: /\b(makruh|makrooh|disliked)\b/i, tags: ['makruh'] },
    { pattern: /\b(mustahabb|recommend|encouraged)\b/i, tags: ['mustahabb'] },
    { pattern: /\b(wajib|obligat|fard|mandatory)\b/i, tags: ['wajib'] },
    { pattern: /\b(fiqh|ruling|jurisprud|fatwa)\b/i, tags: ['fiqh'] },
  ];

  for (const { pattern, tags: t } of tagPatterns) {
    if (pattern.test(text)) {
      t.forEach(tag => tags.add(tag));
    }
  }

  if (/(ruling|permissible|allowed|forbidden|obligat)/i.test(text)) {
    tags.add('fiqh');
  }

  const result = [...tags].filter(t => validTags.includes(t));
  return result.slice(0, 8);
}

// Determine ruling based on answer content
function determineRuling(title, question, answer) {
  const text = `${title} ${answer}`.toLowerCase();

  const haramIndicators = [
    /\b(it is haram|this is haram|haraam|is forbidden|not permissible|impermissible|prohibited|not allowed|not lawful|unlawful|major sin)\b/i,
    /\b(it is not permissible for|not permitted|strictly forbidden|categorically prohibited)\b/i
  ];

  const wajibIndicators = [
    /\b(it is wajib|this is wajib|obligatory|fard|mandatory|must be done|required|incumbent upon)\b/i,
    /\b(it is obligatory for|one must|one is obliged|duty to)\b/i
  ];

  const mustahabbIndicators = [
    /\b(it is mustahabb|this is mustahabb|recommended|sunnah|encouraged|preferable|meritorious|desirable)\b/i,
    /\b(it is recommended|it is sunnah|it is better to|praiseworthy)\b/i
  ];

  const makruhIndicators = [
    /\b(it is makruh|this is makruh|disliked|discouraged|better to avoid|not preferred)\b/i,
    /\b(it is disliked|it is makrooh)\b/i
  ];

  const halalIndicators = [
    /\b(it is halal|this is halal|permissible|allowed|lawful|there is nothing wrong|no harm|permitted|no sin)\b/i,
    /\b(it is permissible|it is allowed|may do|can do this)\b/i
  ];

  const mubahIndicators = [
    /\b(it is mubah|this is mubah|neutral|neither reward nor sin)\b/i
  ];

  for (const pattern of haramIndicators) {
    if (pattern.test(text)) return 'haram';
  }
  for (const pattern of wajibIndicators) {
    if (pattern.test(text)) return 'wajib';
  }
  for (const pattern of makruhIndicators) {
    if (pattern.test(text)) return 'makruh';
  }
  for (const pattern of mustahabbIndicators) {
    if (pattern.test(text)) return 'mustahabb';
  }
  for (const pattern of mubahIndicators) {
    if (pattern.test(text)) return 'mubah';
  }
  for (const pattern of halalIndicators) {
    if (pattern.test(text)) return 'halal';
  }

  return null;
}

// Generate key Islamic terms
function generateKeyTerms(title, question, answer) {
  const text = `${title} ${question} ${answer}`.toLowerCase();
  const terms = new Set();

  const islamicTerms = {
    'salah': /\bsalah\b/i, 'sawm': /\bsawm\b/i, 'zakat': /\bzakat|zakah|zakaah\b/i,
    'hajj': /\bhajj\b/i, 'umrah': /\bumrah\b/i, 'wudu': /\bwudu|wudoo\b/i,
    'ghusl': /\bghusl\b/i, 'tayammum': /\btayammum\b/i, 'qiblah': /\bqiblah|qibla\b/i,
    'ihram': /\bihram\b/i, 'tawaf': /\btawaf\b/i, 'sujud': /\bsujud|sujood\b/i,
    'nikah': /\bnikah\b/i, 'talaq': /\btalaq\b/i, 'khula': /\bkhula\b/i,
    'iddah': /\biddah|idda\b/i, 'mahr': /\bmahr\b/i, 'walimah': /\bwalimah\b/i,
    'mahram': /\bmahram\b/i, 'awrah': /\bawrah\b/i,
    'halal': /\bhalal|halaal\b/i, 'haram': /\bharam|haraam\b/i,
    'makruh': /\bmakruh|makrooh\b/i, 'mustahabb': /\bmustahabb\b/i,
    'wajib': /\bwajib\b/i, 'mubah': /\bmubah\b/i, 'fard': /\bfard\b/i,
    'quran': /\bquran|qur'an\b/i, 'hadith': /\bhadith|hadeeth\b/i,
    'sunnah': /\bsunnah\b/i, 'fiqh': /\bfiqh\b/i, 'aqeedah': /\baqeedah|aqidah\b/i,
    'tafsir': /\btafsir|tafseer\b/i, 'ijma': /\bijma\b/i,
    'dua': /\bdua|du'a\b/i, 'dhikr': /\bdhikr\b/i, 'tawbah': /\btawbah|tawba\b/i,
    'istighfar': /\bistighfar\b/i, 'taqwa': /\btaqwa\b/i, 'sabr': /\bsabr\b/i,
    'tawakkul': /\btawakkul\b/i, 'khushoo': /\bkhushoo|khushu\b/i,
    'ikhlas': /\bikhlas\b/i, 'niyyah': /\bniyyah|niyya\b/i,
    'janazah': /\bjanazah|janaazah\b/i, 'kafan': /\bkafan\b/i,
    'riba': /\briba\b/i, 'sadaqah': /\bsadaqah\b/i, 'wasiyyah': /\bwasiyyah\b/i,
    'bidah': /\bbidah|bid'ah\b/i, 'shirk': /\bshirk\b/i, 'kufr': /\bkufr\b/i,
    'iman': /\biman\b/i, 'ramadan': /\bramadan|ramadaan\b/i,
    'masjid': /\bmasjid\b/i, 'imam': /\bimam\b/i, 'khutbah': /\bkhutbah\b/i,
    'jannah': /\bjannah\b/i, 'jahannam': /\bjahannam\b/i, 'rizq': /\brizq\b/i,
    'barakah': /\bbarakah\b/i, 'fitrah': /\bfitrah\b/i, 'qadr': /\bqadr\b/i
  };

  for (const [term, pattern] of Object.entries(islamicTerms)) {
    if (pattern.test(text)) {
      terms.add(term);
    }
  }

  return [...terms].slice(0, 6);
}

// Generate query phrases for search optimization
function generateQueryPhrases(title, question, answer) {
  const phrases = new Set();
  const titleLower = title.toLowerCase().trim();
  const text = `${question} ${answer}`.toLowerCase();

  if (titleLower.length > 10 && titleLower.length < 80) {
    phrases.add(titleLower.replace(/[?.!]$/, ''));
  }

  if (/^ruling on/i.test(title)) {
    phrases.add('what is the ' + titleLower);
  }
  if (/^is it (permissible|halal|haram|allowed)/i.test(title)) {
    phrases.add(titleLower);
  }
  if (/^can (i|we|a muslim|one)/i.test(title)) {
    phrases.add(titleLower);
  }
  if (/^how to/i.test(title)) {
    phrases.add(titleLower);
  }
  if (/^what is/i.test(title)) {
    phrases.add(titleLower);
  }
  if (/^does.*break/i.test(title)) {
    phrases.add(titleLower);
  }

  if (/prayer|salah/i.test(text)) phrases.add('ruling on prayer in Islam');
  if (/fasting|sawm|ramadan/i.test(text)) phrases.add('fasting rules Islam');
  if (/marriage|nikah/i.test(text)) phrases.add('Islamic marriage rules');
  if (/divorce|talaq/i.test(text)) phrases.add('divorce ruling Islam');
  if (/zakat|zakah/i.test(text)) phrases.add('zakat obligation Islam');
  if (/hajj|pilgrimage/i.test(text)) phrases.add('hajj requirements Islam');
  if (/haram|forbidden/i.test(text)) phrases.add('what is haram in Islam');
  if (/halal|permissible/i.test(text)) phrases.add('what is halal in Islam');

  return [...phrases].slice(0, 4);
}

// Generate comprehensive summary (60-100 words) - IMPROVED VERSION
function generateSummary(title, question, answer) {
  const cleanTitle = title.replace(/\?$/, '').trim();
  const q = stripHtml(question);
  const a = stripHtml(answer);

  // Extract key sentences from answer
  const sentences = a.split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 350 && !s.startsWith('Table Of Contents'));

  let summary = '';

  // Create appropriate intro based on question type
  if (/^is it (permissible|halal|haram|allowed|forbidden)/i.test(title)) {
    summary = `This question asks whether ${cleanTitle.toLowerCase().replace(/^is it /i, '')}. `;
  } else if (/^ruling on/i.test(title)) {
    summary = `This addresses the Islamic ruling on ${cleanTitle.toLowerCase().replace(/^ruling on /i, '')}. `;
  } else if (/^can (i|we|one|a muslim)/i.test(title)) {
    summary = `This question addresses whether Muslims ${cleanTitle.toLowerCase().replace(/^can (i|we|one|a muslim) /i, '')}. `;
  } else if (/^how to/i.test(title)) {
    summary = `This explains ${cleanTitle.toLowerCase()} according to Islamic teachings. `;
  } else if (/^what is/i.test(title)) {
    summary = `This explains ${cleanTitle.toLowerCase().replace(/^what is /i, '')} in Islamic jurisprudence. `;
  } else if (/^does/i.test(title)) {
    summary = `This addresses whether ${cleanTitle.toLowerCase().replace(/^does /i, '')} according to Islamic law. `;
  } else if (/^why/i.test(title)) {
    summary = `This explains ${cleanTitle.toLowerCase()} from an Islamic perspective. `;
  } else {
    summary = `This question addresses ${cleanTitle.toLowerCase()} in Islamic teaching. `;
  }

  // Add key points from answer
  const addedSentences = [];
  if (sentences.length > 0) {
    // Prioritize sentences with ruling keywords
    const prioritySentences = sentences.filter(s =>
      /(permissible|obligatory|forbidden|recommended|scholars|ruling|evidence|proof|not allowed|haram|halal|wajib|mustahabb)/i.test(s)
    );

    const bestSentences = prioritySentences.length > 0 ? prioritySentences : sentences;

    // Add first key sentence
    if (bestSentences[0]) {
      let point = bestSentences[0].charAt(0).toUpperCase() + bestSentences[0].slice(1);
      point = point.replace(/^\d+[\.\)]\s*/, ''); // Remove numbering
      if (!point.endsWith('.')) point += '.';
      summary += point;
      addedSentences.push(0);
    }
  }

  // Determine and add ruling context
  const ruling = determineRuling(title, question, answer);
  if (ruling === 'haram') {
    summary += ' The scholars indicate this is prohibited (haram) in Islam based on evidence from Quran and Sunnah.';
  } else if (ruling === 'wajib') {
    summary += ' This is considered obligatory (wajib) upon Muslims according to Islamic jurisprudence.';
  } else if (ruling === 'mustahabb') {
    summary += ' This action is recommended (mustahabb) and brings reward but is not obligatory.';
  } else if (ruling === 'makruh') {
    summary += ' This is considered disliked (makruh) in Islam though not sinful to do.';
  } else if (ruling === 'halal') {
    summary += ' This is permissible (halal) in Islam according to the scholars.';
  } else if (ruling === 'mubah') {
    summary += ' This is considered neutral (mubah) with no reward or sin attached.';
  }

  // Check word count and add more content if needed
  let words = summary.split(/\s+/);

  // Add additional sentences if summary is too short
  while (words.length < 60 && sentences.length > addedSentences.length) {
    const nextIndex = addedSentences.length;
    if (sentences[nextIndex] && !addedSentences.includes(nextIndex)) {
      let additionalPoint = sentences[nextIndex].trim();
      additionalPoint = additionalPoint.replace(/^\d+[\.\)]\s*/, '');
      if (additionalPoint.length > 20 && additionalPoint.length < 250) {
        additionalPoint = additionalPoint.charAt(0).toUpperCase() + additionalPoint.slice(1);
        if (!additionalPoint.endsWith('.')) additionalPoint += '.';
        summary += ' ' + additionalPoint;
        addedSentences.push(nextIndex);
      }
    } else {
      break;
    }
    words = summary.split(/\s+/);
  }

  // If still too short, add context from question
  if (words.length < 60 && q.length > 50) {
    const qSentences = q.split(/[.!?]+/).filter(s => s.trim().length > 30);
    if (qSentences[0]) {
      summary += ' The questioner asks about ' + qSentences[0].trim().toLowerCase().slice(0, 100) + '.';
    }
  }

  // Add generic Islamic context if still short
  words = summary.split(/\s+/);
  if (words.length < 55) {
    summary += ' Muslims should consult knowledgeable scholars for specific circumstances and implementation details.';
  }

  // Trim to target length (60-100 words)
  words = summary.split(/\s+/);
  if (words.length > 100) {
    summary = words.slice(0, 97).join(' ') + '...';
  }

  return summary.replace(/\s+/g, ' ').trim();
}

// Main processing function
function processQuestions() {
  console.log('Reading questions...');
  const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8'));
  const batch = questions.slice(4000, 4800);

  console.log(`Processing ${batch.length} questions (indices 4000-4799)...`);

  const summaries = {};
  let count = 0;

  for (const q of batch) {
    const title = q.title || '';
    const question = stripHtml(q.question);
    const answer = stripHtml(q.answer);

    const tags = generateTags(title, question, answer);
    const ruling = determineRuling(title, question, answer);
    const keyTerms = generateKeyTerms(title, question, answer);
    const queryPhrases = generateQueryPhrases(title, question, answer);
    const summary = generateSummary(title, question, answer);

    summaries[q.reference] = {
      summary,
      tags: tags.length > 0 ? tags : ['fiqh'],
      ruling,
      key_terms: keyTerms,
      query_phrases: queryPhrases
    };

    count++;
    if (count % 100 === 0) {
      console.log(`Processed ${count}/${batch.length} questions...`);
    }
  }

  const output = {
    batch: 6,
    processed_at: new Date().toISOString(),
    start_index: 4000,
    end_index: 4799,
    count: Object.keys(summaries).length,
    summaries: summaries
  };

  if (!fs.existsSync('public/data/summaries')) {
    fs.mkdirSync('public/data/summaries', { recursive: true });
  }

  const outputPath = 'public/data/summaries/batch_006.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nCompleted! Wrote ${output.count} summaries to ${outputPath}`);

  // Statistics
  const summaryLengths = Object.values(summaries).map(s => s.summary.split(/\s+/).length);
  const avgLen = summaryLengths.reduce((a,b) => a+b, 0) / summaryLengths.length;
  const minLen = Math.min(...summaryLengths);
  const maxLen = Math.max(...summaryLengths);
  const under60 = summaryLengths.filter(l => l < 60).length;
  const over100 = summaryLengths.filter(l => l > 100).length;

  console.log(`\nSummary statistics:`);
  console.log(`  Average: ${avgLen.toFixed(1)} words`);
  console.log(`  Range: ${minLen} - ${maxLen} words`);
  console.log(`  Under 60 words: ${under60}`);
  console.log(`  Over 100 words: ${over100}`);
}

processQuestions();
