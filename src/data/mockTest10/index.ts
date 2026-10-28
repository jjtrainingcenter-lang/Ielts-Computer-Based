import { IELTSTest } from '../../types';
import { TEST10_LISTENING_DATA } from './listeningData';
import { TEST10_LISTENING_QUESTIONS } from './listeningQuestions';
import { TEST10_READING_PASSAGES } from './readingPassages';
import { TEST10_READING_QUESTIONS } from './readingQuestions';
import { TEST10_WRITING_TASKS, TEST10_SPEAKING_TASKS } from './writingSpeaking';

export const ACADEMIC_TEST_10: IELTSTest = {
  id: 'jj-ielts-upgrade-practice-test-10',
  title: 'IELTS Upgrade Academic - Practice Test 10',
  module: 'academic',
  status: 'draft',
  assignedToAll: true,
  durationMinutes: 164,
  sectionTimers: {
    listening: 30,
    reading: 60,
    writing: 60,
    speaking: 14,
  },
  description:
    'Authentic IELTS Academic Practice Test 10 with interactive Australian Visa application process flow-chart, Dear Diary booking notes and bank cheque, Department Profit bar chart, and official Cambridge-standard answer keys.',
  listeningData: TEST10_LISTENING_DATA,
  listeningQuestions: TEST10_LISTENING_QUESTIONS,
  readingPassages: TEST10_READING_PASSAGES,
  readingQuestions: TEST10_READING_QUESTIONS,
  writingTasks: TEST10_WRITING_TASKS,
  speakingTasks: TEST10_SPEAKING_TASKS,
  createdAt: '2026-10-27T00:00:00.000Z',
  updatedAt: '2026-10-27T00:00:00.000Z',
};
