import type { Plugin } from 'vite';

export const removeDemoCandidateLoginPlugin = (): Plugin => ({
  name: 'jj-remove-demo-candidate-login',
  enforce: 'pre',
  transform(code, id) {
    const cleanId = id.split('?')[0].replace(/\\/g, '/');
    if (!cleanId.endsWith('/src/components/LoginScreen.tsx')) return null;

    if (!code.includes('Quick Demo Candidates Helper') && !code.includes('Quick filler for testing/demo')) {
      return null;
    }

    let next = code.replace(', Sparkles', '');
    const helperStart = next.indexOf('  // Quick filler for testing/demo');
    if (helperStart !== -1) {
      const helperEnd = next.indexOf('  return (', helperStart);
      if (helperEnd === -1) throw new Error('Could not locate end of demo quick-fill helper');
      next = next.slice(0, helperStart) + next.slice(helperEnd);
    }

    const demoStart = next.indexOf('            {/* Quick Demo Candidates Helper */}');
    if (demoStart !== -1) {
      const formEnd = next.indexOf('          </form>', demoStart);
      if (formEnd === -1) throw new Error('Could not locate end of demo candidate block');
      next = next.slice(0, demoStart) + next.slice(formEnd);
    }
    return { code: next, map: null };
  },
});

export const mediaAndWritingUiPlugin = (): Plugin => ({
  name: 'jj-media-and-writing-ui',
  enforce: 'pre',
  transform(code, id) {
    const cleanId = id.split('?')[0].replace(/\\/g, '/');

    if (cleanId.endsWith('/src/components/WritingEditor.tsx')) {
      let next = code;
      next = next.replace(
        "              const taskWords = num === 1 ? wordCount1 : wordCount2;\n              const isDone = taskWords >= t.minWordCount;\n\n",
        '',
      );
      const marker = '{taskWords}/{t.minWordCount}w';
      const markerIndex = next.indexOf(marker);
      if (markerIndex !== -1) {
        const spanStart = next.lastIndexOf('<span', markerIndex);
        const spanEndStart = next.indexOf('</span>', markerIndex);
        if (spanStart !== -1 && spanEndStart !== -1) {
          next = next.slice(0, spanStart) + next.slice(spanEndStart + '</span>'.length);
        }
      }
      return { code: next, map: null };
    }

    if (cleanId.endsWith('/src/components/AdminDashboard.tsx')) {
      let next = code;
      next = next.replace(
        "import { ValidationReportModal } from './ValidationReportModal';",
        "import { ValidationReportModal } from './ValidationReportModal';\nimport { getMediaUrlCandidates } from '../lib/mediaUrls';",
      );
      next = next.replaceAll('placeholder="Or paste URL..."', 'placeholder="Paste Google Drive share link or direct image URL..."');
      next = next.replace(
        'placeholder="Or enter direct MP3 audio URL here..."',
        'placeholder="Paste Google Drive share link or direct audio URL here..."',
      );
      next = next.replace(
        '<img src={imageUrl} alt="Preview" className="h-12 object-contain rounded border border-slate-200" />',
        '<img src={getMediaUrlCandidates(imageUrl, \'image\')[0] || imageUrl} alt="Preview" className="h-12 object-contain rounded border border-slate-200" referrerPolicy="no-referrer" />',
      );
      return { code: next, map: null };
    }
    return null;
  },
});

