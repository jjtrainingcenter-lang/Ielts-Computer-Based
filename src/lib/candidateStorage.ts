import { Candidate, IELTSTest, CandidateTestResult } from '../types';
import { ACADEMIC_TEST_1 } from '../data/mockTests';
import { db, isConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';

const LOCAL_CANDIDATES_KEY = 'jj_cbt_candidates_v2';
const LOCAL_CUSTOM_TESTS_KEY = 'jj_cbt_custom_tests_v2';
const LOCAL_RESULTS_KEY = 'jj_cbt_results_v2';
const LOCAL_CATALOG_RESET_KEY = 'jj_cbt_mock_test_1_catalog_reset_v1';
const FIRESTORE_CATALOG_RESET_DOC = 'mock-test-1-catalog-reset-v1';
export const SESSION_STORAGE_KEY = 'jj_cbt_active_session_v2';

// No demo candidates are seeded. When Firebase is configured, Firestore is the
// source of truth so a candidate deleted by an Admin cannot be recreated by a
// stale browser cache on another device.
export const DEFAULT_CANDIDATES: Candidate[] = [];

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

const readLocalCandidates = (): Candidate[] => {
  try {
    const raw = localStorage.getItem(LOCAL_CANDIDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local candidates', e);
    return [];
  }
};

const cacheLocalCandidates = (candidates: Candidate[]) => {
  try {
    localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(candidates));
  } catch (e) {
    console.warn('Could not cache candidates locally', e);
  }
};

export const getCandidates = async (): Promise<Candidate[]> => {
  // Firestore is authoritative whenever it is available. This prevents deleted
  // candidates from being resurrected by stale localStorage on another device.
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'candidates'));
      const cloudCandidates = snap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate));
      cacheLocalCandidates(cloudCandidates);
      return cloudCandidates;
    } catch (e) {
      console.warn('Could not read Firestore candidates; using local cache', e);
    }
  }

  return readLocalCandidates();
};

export const saveCandidate = async (candidate: Candidate): Promise<void> => {
  const normalized: Candidate = {
    ...candidate,
    updatedAt: new Date().toISOString(),
  };

  const current = readLocalCandidates();
  const index = current.findIndex(c => c.id === normalized.id);
  const updated = [...current];

  if (index >= 0) updated[index] = normalized;
  else updated.unshift(normalized);

  cacheLocalCandidates(updated);

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'candidates', normalized.id), normalized);
    } catch (e) {
      console.error('Error writing candidate to Firestore', e);
      throw e;
    }
  }
};

export const saveCandidatesBulk = async (candidates: Candidate[]): Promise<void> => {
  if (candidates.length === 0) return;
  const now = new Date().toISOString();
  const normalized = candidates.map(candidate => ({ ...candidate, updatedAt: now }));
  const map = new Map(readLocalCandidates().map(candidate => [candidate.id, candidate]));
  normalized.forEach(candidate => map.set(candidate.id, candidate));
  cacheLocalCandidates(Array.from(map.values()));

  if (isConfigured && db) {
    await Promise.all(
      normalized.map(candidate => setDoc(doc(db!, 'candidates', candidate.id), candidate)),
    );
  }
};

export const deleteCandidate = async (candidateId: string): Promise<void> => {
  const updated = readLocalCandidates().filter(c => c.id !== candidateId);
  cacheLocalCandidates(updated);

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'candidates', candidateId));
    } catch (e) {
      console.error('Error deleting candidate from Firestore', e);
      throw e;
    }
  }
};

export const getAllTests = async (): Promise<IELTSTest[]> => {
  resetLocalCatalogOnce();
  await ensureInitialCloudCatalog();

  // Like candidates, the cloud collection is authoritative when available so
  // publish/unpublish, deletions, Drive URLs and edited content propagate to all
  // student devices instead of being shadowed by stale browser data.
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'tests'));
      const cloudTests = snap.docs.map(testDoc => {
        const data = testDoc.data() as IELTSTest;
        return { ...data, id: data.id || testDoc.id };
      });
      const customTests = cloudTests.filter(test => test.id !== ACADEMIC_TEST_1.id);
      localStorage.setItem(LOCAL_CUSTOM_TESTS_KEY, JSON.stringify(customTests));
      return cloudTests.length > 0 ? cloudTests : [ACADEMIC_TEST_1];
    } catch (e) {
      console.warn('Could not sync with Firestore tests; using local cache', e);
    }
  }

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
  return Array.from(testMap.values());
};

