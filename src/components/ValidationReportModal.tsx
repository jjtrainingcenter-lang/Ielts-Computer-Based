import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { IELTSTest } from '../types';

interface ValidationReportModalProps {
  test: IELTSTest | null;
  onClose: () => void;
  onPublishAnyway: () => void;
}

const exactNumbersPresent = (values: number[], start: number, end: number) => {
  if (values.length !== end - start + 1) return false;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.every((value, index) => value === start + index);
};

const uniqueNumbers = (values: Array<number | undefined>) =>
  [...new Set(values.filter((v): v is number => typeof v === 'number'))].sort((a, b) => a - b);

const isChoiceOrMatchingType = (type: string) =>
  [
    'multiple-choice',
    'multiple-choice-single-answer',
    'multiple-choice-multiple-answer',
    'multiple-response',
    'matching',
    'matching-information',
    'matching-features',
    'matching-sentence-endings',
    'matching-headings',
    'paragraph-matching',
    'dropdown',
    'map-labeling',
    'diagram-labeling',
  ].includes(type);

export const ValidationReportModal: React.FC<ValidationReportModalProps> = ({ test, onClose, onPublishAnyway }) => {
  if (!test) return null;

  const listeningQ = test.listeningQuestions || [];
  const readingQ = test.readingQuestions || [];
  const readingP = test.readingPassages || [];
  const writingT = test.writingTasks || [];
  const speakingT = test.speakingTasks || [];
  const listeningData = test.listeningData || [];

  // Normalize legacy/import aliases into the canonical runtime type used by scoring.
  // This happens on the same in-memory object that is published after validation,
  // so imported multi-answer questions score correctly without changing source wording/options.
  [...listeningQ, ...readingQ].forEach((q) => {
    if (q.type === 'multiple-choice-multiple-answer') {
      q.type = 'multiple-response';
    }
  });

  const issues: string[] = [];
  const warnings: string[] = [];
  const successes: string[] = [];

  // Required counts
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

  // Exact numbering
  const listeningNumbers = listeningQ.map((q) => q.questionNumber);
  const readingNumbers = readingQ.map((q) => q.questionNumber);
  if (exactNumbersPresent(listeningNumbers, 1, 40)) successes.push('Listening numbering is exactly 1–40');
  else issues.push('Listening question numbers must contain each number 1–40 exactly once.');

  if (exactNumbersPresent(readingNumbers, 1, 40)) successes.push('Reading numbering is exactly 1–40');
  else issues.push('Reading question numbers must contain each number 1–40 exactly once.');

  // IELTS part structure
  const listeningParts = uniqueNumbers(listeningQ.map((q) => q.partNumber));
  const readingParts = uniqueNumbers(readingP.map((p) => p.partNumber));
  const speakingParts = uniqueNumbers(speakingT.map((s) => s.partNumber));

  if ([1, 2, 3, 4].every((p) => listeningParts.includes(p))) successes.push('Listening Parts 1–4 present');
  else issues.push(`Listening parts present: ${listeningParts.length ? listeningParts.join(', ') : 'none'}; expected 1, 2, 3, 4.`);

  if ([1, 2, 3].every((p) => readingParts.includes(p))) successes.push('Reading Passage Parts 1–3 present');
  else issues.push(`Reading passage parts present: ${readingParts.length ? readingParts.join(', ') : 'none'}; expected 1, 2, 3.`);

  if ([1, 2, 3].every((p) => speakingParts.includes(p))) successes.push('Speaking Parts 1–3 present');
  else issues.push(`Speaking parts present: ${speakingParts.length ? speakingParts.join(', ') : 'none'}; expected 1, 2, 3.`);

  // IDs must exist and be unique inside a test. IDs may be reused in other tests because testId namespaces them.
  const ids: string[] = [];
  let missingIds = 0;
  [...listeningQ, ...readingQ].forEach((q) => {
    if (!q.id?.trim()) missingIds += 1;
    else ids.push(q.id.trim());
  });
  readingP.forEach((p) => {
    if (!p.id?.trim()) missingIds += 1;
    else ids.push(p.id.trim());
  });

  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (missingIds === 0 && duplicateIds.length === 0) successes.push('All question/passage IDs are present and unique');
  if (missingIds > 0) issues.push(`${missingIds} question/passage IDs are missing.`);
  if (duplicateIds.length > 0) issues.push(`Duplicate IDs found: ${[...new Set(duplicateIds)].join(', ')}`);

  // Reading passage linkage
  const passageIds = new Set(readingP.map((p) => p.id));
  const invalidLinks = readingQ.filter((q) => !q.passageId || !passageIds.has(q.passageId));
  if (invalidLinks.length === 0 && readingQ.length > 0) successes.push('All Reading passage links are valid');
  else if (invalidLinks.length > 0) issues.push(`${invalidLinks.length} Reading questions have missing or invalid passageId references.`);

  // Option banks
  const optionProblems = [...listeningQ, ...readingQ].filter((q) => {
    if (!isChoiceOrMatchingType(q.type)) return false;
    if (['map-labeling', 'diagram-labeling'].includes(q.type) && !q.options?.length) return false; // some label questions are free text
    return !q.options || q.options.length === 0 || q.options.some((opt) => !opt.value || !opt.label);
  });
  if (optionProblems.length === 0) successes.push('Choice/matching option banks are valid');
  else issues.push(`${optionProblems.length} choice/matching questions have missing or invalid options.`);

  // Listening audio can be a single full recording or multiple part recordings.
  const audioTracks = listeningData.filter((d) => d.audioUrl?.trim());
  if (audioTracks.length === 0) {
    warnings.push('Listening audio missing. Add one full recording or part recordings before live use.');
  } else if (audioTracks.length === 1) {
    successes.push('Listening audio: one full recording detected');
  } else {
    successes.push(`Listening audio: ${audioTracks.length} part recordings detected`);
    const trackParts = uniqueNumbers(audioTracks.map((d) => d.partNumber));
    if (![1, 2, 3, 4].every((p) => trackParts.includes(p))) {
      warnings.push(`Multiple Listening audio files supplied, but audio parts are ${trackParts.join(', ')}; expected Parts 1–4 for separate-track mode.`);
    }
  }

  // Answer key completeness
  const missingListeningAnswers = listeningQ.filter((q) =>
    !q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)
  ).length;
  const missingReadingAnswers = readingQ.filter((q) =>
    !q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)
  ).length;

  if (missingListeningAnswers === 0) successes.push('Listening answer key complete');
  else warnings.push(`${missingListeningAnswers} Listening correct answers are missing.`);

  if (missingReadingAnswers === 0) successes.push('Reading answer key complete');
  else warnings.push(`${missingReadingAnswers} Reading correct answers are missing.`);

  // Media integrity and likely-required visuals
  let brokenMediaRefs = 0;
  [...listeningQ, ...readingQ].forEach((q) => {
    if (q.media && !q.media.url?.trim()) brokenMediaRefs += 1;
    if (q.groupMedia && !q.groupMedia.url?.trim()) brokenMediaRefs += 1;
  });
  writingT.forEach((w) => {
    if (w.media && !w.media.url?.trim()) brokenMediaRefs += 1;
  });
  if (brokenMediaRefs > 0) warnings.push(`${brokenMediaRefs} media objects have an empty URL.`);

  const visualQuestionMissingMedia = [...listeningQ, ...readingQ].filter((q) =>
    ['map-labeling', 'diagram-labeling'].includes(q.type) &&
    !q.media?.url && !q.groupMedia?.url && !q.imageUrl
  );
  if (visualQuestionMissingMedia.length > 0) {
    warnings.push(`${visualQuestionMissingMedia.length} map/diagram questions have no visible media reference.`);
  }

  const writingTask1 = writingT.find((w) => w.taskNumber === 1);
  const task1HasVisual = !!(
    writingTask1?.media?.url ||
    writingTask1?.imageUrl ||
    writingTask1?.chartData ||
    writingTask1?.chartType === 'letter'
  );
  if (writingTask1 && !task1HasVisual) {
    warnings.push('Writing Task 1 has no image/chart data. This is valid for letters, but Academic Task 1 normally needs its graph/map/process/table visual.');
  }

  const hasIssues = issues.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="font-bold text-lg text-slate-800">Import Validation Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {hasIssues ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 border border-red-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Import Incomplete</h4>
                <p className="text-sm mt-1">Required IELTS structure is incomplete. Fix the red items before publishing.</p>
              </div>
            </div>
          ) : warnings.length > 0 ? (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-lg flex gap-3 border border-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Structure Passed With Warnings</h4>
                <p className="text-sm mt-1">The full test structure is valid. Review media/audio/answer warnings before live use.</p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex gap-3 border border-green-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Validation Passed</h4>
                <p className="text-sm mt-1">Required test structure, links, answers and referenced media are present.</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {successes.map((s, i) => (
              <div key={`success-${i}`} className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{s}</span>
              </div>
            ))}

            {warnings.map((w, i) => (
              <div key={`warning-${i}`} className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{w}</span>
              </div>
            ))}

            {issues.map((issue, i) => (
              <div key={`issue-${i}`} className="flex items-center gap-2 text-red-600 text-sm font-semibold">
                <X className="w-4 h-4 shrink-0" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-100 font-semibold text-sm"
          >
            {hasIssues ? 'Close & Fix Issues' : 'Cancel'}
          </button>

          {!hasIssues && (
            <button
              onClick={() => {
                onClose();
                onPublishAnyway();
              }}
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
