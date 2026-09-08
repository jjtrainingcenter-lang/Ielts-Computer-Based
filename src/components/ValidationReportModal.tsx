import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { IELTSTest, Question } from '../types';

interface ValidationReportModalProps {
  test: IELTSTest | null;
  onClose: () => void;
  onPublishAnyway: () => void;
}

const exactlyNumbered = (questions: Question[], count: number) => {
  if (questions.length !== count) return false;
  const nums = questions.map((q) => q.questionNumber).sort((a, b) => a - b);
  return nums.every((n, i) => n === i + 1);
};

const sameNumbers = (values: number[], expected: number[]) => {
  const a = [...new Set(values)].sort((x, y) => x - y);
  const b = [...expected].sort((x, y) => x - y);
  return a.length === b.length && a.every((n, i) => n === b[i]);
};

const questionTypesRequiringOptions = new Set([
  'multiple-choice',
  'multiple-choice-single-answer',
  'multiple-choice-multiple-answer',
  'multiple-response',
  'true-false-not-given',
  'yes-no-not-given',
  'matching',
  'matching-information',
  'matching-features',
  'matching-sentence-endings',
  'matching-headings',
  'paragraph-matching',
  'map-labeling',
]);

export const ValidationReportModal: React.FC<ValidationReportModalProps> = ({ test, onClose, onPublishAnyway }) => {
  if (!test) return null;

  const listeningQ = test.listeningQuestions || [];
  const readingQ = test.readingQuestions || [];
  const readingP = test.readingPassages || [];
  const writingT = test.writingTasks || [];
  const speakingT = test.speakingTasks || [];
  const listeningData = test.listeningData || [];

  const issues: string[] = [];
  const warnings: string[] = [];
  const successes: string[] = [];

  if (listeningQ.length === 40) successes.push('40/40 Listening questions');
  else issues.push(`Listening questions: ${listeningQ.length}/40`);

  if (readingQ.length === 40) successes.push('40/40 Reading questions');
  else issues.push(`Reading questions: ${readingQ.length}/40`);

  if (readingP.length === 3) successes.push('3/3 Reading passages');
  else issues.push(`Reading passages: ${readingP.length}/3`);

  if (writingT.length === 2) successes.push('2/2 Writing tasks');
  else issues.push(`Writing tasks: ${writingT.length}/2`);

  if (speakingT.length === 3) successes.push('3/3 Speaking parts');
  else issues.push(`Speaking parts: ${speakingT.length}/3`);

  if (exactlyNumbered(listeningQ, 40)) successes.push('Listening numbering is exactly 1–40');
  else if (listeningQ.length > 0) issues.push('Listening question numbers must contain each number from 1 to 40 exactly once.');

  if (exactlyNumbered(readingQ, 40)) successes.push('Reading numbering is exactly 1–40');
  else if (readingQ.length > 0) issues.push('Reading question numbers must contain each number from 1 to 40 exactly once.');

  const listeningParts = listeningQ.map((q) => q.partNumber).filter((n): n is number => typeof n === 'number');
  if (sameNumbers(listeningParts, [1, 2, 3, 4])) successes.push('Listening questions cover Parts 1–4');
  else if (listeningQ.length > 0) issues.push('Listening questions must cover Parts 1, 2, 3 and 4.');

  const readingParts = readingP.map((p) => p.partNumber).filter((n): n is number => typeof n === 'number');
  if (sameNumbers(readingParts, [1, 2, 3])) successes.push('Reading passages cover Parts 1–3');
  else if (readingP.length > 0) issues.push('Reading passages must use partNumber 1, 2 and 3.');

  const speakingParts = speakingT.map((s) => s.partNumber).filter((n): n is number => typeof n === 'number');
  if (sameNumbers(speakingParts, [1, 2, 3])) successes.push('Speaking contains Parts 1–3');
  else if (speakingT.length > 0) issues.push('Speaking tasks must use partNumber 1, 2 and 3.');

  const allIds = new Set<string>();
  let duplicateIds = false;
  let missingIds = 0;
  const checkId = (id?: string) => {
    if (!id || !id.trim()) {
      missingIds++;
      return;
    }
    if (allIds.has(id)) duplicateIds = true;
    allIds.add(id);
  };
  listeningQ.forEach((q) => checkId(q.id));
  readingQ.forEach((q) => checkId(q.id));
  readingP.forEach((p) => checkId(p.id));

  if (!duplicateIds && missingIds === 0) successes.push('All question and passage IDs are present and unique');
  if (duplicateIds) issues.push('Duplicate IDs found in questions or passages.');
  if (missingIds > 0) issues.push(`${missingIds} questions/passages are missing an ID.`);

  let invalidLinks = 0;
  const passageIds = new Set(readingP.map((p) => p.id));
  readingQ.forEach((q) => {
    if (!q.passageId || !passageIds.has(q.passageId)) invalidLinks++;
  });
  if (invalidLinks === 0 && readingQ.length > 0) successes.push('All Reading passage links are valid');
  else if (invalidLinks > 0) issues.push(`${invalidLinks} Reading questions have missing or invalid passageId values.`);

  let badOptions = 0;
  [...listeningQ, ...readingQ].forEach((q) => {
    if (!questionTypesRequiringOptions.has(q.type)) return;
    if (!q.options || q.options.length === 0) {
      badOptions++;
      return;
    }
    if (q.options.some((o) => !String(o.value ?? '').trim() || !String(o.label ?? '').trim())) badOptions++;
  });
  if (badOptions === 0) successes.push('Choice/matching option banks are valid');
  else issues.push(`${badOptions} choice/matching questions have missing or malformed options.`);

  const audioTracks = listeningData.filter((d) => d.audioUrl && d.audioUrl.trim() !== '');
  if (audioTracks.length > 0) {
    successes.push(audioTracks.length === 1 ? 'One full Listening audio track is configured' : `${audioTracks.length} Listening audio tracks are configured`);
  } else {
    warnings.push('Listening audio missing');
  }

  if (listeningData.length > 1) {
    const dataParts = listeningData.map((d) => d.partNumber).filter((n): n is number => typeof n === 'number');
    if (!sameNumbers(dataParts, [1, 2, 3, 4])) {
      warnings.push('Multiple Listening data entries are present, but they do not cover all Parts 1–4. This is fine only when a single full-test audio track is intended.');
    }
  }

  let missingAnswers = 0;
  [...listeningQ, ...readingQ].forEach((q) => {
    if (Array.isArray(q.correctAnswer)) {
      if (q.correctAnswer.length === 0 || q.correctAnswer.every((a) => !String(a).trim())) missingAnswers++;
    } else if (!String(q.correctAnswer ?? '').trim()) {
      missingAnswers++;
    }
  });
  if (missingAnswers === 0 && listeningQ.length + readingQ.length > 0) successes.push('All Listening and Reading answers are present');
  else if (missingAnswers > 0) warnings.push(`${missingAnswers} correct answers are missing`);

  let brokenMediaRefs = 0;
  [...listeningQ, ...readingQ].forEach((q) => {
    if (q.media && (!q.media.url || !q.media.url.trim())) brokenMediaRefs++;
    if (q.groupMedia && (!q.groupMedia.url || !q.groupMedia.url.trim())) brokenMediaRefs++;
  });
  writingT.forEach((w) => {
    if (w.media && (!w.media.url || !w.media.url.trim())) brokenMediaRefs++;
  });
  listeningData.forEach((d) => {
    if (d.imageUrl !== undefined && !String(d.imageUrl).trim()) brokenMediaRefs++;
  });
  if (brokenMediaRefs > 0) warnings.push(`${brokenMediaRefs} media objects are present but have an empty URL`);

  const mapOrDiagramQuestions = listeningQ.filter((q) => q.type === 'map-labeling' || q.type === 'diagram-labeling');
  const mapOrDiagramWithoutVisibleMedia = mapOrDiagramQuestions.filter((q) => {
    if (q.media?.url || q.groupMedia?.url || q.imageUrl) return false;
    const sectionImage = listeningData.find((d) => d.partNumber === q.partNumber)?.imageUrl;
    return !sectionImage;
  });
  if (mapOrDiagramWithoutVisibleMedia.length > 0) {
    warnings.push(`${mapOrDiagramWithoutVisibleMedia.length} Listening map/diagram questions do not have question, group, or part-level image media.`);
  }

  const task1 = writingT.find((w) => w.taskNumber === 1);
  if (task1 && (task1.media?.url || task1.imageUrl || task1.chartData)) successes.push('Writing Task 1 visual/data support is configured');
  else if (task1) warnings.push('Writing Task 1 has no image, media object or chartData. Ignore this only if the task does not require a visual.');

  const hasIssues = issues.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="font-bold text-lg text-slate-800">Full Test Validation Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {hasIssues && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 border border-red-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Import Incomplete</h4>
                <p className="text-sm mt-1">The test has structural problems that must be fixed before publishing.</p>
              </div>
            </div>
          )}

          {!hasIssues && warnings.length > 0 && (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-lg flex gap-3 border border-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Structure Passed with Warnings</h4>
                <p className="text-sm mt-1">Counts and links are valid, but review the warnings before publishing.</p>
              </div>
            </div>
          )}

          {!hasIssues && warnings.length === 0 && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex gap-3 border border-green-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Validation Passed</h4>
                <p className="text-sm mt-1">The full IELTS test structure is complete and internally consistent.</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {successes.map((s, i) => (
              <div key={`s-${i}`} className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{s}</span>
              </div>
            ))}
            {warnings.map((w, i) => (
              <div key={`w-${i}`} className="flex items-start gap-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{w}</span>
              </div>
            ))}
            {issues.map((issue, i) => (
              <div key={`e-${i}`} className="flex items-start gap-2 text-red-600 text-sm font-semibold">
                <X className="w-4 h-4 shrink-0 mt-0.5" /><span>{issue}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-100 font-semibold text-sm">
            {hasIssues ? 'Close & Fix Issues' : 'Cancel'}
          </button>
          {!hasIssues && (
            <button
              onClick={() => { onClose(); onPublishAnyway(); }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm"
            >
              Publish Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
