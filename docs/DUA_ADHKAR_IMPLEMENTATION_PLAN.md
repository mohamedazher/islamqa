# Dua & Adhkar Implementation Plan

This document provides a step-by-step implementation guide for Sonnet to build the Dua & Adhkar feature.

## Prerequisites

Before starting, ensure you have read:
- `/docs/DUA_ADHKAR_SPECIFICATION.md` - Feature specification
- `/dua_reference/` - Reference screenshots for UI design

---

## Implementation Order

Execute tasks in this exact order. Each task includes the file path and specific code to implement.

---

## Phase 1: Database & Data Layer

### Task 1.1: Update Dexie Database Schema

**File**: `src/services/dexieDatabase.js`

Add version 3 schema after the existing version 2 block (~line 49):

```javascript
// Version 3: Add Dua & Adhkar tables
this.version(3).stores({
  categories: 'reference, parent_reference',
  questions: 'reference, primary_category',
  folders: '++id, folder_name',
  folder_questions: '++id, reference, folder_id',
  latest_questions: 'reference, primary_category',
  settings: 'key',
  quiz_configurations: '++id, mode, difficulty',
  quiz_attempts: '++id, session_id, completion_date',
  quiz_sessions: '++id, quiz_config_id',
  quiz_questions: 'reference',
  ai_summaries: 'reference',
  ai_embeddings: 'reference',
  // NEW: Dua & Adhkar tables
  dua_categories: 'id, parent_id, type, order',
  duas: 'id, category_id, order',
  dua_favorites: '++id, dua_id',
  dua_settings: 'key'
})
```

Add table shortcuts after existing shortcuts (~line 66):

```javascript
// Dua & Adhkar tables
this.dua_categories = this.table('dua_categories')
this.duas = this.table('duas')
this.dua_favorites = this.table('dua_favorites')
this.dua_settings = this.table('dua_settings')
```

Add these methods to the class:

```javascript
// ==========================================
// Dua & Adhkar Methods
// ==========================================

/**
 * Get all dua categories, optionally filtered by type
 * @param {string|null} type - 'main' or 'other', null for all
 */
async getDuaCategories(type = null) {
  try {
    let query = this.dua_categories.orderBy('order')
    if (type) {
      const categories = await query.toArray()
      return categories.filter(c => c.type === type)
    }
    return await query.toArray()
  } catch (error) {
    console.error('Error getting dua categories:', error)
    return []
  }
}

/**
 * Get a single dua category by id
 */
async getDuaCategory(id) {
  try {
    return await this.dua_categories.get(id)
  } catch (error) {
    console.error('Error getting dua category:', error)
    return null
  }
}

/**
 * Get duas by category id
 */
async getDuasByCategory(categoryId) {
  try {
    return await this.duas
      .where('category_id')
      .equals(categoryId)
      .sortBy('order')
  } catch (error) {
    console.error('Error getting duas by category:', error)
    return []
  }
}

/**
 * Get a single dua by id
 */
async getDua(id) {
  try {
    return await this.duas.get(id)
  } catch (error) {
    console.error('Error getting dua:', error)
    return null
  }
}

/**
 * Get all favorite dua ids
 */
async getDuaFavorites() {
  try {
    const favorites = await this.dua_favorites.toArray()
    return favorites.map(f => f.dua_id)
  } catch (error) {
    console.error('Error getting dua favorites:', error)
    return []
  }
}

/**
 * Add dua to favorites
 */
async addDuaFavorite(duaId) {
  try {
    const existing = await this.dua_favorites
      .where('dua_id')
      .equals(duaId)
      .first()
    if (!existing) {
      await this.dua_favorites.add({ dua_id: duaId })
    }
  } catch (error) {
    console.error('Error adding dua favorite:', error)
    throw error
  }
}

/**
 * Remove dua from favorites
 */
async removeDuaFavorite(duaId) {
  try {
    await this.dua_favorites
      .where('dua_id')
      .equals(duaId)
      .delete()
  } catch (error) {
    console.error('Error removing dua favorite:', error)
    throw error
  }
}

/**
 * Check if dua is favorited
 */
async isDuaFavorite(duaId) {
  try {
    const favorite = await this.dua_favorites
      .where('dua_id')
      .equals(duaId)
      .first()
    return !!favorite
  } catch (error) {
    console.error('Error checking dua favorite:', error)
    return false
  }
}

/**
 * Get dua settings
 */
async getDuaSettings() {
  try {
    const settings = await this.dua_settings.toArray()
    const result = {}
    settings.forEach(s => { result[s.key] = s.value })
    return {
      arabic_font_size: result.arabic_font_size ?? 28,
      transliteration_font_size: result.transliteration_font_size ?? 16,
      translation_font_size: result.translation_font_size ?? 14,
      show_transliteration: result.show_transliteration ?? true,
      show_translation: result.show_translation ?? true,
      show_reference: result.show_reference ?? true,
      show_virtue: result.show_virtue ?? true
    }
  } catch (error) {
    console.error('Error getting dua settings:', error)
    return {
      arabic_font_size: 28,
      transliteration_font_size: 16,
      translation_font_size: 14,
      show_transliteration: true,
      show_translation: true,
      show_reference: true,
      show_virtue: true
    }
  }
}

/**
 * Update dua settings
 */
async updateDuaSettings(settings) {
  try {
    const entries = Object.entries(settings)
    for (const [key, value] of entries) {
      await this.dua_settings.put({ key, value })
    }
  } catch (error) {
    console.error('Error updating dua settings:', error)
    throw error
  }
}

/**
 * Import dua categories
 */
async importDuaCategories(categories) {
  try {
    await this.dua_categories.bulkPut(categories)
    console.log(`✅ Imported ${categories.length} dua categories`)
  } catch (error) {
    console.error('Error importing dua categories:', error)
    throw error
  }
}

/**
 * Import duas
 */
async importDuas(duas) {
  try {
    await this.duas.bulkPut(duas)
    console.log(`✅ Imported ${duas.length} duas`)
  } catch (error) {
    console.error('Error importing duas:', error)
    throw error
  }
}

/**
 * Check if dua data is imported
 */
async hasDuaData() {
  try {
    const count = await this.dua_categories.count()
    return count > 0
  } catch (error) {
    console.error('Error checking dua data:', error)
    return false
  }
}

/**
 * Get dua stats
 */
async getDuaStats() {
  try {
    const [categoriesCount, duasCount, favoritesCount] = await Promise.all([
      this.dua_categories.count(),
      this.duas.count(),
      this.dua_favorites.count()
    ])
    return {
      categories: categoriesCount,
      duas: duasCount,
      favorites: favoritesCount
    }
  } catch (error) {
    console.error('Error getting dua stats:', error)
    return { categories: 0, duas: 0, favorites: 0 }
  }
}
```

Also update the `clearAllData` method to include dua tables.

---

### Task 1.2: Create Dua Data Files