export const saveTest = async (test: IELTSTest): Promise<void> => {
  const normalized: IELTSTest = {
    ...test,
    updatedAt: new Date().toISOString(),
  };

  const raw = localStorage.getItem(LOCAL_CUSTOM_TESTS_KEY);
  const customList: IELTSTest[] = raw ? JSON.parse(raw) : [];
  const index = customList.findIndex(t => t.id === normalized.id);

  if (index >= 0) customList[index] = normalized;
  else if (normalized.id !== ACADEMIC_TEST_1.id) customList.push(normalized);

  localStorage.setItem(LOCAL_CUSTOM_TESTS_KEY, JSON.stringify(customList));

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'tests', normalized.id), normalized);
    } catch (e) {
      console.error('Error saving test to Firestore', e);
      throw e;
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
      throw e;
    }
  }
};

export const isTestAssignedToCandidate = (candidate: Candidate, test: IELTSTest): boolean => {
  if (test.status && test.status !== 'published') return false;
  if (test.assignedToAll) return true;
  if (candidate.assignedTestIds?.includes(test.id)) return true;
  if (test.allowedCandidateIds?.includes(candidate.id)) return true;
  return false;
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

  if (!foundCandidate || foundCandidate.status === 'blocked') {
    return { candidate: foundCandidate || null, tests: [] };
  }

  return {
    candidate: foundCandidate,
    tests: allTests.filter(test => isTestAssignedToCandidate(foundCandidate, test)),
  };
};

export const subscribeToCandidate = (
  candidateId: string,
  onChange: (candidate: Candidate | null) => void,
): (() => void) => {
  if (isConfigured && db) {
    return onSnapshot(
      doc(db, 'candidates', candidateId),
      snapshot => {
        onChange(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Candidate) : null);
      },
      error => console.error('Candidate live-sync failed', error),
    );
  }

  let cancelled = false;
  const poll = () => {
    if (cancelled) return;
    const candidate = readLocalCandidates().find(item => item.id === candidateId) || null;
    onChange(candidate);
  };
  poll();
  const timer = window.setInterval(poll, 5000);
  return () => {
    cancelled = true;
    window.clearInterval(timer);
  };
};

export const subscribeToTests = (
  onChange: (tests: IELTSTest[]) => void,
): (() => void) => {
  if (isConfigured && db) {
    return onSnapshot(
      collection(db, 'tests'),
      snapshot => {
        const tests = snapshot.docs.map(testDoc => {
          const data = testDoc.data() as IELTSTest;
          return { ...data, id: data.id || testDoc.id };
        });
        onChange(tests.length > 0 ? tests : [ACADEMIC_TEST_1]);
      },
      error => console.error('Test catalog live-sync failed', error),
    );
  }

  let cancelled = false;
  const poll = async () => {
    if (cancelled) return;
    onChange(await getAllTests());
  };
  poll();
  const timer = window.setInterval(poll, 5000);
  return () => {
    cancelled = true;
    window.clearInterval(timer);
  };
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
      const cloudResults = snap.docs.map(
        d => ({ id: d.id, ...d.data() } as CandidateTestResult),
      );
      localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(cloudResults));
      return cloudResults.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (e) {
      console.error('Error fetching cloud results', e);
    }
  }

  return localResults.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

export const grantCandidateRetake = async (
  candidateId: string,
  testId: string,
  clearPreviousResults = false,
): Promise<void> => {
  const candidates = await getCandidates();
  const candidate = candidates.find(item => item.id === candidateId);
  if (!candidate) throw new Error(`Candidate #${candidateId} not found.`);

  const resetAt = new Date().toISOString();
  await saveCandidate({
    ...candidate,
    status: 'active',
    attemptResetAt: {
      ...(candidate.attemptResetAt || {}),
      [testId]: resetAt,
    },
  });

  if (clearPreviousResults) {
    const results = await getAllTestResults();
    const matching = results.filter(result => result.candidateId === candidateId && result.testId === testId && result.id);
    await Promise.all(matching.map(result => deleteTestResult(result.id!)));
  }
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
