#!/usr/bin/env node
/**
 * Fix duas with missing arabic, translation, or transliteration fields
 * Data sourced from Hisn al-Muslim reference text
 */

const fs = require('fs')
const path = require('path')

const DUA_DIR = path.join(__dirname, '../public/data/dua')

// Corrections for duas with missing fields
// Key format: "chapter_filename:dua_id" or just filename for single-dua chapters
const CORRECTIONS = {
  // Chapter 50 - Visiting sick (Hisn 149)
  "chapter_50_visiting_sick.json:149": {
    arabic: "مَنْ عَادَ مَرِيضاً، لَمْ يَزَلْ فِي خُرْفَةِ الْجَنَّةِ حَتَّى يَرْجِعَ",
    translation: "When a man goes to visit his sick Muslim brother, he walks along a path of Paradise until he sits, and when he sits he is cloaked in mercy.",
    reference: "At-Tirmidhi, Ibn Majah, Ahmad. See Al-Albani, Sahih At-Tirmidhi 2/210"
  },

  // Chapter 59 - After burying deceased
  "chapter_59_after_burying_deceased.json:1": {
    translation: "Ask Allah to forgive your brother and pray for him to be strengthened, for he is now being questioned.",
    reference: "Abu Dawud 3/315. Al-Hakim graded it authentic and Ath-Thahabi agreed 1/370"
  },

  // Chapter 68 - Breaking fast
  "chapter_68_breaking_fast.json:1": {
    translation: "The thirst is gone, the veins are moistened and the reward is confirmed if Allah wills.",
    transliteration: "Dhahaba aẓ-ẓama', wabtallati al-'urūq, wa thabata al-ajru in shā' Allāh"
  },
  "chapter_68_breaking_fast.json:2": {
    translation: "O Allah, for You I have fasted and with Your provision I have broken my fast.",
    transliteration: "Allāhumma laka ṣumtu wa 'alā rizqika afṭartu"
  },

  // Chapter 69 - Before eating
  "chapter_69_before_eating.json:178": {
    arabic: "بِسْمِ الله",
    translation: "In the Name of Allah."
  },
  "chapter_69_before_eating.json:179": {
    arabic: "بِسْمِ اللهِ أَوَّلَهُ وَآخِرَه",
    translation: "In the Name of Allah at the beginning and at the end of it."
  },

  // Chapter 71 - Ayat al-Kursi
  "chapter_71_ayat_al_kursi.json:1": {
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ"
  },

  // Chapter 72 - Intending to give food
  "chapter_72_intending_to_give_food_or_drink.json:183": {
    arabic: "اللّهُـمَّ أَطْعِمْ مَن أَطْعَمَني، وَاسْقِ مَن سَقاني",
    translation: "O Allah, feed the one who fed me and give drink to the one who gave me drink."
  },

  // Chapter 73 - Breaking fast in someone's home
  "chapter_73_breaking_fast_in_home.json:73_1": {
    translation: "May the fasting break their fast with you, may the pious eat your food, and may the angels pray for you."
  },

  // Chapter 74 - Fasting when presented with food
  "chapter_74_fasting_when_presented_with_food.json:1": {
    arabic: "إِنِّي صَائِمٌ",
    translation: "I am fasting."
  },

  // Chapter 77 - Upon sneezing
  "chapter_77_upon_sneezing.json:188": {
    transliteration: "Al-ḥamdu lillāh"
  },

  // Chapter 78 - Disbeliever sneezing
  "chapter_78_disbeliever_sneezing.json:189": {
    translation: "May Allah guide you and set your affairs in order."
  },

  // Chapter 80 - Wedding/animal purchase
  "chapter_80_wedding_animal_purchase.json:1": {
    translation: "O Allah, I ask You for the goodness within her and the goodness that You have made her inclined towards, and I seek refuge with You from the evil within her and the evil that You have made her inclined towards."
  },

  // Chapter 81 - Gratitude for blessings
  "chapter_81_gratitude_for_blessings.json:chapter_81_dua_1": {
    arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    translation: "O Allah, whatever blessing I or any of Your creation have risen upon, is from You alone without partner. So for You is all praise and unto You all thanks."
  },

  // Chapter 84 - At gathering
  "chapter_84_at_sitting_gathering.json:195": {
    translation: "Glory is to You, O Allah, and praise is to You. I bear witness that there is none worthy of worship but You. I seek Your forgiveness and turn to You in repentance."
  },

  // Chapter 85 - Expiation of sins
  "chapter_85_expiation_of_sins.json:1": {
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    translation: "Glory is to You, O Allah, and praise is to You. I bear witness that there is none worthy of worship but You. I seek Your forgiveness and turn to You in repentance."
  },

  // Chapter 89 - Love for Allah's sake
  "chapter_89_love_for_allahs_sake.json:200": {
    translation: "I love you for the sake of Allah."
  },

  // Chapter 91 - Settling debt
  "chapter_91_settling_debt.json:1": {
    arabic: "بارَكَ اللهُ لَكَ في أَهْلِكَ وَمالِك",
    transliteration: "Bārakallāhu laka fī ahlika wa mālik"
  },

  // Chapter 95 - Mounting transport
  "chapter_95_mounting_animal_transport.json:1": {
    translation: "In the Name of Allah. Praise is to Allah. Glory is to Him Who has provided this for us though we could never have had it by our efforts. Surely, unto our Lord we are returning."
  },

  // Chapter 97 - Entering town
  "chapter_97_entering_town_village.json:1": {
    translation: "O Allah, Lord of the seven heavens and all that they envelop, Lord of the seven earths and all that they carry, Lord of the devils and all whom they misguide, Lord of the winds and all whom they whisk away. I ask You for the goodness of this town, and the goodness of its people and for all the goodness found within it. I seek refuge with You from the evil of this town, the evil of its people and from all the evil found within it."
  },

  // Chapter 98 - Entering market
  "chapter_98_entering_market.json:1": {
    translation: "There is none worthy of worship but Allah alone, Who has no partner. His is the dominion and His is the praise. He gives life and He causes death, and He is living and does not die. In His Hand is all good, and He has power over all things."
  },

  // Chapter 99 - Animal stumbles
  "chapter_99_mounted_animal_stumbles.json:1": {
    translation: "In the Name of Allah."
  },

  // Chapter 105 - Waking up from sleep
  "chapter_105_waking_up_from_sleep.json:1": {
    arabic: "الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    translation: "Praise is to Allah Who gives us life after He has caused us to die, and unto Him is the resurrection."
  },

  // Chapter 107 - Prayers upon Prophet
  "chapter_107_excellence_sending_prayers_upon_prophet.json:1": {
    translation: "Whoever sends prayers upon me once, Allah sends prayers upon him tenfold.",
    transliteration: "Man ṣallā 'alayya ṣalātan wāḥidatan, ṣallā Allāhu 'alayhi bihā 'ashran"
  },
  "chapter_107_excellence_sending_prayers_upon_prophet.json:2": {
    translation: "Do not make my grave a place of festivity, and send prayers upon me for your prayers reach me wherever you are.",
    transliteration: "Lā taj'alū qabrī 'īdan, wa ṣallū 'alayya fa'inna ṣalātakum tabluġhunī ḥaythu kuntum"
  },
  "chapter_107_excellence_sending_prayers_upon_prophet.json:3": {
    translation: "The miser is the one in whose presence I am mentioned and he does not send prayers upon me.",
    transliteration: "Al-bakhīlu man dhukirtū 'indahu falam yuṣalli 'alayya"
  },
  "chapter_107_excellence_sending_prayers_upon_prophet.json:4": {
    translation: "Allah has angels who travel about the earth conveying to me the salutations of my Ummah.",
    transliteration: "Inna lillāhi malā'ikatan sayyāḥīna fil-arḍi yuballighūnī min ummatī as-salām"
  },
  "chapter_107_excellence_sending_prayers_upon_prophet.json:5": {
    translation: "No one sends prayers upon me but Allah returns my soul to me so that I may return his greeting.",
    transliteration: "Mā min aḥadin yusallimū 'alayya illā radda Allāhu 'alayya rūḥī ḥattā arudda 'alayhi as-salām"
  },

  // Chapter 109 - Greeting disbeliever
  "chapter_109_greeting_disbeliever.json:1": {
    translation: "And upon you (when a disbeliever says 'Peace be upon you', respond with this)."
  },

  // Chapter 115 - Apprehensiveness sleep
  "chapter_115_apprehensiveness_sleep.json:1": {
    arabic: "يَقُومُ يُصَلِّي إِنْ أَرَادَ ذَلِكَ",
    translation: "Get up and pray if you desire to do so."
  },

  // Chapter 125 - Seeking refuge
  "chapter_125_seeking_refuge_in_allah.json:1": {
    arabic: "اللهُ اللهُ رَبِّي لا أُشْـرِكُ بِهِ شَيْـئاً",
    translation: "Allah, Allah is my Lord. I do not associate anything with Him.",
    transliteration: "Allāh, Allāhu Rabbī lā ushriku bihi shay'ā"
  },

  // Chapter 128 - Ward off devils
  "chapter_128_ward_off_devils.json:1": {
    translation: "Allah is sufficient for us and the best of those on whom to depend."
  },

  // Chapter 129 - Fear of rulers
  "chapter_129_fear_of_rulers_injustice.json:129_1": {
    translation: "O Allah, Lord of the seven heavens and Lord of the Magnificent Throne, be a shelter for me from so-and-so son of so-and-so and his allies from among Your creatures, lest any of them abuse me or do me wrong. Mighty is Your patronage and glorious are Your praises. There is none worthy of worship but You.",
    transliteration: "Allāhumma Rabba as-samāwāti as-sab', wa Rabba al-'arshi al-'aẓīm, kun lī jāran min fulānibni fulān, wa aḥzābihi min khalā'iqik, an yafruṭa 'alayya aḥadun minhum aw yaṭghā, 'azza jāruk, wa jalla thanā'uk, wa lā ilāha illā ant"
  },

  // Chapter 131 - Against enemies
  "chapter_131_against_enemies.json:1": {
    arabic: "اللَّهُمَّ مُنْزِلَ الْكِتَابِ سَرِيعَ الْحِسَابِ اهْزِمِ الأَحْزَابَ اللَّهُمَّ اهْزِمْهُمْ وَزَلْزِلْهُمْ",
    translation: "O Allah, Revealer of the Book, Swift to account, defeat the groups (of disbelievers). O Allah, defeat them and shake them."
  }
}

