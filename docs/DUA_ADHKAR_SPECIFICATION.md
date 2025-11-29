# Dua & Adhkar Feature Specification

## 1. Overview

This document provides a comprehensive specification for adding Dua (supplications) and Adhkar (remembrances) functionality to the BetterIslam Q&A app. The feature will allow users to access authentic Islamic duas and adhkar organized by categories and occasions.

### 1.1 Content Source
- **Primary Source**: [LifeWithAllah.com](https://lifewithallah.com/dhikr-dua/)
- **Content Type**: Curated collection of authentic duas and adhkar from sahih and hasan ahadith
- **Attribution**: Content sourced from LifeWithAllah.com with proper attribution

### 1.2 Reference Design
The UI/UX design is based on reference screenshots from an existing dua app (stored in `/dua_reference/`), featuring:
- Card-based category grid with illustrations
- Clean dua detail view with Arabic, transliteration, and translation
- Quick settings panel for text customization
- Bottom navigation and favorites functionality

---

## 2. Data Model

### 2.1 Database Schema (Dexie)

Add to `src/services/dexieDatabase.js`:

```javascript
// Version 3: Add Dua & Adhkar tables
this.version(3).stores({
  // ... existing tables ...

  // Dua & Adhkar tables
  dua_categories: 'id, parent_id, type, order',      // Categories/occasions
  duas: 'id, category_id, order',                     // Individual duas
  dua_favorites: '++id, dua_id',                      // User favorites
  dua_settings: 'key'                                 // User preferences
})
```

### 2.2 Data Structure

#### DuaCategory
```typescript
interface DuaCategory {
  id: string;                    // Unique identifier (e.g., "morning", "evening")
  title: string;                 // Display title (e.g., "Morning Adhkar")
  title_ar?: string;            // Arabic title (optional)
  description?: string;          // Brief description
  icon: string;                  // Icon name or emoji
  image?: string;               // Background illustration path
  color: string;                // Gradient color scheme
  parent_id: string | null;     // For nested categories (null for root)
  type: 'main' | 'other';       // Main adhkar vs other occasions
  order: number;                // Display order
  dua_count: number;            // Number of duas in category
}
```

#### Dua
```typescript
interface Dua {
  id: string;                    // Unique identifier
  category_id: string;           // Parent category
  title: string;                 // Descriptive title (e.g., "Ayat al-Kursi")
  title_ar?: string;            // Arabic title
  arabic: string;               // Full Arabic text
  transliteration: string;      // Romanized pronunciation
  translation: string;          // English meaning
  virtue?: string;              // Benefit/reward hadith
  reference: string;            // Hadith source (e.g., "Bukhari 614")
  repetitions?: number;         // Times to recite (default: 1)
  audio_url?: string;          // Audio recitation URL (future)
  order: number;                // Display order within category
  tags?: string[];             // Search tags
}
```

#### DuaSettings
```typescript
interface DuaSettings {
  arabic_font_size: number;      // Default: 28
  transliteration_font_size: number; // Default: 16
  translation_font_size: number; // Default: 14
  show_transliteration: boolean; // Default: true
  show_translation: boolean;     // Default: true
  show_reference: boolean;       // Default: true
  show_virtue: boolean;          // Default: true
  theme: 'default' | 'dark' | 'sepia'; // Reader theme
}
```

---

## 3. Content Categories

### 3.1 Main Adhkar (Primary Tab)
| ID | Title | Description | Dua Count |
|----|-------|-------------|-----------|
| `duas-ummah` | Du'as for the Ummah | Prayers for the Muslim community | 5+ |
| `morning` | Morning Adhkar | Daily morning remembrances | 24 |
| `evening` | Evening Adhkar | Daily evening remembrances | 24 |
| `before-sleep` | Before Sleep | Bedtime supplications | 18 |
| `after-salah` | After Salah | Post-prayer adhkar | 15+ |

### 3.2 Other Adhkar (Secondary Tab)
| ID | Title | Description |
|----|-------|-------------|
| `waking-up` | Waking Up | Upon waking from sleep |
| `nightmares` | Nightmares | After bad dreams |
| `clothes` | Clothes | Dressing/undressing |
| `lavatory-wudu` | Lavatory & Wudu | Bathroom and ablution |
| `food-drink` | Food & Drink | Before/after eating |
| `home` | Home | Entering/leaving home |
| `adhan-masjid` | Adhan & Masjid | Prayer call and mosque |
| `istikhara` | Istikharah | Guidance prayer |
| `difficulties` | Difficulties & Distress | During hardship |
| `travel` | Travel | Journey supplications |
| `gatherings` | Gatherings | Social situations |
| `weather` | Weather | Rain, wind, thunder |
| `sick` | Visiting the Sick | For illness |
| `death` | Death & Funeral | Condolences |

---

## 4. UI Components

### 4.1 Views (Pages)

#### DuaHomeView.vue (`/dua`)
Main entry point with:
- Tab toggle: "Main" | "Other"
- Category grid (2 columns mobile, 4 desktop)
- Category cards with:
  - Illustration/icon
  - Title
  - Subtitle with dua count
- Bottom navigation integration

#### DuaCategoryView.vue (`/dua/category/:id`)
Category detail page with:
- Header with category title
- "Related Articles" link (optional)
- Numbered list of duas
- "Play All" button (future audio)
- "Favorite" entire category option
- Search within category

#### DuaDetailView.vue (`/dua/:categoryId/:duaId`)
Individual dua display:
- Progress indicator (e.g., "8/24")
- Title with progress bar
- Arabic text (large, centered)
- Transliteration (italic)
- Translation (regular)
- Virtue section (collapsible)
- Reference section
- Bottom actions:
  - Play audio (future)
  - Info/explanation modal
  - Counter (for repetitions)
  - Share
  - Favorite

### 4.2 Components

#### DuaCategoryCard.vue
```vue
<template>
  <Card
    clickable
    @click="$emit('click')"
    class="relative overflow-hidden h-32"
    :class="colorClasses"
  >
    <div class="absolute inset-0 opacity-30">
      <img :src="image" class="w-full h-full object-cover" />
    </div>
    <div class="relative p-4">
      <h3 class="text-lg font-bold text-white">{{ title }}</h3>
      <p class="text-sm text-white/80">{{ duaCount }} duas</p>
    </div>
  </Card>
</template>
```

#### DuaListItem.vue
```vue
<template>
  <div class="flex items-center gap-4 py-4 border-b border-neutral-200 dark:border-neutral-700">
    <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
      <span class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ order }}</span>
    </div>
    <div class="flex-1">
      <h4 class="font-semibold text-neutral-900 dark:text-neutral-100">{{ title }}</h4>
    </div>
    <Icon name="chevronRight" class="text-neutral-400" />
  </div>
</template>
```

#### DuaReader.vue
Core dua display component with:
- Configurable text sizes
- RTL Arabic text support
- Expandable virtue/reference sections
- Swipe navigation between duas

#### DuaQuickSettings.vue
Slide-up modal for:
- Arabic text size slider
- Transliteration text size slider
- Translation text size slider
- Reader theme selection
- Toggle visibility of sections

#### DuaCounter.vue
Circular counter for repetitions:
- Shows current count / target
- Tap to increment
- Visual progress ring
- Haptic feedback (mobile)

---

## 5. Features

### 5.1 Core Features (MVP)
1. **Browse Categories**: Navigate main and other adhkar categories
2. **View Duas**: Read individual duas with Arabic, transliteration, translation
3. **Favorites**: Mark favorite duas for quick access
4. **Text Settings**: Customize font sizes for readability
5. **Progress Tracking**: Know position within a category (8/24)
6. **Swipe Navigation**: Swipe left/right between duas

### 5.2 Future Enhancements
1. **Audio Playback**: Listen to recitations
2. **Daily Reminder**: Push notifications for morning/evening adhkar
3. **Streak Tracking**: Track daily adhkar completion
4. **Search**: Search across all duas
5. **Offline Mode**: Full offline functionality (already supported)
6. **Widget**: iOS/Android home screen widget for quick access

---

## 6. Navigation & Routing

### 6.1 Routes
```javascript
// Add to src/router/index.js
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
  path: '/dua/category/:categoryId/dua/:duaId',
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

### 6.2 Bottom Navigation Integration
Add "Dua" tab to mobile bottom navigation:
- Icon: `hands-praying` or custom dua icon
- Label: "Dua"
- Position: Between "Browse" and "Quiz"

### 6.3 Quick Actions Integration
Add to HomeView.vue quick actions:
```javascript
{
  name: 'Dua',
  icon: 'prayer',  // New icon needed
  description: 'Daily adhkar',
  to: '/dua',
  color: 'bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-800/20',
  iconBg: 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500',
  iconColor: 'text-white'
}
```

---

## 7. Data Files

### 7.1 File Structure
```
public/data/
├── dua/
│   ├── categories.json       # All categories
│   ├── morning.json          # Morning adhkar
│   ├── evening.json          # Evening adhkar
│   ├── before-sleep.json     # Sleep adhkar
│   ├── food-drink.json       # Food duas
│   ├── adhan-masjid.json     # Masjid duas
│   └── ... (other categories)
```

### 7.2 Sample Data Format

#### categories.json
```json
{
  "categories": [
    {
      "id": "morning",
      "title": "Morning Adhkar",
      "title_ar": "أذكار الصباح",
      "description": "Daily morning remembrances after Fajr",
      "icon": "sun",
      "color": "from-amber-400 to-orange-500",
      "type": "main",
      "order": 1,
      "dua_count": 24
    }
  ]
}
```

#### morning.json
```json
{
  "category_id": "morning",
  "duas": [
    {
      "id": "morning-1",
      "title": "Ayat al-Kursi: The Greatest Protection",
      "title_ar": "آية الكرسي",
      "arabic": "أَعُوْذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيْمِ. اَللّٰهُ لَآ إِلٰهَ إِلَّا هُوَ الْحَىُّ الْقَيُّوْمُ...",
      "transliteration": "Aʿūdhu bi-llāhi mina-sh-Shayṭāni-r-rajīm. Allāhu lā ilāha illā Huwa-l-Ḥayyu-l-Qayyūm...",
      "translation": "I seek the protection of Allah from the accursed Shayṭān. Allah, there is no god worthy of worship but He, the Ever Living, The Sustainer of all...",
      "virtue": "In Sūrah al-Baqarah, there is a verse which is the best verse of the Qur'ān... it is never recited in a house except that the Shaytān leaves: it is Āyah al-Kursī",
      "reference": "Ḥākim 2064, Bukhārī 2311",
      "repetitions": 1,
      "order": 1
    }
  ]
}
```

---

## 8. Services

### 8.1 duaService.js
```javascript
// src/services/duaService.js

import dexieDb from './dexieDatabase'

class DuaService {
  // Categories
  async getCategories(type = null) { }
  async getCategory(id) { }

  // Duas
  async getDuasByCategory(categoryId) { }
  async getDua(duaId) { }
  async searchDuas(query) { }

  // Favorites
  async getFavorites() { }
  async addFavorite(duaId) { }
  async removeFavorite(duaId) { }
  async isFavorite(duaId) { }

  // Settings
  async getSettings() { }
  async updateSettings(settings) { }

  // Import
  async importDuaData() { }
}

export default new DuaService()
```

### 8.2 duaDataLoader.js
```javascript
// src/services/duaDataLoader.js

class DuaDataLoader {
  async loadAndImport(onProgress) {
    // 1. Load categories.json
    // 2. Load each category's duas
    // 3. Bulk import to Dexie
    // 4. Mark as imported
  }
}
```

---

## 9. Store (Pinia)

### 9.1 duaStore.js
```javascript
// src/stores/dua.js

import { defineStore } from 'pinia'
import duaService from '@/services/duaService'

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
    isImported: false
  }),

  getters: {
    mainCategories: (state) => state.categories.filter(c => c.type === 'main'),
    otherCategories: (state) => state.categories.filter(c => c.type === 'other'),
    currentDua: (state) => state.currentDuas[state.currentDuaIndex],
    progress: (state) => `${state.currentDuaIndex + 1}/${state.currentDuas.length}`
  },

  actions: {
    async initialize() { },
    async loadCategories() { },
    async loadCategory(id) { },
    async loadDua(categoryId, duaId) { },
    async toggleFavorite(duaId) { },
    async updateSettings(settings) { },
    nextDua() { },
    previousDua() { }
  }
})
```

---

## 10. Implementation Plan

### Phase 1: Foundation (Week 1)
1. Add database schema (version 3)
2. Create data files (categories + at least 3 categories of duas)
3. Implement duaService.js
4. Implement duaDataLoader.js
5. Add routes to router

### Phase 2: Core UI (Week 2)
1. Create DuaHomeView.vue
2. Create DuaCategoryView.vue
3. Create DuaDetailView.vue
4. Create supporting components
5. Add navigation integration

### Phase 3: Features (Week 3)
1. Implement favorites functionality
2. Add text settings customization
3. Implement swipe navigation
4. Add counter for repetitions
5. Polish and animations

### Phase 4: Content & Testing (Week 4)
1. Complete all category data files
2. Test all flows
3. Performance optimization
4. Dark mode testing
5. Mobile responsiveness testing

---

## 11. Files to Create/Modify

### New Files
```
src/
├── views/
│   ├── DuaHomeView.vue
│   ├── DuaCategoryView.vue
│   ├── DuaDetailView.vue
│   └── DuaFavoritesView.vue
├── components/
│   └── dua/
│       ├── DuaCategoryCard.vue
│       ├── DuaListItem.vue
│       ├── DuaReader.vue
│       ├── DuaQuickSettings.vue
│       └── DuaCounter.vue
├── services/
│   ├── duaService.js
│   └── duaDataLoader.js
├── stores/
│   └── dua.js
public/
└── data/
    └── dua/
        ├── categories.json
        ├── morning.json
        ├── evening.json
        ├── before-sleep.json
        └── ... (more category files)
