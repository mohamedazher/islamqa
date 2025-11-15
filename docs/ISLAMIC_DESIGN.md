# Islamic/Oriental Design Enhancement

This document describes the Islamic and Oriental design elements added to the IslamQA app to create an authentic, elegant experience for Muslim users.

## Overview

The app now features subtle Islamic geometric patterns, traditional color palettes inspired by Islamic architecture, and ornamental design elements that reflect Middle Eastern heritage while maintaining modern UX principles.

## Design Philosophy

**Balance**: Traditional Islamic aesthetics meet modern minimalism
**Subtlety**: Patterns enhance without overwhelming
**Authenticity**: Colors and motifs from Islamic architecture (Persian tiles, Ottoman palaces, Moroccan zellige)
**Readability**: All elements designed to maintain excellent content legibility

---

## 1. Background Patterns

### Subtle Islamic Geometric Pattern
A delicate 8-point star tessellation pattern appears as a fixed background across the entire app.

**Light Mode**: Black pattern at 2.5% opacity
**Dark Mode**: Golden pattern at 4% opacity

The pattern is implemented as an SVG data URL in the `body::before` pseudo-element (see `src/assets/styles/main.css:30-47`).

---

## 2. Color Palette

### New Islamic-Inspired Colors

**Persian Blue** (`persian.*`)
- Inspired by Persian tile work and mosaics
- Range: `#eff6ff` (50) to `#172554` (950)
- Main: `#2563eb` (600)

**Burgundy/Maroon** (`burgundy.*`)
- Inspired by Ottoman palaces and Persian carpets
- Range: `#fdf2f4` (50) to `#4a0920` (950)
- Main: `#d42960` (600)

**Turquoise** (`turquoise.*`)
- Inspired by Moroccan zellige and Turkish ceramics
- Range: `#f0fdfa` (50) to `#042f2e` (950)
- Main: `#14b8a6` (500)

**Existing Colors**:
- `primary.*` - Golden yellow (mosque domes)
- `accent.*` - Olive/sage green

See `tailwind.config.js:39-80` for full palette definitions.

---

## 3. Typography

### Amiri Font Family
Added the traditional Arabic serif font "Amiri" from Google Fonts for elegant Arabic text rendering.

**Usage**:
```html
<div class="font-arabic">النص العربي</div>
```

**Font Stack**: `'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif`

See `src/assets/styles/main.css:2` for font import.

---

## 4. Utility Classes

### Islamic Card Borders
```html
<Card islamic-border>Content</Card>
```
Adds corner ornaments with golden accents (see `main.css:183-212`).

### Islamic Card Style
```html
<Card islamic-style>Content</Card>
```
Adds subtle border with Islamic colors and hover elevation (see `main.css:288-299`).

### Hero Pattern Overlay
```html
<div class="islamic-hero-pattern bg-gradient-to-br from-primary-400 to-accent-500">
  <!-- Pattern overlay added automatically -->
</div>
```
Adds subtle Islamic geometric pattern to gradient backgrounds (see `main.css:246-263`).

### Ornamental Divider
```vue
<OrnamentalDivider spacing="my-8" />
```
Component renders a horizontal line with central star ornament (see `src/components/common/OrnamentalDivider.vue`).

### Corner Ornaments
```html
<div class="corner-ornament">Content</div>
```
Adds decorative 8-point star corners (see `main.css:214-244`).

### Arabic Text Styling
```html
<div class="arabic-text">
  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
</div>
```
Applies Amiri font, RTL direction, and proper Arabic text styling (see `main.css:301-308`).

---

## 5. Updated Gradients

Category cards now use Islamic architecture-inspired gradients:

1. **Golden to Olive** - Mosque domes
2. **Persian Blue** - Persian tiles
3. **Turquoise** - Moroccan zellige
4. **Burgundy to Rose** - Ottoman palaces
5. **Amber to Gold** - Islamic calligraphy
6. **Turquoise to Teal** - Turkish ceramics
7. **Persian Blue to Purple** - Royal palaces
8. **Olive to Emerald** - Islamic gardens

See `src/components/browse/CategoryCard.vue:152-171`.

---

## 6. Component Updates

### Card Component
New props:
- `islamic-border`: Boolean - Adds Islamic corner ornaments
- `islamic-style`: Boolean - Adds Islamic border and hover effects

### HomeView
- Hero section now includes `islamic-hero-pattern`
- Question of the Day card includes pattern overlay

### CategoryCard
- All gradient sections include `islamic-hero-pattern`
- Updated gradient colors to Islamic-inspired palette

---

## 7. Usage Examples

### Example 1: Islamic Border Card
```vue
<Card islamic-border padding="lg">
  <h3>Category Name</h3>
  <p>Description text</p>
</Card>
```

### Example 2: Hero Section with Pattern
```vue
<div class="bg-gradient-to-br from-persian-500 to-turquoise-500 islamic-hero-pattern text-white p-8 rounded-xl">
  <h1>Welcome</h1>
</div>
```

### Example 3: Ornamental Divider
```vue
<section>
  <h2>Section 1</h2>
  <OrnamentalDivider />
  <h2>Section 2</h2>
</section>
```

### Example 4: Arabic Content
```vue
<div class="arabic-text bg-white dark:bg-neutral-900 p-6 rounded-xl">
  <p>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
</div>
```

---

## 8. Dark Mode Support

All Islamic design elements fully support dark mode:

- Background pattern changes to golden in dark mode
- Corner ornaments adjust opacity
- Islamic borders use appropriate dark mode colors
- All new color palettes include dark variants (50-950)

Toggle dark mode via `useTheme()` composable.

---

## 9. File Reference

**Modified Files**:
- `tailwind.config.js` - Added Islamic color palettes and Arabic font
- `src/assets/styles/main.css` - Background patterns and utility classes
- `src/components/common/Card.vue` - Added Islamic style props
- `src/components/common/OrnamentalDivider.vue` - New component
- `src/views/HomeView.vue` - Applied Islamic patterns
- `src/components/browse/CategoryCard.vue` - Updated gradients and patterns

---

## 10. Performance

**Bundle Size Impact**: Minimal (~2KB added to main CSS)
**Load Time**: No noticeable impact (SVG patterns are inline data URLs)
**Rendering**: All patterns use CSS pseudo-elements (no extra DOM nodes)

---

## Design Credits

Inspired by:
- Persian tile mosaics (Isfahan, Iran)
- Ottoman palace decorations (Istanbul, Turkey)
- Moroccan zellige patterns (Fes, Morocco)
- Islamic geometric art and calligraphy
- Traditional Arabic typography (Amiri font)

---

**Last Updated**: November 15, 2025
**Version**: 2.0.13+
