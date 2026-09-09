import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

/**
 * AdminDashboard is a very large legacy component. This guarded pre-transform
 * adds upload diagnostics without duplicating the whole file here.
 *
 * The underlying uploader already uses Firebase uploadBytesResumable. We add:
 * - visible percentage progress
 * - Firebase-auth preflight for passcode-only admin sessions
 * - readable Storage error messages
 * - a short zero-byte stall detector instead of waiting many minutes
 *
 * Every replacement is guarded so a future dashboard change fails the build
 * rather than silently shipping a broken upload flow.
 */
const adminAudioUploadProgressPlugin = (): Plugin => ({
  name: 'jj-admin-audio-upload-progress',
  enforce: 'pre',
  transform(code, id) {
    const cleanId = id.split('?')[0].replace(/\\/g, '/');
    if (!cleanId.endsWith('/src/components/AdminDashboard.tsx')) return null;

    const replaceOnce = (source: string, needle: string, replacement: string, label: string) => {
      const index = source.indexOf(needle);
      if (index === -1) {
        throw new Error(`Admin audio upload patch could not find: ${label}`);
      }
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
      "  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {\n    if (!e.target.files || e.target.files.length === 0) return;\n    const file = e.target.files[0];\n\n    if (!isConfigured || !storage) {\n      setStatus(\"Firebase Storage is unconfigured. You can paste a direct audio URL below.\");\n      return;\n    }\n\n    // A passcode-only Admin session is not the same as Firebase Authentication.\n    // Storage rules normally require request.auth, so restore/check Firebase Auth\n    // before starting a large file upload.\n    try {\n      if (auth?.authStateReady) await auth.authStateReady();\n      if (!auth?.currentUser) {\n        setStatus(\"Firebase Storage needs Google authentication. Opening Google sign-in...\");\n        const user = await signInWithGoogle();\n        if (!user) {\n          setStatus(\"Audio upload stopped: Google authentication is required for Firebase Storage.\");\n          return;\n        }\n      }\n    } catch (authError: any) {\n      const authCode = authError?.code || '';\n      if (authCode === 'auth/unauthorized-domain') {\n        setStatus(\"Audio upload blocked: this website domain is not authorized in Firebase Authentication. Add the current domain under Authentication → Settings → Authorized domains, then sign in with Google.\");\n      } else if (authCode === 'auth/popup-blocked' || authCode === 'auth/popup-closed-by-user') {\n        setStatus(\"Audio upload needs Firebase Google sign-in. Allow the Google sign-in popup, then retry the upload.\");\n      } else {\n        setStatus(`Audio upload authentication failed: ${authError?.message || authCode || 'Unknown authentication error'}`);\n      }\n      return;\n    }",
      'audio auth preflight',
    );

    next = replaceOnce(
      next,
      "    const storageRef = ref(storage, `audio/${Date.now()}_${file.name}`);\n    const uploadTask = uploadBytesResumable(storageRef, file);\n\n    setIsUploading(true);\n    setStatus(\"Uploading audio...\");",
      "    const storageRef = ref(storage, `audio/${Date.now()}_${file.name}`);\n    const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type || 'audio/mpeg' });\n    let receivedBytes = false;\n    let stalledAtZero = false;\n\n    const describeStorageError = (error: any) => {\n      switch (error?.code) {\n        case 'storage/unauthenticated':\n          return 'Firebase Storage says this session is not authenticated. Sign in with the authorized Google account and retry.';\n        case 'storage/unauthorized':\n          return 'Firebase Storage security rules are blocking this upload. Deploy Storage rules that allow authenticated Admin writes to audio/**.';\n        case 'storage/quota-exceeded':\n          return 'Firebase Storage quota/billing blocked the upload. Cloud Storage for Firebase currently requires the Blaze plan; check Firebase Usage and billing.';\n        case 'storage/bucket-not-found':\n          return 'The configured Firebase Storage bucket was not found. Open Firebase → Storage and finish creating the default bucket.';\n        case 'storage/project-not-found':\n          return 'The Firebase project for this Storage bucket was not found. Check firebase-applet-config.json.';\n        case 'storage/retry-limit-exceeded':\n          return 'Firebase could not start the upload before the retry limit. Check Storage is enabled, Blaze billing is active, the Admin is Google-authenticated, and Storage rules allow the upload.';\n        case 'storage/canceled':\n          return stalledAtZero\n            ? 'No audio bytes reached Firebase Storage. Check Storage setup/billing/authentication/rules, then retry.'\n            : 'The audio upload was canceled.';\n        default:\n          return error?.message || error?.code || 'Unknown Firebase Storage error.';\n      }\n    };\n\n    const zeroByteTimer = window.setTimeout(() => {\n      if (!receivedBytes) {\n        stalledAtZero = true;\n        setStatus(\"Audio upload is still at 0%. Stopping this attempt so Firebase can report the real problem...\");\n        uploadTask.cancel();\n      }\n    }, 25_000);\n\n    setUploadProgress(0);\n    setUploadKind('audio');\n    setIsUploading(true);\n    setStatus(`Uploading audio: ${file.name} — 0%`);",
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
    const audioUiWithProgress = `                    </div>\n                  </div>\n\n                  {isUploading && uploadKind === 'audio' && (\n                    <div className=\"rounded-lg border border-blue-200 bg-white p-3 space-y-2 shadow-sm\">\n                      <div className=\"flex items-center justify-between gap-3\">\n                        <div>\n                          <p className=\"text-xs font-bold text-slate-800\">Uploading Listening Audio</p>\n                          <p className=\"text-[10px] text-slate-500 mt-0.5\">If no bytes reach Firebase within about 25 seconds, this attempt will stop and show the actual setup/auth/billing error.</p>\n                        </div>\n                        <span className=\"text-sm font-black text-blue-700 tabular-nums\">{Math.round(uploadProgress)}%</span>\n                      </div>\n                      <div\n                        className=\"h-3 w-full overflow-hidden rounded-full bg-blue-100 border border-blue-200\"\n                        role=\"progressbar\"\n                        aria-label=\"Listening audio upload progress\"\n                        aria-valuemin={0}\n                        aria-valuemax={100}\n                        aria-valuenow={Math.round(uploadProgress)}\n                      >\n                        <div\n                          className=\"h-full bg-blue-600 transition-[width] duration-300 ease-out\"\n                          style={{ width: Math.max(0, Math.min(100, uploadProgress)) + '%' }}\n                        />\n                      </div>\n                      <div className=\"flex items-center justify-between text-[10px] font-semibold text-slate-600\">\n                        <span>{Math.round(uploadProgress)}% uploaded</span>\n                        <span>{uploadProgress >= 100 ? 'Finalizing...' : 'Uploading to Firebase Storage...'}</span>\n                      </div>\n                    </div>\n                  )}\n                </div>\n\n                {/* Questions List */}`;

    next = replaceOnce(next, audioUiEnd, audioUiWithProgress, 'Listening Audio UI');

    return { code: next, map: null };
  },
});

export default defineConfig(() => {
  return {
    plugins: [adminAudioUploadProgressPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