**File**: `public/data/dua/categories.json`

```json
{
  "categories": [
    {
      "id": "duas-ummah",
      "title": "Du'as for the Ummah",
      "title_ar": "دعاء للأمة",
      "description": "Supplications for the Muslim community",
      "icon": "mosque",
      "color": "from-rose-300 to-pink-400",
      "type": "main",
      "order": 1,
      "dua_count": 5
    },
    {
      "id": "morning",
      "title": "Morning Adhkar",
      "title_ar": "أذكار الصباح",
      "description": "Daily morning remembrances after Fajr until sunrise",
      "icon": "sun",
      "color": "from-amber-300 to-orange-400",
      "type": "main",
      "order": 2,
      "dua_count": 24
    },
    {
      "id": "evening",
      "title": "Evening Adhkar",
      "title_ar": "أذكار المساء",
      "description": "Daily evening remembrances from Asr to Maghrib",
      "icon": "moon",
      "color": "from-orange-300 to-rose-400",
      "type": "main",
      "order": 3,
      "dua_count": 24
    },
    {
      "id": "before-sleep",
      "title": "Before Sleep",
      "title_ar": "أذكار النوم",
      "description": "Supplications before going to bed",
      "icon": "bed",
      "color": "from-indigo-400 to-purple-500",
      "type": "main",
      "order": 4,
      "dua_count": 18
    },
    {
      "id": "waking-up",
      "title": "Waking Up",
      "title_ar": "دعاء الاستيقاظ",
      "description": "Supplications upon waking from sleep",
      "icon": "alarm",
      "color": "from-sky-300 to-blue-400",
      "type": "other",
      "order": 5,
      "dua_count": 5
    },
    {
      "id": "nightmares",
      "title": "Nightmares",
      "title_ar": "الكابوس",
      "description": "Protection after bad dreams",
      "icon": "cloud",
      "color": "from-slate-400 to-gray-500",
      "type": "other",
      "order": 6,
      "dua_count": 3
    },
    {
      "id": "clothes",
      "title": "Clothes",
      "title_ar": "اللباس",
      "description": "When dressing and undressing",
      "icon": "shirt",
      "color": "from-purple-300 to-indigo-400",
      "type": "other",
      "order": 7,
      "dua_count": 4
    },
    {
      "id": "lavatory-wudu",
      "title": "Lavatory & Wudu",
      "title_ar": "الخلاء والوضوء",
      "description": "Bathroom and ablution duas",
      "icon": "droplet",
      "color": "from-cyan-300 to-blue-400",
      "type": "other",
      "order": 8,
      "dua_count": 6
    },
    {
      "id": "food-drink",
      "title": "Food & Drink",
      "title_ar": "الطعام والشراب",
      "description": "Before and after eating",
      "icon": "utensils",
      "color": "from-emerald-300 to-teal-400",
      "type": "other",
      "order": 9,
      "dua_count": 16
    },
    {
      "id": "home",
      "title": "Home",
      "title_ar": "المنزل",
      "description": "Entering and leaving the house",
      "icon": "home",
      "color": "from-green-300 to-emerald-400",
      "type": "other",
      "order": 10,
      "dua_count": 4
    },
    {
      "id": "adhan-masjid",
      "title": "Adhan & Masjid",
      "title_ar": "الأذان والمسجد",
      "description": "Prayer call and mosque duas",
      "icon": "mosque",
      "color": "from-rose-300 to-pink-400",
      "type": "other",
      "order": 11,
      "dua_count": 8
    },
    {
      "id": "istikhara",
      "title": "Istikharah",
      "title_ar": "الاستخارة",
      "description": "Seeking guidance from Allah",
      "icon": "compass",
      "color": "from-violet-300 to-purple-400",
      "type": "other",
      "order": 12,
      "dua_count": 2
    },
    {
      "id": "difficulties",
      "title": "Difficulties & Distress",
      "title_ar": "الكرب والهم",
      "description": "During hardship and anxiety",
      "icon": "heart",
      "color": "from-amber-400 to-orange-500",
      "type": "other",
      "order": 13,
      "dua_count": 10
    }
  ]
}
```

**File**: `public/data/dua/morning.json`

