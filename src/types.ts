export type TestSection = 'listening' | 'reading' | 'writing' | 'speaking';

export type QuestionType =
  | 'multiple-choice'
  | 'true-false-not-given'
  | 'yes-no-not-given'
  | 'matching-headings'
  | 'fill-blank'
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
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string; // for auto-scoring
  explanation: string;
  passageId?: string; // linkage to passage
  partNumber?: number; // 1, 2, 3 or 4
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
    text: string;
  }[];
}

export interface ListeningSectionData {
  partNumber: number;
  title: string;
  audioUrl?: string; // or speech synthesis fallback
  audioDuration: number; // in seconds
  transcript?: string;
  instructions: string;
}

export interface WritingTaskData {
  taskNumber: 1 | 2;
  title: string;
  prompt: string;
  minWordCount: number;
  timeLimitMinutes: number;
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

export interface IELTSTest {
  id: string;
  title: string;
  module: 'academic' | 'general';
  listeningData: ListeningSectionData[];
  listeningQuestions: Question[];
  readingPassages: ReadingPassage[];
  readingQuestions: Question[];
  writingTasks: WritingTaskData[];
  speakingTasks: SpeakingTaskData[];
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
