import React, { useEffect, useMemo, useState } from 'react';
import { Headphones, Link2, Save } from 'lucide-react';
import { IELTSTest } from '../types';
import { saveTest } from '../lib/candidateStorage';

interface TestAudioLinkManagerProps {
  tests: IELTSTest[];
  onRefresh: () => void | Promise<void>;
  onStatus: (message: string | null) => void;
}

export const TestAudioLinkManager: React.FC<TestAudioLinkManagerProps> = ({ tests, onRefresh, onStatus }) => {
  const availableTests = useMemo(() => tests.filter(test => test.status !== 'archived'), [tests]);
  const [testId, setTestId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedTest = availableTests.find(test => test.id === testId) || null;

  useEffect(() => {
    if (!testId && availableTests.length > 0) {
      setTestId(availableTests[0].id);
      return;
    }
    if (testId && !availableTests.some(test => test.id === testId)) {
      setTestId(availableTests[0]?.id || '');
    }
  }, [availableTests, testId]);

  useEffect(() => {
    if (!selectedTest) {
      setAudioUrl('');
      return;
    }
    const existing = selectedTest.listeningData?.find(item => item.audioUrl)?.audioUrl
      || selectedTest.listeningData?.[0]?.audioUrl
      || '';
    setAudioUrl(existing);
  }, [selectedTest?.id, selectedTest?.updatedAt]);

  const saveAudioLink = async () => {
    if (!selectedTest) {
      onStatus('Choose a test first.');
      return;
    }

    setSaving(true);
    try {
      const currentData = selectedTest.listeningData || [];
      const base = currentData[0] || {
        partNumber: 1,
        title: 'Listening Test',
        audioUrl: '',
        audioDuration: 0,
        instructions: '',
      };

      const updated: IELTSTest = {
        ...selectedTest,
        listeningData: [
          {
            ...base,
            partNumber: 1,
            title: base.title || 'Listening Test',
            audioUrl: audioUrl.trim(),
          },
          ...currentData.slice(1).map(item => ({ ...item, audioUrl: '' })),
        ],
      };

      await saveTest(updated);
      onStatus(audioUrl.trim()
        ? `Listening audio link saved for “${selectedTest.title}”. It will be used as the common recording for the full Listening test.`
        : `Listening audio link cleared for “${selectedTest.title}”.`);
      await onRefresh();
    } catch (error: any) {
      onStatus(`Could not save Listening audio link: ${error?.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Headphones className="w-4 h-4 text-blue-700 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-slate-900">Common Listening Audio Link</div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Choose any test and paste one Google Drive share link or direct audio URL. That one recording is used for the full Listening test (Parts 1–4).
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[minmax(220px,0.8fr)_minmax(320px,2fr)_auto] gap-2 items-center">
        <select
          value={testId}
          onChange={event => setTestId(event.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
        >
          {availableTests.length === 0 && <option value="">No tests available</option>}
          {availableTests.map(test => (
            <option key={test.id} value={test.id}>{test.title} {test.status === 'draft' ? '(Draft)' : ''}</option>
          ))}
        </select>

        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={audioUrl}
            onChange={event => setAudioUrl(event.target.value)}
            placeholder="Paste Google Drive share link or direct MP3/audio URL..."
            className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs bg-white font-mono"
          />
        </div>

        <button
          type="button"
          onClick={saveAudioLink}
          disabled={!selectedTest || saving}
          className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Audio Link'}
        </button>
      </div>

      <div className="text-[10px] text-slate-500">
        Google Drive file sharing must be set to <strong>Anyone with the link → Viewer</strong>. Saving here updates only the Listening audio source; it does not alter questions, images, passages, or answers.
      </div>
    </div>
  );
};
