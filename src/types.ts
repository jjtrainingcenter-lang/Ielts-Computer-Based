export type TestSection = 'listening' | 'reading' | 'writing' | 'speaking';

export type QuestionType =
  | 'multiple-choice'
  | 'multiple-choice-single-answer'
  | 'multiple-choice-multiple-answer'
  | 'multiple-response'
  | 'true-false-not-given'
  | 'yes-no-not-given'
  | 'matching'
  | 'matching-information'
  | 'matching-features'
  | 'matching-sentence-endings'
  | 'matching-headings'
  | 'paragraph-matching'
  | 'fill-blank'
  | 'sentence-completion'
  | 'note-completion'
  | 'form-completion'
  | 'table-completion'
  | 'flow-chart-completion'
  | 'diagram-labeling'
  | 'map-labeling'
  | 'short-answer'
  | 'dropdown'
  | 'writing-task'
  | 'speaking-task'
  | string;

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  section: TestSection;
  questionNumber: number;
  instruction?: string;
  questionText: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right';
  zoomable?: boolean;
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation: string;
  passageId?: string;
  partNumber?: number;
  groupId?: string;
  groupInstruction?: string;
  groupMedia?: {
    type: 'image';
    url: string;
    alt?: string;
    zoomable?: boolean;
  };
  media?: {
    type: 'image';
    url: string;
    alt?: string;
    caption?: string;
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
  partNumber: number;
  paragraphs: {
    id: string;
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
  audioUrl?: string;
  audioDuration: number;
  transcript?: string;
  instructions: string;
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
  media?: {
    type: 'image';
    url: string;
    alt?: string;
    caption?: string;
  };
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
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
}

export interface Candidate {
  id: string;
  name: string;
  dob: string;
  assignedTestIds: string[];
  cohort?: string;
  customTimers?: Partial<IELTSSectionTimers>;
  timerPreset?: 'standard' | 'extra25' | 'extra50' | 'rapid' | 'custom';
  timeMultiplier?: number;
  status?: 'active' | 'completed' | 'blocked';
  /**
   * Per-test reset marker written by Admin when a fresh attempt is granted.
   * Candidate clients compare this timestamp with any locally saved exam session
   * and discard stale work when the reset is newer.
   */
  attemptResetAt?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateTestResult {
  id?: string;
  candidateId: string;
  candidateName: string;
  candidateDob?: string;
  testId: string;
  testTitle?: string;
  attemptNumber?: number;
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
  sectionTimers?: IELTSSectionTimers;
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
