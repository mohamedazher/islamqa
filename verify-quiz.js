import fs from 'fs';

console.log('📋 QUIZ GENERATION VERIFICATION REPORT\n');
console.log('='.repeat(60));

// Load quiz file
const quizData = JSON.parse(fs.readFileSync('quiz-generation/quiz-questions.json', 'utf8'));

// Load metadata
const metadata = JSON.parse(fs.readFileSync('quiz-generation/quiz-metadata.json', 'utf8'));

console.log('\n1️⃣ LINKING STRUCTURE');
console.log('-'.repeat(60));
console.log('Each generated quiz contains:');
console.log('  ✅ sourceQuestionId - Direct ID mapping');
console.log('  ✅ sourceReference.questionId - For verification');
console.log('  ✅ sourceReference.questionNo - To find original in IslamQA');
console.log('  ✅ sourceReference.questionTitle - Human-readable title\n');

console.log('2️⃣ SAMPLE VERIFICATIONS');
console.log('-'.repeat(60));

// Test a few quizzes
const sampleIndices = [0, 24, 49];

sampleIndices.forEach(idx => {
  const quiz = quizData.quizzes[idx];
  const sourceId = quiz.sourceQuestionId;

  // Find in metadata
  const meta = metadata.processedQuestions.find(p => p.questionId === sourceId);

  console.log(`\nQuiz ${idx + 1}/50: ${quiz.id}`);
  console.log(`  Generated Question: ${quiz.questionText.substring(0, 60)}...`);
  console.log(`  Source ID: ${sourceId}`);
  console.log(`  Source Title: ${quiz.sourceReference.questionTitle}`);
  console.log(`  Source No: Q#${quiz.sourceReference.questionNo}`);
  console.log(`  Metadata: Processed on ${meta?.processedDate || 'N/A'}, Status: ${meta?.status || 'N/A'}`);
});

console.log('\n\n3️⃣ VERIFICATION ACROSS ALL 50 QUIZZES');
console.log('-'.repeat(60));

// Check all quizzes have source references
let validCount = 0;
let missingSourceRef = [];

quizData.quizzes.forEach((quiz, idx) => {
  const hasSourceId = quiz.sourceQuestionId !== undefined;
  const hasSourceRef = quiz.sourceReference &&
                       quiz.sourceReference.questionId &&
                       quiz.sourceReference.questionNo &&
                       quiz.sourceReference.questionTitle;

  if (hasSourceId && hasSourceRef) {
    validCount++;
  } else {
    missingSourceRef.push({
      index: idx,
      id: quiz.id
    });
  }
});

console.log(`Total Quizzes: ${quizData.quizzes.length}`);
console.log(`✅ Quizzes with valid source references: ${validCount}/50`);
console.log(`❌ Quizzes missing source data: ${missingSourceRef.length}`);

console.log('\n4️⃣ METADATA TRACKING');
console.log('-'.repeat(60));
console.log(`Processed Questions Tracked: ${metadata.processedQuestions.length}/50`);
console.log(`Processing Stats:`);
console.log(`  Total Processed: ${metadata.processingStats.totalProcessed}`);
console.log(`  Successful: ${metadata.processingStats.successful}`);
console.log(`  Failed: ${metadata.processingStats.failed}`);
console.log(`  Success Rate: ${metadata.processingStats.totalProcessed > 0 ? Math.round((metadata.processingStats.successful / metadata.processingStats.totalProcessed) * 100) : 0}%`);

console.log('\n5️⃣ HOW TO VERIFY MANUALLY');
console.log('-'.repeat(60));
console.log('To verify any quiz against its source:');
console.log('');
console.log('1. Open quiz-questions.json and find a quiz');
console.log('2. Note the sourceReference.questionNo (e.g., 11585)');
console.log('3. Visit: https://islamqa.com/en/answers/11585');
console.log('4. Compare the original long-form answer with the quiz explanation');
console.log('5. Verify the generated multiple-choice question matches the answer\n');
console.log('Example:');
console.log('  Quiz: quiz-8512');
console.log('  Question No: 11585');
console.log('  URL: https://islamqa.com/en/answers/11585');
console.log('  Original Title: "Giver buying the gift from the person to whom it was given"');
console.log('  Generated Question: "Is it permissible for someone to repurchase a gift...?"\n');

console.log('='.repeat(60));
console.log('✅ VERIFICATION COMPLETE\n');
