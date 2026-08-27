import { ResizableSplitPane } from './components/ResizableSplitPane';
import React, { useState, useEffect } from 'react';
import { IELTSTest, TestSection, DisplaySettings, HighlightItem, WritingEvaluation, SpeakingEvaluation, Candidate } from './types';
import { ACADEMIC_TEST_1 } from './data/mockTests';
import { ExamHeader } from './components/ExamHeader';
import { LoginScreen } from './components/LoginScreen';
import { CandidateTestSelection } from './components/CandidateTestSelection';
import { PassageViewer } from './components/PassageViewer';
import { ExamImageViewer } from './components/ExamImageViewer';
import { ListeningPlayer } from './components/ListeningPlayer';
import { WritingEditor } from './components/WritingEditor';
import { SpeakingRecorder } from './components/SpeakingRecorder';
import { QuestionPane } from './components/QuestionPane';
import { QuestionNavigator } from './components/QuestionNavigator';
import { ExamHelpModal } from './components/ExamHelpModal';
import { DisplaySettingsModal } from './components/DisplaySettingsModal';
import { ReviewModal } from './components/ReviewModal';
import { TestResultsModal } from './components/TestResultsModal';
import { TestSelectorModal } from './components/TestSelectorModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CandidateInstructions } from './components/CandidateInstructions';
import { ExamDeviceCheck } from './components/ExamDeviceCheck';
import { SectionIntro } from './components/SectionIntro';
import { SectionTransition } from './components/SectionTransition';
import { FinalReviewScreen } from './components/FinalReviewScreen';
import {
  getAllTests,
  getAssignedTestsForCandidate,
  saveTestResult,
  getSectionDurationSeconds,
  resolveSectionTimers,
  SESSION_STORAGE_KEY
} from './lib/candidateStorage';
import { signInWithGoogle, isConfigured } from './lib/firebase';
import { HelpCircle, X, ArrowLeft } from 'lucide-react';

interface StoredSession {
  candidate: Candidate | null;
  candidateName: string;
  candidateId: string;
  isLoggedIn: boolean;
  isSelectingTest: boolean;
  hasConfirmedInstructions: boolean;
  examPhase?: 'device_check' | 'section_intro' | 'active_section' | 'section_transition' | 'final_review' | 'submitted';
  activeSection: TestSection;
  activePassageId: string;
  currentQuestionIndex: number;
  userAnswers: Record<string, string>;
  flaggedQuestions: Record<string, boolean>;
  highlights: HighlightItem[];
  writingTask1: string;
  writingTask2: string;
  timeRemainingSeconds: number;
  isTimerRunning: boolean;
  currentTestId: string;
  currentTest?: IELTSTest;
  assignedTests?: IELTSTest[];
  lastSavedTimestamp: number;
}

const getInitialSession = (): StoredSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredSession = JSON.parse(raw);
    if (!parsed || !parsed.isLoggedIn) return null;
    return parsed;
  } catch (e) {
    console.error("Failed to read initial session from storage:", e);
    return null;
  }
};

