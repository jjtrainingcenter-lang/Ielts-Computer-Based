import { IELTSTest, ReadingPassage, SpeakingTaskData, WritingTaskData } from '../types';
import { buildOfficialQuestions } from './mockTestFactory';

const LISTENING_ANSWERS = [
  "continental",
  "buffet dinner",
  "Common",
  "booked online",
  "all meals",
  "lounge",
  "Maple View",
  "pedestrian",
  "bank holidays",
  "in advance",
  "G",
  "H",
  "E",
  "F",
  "C",
  "B",
  "B",
  "A",
  "C",
  "C",
  "A",
  "B|E",
  "B|E",
  "A|B",
  "A|B",
  "C",
  "B",
  "A",
  "A",
  "C",
  "everyday lives",
  "co-operate with",
  "zero validity",
  "element of",
  "health organisations",
  "cultural bias|cultural factors",
  "coloured cards",
  "convincing tool",
  "groups of people",
  "lack of"
];
const READING_ANSWERS = [
  "FALSE",
  "FALSE",
  "TRUE",
  "TRUE",
  "NOT GIVEN",
  "TRUE",
  "NOT GIVEN",
  "FALSE",
  "develop new ideas",
  "problem-solving",
  "C",
  "B",
  "D",
  "C",
  "F",
  "G",
  "A",
  "D",
  "B",
  "FALSE",
  "TRUE",
  "TRUE",
  "FALSE",
  "FALSE",
  "NOT GIVEN",
  "D",
  "B",
  "B",
  "A",
  "B",
  "B",
  "A",
  "C",
  "C",
  "B",
  "B",
  "NOT GIVEN",
  "FALSE",
  "FALSE",
  "TRUE"
];

const READING_PASSAGES: ReadingPassage[] = [
  {
    "id": "t2-p1",
    "title": "Daydreaming",
    "partNumber": 1,
    "paragraphs": [
      {
        "id": "source",
        "type": "image",
        "imageUrl": "/assets/mock-tests/test2-reading-passage1.jpg",
        "alt": "Official Practice Test 2 Reading Passage 1 source page"
      }
    ]
  },
  {
    "id": "t2-p2",
    "title": "TRICKY SUMS AND PSYCHOLOGY",
    "partNumber": 2,
    "paragraphs": [
      {
        "id": "source",
        "type": "image",
        "imageUrl": "/assets/mock-tests/test2-reading-passage2.jpg",
        "alt": "Official Practice Test 2 Reading Passage 2 source page"
      }
    ]
  },
  {
    "id": "t2-p3",
    "title": "Care in the Community",
    "partNumber": 3,
    "paragraphs": [
      {
        "id": "source",
        "type": "image",
        "imageUrl": "/assets/mock-tests/test2-reading-passage3.jpg",
        "alt": "Official Practice Test 2 Reading Passage 3 source page"
      }
    ]
  }
];

const READING_GROUP_INSTRUCTIONS = [
  "Questions 1–13 — refer to the official question page below.",
  "Questions 14–26 — refer to the official question page below.",
  "Questions 27–40 — refer to the official question page below."
];

const WRITING_TASKS: WritingTaskData[] = [
  {
    taskNumber: 1, title: 'Academic Writing Task 1', prompt: "The graph below shows relative rates of language acquisition according to different study methods. Summarise the information by selecting and reporting the main features and make comparisons where relevant.", minWordCount: 150, timeLimitMinutes: 20,
    imageUrl: '/assets/mock-tests/test2-writing-task1.jpg', imageAlt: 'Official Practice Test 2 Writing Task 1 source graphic', imageZoomable: true
  },
  {
    taskNumber: 2, title: 'Academic Writing Task 2', prompt: "Parents are often over-anxious to teach their children to speak. If children are ‘slow-developers’ parents will often allow psychologists and schools to intervene and give their children speech therapy. Do you think children develop at different rates and so should be left to themselves to acquire language skills, or, is such intervention justified? Discuss both views and give your own opinion.", minWordCount: 250, timeLimitMinutes: 40
  }
];