```json
{
  "category_id": "morning",
  "duas": [
    {
      "id": "morning-1",
      "category_id": "morning",
      "title": "Ayat al-Kursi: The Greatest Protection",
      "title_ar": "آية الكرسي",
      "arabic": "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\n\nاللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      "transliteration": "Aʿūdhu bi-llāhi mina-sh-Shayṭāni-r-rajīm.\n\nAllāhu lā ilāha illā Huwa-l-Ḥayyu-l-Qayyūm. Lā ta'khudhuhū sinatuw-wa lā nawm. Lahū mā fi-s-samāwāti wa mā fi-l-arḍ. Man dha-l-ladhī yashfaʿu ʿindahū illā bi'idhnih. Yaʿlamu mā bayna aydīhim wa mā khalfahum. Wa lā yuḥīṭūna bi shay'im-min ʿilmihī illā bimā shā'. Wasiʿa kursiyyuhu-s-samāwāti wa-l-arḍ. Wa lā ya'ūduhū ḥifẓuhumā. Wa Huwa-l-ʿAliyyu-l-ʿAẓīm.",
      "translation": "I seek the protection of Allah from the accursed Shayṭān.\n\nAllah, there is no god worthy of worship but He, the Ever Living, The Sustainer of all. Neither drowsiness overtakes Him nor sleep. To Him Alone belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except with His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursī extends over the heavens and the earth, and their preservation does not tire Him. And He is the Most High, the Magnificent.",
      "virtue": "The Messenger of Allah ﷺ said, 'In Sūrah al-Baqarah, there is a verse which is the best verse of the Qur'ān. It is never recited in a house except that Shayṭān leaves: it is Āyah al-Kursī.'",
      "reference": "Ḥākim 2064, Bukhārī 2311",
      "repetitions": 1,
      "order": 1,
      "tags": ["protection", "quran", "shaytan"]
    },
    {
      "id": "morning-2",
      "category_id": "morning",
      "title": "Three Quls: To Suffice You in All Your Matters",
      "title_ar": "المعوذات الثلاث",
      "arabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
      "transliteration": "Bismi-llāhi-r-Raḥmāni-r-Raḥīm\nQul Huwa-llāhu Aḥad. Allāhu-ṣ-Ṣamad. Lam yalid wa lam yūlad. Wa lam yakul-lahū kufuwan aḥad.\n\nBismi-llāhi-r-Raḥmāni-r-Raḥīm\nQul aʿūdhu bi Rabbi-l-falaq. Min sharri mā khalaq. Wa min sharri ghāsiqin idhā waqab. Wa min sharri-n-naffāthāti fi-l-ʿuqad. Wa min sharri ḥāsidin idhā ḥasad.\n\nBismi-llāhi-r-Raḥmāni-r-Raḥīm\nQul aʿūdhu bi Rabbi-n-nās. Maliki-n-nās. Ilāhi-n-nās. Min sharri-l-waswāsi-l-khannās. Alladhī yuwaswisu fī ṣudūri-n-nās. Mina-l-jinnati wa-n-nās.",
      "translation": "In the Name of Allah, the Most Merciful, the Bestower of Mercy.\nSay, 'He is Allah, the One. Allah, the Self-Sufficient. He does not give birth, nor was He born. And there is none comparable to Him.'\n\nIn the Name of Allah, the Most Merciful, the Bestower of Mercy.\nSay, 'I seek protection of the Lord of the daybreak. From the evil of what He has created. And from the evil of the darkness when it settles. And from the evil of those who blow on knots. And from the evil of the envier when he envies.'\n\nIn the Name of Allah, the Most Merciful, the Bestower of Mercy.\nSay, 'I seek protection of the Lord of mankind. The King of mankind. The God of mankind. From the evil of the retreating whisperer. Who whispers into the hearts of mankind. From among jinn and mankind.'",
      "virtue": "'Abdullāh b. Khubayb narrates that the Messenger of Allah ﷺ said: 'Recite Sūrah al-Ikhlās and al-Muʿawwidhatayn (Sūrah al-Falaq and Sūrah al-Nās) three times in the morning and the evening. It will suffice you in all respects.'",
      "reference": "Tirmidhī 3575",
      "repetitions": 3,
      "order": 2,
      "tags": ["protection", "quran", "ikhlas", "falaq", "nas"]
    },
    {
      "id": "morning-3",
      "category_id": "morning",
      "title": "Sayyid al-Istighfar: The Best Way of Seeking Forgiveness",
      "title_ar": "سيد الاستغفار",
      "arabic": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
      "transliteration": "Allāhumma Anta Rabbī, lā ilāha illā Ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika ma-s-taṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abū'u laka bi-niʿmatika ʿalayya, wa abū'u bi-dhanbī, fa-ghfir lī fa-innahū lā yaghfiru-dh-dhunūba illā Ant.",
      "translation": "O Allah, You are my Lord. There is no god worthy of worship except You. You have created me, and I am Your slave, and I am faithful to my covenant and promise to You as much as I am able. I seek Your protection from the evil of what I have done. I acknowledge before You all the blessings You have bestowed upon me, and I confess to You my sins. So forgive me, for surely no one can forgive sins except You.",
      "virtue": "Shaddād b. Aws narrates that the Messenger of Allah ﷺ said: 'The Sayyid al-Istighfār (the best way of seeking forgiveness) is to say [the above]. Whoever says it during the day with firm belief in it and dies on the same day before the evening, he will be from the people of Paradise; and if somebody recites it at night with firm belief in it and dies before the morning, he will be from the people of Paradise.'",
      "reference": "Bukhārī 6306",
      "repetitions": 1,
      "order": 3,
      "tags": ["forgiveness", "istighfar", "paradise"]
    },
    {
      "id": "morning-4",
      "category_id": "morning",
      "title": "Protect Yourself From Anxiety, Laziness & Debt",
      "title_ar": "التعوذ من الهم والحزن",
      "arabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
      "transliteration": "Allāhumma innī aʿūdhu bika mina-l-hammi wa-l-ḥazan, wa aʿūdhu bika mina-l-ʿajzi wa-l-kasal, wa aʿūdhu bika mina-l-jubni wa-l-bukhl, wa aʿūdhu bika min ghalabati-d-dayni wa qahri-r-rijāl.",
      "translation": "O Allah, I seek Your protection from anxiety and grief. I seek Your protection from inability and laziness. I seek Your protection from cowardice and miserliness. And I seek Your protection from being overcome by debt and being overpowered by men.",
      "virtue": "Abū Saʿīd al-Khudrī narrates that one day the Messenger of Allah ﷺ entered the masjid and saw a man from the Ansār called Abū Umāmah. He ﷺ asked, 'O Abū Umāmah, why do I see you sitting in the masjid outside of the prayer time?' He replied, 'Worries and debts have overtaken me, O Messenger of Allah.' The Prophet ﷺ said, 'Shall I not teach you words that, if you say them, Allah will remove your worries and settle your debts?' He said, 'Of course, O Messenger of Allah.' He ﷺ said, 'Say [the above] in the morning and evening.' He (Abū Umāmah) said, 'I did that, and Allah removed my worries and settled my debts.'",
      "reference": "Abū Dāwūd 1555",
      "repetitions": 1,
      "order": 4,
      "tags": ["anxiety", "debt", "laziness", "protection"]
    },
    {
      "id": "morning-5",
      "category_id": "morning",
      "title": "Attain Well-being in This World and the Hereafter",
      "title_ar": "طلب العافية",
      "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
      "transliteration": "Allāhumma innī as'aluka-l-ʿāfiyata fi-d-dunyā wa-l-ākhirah. Allāhumma innī as'aluka-l-ʿafwa wa-l-ʿāfiyata fī dīnī wa dunyāya wa ahlī wa mālī. Allāhumma-stur ʿawrātī, wa āmin rawʿātī. Allāhumma-ḥfaẓnī min bayni yadayya wa min khalfī wa ʿan yamīnī wa ʿan shimālī wa min fawqī, wa aʿūdhu bi-ʿaẓamatika an ughtāla min taḥtī.",
      "translation": "O Allah, I ask You for well-being in this world and the next. O Allah, I ask You for forgiveness and well-being in my religion, my worldly affairs, my family and my wealth. O Allah, conceal my faults and calm my fears. O Allah, guard me from in front of me and behind me, from my right, and from my left, and from above me. And I seek protection in Your Greatness from being unexpectedly destroyed from beneath me.",
      "virtue": "Ibn ʿUmar narrates that the Messenger of Allah ﷺ never failed to say these words in the morning and in the evening.",
      "reference": "Abū Dāwūd 5074",
      "repetitions": 1,
      "order": 5,
      "tags": ["wellbeing", "protection", "family", "wealth"]
    },
    {
      "id": "morning-6",
      "category_id": "morning",
      "title": "Protect Yourself From the Four Evils",
      "title_ar": "التعوذ من أربعة",
      "arabic": "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَىٰ نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَىٰ مُسْلِمٍ",
      "transliteration": "Allāhumma ʿālima-l-ghaybi wa-sh-shahādah, fāṭira-s-samāwāti wa-l-arḍ, Rabba kulli shay'iw-wa malīkah, ashhadu al-lā ilāha illā Ant, aʿūdhu bika min sharri nafsī, wa min sharri-sh-Shayṭāni wa shirkihī, wa an aqtarifa ʿalā nafsī sū'an aw ajurrahū ilā Muslim.",
      "translation": "O Allah, Knower of the unseen and the seen, Creator of the heavens and the earth, the Lord and Sovereign of everything; I bear witness that there is no god worthy of worship but You. I seek Your protection from the evil of my own self, from the evil of Shayṭān and from his (inciting to) shirk, and from inflicting evil upon myself or bringing it upon a Muslim.",
      "virtue": "The Prophet ﷺ said to Abū Bakr al-Ṣiddīq: 'Say [the above] in the morning and evening, and when you retire to bed.'",
      "reference": "Tirmidhī 3392, 3529",
      "repetitions": 1,
      "order": 6,
      "tags": ["protection", "shaytan", "self"]
    },
    {
      "id": "morning-7",
      "category_id": "morning",
      "title": "Entrust All Your Matters to Allah",
      "title_ar": "التوكل على الله",
      "arabic": "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
      "transliteration": "Ḥasbiya-llāhu lā ilāha illā Huwa, ʿalayhi tawakkalt, wa Huwa Rabbu-l-ʿArshi-l-ʿAẓīm.",
      "translation": "Allah is sufficient for me. There is no god worthy of worship except Him. I have placed my trust in Him only and He is the Lord of the Magnificent Throne.",
      "virtue": "The Messenger of Allah ﷺ said: 'Whoever says [the above] seven times in the morning and evening, Allah will suffice him in whatever concerns him.'",
      "reference": "Ibn al-Sunnī 71, Abū Dāwūd 5081",
      "repetitions": 7,
      "order": 7,
      "tags": ["tawakkul", "trust", "reliance"]
    },
    {
      "id": "morning-8",
      "category_id": "morning",
      "title": "Fulfil Your Obligation to Thank Allah",
      "title_ar": "أداء شكر النعمة",
      "arabic": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
      "transliteration": "Allāhumma mā aṣbaḥa bī min niʿmatin aw bi-aḥadim-min khalqik, fa-minka waḥdaka lā sharīka lak, fa-laka-l-ḥamdu wa laka-sh-shukr.",
      "translation": "O Allah, all the favours that I or anyone from Your creation has received in the morning, are from You Alone. You have no partner. To You Alone belongs all praise and all thanks.",
      "virtue": "'Abdullāh b. Ghannām narrates that the Messenger of Allah ﷺ said: 'Whoever says [the above] in the morning has fulfilled his obligation to thank Allah for that day. And whoever says it in the evening has fulfilled his obligation for that night.'",
      "reference": "Abū Dāwūd 5073",
      "repetitions": 1,
      "order": 8,
      "tags": ["gratitude", "shukr", "blessings"]
    }
  ]
}
```

