import React, { useEffect, useState } from 'react';
import { Headphones, Link2, Save } from 'lucide-react';
import { IELTSTest } from '../types';
import { getPretestAudioSampleUrl, savePretestAudioSampleUrl } from '../lib/audioSample';

interface TestAudioLinkManagerProps {
  tests: IELTSTest[];
  onRefresh: () => void | Promise<void>;
  onStatus: (message: string | null) => void;
}

export const TestAudioLinkManager: React.FC<TestAudioLinkManagerProps> = ({ onStatus }) => {
  const [audioUrl, setAudioUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPretestAudioSampleUrl()
      .then(url => {
        if (active) setAudioUrl(url);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveAudioLink = async () => {
    setSaving(true);
    try {
      await savePretestAudioSampleUrl(audioUrl);
      onStatus(audioUrl.trim()
        ? 'Common pre-test audio sample link saved. It will be used on the Audio Check screen before every Listening test.'
        : 'Common pre-test audio sample link cleared.');
    } catch (error: any) {
      onStatus(`Could not save pre-test audio sample link: ${error?.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Headphones className="w-4 h-4 text-blue-700 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-slate-900">Common Audio Sample Link — Before Test</div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Paste one Google Drive share link or direct audio URL here. This is only the short headphone/audio sample students hear on the Audio Check screen before the Listening test starts. It is shared by all tests.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[minmax(320px,1fr)_auto] gap-2 items-center">
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={audioUrl}
            onChange={event => setAudioUrl(event.target.value)}
            disabled={loading}
            placeholder="Paste Google Drive share link or direct MP3/audio URL for the pre-test sample..."
            className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs bg-white font-mono disabled:bg-slate-100"
          />
        </div>

        <button
          type="button"
          onClick={saveAudioLink}
          disabled={saving || loading}
          className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Sample Audio'}
        </button>
      </div>

      <div className="text-[10px] text-slate-500">
        For Google Drive, set sharing to <strong>Anyone with the link → Viewer</strong>. This setting does not change any test's real Listening recording, questions, images, passages, or answers.
      </div>
    </div>
  );
};
