import { Candidate, IELTSTest, CandidateTestResult } from '../types';
import { ACADEMIC_TEST_1 } from '../data/mockTests';
import { db, isConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const LOCAL_CANDIDATES_KEY = 'jj_cbt_candidates_v2';
const LOCAL_CUSTOM_TESTS_KEY = 'jj_cbt_custom_tests_v2';
const LOCAL_RESULTS_KEY = 'jj_cbt_results_v2';
const LOCAL_CATALOG_RESET_KEY = 'jj_cbt_mock_test_1_catalog_reset_v1';
const FIRESTORE_CATALOG_RESET_DOC = 'mock-test-1-catalog-reset-v1';
export const SESSION_STORAGE_KEY = 'jj_cbt_active_session_v2';

export const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: '123456',
    name: 'Sarah Jenkins',
    dob: '2001-05-14',
    assignedTestIds: [ACADEMIC_TEST_1.id],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '884920',
    name: 'Rahul Sharma',
    dob: '1998-11-23',
    assignedTestIds: [ACADEMIC_TEST_1.id],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '654321',
    name: 'David Chen',
    dob: '2002-08-09',
    assignedTestIds: [ACADEMIC_TEST_1.id],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '492018',
    name: 'Emily Watson',
    dob: '1999-03-30',
    assignedTestIds: [ACADEMIC_TEST_1.id],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const generateUniqueRegNumber = (existingCandidates: Candidate[]): string => {
  const existingIds = new Set(existingCandidates.map(c => c.id.trim()));
  let attempts = 0;
  while (attempts < 1000) {
    const num = Math.floor(100000 + Math.random() * 900000).toString();
    if (!existingIds.has(num)) return num;
    attempts++;
  }
  return (Date.now() % 1000000).toString().padStart(6, '0');
};

const resetLocalCatalogOnce = () => {
  try {
    if (localStorage.getItem(LOCAL_CATALOG_RESET_KEY) === 'done') return;
    localStorage.setItem(LOCAL_CUSTOM_TESTS_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_CATALOG_RESET_KEY, 'done');
  } catch (e) {
    console.warn('Could not reset local test catalog', e);
  }
};

const ensureInitialCloudCatalog = async () => {
  if (!isConfigured || !db) return;

  try {
    const markerRef = doc(db, 'system', FIRESTORE_CATALOG_RESET_DOC);
    const marker = await getDoc(markerRef);

    if (!marker.exists()) {
      const testsSnap = await getDocs(collection(db, 'tests'));
      for (const testDoc of testsSnap.docs) {
        if (testDoc.id !== ACADEMIC_TEST_1.id) {
          await deleteDoc(doc(db, 'tests', testDoc.id));
        }
      }

      await setDoc(doc(db, 'tests', ACADEMIC_TEST_1.id), ACADEMIC_TEST_1);
      await setDoc(markerRef, {
        completed: true,
        retainedTestId: ACADEMIC_TEST_1.id,
        completedAt: new Date().toISOString(),
      });
    } else {
      const mockTestRef = doc(db, 'tests', ACADEMIC_TEST_1.id);
      const mockTestSnap = await getDoc(mockTestRef);
      if (!mockTestSnap.exists()) {
        await setDoc(mockTestRef, ACADEMIC_TEST_1);
      }
    }
  } catch (e) {
    console.warn('Could not perform initial Firestore test catalog reset', e);
  }
};

export const getCandidates = async (): Promise<Candidate[]> => {
  let localCandidates: Candidate[] = [];

  try {
    const raw = localStorage.getItem(LOCAL_CANDIDATES_KEY);
    if (raw) localCandidates = JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local candidates', e);
  }

  if (localCandidates.length === 0) {
    localCandidates = [...DEFAULT_CANDIDATES];
    localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(localCandidates));
  }

  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'candidates'));
      if (!snap.empty) {
        const cloudCandidates = snap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate));
        const mergedMap = new Map<string, Candidate>();
        localCandidates.forEach(c => mergedMap.set(c.id, c));
        cloudCandidates.forEach(c => mergedMap.set(c.id, c));
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(merged));

        const cloudIds = new Set(cloudCandidates.map(c => c.id));
        for (const candidate of localCandidates) {
          if (!cloudIds.has(candidate.id)) {
            try {
              await setDoc(doc(db, 'candidates', candidate.id), candidate);
            } catch (e) {}
          }
        }
        return merged;
      }

      for (const candidate of localCandidates) {
        try {
          await setDoc(doc(db, 'candidates', candidate.id), candidate);
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Could not sync with Firestore candidates', e);
    }
  }

  return localCandidates;
};