**Create additional category files following the same structure:**
- `public/data/dua/evening.json` (similar to morning but with evening wording)
- `public/data/dua/before-sleep.json`
- `public/data/dua/food-drink.json`
- `public/data/dua/adhan-masjid.json`
- `public/data/dua/waking-up.json`
- etc.

---

### Task 1.3: Create Dua Service

**File**: `src/services/duaService.js`

```javascript
/**
 * Dua Service
 * Handles all dua-related operations
 */

import dexieDb from './dexieDatabase'

class DuaService {
  /**
   * Get all categories
   * @param {string|null} type - 'main' or 'other', null for all
   */
  async getCategories(type = null) {
    return await dexieDb.getDuaCategories(type)
  }

  /**
   * Get a single category by id
   */
  async getCategory(id) {
    return await dexieDb.getDuaCategory(id)
  }

  /**
   * Get all duas for a category
   */
  async getDuasByCategory(categoryId) {
    return await dexieDb.getDuasByCategory(categoryId)
  }

  /**
   * Get a single dua
   */
  async getDua(id) {
    return await dexieDb.getDua(id)
  }

  /**
   * Search duas by text
   */
  async searchDuas(query) {
    if (!query || query.length < 2) return []

    const allDuas = await dexieDb.duas.toArray()
    const lowerQuery = query.toLowerCase()

    return allDuas.filter(dua =>
      dua.title?.toLowerCase().includes(lowerQuery) ||
      dua.translation?.toLowerCase().includes(lowerQuery) ||
      dua.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Get all favorite duas
   */
  async getFavorites() {
    const favoriteIds = await dexieDb.getDuaFavorites()
    if (favoriteIds.length === 0) return []

    const duas = await Promise.all(
      favoriteIds.map(id => dexieDb.getDua(id))
    )
    return duas.filter(Boolean)
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(duaId) {
    const isFav = await dexieDb.isDuaFavorite(duaId)
    if (isFav) {
      await dexieDb.removeDuaFavorite(duaId)
      return false
    } else {
      await dexieDb.addDuaFavorite(duaId)
      return true
    }
  }

  /**
   * Check if dua is favorited
   */
  async isFavorite(duaId) {
    return await dexieDb.isDuaFavorite(duaId)
  }

  /**
   * Get user settings
   */
  async getSettings() {
    return await dexieDb.getDuaSettings()
  }

  /**
   * Update user settings
   */
  async updateSettings(settings) {
    await dexieDb.updateDuaSettings(settings)
  }

  /**
   * Check if dua data is imported
   */
  async isImported() {
    return await dexieDb.hasDuaData()
  }

  /**
   * Get stats
   */
  async getStats() {
    return await dexieDb.getDuaStats()
  }
}

export default new DuaService()
```

---

### Task 1.4: Create Dua Data Loader

**File**: `src/services/duaDataLoader.js`

```javascript
/**
 * Dua Data Loader
 * Imports dua categories and duas from JSON files
 */

import dexieDb from './dexieDatabase'

class DuaDataLoader {
  /**
   * Load and import all dua data
   * @param {Function} onProgress - Progress callback (step, progress)
   */
  async loadAndImport(onProgress = null) {
    try {
      // Check if already imported
      const hasData = await dexieDb.hasDuaData()
      if (hasData) {
        console.log('Dua data already imported')
        return { success: true, message: 'Already imported' }
      }

      // Step 1: Load categories
      if (onProgress) onProgress('Loading categories...', 10)
      const categoriesResponse = await fetch('./data/dua/categories.json')
      const categoriesData = await categoriesResponse.json()

      // Step 2: Import categories
      if (onProgress) onProgress('Importing categories...', 20)
      await dexieDb.importDuaCategories(categoriesData.categories)

      // Step 3: Load and import duas for each category
      const categories = categoriesData.categories
      const totalCategories = categories.length

      for (let i = 0; i < totalCategories; i++) {
        const category = categories[i]
        const progress = 20 + ((i / totalCategories) * 70)

        if (onProgress) {
          onProgress(`Loading ${category.title}...`, progress)
        }

        try {
          const duasResponse = await fetch(`./data/dua/${category.id}.json`)
          if (duasResponse.ok) {
            const duasData = await duasResponse.json()
            if (duasData.duas && duasData.duas.length > 0) {
              await dexieDb.importDuas(duasData.duas)
            }
          }
        } catch (error) {
          console.warn(`Could not load duas for category ${category.id}:`, error)
        }
      }

      // Step 4: Mark as complete
      if (onProgress) onProgress('Finalizing...', 95)

      if (onProgress) onProgress('Complete!', 100)

      return { success: true, message: 'Import complete' }
    } catch (error) {
      console.error('Error importing dua data:', error)
      throw error
    }
  }

  /**
   * Clear all dua data (for re-import)
   */
  async clearData() {
    await dexieDb.transaction('rw', [
      dexieDb.dua_categories,
      dexieDb.duas,
      dexieDb.dua_favorites
    ], async () => {
      await dexieDb.dua_categories.clear()
      await dexieDb.duas.clear()
      await dexieDb.dua_favorites.clear()
    })
  }
}

export default new DuaDataLoader()
```

