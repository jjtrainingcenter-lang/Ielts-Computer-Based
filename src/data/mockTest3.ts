import { IELTSTest, ReadingPassage, SpeakingTaskData, WritingTaskData } from '../types';
import { buildOfficialQuestions } from './mockTestFactory';

const LISTENING_ANSWERS = [
  "£300|300",
  "P.J. Browning|P.J. Brownings",
  "£500|500",
  "17th century|seventeenth century",
  "rural English",
  "1.5 metres|1.5",
  "height",
  "Bradwell-Thompson",
  "KN26 56T|KN2656T",
  "23rd March|23rd of March",
  "E",
  "F",
  "G",
  "A",
  "B",
  "A",
  "C",
  "A",
  "B",
  "C",
  "A",
  "A",
  "A",
  "B",
  "B",
  "A",
  "B",
  "C",
  "C",
  "A",
  "basic colour use",
  "human standards",
  "closest relatives",
  "in recognition",
  "figurative approach",
  "novelty",
  "tools",
  "more similarities",
  "human intervention",
  "open mind"
];
const READING_ANSWERS = [
  "A|D",
  "A|D",
  "F|G|J",
  "F|G|J",
  "F|G|J",
  "B|C",
  "B|C",
  "E|H|I",
  "E|H|I",
  "E|H|I",
  "C",
  "E",
  "D",
  "D",
  "B",
  "B",
  "C|D",
  "C|D",
  "C",
  "C",
  "D",
  "worldwide fame",
  "ambition|self-belief",
  "turning point",
  "psychoanalytic",
  "be forgotten",
  "D",
  "B",
  "B",
  "A",
  "C",
  "C",
  "C",
  "B",
  "A",
  "A",
  "B",
  "TRUE",
  "FALSE",
  "NOT GIVEN"
];

