export type TestSection = 'listening' | 'reading' | 'writing' | 'speaking';

export type QuestionType =
  | 'multiple-choice'
  | 'multiple-response'
  | 'true-false-not-given'
  | 'yes-no-not-given'
  | 'matching'
  | 'matching-headings'
  | 'fill-blank'
  | 'dropdown'
  | 'table-completion'
  | 'writing-task'
  | 'speaking-task';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  section: TestSection;
  questionNumber: number; // 1 to 40 for Reading/Listening
  instruction?: string;
  questionText: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right';
  zoomable?: boolean;
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string; // for auto-scoring
  explanation: string;
  passageId?: string; // linkage to passage
  partNumber?: number; // 1, 2, 3 or 4
  groupId?: string; // for grouping questions together
  groupInstruction?: string; // instruction for the group (e.g. Questions 21-25)
  groupMedia?: {
    type: 'image';
    url: string;
    alt?: string;
    zoomable?: boolean;
  };
  tableData?: {
    headers: string[];
    rows: (string | { inputId: string; placeholder: string })[][];
  };
  matchingHeadings?: {
    headings: { id: string; text: string }[];
  };
}

export interface ReadingPassage {
  id: string;
  title: string;
  subtitle?: string;
  partNumber: number; // Passage 1, 2, or 3
  paragraphs: {
    id: string; // 'A', 'B', 'C', etc.
    type?: 'text' | 'image' | 'heading' | 'table';
    text?: string;
    imageUrl?: string;
    caption?: string;
    alt?: string;
  }[];
}

export interface ListeningSectionData {
  partNumber: number;
  title: string;
  audioUrl?: string; // or speech synthesis fallback
  audioDuration: number; // in seconds
  transcript?: string;
  instructions: string;
  // Image Support
  imageUrl?: string;
  imageAlt?: string;
  imageZoomable?: boolean;
}

export interface WritingTaskData {
  taskNumber: 1 | 2;
  title: string;
  prompt: string;
  minWordCount: number;
  timeLimitMinutes: number;
  imageUrl?: string;
  imageAlt?: string;
  imageZoomable?: boolean;
  chartType?: 'bar' | 'line' | 'pie' | 'process' | 'letter';
  chartData?: {
    labels: string[];
    datasets: { label: string; data: number[]; color: string }[];
  };
  sampleAnswer?: string;
}

export interface SpeakingTaskData {
  partNumber: 1 | 2 | 3;
  title: string;
  topic: string;
  cueCard?: {
    mainTopic: string;
    bulletPoints: string[];
  };
  questions: string[];
  prepTimeSeconds?: number;
  speakTimeSeconds?: number;
}

export interface IELTSSectionTimers {
  listening: number; // minutes
  reading: number;   // minutes
  writing: number;   // minutes
  speaking: number;  // minutes
}

export interface Candidate {
  id: string; // 6-digit registration number e.g. "583921"
  name: string;
  dob: string; // "YYYY-MM-DD"
  assignedTestIds: string[]; // List of test IDs assigned to this candidate
  customTimers?: Partial<IELTSSectionTimers>; // Custom timer override per IELTS section (in minutes)
  timerPreset?: 'standard' | 'extra25' | 'extra50' | 'rapid' | 'custom';
  timeMultiplier?: number; // e.g. 1.0, 1.25, 1.5
  status?: 'active' | 'completed' | 'blocked';
  createdAt?: string;
}

export interface CandidateTestResult {
  id?: string;
  candidateId: string;
  candidateName: string;
  candidateDob?: string;
  testId: string;
  testTitle?: string;
  listeningScore: number;
  readingScore: number;
  userAnswers?: Record<string, string>;
  writingTask1?: string;
  writingTask2?: string;
  writingBand?: number;
  writingEvaluation?: WritingEvaluation;
  speakingBand?: number;
  speakingEvaluation?: SpeakingEvaluation;
  overallBand?: number;
  timestamp: string;
  examinerFeedback?: {
    task1Band?: number;
    task2Band?: number;
    overallWritingBand?: number;
    teacherNotes?: string;
    gradedBy?: string;
    gradedAt?: string;
  };
}

export interface IELTSTest {
  id: string;
  title: string;
  module: 'academic' | 'general';
  description?: string;
  durationMinutes?: number;
  sectionTimers?: IELTSSectionTimers; // Custom timer per section in minutes
  assignedToAll?: boolean;
  status?: 'draft' | 'published' | 'archived';
  allowedCandidateIds?: string[];
  listeningData: ListeningSectionData[];
  listeningQuestions: Question[];
  readingPassages: ReadingPassage[];
  readingQuestions: Question[];
  writingTasks: WritingTaskData[];
  speakingTasks: SpeakingTaskData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HighlightItem {
  id: string;
  passageId: string;
  text: string;
  paragraphId?: string;
  color: 'yellow' | 'cyan' | 'pink';
  note?: string;
  createdAt: string;
}

export interface DisplaySettings {
  contrast: 'standard' | 'yellow-black' | 'blue-white' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  volume: number;
  showTimer: boolean;
}

export interface WritingEvaluation {
  task1Band: number;
  task2Band: number;
  overallWritingBand: number;
  criteriaScores: {
    taskAchievement: { score: number; feedback: string };
    coherenceCohesion: { score: number; feedback: string };
    lexicalResource: { score: number; feedback: string };
    grammaticalAccuracy: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  correctedSampleSnippet?: string;
}

export interface SpeakingEvaluation {
  speakingBand: number;
  fluencyScore: number;
  lexicalScore: number;
  grammarScore: number;
  pronunciationScore: number;
  detailedFeedback: string;
  keyTips: string[];
}