---

### Task 1.5: Create Pinia Store

**File**: `src/stores/dua.js`

```javascript
/**
 * Dua Store
 * Manages dua state and actions
 */

import { defineStore } from 'pinia'
import duaService from '@/services/duaService'
import duaDataLoader from '@/services/duaDataLoader'

export const useDuaStore = defineStore('dua', {
  state: () => ({
    categories: [],
    currentCategory: null,
    currentDuas: [],
    currentDuaIndex: 0,
    favorites: [],
    settings: {
      arabic_font_size: 28,
      transliteration_font_size: 16,
      translation_font_size: 14,
      show_transliteration: true,
      show_translation: true,
      show_reference: true,
      show_virtue: true
    },
    isLoading: false,
    isImported: false,
    importProgress: 0,
    importStatus: ''
  }),

  getters: {
    mainCategories: (state) => state.categories.filter(c => c.type === 'main'),
    otherCategories: (state) => state.categories.filter(c => c.type === 'other'),
    currentDua: (state) => state.currentDuas[state.currentDuaIndex] || null,
    progress: (state) => {
      if (state.currentDuas.length === 0) return '0/0'
      return `${state.currentDuaIndex + 1}/${state.currentDuas.length}`
    },
    progressPercent: (state) => {
      if (state.currentDuas.length === 0) return 0
      return ((state.currentDuaIndex + 1) / state.currentDuas.length) * 100
    },
    hasNext: (state) => state.currentDuaIndex < state.currentDuas.length - 1,
    hasPrevious: (state) => state.currentDuaIndex > 0
  },

  actions: {
    async initialize() {
      this.isLoading = true
      try {
        // Check if data is imported
        this.isImported = await duaService.isImported()

        if (!this.isImported) {
          // Import data
          await duaDataLoader.loadAndImport((status, progress) => {
            this.importStatus = status
            this.importProgress = progress
          })
          this.isImported = true
        }

        // Load categories
        await this.loadCategories()

        // Load settings
        this.settings = await duaService.getSettings()

        // Load favorites
        await this.loadFavorites()
      } catch (error) {
        console.error('Error initializing dua store:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadCategories() {
      this.categories = await duaService.getCategories()
    },

    async loadCategory(categoryId) {
      this.isLoading = true
      try {
        this.currentCategory = await duaService.getCategory(categoryId)
        this.currentDuas = await duaService.getDuasByCategory(categoryId)
        this.currentDuaIndex = 0
      } catch (error) {
        console.error('Error loading category:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadDuaByIndex(index) {
      if (index >= 0 && index < this.currentDuas.length) {
        this.currentDuaIndex = index
      }
    },

    nextDua() {
      if (this.hasNext) {
        this.currentDuaIndex++
      }
    },

    previousDua() {
      if (this.hasPrevious) {
        this.currentDuaIndex--
      }
    },

    async loadFavorites() {
      this.favorites = await duaService.getFavorites()
    },

    async toggleFavorite(duaId) {
      const isFav = await duaService.toggleFavorite(duaId)
      await this.loadFavorites()
      return isFav
    },

    async isFavorite(duaId) {
      return await duaService.isFavorite(duaId)
    },

    async updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      await duaService.updateSettings(this.settings)
    },

    async searchDuas(query) {
      return await duaService.searchDuas(query)
    }
  }
})
```

---

## Phase 2: UI Components

Continue in Part 2 of implementation plan...

---

### Task 2.1: Add Routes

**File**: `src/router/index.js`

Add these routes after the existing routes (before the closing `]`):

```javascript
{
  path: '/dua',
  name: 'dua',
  component: () => import('@/views/DuaHomeView.vue'),
  meta: { title: 'Dua & Adhkar' }
},
{
  path: '/dua/category/:id',
  name: 'dua-category',
  component: () => import('@/views/DuaCategoryView.vue'),
  meta: { title: 'Category' }
},
{
  path: '/dua/category/:categoryId/dua/:duaIndex',
  name: 'dua-detail',
  component: () => import('@/views/DuaDetailView.vue'),
  meta: { title: 'Dua' }
},
{
  path: '/dua/favorites',
  name: 'dua-favorites',
  component: () => import('@/views/DuaFavoritesView.vue'),
  meta: { title: 'Favorite Duas' }
}
```

---

### Task 2.2: Add Icon

**File**: `src/components/common/Icon.vue`

Add to the icons object:

```javascript
prayer: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /><path d="M12 2a10 10 0 0 0-7.071 17.071A10 10 0 0 0 12 22a10 10 0 0 0 7.071-2.929A10 10 0 0 0 12 2z" stroke="none" fill="currentColor" opacity="0.1"/>',
hands: '<path stroke-linecap="round" stroke-linejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />',
```

---

### Task 2.3: Create DuaHomeView

**File**: `src/views/DuaHomeView.vue`