export const candidateOperationsPlugin = (): Plugin => ({
  name: 'jj-candidate-operations-and-live-sync',
  enforce: 'pre',
  transform(code, id) {
    const cleanId = id.split('?')[0].replace(/\\/g, '/');

    if (cleanId.endsWith('/src/components/AdminDashboard.tsx')) {
      let next = code;
      const mediaImport = "import { getMediaUrlCandidates } from '../lib/mediaUrls';";
      if (next.includes(mediaImport) && !next.includes("import { CandidateAccessManager } from './CandidateAccessManager';")) {
        next = next.replace(
          mediaImport,
          `${mediaImport}\nimport { CandidateAccessManager } from './CandidateAccessManager';`,
        );
      }
      const listMarker = '              {/* Registered Candidates List */}';
      if (!next.includes('<CandidateAccessManager') && next.includes(listMarker)) {
        next = next.replace(
          listMarker,
          `              <CandidateAccessManager\n                candidates={candidatesList}\n                tests={allTests}\n                results={resultsList}\n                onRefresh={refreshAllData}\n                onStatus={setStatus}\n              />\n\n${listMarker}`,
        );
      }
      return { code: next, map: null };
    }

    if (cleanId.endsWith('/src/App.tsx')) {
      let next = code;
      next = next.replace(
        "  resolveSectionTimers,\n  SESSION_STORAGE_KEY\n} from './lib/candidateStorage';",
        "  resolveSectionTimers,\n  SESSION_STORAGE_KEY,\n  subscribeToCandidate,\n  subscribeToTests,\n  isTestAssignedToCandidate\n} from './lib/candidateStorage';",
      );

      const liveSyncMarker = '  // Auto-persist active exam state to localStorage so candidate won\'t lose work on page reload';
      if (!next.includes('Candidate/test live synchronization') && next.includes(liveSyncMarker)) {
        const liveSync = `  // Candidate/test live synchronization. Admin changes now propagate to open\n  // student pages without requiring a manual refresh.\n  useEffect(() => {\n    if (!isLoggedIn || isAdminLoggedIn || !candidateId) return;\n\n    let exiting = false;\n    let latestCandidate = candidate;\n    let latestTests = allAvailableTests;\n\n    const forceCandidateExit = (message: string) => {\n      if (exiting) return;\n      exiting = true;\n      try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) {}\n      window.alert(message);\n      window.location.reload();\n    };\n\n    const refreshAssignmentView = (liveCandidate: Candidate | null, liveTests: IELTSTest[]) => {\n      if (!liveCandidate) return;\n      const liveAssigned = liveTests.filter(test => isTestAssignedToCandidate(liveCandidate, test));\n      setAssignedTests(liveAssigned);\n      const latestCurrentTest = liveTests.find(test => test.id === currentTest.id);\n      if (latestCurrentTest && isTestAssignedToCandidate(liveCandidate, latestCurrentTest)) {\n        // Pull in edited audio/image URLs, passages, questions, status and timers.\n        setCurrentTest(latestCurrentTest);\n      } else if (hasConfirmedInstructions) {\n        forceCandidateExit('This test was removed, unpublished, or unassigned by the administrator. This exam session is now closed.');\n      }\n    };\n\n    const unsubscribeCandidate = subscribeToCandidate(candidateId, (liveCandidate) => {\n      if (!liveCandidate) {\n        forceCandidateExit('Your candidate registration has been removed by the administrator. This exam session is now closed.');\n        return;\n      }\n      if (liveCandidate.status === 'blocked') {\n        forceCandidateExit('Your candidate access has been blocked by the administrator. This exam session is now closed.');\n        return;\n      }\n\n      latestCandidate = liveCandidate;\n      setCandidate(liveCandidate);\n      setCandidateName(liveCandidate.name);\n\n      const resetAt = liveCandidate.attemptResetAt?.[currentTest.id];\n      const resetKey = 'jj_cbt_seen_reset_v1:' + candidateId + ':' + currentTest.id;\n      if (resetAt) {\n        const seenReset = localStorage.getItem(resetKey);\n        if (hasConfirmedInstructions && seenReset !== resetAt) {\n          localStorage.setItem(resetKey, resetAt);\n          forceCandidateExit('The administrator has reset this test and granted a fresh attempt. Please sign in again to start from the beginning.');\n          return;\n        }\n        if (!hasConfirmedInstructions && seenReset !== resetAt) {\n          localStorage.setItem(resetKey, resetAt);\n        }\n      }\n\n      refreshAssignmentView(liveCandidate, latestTests);\n    });\n\n    const unsubscribeTests = subscribeToTests((liveTests) => {\n      latestTests = liveTests;\n      setAllAvailableTests(liveTests);\n      refreshAssignmentView(latestCandidate, liveTests);\n    });\n\n    return () => {\n      unsubscribeCandidate();\n      unsubscribeTests();\n    };\n  }, [isLoggedIn, isAdminLoggedIn, candidateId, currentTest.id, hasConfirmedInstructions]);\n\n`;
        next = next.replace(liveSyncMarker, liveSync + liveSyncMarker);
      }

      next = next.replace(
        "  const handleStartTest = (test: IELTSTest, name: string, id: string, initialSec: TestSection = 'listening') => {\n    setCurrentTest(test);",
        "  const handleStartTest = (test: IELTSTest, name: string, id: string, initialSec: TestSection = 'listening') => {\n    const resetKey = 'jj_cbt_seen_reset_v1:' + id + ':' + test.id;\n    const resetMarker = candidate?.attemptResetAt?.[test.id];\n    if (resetMarker) localStorage.setItem(resetKey, resetMarker);\n    else localStorage.removeItem(resetKey);\n    setCurrentTest(test);",
      );

      next = next.replace(
        'availableTests={assignedTests.length > 0 ? assignedTests : allAvailableTests}',
        'availableTests={assignedTests}',
      );
      next = next.replace(
        '              onEvaluateAI={handleEvaluateWritingAI}\n              isEvaluatingAI={isEvaluatingAI}\n',
        '',
      );
      next = next.replace(
        '              onEvaluateAI={handleEvaluateSpeakingAI}\n              isEvaluatingAI={isEvaluatingAI}\n',
        '',
      );
      return { code: next, map: null };
    }
    return null;
  },
});