export const saveCandidate = async (candidate: Candidate): Promise<void> => {
  const current = await getCandidates();
  const index = current.findIndex(c => c.id === candidate.id);
  const updated = [...current];

  if (index >= 0) updated[index] = candidate;
  else updated.unshift(candidate);

  localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(updated));

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'candidates', candidate.id), candidate);
    } catch (e) {
      console.error('Error writing candidate to Firestore', e);
    }
  }
};

export const deleteCandidate = async (candidateId: string): Promise<void> => {
  const current = await getCandidates();
  const updated = current.filter(c => c.id !== candidateId);
  localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(updated));

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'candidates', candidateId));
    } catch (e) {
      console.error('Error deleting candidate from Firestore', e);
    }
  }
};

export const getAllTests = async (): Promise<IELTSTest[]> => {
  resetLocalCatalogOnce();
  await ensureInitialCloudCatalog();

  const testMap = new Map<string, IELTSTest>();
  testMap.set(ACADEMIC_TEST_1.id, ACADEMIC_TEST_1);

  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_TESTS_KEY);
    if (raw) {
      const customTests: IELTSTest[] = JSON.parse(raw);
      customTests.forEach(test => testMap.set(test.id, test));
    }
  } catch (e) {
    console.error('Error parsing custom tests', e);
  }

  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'tests'));
      snap.docs.forEach(testDoc => {
        const data = testDoc.data() as IELTSTest;
        testMap.set(data.id || testDoc.id, { ...data, id: data.id || testDoc.id });
      });
    } catch (e) {
      console.warn('Could not sync with Firestore tests', e);
    }
  }

  const tests = Array.from(testMap.values());
  const customTests = tests.filter(test => test.id !== ACADEMIC_TEST_1.id);
  localStorage.setItem(LOCAL_CUSTOM_TESTS_KEY, JSON.stringify(customTests));
  return tests;
};

export const saveTest = async (test: IELTSTest): Promise<void> => {
  const raw = localStorage.getItem(LOCAL_CUSTOM_TESTS_KEY);
  const customList: IELTSTest[] = raw ? JSON.parse(raw) : [];
  const index = customList.findIndex(t => t.id === test.id);

  if (index >= 0) customList[index] = test;
  else customList.push(test);

  localStorage.setItem(LOCAL_CUSTOM_TESTS_KEY, JSON.stringify(customList));

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'tests', test.id), test);
    } catch (e) {
      console.error('Error saving test to Firestore', e);
    }
  }
};

export const deleteTest = async (testId: string): Promise<void> => {
  const raw = localStorage.getItem(LOCAL_CUSTOM_TESTS_KEY);
  if (raw) {
    const customList: IELTSTest[] = JSON.parse(raw);
    localStorage.setItem(
      LOCAL_CUSTOM_TESTS_KEY,
      JSON.stringify(customList.filter(test => test.id !== testId)),
    );
  }

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'tests', testId));
    } catch (e) {
      console.error('Error deleting test from Firestore', e);
    }
  }
};

