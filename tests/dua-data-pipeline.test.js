import { describe, expect, test } from 'vitest'
import fs from 'fs'
import path from 'path'

const duaDir = path.join(process.cwd(), 'public/data/dua')
const read = name => JSON.parse(fs.readFileSync(path.join(duaDir, name), 'utf8'))

describe('Hisn al-Muslim generated data contract', () => {
  const categories = read('categories.json')
  const byCategory = read('duas.json')
  const duas = Object.values(byCategory).flat()

  test('preserves the existing organization and complete record count', () => {
    expect(categories).toHaveLength(133)
    expect(duas).toHaveLength(258)
    expect(Object.keys(byCategory)).toHaveLength(categories.length)
    for (const category of categories) {
      expect(byCategory[category.id]).toHaveLength(category.dua_count)
    }
  })

  test('has unique runtime IDs and preserves string source identifiers', () => {
    expect(new Set(duas.map(dua => dua.id)).size).toBe(duas.length)
    const hisn75a = duas.filter(dua => dua.source_identifier === '75a')
    expect(hisn75a).toHaveLength(2)
    expect(hisn75a.every(dua => dua.hisn_al_muslim_number === '75a')).toBe(true)
  })

  test('keeps both condolence texts without changing the legacy visible target', () => {
    const condolence = byCategory.chapter_57
    expect(condolence).toHaveLength(2)
    expect(condolence.map(dua => dua.id)).toEqual(['57_162_1', '57_162'])
    expect(condolence[1].translation).toContain('magnify your reward')
  })

  test('normalizes Arabic and records reviewable quality metadata', () => {
    for (const dua of duas) {
      expect(dua.arabic).toBe(dua.arabic.normalize('NFC'))
      expect(dua.arabic).not.toContain('\uFFFD')
      expect(dua.arabic_normalization).toBe('NFC')
      expect(dua.arabic_quality).toBeTypeOf('object')
      expect(dua.source_collection).toBe('Hisn al-Muslim')
    }
  })
})
