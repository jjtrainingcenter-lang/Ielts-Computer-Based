import { Candidate, IELTSTest, CandidateTestResult } from '../types';
import { ACADEMIC_TEST_1 } from '../data/mockTests';
import { db, isConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';

const LOCAL_CANDIDATES_KEY = 'jj_cbt_candidates_v2';
const LOCAL_CUSTOM_TESTS_KEY = 'jj_cbt_custom_tests_v2';
const LOCAL_RESULTS_KEY = 'jj_cbt_results_v2';
export const SESSION_STORAGE_KEY = 'jj_cbt_active_session_v2';

// Additional default mock test so multiple tests exist out of the box
export const ACADEMIC_TEST_2: IELTSTest = {
  id: 'jj-ielts-acad-02',
  title: 'JJ Academy Academic Practice Test 2 (Advanced)',
  module: 'academic',
  description: 'Full 4-module test with Focus on Atmospheric Sciences and Marine Biology.',
  assignedToAll: false,
  durationMinutes: 60,
  listeningData: [
    {
      partNumber: 1,
      title: 'Part 1: International Conference Registration Enquiry',
      audioDuration: 360,
      instructions: 'Questions 1–10. Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      transcript: `[Host]: Good afternoon, Global Climate Summit registration desk. How may I assist you today?
[Participant]: Hello, I would like to register for the upcoming environmental symposium. My name is Dr. Eleanor Vance.
[Host]: Certainly, Dr. Vance. Which delegate tier will you be joining under?
[Participant]: I will attend as an Academic Speaker.
[Host]: Excellent. The main venue is the Grand Horizon Centre on 12 Marina Boulevard, post code SW1A 2AA.
[Host]: The speaker registration fee is 240 pounds, which covers banquet dining and conference proceedings.
[Participant]: Perfect. Is shuttle transportation provided from the central station?
[Host]: Yes, complimentary shuttle buses run every 15 minutes between Terminal A and the summit hall.`
    },
    {
      partNumber: 2,
      title: 'Part 2: Botanic Gardens Conservation Walk',
      audioDuration: 420,
      instructions: 'Questions 11–20. Choose the correct letter, A, B, or C.',
      transcript: `[Guide]: Welcome to the Heritage Botanic Reserve. We house over 5,000 rare alpine and tropical plant species...`
    }
  ],
  listeningQuestions: [
    {
      id: 't2_l1',
      section: 'listening',
      partNumber: 1,
      questionNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS.',
      questionText: 'Participant Surname: Dr. Eleanor __________',
      type: 'fill-blank',
      correctAnswer: 'Vance',
      explanation: 'The delegate introduces herself as Dr. Eleanor Vance.'
    },
    {
      id: 't2_l2',
      section: 'listening',
      partNumber: 1,
      questionNumber: 2,
      instruction: 'Write NO MORE THAN TWO WORDS.',
      questionText: 'Delegate Category: Academic __________',
      type: 'fill-blank',
      correctAnswer: 'Speaker',
      explanation: 'She registers as an Academic Speaker.'
    },
    {
      id: 't2_l3',
      section: 'listening',
      partNumber: 1,
      questionNumber: 3,
      instruction: 'Write ONE WORD AND/OR A NUMBER.',
      questionText: 'Venue: 12 Marina __________',
      type: 'fill-blank',
      correctAnswer: 'Boulevard',
      explanation: 'The venue address is 12 Marina Boulevard.'
    },
    {
      id: 't2_l4',
      section: 'listening',
      partNumber: 1,
      questionNumber: 4,
      instruction: 'Write ONE NUMBER ONLY.',
      questionText: 'Speaker registration fee: £__________',
      type: 'fill-blank',
      correctAnswer: '240',
      explanation: 'The fee stated is 240 pounds.'
    },
    {
      id: 't2_l5',
      section: 'listening',
      partNumber: 1,
      questionNumber: 5,
      instruction: 'Write ONE NUMBER ONLY.',
      questionText: 'Complimentary shuttles depart every __________ minutes.',
      type: 'fill-blank',
      correctAnswer: '15',
      explanation: 'Shuttle buses run every 15 minutes.'
    }
  ],
  readingPassages: [
    {
      id: 't2_p1',
      title: 'Passage 1: Glacial Hydrodynamics and Sea Level Projections',
      subtitle: 'Modern satellite radar altimetry sheds light on subglacial water networks.',
      partNumber: 1,
      paragraphs: [
        {
          id: 'A',
          text: 'Polar ice sheets in Greenland and Antarctica are not static frozen monoliths; they are dynamic hydrological systems permeated by basal meltwater channels. High-frequency radar sounding from polar-orbiting satellites has revealed vast subglacial lake systems lubricating the bedrock interface.'
        },
        {
          id: 'B',
          text: 'This basal lubrication accelerates ice stream velocity toward coastal fjords. When seasonal surface melt drains through vertical fissures known as moulins, hydrostatic pressure spikes at the bedrock, surging outlet glaciers by up to 35 percent during summer peak temperatures.'
        }
      ]
    }
  ],
  readingQuestions: [
    {
      id: 't2_r1',
      section: 'reading',
      passageId: 't2_p1',
      partNumber: 1,
      questionNumber: 1,
      instruction: 'Do the following statements agree with the text? Write TRUE, FALSE, or NOT GIVEN.',
      questionText: 'Subglacial lakes act as lubricants reducing friction between ice and bedrock.',
      type: 'true-false-not-given',
      options: [{ value: 'TRUE', label: 'TRUE' }, { value: 'FALSE', label: 'FALSE' }, { value: 'NOT GIVEN', label: 'NOT GIVEN' }],
      correctAnswer: 'TRUE',
      explanation: 'Paragraph A confirms subglacial lake networks lubricate the bedrock interface.'
    },
    {
      id: 't2_r2',
      section: 'reading',
      passageId: 't2_p1',
      partNumber: 1,
      questionNumber: 2,
      instruction: 'Write ONE WORD ONLY from the passage.',
      questionText: 'Vertical cracks through which surface meltwater drains are called ________.',
      type: 'fill-blank',
      correctAnswer: 'moulins',
      explanation: 'Paragraph B explicitly refers to vertical fissures known as moulins.'
    }
  ],
  writingTasks: [
    {
      taskNumber: 1,
      title: 'Writing Task 1: Atmospheric Carbon Capture Facility Output (2020-2026)',
      prompt: 'The chart details metric tons of carbon captured per annum across three regional direct-air capture facilities. Summarize the main features and make comparisons. Write at least 150 words.',
      minWordCount: 150,
      timeLimitMinutes: 20
    },
    {
      taskNumber: 2,
      title: 'Writing Task 2: Space Exploration vs Terrestrial Environmental Protection',
      prompt: 'Some argue that governments should invest heavily in space exploration to find alternative resources. Others believe all public funding must prioritize solving environmental crises on Earth. Discuss both views and give your opinion.',
      minWordCount: 250,
      timeLimitMinutes: 40
    }
  ],
  speakingTasks: [
    {
      partNumber: 1,
      title: 'Part 1: Environmental Awareness',
      topic: 'Weather, Nature, and Renewable Energy',
      questions: ['How has the climate in your region changed in recent years?', 'Do you prefer outdoor activities in cold or warm weather?']
    }
  ]
};

export const GENERAL_TEST_1: IELTSTest = {
  id: 'jj-ielts-gen-01',
  title: 'JJ Academy General Training Practice Test 1',
  module: 'general',
  description: 'General Training IELTS module focusing on workplace scenarios, notices, and everyday correspondence.',
  assignedToAll: true,
  durationMinutes: 60,
  listeningData: ACADEMIC_TEST_1.listeningData,
  listeningQuestions: ACADEMIC_TEST_1.listeningQuestions,
  readingPassages: [
    {
      id: 'gen_p1',
      title: 'Section 1: Community Leisure Centre Guidelines & Workplace Safety Protocols',
      partNumber: 1,
      paragraphs: [
        {
          id: 'A',
          text: 'All members utilizing the Riverside Sports Complex must present an active membership card at the main turnstiles. Lockers require a refundable £1 coin. Lockers are cleared nightly at 10:00 PM.'
        },
        {
          id: 'B',
          text: 'Personal training sessions must be booked at least 24 hours in advance via the mobile application. Cancellations made with less than 6 hours notice will incur a 50% cancellation fee.'
        }
      ]
    }
  ],
  readingQuestions: [
    {
      id: 'gen_r1',
      section: 'reading',
      passageId: 'gen_p1',
      partNumber: 1,
      questionNumber: 1,
      instruction: 'Write ONE WORD AND/OR A NUMBER from the notice.',
      questionText: 'Lockers require a refundable deposit of £__________.',
      type: 'fill-blank',
      correctAnswer: '1',
      explanation: 'Paragraph A specifies a refundable 1 pound coin.'
    },
    {
      id: 'gen_r2',
      section: 'reading',
      passageId: 'gen_p1',
      partNumber: 1,
      questionNumber: 2,
      instruction: 'Write ONE NUMBER ONLY.',
      questionText: 'Lockers are cleared every evening at __________ PM.',
      type: 'fill-blank',
      correctAnswer: '10:00',
      explanation: 'Cleared nightly at 10:00 PM.'
    }
  ],
  writingTasks: [
    {
      taskNumber: 1,
      title: 'Writing Task 1: Formal Letter to Local Council Regarding Road Repairs',
      prompt: 'You recently noticed severe potholes causing traffic delays in your neighborhood. Write a letter to your local municipal council explaining the problem, its impact, and requesting prompt repairs. Write at least 150 words.',
      minWordCount: 150,
      timeLimitMinutes: 20
    },
    {
      taskNumber: 2,
      title: 'Writing Task 2: Work-Life Balance and Remote Working',
      prompt: 'Many companies now allow employees to work entirely from home. Discuss advantages and disadvantages of this trend for workers and employers. Write at least 250 words.',
      minWordCount: 250,
      timeLimitMinutes: 40
    }
  ],
  speakingTasks: ACADEMIC_TEST_1.speakingTasks
};

// Initial built-in candidates with 6-digit registration numbers
export const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: '123456',
    name: 'Sarah Jenkins',
    dob: '2001-05-14',
    assignedTestIds: ['jj-ielts-acad-01', 'jj-ielts-acad-02'],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '884920',
    name: 'Rahul Sharma',
    dob: '1998-11-23',
    assignedTestIds: ['jj-ielts-acad-01', 'jj-ielts-gen-01'],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '654321',
    name: 'David Chen',
    dob: '2002-08-09',
    assignedTestIds: ['jj-ielts-acad-01'],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '492018',
    name: 'Emily Watson',
    dob: '1999-03-30',
    assignedTestIds: ['jj-ielts-acad-01', 'jj-ielts-acad-02', 'jj-ielts-gen-01'],
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

// Helper to generate a unique 6-digit Registration Number
export const generateUniqueRegNumber = (existingCandidates: Candidate[]): string => {
  const existingIds = new Set(existingCandidates.map(c => c.id.trim()));
  let attempts = 0;
  while (attempts < 1000) {
    // Generate 6 digit number between 100000 and 999999
    const num = Math.floor(100000 + Math.random() * 900000).toString();
    if (!existingIds.has(num)) {
      return num;
    }
    attempts++;
  }
  return (Date.now() % 1000000).toString().padStart(6, '0');
};

// Load all candidates (combining local storage & Firestore if configured)
export const getCandidates = async (): Promise<Candidate[]> => {
  let localCandidates: Candidate[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_CANDIDATES_KEY);
    if (raw) {
      localCandidates = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading local candidates', e);
  }

  if (localCandidates.length === 0) {
    localCandidates = [...DEFAULT_CANDIDATES];
    localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(localCandidates));
  }

  if (isConfigured) {
    try {
      const colRef = collection(db, 'candidates');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const cloudCandidates = snap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate));
        // Merge cloud candidates with local candidates
        const mergedMap = new Map<string, Candidate>();
        localCandidates.forEach(c => mergedMap.set(c.id, c));
        cloudCandidates.forEach(c => mergedMap.set(c.id, c));
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(merged));
        return merged;
      } else {
        // Seed first batch to cloud
        for (const cand of localCandidates) {
          try {
            await setDoc(doc(db, 'candidates', cand.id), cand);
          } catch (err) {}
        }
      }
    } catch (e) {
      console.warn('Could not sync with firestore candidates', e);
    }
  }

  return localCandidates;
};

// Save / Create / Update a candidate
export const saveCandidate = async (candidate: Candidate): Promise<void> => {
  const current = await getCandidates();
  const index = current.findIndex(c => c.id === candidate.id);
  let updated: Candidate[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = candidate;
  } else {
    updated = [candidate, ...current];
  }
  localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(updated));

  if (isConfigured) {
    try {
      await setDoc(doc(db, 'candidates', candidate.id), candidate);
    } catch (e) {
      console.error('Error writing candidate to firestore', e);
    }
  }
};

// Delete a candidate
export const deleteCandidate = async (candidateId: string): Promise<void> => {
  const current = await getCandidates();
  const updated = current.filter(c => c.id !== candidateId);
  localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(updated));

  if (isConfigured) {
    try {
      await deleteDoc(doc(db, 'candidates', candidateId));
    } catch (e) {
      console.error('Error deleting candidate from firestore', e);
    }
  }
};

// Get all tests (Mock + Custom tests created by Admin)
export const getAllTests = async (): Promise<IELTSTest[]> => {
  const baseTests = [ACADEMIC_TEST_1, ACADEMIC_TEST_2, GENERAL_TEST_1];
  let customTests: IELTSTest[] = [];

  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_TESTS_KEY);
    if (raw) {
      customTests = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error parsing custom tests', e);
  }

  if (isConfigured) {
    try {
      const snap = await getDocs(collection(db, 'tests'));
      if (!snap.empty) {
        const cloudTests = snap.docs.map(d => d.data() as IELTSTest);
        // Merge cloud tests with custom tests
        const testMap = new Map<string, IELTSTest>();
        baseTests.forEach(t => testMap.set(t.id, t));
        customTests.forEach(t => testMap.set(t.id, t));
        cloudTests.forEach(t => testMap.set(t.id, t));
        return Array.from(testMap.values());
      }
    } catch (e) {
      console.warn('Could not sync with firestore tests', e);
    }
  }

  const combinedMap = new Map<string, IELTSTest>();
  baseTests.forEach(t => combinedMap.set(t.id, t));
  customTests.forEach(t => combinedMap.set(t.id, t));
  return Array.from(combinedMap.values());
};

// Save a test (created or edited by admin)
export const saveTest = async (test: IELTSTest): Promise<void> => {
  const customRaw = localStorage.getItem(LOCAL_CUSTOM_TESTS_KEY);
  let customList: IELTSTest[] = customRaw ? JSON.parse(customRaw) : [];
  const idx = customList.findIndex(t => t.id === test.id);
  if (idx >= 0) {
    customList[idx] = test;
  } else {
    customList.push(test);
  }
  localStorage.setItem(LOCAL_CUSTOM_TESTS_KEY, JSON.stringify(customList));

  if (isConfigured) {
    try {
      await setDoc(doc(db, 'tests', test.id), test);
    } catch (e) {
      console.error('Error saving test to firestore', e);
    }
  }
};

// Delete a test
export const deleteTest = async (testId: string): Promise<void> => {
  const customRaw = localStorage.getItem(LOCAL_CUSTOM_TESTS_KEY);
  if (customRaw) {
    const customList: IELTSTest[] = JSON.parse(customRaw);
    const updated = customList.filter(t => t.id !== testId);
    localStorage.setItem(LOCAL_CUSTOM_TESTS_KEY, JSON.stringify(updated));
  }

  if (isConfigured) {
    try {
      await deleteDoc(doc(db, 'tests', testId));
    } catch (e) {
      console.error('Error deleting test from firestore', e);
    }
  }
};

// Get all tests assigned to a specific candidate registration ID
export const getAssignedTestsForCandidate = async (
  candidateRegId: string,
  candidateDob?: string
): Promise<{ candidate: Candidate | null; tests: IELTSTest[] }> => {
  const candidates = await getCandidates();
  const allTests = await getAllTests();

  const foundCandidate = candidates.find(
    c => c.id.trim() === candidateRegId.trim() &&
    (!candidateDob || c.dob.trim() === candidateDob.trim())
  );

  if (!foundCandidate) {
    return { candidate: null, tests: [] };
  }

  // Filter tests that match candidate's assignedTestIds OR test.assignedToAll OR allowedCandidateIds
  const assigned = allTests.filter(t => {
    if (t.assignedToAll) return true;
    if (foundCandidate.assignedTestIds && foundCandidate.assignedTestIds.includes(t.id)) return true;
    if (t.allowedCandidateIds && t.allowedCandidateIds.includes(foundCandidate.id)) return true;
    return false;
  });

  return { candidate: foundCandidate, tests: assigned };
};

// Save candidate test results
export const saveTestResult = async (result: CandidateTestResult): Promise<void> => {
  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    const results: CandidateTestResult[] = raw ? JSON.parse(raw) : [];
    results.unshift(result);
    localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
  } catch (e) {
    console.error('Error saving local test result', e);
  }

  if (isConfigured) {
    try {
      await addDoc(collection(db, 'results'), result);
    } catch (e) {
      console.error('Error uploading test result to firestore', e);
    }
  }
};

// Get all test results for Admin view
export const getAllTestResults = async (): Promise<CandidateTestResult[]> => {
  let localResults: CandidateTestResult[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    if (raw) localResults = JSON.parse(raw);
  } catch (e) {}

  if (isConfigured) {
    try {
      const snap = await getDocs(collection(db, 'results'));
      if (!snap.empty) {
        const cloud = snap.docs.map(d => ({ id: d.id, ...d.data() } as CandidateTestResult));
        return cloud.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    } catch (e) {}
  }

  return localResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
