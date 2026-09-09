import { Question, TestSection } from '../types';

type GroupSpec = {
  start: number;
  end: number;
  groupId: string;
  instruction: string;
  imageUrl?: string;
  passageId?: string;
  partNumber?: number;
};

const UPPER_LETTERS = 'ABCDEFGHIJKL'.split('').map(value => ({ value, label: value }));
const LOWER_LETTERS = 'abcdefghijkl'.split('').map(value => ({ value, label: value }));
const ROMAN = ['i','ii','iii','iv','v','vi','vii','viii'].map(value => ({ value, label: `(${value})` }));
const TFNG = ['TRUE','FALSE','NOT GIVEN'].map(value => ({ value, label: value }));
const YNNG = ['YES','NO','NOT GIVEN'].map(value => ({ value, label: value }));

const classify = (answer: string): { type: string; options?: { value: string; label: string }[] } => {
  const alternatives = answer.split('|').map(v => v.trim()).filter(Boolean);
  if (alternatives.every(v => ['TRUE','FALSE','NOT GIVEN'].includes(v))) return { type: 'true-false-not-given', options: TFNG };
  if (alternatives.every(v => ['YES','NO','NOT GIVEN'].includes(v))) return { type: 'yes-no-not-given', options: YNNG };
  if (alternatives.every(v => /^[A-L]$/.test(v))) return { type: 'matching', options: UPPER_LETTERS };
  if (alternatives.every(v => /^[a-l]$/.test(v))) return { type: 'matching', options: LOWER_LETTERS };
  if (alternatives.every(v => /^(i|ii|iii|iv|v|vi|vii|viii)$/.test(v))) return { type: 'matching-headings', options: ROMAN };
  return { type: 'fill-blank' };
};

export const buildOfficialQuestions = (
  testNumber: number,
  section: TestSection,
  answers: string[],
  groups: GroupSpec[],
): Question[] => {
  if (answers.length !== 40) throw new Error(`Practice Test ${testNumber} ${section} answer key must contain exactly 40 answers.`);
  return answers.map((correctAnswer, index) => {
    const questionNumber = index + 1;
    const group = groups.find(item => questionNumber >= item.start && questionNumber <= item.end);
    if (!group) throw new Error(`Missing group metadata for Practice Test ${testNumber} ${section} Question ${questionNumber}.`);
    const display = classify(correctAnswer);
    const isFirst = questionNumber === group.start;
    return {
      id: `t${testNumber}-${section.charAt(0)}${questionNumber}`,
      section,
      questionNumber,
      questionText: '',
      type: display.type,
      options: display.options,
      correctAnswer,
      explanation: `Official IELTS Upgrade Academic Practice Test ${testNumber} answer key.`,
      partNumber: group.partNumber ?? Math.ceil(questionNumber / 10),
      passageId: group.passageId,
      groupId: group.groupId,
      groupInstruction: isFirst ? group.instruction : undefined,
      groupMedia: isFirst && group.imageUrl ? { type: 'image', url: group.imageUrl, alt: `Practice Test ${testNumber} ${section} source page`, zoomable: true } : undefined,
    };
  });
};