```vue
<template>
  <div class="dua-home min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <div class="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 text-white px-4 pt-4 pb-6">
      <div class="flex items-center justify-between mb-4">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <h1 class="text-xl font-bold">Dua & Adhkar</h1>
        <button @click="$router.push('/dua/favorites')" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
          <Icon name="heart" size="md" class="text-white" />
        </button>
      </div>

      <!-- Tab Toggle -->
      <div class="flex bg-white/20 rounded-full p-1">
        <button
          @click="activeTab = 'main'"
          class="flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all"
          :class="activeTab === 'main' ? 'bg-white text-teal-600' : 'text-white'"
        >
          Main
        </button>
        <button
          @click="activeTab = 'other'"
          class="flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all"
          :class="activeTab === 'other' ? 'bg-white text-teal-600' : 'text-white'"
        >
          Other
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="duaStore.isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-neutral-600 dark:text-neutral-400">{{ duaStore.importStatus || 'Loading...' }}</p>
        <div v-if="duaStore.importProgress > 0" class="mt-2 w-48 mx-auto">
          <div class="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 transition-all duration-300"
              :style="{ width: `${duaStore.importProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div v-else class="p-4">
      <div class="grid grid-cols-2 gap-4">
        <DuaCategoryCard
          v-for="category in displayedCategories"
          :key="category.id"
          :category="category"
          @click="openCategory(category.id)"
        />
      </div>

      <!-- Empty State -->
      <div v-if="displayedCategories.length === 0" class="text-center py-12">
        <Icon name="book" size="2xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
        <p class="text-neutral-500 dark:text-neutral-400">No categories found</p>
      </div>
    </div>

    <!-- Attribution Footer -->
    <div class="px-4 pb-8 text-center">
      <p class="text-xs text-neutral-400 dark:text-neutral-500">
        Content sourced from
        <a href="https://lifewithallah.com/dhikr-dua/" target="_blank" class="text-primary-500 hover:underline">
          LifeWithAllah.com
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'
import DuaCategoryCard from '@/components/dua/DuaCategoryCard.vue'

const router = useRouter()
const duaStore = useDuaStore()

const activeTab = ref('main')

const displayedCategories = computed(() => {
  return activeTab.value === 'main'
    ? duaStore.mainCategories
    : duaStore.otherCategories
})

function openCategory(categoryId) {
  router.push(`/dua/category/${categoryId}`)
}

onMounted(async () => {
  if (!duaStore.isImported) {
    await duaStore.initialize()
  } else if (duaStore.categories.length === 0) {
    await duaStore.loadCategories()
  }
})
</script>
```

---

### Task 2.4: Create DuaCategoryCard

**File**: `src/components/dua/DuaCategoryCard.vue`

```vue
<template>
  <div
    @click="$emit('click')"
    class="relative overflow-hidden rounded-2xl h-32 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    :class="gradientClass"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-20">
      <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white rounded-full"></div>
    </div>

    <!-- Content -->
    <div class="relative p-4 h-full flex flex-col justify-end">
      <div class="mb-1">
        <span class="text-2xl">{{ iconEmoji }}</span>
      </div>
      <h3 class="text-white font-bold text-lg leading-tight">{{ category.title }}</h3>
      <p class="text-white/70 text-xs mt-1">{{ category.dua_count }} duas</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const gradientClass = computed(() => {
  const colorMap = {
    'duas-ummah': 'bg-gradient-to-br from-rose-400 to-pink-500',
    'morning': 'bg-gradient-to-br from-amber-400 to-orange-500',
    'evening': 'bg-gradient-to-br from-orange-400 to-rose-500',
    'before-sleep': 'bg-gradient-to-br from-indigo-500 to-purple-600',
    'waking-up': 'bg-gradient-to-br from-sky-400 to-blue-500',
    'nightmares': 'bg-gradient-to-br from-slate-500 to-gray-600',
    'clothes': 'bg-gradient-to-br from-purple-400 to-indigo-500',
    'lavatory-wudu': 'bg-gradient-to-br from-cyan-400 to-blue-500',
    'food-drink': 'bg-gradient-to-br from-emerald-400 to-teal-500',
    'home': 'bg-gradient-to-br from-green-400 to-emerald-500',
    'adhan-masjid': 'bg-gradient-to-br from-rose-400 to-pink-500',
    'istikhara': 'bg-gradient-to-br from-violet-400 to-purple-500',
    'difficulties': 'bg-gradient-to-br from-amber-500 to-orange-600'
  }
  return colorMap[props.category.id] || 'bg-gradient-to-br from-primary-400 to-primary-600'
})

const iconEmoji = computed(() => {
  const emojiMap = {
    'duas-ummah': '🕌',
    'morning': '🌅',
    'evening': '🌇',
    'before-sleep': '🌙',
    'waking-up': '⏰',
    'nightmares': '☁️',
    'clothes': '👔',
    'lavatory-wudu': '💧',
    'food-drink': '🍽️',
    'home': '🏠',
    'adhan-masjid': '🕌',
    'istikhara': '🧭',
    'difficulties': '💪'
  }
  return emojiMap[props.category.id] || '📿'
})
</script>
```

---

### Task 2.5: Create DuaCategoryView

**File**: `src/views/DuaCategoryView.vue`

```vue
<template>
  <div class="dua-category min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <div class="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 text-white px-4 pt-4 pb-6">
      <div class="flex items-center justify-between mb-2">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <button @click="$router.push('/')" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
          <Icon name="home" size="md" class="text-white" />
        </button>
      </div>
      <h1 class="text-2xl font-bold">{{ duaStore.currentCategory?.title || 'Loading...' }}</h1>
      <p class="text-white/80 text-sm mt-1">{{ duaStore.currentDuas.length }} duas</p>
    </div>

    <!-- Loading State -->
    <div v-if="duaStore.isLoading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
    </div>

    <!-- Dua List -->
    <div v-else class="divide-y divide-neutral-200 dark:divide-neutral-800">
      <DuaListItem
        v-for="(dua, index) in duaStore.currentDuas"
        :key="dua.id"
        :dua="dua"
        :order="index + 1"
        @click="openDua(index)"
      />
    </div>

    <!-- Bottom Actions -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4 flex gap-4">
      <button
        @click="openDua(0)"
        class="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        <Icon name="play" size="sm" />
        Start Reading
      </button>
      <button
        @click="toggleCategoryFavorite"
        class="p-3 rounded-xl border border-neutral-300 dark:border-neutral-700"
      >
        <Icon name="heart" size="md" :class="isCategoryFavorite ? 'text-red-500' : 'text-neutral-400'" />
      </button>
    </div>

    <!-- Spacer for fixed bottom -->
    <div class="h-24"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'
import DuaListItem from '@/components/dua/DuaListItem.vue'

const route = useRoute()
const router = useRouter()
const duaStore = useDuaStore()

const isCategoryFavorite = ref(false)

function openDua(index) {
  router.push(`/dua/category/${route.params.id}/dua/${index}`)
}

function toggleCategoryFavorite() {
  // TODO: Implement category favorite
  isCategoryFavorite.value = !isCategoryFavorite.value
}

onMounted(async () => {
  await duaStore.loadCategory(route.params.id)
})
</script>
```

---

### Task 2.6: Create DuaListItem

**File**: `src/components/dua/DuaListItem.vue`

```vue
<template>
  <div
    @click="$emit('click')"
    class="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
  >
    <!-- Order Number -->
    <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
      <span class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ order }}</span>
    </div>

    <!-- Title -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
        {{ dua.title }}
      </h4>
      <p v-if="dua.repetitions && dua.repetitions > 1" class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
        Repeat {{ dua.repetitions }}x
      </p>
    </div>

    <!-- Arrow -->
    <Icon name="chevronRight" size="sm" class="text-neutral-400 flex-shrink-0" />
  </div>
</template>

<script setup>
import Icon from '@/components/common/Icon.vue'

