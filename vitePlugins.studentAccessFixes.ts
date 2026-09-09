import type { Plugin } from 'vite';

/**
 * Corrective transforms layered after the legacy candidate operations plugin.
 *
 * 1) Admin assignment UI lists any existing non-archived test, including drafts.
 * 2) Invalid candidate sessions are fully cleared back to the login page.
 * 3) Manage Tests exposes one global pre-test audio sample link shared by all tests.
 * 4) Edit Test opens Visual Builder by default while preserving rich data that the
 *    visual controls do not expose (for example Speaking details and extra media).
 */
export const studentAccessFixesPlugin = (): Plugin => ({
  name: 'jj-student-access-fixes',
  enforce: 'pre',
  transform(code, id) {
    const cleanId = id.split('?')[0].replace(/\\/g, '/');

    if (cleanId.endsWith('/src/components/AdminDashboard.tsx')) {
      let next = code;

      if (!next.includes("import { TestAudioLinkManager } from './TestAudioLinkManager';")) {
        const candidateManagerImport = "import { CandidateAccessManager } from './CandidateAccessManager';";
        const validationImport = "import { ValidationReportModal } from './ValidationReportModal';";
        if (next.includes(candidateManagerImport)) {
          next = next.replace(
            candidateManagerImport,
            `${candidateManagerImport}\nimport { TestAudioLinkManager } from './TestAudioLinkManager';`,
          );
        } else if (next.includes(validationImport)) {
          next = next.replace(
            validationImport,
            `${validationImport}\nimport { TestAudioLinkManager } from './TestAudioLinkManager';`,
          );
        }
      }

      const testGridMarker = `                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n                  {allTests.map(test => {`;
      if (!next.includes('<TestAudioLinkManager') && next.includes(testGridMarker)) {
        next = next.replace(
          testGridMarker,
          `                <TestAudioLinkManager\n                  tests={allTests}\n                  onRefresh={refreshAllData}\n                  onStatus={setStatus}\n                />\n\n${testGridMarker}`,
        );
      }

      // Editing should be visual-first. Keep JSON populated so the advanced tab
      // remains available, but do not force an Admin into it.
      next = next.replace(
        `    // Rich imported tests must be edited in JSON Builder so no listening/speaking/media arrays are flattened.\n    setActiveTab('json-builder');\n    setStatus(\`Editing full test in JSON Builder: "\${testToEdit.title}" (ID: \${testToEdit.id})\`);`,
        `    // Open the normal Visual Builder by default. JSON Builder remains available\n    // as an advanced option without being forced on every edit.\n    setActiveTab('visual-builder');\n    setStatus(\`Editing test in Visual Builder: "\${testToEdit.title}" (ID: \${testToEdit.id})\`);`,
      );

      // Preserve fields which are not represented by Visual Builder. The original
      // test is already kept in jsonText by handleEditTest, so use it as the base
      // and override only fields that the Admin can actually edit visually.
      next = next.replace(
        `    const spkMin = Number(testSpeakingTimer) || 14;\n\n    return {`,
        `    const spkMin = Number(testSpeakingTimer) || 14;\n\n    let existingEditedTest: IELTSTest | null = null;\n    if (editingTestId && jsonText.trim()) {\n      try {\n        existingEditedTest = JSON.parse(jsonText) as IELTSTest;\n      } catch (error) {\n        console.warn('Could not read original test snapshot while saving Visual Builder edits', error);\n      }\n    }\n    const existingListeningData = existingEditedTest?.listeningData || [];\n    const existingWritingTask1 = existingEditedTest?.writingTasks?.find(task => task.taskNumber === 1);\n    const existingWritingTask2 = existingEditedTest?.writingTasks?.find(task => task.taskNumber === 2);\n\n    return {\n      ...(existingEditedTest || {}),`,
      );

      next = next.replace(
        `      listeningData: [{ partNumber: 1, title: 'Listening Test', audioUrl: listeningAudioUrl, audioDuration: 0, instructions: '' }],`,
        `      listeningData: existingListeningData.length > 0\n        ? existingListeningData.map((item, index) => index === 0\n          ? { ...item, audioUrl: listeningAudioUrl }\n          : item)\n        : [{ partNumber: 1, title: 'Listening Test', audioUrl: listeningAudioUrl, audioDuration: 0, instructions: '' }],`,
      );

      next = next.replace(
        `        {\n          taskNumber: 1,`,
        `        {\n          ...(existingWritingTask1 || {}),\n          taskNumber: 1,`,
      );
      next = next.replace(
        `        {\n          taskNumber: 2,`,
        `        {\n          ...(existingWritingTask2 || {}),\n          taskNumber: 2,`,
      );
      next = next.replace(
        `      speakingTasks: [`,
        `      speakingTasks: existingEditedTest?.speakingTasks?.length ? existingEditedTest.speakingTasks : [`,
      );
      next = next.replace(
        `      createdAt: new Date().toISOString()`,
        `      createdAt: existingEditedTest?.createdAt || new Date().toISOString()`,
      );

      return { code: next, map: null };
    }

    if (cleanId.endsWith('/src/components/CandidateAccessManager.tsx')) {
      let next = code;

      next = next.replace(
        "  const publishedTests = useMemo(\n    () => tests.filter(test => !test.status || test.status === 'published'),\n    [tests],\n  );",
        "  // Admins must be able to assign an existing draft test before publishing it.\n  // Archived tests stay hidden from new assignments.\n  const publishedTests = useMemo(\n    () => tests.filter(test => test.status !== 'archived'),\n    [tests],\n  );",
      );

      next = next.replace(
        "                    <div className=\"text-[10px] text-slate-500 font-mono\">{test.id}</div>",
        "                    <div className=\"flex items-center gap-2 mt-0.5\">\n                      <div className=\"text-[10px] text-slate-500 font-mono\">{test.id}</div>\n                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${test.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>\n                        {test.status || 'published'}\n                      </span>\n                    </div>",
      );

      return { code: next, map: null };
    }

    if (cleanId.endsWith('/src/App.tsx')) {
      let next = code;

      const oldExit = `    const forceCandidateExit = (message: string) => {\n      if (exiting) return;\n      exiting = true;\n      try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) {}\n      window.alert(message);\n      window.location.reload();\n    };`;

      const newExit = `    const forceCandidateExit = (message: string) => {\n      if (exiting) return;\n      exiting = true;\n      console.warn(message);\n\n      // Clear persisted state first, then clear all in-memory candidate state.\n      // This prevents the autosave effect from restoring a stale/invalid exam\n      // and guarantees that reopening the site shows the candidate login page.\n      try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) {}\n      setIsTimerRunning(false);\n      setSectionDeadline(null);\n      setHasConfirmedInstructions(false);\n      setIsSelectingTest(false);\n      setAssignedTests([]);\n      setCandidate(null);\n      setCandidateId('');\n      setCandidateName('');\n      setUserAnswers({});\n      setFlaggedQuestions({});\n      setHighlights([]);\n      setWritingTask1('');\n      setWritingTask2('');\n      setIsResultsModalOpen(false);\n      setIsLoggedIn(false);\n\n      // Remove once more after React has processed the logout state in case an\n      // already-queued autosave ran during the same event loop turn.\n      window.setTimeout(() => {\n        try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) {}\n      }, 0);\n    };`;

      if (next.includes(oldExit)) {
        next = next.replace(oldExit, newExit);
      }

      return { code: next, map: null };
    }

    return null;
  },
});
