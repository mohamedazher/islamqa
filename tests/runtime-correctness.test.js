import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const dbMock = vi.hoisted(() => ({
  isImported: vi.fn(),
  getImportedDataVersion: vi.fn(),
  importCategories: vi.fn(),
  importQuestions: vi.fn(),
  bulkImportQuizQuestions: vi.fn(),
  importDuaCategories: vi.fn(),
  importDuas: vi.fn(),
  importSummaries: vi.fn(),
  importEmbeddings: vi.fn(),
  markAsImported: vi.fn(),
  getStats: vi.fn(),
  hasAiData: vi.fn(),
  hasDuaData: vi.fn()
}))

vi.mock('../src/services/dexieDatabase.js', () => ({ default: dbMock }))

import dataLoader from '../src/services/dataLoader.js'
import QuizService from '../src/services/quizService.js'

function mockOptionalDataAsEmpty() {
  vi.spyOn(dataLoader, 'loadQuizQuestions').mockResolvedValue([])
  vi.spyOn(dataLoader, 'loadDuaCategories').mockResolvedValue([])
  vi.spyOn(dataLoader, 'loadAllDuas').mockResolvedValue([])
  vi.spyOn(dataLoader, 'loadDuaEmbeddings').mockResolvedValue({})
  vi.spyOn(dataLoader, 'loadAiSummaries').mockResolvedValue({})
  vi.spyOn(dataLoader, 'loadAiEmbeddings').mockResolvedValue({})
}

describe('Q&A import completion safety and versioning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbMock.getStats.mockResolvedValue({ categories: 1, questions: 1 })
    dbMock.importCategories.mockResolvedValue(undefined)
    dbMock.importQuestions.mockResolvedValue(undefined)
    dbMock.markAsImported.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('does not mark a fresh import complete when required questions fail to load', async () => {
    dbMock.isImported.mockResolvedValue(false)
    dbMock.getImportedDataVersion.mockResolvedValue(null)
    vi.spyOn(dataLoader, 'loadMetadata').mockResolvedValue({ version: '3.0.1' })
    vi.spyOn(dataLoader, 'loadCategories').mockResolvedValue([{ reference: 1 }])
    vi.spyOn(dataLoader, 'loadQuestions').mockRejectedValue(new Error('questions download failed'))

    await expect(dataLoader.loadAndImport()).rejects.toThrow('questions download failed')
    expect(dbMock.importCategories).toHaveBeenCalledOnce()
    expect(dbMock.importQuestions).not.toHaveBeenCalled()
    expect(dbMock.markAsImported).not.toHaveBeenCalled()
  })

  test('reimports core content and records metadata version when installed data is stale', async () => {
    dbMock.isImported.mockResolvedValue(true)
    dbMock.getImportedDataVersion.mockResolvedValue('2.0.0')
    vi.spyOn(dataLoader, 'loadMetadata').mockResolvedValue({ version: '3.0.1' })
    vi.spyOn(dataLoader, 'loadCategories').mockResolvedValue([{ reference: 1 }])
    vi.spyOn(dataLoader, 'loadQuestions').mockResolvedValue([{ reference: 10 }])
    mockOptionalDataAsEmpty()

    await expect(dataLoader.loadAndImport()).resolves.toBe(true)

    expect(dbMock.importCategories).toHaveBeenCalledWith([{ reference: 1 }], expect.any(Function))
    expect(dbMock.importQuestions).toHaveBeenCalledWith([{ reference: 10 }], expect.any(Function))
    expect(dbMock.markAsImported).toHaveBeenCalledWith('3.0.1')
  })

  test('keeps a completed offline dataset usable when metadata cannot be fetched', async () => {
    dbMock.isImported.mockResolvedValue(true)
    dbMock.getImportedDataVersion.mockResolvedValue('3.0.1')
    dbMock.hasAiData.mockResolvedValue(true)
    dbMock.hasDuaData.mockResolvedValue(true)
    vi.spyOn(dataLoader, 'loadMetadata').mockRejectedValue(new Error('offline'))

    await expect(dataLoader.loadAndImport()).resolves.toBe(true)
    expect(dbMock.importCategories).not.toHaveBeenCalled()
    expect(dbMock.markAsImported).not.toHaveBeenCalled()
  })
})

function buildQuizDb() {
  const generated = [
    { reference: 1, difficulty: 'easy', questionText: 'Easy?', options: [{ isCorrect: true }, { isCorrect: false }] },
    { reference: 2, difficulty: 'medium', questionText: 'Medium?', options: [{ isCorrect: true }, { isCorrect: false }] },
    { reference: 3, difficulty: 'hard', questionText: 'Hard?', options: [{ isCorrect: true }, { isCorrect: false }] }
  ]
  const sources = new Map(generated.map(item => [item.reference, {
    reference: item.reference,
    primary_category: 10,
    categories: [10],
    question: `Source ${item.reference}`,
    answer: `Answer ${item.reference}`
  }]))
  const generatedByReference = new Map(generated.map(item => [item.reference, item]))

  return {
    getAllQuizQuestions: vi.fn().mockResolvedValue(generated),
    getQuestion: vi.fn(reference => Promise.resolve(sources.get(reference) || null)),
    getQuizQuestion: vi.fn(reference => Promise.resolve(generatedByReference.get(reference) || null)),
    getAllDescendantCategoryReferences: vi.fn().mockResolvedValue([10])
  }
}

describe('quiz difficulty behavior', () => {
  test.each([
    ['rapid fire', service => service.getRapidFireQuiz({ difficulty: 'easy' }), 'easy'],
    ['category', service => service.getCategoryQuiz(10, 10, 'hard'), 'hard'],
    ['custom', service => service.getCustomQuiz({ difficulty: 'medium', count: 10 }), 'medium']
  ])('%s resolves only generated questions of the selected difficulty', async (_name, run, expectedDifficulty) => {
    const service = new QuizService()
    service.db = buildQuizDb()
    service.shuffleArray = array => array

    const quiz = await run(service)

    expect(quiz.questions).toHaveLength(1)
    expect(quiz.questions[0].difficulty).toBe(expectedDifficulty)
  })
})
