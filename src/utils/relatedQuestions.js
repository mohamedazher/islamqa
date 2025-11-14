/**
 * Extract related question references from answer HTML content
 * @param {string} answerHtml - The HTML content of the answer
 * @returns {Array<number>} - Array of unique question references
 */
export function extractRelatedQuestions(answerHtml) {
  if (!answerHtml) return []

  const references = new Set()

  // Pattern 1: https://islamqa.info/en/answers/{reference}
  const pattern1 = /islamqa\.info\/en\/answers\/(\d+)/g
  let match
  while ((match = pattern1.exec(answerHtml)) !== null) {
    references.add(parseInt(match[1]))
  }

  // Pattern 2: /en/answers/{reference} (relative links)
  const pattern2 = /\/en\/answers\/(\d+)/g
  while ((match = pattern2.exec(answerHtml)) !== null) {
    references.add(parseInt(match[1]))
  }

  // Convert Set to Array and return
  return Array.from(references)
}

/**
 * Get related questions with their full data
 * @param {string} answerHtml - The HTML content of the answer
 * @param {Function} getQuestionFn - Function to fetch question by reference
 * @param {number} currentQuestionRef - Current question reference to exclude
 * @param {number} limit - Maximum number of related questions to return
 * @returns {Promise<Array>} - Array of related question objects
 */
export async function getRelatedQuestionsData(answerHtml, getQuestionFn, currentQuestionRef, limit = 5) {
  const references = extractRelatedQuestions(answerHtml)

  // Filter out the current question
  const filteredRefs = references.filter(ref => ref !== currentQuestionRef)

  // Limit the number of related questions
  const limitedRefs = filteredRefs.slice(0, limit)

  // Fetch question data for each reference
  const relatedQuestions = []
  for (const ref of limitedRefs) {
    try {
      const question = await getQuestionFn(ref)
      if (question) {
        relatedQuestions.push(question)
      }
    } catch (error) {
      console.warn(`Failed to load related question ${ref}:`, error)
    }
  }

  return relatedQuestions
}
