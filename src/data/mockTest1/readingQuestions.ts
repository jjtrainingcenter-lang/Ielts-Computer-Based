import { Question } from '../../types';
import { TEST1_READING_QUESTIONS_PART_1 } from './readingQuestionsPart1';
import { TEST1_READING_QUESTIONS_PART_2 } from './readingQuestionsPart2';
import { TEST1_READING_QUESTIONS_PART_3 } from './readingQuestionsPart3';

export const TEST1_READING_QUESTIONS: Question[] = [
  ...TEST1_READING_QUESTIONS_PART_1,
  ...TEST1_READING_QUESTIONS_PART_2,
  ...TEST1_READING_QUESTIONS_PART_3,
];
