import { describe, expect, test, vi } from 'vitest'
import { DexieDatabase } from '../src/services/dexieDatabase.js'

describe('Dexie runtime schema and guarded quiz import', () => {
  test('folder_questions exposes the compound index used by bookmark operations', () => {
    const db = new DexieDatabase()
    const table = db.tables.find(candidate => candidate.name === 'folder_questions')
    const compoundIndex = table.schema.indexes.find(index => index.name === '[reference+folder_id]')

    expect(compoundIndex).toBeDefined()
    expect(compoundIndex.compound).toBe(true)
    expect(compoundIndex.keyPath).toEqual(['reference', 'folder_id'])
    db.close()
  })

  test('bulk quiz import rejects invalid references and deterministic duplicates before bulkPut', async () => {
    const db = new DexieDatabase()
    const bulkPut = vi.fn().mockResolvedValue(undefined)
    db.quiz_questions = { bulkPut }

    const imported = await db.bulkImportQuizQuestions([
      { reference: 42, questionText: 'first' },
      { reference: 42, questionText: 'duplicate' },
      { reference: null, questionText: 'invalid' },
      { reference: 43, questionText: 'second' }
    ])

    expect(imported).toBe(2)
    expect(bulkPut).toHaveBeenCalledWith([
      expect.objectContaining({ reference: 42, questionText: 'first' }),
      expect.objectContaining({ reference: 43, questionText: 'second' })
    ])
    db.close()
  })
})
