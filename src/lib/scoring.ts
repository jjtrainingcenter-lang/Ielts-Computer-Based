import { Question, IELTSTest } from '../types';

/**
 * Normalizes answer text by trimming, lowercasing, collapsing internal whitespace,
 * and stripping trailing punctuation and surrounding quotes.
 */
export const normalizeAnswer = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/^["'`]|["'`]$/g, '') // strip surrounding quotes
    .replace(/[.,;!?]+$/, '') // strip trailing punctuation
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();
};

/**
 * Checks whether a student's answer is correct for a given IELTS Question.
 */
export const checkQuestionCorrect = (q: Partial<Question>, userAns?: string): boolean => {
  if (!userAns || !q.correctAnswer) return false;

  const rawUser = String(userAns).trim();
  if (!rawUser) return false;

  const rawCorrect = q.correctAnswer;
  const cAnsArr: string[] = Array.isArray(rawCorrect)
    ? rawCorrect.map(String)
    : String(rawCorrect).split('|');

  const normalizedUser = normalizeAnswer(rawUser);

  // Multi-select / multiple response question (e.g. Choose TWO letters)
  const isMultiResponse =
    q.type === 'multiple-response' ||
    q.type === 'multiple-choice-multiple-answer';

  if (isMultiResponse) {
    const userTokens = rawUser
      .split('|')
      .map(normalizeAnswer)
      .filter(Boolean)
      .sort();
    const correctTokens = cAnsArr
      .flatMap(c => c.split('|'))
      .map(normalizeAnswer)
      .filter(Boolean)
      .sort();

    if (userTokens.length === 0 || correctTokens.length === 0) return false;
    return userTokens.join('|') === correctTokens.join('|');
  }

  // Single answer or alternative acceptable answers (separated by | in answer key)
  const normalizedCorrectList = cAnsArr.map(normalizeAnswer).filter(Boolean);

  // Direct match against any acceptable alternative
  if (normalizedCorrectList.includes(normalizedUser)) {
    return true;
  }

  // True / False / Not Given shortcuts and variants
  if (q.type === 'true-false-not-given') {
    if (normalizedCorrectList.includes('true') && (normalizedUser === 'true' || normalizedUser === 't')) return true;
    if (normalizedCorrectList.includes('false') && (normalizedUser === 'false' || normalizedUser === 'f')) return true;
    if (normalizedCorrectList.includes('not given') && (normalizedUser === 'not given' || normalizedUser === 'ng')) return true;
  }

  // Yes / No / Not Given shortcuts and variants
  if (q.type === 'yes-no-not-given') {
    if (normalizedCorrectList.includes('yes') && (normalizedUser === 'yes' || normalizedUser === 'y')) return true;
    if (normalizedCorrectList.includes('no') && (normalizedUser === 'no' || normalizedUser === 'n')) return true;
    if (normalizedCorrectList.includes('not given') && (normalizedUser === 'not given' || normalizedUser === 'ng')) return true;
  }

  // Handle letter matching where correct is "A" and user entered "A" or "(A)"
  const cleanUserLetter = normalizedUser.replace(/^[(\[]?([a-l])[)\]]?$/, '$1');
  if (/^[a-l]$/.test(cleanUserLetter)) {
    if (normalizedCorrectList.includes(cleanUserLetter)) {
      return true;
    }
  }

  // Handle Roman numeral matching (i, ii, iii, etc.)
  const cleanRoman = normalizedUser.replace(/^[(\[]?(i|ii|iii|iv|v|vi|vii|viii|ix|x)[)\]]?$/, '$1');
  if (normalizedCorrectList.includes(cleanRoman)) {
    return true;
  }

  // Flexible handling for common IELTS number/unit variations (e.g., "4.5" vs "4.5 metres")
  for (const c of normalizedCorrectList) {
    if (c === normalizedUser) return true;
    // e.g. "single-handedly revolutionised" vs "single handedly revolutionised"
    if (c.replace(/-/g, ' ') === normalizedUser.replace(/-/g, ' ')) return true;
    // e.g. UK vs US spelling "metres" vs "meters"
    if (c.replace(/metres/g, 'meters') === normalizedUser.replace(/metres/g, 'meters')) return true;
    if (c.replace(/meters/g, 'metres') === normalizedUser.replace(/meters/g, 'metres')) return true;
  }

  return false;
};