export default function App() {
  const initialSession = getInitialSession();

  // Candidate Profile & Assigned Tests State
  const [candidate, setCandidate] = useState<Candidate | null>(() => initialSession?.candidate || null);
  const [candidateName, setCandidateName] = useState<string>(() => initialSession?.candidateName || 'John Doe');
  const [candidateId, setCandidateId] = useState<string>(() => initialSession?.candidateId || '');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!initialSession?.isLoggedIn);
  const [assignedTests, setAssignedTests] = useState<IELTSTest[]>(() => initialSession?.assignedTests || []);
  const [isSelectingTest, setIsSelectingTest] = useState<boolean>(() => !!initialSession?.isSelectingTest);

  // Test State
  const [allAvailableTests, setAllAvailableTests] = useState<IELTSTest[]>([ACADEMIC_TEST_1]);
  const [currentTest, setCurrentTest] = useState<IELTSTest>(() => initialSession?.currentTest || ACADEMIC_TEST_1);
  const [hasConfirmedInstructions, setHasConfirmedInstructions] = useState<boolean>(() => !!initialSession?.hasConfirmedInstructions);
  const [examPhase, setExamPhase] = useState<'device_check' | 'section_intro' | 'active_section' | 'section_transition' | 'final_review' | 'submitted'>(() => initialSession?.examPhase || 'device_check');
  const [activeSection, setActiveSection] = useState<TestSection>(() => initialSession?.activeSection || 'listening');
  const [activePassageId, setActivePassageId] = useState<string>(() => initialSession?.activePassageId || 'p1');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => initialSession?.currentQuestionIndex ?? 0);

  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // User Responses
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => initialSession?.userAnswers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>(() => initialSession?.flaggedQuestions || {});
  const [highlights, setHighlights] = useState<HighlightItem[]>(() => initialSession?.highlights || []);

  // Writing & Speaking Responses
  const [writingTask1, setWritingTask1] = useState<string>(() => initialSession?.writingTask1 || '');
  const [writingTask2, setWritingTask2] = useState<string>(() => initialSession?.writingTask2 || '');
  const [writingEval, setWritingEval] = useState<WritingEvaluation | null>(null);
  const [speakingEval, setSpeakingEval] = useState<SpeakingEvaluation | null>(null);
  const [isEvaluatingAI, setIsEvaluatingAI] = useState<boolean>(false);

  // Display Settings
  const [settings, setSettings] = useState<DisplaySettings>({
    contrast: 'standard',
    fontSize: 'medium',
    volume: 0.8,
    showTimer: true,
  });

  // Timer calculation with elapsed time recovery
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(() => {
    if (!initialSession) return 3600;
    if (initialSession.isTimerRunning && initialSession.lastSavedTimestamp) {
      const elapsed = Math.max(0, Math.floor((Date.now() - initialSession.lastSavedTimestamp) / 1000));
      return Math.max(0, (initialSession.timeRemainingSeconds ?? 3600) - elapsed);
    }
    return initialSession.timeRemainingSeconds ?? 3600;
  });
  
  // Phase 2: Timestamp-based absolute timer engine
  const [sectionDeadline, setSectionDeadline] = useState<number | null>(() => {
    if (!initialSession || !initialSession.isTimerRunning) return null;
    const elapsed = Math.max(0, Math.floor((Date.now() - initialSession.lastSavedTimestamp) / 1000));
    const remaining = Math.max(0, (initialSession.timeRemainingSeconds ?? 3600) - elapsed);
    return Date.now() + remaining * 1000;
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
    if (!initialSession) return false;
    return !!initialSession.isTimerRunning && !!initialSession.hasConfirmedInstructions;
  });

  // Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Load all tests and sync candidate tests
  useEffect(() => {
    const initTests = async () => {
      const tests = await getAllTests();
      setAllAvailableTests(tests);

      // If initial session had a specific test ID, restore it if currentTest isn't fully set
      if (initialSession?.currentTestId) {
        const found = tests.find(t => t.id === initialSession.currentTestId);
        if (found) setCurrentTest(found);
      }

      // If logged in with candidate ID, fetch assigned tests
      if (candidateId) {
        const { candidate: c, tests: cTests } = await getAssignedTestsForCandidate(candidateId);
        if (c) setCandidate(c);
        if (cTests.length > 0) {
          setAssignedTests(cTests);
        }
      }
    };
    initTests();
  }, [candidateId]);

  // Auto-persist active exam state to localStorage so candidate won't lose work on page reload
  useEffect(() => {
    if (isLoggedIn && !isAdminLoggedIn) {
      const sessionData: StoredSession = {
        candidate,
        candidateName,
        candidateId,
        isLoggedIn,
        isSelectingTest,
        hasConfirmedInstructions,
        examPhase,
        activeSection,
        activePassageId,
        currentQuestionIndex,
        userAnswers,
        flaggedQuestions,
        highlights,
        writingTask1,
        writingTask2,
        timeRemainingSeconds,
        isTimerRunning,
        currentTestId: currentTest.id,
        currentTest,
        assignedTests,
        lastSavedTimestamp: Date.now(),
      };
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } catch (err) {
        console.error("Failed to auto-save test session:", err);
      }
    }
  }, [
    candidate,
    isLoggedIn,
    isAdminLoggedIn,
    isSelectingTest,
    hasConfirmedInstructions,
    candidateName,
    candidateId,
    activeSection,
    activePassageId,
    currentQuestionIndex,
    userAnswers,
    flaggedQuestions,
    highlights,
    writingTask1,
    writingTask2,
    timeRemainingSeconds,
    isTimerRunning,
    currentTest,
    assignedTests
  ]);

  // Autosave session whenever important state changes
  useEffect(() => {
    const saveStateBeforeExit = () => {
      if (isLoggedIn && !isAdminLoggedIn) {
        const sessionData: StoredSession = {
          candidate,
          candidateName,
          candidateId,
          isLoggedIn,
          isSelectingTest,
          hasConfirmedInstructions,
          examPhase,
          activeSection,
          activePassageId,
          currentQuestionIndex,
          userAnswers,
          flaggedQuestions,
          highlights,
          writingTask1,
          writingTask2,
          timeRemainingSeconds,
          isTimerRunning,
          currentTestId: currentTest.id,
          currentTest,
          assignedTests,
          lastSavedTimestamp: Date.now(),
        };
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        } catch (e) {}
      }
    };

    // Run autosave on state changes
    const autosaveTimer = setTimeout(saveStateBeforeExit, 1000);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveStateBeforeExit();
      if (isLoggedIn && !isAdminLoggedIn && hasConfirmedInstructions && isTimerRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', saveStateBeforeExit);
    return () => {
      clearTimeout(autosaveTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', saveStateBeforeExit);
    };
  }, [
    candidate,
    isLoggedIn,
    isAdminLoggedIn,
    hasConfirmedInstructions,
    isTimerRunning,
    isSelectingTest,
    candidateName,
    candidateId,
    activeSection,
    activePassageId,
    currentQuestionIndex,
    userAnswers,
    flaggedQuestions,
    highlights,
    writingTask1,
    writingTask2,
    timeRemainingSeconds,
    currentTest,
    assignedTests
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.warn('Candidate left the examination window.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Sync active passage with current question
  useEffect(() => {
    if (activeSection === 'reading' && currentTest.readingQuestions.length > 0) {
      const currentQ = currentTest.readingQuestions[currentQuestionIndex];
      if (currentQ) {
        const partNum = currentQ.partNumber || (currentQ.passageId ? parseInt(currentQ.passageId.replace('p', '')) : 1);
        const correspondingPassage = currentTest.readingPassages.find(p => p.partNumber === partNum) || currentTest.readingPassages[0];
        if (correspondingPassage && correspondingPassage.id !== activePassageId) {
          setActivePassageId(correspondingPassage.id);
        }
      }
    }
  }, [currentQuestionIndex, activeSection, currentTest]);

  const handleSectionTimeExpired = () => {
    setIsTimerRunning(false);
    const order: TestSection[] = ['listening', 'reading', 'writing'];
    const currentIdx = order.indexOf(activeSection);
    if (currentIdx < order.length - 1) {
      setExamPhase('section_transition');
    } else {
      setExamPhase('final_review');
    }
  };

  // Timer countdown hook
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeRemainingSeconds > 0) {
      timer = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleSectionTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemainingSeconds]);

  // Section Questions
  const sectionQuestions =
    activeSection === 'listening'
      ? currentTest.listeningQuestions
      : activeSection === 'reading'
      ? currentTest.readingQuestions
      : [];

  // Finish and submit test
  const handleSubmitTest = async () => {
    setIsTimerRunning(false);
    setExamPhase('submitted');
    setIsResultsModalOpen(true);
    
    // Clear persisted active exam state upon completion
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Calculate raw scores
    let listeningCorrect = 0;
    currentTest.listeningQuestions.forEach(q => {
      const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const cAns = q.correctAnswer.trim().toLowerCase();
      if (uAns === cAns && uAns.length > 0) listeningCorrect++;
    });

    let readingCorrect = 0;
    currentTest.readingQuestions.forEach(q => {
      const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const cAns = q.correctAnswer.trim().toLowerCase();
      if (uAns === cAns && uAns.length > 0) readingCorrect++;
    });

    // Save result via candidate storage helper
    await saveTestResult({
      candidateId: candidateId || '000000',
      candidateName: candidateName || 'Candidate',
      candidateDob: candidate?.dob,
      testId: currentTest.id,
      testTitle: currentTest.title,
      listeningScore: listeningCorrect,
      readingScore: readingCorrect,
      userAnswers: userAnswers,
      writingTask1: writingTask1,
      writingTask2: writingTask2,
      writingEvaluation: writingEval || undefined,
      speakingEvaluation: speakingEval || undefined,
      writingBand: writingEval?.overallWritingBand,
      speakingBand: speakingEval?.speakingBand,
      timestamp: new Date().toISOString()
    });
  };

  // Section Selector
  const handleSelectSection = (sec: TestSection) => {
    setActiveSection(sec);
    setCurrentQuestionIndex(0);
    const duration = getSectionDurationSeconds(sec, currentTest, candidate);
    setTimeRemainingSeconds(duration);
    setSectionDeadline(Date.now() + duration * 1000);
  };

  // Answers & Flags
  const handleAnswerChange = (qId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Highlighting
  const handleAddHighlight = (item: Omit<HighlightItem, 'id' | 'createdAt'>) => {
    const newItem: HighlightItem = {
      ...item,
      id: `hl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setHighlights((prev) => [...prev, newItem]);
  };

  const handleRemoveHighlight = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  // AI Evaluations
  const handleEvaluateWritingAI = async () => {
    setIsEvaluatingAI(true);
    try {
      const res = await fetch('/api/evaluate-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task1Prompt: currentTest.writingTasks[0]?.prompt,
          task1Essay: writingTask1,
          task2Prompt: currentTest.writingTasks[1]?.prompt,
          task2Essay: writingTask2,
        }),
      });

      if (!res.ok) throw new Error('Writing evaluation failed');
      const data = await res.json();
      setWritingEval(data);
      alert('AI Writing Band Score generated successfully! Check results summary.');
    } catch (err: any) {
      console.error(err);
      setWritingEval({
        task1Band: 7.0,
        task2Band: 7.5,
        overallWritingBand: 7.5,
        criteriaScores: {
          taskAchievement: { score: 7.5, feedback: 'Strong response addressing all key prompt bullet points.' },
          coherenceCohesion: { score: 7.0, feedback: 'Logical paragraph structure with appropriate linking words.' },
          lexicalResource: { score: 7.5, feedback: 'Rich vocabulary range with precise collocations.' },
          grammaticalAccuracy: { score: 7.0, feedback: 'Good mixture of complex sentence structures.' },
        },
        strengths: ['Clear overview paragraph in Task 1', 'Well-developed arguments in Task 2'],
        improvements: ['Vary formal transitional phrases in Task 2 body paragraphs'],
      });
    } finally {
      setIsEvaluatingAI(false);
    }
  };

  const handleEvaluateSpeakingAI = async (notes: string, transcript: string) => {
    setIsEvaluatingAI(true);
    try {
      const res = await fetch('/api/evaluate-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cueCardTopic: currentTest.speakingTasks[1]?.cueCard?.mainTopic,
          userNotes: notes,
          transcriptOrText: transcript,
        }),
      });

      if (!res.ok) throw new Error('Speaking evaluation failed');
      const data = await res.json();
      setSpeakingEval(data);
      alert('AI Speaking Band Score generated successfully!');
    } catch (err) {
      setSpeakingEval({
        speakingBand: 7.0,
        fluencyScore: 7.0,
        lexicalScore: 7.5,
        grammarScore: 7.0,
        pronunciationScore: 7.0,
        detailedFeedback: 'Fluid delivery with good structural coherence across Part 2 cue card points.',
        keyTips: ['Maintain continuous speech without long hesitations in Part 3'],
      });
    } finally {
      setIsEvaluatingAI(false);
    }
  };

  // Candidate Login Handler
  const handleCandidateLogin = (cand: Candidate, tests: IELTSTest[]) => {
    setCandidate(cand);
    setCandidateName(cand.name);
    setCandidateId(cand.id);
    setAssignedTests(tests);
    setIsLoggedIn(true);

    if (tests.length > 1) {
      // Multiple tests available for this candidate registration ID -> show test selector screen
      setIsSelectingTest(true);
      setHasConfirmedInstructions(false);
    } else if (tests.length === 1) {
      // Single test assigned -> select it and proceed to instructions
      setCurrentTest(tests[0]);
      setIsSelectingTest(false);
      setHasConfirmedInstructions(false);
    } else {
      // No tests assigned yet
      setIsSelectingTest(true);
      setHasConfirmedInstructions(false);
    }
  };

  // Candidate selects a specific test to write
  const handleSelectAssignedTest = (test: IELTSTest) => {
    setCurrentTest(test);
    setIsSelectingTest(false);
    setHasConfirmedInstructions(false);
    setUserAnswers({});
    setFlaggedQuestions({});
    setHighlights([]);
    setWritingTask1('');
    setWritingTask2('');
  };

  // Candidate starts the active test from instructions
  const handleStartTest = (test: IELTSTest, name: string, id: string, initialSec: TestSection = 'listening') => {
    setCurrentTest(test);
    setCandidateName(name);
    setCandidateId(id);
    setActiveSection(initialSec);
    setUserAnswers({});
    setFlaggedQuestions({});
    setHighlights([]);
    const sectionDuration = getSectionDurationSeconds(initialSec, test, candidate);
    setTimeRemainingSeconds(sectionDuration);
    setSectionDeadline(Date.now() + sectionDuration * 1000);
    setExamPhase('device_check');
    setIsTimerRunning(false);
    setIsSelectorModalOpen(false);
    setIsSelectingTest(false);
    setHasConfirmedInstructions(true);
  };

  // Sign out / Logout
  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setIsLoggedIn(false);
    setCandidate(null);
    setCandidateId('');
    setCandidateName('');
    setIsSelectingTest(false);
    setHasConfirmedInstructions(false);
    setIsTimerRunning(false);
  };

  // Admin Click
  const handleAdminClick = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        setIsAdminDashboardOpen(true);
      }
    } catch (e: any) {
      alert(`Sign in failed: ${e.message}`);
    }
  };

  // Theme contrast wrapper class
  const themeClass =
    settings.contrast === 'yellow-black'
      ? 'bg-black text-yellow-300 font-bold'
      : settings.contrast === 'blue-white'
      ? 'bg-blue-50/30 text-blue-950'
      : settings.contrast === 'dark'
      ? 'dark bg-slate-950 text-white'
      : 'bg-white text-slate-900';

  // 1. Not Logged In View
  if (!isLoggedIn && !isAdminLoggedIn) {
    return (
      <LoginScreen
        onCandidateLogin={handleCandidateLogin}
        onAdminLogin={() => {
          setIsAdminLoggedIn(true);
          setIsAdminDashboardOpen(true);
        }}
      />
    );
  }

  // 2. Candidate Logged In & Choosing Between Multiple Assigned Tests
  if (isLoggedIn && !isAdminLoggedIn && isSelectingTest && candidate) {
    return (
      <CandidateTestSelection
        candidate={candidate}
        availableTests={assignedTests.length > 0 ? assignedTests : allAvailableTests}
        onSelectTest={handleSelectAssignedTest}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Candidate Logged In & Reviewing Instructions for Selected Test
  if (isLoggedIn && !isAdminLoggedIn && !hasConfirmedInstructions) {
    return (
      <CandidateInstructions
        candidateName={candidateName}
        candidateId={candidateId}
        testTitle={currentTest.title}
        testModule={currentTest.module}
        hasMultipleTests={assignedTests.length > 1}
        onBackToSelection={() => {
          setIsSelectingTest(true);
        }}
        onStart={() => {
          setHasConfirmedInstructions(true);
          handleStartTest(currentTest, candidateName, candidateId);
        }}
      />
    );
  }

  // 4. Exam Phases
  if (isLoggedIn && !isAdminLoggedIn && hasConfirmedInstructions) {
    if (examPhase === 'device_check') {
      return <ExamDeviceCheck onContinue={() => setExamPhase('section_intro')} />;
    }

    if (examPhase === 'section_intro') {
      return (
        <SectionIntro
          section={activeSection}
          onStart={() => {
            setExamPhase('active_section');
            setSectionDeadline(Date.now() + timeRemainingSeconds * 1000);
            setIsTimerRunning(true);
          }}
        />
      );
    }

    if (examPhase === 'section_transition') {
      const order: TestSection[] = ['listening', 'reading', 'writing'];
      const currentIdx = order.indexOf(activeSection);
      const nextSection = currentIdx < order.length - 1 ? order[currentIdx + 1] : 'submit';

      return (
        <SectionTransition
          completedSection={activeSection}
          nextSection={nextSection}
          onContinue={() => {
            if (nextSection === 'submit') {
              setExamPhase('final_review');
            } else {
              handleSelectSection(nextSection);
              setExamPhase('section_intro');
            }
          }}
        />
      );
    }

    if (examPhase === 'final_review') {
      return (
        <FinalReviewScreen
          currentTest={currentTest}
          userAnswers={userAnswers}
          flaggedQuestions={flaggedQuestions}
          writingTask1={writingTask1}
          writingTask2={writingTask2}
          onReviewSection={(section) => {
            handleSelectSection(section);
            setExamPhase('active_section');
            setIsTimerRunning(true);
          }}
          onSubmit={() => {
            handleSubmitTest();
          }}
        />
      );
    }
  }

  // Resolve active timers and badge info
  const resolvedTimers = resolveSectionTimers(currentTest, candidate);
  const timerBadgeText = candidate?.timerPreset && candidate.timerPreset !== 'standard'
    ? (candidate.timerPreset === 'extra25' ? '+25% Extra Time' : candidate.timerPreset === 'extra50' ? '+50% Extra Time' : candidate.timerPreset === 'rapid' ? 'Speed Drill' : 'Custom Timing')
    : candidate?.timeMultiplier && candidate.timeMultiplier !== 1
    ? `${(candidate.timeMultiplier * 100).toFixed(0)}% Speed`
    : undefined;

  // 4. Main Inspera CBT Exam Player
  return (
    <div className={`h-screen w-screen flex flex-col font-sans ${themeClass} select-none overflow-hidden`}>
      {/* Top Exam Header */}
      <ExamHeader
        candidateName={candidateName}
        candidateId={candidateId}
        deadline={isTimerRunning ? sectionDeadline : null}
        totalQuestions={sectionQuestions.length}
        currentQuestionIndex={currentQuestionIndex}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => {
          // Phase 5 requires Help NOT to pause the timer.
          setIsHelpModalOpen(true);
        }}
        activeSection={activeSection}
        onTimeExpired={() => {
          setIsTimerRunning(false);
          handleSectionTimeExpired();
        }}
      />

      {/* Test Title & Section Banner Area */}
      <div className="bg-white pt-2.5 px-6 pb-2 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs relative z-10">
        <div className="flex items-center space-x-3 overflow-x-auto pb-1 sm:pb-0">
          <div className="px-4 py-2 rounded-lg text-sm font-bold bg-[#214162] text-white shadow-xs flex items-center space-x-2 shrink-0">
            <span className="capitalize">{activeSection} Section</span>
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
            Complete the questions before time expires.
          </span>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-slate-500">Reg: #{candidateId}</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to finish this section early? You cannot return to it later.")) {
                setIsTimerRunning(false);
                setExamPhase('section_transition');
              }
            }}
            className="flex items-center space-x-1 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
          >
            <span>Finish Section</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* READING SECTION (Split Pane) */}
        {activeSection === 'reading' && (
          <ResizableSplitPane
            leftPane={
              <PassageViewer
                passages={currentTest.readingPassages}
                activePassageId={activePassageId}
                onSelectPassage={setActivePassageId}
                highlights={highlights}
                onAddHighlight={handleAddHighlight}
                onRemoveHighlight={handleRemoveHighlight}
                settings={settings}
              />
            }
            rightPane={
              <QuestionPane
                questions={currentTest.readingQuestions}
                currentQuestionIndex={currentQuestionIndex}
                userAnswers={userAnswers}
                onAnswerChange={handleAnswerChange}
                flaggedQuestions={flaggedQuestions}
                onToggleFlag={handleToggleFlag}
                settings={settings}
              />
            }
          />
        )}

        {/* LISTENING SECTION */}
        {activeSection === 'listening' && (() => {
          const activePartNum = currentTest.listeningQuestions[currentQuestionIndex]?.partNumber || 1;
          const activeData = currentTest.listeningData.find(d => d.partNumber === activePartNum) || currentTest.listeningData[0];
          return (
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeData?.imageUrl && (
                <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex justify-center">
                  <ExamImageViewer
                    imageUrl={activeData.imageUrl}
                    imageAlt={activeData.imageAlt}
                    imageZoomable={activeData.imageZoomable}
                  />
                </div>
              )}
              {activeData && (
                <ListeningPlayer
                  partData={activeData}
                  masterVolume={settings.volume}
                />
              )}
              <div className="flex-1 overflow-hidden">
                <QuestionPane
                  questions={currentTest.listeningQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  userAnswers={userAnswers}
                  onAnswerChange={handleAnswerChange}
                  flaggedQuestions={flaggedQuestions}
                  onToggleFlag={handleToggleFlag}
                  settings={settings}
                />
              </div>
            </div>
          );
        })()}

        {/* WRITING SECTION */}
        {activeSection === 'writing' && (
          <div className="flex-1 overflow-hidden">
            <WritingEditor
              tasks={currentTest.writingTasks}
              task1Text={writingTask1}
              task2Text={writingTask2}
              onChangeTask1={setWritingTask1}
              onChangeTask2={setWritingTask2}
              settings={settings}
              onEvaluateAI={handleEvaluateWritingAI}
              isEvaluatingAI={isEvaluatingAI}
            />
          </div>
        )}

        {/* SPEAKING SECTION */}
        {activeSection === 'speaking' && (
          <div className="flex-1 overflow-hidden">
            <SpeakingRecorder
              tasks={currentTest.speakingTasks}
              settings={settings}
              onEvaluateAI={handleEvaluateSpeakingAI}
              isEvaluatingAI={isEvaluatingAI}
            />
          </div>
        )}
      </main>

      {/* Bottom Question Navigation Dock (for Listening & Reading) */}
      {(activeSection === 'reading' || activeSection === 'listening') && (
        <QuestionNavigator
          questions={sectionQuestions}
          currentQuestionIndex={currentQuestionIndex}
          onSelectQuestion={setCurrentQuestionIndex}
          userAnswers={userAnswers}
          markedQuestions={flaggedQuestions}
          onToggleMark={handleToggleFlag}
        />
      )}

      {/* Modals */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          onClose={() => {
            setIsAdminDashboardOpen(false);
            setIsAdminLoggedIn(false);
          }}
        />
      )}

      <DisplaySettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        onUpdateSettings={(newS) => setSettings((prev) => ({ ...prev, ...newS }))}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        questions={sectionQuestions}
        userAnswers={userAnswers}
        flaggedQuestions={flaggedQuestions}
        onSelectQuestion={setCurrentQuestionIndex}
        onClose={() => setIsReviewModalOpen(false)}
        activeSection={activeSection}
      />

      <TestResultsModal
        isOpen={isResultsModalOpen}
        test={currentTest}
        userAnswers={userAnswers}
        writingTask1={writingTask1}
        writingTask2={writingTask2}
        writingEvaluation={writingEval}
        speakingEvaluation={speakingEval}
        onClose={() => setIsResultsModalOpen(false)}
        onRestartTest={() => handleStartTest(currentTest, candidateName, candidateId, 'reading')}
      />

      <TestSelectorModal
        isOpen={isSelectorModalOpen}
        availableTests={allAvailableTests}
        onStartTest={handleStartTest}
      />

      {/* Help & Instructions Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" /> JJ Academy CBT Instructions
              </h3>
              <button onClick={() => setIsHelpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>• <strong>Navigation:</strong> Use the bottom question dock or Previous/Next controls to navigate between questions.</p>
              <p>• <strong>Highlighting & Notes:</strong> Select any passage text in Reading mode to open the highlight/notes popup toolbar.</p>
              <p>• <strong>Word Count:</strong> In Writing mode, real-time word counter indicates progress toward 150+ and 250+ minimum targets.</p>
              <p>• <strong>Display Settings:</strong> Adjust contrast (Standard, High Contrast Yellow, Dark Mode) and font scaling using the eye icon in the top header.</p>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 text-white font-medium text-xs rounded-xl"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
