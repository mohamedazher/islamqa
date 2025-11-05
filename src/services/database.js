/**
 * Modern Database Service
 * Promise-based wrapper around Cordova SQLite
 */

class DatabaseService {
  constructor() {
    this.db = null
    this.isReady = false
    this.initPromise = null
  }

  /**
   * Initialize the database
   */
  async initialize() {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!window.cordova) {
        console.warn('⚠️  Cordova not available, using mock database for development')
        this.db = this.createMockDatabase()
        this.isReady = true
        resolve()
        return
      }

      // Open SQLite database
      this.db = window.sqlitePlugin.openDatabase({
        name: 'islamqa.db',
        location: 'default',
        androidDatabaseProvider: 'system'
      })

      // Create tables if they don't exist
      this.createTables()
        .then(() => {
          this.isReady = true
          console.log('✅ Database initialized successfully')
          resolve()
        })
        .catch(error => {
          console.error('❌ Database initialization failed:', error)
          reject(error)
        })
    })

    return this.initPromise
  }

  /**
   * Create all required tables
   */
  async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS CATEGORIES (
        id INTEGER PRIMARY KEY,
        category_links TEXT,
        category_url TEXT,
        element INTEGER,
        parent INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS QUESTIONS (
        id INTEGER PRIMARY KEY,
        category_id INTEGER,
        question TEXT COLLATE NOCASE,
        question_full TEXT COLLATE NOCASE,
        question_url TEXT,
        question_no INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS ANSWERS (
        id INTEGER,
        question_id INTEGER,
        answers TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS FOLDERS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folder_name TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS FOLDER_QUESTIONS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        folder_id INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS LATEST_QUESTIONS (
        id INTEGER PRIMARY KEY,
        category_id INTEGER,
        question TEXT,
        question_full TEXT,
        question_url TEXT,
        question_no INTEGER
      )`
    ]

    // Create indexes for faster searches
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_question_text ON QUESTIONS(question)`,
      `CREATE INDEX IF NOT EXISTS idx_category_id ON QUESTIONS(category_id)`,
      `CREATE INDEX IF NOT EXISTS idx_category_parent ON CATEGORIES(parent)`,
      `CREATE INDEX IF NOT EXISTS idx_answer_question ON ANSWERS(question_id)`,
      `CREATE INDEX IF NOT EXISTS idx_folder_questions ON FOLDER_QUESTIONS(folder_id)`
    ]

    try {
      await this.batchExecute([...tables, ...indexes])
    } catch (error) {
      console.error('Error creating tables:', error)
      throw error
    }
  }

  /**
   * Execute a single SQL query
   */
  async executeQuery(sql, params = []) {
    if (!this.isReady) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (tx, result) => {
            const rows = []
            for (let i = 0; i < result.rows.length; i++) {
              rows.push(result.rows.item(i))
            }
            resolve(rows)
          },
          (tx, error) => {
            console.error('SQL Error:', error, 'Query:', sql)
            reject(error)
          }
        )
      })
    })
  }

  /**
   * Execute multiple queries in a batch
   */
  async batchExecute(queries) {
    if (!this.isReady) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        queries.forEach(query => {
          const sql = typeof query === 'string' ? query : query.sql
          const params = typeof query === 'string' ? [] : query.params || []
          tx.executeSql(sql, params)
        })
      }, reject, resolve)
    })
  }

  /**
   * Get all categories
   */
  async getCategories(parentId = 0) {
    const sql = 'SELECT * FROM CATEGORIES WHERE parent = ? ORDER BY id'
    return this.executeQuery(sql, [parentId])
  }

  /**
   * Get category by ID
   */
  async getCategory(id) {
    const sql = 'SELECT * FROM CATEGORIES WHERE id = ?'
    const results = await this.executeQuery(sql, [id])
    return results[0] || null
  }

  /**
   * Get questions by category
   */
  async getQuestionsByCategory(categoryId, limit = 100, offset = 0) {
    const sql = `
      SELECT * FROM QUESTIONS
      WHERE category_id = ?
      ORDER BY id
      LIMIT ? OFFSET ?
    `
    return this.executeQuery(sql, [categoryId, limit, offset])
  }

  /**
   * Get question by ID
   */
  async getQuestion(id) {
    const sql = 'SELECT * FROM QUESTIONS WHERE id = ?'
    const results = await this.executeQuery(sql, [id])
    return results[0] || null
  }

  /**
   * Get answer for a question
   */
  async getAnswer(questionId) {
    const sql = 'SELECT * FROM ANSWERS WHERE question_id = ?'
    const results = await this.executeQuery(sql, [questionId])
    return results[0] || null
  }

  /**
   * Search questions
   */
  async searchQuestions(searchTerm, limit = 50) {
    const sql = `
      SELECT * FROM QUESTIONS
      WHERE question LIKE ? OR question_full LIKE ?
      ORDER BY id
      LIMIT ?
    `
    const term = `%${searchTerm}%`
    return this.executeQuery(sql, [term, term, limit])
  }

  /**
   * Get all questions (for fuzzy search initialization)
   */
  async getAllQuestions() {
    const sql = 'SELECT id, question, question_full, category_id FROM QUESTIONS'
    return this.executeQuery(sql)
  }

  /**
   * Get user folders
   */
  async getFolders() {
    const sql = 'SELECT * FROM FOLDERS ORDER BY folder_name'
    return this.executeQuery(sql)
  }

  /**
   * Create a new folder
   */
  async createFolder(folderName) {
    const sql = 'INSERT INTO FOLDERS (folder_name) VALUES (?)'
    await this.executeQuery(sql, [folderName])
  }

  /**
   * Add question to folder
   */
  async addQuestionToFolder(questionId, folderId) {
    // Check if already exists
    const checkSql = 'SELECT * FROM FOLDER_QUESTIONS WHERE question_id = ? AND folder_id = ?'
    const existing = await this.executeQuery(checkSql, [questionId, folderId])

    if (existing.length > 0) {
      return // Already bookmarked
    }

    const sql = 'INSERT INTO FOLDER_QUESTIONS (question_id, folder_id) VALUES (?, ?)'
    await this.executeQuery(sql, [questionId, folderId])
  }

  /**
   * Remove question from folder
   */
  async removeQuestionFromFolder(questionId, folderId) {
    const sql = 'DELETE FROM FOLDER_QUESTIONS WHERE question_id = ? AND folder_id = ?'
    await this.executeQuery(sql, [questionId, folderId])
  }

  /**
   * Get questions in a folder
   */
  async getQuestionsInFolder(folderId) {
    const sql = `
      SELECT q.* FROM QUESTIONS q
      INNER JOIN FOLDER_QUESTIONS fq ON q.id = fq.question_id
      WHERE fq.folder_id = ?
      ORDER BY fq.id DESC
    `
    return this.executeQuery(sql, [folderId])
  }

  /**
   * Check if database has data
   */
  async hasData() {
    const sql = 'SELECT COUNT(*) as count FROM QUESTIONS'
    const result = await this.executeQuery(sql)
    return result[0].count > 0
  }

  /**
   * Import categories from data array
   */
  async importCategories(categories) {
    const queries = categories.map(cat => ({
      sql: 'INSERT OR REPLACE INTO CATEGORIES (id, category_links, category_url, element, parent) VALUES (?, ?, ?, ?, ?)',
      params: [cat.id, cat.category_links, cat.category_url, cat.element, cat.parent]
    }))
    await this.batchExecute(queries)
  }

  /**
   * Import questions from data array
   */
  async importQuestions(questions) {
    const queries = questions.map(q => ({
      sql: 'INSERT OR REPLACE INTO QUESTIONS (id, category_id, question, question_full, question_url, question_no) VALUES (?, ?, ?, ?, ?, ?)',
      params: [q.id, q.category_id, q.question, q.question_full, q.question_url, q.question_no]
    }))
    await this.batchExecute(queries)
  }

  /**
   * Import answers from data array
   */
  async importAnswers(answers) {
    const queries = answers.map(a => ({
      sql: 'INSERT OR REPLACE INTO ANSWERS (id, question_id, answers) VALUES (?, ?, ?)',
      params: [a.id, a.question_id, a.answers]
    }))
    await this.batchExecute(queries)
  }

  /**
   * Create mock database for browser development
   */
  createMockDatabase() {
    console.log('🔧 Creating mock database for development')
    return {
      transaction: (callback, errorCallback, successCallback) => {
        const tx = {
          executeSql: (sql, params, success, error) => {
            console.log('Mock SQL:', sql, params)
            if (success) success(tx, { rows: { length: 0, item: () => ({}) } })
          }
        }
        try {
          callback(tx)
          if (successCallback) successCallback()
        } catch (err) {
          if (errorCallback) errorCallback(err)
        }
      }
    }
  }
}

// Export singleton instance
export const db = new DatabaseService()
export default db