defineProps({
  dua: {
    type: Object,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
})

defineEmits(['click'])
</script>
```

---

### Task 2.7: Create DuaDetailView

**File**: `src/views/DuaDetailView.vue`

```vue
<template>
  <div class="dua-detail min-h-screen bg-neutral-900 text-white">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-sm px-4 pt-4 pb-2">
      <div class="flex items-center justify-between mb-3">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <button @click="$router.push('/')" class="p-2 rounded-lg hover:bg-white/10">
          <Icon name="home" size="md" class="text-white" />
        </button>
        <button @click="showSettings = true" class="p-2 -mr-2 rounded-lg hover:bg-white/10">
          <Icon name="cog" size="md" class="text-white" />
        </button>
      </div>

      <!-- Progress bar -->
      <div class="h-1 bg-neutral-800 rounded-full overflow-hidden mb-2">
        <div
          class="h-full bg-primary-500 transition-all duration-300"
          :style="{ width: `${duaStore.progressPercent}%` }"
        ></div>
      </div>

      <!-- Title and progress -->
      <h1 class="text-lg font-bold text-white/90 line-clamp-2">{{ currentDua?.title }}</h1>
      <p class="text-sm text-white/60 mt-1">{{ duaStore.progress }}</p>
    </div>

    <!-- Content -->
    <div
      v-if="currentDua"
      class="px-4 py-6"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- Arabic Text -->
      <div class="mb-8 text-center" dir="rtl">
        <p
          class="font-arabic leading-loose text-primary-400"
          :style="{ fontSize: `${duaStore.settings.arabic_font_size}px` }"
        >
          {{ currentDua.arabic }}
        </p>
      </div>

      <!-- Transliteration -->
      <div v-if="duaStore.settings.show_transliteration" class="mb-6">
        <p
          class="italic text-neutral-300 leading-relaxed"
          :style="{ fontSize: `${duaStore.settings.transliteration_font_size}px` }"
        >
          {{ currentDua.transliteration }}
        </p>
      </div>

      <!-- Translation -->
      <div v-if="duaStore.settings.show_translation" class="mb-6">
        <p
          class="text-neutral-100 leading-relaxed"
          :style="{ fontSize: `${duaStore.settings.translation_font_size}px` }"
        >
          {{ currentDua.translation }}
        </p>
      </div>

      <!-- Virtue -->
      <div v-if="duaStore.settings.show_virtue && currentDua.virtue" class="mb-6 bg-neutral-800/50 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <Icon name="star" size="sm" class="text-amber-400" />
          <h3 class="text-sm font-semibold text-amber-400">Virtue</h3>
        </div>
        <p class="text-sm text-neutral-300 leading-relaxed">{{ currentDua.virtue }}</p>
      </div>

      <!-- Reference -->
      <div v-if="duaStore.settings.show_reference && currentDua.reference" class="mb-6">
        <div class="flex items-center gap-2">
          <Icon name="book" size="sm" class="text-neutral-500" />
          <p class="text-sm text-neutral-500">{{ currentDua.reference }}</p>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 p-4">
      <div class="flex items-center justify-between">
        <!-- Previous -->
        <button
          @click="previousDua"
          :disabled="!duaStore.hasPrevious"
          class="p-3 rounded-xl hover:bg-neutral-800 disabled:opacity-30"
        >
          <Icon name="chevronLeft" size="lg" />
        </button>

        <!-- Counter (if has repetitions) -->
        <div v-if="currentDua?.repetitions > 1" class="text-center">
          <DuaCounter
            :target="currentDua.repetitions"
            :current="counter"
            @increment="incrementCounter"
          />
        </div>

        <!-- Center actions -->
        <div v-else class="flex items-center gap-4">
          <button @click="showExplanation = true" class="p-3 rounded-xl hover:bg-neutral-800">
            <Icon name="info" size="md" class="text-neutral-400" />
          </button>
          <button @click="share" class="p-3 rounded-xl hover:bg-neutral-800">
            <Icon name="share" size="md" class="text-neutral-400" />
          </button>
          <button @click="toggleFavorite" class="p-3 rounded-xl hover:bg-neutral-800">
            <Icon name="heart" size="md" :class="isFavorite ? 'text-red-500 fill-red-500' : 'text-neutral-400'" />
          </button>
        </div>

        <!-- Next -->
        <button
          @click="nextDua"
          :disabled="!duaStore.hasNext"
          class="p-3 rounded-xl hover:bg-neutral-800 disabled:opacity-30"
        >
          <Icon name="chevronRight" size="lg" />
        </button>
      </div>
    </div>

    <!-- Spacer -->
    <div class="h-24"></div>

    <!-- Settings Modal -->
    <DuaQuickSettings v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'
import DuaCounter from '@/components/dua/DuaCounter.vue'
import DuaQuickSettings from '@/components/dua/DuaQuickSettings.vue'

const route = useRoute()
const router = useRouter()
const duaStore = useDuaStore()

const showSettings = ref(false)
const showExplanation = ref(false)
const isFavorite = ref(false)
const counter = ref(0)

// Touch handling for swipe
let touchStartX = 0

const currentDua = computed(() => duaStore.currentDua)

async function loadData() {
  const categoryId = route.params.categoryId
  const duaIndex = parseInt(route.params.duaIndex)

  if (duaStore.currentCategory?.id !== categoryId) {
    await duaStore.loadCategory(categoryId)
  }
  duaStore.loadDuaByIndex(duaIndex)

  // Check favorite status
  if (currentDua.value) {
    isFavorite.value = await duaStore.isFavorite(currentDua.value.id)
  }

  // Reset counter
  counter.value = 0
}

function nextDua() {
  if (duaStore.hasNext) {
    duaStore.nextDua()
    router.replace(`/dua/category/${route.params.categoryId}/dua/${duaStore.currentDuaIndex}`)
    counter.value = 0
  }
}

function previousDua() {
  if (duaStore.hasPrevious) {
    duaStore.previousDua()
    router.replace(`/dua/category/${route.params.categoryId}/dua/${duaStore.currentDuaIndex}`)
    counter.value = 0
  }
}

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX
}

function handleTouchEnd(e) {
  const touchEndX = e.changedTouches[0].clientX
  const diff = touchStartX - touchEndX

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextDua()
    } else {
      previousDua()
    }
  }
}

function incrementCounter() {
  if (currentDua.value?.repetitions && counter.value < currentDua.value.repetitions) {
    counter.value++
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }
}

async function toggleFavorite() {
  if (currentDua.value) {
    isFavorite.value = await duaStore.toggleFavorite(currentDua.value.id)
  }
}

async function share() {
  if (currentDua.value && navigator.share) {
    try {
      await navigator.share({
        title: currentDua.value.title,
        text: `${currentDua.value.translation}\n\n- ${currentDua.value.reference}`
      })
    } catch (error) {
      console.log('Share cancelled')
    }
  }
}

onMounted(loadData)

watch(() => route.params.duaIndex, loadData)
</script>

<style scoped>
.font-arabic {
  font-family: 'Amiri', 'Traditional Arabic', serif;
}
</style>
```

---

### Task 2.8: Create DuaCounter

**File**: `src/components/dua/DuaCounter.vue`

```vue
<template>
  <div
    @click="$emit('increment')"
    class="relative w-20 h-20 cursor-pointer select-none"
  >
    <!-- Background circle -->
    <svg class="w-full h-full -rotate-90">
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        stroke-width="4"
        fill="none"
        class="text-neutral-700"
      />
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        stroke-width="4"
        fill="none"
        class="text-primary-500"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        stroke-linecap="round"
      />
    </svg>

    <!-- Counter text -->
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-2xl font-bold text-white">{{ current }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  target: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  }
})

