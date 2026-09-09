import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

/**
 * AdminDashboard already receives exact byte progress from Firebase's
 * uploadBytesResumable task. This small pre-transform exposes that existing
 * progress in the Listening Audio UI without changing the very large legacy
 * dashboard component in-place.
 *
 * Each replacement is deliberately guarded: if the dashboard markup changes,
 * the build fails instead of silently shipping a broken progress indicator.
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
        throw new Error(`Admin audio progress patch could not find: ${label}`);
      }
      return source.slice(0, index) + replacement + source.slice(index + needle.length);
    };

    let next = code;

    next = replaceOnce(
      next,
      "  const [isUploading, setIsUploading] = useState(false);\n  const [uploadProgress, setUploadProgress] = useState(0);",
      "  const [isUploading, setIsUploading] = useState(false);\n  const [uploadProgress, setUploadProgress] = useState(0);\n  const [uploadKind, setUploadKind] = useState<'audio' | 'image' | null>(null);",
      'upload state',
    );

    next = replaceOnce(
      next,
      '    setIsUploading(true);\n    setStatus("Uploading audio...");',
      "    setUploadProgress(0);\n    setUploadKind('audio');\n    setIsUploading(true);\n    setStatus(\"Uploading audio... 0%\");",
      'audio upload start',
    );

    next = replaceOnce(
      next,
      '        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;\n        setUploadProgress(progress);',
      '        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;\n        setUploadProgress(progress);\n        setStatus(`Uploading audio... ${Math.round(progress)}%`);',
      'audio upload progress callback',
    );

    next = replaceOnce(
      next,
      '        console.error("Upload failed", error);\n        setStatus(`Upload failed: ${error.message}`);\n        setIsUploading(false);\n      },\n      async () => {\n        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);\n        setListeningAudioUrl(downloadURL);\n        setStatus("Audio uploaded successfully!");\n        setIsUploading(false);',
      '        console.error("Upload failed", error);\n        setStatus(`Upload failed: ${error.message}`);\n        setIsUploading(false);\n        setUploadKind(null);\n      },\n      async () => {\n        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);\n        setListeningAudioUrl(downloadURL);\n        setUploadProgress(100);\n        setStatus("Audio uploaded successfully! 100% complete.");\n        setIsUploading(false);\n        setUploadKind(null);',
      'audio completion handlers',
    );

    next = replaceOnce(
      next,
      '    setIsUploading(true);\n    setStatus("Uploading image...");',
      "    setUploadKind('image');\n    setUploadProgress(0);\n    setIsUploading(true);\n    setStatus(\"Uploading image...\");",
      'image upload start',
    );

    const audioUiEnd = `                    </div>\n                  </div>\n                </div>\n\n                {/* Questions List */}`;
    const audioUiWithProgress = `                    </div>\n                  </div>\n\n                  {isUploading && uploadKind === 'audio' && (\n                    <div className=\"rounded-lg border border-blue-200 bg-white p-3 space-y-2 shadow-sm\">\n                      <div className=\"flex items-center justify-between gap-3\">\n                        <div>\n                          <p className=\"text-xs font-bold text-slate-800\">Uploading Listening Audio</p>\n                          <p className=\"text-[10px] text-slate-500 mt-0.5\">Keep this tab open until the upload reaches 100%.</p>\n                        </div>\n                        <span className=\"text-sm font-black text-blue-700 tabular-nums\">{Math.round(uploadProgress)}%</span>\n                      </div>\n                      <div\n                        className=\"h-3 w-full overflow-hidden rounded-full bg-blue-100 border border-blue-200\"\n                        role=\"progressbar\"\n                        aria-label=\"Listening audio upload progress\"\n                        aria-valuemin={0}\n                        aria-valuemax={100}\n                        aria-valuenow={Math.round(uploadProgress)}\n                      >\n                        <div\n                          className=\"h-full bg-blue-600 transition-[width] duration-300 ease-out\"\n                          style={{ width: Math.max(0, Math.min(100, uploadProgress)) + '%' }}\n                        />\n                      </div>\n                      <div className=\"flex items-center justify-between text-[10px] font-semibold text-slate-600\">\n                        <span>{Math.round(uploadProgress)}% uploaded</span>\n                        <span>{uploadProgress >= 100 ? 'Finalizing...' : 'Uploading to Firebase Storage...'}</span>\n                      </div>\n                    </div>\n                  )}\n                </div>\n\n                {/* Questions List */}`;

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