const SPEAKING_TASKS: SpeakingTaskData[] = [
  { partNumber: 1, title: 'Speaking Part 1', topic: 'Introduction and Interview', questions: [
  "Which skill do you find the easiest to acquire when learning a new language? Why?",
  "Do you think language skills can be learned as effectively at any age? Why/Why not?",
  "In your opinion, does learning one language make it easier to acquire others? Why/Why not?",
  "Would your life be easier if you were a polyglot (someone who knows several languages fluently)? Why/Why not?",
  "If you could choose between being fluent in English or your own language, which would you choose and why?",
  "Do you think language ability is inherited or learned? Why/Why not?",
  "In your opinion does text speak in mobile messaging teach bad language habits? Why/Why not?",
  "Should parents ensure children read books to improve their language skills? Why/Why not?",
  "In the future, will translation services like Google Translate make language learning redundant? Why/Why not?",
  "Do you think that animals can acquire human language? Why/Why not?"
] },
  { partNumber: 2, title: 'Speaking Part 2', topic: "Describe a particularly memorable language lesson that you had.", cueCard: { mainTopic: "Describe a particularly memorable language lesson that you had.", bulletPoints: ["why it was so memorable", "who gave the lesson", "how the lesson helped you improve or focus on an aspect of language"] }, questions: [], prepTimeSeconds: 60, speakTimeSeconds: 120 },
  { partNumber: 3, title: 'Speaking Part 3', topic: 'Two-way Discussion', questions: [
  "Should dead languages, such as Latin and Ancient Greek, be taught in schools? Why/Why not?",
  "Is more importance given to science and technology than to language learning in schools?",
  "Do cultural exchanges aid language acquisition? Why/Why not?",
  "Can a non-native speaker ever become as fluent as a native speaker? Why/Why not?",
  "How could language learning be taught more effectively in schools?",
  "Is it worth learning a language if you are past retirement age? Why/Why not?",
  "Would it be better if everyone just learnt one universal language in schools? Why/Why not?"
] }
];

export const ACADEMIC_TEST_2: IELTSTest = {
  id: 'jj-ielts-upgrade-practice-test-2',
  title: 'IELTS Upgrade Academic - Practice Test 2',
  module: 'academic',
  status: 'draft',
  assignedToAll: false,
  durationMinutes: 164,
  sectionTimers: { listening: 30, reading: 60, writing: 60, speaking: 14 },
  description: 'IELTS Upgrade Academic Practice Test 2. Content reconstructed from the supplied official scan and official answer key. Listening audio is intentionally blank for Admin attachment.',
  listeningData: [{ partNumber: 1, title: 'Listening Test - Practice Test 2', audioUrl: '', audioDuration: 0, instructions: 'Attach the complete Practice Test 2 Listening recording in Admin.' }],
  listeningQuestions: buildOfficialQuestions(2, 'listening', LISTENING_ANSWERS, [
    { start: 1, end: 10, groupId: 't2-listening-1', instruction: 'SECTION 1 — Questions 1–10', imageUrl: '/assets/mock-tests/test2-listening-part1.jpg' },
    { start: 11, end: 20, groupId: 't2-listening-2', instruction: 'SECTION 2 — Questions 11–20', imageUrl: '/assets/mock-tests/test2-listening-part2.jpg' },
    { start: 21, end: 30, groupId: 't2-listening-3', instruction: 'SECTION 3 — Questions 21–30', imageUrl: '/assets/mock-tests/test2-listening-part3.jpg' },
    { start: 31, end: 40, groupId: 't2-listening-4', instruction: 'SECTION 4 — Questions 31–40', imageUrl: '/assets/mock-tests/test2-listening-part4.jpg' }
  ]),
  readingPassages: READING_PASSAGES,
  readingQuestions: buildOfficialQuestions(2, 'reading', READING_ANSWERS, [
    { start: 1, end: 13, groupId: 't2-reading-1', instruction: READING_GROUP_INSTRUCTIONS[0], imageUrl: '/assets/mock-tests/test2-reading-questions1.jpg', passageId: 't2-p1', partNumber: 1 },
    { start: 14, end: 26, groupId: 't2-reading-2', instruction: READING_GROUP_INSTRUCTIONS[1], imageUrl: '/assets/mock-tests/test2-reading-questions2.jpg', passageId: 't2-p2', partNumber: 2 },
    { start: 27, end: 40, groupId: 't2-reading-3', instruction: READING_GROUP_INSTRUCTIONS[2], imageUrl: '/assets/mock-tests/test2-reading-questions3.jpg', passageId: 't2-p3', partNumber: 3 }
  ]),
  writingTasks: WRITING_TASKS,
  speakingTasks: SPEAKING_TASKS,
  createdAt: '2026-09-09T00:00:00.000Z'
};
