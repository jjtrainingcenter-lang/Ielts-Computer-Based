import type { IELTSTest } from '../types';
import { ACADEMIC_TEST_1 } from './mockTest1';
import { ACADEMIC_TEST_2 } from './mockTest2';

export { ACADEMIC_TEST_1, ACADEMIC_TEST_2 };

const createDraftAcademicTest = (testNumber: number): IELTSTest => ({
  id: `jj-ielts-upgrade-practice-test-${testNumber}`,
  title: `IELTS Upgrade Academic - Practice Test ${testNumber}`,
  module: 'academic',
  status: 'draft',
  assignedToAll: false,
  durationMinutes: 164,
  sectionTimers: {
    listening: 30,
    reading: 60,
    writing: 60,
    speaking: 14,
  },
  description: `Practice Test ${testNumber} placeholder. Add the official Listening, Reading, Writing and Speaking content in Admin before publishing.`,
  listeningData: [],
  listeningQuestions: [],
  readingPassages: [],
  readingQuestions: [],
  writingTasks: [],
  speakingTasks: [],
});

export const ACADEMIC_TEST_3 = createDraftAcademicTest(3);
export const ACADEMIC_TEST_4 = createDraftAcademicTest(4);
export const ACADEMIC_TEST_5 = createDraftAcademicTest(5);
export const ACADEMIC_TEST_6 = createDraftAcademicTest(6);
export const ACADEMIC_TEST_7 = createDraftAcademicTest(7);
export const ACADEMIC_TEST_8 = createDraftAcademicTest(8);

export const BASE_ACADEMIC_TESTS: IELTSTest[] = [
  ACADEMIC_TEST_1,
  ACADEMIC_TEST_2,
  ACADEMIC_TEST_3,
  ACADEMIC_TEST_4,
  ACADEMIC_TEST_5,
  ACADEMIC_TEST_6,
  ACADEMIC_TEST_7,
  ACADEMIC_TEST_8,
];
