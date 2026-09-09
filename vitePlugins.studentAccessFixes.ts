import type { Plugin } from 'vite';

/**
 * Small corrective transforms layered after the legacy candidate operations plugin.
 *
 * 1) Admin assignment UI should list any existing non-archived test, including
 *    drafts, so an Admin can prepare assignments before publishing.
 * 2) When candidate/test access becomes invalid, fully clear the candidate
 *    session in-memory and in localStorage so reopening the site always lands
 *    on the login page instead of repeatedly restoring a stale exam session.
 */
export const studentAccessFixesPlugin = (): Plugin => ({
  name: 'jj-student-access-fixes',
  enforce: 'pre',
  transform(code, id) {
    const cleanId = id.split('?')[0].replace(/\\/g, '/');

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

      next = next.replace(
        "            })}\n          </div>\n        </div>\n      </div>",
        "            })}\n            {publishedTests.length === 0 && (\n              <div className=\"p-4 text-xs text-slate-400 text-center\">No active or draft tests are available to assign.</div>\n            )}\n          </div>\n        </div>\n      </div>",
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
