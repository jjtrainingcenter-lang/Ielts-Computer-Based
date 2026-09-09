import type { Plugin } from 'vite';

/**
 * Adds the draft Mock Test 2–8 catalog entries to the existing storage layer
 * without changing any current test content or AI Studio UI/navigation work.
 * Existing Firestore tests are never overwritten: only missing catalog entries
 * are created.
 */
export const mockTestCatalogPlugin = (): Plugin => ({
  name: 'jj-mock-test-catalog-2-8',
  enforce: 'pre',
  transform(code, id) {
    const cleanId = id.split('?')[0].replace(/\\/g, '/');
    if (!cleanId.endsWith('/src/lib/candidateStorage.ts')) return null;

    let next = code;

    next = next.replace(
      "import { ACADEMIC_TEST_1 } from '../data/mockTests';",
      "import { ACADEMIC_TEST_1, BASE_ACADEMIC_TESTS } from '../data/mockTests';",
    );

    const helperMarker = 'const readLocalCandidates = (): Candidate[] => {';
    if (!next.includes('const ensureBaseAcademicCatalog = async () =>') && next.includes(helperMarker)) {
      const helper = `const ensureBaseAcademicCatalog = async () => {\n  if (!isConfigured || !db) return;\n\n  try {\n    for (const test of BASE_ACADEMIC_TESTS) {\n      const testRef = doc(db, 'tests', test.id);\n      const snapshot = await getDoc(testRef);\n      // Never overwrite Admin/AI Studio edits. Only create a missing slot.\n      if (!snapshot.exists()) {\n        await setDoc(testRef, test);\n      }\n    }\n  } catch (e) {\n    console.warn('Could not ensure Mock Test 1–8 catalog', e);\n  }\n};\n\n`;
      next = next.replace(helperMarker, helper + helperMarker);
    }

    next = next.replace(
      '  await ensureInitialCloudCatalog();\n',
      '  await ensureInitialCloudCatalog();\n  await ensureBaseAcademicCatalog();\n',
    );

    next = next.replace(
      '      const customTests = cloudTests.filter(test => test.id !== ACADEMIC_TEST_1.id);',
      '      const baseTestIds = new Set(BASE_ACADEMIC_TESTS.map(test => test.id));\n      const customTests = cloudTests.filter(test => !baseTestIds.has(test.id));',
    );

    next = next.replace(
      '      return cloudTests.length > 0 ? cloudTests : [ACADEMIC_TEST_1];',
      '      return cloudTests.length > 0 ? cloudTests : BASE_ACADEMIC_TESTS;',
    );

    next = next.replace(
      '  const testMap = new Map<string, IELTSTest>();\n  testMap.set(ACADEMIC_TEST_1.id, ACADEMIC_TEST_1);',
      '  const testMap = new Map<string, IELTSTest>();\n  BASE_ACADEMIC_TESTS.forEach(test => testMap.set(test.id, test));',
    );

    next = next.replace(
      '        onChange(tests.length > 0 ? tests : [ACADEMIC_TEST_1]);',
      '        onChange(tests.length > 0 ? tests : BASE_ACADEMIC_TESTS);',
    );

    return { code: next, map: null };
  },
});