function applyCorrections() {
  console.log('🔧 Fixing duas with missing content...\n')

  let fixed = 0
  const files = fs.readdirSync(DUA_DIR).filter(f => f.startsWith('chapter_') && f.endsWith('.json'))

  for (const file of files) {
    const filePath = path.join(DUA_DIR, file)
    let content
    try {
      content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch (e) {
      continue
    }

    if (!Array.isArray(content)) continue

    let modified = false
    for (const dua of content) {
      const key = `${file}:${dua.id}`
      const correction = CORRECTIONS[key]

      if (correction) {
        if (correction.arabic && (!dua.arabic || dua.arabic.trim() === '')) {
          dua.arabic = correction.arabic
          modified = true
        }
        if (correction.translation && (!dua.translation || dua.translation.trim() === '')) {
          dua.translation = correction.translation
          modified = true
        }
        if (correction.transliteration && (!dua.transliteration || dua.transliteration.trim() === '')) {
          dua.transliteration = correction.transliteration
          modified = true
        }
        if (correction.reference) {
          dua.reference = correction.reference
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2))
      console.log(`  ✓ Fixed ${file}`)
      fixed++
    }
  }

  console.log(`\n📊 Fixed ${fixed} files`)
  console.log('\n✅ Done! Now run: node scripts/build-dua-data.js')
}

applyCorrections()