/**
 * Standard IELTS Band Score Conversion Table (9-band scale).
 */
export const calculateIELTSBand = (
  rawScore: number,
  section: 'listening' | 'reading',
  testModule: 'academic' | 'general' = 'academic',
): number => {
  const score = Math.max(0, Math.min(40, Math.round(rawScore)));

  if (section === 'listening') {
    if (score >= 39) return 9.0;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8.0;
    if (score >= 32) return 7.5;
    if (score >= 30) return 7.0;
    if (score >= 26) return 6.5;
    if (score >= 23) return 6.0;
    if (score >= 18) return 5.5;
    if (score >= 16) return 5.0;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4.0;
    if (score >= 6) return 3.5;
    if (score >= 4) return 3.0;
    return 2.5;
  }

  // Reading - General Training
  if (testModule === 'general') {
    if (score >= 40) return 9.0;
    if (score >= 39) return 8.5;
    if (score >= 37) return 8.0;
    if (score >= 36) return 7.5;
    if (score >= 34) return 7.0;
    if (score >= 32) return 6.5;
    if (score >= 30) return 6.0;
    if (score >= 27) return 5.5;
    if (score >= 23) return 5.0;
    if (score >= 19) return 4.5;
    if (score >= 15) return 4.0;
    if (score >= 12) return 3.5;
    if (score >= 8) return 3.0;
    return 2.5;
  }

  // Reading - Academic
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 6) return 3.5;
  if (score >= 4) return 3.0;
  return 2.5;
};

export interface TestScoreSummary {
  listeningScore: number;
  listeningTotal: number;
  listeningBand: number;
  readingScore: number;
  readingTotal: number;
  readingBand: number;
  autoGradedBand: number;
  overallBand: number;
}

/**
 * Calculates raw scores, section band scores, and overall auto-graded band score for a candidate test.
 * Note: Writing is explicitly NOT auto-calculated as it requires teacher/examiner evaluation.
 */
export const calculateTestScores = (
  test: IELTSTest,
  userAnswers: Record<string, string> = {},
): TestScoreSummary => {
  const listeningQuestions = test.listeningQuestions || [];
  const readingQuestions = test.readingQuestions || [];

  let listeningScore = 0;
  listeningQuestions.forEach(q => {
    // Check various possible key names in userAnswers
    const ans =
      userAnswers[q.id] ||
      userAnswers[String(q.questionNumber)] ||
      userAnswers[`${q.section}_${q.questionNumber}`] ||
      userAnswers[`q_${q.questionNumber}`] ||
      userAnswers[`${q.id}_blank_0`] ||
      '';

    if (checkQuestionCorrect(q, ans)) {
      listeningScore++;
    }
  });

  let readingScore = 0;
  readingQuestions.forEach(q => {
    const ans =
      userAnswers[q.id] ||
      userAnswers[String(q.questionNumber)] ||
      userAnswers[`${q.section}_${q.questionNumber}`] ||
      userAnswers[`q_${q.questionNumber}`] ||
      userAnswers[`${q.id}_blank_0`] ||
      '';

    if (checkQuestionCorrect(q, ans)) {
      readingScore++;
    }
  });

  const listeningTotal = listeningQuestions.length || 40;
  const readingTotal = readingQuestions.length || 40;
  const testModule = test.module || 'academic';

  const listeningBand = calculateIELTSBand(listeningScore, 'listening', testModule);
  const readingBand = calculateIELTSBand(readingScore, 'reading', testModule);

  // Average of auto-graded sections rounded to nearest 0.5
  const autoGradedBand = Math.round(((listeningBand + readingBand) / 2) * 2) / 2;

  return {
    listeningScore,
    listeningTotal,
    listeningBand,
    readingScore,
    readingTotal,
    readingBand,
    autoGradedBand,
    overallBand: autoGradedBand,
  };
};