export const getAssignedTestsForCandidate = async (
  candidateRegId: string,
  candidateDob?: string,
): Promise<{ candidate: Candidate | null; tests: IELTSTest[] }> => {
  const candidates = await getCandidates();
  const allTests = await getAllTests();

  const foundCandidate = candidates.find(
    c => c.id.trim() === candidateRegId.trim() &&
      (!candidateDob || c.dob.trim() === candidateDob.trim()),
  );

  if (!foundCandidate) return { candidate: null, tests: [] };

  const assigned = allTests.filter(test => {
    if (test.status && test.status !== 'published') return false;
    if (test.assignedToAll) return true;
    if (foundCandidate.assignedTestIds?.includes(test.id)) return true;
    if (test.allowedCandidateIds?.includes(foundCandidate.id)) return true;
    return false;
  });

  return { candidate: foundCandidate, tests: assigned };
};

export const saveTestResult = async (result: CandidateTestResult): Promise<void> => {
  const resultWithId: CandidateTestResult = {
    id: result.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...result,
  };

  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    const results: CandidateTestResult[] = raw ? JSON.parse(raw) : [];
    results.unshift(resultWithId);
    localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
  } catch (e) {
    console.error('Error saving local test result', e);
  }

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'results', resultWithId.id!), resultWithId);
    } catch (e) {
      console.error('Error uploading test result to Firestore', e);
    }
  }
};

export const updateTestResult = async (result: CandidateTestResult): Promise<void> => {
  if (!result.id) return;

  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    const results: CandidateTestResult[] = raw ? JSON.parse(raw) : [];
    const index = results.findIndex(
      r => r.id === result.id ||
        (r.candidateId === result.candidateId && r.timestamp === result.timestamp),
    );

    if (index >= 0) {
      results[index] = { ...results[index], ...result };
      localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
    }
  } catch (e) {
    console.error('Error updating local test result', e);
  }

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'results', result.id), result, { merge: true });
    } catch (e) {
      console.error('Error updating test result in Firestore', e);
    }
  }
};

export const deleteTestResult = async (resultId: string): Promise<void> => {
  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    if (raw) {
      const results: CandidateTestResult[] = JSON.parse(raw);
      localStorage.setItem(
        LOCAL_RESULTS_KEY,
        JSON.stringify(results.filter(result => result.id !== resultId)),
      );
    }
  } catch (e) {
    console.error('Error deleting local test result', e);
  }

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'results', resultId));
    } catch (e) {
      console.error('Error deleting test result from Firestore', e);
    }
  }
};

export const getAllTestResults = async (): Promise<CandidateTestResult[]> => {
  let localResults: CandidateTestResult[] = [];

  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    if (raw) localResults = JSON.parse(raw);
  } catch (e) {}

  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'results'));
      if (!snap.empty) {
        const cloudResults = snap.docs.map(
          d => ({ id: d.id, ...d.data() } as CandidateTestResult),
        );
        const resultMap = new Map<string, CandidateTestResult>();
        localResults.forEach(result => resultMap.set(result.id!, result));
        cloudResults.forEach(result => resultMap.set(result.id!, result));
        const merged = Array.from(resultMap.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.error('Error fetching cloud results', e);
    }
  }

  return localResults.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

export const resolveSectionTimers = (
  test?: IELTSTest | null,
  candidate?: Candidate | null,
): { listening: number; reading: number; writing: number; speaking: number } => {
  const base = {
    listening: test?.sectionTimers?.listening ?? 30,
    reading: test?.sectionTimers?.reading ?? 60,
    writing: test?.sectionTimers?.writing ?? 60,
    speaking: test?.sectionTimers?.speaking ?? 14,
  };

  const multiplier = candidate?.timeMultiplier || 1.0;

  return {
    listening: candidate?.customTimers?.listening ?? Math.round(base.listening * multiplier),
    reading: candidate?.customTimers?.reading ?? Math.round(base.reading * multiplier),
    writing: candidate?.customTimers?.writing ?? Math.round(base.writing * multiplier),
    speaking: candidate?.customTimers?.speaking ?? Math.round(base.speaking * multiplier),
  };
};

export const getSectionDurationSeconds = (
  section: 'listening' | 'reading' | 'writing' | 'speaking',
  test?: IELTSTest | null,
  candidate?: Candidate | null,
): number => {
  const timers = resolveSectionTimers(test, candidate);
  return (timers[section] || 60) * 60;
};