export const adminAudioUploadProgressPlugin = (): Plugin => ({
  name: 'jj-admin-audio-upload-progress',
  enforce: 'pre',
  transform(code, id) {
    const cleanId = id.split('?')[0].replace(/\\/g, '/');
    if (!cleanId.endsWith('/src/components/AdminDashboard.tsx')) return null;

    const replaceOnce = (source: string, needle: string, replacement: string, label: string) => {
      const index = source.indexOf(needle);
      if (index === -1) throw new Error(`Admin audio upload patch could not find: ${label}`);
      return source.slice(0, index) + replacement + source.slice(index + needle.length);
    };

    let next = code;
    next = replaceOnce(
      next,
      "import { db, storage, logout, isConfigured } from '../lib/firebase';",
      "import { auth, db, storage, logout, isConfigured, signInWithGoogle } from '../lib/firebase';",
      'Firebase import',
    );
    next = replaceOnce(
      next,
      "  const [isUploading, setIsUploading] = useState(false);\n  const [uploadProgress, setUploadProgress] = useState(0);",
      "  const [isUploading, setIsUploading] = useState(false);\n  const [uploadProgress, setUploadProgress] = useState(0);\n  const [uploadKind, setUploadKind] = useState<'audio' | 'image' | null>(null);",
      'upload state',
    );
    next = replaceOnce(
      next,
      "  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {\n    if (!e.target.files || e.target.files.length === 0) return;\n    if (!isConfigured || !storage) {\n      setStatus(\"Firebase Storage is unconfigured. You can paste direct audio URL below.\");\n      return;\n    }\n\n    const file = e.target.files[0];",
      "  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {\n    if (!e.target.files || e.target.files.length === 0) return;\n    const file = e.target.files[0];\n\n    if (!isConfigured || !storage) {\n      setStatus(\"Firebase Storage is unconfigured. You can paste a Google Drive or direct audio URL below.\");\n      return;\n    }\n\n    try {\n      if (auth?.authStateReady) await auth.authStateReady();\n      if (!auth?.currentUser) {\n        setStatus(\"Firebase Storage needs Google authentication. Opening Google sign-in...\");\n        const user = await signInWithGoogle();\n        if (!user) {\n          setStatus(\"Audio upload stopped: Google authentication is required for Firebase Storage.\");\n          return;\n        }\n      }\n    } catch (authError: any) {\n      const authCode = authError?.code || '';\n      if (authCode === 'auth/unauthorized-domain') {\n        setStatus(\"Audio upload blocked: this website domain is not authorized in Firebase Authentication. Add the current domain under Authentication → Settings → Authorized domains, then sign in with Google.\");\n      } else if (authCode === 'auth/popup-blocked' || authCode === 'auth/popup-closed-by-user') {\n        setStatus(\"Audio upload needs Firebase Google sign-in. Allow the Google sign-in popup, then retry the upload.\");\n      } else {\n        setStatus(`Audio upload authentication failed: ${authError?.message || authCode || 'Unknown authentication error'}`);\n      }\n      return;\n    }",
      'audio auth preflight',
    );
    next = replaceOnce(
      next,
      "    const storageRef = ref(storage, `audio/${Date.now()}_${file.name}`);\n    const uploadTask = uploadBytesResumable(storageRef, file);\n\n    setIsUploading(true);\n    setStatus(\"Uploading audio...\");",
      "    const storageRef = ref(storage, `audio/${Date.now()}_${file.name}`);\n    const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type || 'audio/mpeg' });\n    let receivedBytes = false;\n    let stalledAtZero = false;\n\n    const describeStorageError = (error: any) => {\n      switch (error?.code) {\n        case 'storage/unauthenticated': return 'Firebase Storage says this session is not authenticated. Sign in with the authorized Google account and retry.';\n        case 'storage/unauthorized': return 'Firebase Storage security rules are blocking this upload. Deploy Storage rules that allow authenticated Admin writes to audio/**.';\n        case 'storage/quota-exceeded': return 'Firebase Storage quota/billing blocked the upload. Check Firebase Usage and billing.';\n        case 'storage/bucket-not-found': return 'The configured Firebase Storage bucket was not found. Open Firebase → Storage and finish creating the default bucket.';\n        case 'storage/project-not-found': return 'The Firebase project for this Storage bucket was not found. Check firebase-applet-config.json.';\n        case 'storage/retry-limit-exceeded': return 'Firebase could not start the upload before the retry limit. You can use a public Google Drive link instead, or check Storage setup/auth/rules.';\n        case 'storage/canceled': return stalledAtZero ? 'No audio bytes reached Firebase Storage. Use a public Google Drive link or check Storage setup/auth/rules.' : 'The audio upload was canceled.';\n        default: return error?.message || error?.code || 'Unknown Firebase Storage error.';\n      }\n    };\n\n    const zeroByteTimer = window.setTimeout(() => {\n      if (!receivedBytes) {\n        stalledAtZero = true;\n        setStatus(\"Audio upload is still at 0%. Stopping this attempt so Firebase can report the real problem...\");\n        uploadTask.cancel();\n      }\n    }, 25_000);\n\n    setUploadProgress(0);\n    setUploadKind('audio');\n    setIsUploading(true);\n    setStatus(`Uploading audio: ${file.name} — 0%`);",
      'audio upload start and diagnostics',
    );
    next = replaceOnce(
      next,
      "        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;\n        setUploadProgress(progress);",
      "        const progress = snapshot.totalBytes > 0 ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 : 0;\n        if (snapshot.bytesTransferred > 0) {\n          receivedBytes = true;\n          window.clearTimeout(zeroByteTimer);\n        }\n        setUploadProgress(progress);\n        setStatus(`Uploading audio: ${file.name} — ${Math.round(progress)}%`);",
      'audio upload progress callback',
    );
    next = replaceOnce(
      next,
      "        console.error(\"Upload failed\", error);\n        setStatus(`Upload failed: ${error.message}`);\n        setIsUploading(false);\n      },\n      async () => {\n        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);\n        setListeningAudioUrl(downloadURL);\n        setStatus(\"Audio uploaded successfully!\");\n        setIsUploading(false);",
      "        window.clearTimeout(zeroByteTimer);\n        console.error(\"Upload failed\", error);\n        setStatus(`Audio upload failed: ${describeStorageError(error)}`);\n        setIsUploading(false);\n        setUploadKind(null);\n      },\n      async () => {\n        window.clearTimeout(zeroByteTimer);\n        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);\n        setListeningAudioUrl(downloadURL);\n        setUploadProgress(100);\n        setStatus(\"Audio uploaded successfully! 100% complete. Save the test to store this audio URL.\");\n        setIsUploading(false);\n        setUploadKind(null);",
      'audio completion handlers',
    );
    next = replaceOnce(
      next,
      '    setIsUploading(true);\n    setStatus("Uploading image...");',
      "    setUploadKind('image');\n    setUploadProgress(0);\n    setIsUploading(true);\n    setStatus(\"Uploading image...\");",
      'image upload start',
    );

    const audioUiEnd = `                    </div>\n                  </div>\n                </div>\n\n                {/* Questions List */}`;
    const audioUiWithProgress = `                    </div>\n                  </div>\n\n                  {isUploading && uploadKind === 'audio' && (\n                    <div className=\"rounded-lg border border-blue-200 bg-white p-3 space-y-2 shadow-sm\">\n                      <div className=\"flex items-center justify-between gap-3\">\n                        <div>\n                          <p className=\"text-xs font-bold text-slate-800\">Uploading Listening Audio</p>\n                          <p className=\"text-[10px] text-slate-500 mt-0.5\">If no bytes reach Firebase within about 25 seconds, this attempt will stop and show the actual setup/auth error.</p>\n                        </div>\n                        <span className=\"text-sm font-black text-blue-700 tabular-nums\">{Math.round(uploadProgress)}%</span>\n                      </div>\n                      <div className=\"h-3 w-full overflow-hidden rounded-full bg-blue-100 border border-blue-200\" role=\"progressbar\" aria-label=\"Listening audio upload progress\" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(uploadProgress)}>\n                        <div className=\"h-full bg-blue-600 transition-[width] duration-300 ease-out\" style={{ width: Math.max(0, Math.min(100, uploadProgress)) + '%' }} />\n                      </div>\n                      <div className=\"flex items-center justify-between text-[10px] font-semibold text-slate-600\">\n                        <span>{Math.round(uploadProgress)}% uploaded</span>\n                        <span>{uploadProgress >= 100 ? 'Finalizing...' : 'Uploading to Firebase Storage...'}</span>\n                      </div>\n                    </div>\n                  )}\n                </div>\n\n                {/* Questions List */}`;
    next = replaceOnce(next, audioUiEnd, audioUiWithProgress, 'Listening Audio UI');
    return { code: next, map: null };
  },
});
