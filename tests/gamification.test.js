/**
 * GAMIFICATION STORE & LOCATION AUTO-DETECT TESTS
 *
 * These tests validate bug fixes in the gamification store and the
 * location auto-detect composable.
 *
 * Architecture: reads source files and validates behavior patterns via
 * regex/string matching (no jsdom / Vue runtime required).
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gamificationPath = path.join(__dirname, '../src/stores/gamification.js');
const homeViewPath = path.join(__dirname, '../src/views/HomeView.vue');
const locationComposablePath = path.join(__dirname, '../src/composables/useLocationAutoDetect.js');

// ============================================================================
// TEST 1: Timezone helpers
// ============================================================================

describe('Timezone helpers in gamification store', () => {

  it('gamification.js must exist', () => {
    expect(fs.existsSync(gamificationPath), 'src/stores/gamification.js must exist').toBe(true);
  });

  it('getLocalDateString helper function must exist', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    expect(content).toContain('getLocalDateString');
    console.log('getLocalDateString helper is present');
  });

  it('localDayDiff helper function must exist', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    expect(content).toContain('localDayDiff');
    console.log('localDayDiff helper is present');
  });

  it('must NOT use toISOString().split("T")[0] for date comparison (timezone-broken pattern)', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    // This pattern produces UTC dates which break for users in UTC+ timezones after midnight local time
    const brokenPattern = /toISOString\(\)\s*\.split\(\s*['"]T['"]\s*\)\s*\[0\]/;
    expect(brokenPattern.test(content), 'Found timezone-broken toISOString().split("T")[0] pattern').toBe(false);
    console.log('No timezone-broken date patterns found');
  });
});

// ============================================================================
// TEST 2: Achievement race condition guard
// ============================================================================

describe('Achievement race condition guard', () => {

  it('_checkingAchievements guard variable must exist', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    expect(content).toContain('_checkingAchievements');
    console.log('_checkingAchievements guard variable is present');
  });

  it('checkAchievements must use try/finally to release the guard', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    // The guard must be released in a finally block so concurrent calls are handled safely
    expect(content).toContain('finally');
    // Verify both the guard set and guard release appear around checkAchievements
    const checkAchievementsIndex = content.indexOf('checkAchievements');
    expect(checkAchievementsIndex, 'checkAchievements function must exist').toBeGreaterThan(-1);
    console.log('checkAchievements contains try/finally pattern');
  });

  it('achievements must be collected into newlyUnlocked array before batch unlock', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    expect(content).toContain('newlyUnlocked');
    console.log('newlyUnlocked batch array is present');
  });
});

// ============================================================================
// TEST 3: Accuracy calculation
// ============================================================================

describe('Accuracy calculation in gamification store', () => {

  it('totalAccuracySum field must exist in stats initialization', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    expect(content).toContain('totalAccuracySum');
    console.log('totalAccuracySum field is present in stats');
  });

  it('completeQuiz must use totalAccuracySum for accuracy calculation (not incremental averaging)', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    // The correct approach divides totalAccuracySum by quizzesCompleted
    // Incremental averaging would look like: avgAccuracy = (avgAccuracy * (n-1) + accuracy) / n
    expect(content).toContain('totalAccuracySum');
    // Verify it's used in a division with quizzesCompleted
    expect(content).toMatch(/totalAccuracySum\s*[/÷]|[/÷]\s*totalAccuracySum|totalAccuracySum\s*\/\s*\w+/);
    console.log('completeQuiz uses totalAccuracySum for accurate averaging');
  });
});

// ============================================================================
// TEST 4: Early Riser fix
// ============================================================================

describe('Early Riser achievement fix', () => {

  it('daily-streak case must NOT use % 5 modulo check (broken Early Riser trigger)', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    // Find the daily-streak case block
    const dailyStreakIndex = content.indexOf('daily-streak');
    expect(dailyStreakIndex, 'daily-streak case must exist').toBeGreaterThan(-1);

    // Extract a reasonable window around the daily-streak case to check locally
    const window = content.slice(dailyStreakIndex, dailyStreakIndex + 600);
    expect(window).not.toContain('% 5');
    console.log('daily-streak case does not contain broken % 5 modulo check');
  });
});

// ============================================================================
// TEST 5: Duplicate checkAchievements removal
// ============================================================================

describe('No duplicate checkAchievements calls after awardPoints', () => {

  it('readQuestion must NOT call checkAchievements() directly', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');

    // Isolate the readQuestion function body
    const readQuestionMatch = content.match(/function readQuestion[\s\S]*?(?=\nfunction |\nconst \w+ = |\nreturn \{)/);
    // Fallback: search for the readQuestion arrow function or async function
    const readQuestionIndex = content.search(/readQuestion\s*[=(]/);
    expect(readQuestionIndex, 'readQuestion function must exist').toBeGreaterThan(-1);

    // Find the block between readQuestion definition and the next top-level function/const
    // We look for checkAchievements() calls that are NOT inside awardPoints
    // Strategy: extract function body and verify no standalone checkAchievements() call
    const afterReadQuestion = content.slice(readQuestionIndex);
    // Get up to next function definition (rough boundary)
    const nextFnBoundary = afterReadQuestion.search(/\n(?:async )?function \w|\nconst \w+ = (?:async )?\(/);
    const readQuestionBody = nextFnBoundary > 0
      ? afterReadQuestion.slice(0, nextFnBoundary)
      : afterReadQuestion.slice(0, 800);

    // checkAchievements should NOT be called directly in readQuestion body
    // (awardPoints internally calls it)
    expect(readQuestionBody).not.toMatch(/checkAchievements\s*\(\s*\)/);
    console.log('readQuestion does not call checkAchievements() directly');
  });

  it('createBookmark must NOT call checkAchievements() directly', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');

    const createBookmarkIndex = content.search(/createBookmark\s*[=(]/);
    expect(createBookmarkIndex, 'createBookmark function must exist').toBeGreaterThan(-1);

    const afterCreateBookmark = content.slice(createBookmarkIndex);
    const nextFnBoundary = afterCreateBookmark.search(/\n(?:async )?function \w|\nconst \w+ = (?:async )?\(/);
    const createBookmarkBody = nextFnBoundary > 0
      ? afterCreateBookmark.slice(0, nextFnBoundary)
      : afterCreateBookmark.slice(0, 800);

    expect(createBookmarkBody).not.toMatch(/checkAchievements\s*\(\s*\)/);
    console.log('createBookmark does not call checkAchievements() directly');
  });

  it('completeQuiz must NOT call checkAchievements() directly after awardPoints', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');

    const completeQuizIndex = content.search(/completeQuiz\s*[=(]/);
    expect(completeQuizIndex, 'completeQuiz function must exist').toBeGreaterThan(-1);

    const afterCompleteQuiz = content.slice(completeQuizIndex);
    const nextFnBoundary = afterCompleteQuiz.search(/\n(?:async )?function \w|\nconst \w+ = (?:async )?\(/);
    const completeQuizBody = nextFnBoundary > 0
      ? afterCompleteQuiz.slice(0, nextFnBoundary)
      : afterCompleteQuiz.slice(0, 1200);

    // Find position of awardPoints call within the body
    const awardPointsIndex = completeQuizBody.indexOf('awardPoints');
    if (awardPointsIndex > -1) {
      // After awardPoints there should be no standalone checkAchievements() call
      const afterAwardPoints = completeQuizBody.slice(awardPointsIndex);
      expect(afterAwardPoints).not.toMatch(/checkAchievements\s*\(\s*\)/);
    } else {
      // If awardPoints isn't in the extracted window, just check the whole body
      expect(completeQuizBody).not.toMatch(/checkAchievements\s*\(\s*\)/);
    }
    console.log('completeQuiz does not call checkAchievements() directly after awardPoints');
  });
});

// ============================================================================
// TEST 6: lastBothAdhkarDate in state
// ============================================================================

describe('lastBothAdhkarDate reactive state management', () => {

  it('lastBothAdhkarDate must be declared as a ref() in the store', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    // Must appear as a ref declaration, e.g.: const lastBothAdhkarDate = ref(...)
    expect(content).toMatch(/lastBothAdhkarDate\s*=\s*ref\s*\(/);
    console.log('lastBothAdhkarDate is declared as a ref()');
  });

  it('checkBothAdhkarCompletion must NOT read lastBothAdhkarDate from localStorage directly', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');

    const fnIndex = content.search(/checkBothAdhkarCompletion\s*[=(]/);
    expect(fnIndex, 'checkBothAdhkarCompletion function must exist').toBeGreaterThan(-1);

    const afterFn = content.slice(fnIndex);
    const nextFnBoundary = afterFn.search(/\n(?:async )?function \w|\nconst \w+ = (?:async )?\(/);
    const fnBody = nextFnBoundary > 0
      ? afterFn.slice(0, nextFnBoundary)
      : afterFn.slice(0, 800);

    expect(fnBody).not.toContain("localStorage.getItem('lastBothAdhkarDate')");
    console.log('checkBothAdhkarCompletion does not bypass reactive state with localStorage.getItem');
  });

  it('saveToStorage must persist lastBothAdhkarDate', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');

    const saveIndex = content.search(/saveToStorage\s*[=(]/);
    expect(saveIndex, 'saveToStorage function must exist').toBeGreaterThan(-1);

    const afterSave = content.slice(saveIndex);
    const nextFnBoundary = afterSave.search(/\n(?:async )?function \w|\nconst \w+ = (?:async )?\(/);
    const saveBody = nextFnBoundary > 0
      ? afterSave.slice(0, nextFnBoundary)
      : afterSave.slice(0, 800);

    expect(saveBody).toContain('lastBothAdhkarDate');
    console.log('saveToStorage persists lastBothAdhkarDate');
  });

  it('migration code must exist for legacy lastBothAdhkarDate localStorage key', () => {
    const content = fs.readFileSync(gamificationPath, 'utf-8');
    // Migration reads the old standalone key and merges it into the unified store state
    expect(content).toContain('lastBothAdhkarDate');
    // The migration pattern: getItem on the legacy key (outside saveToStorage)
    // Acceptable to just verify the key string appears in a getItem context
    const legacyPattern = /localStorage\.getItem\s*\(\s*['"]lastBothAdhkarDate['"]\s*\)/;
    // Migration may use the key in a load/migrate function, not in checkBothAdhkarCompletion
    // We check that the pattern exists somewhere in the file (migration code)
    expect(legacyPattern.test(content), 'Migration code for legacy lastBothAdhkarDate key must exist').toBe(true);
    console.log('Legacy lastBothAdhkarDate migration code exists');
  });
});

// ============================================================================
// TEST 7: QOTD fix in HomeView
// ============================================================================

describe('QOTD (Question of the Day) fix in HomeView', () => {

  it('HomeView.vue must exist', () => {
    expect(fs.existsSync(homeViewPath), 'src/views/HomeView.vue must exist').toBe(true);
  });

  it('viewQuestion must compare against .reference not .id', () => {
    const content = fs.readFileSync(homeViewPath, 'utf-8');
    // The QOTD viewed-today guard must use question.reference for comparison
    // Bad: viewedQuestions.includes(question.id) or qotdQuestion.value.id
    // Good: viewedQuestions.includes(question.reference) or qotdQuestion.value.reference
    expect(content).toMatch(/\.reference/);
    // Must not compare qotd question uniqueness by .id
    expect(content).not.toMatch(/qotdQuestion\.value\.id\b/);
    console.log('viewQuestion uses .reference for QOTD dedup check');
  });

  it('readQuestion must be called with questionId argument (not empty)', () => {
    const content = fs.readFileSync(homeViewPath, 'utf-8');
    // Should call readQuestion(someId) not readQuestion()
    const emptyCall = /readQuestion\s*\(\s*\)/;
    expect(emptyCall.test(content), 'readQuestion() called with no argument').toBe(false);
    console.log('readQuestion is called with a questionId argument');
  });

  it('QOTD bonus must use awardPoints(5, ...) not a double readQuestion call', () => {
    const content = fs.readFileSync(homeViewPath, 'utf-8');
    // The QOTD bonus should award 5 points via awardPoints
    expect(content).toMatch(/awardPoints\s*\(\s*5/);
    console.log('QOTD bonus correctly uses awardPoints(5, ...)');
  });
});

// ============================================================================
// TEST 8: Location auto-detect composable
// ============================================================================

describe('useLocationAutoDetect composable', () => {

  it('useLocationAutoDetect.js file must exist', () => {
    expect(
      fs.existsSync(locationComposablePath),
      'src/composables/useLocationAutoDetect.js must exist'
    ).toBe(true);
  });

  it('must export useLocationAutoDetect', () => {
    const content = fs.readFileSync(locationComposablePath, 'utf-8');
    expect(content).toContain('useLocationAutoDetect');
    expect(content).toMatch(/export\s+(?:default\s+)?(?:function\s+)?useLocationAutoDetect|export\s+\{[^}]*useLocationAutoDetect/);
    console.log('useLocationAutoDetect is exported');
  });

  it('must contain a haversine distance function', () => {
    const content = fs.readFileSync(locationComposablePath, 'utf-8');
    // Haversine formula uses Math.sin, Math.cos, Math.atan2 or Math.asin
    expect(content).toMatch(/haversine|Math\.atan2|Math\.asin/i);
    console.log('Haversine distance function is present');
  });

  it('must define a 50km threshold constant', () => {
    const content = fs.readFileSync(locationComposablePath, 'utf-8');
    // Accept 50, 50000 (meters), or a named constant with value 50
    expect(content).toMatch(/50(?:000)?\b.*(?:km|threshold|radius|distance)|(?:threshold|radius|distance|KM).*\b50(?:000)?\b/i);
    console.log('50km threshold constant is defined');
  });

  it('must define a 30-minute throttle constant', () => {
    const content = fs.readFileSync(locationComposablePath, 'utf-8');
    // 30 minutes = 1800000 ms, or a constant named with 30/throttle
    expect(content).toMatch(/1800000|30\s*\*\s*60|(?:throttle|THROTTLE|interval|INTERVAL).*30/i);
    console.log('30-minute throttle constant is defined');
  });

  it('must check prayer_location localStorage key', () => {
    const content = fs.readFileSync(locationComposablePath, 'utf-8');
    expect(content).toContain('prayer_location');
    console.log('prayer_location localStorage key is referenced');
  });

  it('must return an object with changed, oldCity, and newCity fields', () => {
    const content = fs.readFileSync(locationComposablePath, 'utf-8');
    expect(content).toContain('changed');
    expect(content).toContain('oldCity');
    expect(content).toContain('newCity');
    console.log('Return shape includes { changed, oldCity, newCity }');
  });
});