const READING_PASSAGES: ReadingPassage[] = [
  {
    "id": "t3-p1",
    "title": "Art or Craft?",
    "partNumber": 1,
    "paragraphs": [
      {
        "id": "source",
        "type": "image",
        "imageUrl": "/assets/mock-tests/test3-source-sprite.jpg#crop=0,6449,1100,1509,1100,21769",
        "alt": "Official Practice Test 3 Reading Passage 1 source page"
      }
    ]
  },
  {
    "id": "t3-p2",
    "title": "Salvador Dali",
    "partNumber": 2,
    "paragraphs": [
      {
        "id": "source",
        "type": "image",
        "imageUrl": "/assets/mock-tests/test3-source-sprite.jpg#crop=0,9617,1100,3279,1100,21769",
        "alt": "Official Practice Test 3 Reading Passage 2 source page"
      }
    ]
  },
  {
    "id": "t3-p3",
    "title": "Driverless cars",
    "partNumber": 3,
    "paragraphs": [
      {
        "id": "source",
        "type": "image",
        "imageUrl": "/assets/mock-tests/test3-source-sprite.jpg#crop=0,17733,1100,1697,1100,21769",
        "alt": "Official Practice Test 3 Reading Passage 3 source page"
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
    taskNumber: 1, title: 'Academic Writing Task 1', prompt: "The bar chart below gives information about the amount of tax that various arts and cultural organisations were required to pay last year. Summarise the information by selecting and reporting the main features and make comparisons where relevant.", minWordCount: 150, timeLimitMinutes: 20,
    imageUrl: '/assets/mock-tests/test3-source-sprite.jpg#crop=0,21044,1100,725,1100,21769', imageAlt: 'Official Practice Test 3 Writing Task 1 source graphic', imageZoomable: true
  },
  {
    taskNumber: 2, title: 'Academic Writing Task 2', prompt: "Few artists ever manage to achieve fame, let alone a liveable wage. Often artists struggle to make ends meet for most of their lives. For this reason, some people believe that it is irresponsible for a parent to encourage their child to pursue an artistic career. To what extent do you agree with this view?", minWordCount: 250, timeLimitMinutes: 40
  }
];

const SPEAKING_TASKS: SpeakingTaskData[] = [
  { partNumber: 1, title: 'Speaking Part 1', topic: 'Introduction and Interview', questions: [
  "Do you like art? Why/Why not?",
  "Do you have any artistic pursuits?",
  "Is it important for you to have a creative outlet? Why/Why not?",
  "Describe something you made that you are proud of.",
  "What would inspire you to be more creative?",
  "In your opinion, did you have good art teachers?",
  "Did you enjoy art lessons? Why/Why not?",
  "Was there enough time on the school curriculum for art lessons?",
  "Do you think more time should be spent on teaching art in schools?",
  "Is there any art form not taught that you think has a place in the school curriculum?"
] },
  { partNumber: 2, title: 'Speaking Part 2', topic: "Describe an artist who has impressed you in some way.", cueCard: { mainTopic: "Describe an artist who has impressed you in some way.", bulletPoints: ["who the artist is", "why he/she impressed you so much", "what you like most about his/her work"] }, questions: [], prepTimeSeconds: 60, speakTimeSeconds: 120 },
  { partNumber: 3, title: 'Speaking Part 3', topic: 'Two-way Discussion', questions: [
  "Do you think it is easier to be an artist today than it was in the past?",
  "What problems do you think professional artists experience?",
  "Are artists given sufficient support by the public?",
  "In your opinion, were there more talented artists in the past?",
  "Do you think that artists are more interested in their art than in making money?",
  "Is it easy to become a celebrity artist nowadays?",
  "Do you think some celebrated artists today are overpaid?",
  "Do you believe that prestigious art prizes, like the Turner Art prize, are given to deserving artists?"
] }
];

export const ACADEMIC_TEST_3: IELTSTest = {
  id: 'jj-ielts-upgrade-practice-test-3',
  title: 'IELTS Upgrade Academic - Practice Test 3',
  module: 'academic',
  status: 'draft',
  assignedToAll: false,
  durationMinutes: 164,
  sectionTimers: { listening: 30, reading: 60, writing: 60, speaking: 14 },
  description: 'IELTS Upgrade Academic Practice Test 3. Content reconstructed from the supplied official scan and official answer key. Listening audio is intentionally blank for Admin attachment.',
  listeningData: [{ partNumber: 1, title: 'Listening Test - Practice Test 3', audioUrl: '', audioDuration: 0, instructions: 'Attach the complete Practice Test 3 Listening recording in Admin.' }],
  listeningQuestions: buildOfficialQuestions(3, 'listening', LISTENING_ANSWERS, [
    { start: 1, end: 10, groupId: 't3-listening-1', instruction: 'SECTION 1 — Questions 1–10', imageUrl: '/assets/mock-tests/test3-source-sprite.jpg#crop=0,0,1100,1633,1100,21769' },
    { start: 11, end: 20, groupId: 't3-listening-2', instruction: 'SECTION 2 — Questions 11–20', imageUrl: '/assets/mock-tests/test3-source-sprite.jpg#crop=0,1645,1100,1516,1100,21769' },
    { start: 21, end: 30, groupId: 't3-listening-3', instruction: 'SECTION 3 — Questions 21–30', imageUrl: '/assets/mock-tests/test3-source-sprite.jpg#crop=0,3173,1100,1744,1100,21769' },
    { start: 31, end: 40, groupId: 't3-listening-4', instruction: 'SECTION 4 — Questions 31–40', imageUrl: '/assets/mock-tests/test3-source-sprite.jpg#crop=0,4929,1100,1508,1100,21769' }
  ]),
  readingPassages: READING_PASSAGES,
  readingQuestions: buildOfficialQuestions(3, 'reading', READING_ANSWERS, [
    { start: 1, end: 13, groupId: 't3-reading-1', instruction: READING_GROUP_INSTRUCTIONS[0], imageUrl: '/assets/mock-tests/test3-source-sprite.jpg#crop=0,7970,1100,1635,1100,21769', passageId: 't3-p1', partNumber: 1 },
    { start: 14, end: 26, groupId: 't3-reading-2', instruction: READING_GROUP_INSTRUCTIONS[1], imageUrl: '/assets/mock-tests/test3-source-sprite.jpg#crop=0,12908,1100,4813,1100,21769', passageId: 't3-p2', partNumber: 2 },
    { start: 27, end: 40, groupId: 't3-reading-3', instruction: READING_GROUP_INSTRUCTIONS[2], imageUrl: '/assets/mock-tests/test3-source-sprite.jpg#crop=0,19442,1100,1590,1100,21769', passageId: 't3-p3', partNumber: 3 }
  ]),
  writingTasks: WRITING_TASKS,
  speakingTasks: SPEAKING_TASKS,
  createdAt: '2026-09-09T00:00:00.000Z'
};
