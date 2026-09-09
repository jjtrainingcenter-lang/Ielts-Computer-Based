import { IELTSTest } from '../../types';
import { TEST1_LISTENING_DATA } from './listeningData';
import { TEST1_LISTENING_QUESTIONS } from './listeningQuestions';
import { TEST1_READING_PASSAGES } from './readingPassages';
import { TEST1_READING_QUESTIONS } from './readingQuestions';
import { TEST1_WRITING_TASKS, TEST1_SPEAKING_TASKS } from './writingSpeaking';

export const ACADEMIC_TEST_1: IELTSTest = {
  id: 'jj-ielts-upgrade-practice-test-1',
  title: 'IELTS Upgrade Academic - Practice Test 1',
  module: 'academic',
  status: 'draft',
  description: 'IELTS Upgrade Academic Practice Test 1. Official answer key loaded. Listening audio is intentionally left blank for Admin upload.',
  assignedToAll: true,
  durationMinutes: 164,
  sectionTimers: { listening: 30, reading: 60, writing: 60, speaking: 14 },
  listeningData: TEST1_LISTENING_DATA,
  listeningQuestions: TEST1_LISTENING_QUESTIONS,
  readingPassages: TEST1_READING_PASSAGES,
  readingQuestions: TEST1_READING_QUESTIONS,
  writingTasks: TEST1_WRITING_TASKS,
  speakingTasks: TEST1_SPEAKING_TASKS,
  createdAt: '2026-09-08T00:00:00.000Z'
};
