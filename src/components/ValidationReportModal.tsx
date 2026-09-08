import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { IELTSTest } from '../types';

interface ValidationReportModalProps {
  test: IELTSTest | null;
  onClose: () => void;
  onPublishAnyway: () => void;
}

export const ValidationReportModal: React.FC<ValidationReportModalProps> = ({ test, onClose, onPublishAnyway }) => {
  if (!test) return null;

  const listeningQ = test.listeningQuestions || [];
  const readingQ = test.readingQuestions || [];
  const readingP = test.readingPassages || [];
  const writingT = test.writingTasks || [];
  const speakingT = test.speakingTasks || [];

  const issues: string[] = [];
  const warnings: string[] = [];
  const successes: string[] = [];

  // 1. Lengths
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

  // 2. IDs
  const allIds = new Set<string>();
  let duplicateIds = false;
  const checkId = (id: string) => {
    if (!id) return;
    if (allIds.has(id)) duplicateIds = true;
    allIds.add(id);
  };
  listeningQ.forEach(q => checkId(q.id));
  readingQ.forEach(q => checkId(q.id));
  readingP.forEach(p => checkId(p.id));

  if (!duplicateIds) successes.push('All IDs unique');
  else issues.push('Duplicate IDs found in questions or passages.');

  // 3. Passage Links
  let invalidLinks = 0;
  const passageIds = new Set(readingP.map(p => p.id));
  readingQ.forEach(q => {
    if (q.passageId && !passageIds.has(q.passageId)) {
      invalidLinks++;
    } else if (!q.passageId) {
      invalidLinks++; // Needs linkage
    }
  });
  if (invalidLinks === 0 && readingQ.length > 0) successes.push('All passage links valid');
  else if (invalidLinks > 0) issues.push(`${invalidLinks} reading questions have missing or invalid passage links.`);

  // 4. Media & Answers
  let missingAudio = false;
  const lData = test.listeningData || [];
  if (lData.length === 0 || !lData.some(d => d.audioUrl && d.audioUrl.trim() !== '')) {
    missingAudio = true;
  }
  if (!missingAudio) successes.push('Listening audio present');
  else warnings.push('Listening audio missing');

  let missingAnswers = 0;
  [...listeningQ, ...readingQ].forEach(q => {
    if (!q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)) {
      missingAnswers++;
    }
  });
  if (missingAnswers > 0) warnings.push(`${missingAnswers} correct answers missing`);

  // Media missing warnings
  let missingMedia = 0;
  [...listeningQ, ...readingQ].forEach(q => {
    if (q.imageUrl && !q.imageUrl.trim()) missingMedia++;
    if (q.media && (!q.media.url || !q.media.url.trim())) missingMedia++;
  });
  writingT.forEach(w => {
    if (w.imageUrl && !w.imageUrl.trim()) missingMedia++;
    if (w.media && (!w.media.url || !w.media.url.trim())) missingMedia++;
  });
  if (missingMedia > 0) warnings.push(`Image/Media missing for ${missingMedia} items`);

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
          
          {hasIssues && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 border border-red-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Import Incomplete</h4>
                <p className="text-sm mt-1">The JSON test is missing required fields. Please fix the issues before publishing.</p>
              </div>
            </div>
          )}

          {!hasIssues && warnings.length > 0 && (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-lg flex gap-3 border border-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Warnings</h4>
                <p className="text-sm mt-1">Test structure is complete, but some media or answers are missing.</p>
              </div>
            </div>
          )}

          {!hasIssues && warnings.length === 0 && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex gap-3 border border-green-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Validation Passed</h4>
                <p className="text-sm mt-1">All required fields and media are present.</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {successes.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{s}</span>
              </div>
            ))}
            
            {warnings.map((w, i) => (
              <div key={i} className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{w}</span>
              </div>
            ))}

            {issues.map((issue, i) => (
              <div key={i} className="flex items-center gap-2 text-red-600 text-sm font-semibold">
                <X className="w-4 h-4" />
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
