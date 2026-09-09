import { db, isConfigured } from './firebase';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

const LOCAL_SAMPLE_AUDIO_KEY = 'jj_cbt_pretest_audio_sample_url_v1';

const readLocal = (): string => {
  try {
    return localStorage.getItem(LOCAL_SAMPLE_AUDIO_KEY) || '';
  } catch {
    return '';
  }
};

const writeLocal = (url: string) => {
  try {
    localStorage.setItem(LOCAL_SAMPLE_AUDIO_KEY, url);
  } catch (error) {
    console.warn('Could not cache pre-test audio sample URL', error);
  }
};

export const getPretestAudioSampleUrl = async (): Promise<string> => {
  if (isConfigured && db) {
    try {
      const snapshot = await getDoc(doc(db, 'settings', 'pretest-audio'));
      if (snapshot.exists()) {
        const url = String(snapshot.data()?.audioUrl || '');
        writeLocal(url);
        return url;
      }
    } catch (error) {
      console.warn('Could not load pre-test audio sample URL from Firestore', error);
    }
  }
  return readLocal();
};

export const savePretestAudioSampleUrl = async (url: string): Promise<void> => {
  const normalized = url.trim();
  writeLocal(normalized);

  if (isConfigured && db) {
    await setDoc(
      doc(db, 'settings', 'pretest-audio'),
      {
        audioUrl: normalized,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }
};

export const subscribeToPretestAudioSampleUrl = (
  onChange: (url: string) => void,
): (() => void) => {
  if (isConfigured && db) {
    return onSnapshot(
      doc(db, 'settings', 'pretest-audio'),
      snapshot => {
        const url = snapshot.exists() ? String(snapshot.data()?.audioUrl || '') : '';
        writeLocal(url);
        onChange(url);
      },
      error => {
        console.error('Pre-test audio sample live-sync failed', error);
        onChange(readLocal());
      },
    );
  }

  onChange(readLocal());
  return () => {};
};
