import { db, isConfigured } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Candidate, IELTSTest, TestSection, HighlightItem } from '../types';

export const SESSION_STORAGE_KEY = 'jj_cbt_active_session_v3';

export interface ExamSessionState {
  attemptId: string;
  candidateId: string;
  candidateName: string;
  testId: string;
  testType: string; // academic | general
  status: 'PRE_TEST' | 'LISTENING' | 'READING' | 'WRITING' | 'SUBMISSION' | 'COMPLETED';
  startedAt: number;
  currentSection: TestSection | null;
  currentQuestionIndex: number;
  lastSyncedAt: number;
  submittedAt?: number;
  
  // Timers
  sectionStartedAt: number;
  sectionDeadline: number;
  
  // Answers & States
  listening: {
    answers: Record<string, string>;
    markedQuestions: Record<string, boolean>;
    audioState: any;
    highlights: HighlightItem[];
    notes: Record<string, string>;
  };
  reading: {
    answers: Record<string, string>;
    markedQuestions: Record<string, boolean>;
    highlights: HighlightItem[];
    notes: Record<string, string>;
  };
  writing: {
    task1Response: string;
    task2Response: string;
    task1WordCount: number;
    task2WordCount: number;
  };
}

export class ExamSessionStore {
  private static instance: ExamSessionStore;
  private state: ExamSessionState | null = null;
  private syncTimeout: NodeJS.Timeout | null = null;
  
  private constructor() {}
  
  public static getInstance(): ExamSessionStore {
    if (!ExamSessionStore.instance) {
      ExamSessionStore.instance = new ExamSessionStore();
    }
    return ExamSessionStore.instance;
  }
  
  public getState(): ExamSessionState | null {
    return this.state;
  }
  
  public async loadSession(candidateId: string, testId: string): Promise<ExamSessionState | null> {
    const attemptId = `${candidateId}_${testId}`;
    
    // 1. Try Firebase first
    if (isConfigured) {
      try {
        const docRef = doc(db, 'examAttempts', attemptId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          this.state = snapshot.data() as ExamSessionState;
          this.saveLocal(); // sync local cache
          return this.state;
        }
      } catch (e) {
        console.error("Firebase load session failed, falling back to local.", e);
      }
    }
    
    // 2. Fallback to LocalStorage
    try {
      const raw = localStorage.getItem(`${SESSION_STORAGE_KEY}_${attemptId}`);
      if (raw) {
        this.state = JSON.parse(raw);
        return this.state;
      }
    } catch (e) {
      console.error("Local storage load session failed.", e);
    }
    
    return null;
  }
  
  public initializeSession(
    candidate: Candidate,
    test: IELTSTest,
    sectionDurationMins: number
  ): ExamSessionState {
    const attemptId = `${candidate.id}_${test.id}`;
    const now = Date.now();
    
    this.state = {
      attemptId,
      candidateId: candidate.id,
      candidateName: candidate.name,
      testId: test.id,
      testType: test.module,
      status: 'PRE_TEST',
      startedAt: now,
      currentSection: null,
      currentQuestionIndex: 0,
      lastSyncedAt: now,
      
      sectionStartedAt: 0,
      sectionDeadline: 0,
      
      listening: { answers: {}, markedQuestions: {}, audioState: {}, highlights: [], notes: {} },
      reading: { answers: {}, markedQuestions: {}, highlights: [], notes: {} },
      writing: { task1Response: '', task2Response: '', task1WordCount: 0, task2WordCount: 0 }
    };
    
    this.saveSession();
    return this.state;
  }
  
  public startSection(section: TestSection, durationMins: number) {
    if (!this.state) return;
    const now = Date.now();
    this.state.status = section.toUpperCase() as any;
    this.state.currentSection = section;
    this.state.currentQuestionIndex = 0;
    this.state.sectionStartedAt = now;
    this.state.sectionDeadline = now + durationMins * 60 * 1000;
    this.saveSession();
  }
  
  public saveAnswer(section: 'listening' | 'reading', questionId: string, answer: string) {
    if (!this.state) return;
    this.state[section].answers[questionId] = answer;
    this.scheduleSync();
  }
  
  public markQuestion(section: 'listening' | 'reading', questionId: string, isMarked: boolean) {
    if (!this.state) return;
    this.state[section].markedQuestions[questionId] = isMarked;
    this.saveLocal();
  }
  
  public saveWriting(task: 1 | 2, text: string, wordCount: number) {
    if (!this.state) return;
    if (task === 1) {
      this.state.writing.task1Response = text;
      this.state.writing.task1WordCount = wordCount;
    } else {
      this.state.writing.task2Response = text;
      this.state.writing.task2WordCount = wordCount;
    }
    this.scheduleSync();
  }
  
  public saveHighlight(section: 'listening' | 'reading', highlight: HighlightItem) {
    if (!this.state) return;
    this.state[section].highlights.push(highlight);
    this.saveLocal();
  }
  
  public removeHighlight(section: 'listening' | 'reading', id: string) {
    if (!this.state) return;
    this.state[section].highlights = this.state[section].highlights.filter(h => h.id !== id);
    this.saveLocal();
  }
  
  public saveNote(section: 'listening' | 'reading', targetId: string, note: string) {
    if (!this.state) return;
    this.state[section].notes[targetId] = note;
    this.saveLocal();
  }
  
  public saveAudioState(state: any) {
    if (!this.state) return;
    this.state.listening.audioState = state;
    this.saveLocal();
  }
  
  public updateQuestionIndex(index: number) {
    if (!this.state) return;
    this.state.currentQuestionIndex = index;
    this.saveLocal();
  }
  
  public completeSection() {
    if (!this.state) return;
    // Just lock the current section. Transitioning logic handles next state.
    this.saveSession();
  }
  
  public submitTest() {
    if (!this.state) return;
    this.state.status = 'COMPLETED';
    this.state.submittedAt = Date.now();
    this.saveSession(true); // Force immediate sync
  }
  
  private saveLocal() {
    if (!this.state) return;
    this.state.lastSyncedAt = Date.now();
    try {
      localStorage.setItem(`${SESSION_STORAGE_KEY}_${this.state.attemptId}`, JSON.stringify(this.state));
    } catch (e) {
      console.error("Local save failed", e);
    }
  }
  
  public saveSession(forceSync = false) {
    this.saveLocal();
    if (forceSync) {
      this.syncToFirebase();
    } else {
      this.scheduleSync();
    }
  }
  
  private scheduleSync() {
    this.saveLocal();
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.syncToFirebase();
    }, 2000); // 2 second debounce
  }
  
  private async syncToFirebase() {
    if (!this.state || !isConfigured) return;
    try {
      const docRef = doc(db, 'examAttempts', this.state.attemptId);
      await setDoc(docRef, this.state, { merge: true });
    } catch (e) {
      console.error("Failed to sync exam session to Firebase", e);
    }
  }
}

export const examSessionStore = ExamSessionStore.getInstance();