```

### Files to Modify
```
src/
├── services/dexieDatabase.js    # Add version 3 schema
├── router/index.js              # Add dua routes
├── views/HomeView.vue           # Add Dua quick action
├── components/layout/
│   └── MobileBottomNav.vue      # Add Dua tab
└── components/common/Icon.vue   # Add prayer/dua icon
```

---

## 12. Color Scheme (from Reference)

### Category Card Gradients
```javascript
const categoryColors = {
  'morning': 'from-sky-300 to-blue-400',
  'evening': 'from-orange-300 to-rose-400',
  'before-sleep': 'from-indigo-400 to-purple-500',
  'waking-up': 'from-amber-300 to-yellow-400',
  'food-drink': 'from-emerald-300 to-teal-400',
  'adhan-masjid': 'from-rose-300 to-pink-400',
  'home': 'from-green-300 to-emerald-400',
  'lavatory-wudu': 'from-cyan-300 to-blue-400',
  'clothes': 'from-purple-300 to-indigo-400',
  'nightmares': 'from-slate-400 to-gray-500',
  'istikhara': 'from-violet-300 to-purple-400',
  'difficulties': 'from-amber-400 to-orange-500'
}
```

---

## 13. Gamification Integration

### Points System
- Read a dua: +2 points
- Complete a category: +10 points
- Complete morning adhkar: +15 points
- Complete evening adhkar: +15 points
- 7-day adhkar streak: +50 points

### Achievements
- "First Dua": Read your first dua
- "Morning Person": Complete morning adhkar
- "Evening Devotee": Complete evening adhkar
- "Consistent": 7-day adhkar streak
- "Scholar": Read 100 different duas

---

## 14. Accessibility

1. **RTL Support**: Arabic text with proper right-to-left rendering
2. **Font Scaling**: User-adjustable text sizes
3. **High Contrast**: Dark mode with sufficient contrast
4. **Screen Reader**: Proper ARIA labels for navigation
5. **Touch Targets**: Minimum 44x44px tap targets

---

## 15. Analytics Events

```javascript
// Track dua feature usage
logEvent('dua_category_view', { category_id })
logEvent('dua_read', { dua_id, category_id })
logEvent('dua_favorite_add', { dua_id })
logEvent('dua_favorite_remove', { dua_id })
logEvent('dua_settings_change', { setting, value })
logEvent('dua_category_complete', { category_id })
```

---

## 16. Attribution

Content sourced from [LifeWithAllah.com](https://lifewithallah.com/dhikr-dua/) - "A beautiful app with a stunning modern design to help you read dhikr and duas on a daily basis and on key occasions."

Display attribution in:
1. Settings page
2. Dua detail view footer
3. About/Credits section

---

## Appendix A: Morning Adhkar Content (Sample)

| # | Title | Repetitions | Reference |
|---|-------|-------------|-----------|
| 1 | Ayat al-Kursi | 1x | Bukhari |
| 2 | Three Quls (Ikhlas, Falaq, Nas) | 3x | Tirmidhi 3575 |
| 3 | Sayyid al-Istighfar | 1x | Bukhari 6306 |
| 4 | Protect from Anxiety & Debt | 1x | Abu Dawud 1555 |
| 5 | Well-being in Dunya & Akhirah | 1x | Tirmidhi 3557 |
| 6 | Protect from Four Evils | 1x | Tirmidhi 3392 |
| 7 | Entrust Matters to Allah | 1x | - |
| 8 | Fulfill Obligation to Thank Allah | 1x | Abu Dawud 5073 |
| ... | ... | ... | ... |

---

## Appendix B: Before Sleep Adhkar Content (Sample)

| # | Title | Repetitions | Reference |
|---|-------|-------------|-----------|
| 1 | Surah al-Sajdah & al-Mulk | 1x | Tirmidhi 3404 |
| 2 | Ayat al-Kursi | 1x | Bukhari 2311 |
| 3 | Last Two Ayahs of al-Baqarah | 1x | Bukhari 4008 |
| 4 | Surah al-Kafirun | 1x | Tirmidhi 3403 |
| 5 | Three Quls with wiping | 3x | Bukhari 5017 |
| 6 | Tasbih, Tahmid, Takbir | 33+33+34 | Bukhari 3705 |
| ... | ... | ... | ... |

---

*Document Version: 1.0*
*Created: November 28, 2025*
*Author: Claude Code*