defineEmits(['increment'])

const circumference = 2 * Math.PI * 36

const strokeDashoffset = computed(() => {
  const progress = props.current / props.target
  return circumference * (1 - progress)
})
</script>
```

---

### Task 2.9: Create DuaQuickSettings

**File**: `src/components/dua/DuaQuickSettings.vue`

```vue
<template>
  <div class="fixed inset-0 z-50" @click.self="$emit('close')">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>

    <!-- Modal -->
    <div class="absolute bottom-0 left-0 right-0 bg-neutral-800 rounded-t-3xl p-6 animate-slide-up">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-white">Quick Settings</h2>
        <button @click="$emit('close')" class="p-2 hover:bg-neutral-700 rounded-lg">
          <Icon name="x" size="md" class="text-white" />
        </button>
      </div>

      <!-- Arabic Font Size -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <Icon name="type" size="sm" class="text-primary-400" />
          <span class="text-white">Arabic Text Size</span>
          <span class="ml-auto text-neutral-400">{{ settings.arabic_font_size }}</span>
        </div>
        <input
          type="range"
          min="20"
          max="40"
          v-model.number="settings.arabic_font_size"
          @change="updateSettings"
          class="w-full accent-primary-500"
        />
      </div>

      <!-- Transliteration Font Size -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <Icon name="type" size="sm" class="text-neutral-400" />
          <span class="text-white">Text Size</span>
          <span class="ml-auto text-neutral-400">{{ settings.translation_font_size }}</span>
        </div>
        <input
          type="range"
          min="12"
          max="24"
          v-model.number="settings.translation_font_size"
          @change="updateSettings"
          class="w-full accent-primary-500"
        />
      </div>

      <!-- Toggles -->
      <div class="space-y-4">
        <label class="flex items-center justify-between">
          <span class="text-white">Show Transliteration</span>
          <input
            type="checkbox"
            v-model="settings.show_transliteration"
            @change="updateSettings"
            class="w-5 h-5 accent-primary-500"
          />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-white">Show Translation</span>
          <input
            type="checkbox"
            v-model="settings.show_translation"
            @change="updateSettings"
            class="w-5 h-5 accent-primary-500"
          />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-white">Show Virtue</span>
          <input
            type="checkbox"
            v-model="settings.show_virtue"
            @change="updateSettings"
            class="w-5 h-5 accent-primary-500"
          />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-white">Show Reference</span>
          <input
            type="checkbox"
            v-model="settings.show_reference"
            @change="updateSettings"
            class="w-5 h-5 accent-primary-500"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'

defineEmits(['close'])

const duaStore = useDuaStore()

const settings = reactive({
  arabic_font_size: 28,
  transliteration_font_size: 16,
  translation_font_size: 14,
  show_transliteration: true,
  show_translation: true,
  show_reference: true,
  show_virtue: true
})

function updateSettings() {
  duaStore.updateSettings({ ...settings })
}

onMounted(() => {
  Object.assign(settings, duaStore.settings)
})
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
```

---

### Task 2.10: Create DuaFavoritesView

**File**: `src/views/DuaFavoritesView.vue`

```vue
<template>
  <div class="dua-favorites min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <div class="bg-gradient-to-br from-red-500 to-pink-500 text-white px-4 pt-4 pb-6">
      <div class="flex items-center justify-between mb-2">
        <button @click="$router.back()" class="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Icon name="arrowLeft" size="md" class="text-white" />
        </button>
        <h1 class="text-xl font-bold">Favorite Duas</h1>
        <div class="w-10"></div>
      </div>
      <p class="text-white/80 text-sm">{{ duaStore.favorites.length }} saved</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="duaStore.favorites.length === 0" class="text-center py-20 px-4">
      <Icon name="heart" size="2xl" class="text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No favorites yet</h3>
      <p class="text-neutral-500 dark:text-neutral-400 text-sm">
        Tap the heart icon on any dua to save it here
      </p>
    </div>

    <!-- Favorites List -->
    <div v-else class="divide-y divide-neutral-200 dark:divide-neutral-800">
      <div
        v-for="dua in duaStore.favorites"
        :key="dua.id"
        @click="openDua(dua)"
        class="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
      >
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {{ dua.title }}
          </h4>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {{ dua.category_id }}
          </p>
        </div>
        <Icon name="chevronRight" size="sm" class="text-neutral-400" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDuaStore } from '@/stores/dua'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const duaStore = useDuaStore()
const isLoading = ref(true)

function openDua(dua) {
  // Find the index of this dua in its category
  // For simplicity, we'll open the category view
  router.push(`/dua/category/${dua.category_id}`)
}

onMounted(async () => {
  await duaStore.loadFavorites()
  isLoading.value = false
})
</script>
```

---

## Phase 3: Integration

### Task 3.1: Add to HomeView Quick Actions

**File**: `src/views/HomeView.vue`

Add to the `quickActions` array (after 'Ask' or before 'Browse'):

```javascript
{
  name: 'Dua',
  icon: 'hands',
  description: 'Daily adhkar',
  to: '/dua',
  badge: 'NEW',
  color: 'bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-800/20',
  iconBg: 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 dark:from-teal-500 dark:via-cyan-600 dark:to-blue-600',
  iconColor: 'text-white'
},
```

---

### Task 3.2: Add to Mobile Bottom Navigation (Optional)

**File**: `src/components/layout/MobileBottomNav.vue`

If this component exists, add a "Dua" tab. If it doesn't exist, consider adding the Dua feature as a prominent quick action instead.

---

## Testing Checklist

After implementation, verify:

- [ ] Database schema upgrades correctly
- [ ] Data imports without errors
- [ ] Categories display in grid (Main/Other tabs)
- [ ] Category detail shows all duas
- [ ] Dua detail shows Arabic, transliteration, translation
- [ ] Swipe navigation works
- [ ] Counter increments correctly
- [ ] Settings persist
- [ ] Favorites save/remove works
- [ ] Dark mode displays correctly
- [ ] RTL Arabic text renders properly

---

## Content Completion

After core features work, complete the remaining data files:
1. `evening.json`
2. `before-sleep.json`
3. `food-drink.json`
4. `adhan-masjid.json`
5. `waking-up.json`
6. `lavatory-wudu.json`
7. `nightmares.json`
8. `clothes.json`
9. `home.json`
10. `istikhara.json`
11. `difficulties.json`
12. `duas-ummah.json`

Each file follows the same structure as `morning.json`.

---

*Implementation Plan Version: 1.0*
*For: Sonnet implementation*
*Created: November 28, 2025*
