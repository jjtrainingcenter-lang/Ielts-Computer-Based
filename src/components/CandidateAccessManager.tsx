import React, { useMemo, useState } from 'react';
import { Candidate, CandidateTestResult, IELTSTest } from '../types';
import { grantCandidateRetake, saveCandidatesBulk } from '../lib/candidateStorage';
import { CheckSquare, RefreshCw, RotateCcw, Shield, Square, Users } from 'lucide-react';

interface CandidateAccessManagerProps {
  candidates: Candidate[];
  tests: IELTSTest[];
  results: CandidateTestResult[];
  onRefresh: () => void | Promise<void>;
  onStatus: (message: string | null) => void;
}

export const CandidateAccessManager: React.FC<CandidateAccessManagerProps> = ({
  candidates,
  tests,
  results,
  onRefresh,
  onStatus,
}) => {
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [cohortFilter, setCohortFilter] = useState('all');
  const [cohortName, setCohortName] = useState('');
  const [retakeTestId, setRetakeTestId] = useState('');
  const [clearPreviousResults, setClearPreviousResults] = useState(false);
  const [busy, setBusy] = useState(false);

  const cohorts = useMemo(
    () => Array.from(new Set(candidates.map(c => c.cohort?.trim()).filter(Boolean) as string[])).sort(),
    [candidates],
  );

  const visibleCandidates = useMemo(
    () => cohortFilter === 'all' ? candidates : candidates.filter(c => (c.cohort || '') === cohortFilter),
    [candidates, cohortFilter],
  );

  const publishedTests = useMemo(
    () => tests.filter(test => !test.status || test.status === 'published'),
    [tests],
  );

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleTest = (id: string) => {
    setSelectedTestIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectVisible = () => {
    const ids = visibleCandidates.map(c => c.id);
    const allSelected = ids.length > 0 && ids.every(id => selectedCandidateIds.includes(id));
    setSelectedCandidateIds(prev => allSelected
      ? prev.filter(id => !ids.includes(id))
      : Array.from(new Set([...prev, ...ids])));
  };

  const updateAssignments = async (mode: 'add' | 'remove' | 'replace') => {
    if (selectedCandidateIds.length === 0) {
      onStatus('Select at least one candidate first.');
      return;
    }
    if (selectedTestIds.length === 0 && mode !== 'replace') {
      onStatus('Select at least one test first.');
      return;
    }

    if (mode === 'replace' && !window.confirm(`Replace all existing test assignments for ${selectedCandidateIds.length} candidate(s)?`)) {
      return;
    }

    setBusy(true);
    try {
      const selected = candidates.filter(c => selectedCandidateIds.includes(c.id));
      const updated = selected.map(candidate => {
        const current = candidate.assignedTestIds || [];
        let assignedTestIds: string[];
        if (mode === 'add') assignedTestIds = Array.from(new Set([...current, ...selectedTestIds]));
        else if (mode === 'remove') assignedTestIds = current.filter(id => !selectedTestIds.includes(id));
        else assignedTestIds = [...selectedTestIds];
        return { ...candidate, assignedTestIds };
      });
      await saveCandidatesBulk(updated);
      onStatus(`${mode === 'add' ? 'Assigned' : mode === 'remove' ? 'Removed' : 'Replaced'} test access for ${updated.length} candidate(s). Changes are live.`);
      await onRefresh();
    } catch (error: any) {
      onStatus(`Bulk assignment failed: ${error?.message || error}`);
    } finally {
      setBusy(false);
    }
  };

  const applyCohort = async () => {
    if (selectedCandidateIds.length === 0) {
      onStatus('Select candidates before setting a cohort.');
      return;
    }
    const nextCohort = cohortName.trim();
    setBusy(true);
    try {
      const updated = candidates
        .filter(c => selectedCandidateIds.includes(c.id))
        .map(c => ({ ...c, cohort: nextCohort || undefined }));
      await saveCandidatesBulk(updated);
      onStatus(nextCohort
        ? `Cohort “${nextCohort}” applied to ${updated.length} candidate(s).`
        : `Cohort cleared for ${updated.length} candidate(s).`);
      await onRefresh();
    } catch (error: any) {
      onStatus(`Cohort update failed: ${error?.message || error}`);
    } finally {
      setBusy(false);
    }
  };

  const setCandidateStatus = async (status: 'active' | 'blocked') => {
    if (selectedCandidateIds.length === 0) {
      onStatus('Select at least one candidate first.');
      return;
    }
    if (status === 'blocked' && !window.confirm(`Block ${selectedCandidateIds.length} candidate(s)? Any open exam will be closed on their device.`)) {
      return;
    }
    setBusy(true);
    try {
      const updated = candidates
        .filter(c => selectedCandidateIds.includes(c.id))
        .map(c => ({ ...c, status }));
      await saveCandidatesBulk(updated);
      onStatus(`${updated.length} candidate(s) ${status === 'blocked' ? 'blocked' : 'activated'}.`);
      await onRefresh();
    } catch (error: any) {
      onStatus(`Status update failed: ${error?.message || error}`);
    } finally {
      setBusy(false);
    }
  };

  const grantRetake = async () => {
    if (selectedCandidateIds.length === 0 || !retakeTestId) {
      onStatus('Select one or more candidates and choose the test to reset.');
      return;
    }

    const test = tests.find(item => item.id === retakeTestId);
    const previousCount = results.filter(
      result => selectedCandidateIds.includes(result.candidateId) && result.testId === retakeTestId,
    ).length;

    const extra = clearPreviousResults
      ? ` Previous result records (${previousCount}) will also be deleted.`
      : ' Previous result records will be kept as history.';

    if (!window.confirm(`Grant a fresh attempt for “${test?.title || retakeTestId}” to ${selectedCandidateIds.length} candidate(s)? Any currently open copy of this test will be reset.${extra}`)) {
      return;
    }

    setBusy(true);
    try {
      for (const candidateId of selectedCandidateIds) {
        await grantCandidateRetake(candidateId, retakeTestId, clearPreviousResults);
      }
      onStatus(`Fresh retake granted to ${selectedCandidateIds.length} candidate(s) for ${test?.title || retakeTestId}.`);
      await onRefresh();
    } catch (error: any) {
      onStatus(`Retake reset failed: ${error?.message || error}`);
    } finally {
      setBusy(false);
    }
  };

  const visibleIds = visibleCandidates.map(candidate => candidate.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedCandidateIds.includes(id));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            Candidate Access, Cohorts & Retakes
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Assign multiple tests to multiple candidates, manage cohorts, block access, or grant a clean retake without deleting historical results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={cohortFilter}
            onChange={event => setCohortFilter(event.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
          >
            <option value="all">All cohorts</option>
            {cohorts.map(cohort => <option key={cohort} value={cohort}>{cohort}</option>)}
          </select>
          <button
            type="button"
            onClick={selectVisible}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5"
          >
            {allVisibleSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            {allVisibleSelected ? 'Deselect visible' : 'Select visible'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Candidates</span>
            <span className="text-[11px] text-slate-500">{selectedCandidateIds.length} selected</span>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
            {visibleCandidates.map(candidate => {
              const selected = selectedCandidateIds.includes(candidate.id);
              return (
                <label key={candidate.id} className={`flex items-center gap-3 p-3 cursor-pointer ${selected ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggleCandidate(candidate.id)} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{candidate.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">#{candidate.id}{candidate.cohort ? ` · ${candidate.cohort}` : ''}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${candidate.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {candidate.status === 'blocked' ? 'Blocked' : 'Active'}
                  </span>
                </label>
              );
            })}
            {visibleCandidates.length === 0 && <div className="p-4 text-xs text-slate-400 text-center">No candidates in this cohort.</div>}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Tests to assign</span>
            <button
              type="button"
              onClick={() => setSelectedTestIds(selectedTestIds.length === publishedTests.length ? [] : publishedTests.map(test => test.id))}
              className="text-[11px] font-bold text-blue-700 hover:underline"
            >
              {selectedTestIds.length === publishedTests.length ? 'Deselect all' : 'Select all tests'}
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
            {publishedTests.map(test => {
              const selected = selectedTestIds.includes(test.id);
              return (
                <label key={test.id} className={`flex items-center gap-3 p-3 cursor-pointer ${selected ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggleTest(test.id)} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{test.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{test.id}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => updateAssignments('add')} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50">Add selected tests</button>
        <button disabled={busy} onClick={() => updateAssignments('remove')} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-50">Remove selected tests</button>
        <button disabled={busy} onClick={() => updateAssignments('replace')} className="px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold disabled:opacity-50">Replace assignments</button>
        <button disabled={busy} onClick={() => setCandidateStatus('active')} className="px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold disabled:opacity-50">Activate selected</button>
        <button disabled={busy} onClick={() => setCandidateStatus('blocked')} className="px-3 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 text-xs font-bold disabled:opacity-50 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Block selected</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50">
          <div className="text-xs font-bold text-slate-800">Cohort / Class</div>
          <div className="flex gap-2">
            <input
              value={cohortName}
              onChange={event => setCohortName(event.target.value)}
              placeholder="e.g. September Batch A"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
            />
            <button disabled={busy} onClick={applyCohort} className="px-3 py-2 rounded-lg bg-[#214162] text-white text-xs font-bold disabled:opacity-50">Apply</button>
          </div>
          <p className="text-[10px] text-slate-500">Leave the cohort name blank and click Apply to remove the selected candidates from a cohort.</p>
        </div>

        <div className="rounded-lg border border-blue-200 p-4 space-y-3 bg-blue-50/60">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-blue-700" /> Reset / Grant Retake</div>
          <select
            value={retakeTestId}
            onChange={event => setRetakeTestId(event.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
          >
            <option value="">Choose test to reset...</option>
            {publishedTests.map(test => <option key={test.id} value={test.id}>{test.title}</option>)}
          </select>
          <label className="flex items-center gap-2 text-[11px] text-slate-700">
            <input type="checkbox" checked={clearPreviousResults} onChange={event => setClearPreviousResults(event.target.checked)} />
            Delete previous result records for this candidate/test
          </label>
          <button disabled={busy || !retakeTestId} onClick={grantRetake} className="w-full px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
            {busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            Grant Fresh Attempt
          </button>
          <p className="text-[10px] text-slate-500">If the student currently has this test open, the live access system will invalidate the old session and require a fresh start.</p>
        </div>
      </div>
    </div>
  );
};
