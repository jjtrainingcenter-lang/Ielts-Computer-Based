import React, { useState, useEffect } from 'react';
import { db, storage, logout, isConfigured } from '../lib/firebase';
import {
  getCandidates,
  saveCandidate,
  deleteCandidate,
  getAllTests,
  saveTest,
  deleteTest,
  getAllTestResults,
  updateTestResult,
  deleteTestResult,
  generateUniqueRegNumber
} from '../lib/candidateStorage';
import { Candidate, IELTSTest, Question, ReadingPassage, CandidateTestResult, IELTSSectionTimers, WritingTaskData } from '../types';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ValidationReportModal } from './ValidationReportModal';
import {
  X, LogOut, Save, Plus, Trash2, UploadCloud, Edit3, Code, FileJson, Copy, Check,
  Users, BookOpen, Award, Sparkles, RefreshCw, CheckSquare, Square, Search, Filter, ShieldCheck, ChevronRight,
  Clock, Timer, Headphones, FileEdit, Mic, Settings2, Eye, FileText, CheckCircle2, XCircle, Printer, Download,
  CheckCheck, PenTool, MessageSquare, AlertTriangle, ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

const TIMER_PRESETS: Record<string, { label: string; listening: number; reading: number; writing: number; speaking: number; multiplier: number; description: string }> = {
  standard: {
    label: 'Standard IELTS (Official)',
    listening: 30,
    reading: 60,
    writing: 60,
    speaking: 14,
    multiplier: 1.0,
    description: '30m Listening · 60m Reading · 60m Writing · 14m Speaking (Total: 164m)'
  },
  extra25: {
    label: '+25% Extra Time (Accommodation)',
    listening: 38,
    reading: 75,
    writing: 75,
    speaking: 18,
    multiplier: 1.25,
    description: '38m Listening · 75m Reading · 75m Writing · 18m Speaking (Total: 206m)'
  },
  extra50: {
    label: '+50% Extra Time (Accommodation)',
    listening: 45,
    reading: 90,
    writing: 90,
    speaking: 21,
    multiplier: 1.5,
    description: '45m Listening · 90m Reading · 90m Writing · 21m Speaking (Total: 246m)'
  },
  rapid: {
    label: 'Rapid Speed Drill',
    listening: 15,
    reading: 20,
    writing: 20,
    speaking: 10,
    multiplier: 0.5,
    description: '15m Listening · 20m Reading · 20m Writing · 10m Speaking (Total: 65m)'
  },
  custom: {
    label: 'Custom Part Timers',
    listening: 30,
    reading: 60,
    writing: 60,
    speaking: 14,
    multiplier: 1.0,
    description: 'Specify custom duration in minutes for each individual IELTS part'
  }
};

const SAMPLE_LISTENING_QUESTIONS: Question[] = [
  {
    id: 'l1',
    section: 'listening',
    partNumber: 1,
    questionNumber: 1,
    instruction: 'Write ONE WORD AND/OR A NUMBER for each answer.',
    questionText: 'Customer contact telephone: ___',
    type: 'fill-blank',
    correctAnswer: '07700900123',
    explanation: 'The speaker provides their phone number in Part 1 conversation.'
  },
  {
    id: 'l2',
    section: 'listening',
    partNumber: 1,
    questionNumber: 2,
    instruction: 'Choose the correct letter, A, B, or C.',
    questionText: 'Which day will the seminar hall be available?',
    type: 'multiple-choice',
    options: [
      { value: 'A', label: 'A) Thursday' },
      { value: 'B', label: 'B) Friday' },
      { value: 'C', label: 'C) Saturday' }
    ],
    correctAnswer: 'B',
    explanation: 'The coordinator confirms Friday availability.'
  }
];

const SAMPLE_READING_QUESTIONS: Question[] = [
  {
    id: 'r1',
    section: 'reading',
    passageId: 'p1',
    partNumber: 1,
    questionNumber: 1,
    instruction: 'Do the following statements agree with the information in Reading Passage 1? Write TRUE, FALSE, or NOT GIVEN.',
    questionText: 'Urban transportation accounts for roughly 24 percent of carbon emissions.',
    type: 'true-false-not-given',
    options: [
      { value: 'TRUE', label: 'TRUE' },
      { value: 'FALSE', label: 'FALSE' },
      { value: 'NOT GIVEN', label: 'NOT GIVEN' }
    ],
    correctAnswer: 'TRUE',
    explanation: 'Paragraph 1 explicitly confirms 24 percent of direct carbon dioxide emissions.'
  }
];

const ImageUploadField: React.FC<{
  label?: string;
  imageUrl?: string;
  onImageChange: (url: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => void;
}> = ({ label = "Image", imageUrl, onImageChange, onUpload }) => {
  return (
    <div className="space-y-1.5 border border-slate-200 p-2 rounded-lg bg-white">
      <label className="block text-[10px] font-bold uppercase text-slate-500">{label}</label>
      <div className="flex items-center space-x-2">
        <label className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200">
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Upload</span>
          <input type="file" accept="image/*" onChange={(e) => onUpload(e, onImageChange)} className="hidden" />
        </label>
        <input
          type="text"
          value={imageUrl || ''}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="Or paste URL..."
          className="flex-1 p-1 border border-slate-300 rounded text-[10px] bg-white font-mono"
        />
        {imageUrl && (
          <button onClick={() => onImageChange('')} className="text-slate-400 hover:text-red-500">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {imageUrl && (
        <div className="mt-1">
          <img src={imageUrl} alt="Preview" className="h-12 object-contain rounded border border-slate-200" />
        </div>
      )}
    </div>
  );
};

const PassageBlockBuilder: React.FC<{
  paragraphs: any[];
  onChange: (paragraphs: any[]) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => void;
}> = ({ paragraphs = [], onChange, onUpload }) => {
  const addBlock = (type: 'text' | 'image' | 'heading' | 'table') => {
    onChange([...paragraphs, { id: Date.now().toString(), type, text: '', imageUrl: '' }]);
  };

  const removeBlock = (idx: number) => {
    const newP = [...paragraphs];
    newP.splice(idx, 1);
    onChange(newP);
  };

  const updateBlock = (idx: number, updates: any) => {
    const newP = [...paragraphs];
    newP[idx] = { ...newP[idx], ...updates };
    onChange(newP);
  };

  return (
    <div className="space-y-3 mt-2 border border-slate-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between">
        <h5 className="text-[11px] font-bold text-slate-600 uppercase">Passage Blocks</h5>
        <div className="flex items-center space-x-1">
          <button onClick={() => addBlock('heading')} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-semibold text-slate-700">+ Heading</button>
          <button onClick={() => addBlock('text')} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-semibold text-slate-700">+ Paragraph</button>
          <button onClick={() => addBlock('image')} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-semibold text-slate-700">+ Image</button>
          <button onClick={() => addBlock('table')} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-semibold text-slate-700">+ Table</button>
        </div>
      </div>
      {paragraphs.length === 0 && (
        <div className="text-xs text-slate-400 italic py-2 text-center border border-dashed border-slate-300 rounded">No blocks added.</div>
      )}
      <div className="space-y-2">
        {paragraphs.map((p, idx) => (
          <div key={p.id || idx} className="flex gap-2 relative bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold uppercase w-16 shrink-0 pt-1">
              {p.type || 'text'}
            </div>
            <div className="flex-1">
              {(p.type === 'text' || p.type === 'table' || !p.type) && (
                <textarea
                  value={p.text || ''}
                  onChange={(e) => updateBlock(idx, { text: e.target.value })}
                  rows={p.type === 'text' || !p.type ? 3 : 2}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-white"
                  placeholder={p.type === 'table' ? "Table markdown or data..." : "Paragraph text..."}
                />
              )}
              {p.type === 'heading' && (
                <input
                  type="text"
                  value={p.text || ''}
                  onChange={(e) => updateBlock(idx, { text: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-bold bg-white"
                  placeholder="Heading text..."
                />
              )}
              {p.type === 'image' && (
                <ImageUploadField
                  label="Block Image"
                  imageUrl={p.imageUrl}
                  onImageChange={(url) => updateBlock(idx, { imageUrl: url })}
                  onUpload={onUpload}
                />
              )}
            </div>
            <button onClick={() => removeBlock(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'tests' | 'visual-builder' | 'json-builder' | 'results'>('candidates');
  const [testToValidate, setTestToValidate] = useState<IELTSTest | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  
  // Candidates State
  const [candidatesList, setCandidatesList] = useState<Candidate[]>([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDob, setNewCandidateDob] = useState('2000-01-01');
  const [newCandidateRegId, setNewCandidateRegId] = useState('');
  const [selectedTestAssignments, setSelectedTestAssignments] = useState<string[]>([]);
  
  // Candidate Part Timer Options
  const [candidateTimerPreset, setCandidateTimerPreset] = useState<'standard' | 'extra25' | 'extra50' | 'rapid' | 'custom'>('standard');
  const [candidateListeningTimer, setCandidateListeningTimer] = useState<number>(30);
  const [candidateReadingTimer, setCandidateReadingTimer] = useState<number>(60);
  const [candidateWritingTimer, setCandidateWritingTimer] = useState<number>(60);
  const [candidateSpeakingTimer, setCandidateSpeakingTimer] = useState<number>(14);

  // Editing Candidate Modal State
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editAssignments, setEditAssignments] = useState<string[]>([]);
  const [editTimerPreset, setEditTimerPreset] = useState<'standard' | 'extra25' | 'extra50' | 'rapid' | 'custom'>('standard');
  const [editListeningTimer, setEditListeningTimer] = useState<number>(30);
  const [editReadingTimer, setEditReadingTimer] = useState<number>(60);
  const [editWritingTimer, setEditWritingTimer] = useState<number>(60);
  const [editSpeakingTimer, setEditSpeakingTimer] = useState<number>(14);

  // Tests State
  const [allTests, setAllTests] = useState<IELTSTest[]>([]);
  const [resultsList, setResultsList] = useState<CandidateTestResult[]>([]);
  
  // Status & Feedback
  const [status, setStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Results Tab Inspection State
  const [inspectingResult, setInspectingResult] = useState<CandidateTestResult | null>(null);
  const [inspectActiveTab, setInspectActiveTab] = useState<'writing' | 'listening' | 'reading' | 'trf'>('writing');
  const [teacherTask1Band, setTeacherTask1Band] = useState<number>(7.0);
  const [teacherTask2Band, setTeacherTask2Band] = useState<number>(7.0);
  const [teacherOverallWritingBand, setTeacherOverallWritingBand] = useState<number>(7.0);
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [copiedEssayTask, setCopiedEssayTask] = useState<number | null>(null);
  const [resultsSearchQuery, setResultsSearchQuery] = useState<string>('');
  const [resultsFilter, setResultsFilter] = useState<'all' | 'with-writing' | 'graded' | 'ungraded'>('all');

  // Builder State & Test Editing
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testId, setTestId] = useState(`jj-test-${Date.now().toString().slice(-4)}`);
  const [testTitle, setTestTitle] = useState('JJ Academy Custom Mock Test');
  const [testModule, setTestModule] = useState<'academic' | 'general'>('academic');
  const [testStatus, setTestStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [testDescription, setTestDescription] = useState('Official simulation test created via Admin Panel.');
  const [testAssignedToAll, setTestAssignedToAll] = useState(false);
  const [testListeningTimer, setTestListeningTimer] = useState<number>(30);
  const [testReadingTimer, setTestReadingTimer] = useState<number>(60);
  const [testWritingTimer, setTestWritingTimer] = useState<number>(60);
  const [testSpeakingTimer, setTestSpeakingTimer] = useState<number>(14);
  const [listeningAudioUrl, setListeningAudioUrl] = useState('');
  const [listeningQuestions, setListeningQuestions] = useState<Question[]>([]);
  const [readingPassages, setReadingPassages] = useState<ReadingPassage[]>([]);
  const [readingQuestions, setReadingQuestions] = useState<Question[]>([]);
  
  // Writing Builder State
  const [writingTask1Title, setWritingTask1Title] = useState('Academic Writing Task 1');
  const [writingTask1Prompt, setWritingTask1Prompt] = useState('The chart below shows information about direct carbon capture and renewable energy generation. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.');
  const [writingTask1MinWords, setWritingTask1MinWords] = useState<number>(150);
  const [writingTask1Time, setWritingTask1Time] = useState<number>(20);
  const [writingTask1ImageUrl, setWritingTask1ImageUrl] = useState<string>('');
  
  const [writingTask2Title, setWritingTask2Title] = useState('Academic Writing Task 2');
  const [writingTask2Prompt, setWritingTask2Prompt] = useState('Some people believe that technological progress is the primary driver of human advancement, while others argue that social equity and preservation of cultural heritage are more important. Discuss both views and give your own opinion. Write at least 250 words.');
  const [writingTask2MinWords, setWritingTask2MinWords] = useState<number>(250);
  const [writingTask2Time, setWritingTask2Time] = useState<number>(40);
  const [writingTask2ImageUrl, setWritingTask2ImageUrl] = useState<string>('');

  const [jsonText, setJsonText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Function to reset builder to create a fresh new test
  const handleStartNewTest = () => {
    setEditingTestId(null);
    setTestId(`jj-test-${Date.now().toString().slice(-4)}`);
    setTestTitle('JJ Academy Custom Mock Test');
    setTestModule('academic');
    setTestStatus('draft');
    setTestDescription('Official simulation test created via Admin Panel.');
    setTestAssignedToAll(false);
    setTestListeningTimer(30);
    setTestReadingTimer(60);
    setTestWritingTimer(60);
    setTestSpeakingTimer(14);
    setListeningAudioUrl('');
    setListeningQuestions([]);
    setReadingPassages([]);
    setReadingQuestions([]);
    setWritingTask1Title('Academic Writing Task 1');
    setWritingTask1Prompt('The chart below shows information about direct carbon capture and renewable energy generation. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.');
    setWritingTask1MinWords(150);
    setWritingTask1Time(20);
    setWritingTask1ImageUrl('');
    setWritingTask2Title('Academic Writing Task 2');
    setWritingTask2Prompt('Some people believe that technological progress is the primary driver of human advancement, while others argue that social equity and preservation of cultural heritage are more important. Discuss both views and give your own opinion. Write at least 250 words.');
    setWritingTask2MinWords(250);
    setWritingTask2Time(40);
    setWritingTask2ImageUrl('');
    setJsonText('');
    setActiveTab('visual-builder');
  };

  // Function to duplicate an existing test
  const handleDuplicateTest = async (testToDuplicate: IELTSTest) => {
    const newTestId = `jj-test-${Date.now().toString().slice(-4)}`;
    const newTest: IELTSTest = {
      ...testToDuplicate,
      id: newTestId,
      title: `${testToDuplicate.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await saveTest(newTest);
      const tests = await getAllTests();
      setAllTests(tests);
      alert('Test duplicated successfully.');
    } catch (err) {
      alert('Error duplicating test');
    }
  };

  // Function to load existing test into the builder for editing
  const handleEditTest = (testToEdit: IELTSTest) => {
    setEditingTestId(testToEdit.id);
    setTestId(testToEdit.id);
    setTestTitle(testToEdit.title || '');
    setTestModule(testToEdit.module || 'academic');
    setTestStatus(testToEdit.status || 'draft');
    setTestDescription(testToEdit.description || '');
    setTestAssignedToAll(!!testToEdit.assignedToAll);
    
    // Timers
    const lTime = testToEdit.sectionTimers?.listening ?? 30;
    const rTime = testToEdit.sectionTimers?.reading ?? 60;
    const wTime = testToEdit.sectionTimers?.writing ?? 60;
    const sTime = testToEdit.sectionTimers?.speaking ?? 14;
    setTestListeningTimer(lTime);
    setTestReadingTimer(rTime);
    setTestWritingTimer(wTime);
    setTestSpeakingTimer(sTime);

    // Listening Data
    const audioUrl = testToEdit.listeningData?.[0]?.audioUrl || '';
    setListeningAudioUrl(audioUrl);
    setListeningQuestions(testToEdit.listeningQuestions ? JSON.parse(JSON.stringify(testToEdit.listeningQuestions)) : []);

    // Reading Data
    setReadingPassages(testToEdit.readingPassages ? JSON.parse(JSON.stringify(testToEdit.readingPassages)) : []);
    setReadingQuestions(testToEdit.readingQuestions ? JSON.parse(JSON.stringify(testToEdit.readingQuestions)) : []);

    // Writing Tasks
    const t1 = testToEdit.writingTasks?.find(t => t.taskNumber === 1);
    const t2 = testToEdit.writingTasks?.find(t => t.taskNumber === 2);
    if (t1) {
      setWritingTask1Title(t1.title || 'Academic Writing Task 1');
      setWritingTask1Prompt(t1.prompt || '');
      setWritingTask1MinWords(t1.minWordCount || 150);
      setWritingTask1Time(t1.timeLimitMinutes || 20);
      setWritingTask1ImageUrl(t1.imageUrl || '');
    } else {
      setWritingTask1Title('Academic Writing Task 1');
      setWritingTask1Prompt('');
      setWritingTask1MinWords(150);
      setWritingTask1Time(20);
      setWritingTask1ImageUrl('');
    }
    if (t2) {
      setWritingTask2Title(t2.title || 'Academic Writing Task 2');
      setWritingTask2Prompt(t2.prompt || '');
      setWritingTask2MinWords(t2.minWordCount || 250);
      setWritingTask2Time(t2.timeLimitMinutes || 40);
      setWritingTask2ImageUrl(t2.imageUrl || '');
    } else {
      setWritingTask2Title('Academic Writing Task 2');
      setWritingTask2Prompt('');
      setWritingTask2MinWords(250);
      setWritingTask2Time(40);
      setWritingTask2ImageUrl('');
    }

    // Set JSON text for advanced mode
    setJsonText(JSON.stringify(testToEdit, null, 2));

    // Rich imported tests must be edited in JSON Builder so no listening/speaking/media arrays are flattened.
    setActiveTab('json-builder');
    setStatus(`Editing full test in JSON Builder: "${testToEdit.title}" (ID: ${testToEdit.id})`);
    setTimeout(() => setStatus(null), 3000);
  };

  // Bulk Import Modal State
  const [bulkModalSection, setBulkModalSection] = useState<'listening' | 'reading' | null>(null);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [copied, setCopied] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    try {
      const [candidates, tests, results] = await Promise.all([
        getCandidates(),
        getAllTests(),
        getAllTestResults()
      ]);
      setCandidatesList(candidates);
      setAllTests(tests);
      setResultsList(results);

      // Pre-select first test for new candidate form
      if (tests.length > 0 && selectedTestAssignments.length === 0) {
        setSelectedTestAssignments([tests[0].id]);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    }
  };

  // Apply Preset to Candidate Creation Form
  const handleSelectCandidateTimerPreset = (presetKey: 'standard' | 'extra25' | 'extra50' | 'rapid' | 'custom') => {
    setCandidateTimerPreset(presetKey);
    const preset = TIMER_PRESETS[presetKey];
    if (preset && presetKey !== 'custom') {
      setCandidateListeningTimer(preset.listening);
      setCandidateReadingTimer(preset.reading);
      setCandidateWritingTimer(preset.writing);
      setCandidateSpeakingTimer(preset.speaking);
    }
  };

  // Apply Preset to Candidate Edit Modal
  const handleSelectEditTimerPreset = (presetKey: 'standard' | 'extra25' | 'extra50' | 'rapid' | 'custom') => {
    setEditTimerPreset(presetKey);
    const preset = TIMER_PRESETS[presetKey];
    if (preset && presetKey !== 'custom') {
      setEditListeningTimer(preset.listening);
      setEditReadingTimer(preset.reading);
      setEditWritingTimer(preset.writing);
      setEditSpeakingTimer(preset.speaking);
    }
  };

  // Generate unique 6 digit registration number
  const handleGenerateRegNumber = () => {
    const uniqueNumber = generateUniqueRegNumber(candidatesList);
    setNewCandidateRegId(uniqueNumber);
  };

  // Create new Candidate with custom timer options
  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateName.trim()) {
      setStatus('Error: Please enter the candidate full name.');
      return;
    }
    if (!newCandidateDob) {
      setStatus('Error: Please enter candidate date of birth.');
      return;
    }
    const cleanId = newCandidateRegId.trim();
    if (!cleanId || cleanId.length !== 6 || !/^\d{6}$/.test(cleanId)) {
      setStatus('Error: Registration ID must be a unique 6-digit number.');
      return;
    }

    // Check duplicate
    if (candidatesList.some(c => c.id === cleanId)) {
      setStatus(`Error: Registration ID #${cleanId} already exists. Generate a new one.`);
      return;
    }

    const customTimers: IELTSSectionTimers = {
      listening: Number(candidateListeningTimer) || 30,
      reading: Number(candidateReadingTimer) || 60,
      writing: Number(candidateWritingTimer) || 60,
      speaking: Number(candidateSpeakingTimer) || 14,
    };

    const newCand: Candidate = {
      id: cleanId,
      name: newCandidateName.trim(),
      dob: newCandidateDob,
      assignedTestIds: selectedTestAssignments.length > 0 ? selectedTestAssignments : (allTests[0] ? [allTests[0].id] : []),
      timerPreset: candidateTimerPreset,
      timeMultiplier: TIMER_PRESETS[candidateTimerPreset]?.multiplier || 1.0,
      customTimers: candidateTimerPreset !== 'standard' ? customTimers : undefined,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    try {
      await saveCandidate(newCand);
      setStatus(`Candidate ${newCand.name} (Reg #${newCand.id}) registered successfully with ${newCand.assignedTestIds.length} test(s) & ${TIMER_PRESETS[candidateTimerPreset]?.label || 'custom timer'}!`);
      setNewCandidateName('');
      setNewCandidateRegId('');
      refreshAllData();
      setTimeout(() => setStatus(null), 4000);
    } catch (err: any) {
      setStatus('Error creating candidate: ' + err.message);
    }
  };

  // Quick toggle test assignment in creation form
  const toggleTestAssignment = (id: string) => {
    setSelectedTestAssignments(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAllTests = () => {
    if (selectedTestAssignments.length === allTests.length) {
      setSelectedTestAssignments([]);
    } else {
      setSelectedTestAssignments(allTests.map(t => t.id));
    }
  };

  // Save updated candidate assignments and custom timer from modal
  const handleSaveEditAssignments = async () => {
    if (!editingCandidate) return;

    const customTimers: IELTSSectionTimers = {
      listening: Number(editListeningTimer) || 30,
      reading: Number(editReadingTimer) || 60,
      writing: Number(editWritingTimer) || 60,
      speaking: Number(editSpeakingTimer) || 14,
    };

    const updated: Candidate = {
      ...editingCandidate,
      assignedTestIds: editAssignments,
      timerPreset: editTimerPreset,
      timeMultiplier: TIMER_PRESETS[editTimerPreset]?.multiplier || 1.0,
      customTimers: editTimerPreset !== 'standard' ? customTimers : undefined,
    };

    await saveCandidate(updated);
    setEditingCandidate(null);
    refreshAllData();
    setStatus(`Updated settings & timers for ${updated.name} (Reg #${updated.id})`);
    setTimeout(() => setStatus(null), 3000);
  };

  // Delete Candidate
  const handleDeleteCandidate = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete candidate ${name} (Reg #${id})?`)) {
      await deleteCandidate(id);
      refreshAllData();
      setStatus(`Candidate #${id} deleted.`);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // Copy Reg ID to clipboard
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Audio Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!isConfigured || !storage) {
      setStatus("Firebase Storage is unconfigured. You can paste direct audio URL below.");
      return;
    }

    const file = e.target.files[0];
    const storageRef = ref(storage, `audio/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    setStatus("Uploading audio...");

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        setStatus(`Upload failed: ${error.message}`);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setListeningAudioUrl(downloadURL);
        setStatus("Audio uploaded successfully!");
        setIsUploading(false);
        setTimeout(() => setStatus(null), 3000);
      }
    );
  };

  const handleGenericImageUpload = (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!isConfigured || !storage) {
      setStatus("Firebase Storage is unconfigured.");
      return;
    }
    const file = e.target.files[0];
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    setStatus("Uploading image...");

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        setStatus(`Upload failed: ${error.message}`);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onComplete(downloadURL);
        setStatus("Image uploaded successfully!");
        setIsUploading(false);
        setTimeout(() => setStatus(null), 3000);
      }
    );
  };

  // Add Question
  const addQuestion = (section: 'listening' | 'reading') => {
    const list = section === 'listening' ? listeningQuestions : readingQuestions;
    const newQ: Question = {
      id: `${section.charAt(0)}${list.length + 1}_${Date.now()}`,
      section: section,
      type: 'multiple-choice',
      questionNumber: list.length + 1,
      questionText: '',
      options: [
        { label: 'Option A', value: 'A' },
        { label: 'Option B', value: 'B' },
        { label: 'Option C', value: 'C' }
      ],
      correctAnswer: 'A',
      explanation: ''
    };
    if (section === 'listening') {
      setListeningQuestions([...listeningQuestions, newQ]);
    } else {
      setReadingQuestions([...readingQuestions, newQ]);
    }
  };

  const updateQuestion = (section: 'listening' | 'reading', index: number, updatedQ: Question) => {
    if (section === 'listening') {
      const newQuestions = [...listeningQuestions];
      newQuestions[index] = updatedQ;
      setListeningQuestions(newQuestions);
    } else {
      const newQuestions = [...readingQuestions];
      newQuestions[index] = updatedQ;
      setReadingQuestions(newQuestions);
    }
  };

  const removeQuestion = (section: 'listening' | 'reading', index: number) => {
    if (section === 'listening') {
      setListeningQuestions(listeningQuestions.filter((_, i) => i !== index));
    } else {
      setReadingQuestions(readingQuestions.filter((_, i) => i !== index));
    }
  };

  const addReadingPassage = () => {
    const newPassage: ReadingPassage = {
      id: `p${readingPassages.length + 1}_${Date.now()}`,
      title: `Reading Passage ${readingPassages.length + 1}`,
      partNumber: readingPassages.length + 1,
      paragraphs: [{ id: 'A', text: '' }]
    };
    setReadingPassages([...readingPassages, newPassage]);
  };

  const updateReadingPassage = (index: number, updatedP: ReadingPassage) => {
    const newPassages = [...readingPassages];
    newPassages[index] = updatedP;
    setReadingPassages(newPassages);
  };

  const removeReadingPassage = (index: number) => {
    setReadingPassages(readingPassages.filter((_, i) => i !== index));
  };

  // Bulk JSON Import
  const handleOpenBulkModal = (sec: 'listening' | 'reading') => {
    setBulkModalSection(sec);
    const sample = sec === 'listening' ? SAMPLE_LISTENING_QUESTIONS : SAMPLE_READING_QUESTIONS;
    setBulkJsonText(JSON.stringify(sample, null, 2));
  };

  const handleApplyBulkImport = () => {
    if (!bulkModalSection) return;
    try {
      const parsed = JSON.parse(bulkJsonText);
      if (!Array.isArray(parsed)) {
        alert('Invalid format: JSON must be an array of question objects.');
        return;
      }
      if (bulkModalSection === 'listening') {
        setListeningQuestions(parsed);
      } else {
        setReadingQuestions(parsed);
      }
      setStatus(`Successfully imported ${parsed.length} ${bulkModalSection} questions!`);
      setBulkModalSection(null);
      setTimeout(() => setStatus(null), 3000);
    } catch (e: any) {
      alert(`JSON syntax error: ${e.message}`);
    }
  };

  const generateTestObject = (): IELTSTest => {
    const listMin = Number(testListeningTimer) || 30;
    const readMin = Number(testReadingTimer) || 60;
    const writMin = Number(testWritingTimer) || 60;
    const spkMin = Number(testSpeakingTimer) || 14;

    return {
      id: testId,
      title: testTitle,
      module: testModule,
      status: testStatus,
      description: testDescription,
      assignedToAll: testAssignedToAll,
      durationMinutes: listMin + readMin + writMin + spkMin,
      sectionTimers: {
        listening: listMin,
        reading: readMin,
        writing: writMin,
        speaking: spkMin,
      },
      listeningData: [{ partNumber: 1, title: 'Listening Test', audioUrl: listeningAudioUrl, audioDuration: 0, instructions: '' }],
      listeningQuestions,
      readingPassages,
      readingQuestions,
      writingTasks: [
        {
          taskNumber: 1,
          title: writingTask1Title || 'Academic Writing Task 1',
          prompt: writingTask1Prompt || 'Summarize the given chart or information. Write at least 150 words.',
          minWordCount: Number(writingTask1MinWords) || 150,
          timeLimitMinutes: Number(writingTask1Time) || 20,
          imageUrl: writingTask1ImageUrl || undefined,
        },
        {
          taskNumber: 2,
          title: writingTask2Title || 'Academic Writing Task 2',
          prompt: writingTask2Prompt || 'Write an essay discussing the given topic. Write at least 250 words.',
          minWordCount: Number(writingTask2MinWords) || 250,
          timeLimitMinutes: Number(writingTask2Time) || 40,
          imageUrl: writingTask2ImageUrl || undefined,
        }
      ],
      speakingTasks: [
        {
          partNumber: 1,
          title: 'Speaking Part 1',
          topic: 'Introduction and Interview',
          questions: [
            'Tell me about your home, work or studies.',
            'What do you enjoy doing in your free time?'
          ]
        },
        {
          partNumber: 2,
          title: 'Speaking Part 2',
          topic: 'Individual Long Turn',
          cueCard: {
            mainTopic: 'Describe an experience, person, place or object that is important to you.',
            bulletPoints: [
              'what or who it was',
              'when or where it happened',
              'why it was important to you',
              'and explain how you felt about it'
            ]
          },
          questions: [],
          prepTimeSeconds: 60,
          speakTimeSeconds: 120
        },
        {
          partNumber: 3,
          title: 'Speaking Part 3',
          topic: 'Two-way Discussion',
          questions: [
            'Why do significant experiences affect people differently?',
            'How can society help people learn from important experiences?'
          ]
        }
      ],
      createdAt: new Date().toISOString()
    };
  };

  const handleInitiateSave = () => {
    try {
      let dataToSave: IELTSTest;
      if (activeTab === 'json-builder') {
        const parsed = JSON.parse(jsonText);
        dataToSave = {
          ...parsed,
          id: parsed.id || editingTestId || `test_${Date.now()}`
        };
      } else {
        dataToSave = generateTestObject();
      }
      setTestToValidate(dataToSave);
      setShowValidationModal(true);
    } catch (error: any) {
      console.error(error);
      setStatus(`Error parsing test: ${error.message}`);
    }
  };

  const handleSaveTest = async (testData: IELTSTest) => {
    try {
      await saveTest(testData);
      setStatus(`Test "${testData.title}" saved successfully!`);
      refreshAllData();
      setActiveTab('tests');
      setTimeout(() => setStatus(null), 4000);
    } catch (error: any) {
      console.error(error);
      setStatus(`Error saving test: ${error.message}`);
    }
  };

  const handleDeleteTest = async (tId: string, title: string) => {
    if (window.confirm(`Delete test "${title}"?`)) {
      await deleteTest(tId);
      refreshAllData();
      setStatus(`Test "${title}" deleted.`);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // Helper for word count
  const countWords = (str?: string) => {
    if (!str) return 0;
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  // Helper for approximate Band score calculation
  const calculateBand = (correctCount: number) => {
    if (correctCount >= 39) return 9.0;
    if (correctCount >= 37) return 8.5;
    if (correctCount >= 35) return 8.0;
    if (correctCount >= 32) return 7.5;
    if (correctCount >= 30) return 7.0;
    if (correctCount >= 26) return 6.5;
    if (correctCount >= 23) return 6.0;
    if (correctCount >= 19) return 5.5;
    if (correctCount >= 15) return 5.0;
    if (correctCount >= 12) return 4.5;
    if (correctCount >= 8) return 4.0;
    return 3.5;
  };

  // Open Results Inspector Modal
  const handleInspectResult = (result: CandidateTestResult) => {
    setInspectingResult(result);
    setInspectActiveTab('writing');
    setTeacherTask1Band(result.examinerFeedback?.task1Band || result.writingBand || 7.0);
    setTeacherTask2Band(result.examinerFeedback?.task2Band || result.writingBand || 7.0);
    setTeacherOverallWritingBand(result.examinerFeedback?.overallWritingBand || result.writingBand || 7.0);
    setTeacherNotes(result.examinerFeedback?.teacherNotes || '');
    setCopiedEssayTask(null);
  };

  // Save Teacher / Examiner Evaluation
  const handleSaveExaminerFeedback = async () => {
    if (!inspectingResult) return;
    const lBand = calculateBand(inspectingResult.listeningScore || 0);
    const rBand = calculateBand(inspectingResult.readingScore || 0);
    const sBand = inspectingResult.speakingBand || 7.0;
    const newOverallBand = Math.round(((lBand + rBand + teacherOverallWritingBand + sBand) / 4) * 2) / 2;

    const updated: CandidateTestResult = {
      ...inspectingResult,
      writingBand: teacherOverallWritingBand,
      overallBand: newOverallBand,
      examinerFeedback: {
        task1Band: teacherTask1Band,
        task2Band: teacherTask2Band,
        overallWritingBand: teacherOverallWritingBand,
        teacherNotes: teacherNotes,
        gradedBy: 'Lead CBT Examiner',
        gradedAt: new Date().toISOString()
      }
    };

    await updateTestResult(updated);
    setInspectingResult(updated);
    refreshAllData();
    setStatus(`Examiner feedback and Band ${teacherOverallWritingBand.toFixed(1)} saved for ${updated.candidateName}!`);
    setTimeout(() => setStatus(null), 3500);
  };

  // Delete Candidate Submission Result
  const handleDeleteResult = async (resId?: string, candName?: string) => {
    if (!resId) return;
    if (window.confirm(`Delete submission record for ${candName || 'candidate'}?`)) {
      await deleteTestResult(resId);
      if (inspectingResult?.id === resId) {
        setInspectingResult(null);
      }
      refreshAllData();
      setStatus(`Submission deleted.`);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // Copy Essay to Clipboard
  const handleCopyEssay = (taskNum: number, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedEssayTask(taskNum);
    setTimeout(() => setCopiedEssayTask(null), 2500);
  };

  const filteredCandidates = candidatesList.filter(c =>
    c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    c.id.includes(candidateSearch) ||
    c.dob.includes(candidateSearch)
  );

  // Filtered Results List
  const filteredResults = resultsList.filter(r => {
    const matchesSearch =
      r.candidateName.toLowerCase().includes(resultsSearchQuery.toLowerCase()) ||
      r.candidateId.includes(resultsSearchQuery) ||
      (r.testTitle || '').toLowerCase().includes(resultsSearchQuery.toLowerCase()) ||
      r.testId.toLowerCase().includes(resultsSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (resultsFilter === 'with-writing') {
      return (r.writingTask1 && r.writingTask1.trim().length > 0) || (r.writingTask2 && r.writingTask2.trim().length > 0);
    }
    if (resultsFilter === 'graded') {
      return !!r.examinerFeedback?.overallWritingBand || !!r.writingBand;
    }
    if (resultsFilter === 'ungraded') {
      const hasWriting = (r.writingTask1 && r.writingTask1.trim().length > 0) || (r.writingTask2 && r.writingTask2.trim().length > 0);
      return hasWriting && !r.examinerFeedback?.overallWritingBand;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6 select-none">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl flex flex-col h-full max-h-[95vh] overflow-hidden border border-slate-300">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#214162] text-white flex justify-between items-center shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white text-[#214162] font-black text-base flex items-center justify-center shadow-sm">
              JJ
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">JJ Academy CBT Administration</h2>
              <p className="text-[11px] text-blue-200">Candidate 6-Digit Registration & Multi-Test Assignment Manager</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-[#162d44] rounded-lg p-1 space-x-1">
              <button 
                onClick={() => setActiveTab('candidates')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'candidates' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Candidates & Reg Numbers ({candidatesList.length})</span>
              </button>

              <button 
                onClick={() => setActiveTab('tests')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'tests' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Manage Tests ({allTests.length})</span>
              </button>

              <button 
                onClick={() => {
                  if (editingTestId) {
                    setActiveTab('visual-builder');
                  } else {
                    handleStartNewTest();
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'visual-builder' || activeTab === 'json-builder' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                {editingTestId ? <Edit3 className="w-3.5 h-3.5 text-amber-300" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{editingTestId ? 'Edit Test' : 'Create Test'}</span>
              </button>

              <button 
                onClick={() => setActiveTab('results')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'results' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Results ({resultsList.length})</span>
              </button>
            </div>

            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center space-x-1 text-xs text-blue-200 hover:text-white px-2 py-1 rounded bg-white/10"
              title="Logout Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        {status && (
          <div className={`px-6 py-2 text-xs font-semibold flex items-center justify-between ${
            status.startsWith('Error') ? 'bg-red-50 text-red-700 border-b border-red-200' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
          }`}>
            <span>{status}</span>
            <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          
          {/* TAB 1: CANDIDATES MANAGEMENT */}
          {activeTab === 'candidates' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* Register Candidate Form Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Register New Candidate & Generate 6-Digit Registration Number
                    </h3>
                    <p className="text-xs text-slate-500">
                      Create candidate profile early with Name, DOB, unique 6-digit Reg #, and assign test(s) they are allowed to write.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateCandidate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Candidate Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Candidate Full Name *
                      </label>
                      <input
                        type="text"
                        value={newCandidateName}
                        onChange={(e) => setNewCandidateName(e.target.value)}
                        placeholder="e.g. Johnathan Smith"
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50/50 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Date of Birth (YYYY-MM-DD) *
                      </label>
                      <input
                        type="date"
                        value={newCandidateDob}
                        onChange={(e) => setNewCandidateDob(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50/50 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    {/* 6-Digit Registration Number with Generate button */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          6-Digit Reg ID *
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateRegNumber}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Generate 6-Digit #</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newCandidateRegId}
                        onChange={(e) => setNewCandidateRegId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g. 583921"
                        maxLength={6}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-bold tracking-widest text-blue-900 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Multi-Test Assignment Selection */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Allow Candidate to Write Test(s):
                      </label>
                      <button
                        type="button"
                        onClick={toggleAllTests}
                        className="text-[11px] font-bold text-blue-700 hover:underline"
                      >
                        {selectedTestAssignments.length === allTests.length ? 'Deselect All' : 'Select All Tests'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {allTests.map(t => {
                        const isChecked = selectedTestAssignments.includes(t.id);
                        return (
                          <label
                            key={t.id}
                            className={`flex items-start space-x-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                              isChecked
                                ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTestAssignment(t.id)}
                              className="mt-0.5 text-blue-600 rounded"
                            />
                            <div className="leading-snug">
                              <span className="block truncate">{t.title}</span>
                              <span className="text-[10px] text-slate-500 font-normal uppercase">{t.module} module</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Student IELTS Part Timer Option (Custom / Accommodations) */}
                  <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Candidate IELTS Part Timer & Accommodation
                        </label>
                      </div>
                      <span className="text-[11px] font-medium text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                        Total Exam: {(Number(candidateListeningTimer) || 0) + (Number(candidateReadingTimer) || 0) + (Number(candidateWritingTimer) || 0) + (Number(candidateSpeakingTimer) || 0)} mins
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Configure custom timing for each IELTS part (Listening, Reading, Writing, Speaking) for this candidate or pick standard/accommodated timing:
                    </p>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {(Object.keys(TIMER_PRESETS) as Array<keyof typeof TIMER_PRESETS>).map((key) => {
                        const preset = TIMER_PRESETS[key];
                        const isSelected = candidateTimerPreset === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleSelectCandidateTimerPreset(key as any)}
                            className={`p-2 rounded-lg border text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">{preset.label}</div>
                            <div className="text-[10px] text-slate-500 font-normal">
                              {key === 'custom' ? 'User-defined' : `${preset.listening + preset.reading + preset.writing + preset.speaking}m`}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Part Minutes Inputs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Headphones className="w-3 h-3 text-indigo-600" />
                          <span>Listening Part</span>
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            max={180}
                            value={candidateListeningTimer}
                            onChange={(e) => {
                              setCandidateListeningTimer(Number(e.target.value));
                              setCandidateTimerPreset('custom');
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">min</span>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-600" />
                          <span>Reading Part</span>
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            max={180}
                            value={candidateReadingTimer}
                            onChange={(e) => {
                              setCandidateReadingTimer(Number(e.target.value));
                              setCandidateTimerPreset('custom');
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">min</span>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <FileEdit className="w-3 h-3 text-amber-600" />
                          <span>Writing Part</span>
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            max={180}
                            value={candidateWritingTimer}
                            onChange={(e) => {
                              setCandidateWritingTimer(Number(e.target.value));
                              setCandidateTimerPreset('custom');
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">min</span>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Mic className="w-3 h-3 text-purple-600" />
                          <span>Speaking Part</span>
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            max={180}
                            value={candidateSpeakingTimer}
                            onChange={(e) => {
                              setCandidateSpeakingTimer(Number(e.target.value));
                              setCandidateTimerPreset('custom');
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">min</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#214162] hover:bg-[#1a334e] text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register Candidate & Save Profile</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Registered Candidates List */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Registered Candidates ({candidatesList.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Candidates can log in using their 6-digit registration ID and Date of Birth to view their allowed tests.
                    </p>
                  </div>

                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      placeholder="Search candidates by name or reg #..."
                      className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 text-left">6-Digit Reg ID</th>
                        <th className="py-3 px-4 text-left">Candidate Name</th>
                        <th className="py-3 px-4 text-left">Date of Birth</th>
                        <th className="py-3 px-4 text-left">Assigned Tests</th>
                        <th className="py-3 px-4 text-left">IELTS Part Timers</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredCandidates.map((c) => {
                        const assignedCount = (c.assignedTestIds || []).length;
                        const isCustom = c.timerPreset && c.timerPreset !== 'standard';
                        const presetInfo = c.timerPreset ? TIMER_PRESETS[c.timerPreset] : TIMER_PRESETS.standard;
                        const timingDisplay = c.customTimers
                          ? `L:${c.customTimers.listening}m · R:${c.customTimers.reading}m · W:${c.customTimers.writing}m · S:${c.customTimers.speaking}m`
                          : (presetInfo ? `${presetInfo.label}` : 'Standard (30/60/60/14)');

                        return (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                                  {c.id}
                                </span>
                                <button
                                  onClick={() => handleCopyId(c.id)}
                                  className="text-slate-400 hover:text-slate-700 p-1"
                                  title="Copy Registration Number"
                                >
                                  {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {c.name}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono">
                              {c.dob}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                                  {assignedCount} test{assignedCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                                  isCustom ? 'text-amber-800 font-bold' : 'text-slate-700'
                                }`}>
                                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>{timingDisplay}</span>
                                </span>
                                {c.timeMultiplier && c.timeMultiplier !== 1 && (
                                  <span className="text-[10px] text-amber-600 font-semibold">
                                    {(c.timeMultiplier * 100).toFixed(0)}% speed rate
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setEditingCandidate(c);
                                  setEditAssignments(c.assignedTestIds || []);
                                  setEditTimerPreset(c.timerPreset || (c.customTimers ? 'custom' : 'standard'));
                                  setEditListeningTimer(c.customTimers?.listening ?? (c.timeMultiplier ? Math.round(30 * c.timeMultiplier) : 30));
                                  setEditReadingTimer(c.customTimers?.reading ?? (c.timeMultiplier ? Math.round(60 * c.timeMultiplier) : 60));
                                  setEditWritingTimer(c.customTimers?.writing ?? (c.timeMultiplier ? Math.round(60 * c.timeMultiplier) : 60));
                                  setEditSpeakingTimer(c.customTimers?.speaking ?? (c.timeMultiplier ? Math.round(14 * c.timeMultiplier) : 14));
                                }}
                                className="px-2 py-1 text-[11px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                              >
                                Edit Profile / Timers
                              </button>
                              <button
                                onClick={() => handleDeleteCandidate(c.id, c.name)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete Candidate"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredCandidates.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No candidates found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE MULTIPLE TESTS */}
          {activeTab === 'tests' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      All Available Tests ({allTests.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Create multiple mock tests for your institute with customizable IELTS part timers and assign them to specific candidates.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('visual-builder')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Test</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allTests.map(test => {
                    const lTime = test.sectionTimers?.listening ?? 30;
                    const rTime = test.sectionTimers?.reading ?? 60;
                    const wTime = test.sectionTimers?.writing ?? 60;
                    const sTime = test.sectionTimers?.speaking ?? 14;
                    const totalMins = lTime + rTime + wTime + sTime;

                    return (
                      <div key={test.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              test.module === 'general' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {test.module}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">ID: {test.id}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{test.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{test.description || 'Full 4-module IELTS computer delivered test.'}</p>
                          
                          {/* Part Timers Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t border-slate-100 text-[10px]">
                            <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100">
                              🎧 {lTime}m Listening
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">
                              📖 {rTime}m Reading
                            </span>
                            <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-100">
                              ✍️ {wTime}m Writing
                            </span>
                            <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-100">
                              🗣️ {sTime}m Speaking
                            </span>
                            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                              ⏱️ Total: {totalMins}m
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-3 pt-2">
                            <span>🎧 {test.listeningQuestions.length} Listening Qs</span>
                            <span>📖 {test.readingQuestions.length} Reading Qs</span>
                            <span>✍️ {test.writingTasks.length} Writing</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 text-[11px]">
                            {test.assignedToAll ? '👥 Assigned to All Candidates' : '🎯 Specific Candidates'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditTest(test)}
                              className="px-2.5 py-1 text-[11px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors flex items-center gap-1"
                              title="Edit Test Questions, Audio & Timers"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Test</span>
                            </button>
                            <button
                              onClick={() => handleDuplicateTest(test)}
                              className="px-2.5 py-1 text-[11px] text-green-700 hover:text-green-900 font-bold bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors flex items-center gap-1"
                              title="Duplicate Test"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            {test.id !== 'jj-ielts-acad-01' && (
                              <button
                                onClick={() => handleDeleteTest(test.id, test.title)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete Test"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VISUAL TEST BUILDER */}
          {activeTab === 'visual-builder' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Editing Mode Notice Banner */}
              {editingTestId && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Currently Editing Test Mode
                      </div>
                      <div className="text-sm font-black text-amber-950">
                        "{testTitle}" <span className="font-mono text-xs font-normal text-amber-700">(ID: {testId})</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleStartNewTest}
                    className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold shadow-2xs transition-colors"
                  >
                    Cancel / Create New Test Instead
                  </button>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    {editingTestId ? `1. Edit Test Details (${testTitle})` : '1. Test Details'}
                  </h3>
                  <button
                    onClick={() => {
                      setJsonText(JSON.stringify(generateTestObject(), null, 2));
                      setActiveTab('json-builder');
                    }}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Switch to Advanced JSON Mode</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Test Unique ID {editingTestId && <span className="text-amber-600 font-semibold">(Read-Only)</span>}
                    </label>
                    <input
                      type="text"
                      value={testId}
                      onChange={(e) => setTestId(e.target.value)}
                      disabled={!!editingTestId}
                      className={`w-full p-2 border border-slate-300 rounded text-xs ${editingTestId ? 'bg-slate-100 font-mono text-slate-600 cursor-not-allowed' : 'bg-white'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
                    <select
                      value={testStatus}
                      onChange={(e) => setTestStatus(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    >
                      <option value="draft">Draft (Hidden)</option>
                      <option value="published">Published (Visible)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Module</label>
                    <select
                      value={testModule}
                      onChange={(e) => setTestModule(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    >
                      <option value="academic">Academic</option>
                      <option value="general">General Training</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Access Rule</label>
                    <select
                      value={testAssignedToAll ? 'all' : 'assigned'}
                      onChange={(e) => setTestAssignedToAll(e.target.value === 'all')}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    >
                      <option value="assigned">Assigned Candidates Only</option>
                      <option value="all">Allow All Registered Candidates</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Test Title</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                    placeholder="e.g. JJ Academy Mock Exam 3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description / Notes</label>
                  <input
                    type="text"
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>

                {/* IELTS Section Timers Settings in Builder */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        IELTS Section Timers (Minutes per Part)
                      </label>
                    </div>
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                      Total Test Duration: {(Number(testListeningTimer) || 0) + (Number(testReadingTimer) || 0) + (Number(testWritingTimer) || 0) + (Number(testSpeakingTimer) || 0)} mins
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => { setTestListeningTimer(30); setTestReadingTimer(60); setTestWritingTimer(60); setTestSpeakingTimer(14); }}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700"
                    >
                      Official IELTS (30/60/60/14)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTestListeningTimer(15); setTestReadingTimer(20); setTestWritingTimer(20); setTestSpeakingTimer(10); }}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700"
                    >
                      Speed Drill (15/20/20/10)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTestListeningTimer(38); setTestReadingTimer(75); setTestWritingTimer(75); setTestSpeakingTimer(18); }}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700"
                    >
                      Accommodated +25% (38/75/75/18)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Headphones className="w-3 h-3 text-indigo-600" />
                        <span>Listening</span>
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={1}
                          max={180}
                          value={testListeningTimer}
                          onChange={(e) => setTestListeningTimer(Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none"
                        />
                        <span className="text-[11px] text-slate-500 font-medium">min</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-600" />
                        <span>Reading</span>
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={1}
                          max={180}
                          value={testReadingTimer}
                          onChange={(e) => setTestReadingTimer(Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none"
                        />
                        <span className="text-[11px] text-slate-500 font-medium">min</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <FileEdit className="w-3 h-3 text-amber-600" />
                        <span>Writing</span>
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={1}
                          max={180}
                          value={testWritingTimer}
                          onChange={(e) => setTestWritingTimer(Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none"
                        />
                        <span className="text-[11px] text-slate-500 font-medium">min</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Mic className="w-3 h-3 text-purple-600" />
                        <span>Speaking</span>
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={1}
                          max={180}
                          value={testSpeakingTimer}
                          onChange={(e) => setTestSpeakingTimer(Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none"
                        />
                        <span className="text-[11px] text-slate-500 font-medium">min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listening Section Builder */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">2. Listening Section</h3>
                
                {/* Audio Upload */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase">Listening Audio Track</label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 bg-white border border-slate-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium">Upload MP3</span>
                      <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={listeningAudioUrl}
                        onChange={(e) => setListeningAudioUrl(e.target.value)}
                        placeholder="Or enter direct MP3 audio URL here..."
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase text-slate-600">Listening Questions ({listeningQuestions.length})</h4>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleOpenBulkModal('listening')} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded hover:bg-purple-200 font-semibold">
                        Bulk Import JSON
                      </button>
                      <button onClick={() => addQuestion('listening')} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded hover:bg-blue-200 font-semibold">
                        + Add Question
                      </button>
                    </div>
                  </div>

                  {listeningQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2 relative">
                      <button onClick={() => removeQuestion('listening', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={q.questionNumber}
                          onChange={(e) => updateQuestion('listening', idx, { ...q, questionNumber: Number(e.target.value) })}
                          className="p-1.5 border border-slate-300 rounded text-xs bg-white"
                          placeholder="Q #"
                        />
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion('listening', idx, { ...q, type: e.target.value as any })}
                          className="col-span-2 p-1.5 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="multiple-response">Multiple Response</option>
                          <option value="fill-blank">Fill in the Blanks</option>
                          <option value="true-false-not-given">True / False / Not Given</option>
                          <option value="yes-no-not-given">Yes / No / Not Given</option>
                          <option value="matching">Matching</option>
                          <option value="matching-headings">Matching Headings</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="table-completion">Table Completion</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={q.groupId || ''}
                          onChange={(e) => updateQuestion('listening', idx, { ...q, groupId: e.target.value })}
                          className="p-1.5 border border-slate-300 rounded text-xs bg-white"
                          placeholder="Group ID (e.g. g1)"
                        />
                        <input
                          type="text"
                          value={q.groupInstruction || ''}
                          onChange={(e) => updateQuestion('listening', idx, { ...q, groupInstruction: e.target.value })}
                          className="p-1.5 border border-slate-300 rounded text-xs bg-white"
                          placeholder="Group Instruction (e.g. Questions 1-5)"
                        />
                      </div>
                      <ImageUploadField
                        label="Group Image (Optional)"
                        imageUrl={q.groupMedia?.url || ''}
                        onImageChange={(url) => updateQuestion('listening', idx, { ...q, groupMedia: url ? { type: 'image', url } : undefined })}
                        onUpload={handleGenericImageUpload}
                      />
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => updateQuestion('listening', idx, { ...q, questionText: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        placeholder="Question text (use ___ for fill-in blank)"
                      />
                      {['multiple-choice', 'multiple-response', 'dropdown', 'matching', 'matching-headings'].includes(q.type) && (
                        <input
                          type="text"
                          value={q.options?.map(o => `${o.value}:${o.label}`).join(',') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const options = val.split(',').filter(Boolean).map(s => {
                              const [v, l] = s.split(':');
                              return { value: (v || '').trim(), label: (l || v || '').trim() };
                            });
                            updateQuestion('listening', idx, { ...q, options });
                          }}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs bg-amber-50"
                          placeholder="Options (e.g. A:Car,B:Bus,C:Train)"
                        />
                      )}
                      <ImageUploadField
                        label="Question Image"
                        imageUrl={q.imageUrl}
                        onImageChange={(url) => updateQuestion('listening', idx, { ...q, imageUrl: url })}
                        onUpload={handleGenericImageUpload}
                      />
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion('listening', idx, { ...q, correctAnswer: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white font-mono"
                        placeholder="Correct Answer (e.g. A or target word)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reading Section Builder */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-base font-bold text-slate-900">3. Reading Section</h3>
                  <button onClick={addReadingPassage} className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded font-semibold">
                    + Add Passage
                  </button>
                </div>

                {readingPassages.map((p, idx) => (
                  <div key={p.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-2 relative">
                    <button onClick={() => removeReadingPassage(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => updateReadingPassage(idx, { ...p, title: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded text-xs font-bold bg-white"
                      placeholder="Passage Title"
                    />
                    <PassageBlockBuilder
                      paragraphs={p.paragraphs || []}
                      onChange={(newParagraphs) => updateReadingPassage(idx, { ...p, paragraphs: newParagraphs })}
                      onUpload={handleGenericImageUpload}
                    />
                  </div>
                ))}

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase text-slate-600">Reading Questions ({readingQuestions.length})</h4>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleOpenBulkModal('reading')} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded hover:bg-purple-200 font-semibold">
                        Bulk Import JSON
                      </button>
                      <button onClick={() => addQuestion('reading')} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded hover:bg-blue-200 font-semibold">
                        + Add Question
                      </button>
                    </div>
                  </div>

                  {readingQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2 relative">
                      <button onClick={() => removeQuestion('reading', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={q.questionNumber}
                          onChange={(e) => updateQuestion('reading', idx, { ...q, questionNumber: Number(e.target.value) })}
                          className="p-1.5 border border-slate-300 rounded text-xs bg-white"
                          placeholder="Q #"
                        />
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion('reading', idx, { ...q, type: e.target.value as any })}
                          className="col-span-2 p-1.5 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="multiple-response">Multiple Response</option>
                          <option value="fill-blank">Fill in the Blanks</option>
                          <option value="true-false-not-given">True / False / Not Given</option>
                          <option value="yes-no-not-given">Yes / No / Not Given</option>
                          <option value="matching">Matching</option>
                          <option value="matching-headings">Matching Headings</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="table-completion">Table Completion</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={q.groupId || ''}
                          onChange={(e) => updateQuestion('reading', idx, { ...q, groupId: e.target.value })}
                          className="p-1.5 border border-slate-300 rounded text-xs bg-white"
                          placeholder="Group ID (e.g. g1)"
                        />
                        <input
                          type="text"
                          value={q.groupInstruction || ''}
                          onChange={(e) => updateQuestion('reading', idx, { ...q, groupInstruction: e.target.value })}
                          className="p-1.5 border border-slate-300 rounded text-xs bg-white"
                          placeholder="Group Instruction (e.g. Questions 1-5)"
                        />
                      </div>
                      <ImageUploadField
                        label="Group Image (Optional)"
                        imageUrl={q.groupMedia?.url || ''}
                        onImageChange={(url) => updateQuestion('reading', idx, { ...q, groupMedia: url ? { type: 'image', url } : undefined })}
                        onUpload={handleGenericImageUpload}
                      />
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => updateQuestion('reading', idx, { ...q, questionText: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        placeholder="Question text"
                      />
                      {['multiple-choice', 'multiple-response', 'dropdown', 'matching', 'matching-headings'].includes(q.type) && (
                        <input
                          type="text"
                          value={q.options?.map(o => `${o.value}:${o.label}`).join(',') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const options = val.split(',').filter(Boolean).map(s => {
                              const [v, l] = s.split(':');
                              return { value: (v || '').trim(), label: (l || v || '').trim() };
                            });
                            updateQuestion('reading', idx, { ...q, options });
                          }}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs bg-amber-50"
                          placeholder="Options (e.g. A:Car,B:Bus,C:Train)"
                        />
                      )}
                      <ImageUploadField
                        label="Question Image"
                        imageUrl={q.imageUrl}
                        onImageChange={(url) => updateQuestion('reading', idx, { ...q, imageUrl: url })}
                        onUpload={handleGenericImageUpload}
                      />
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion('reading', idx, { ...q, correctAnswer: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white font-mono"
                        placeholder="Correct Answer (e.g. TRUE or target word)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Writing Section Builder */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-amber-600" />
                      <span>4. Writing Tasks & Prompts</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Configure Academic/General Writing Task 1 and Task 2 prompts, word requirements, and timers.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWritingTask1Title('Academic Writing Task 1');
                        setWritingTask1Prompt('The chart below shows information about direct carbon capture and renewable energy generation. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.');
                        setWritingTask1MinWords(150);
                        setWritingTask1Time(20);
                        setWritingTask2Title('Academic Writing Task 2');
                        setWritingTask2Prompt('Some people believe that technological progress is the primary driver of human advancement, while others argue that social equity and preservation of cultural heritage are more important. Discuss both views and give your own opinion. Write at least 250 words.');
                        setWritingTask2MinWords(250);
                        setWritingTask2Time(40);
                      }}
                      className="px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-semibold border border-amber-200"
                    >
                      Load Academic Template
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWritingTask1Title('General Training Writing Task 1');
                        setWritingTask1Prompt('You recently stayed at a hotel and left an important document in your room. Write a letter to the hotel manager. In your letter:\n- Describe the item you left behind\n- Explain where you believe you left it\n- Request that they locate and send it to your address.\n\nWrite at least 150 words. You do NOT need to write any addresses.');
                        setWritingTask1MinWords(150);
                        setWritingTask1Time(20);
                        setWritingTask2Title('General Training Writing Task 2');
                        setWritingTask2Prompt('In many modern cities, remote working and flexible office models are replacing standard commuter routines. Do the advantages of this trend outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.');
                        setWritingTask2MinWords(250);
                        setWritingTask2Time(40);
                      }}
                      className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-semibold border border-blue-200"
                    >
                      Load GT Template
                    </button>
                  </div>
                </div>

                {/* Writing Task 1 */}
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      Task 1 (Report / Letter)
                    </span>
                    <div className="flex items-center space-x-3 text-xs">
                      <label className="flex items-center space-x-1">
                        <span className="text-slate-600 font-medium">Min Words:</span>
                        <input
                          type="number"
                          min={50}
                          max={500}
                          value={writingTask1MinWords}
                          onChange={(e) => setWritingTask1MinWords(Number(e.target.value))}
                          className="w-16 p-1 border border-slate-300 rounded text-xs bg-white text-center font-bold"
                        />
                      </label>
                      <label className="flex items-center space-x-1">
                        <span className="text-slate-600 font-medium">Time (min):</span>
                        <input
                          type="number"
                          min={5}
                          max={90}
                          value={writingTask1Time}
                          onChange={(e) => setWritingTask1Time(Number(e.target.value))}
                          className="w-14 p-1 border border-slate-300 rounded text-xs bg-white text-center font-bold"
                        />
                      </label>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={writingTask1Title}
                    onChange={(e) => setWritingTask1Title(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-bold bg-white"
                    placeholder="Task 1 Title (e.g. Academic Writing Task 1)"
                  />

                  <textarea
                    value={writingTask1Prompt}
                    onChange={(e) => setWritingTask1Prompt(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded text-xs bg-white leading-relaxed"
                    placeholder="Enter the complete Task 1 Question Prompt & Instructions..."
                  />

                  <ImageUploadField
                    label="Task 1 Image (Optional)"
                    imageUrl={writingTask1ImageUrl}
                    onImageChange={setWritingTask1ImageUrl}
                    onUpload={handleGenericImageUpload}
                  />
                </div>

                {/* Writing Task 2 */}
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                      Task 2 (Discursive Essay)
                    </span>
                    <div className="flex items-center space-x-3 text-xs">
                      <label className="flex items-center space-x-1">
                        <span className="text-slate-600 font-medium">Min Words:</span>
                        <input
                          type="number"
                          min={100}
                          max={600}
                          value={writingTask2MinWords}
                          onChange={(e) => setWritingTask2MinWords(Number(e.target.value))}
                          className="w-16 p-1 border border-slate-300 rounded text-xs bg-white text-center font-bold"
                        />
                      </label>
                      <label className="flex items-center space-x-1">
                        <span className="text-slate-600 font-medium">Time (min):</span>
                        <input
                          type="number"
                          min={10}
                          max={120}
                          value={writingTask2Time}
                          onChange={(e) => setWritingTask2Time(Number(e.target.value))}
                          className="w-14 p-1 border border-slate-300 rounded text-xs bg-white text-center font-bold"
                        />
                      </label>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={writingTask2Title}
                    onChange={(e) => setWritingTask2Title(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-bold bg-white"
                    placeholder="Task 2 Title (e.g. Academic Writing Task 2)"
                  />

                  <textarea
                    value={writingTask2Prompt}
                    onChange={(e) => setWritingTask2Prompt(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded text-xs bg-white leading-relaxed"
                    placeholder="Enter the complete Task 2 Essay Question Prompt..."
                  />

                  <ImageUploadField
                    label="Task 2 Image (Optional)"
                    imageUrl={writingTask2ImageUrl}
                    onImageChange={setWritingTask2ImageUrl}
                    onUpload={handleGenericImageUpload}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {editingTestId ? (
                  <button
                    onClick={handleStartNewTest}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Discard Changes / Switch to New Test
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleInitiateSave}
                  className="px-8 py-3 bg-[#214162] hover:bg-[#1a334e] text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTestId ? `Update & Save "${testTitle}"` : 'Save Test & Publish'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: JSON BUILDER */}
          {activeTab === 'json-builder' && (
            <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-full">
              {editingTestId && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">
                    Editing Raw JSON for: <span className="font-mono">{testId}</span> ({testTitle})
                  </span>
                  <button
                    onClick={handleStartNewTest}
                    className="font-bold text-amber-700 hover:underline"
                  >
                    Switch to Create New Test
                  </button>
                </div>
              )}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">
                    {editingTestId ? `Advanced JSON Schema Editor (Editing: ${testTitle})` : 'Advanced JSON Schema Editor'}
                  </h3>
                  <button
                    onClick={() => setActiveTab('visual-builder')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    ← Back to Visual Builder
                  </button>
                </div>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={20}
                  className="w-full p-4 border border-slate-300 rounded-lg font-mono text-xs bg-slate-50 focus:bg-white outline-none"
                  spellCheck={false}
                />
                <div className="flex items-center justify-between">
                  {editingTestId && (
                    <button
                      onClick={handleStartNewTest}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    onClick={handleInitiateSave}
                    className="px-6 py-2.5 bg-[#214162] hover:bg-[#1a334e] text-white font-bold text-xs rounded-lg shadow-sm ml-auto"
                  >
                    {editingTestId ? 'Save & Update JSON Test' : 'Save JSON Test'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESULTS & SUBMISSIONS */}
          {activeTab === 'results' && (
            <div className="space-y-5 max-w-6xl mx-auto">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs font-semibold text-slate-500">Total Submissions</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{resultsList.length}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Across all mock tests</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs font-semibold text-amber-700">Writing Submissions</div>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    {resultsList.filter(r => (r.writingTask1 && r.writingTask1.trim().length > 0) || (r.writingTask2 && r.writingTask2.trim().length > 0)).length}
                  </div>
                  <div className="text-[10px] text-amber-600 mt-0.5">Essays ready for review</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs font-semibold text-indigo-700">Avg. Listening</div>
                  <div className="text-2xl font-black text-indigo-900 mt-1">
                    {resultsList.length > 0
                      ? (resultsList.reduce((acc, r) => acc + (r.listeningScore || 0), 0) / resultsList.length).toFixed(1)
                      : '0.0'}/40
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-0.5">
                    Band ~{resultsList.length > 0 ? calculateBand(Math.round(resultsList.reduce((acc, r) => acc + (r.listeningScore || 0), 0) / resultsList.length)).toFixed(1) : '-'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs font-semibold text-emerald-700">Avg. Reading</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    {resultsList.length > 0
                      ? (resultsList.reduce((acc, r) => acc + (r.readingScore || 0), 0) / resultsList.length).toFixed(1)
                      : '0.0'}/40
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    Band ~{resultsList.length > 0 ? calculateBand(Math.round(resultsList.reduce((acc, r) => acc + (r.readingScore || 0), 0) / resultsList.length)).toFixed(1) : '-'}
                  </div>
                </div>
              </div>

              {/* Main Submissions Table Card */}
              <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#214162]" />
                      <span>Candidate Test Submissions & Student Writing Answers ({filteredResults.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Click &quot;Inspect Answers &amp; Writing&quot; to review the candidate&apos;s typed essays, grade tasks, and check reading/listening questions.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={refreshAllData} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Ribbon */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={resultsSearchQuery}
                      onChange={(e) => setResultsSearchQuery(e.target.value)}
                      placeholder="Search candidate name, reg ID, test..."
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#214162]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setResultsFilter('all')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        resultsFilter === 'all' ? 'bg-[#214162] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({resultsList.length})
                    </button>
                    <button
                      onClick={() => setResultsFilter('with-writing')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        resultsFilter === 'with-writing' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      With Writing ({resultsList.filter(r => (r.writingTask1 && r.writingTask1.trim().length > 0) || (r.writingTask2 && r.writingTask2.trim().length > 0)).length})
                    </button>
                    <button
                      onClick={() => setResultsFilter('ungraded')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        resultsFilter === 'ungraded' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Needs Examiner Review
                    </button>
                    <button
                      onClick={() => setResultsFilter('graded')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        resultsFilter === 'graded' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Graded
                    </button>
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 text-left">Candidate &amp; Reg ID</th>
                        <th className="py-3 px-4 text-left">Test Taken</th>
                        <th className="py-3 px-4 text-left">Listening</th>
                        <th className="py-3 px-4 text-left">Reading</th>
                        <th className="py-3 px-4 text-left">Writing Responses</th>
                        <th className="py-3 px-4 text-left">Overall Band</th>
                        <th className="py-3 px-4 text-left">Timestamp</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredResults.map((r, idx) => {
                        const wordsT1 = countWords(r.writingTask1);
                        const wordsT2 = countWords(r.writingTask2);
                        const hasWriting = wordsT1 > 0 || wordsT2 > 0;
                        const lBand = calculateBand(r.listeningScore || 0);
                        const rBand = calculateBand(r.readingScore || 0);
                        const wBand = r.examinerFeedback?.overallWritingBand || r.writingBand;
                        const approxOverall = r.overallBand || (wBand ? Math.round(((lBand + rBand + wBand + (r.speakingBand || 7.0)) / 4) * 2) / 2 : undefined);

                        return (
                          <tr key={r.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 text-xs">{r.candidateName}</div>
                              <div className="font-mono text-[11px] text-blue-900 font-semibold">#{r.candidateId}</div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800 truncate max-w-xs">{r.testTitle || r.testId}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {r.testId}</div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-indigo-700">{r.listeningScore}/40</div>
                              <div className="text-[10px] text-slate-500 font-semibold">Band {lBand.toFixed(1)}</div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-emerald-700">{r.readingScore}/40</div>
                              <div className="text-[10px] text-slate-500 font-semibold">Band {rBand.toFixed(1)}</div>
                            </td>

                            <td className="py-3 px-4">
                              {hasWriting ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        wordsT1 >= 150 ? 'bg-emerald-100 text-emerald-800' : wordsT1 > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                                      }`}
                                    >
                                      T1: {wordsT1}w
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        wordsT2 >= 250 ? 'bg-emerald-100 text-emerald-800' : wordsT2 > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                                      }`}
                                    >
                                      T2: {wordsT2}w
                                    </span>
                                  </div>
                                  {wBand ? (
                                    <div className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                                      <Award className="w-3 h-3" />
                                      <span>Graded Band {wBand.toFixed(1)}</span>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-amber-600 font-semibold">
                                      Needs Grading
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No essay typed</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {approxOverall ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
                                  Band {approxOverall.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">-</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {r.timestamp ? new Date(r.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleInspectResult(r)}
                                  className="px-2.5 py-1.5 bg-[#214162] hover:bg-[#1a334e] text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                                  title="Inspect student writing essays and all test answers"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect Answers</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteResult(r.id, r.candidateName)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete submission"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredResults.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <div className="font-semibold text-slate-600">No test submissions matching your filter.</div>
                            <p className="text-xs text-slate-400 mt-1">When students complete a test and type their writing answers, their full submissions will appear here.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Candidate Answers & Writing Inspector Modal */}
      {inspectingResult && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-text">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#214162] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#214162] font-black text-lg flex items-center justify-center shadow-xs">
                  {inspectingResult.candidateName ? inspectingResult.candidateName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg">{inspectingResult.candidateName}</h3>
                    <span className="bg-blue-800 text-blue-100 font-mono text-xs px-2 py-0.5 rounded font-semibold">
                      Reg #{inspectingResult.candidateId}
                    </span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Test: {inspectingResult.testTitle || inspectingResult.testId} • Submitted: {new Date(inspectingResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-xs">
                  <span className="text-blue-200">Listening: <strong className="text-white">{inspectingResult.listeningScore}/40</strong></span>
                  <span className="text-blue-300">|</span>
                  <span className="text-blue-200">Reading: <strong className="text-white">{inspectingResult.readingScore}/40</strong></span>
                  <span className="text-blue-300">|</span>
                  <span className="text-blue-200">Writing: <strong className="text-white">Band {(inspectingResult.examinerFeedback?.overallWritingBand || inspectingResult.writingBand || 7.0).toFixed(1)}</strong></span>
                </div>

                <button
                  onClick={() => setInspectingResult(null)}
                  className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 shrink-0 space-x-1">
              <button
                onClick={() => setInspectActiveTab('writing')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
                  inspectActiveTab === 'writing'
                    ? 'border-[#214162] text-[#214162] bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>✍️ Writing Answers &amp; Grading</span>
                {((inspectingResult.writingTask1 && inspectingResult.writingTask1.trim().length > 0) ||
                  (inspectingResult.writingTask2 && inspectingResult.writingTask2.trim().length > 0)) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                onClick={() => setInspectActiveTab('listening')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
                  inspectActiveTab === 'listening'
                    ? 'border-[#214162] text-[#214162] bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>🎧 Listening Answers ({inspectingResult.listeningScore}/40)</span>
              </button>

              <button
                onClick={() => setInspectActiveTab('reading')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
                  inspectActiveTab === 'reading'
                    ? 'border-[#214162] text-[#214162] bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📖 Reading Answers ({inspectingResult.readingScore}/40)</span>
              </button>

              <button
                onClick={() => setInspectActiveTab('trf')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
                  inspectActiveTab === 'trf'
                    ? 'border-[#214162] text-[#214162] bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>📜 Test Report Form (TRF)</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50 text-xs">
              {/* 1. WRITING TAB */}
              {inspectActiveTab === 'writing' && (
                <div className="space-y-6">
                  {/* Task 1 Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-xs">
                          Task 1 Response
                        </span>
                        <span className="font-bold text-slate-800">
                          {allTests.find(t => t.id === inspectingResult.testId)?.writingTasks?.[0]?.title || 'Academic Writing Task 1'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs text-slate-600 font-semibold">
                          Word Count:{' '}
                          <strong className={countWords(inspectingResult.writingTask1) >= 150 ? 'text-emerald-700' : 'text-amber-700'}>
                            {countWords(inspectingResult.writingTask1)} words
                          </strong>{' '}
                          (Min: 150)
                        </span>

                        <button
                          onClick={() => handleCopyEssay(1, inspectingResult.writingTask1)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-semibold flex items-center space-x-1"
                        >
                          {copiedEssayTask === 1 ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedEssayTask === 1 ? 'Copied!' : 'Copy Essay'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Question Prompt */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                        <span className="font-bold text-slate-900 block mb-1 text-[11px] uppercase tracking-wider">Question Prompt:</span>
                        {allTests.find(t => t.id === inspectingResult.testId)?.writingTasks?.[0]?.prompt ||
                          'The chart below shows renewable electricity generation and carbon emissions data. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.'}
                      </div>

                      {/* Student's Typed Essay */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">Student&apos;s Submitted Answer:</span>
                        {inspectingResult.writingTask1 && inspectingResult.writingTask1.trim().length > 0 ? (
                          <div className="p-4 bg-slate-50/40 rounded-lg border border-slate-300 text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-sans min-h-[120px]">
                            {inspectingResult.writingTask1}
                          </div>
                        ) : (
                          <div className="p-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-400 italic">
                            The student did not submit an essay response for Task 1.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task 2 Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 bg-blue-50/70 border-b border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded font-bold text-xs">
                          Task 2 Response
                        </span>
                        <span className="font-bold text-slate-800">
                          {allTests.find(t => t.id === inspectingResult.testId)?.writingTasks?.[1]?.title || 'Academic Writing Task 2'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs text-slate-600 font-semibold">
                          Word Count:{' '}
                          <strong className={countWords(inspectingResult.writingTask2) >= 250 ? 'text-emerald-700' : 'text-amber-700'}>
                            {countWords(inspectingResult.writingTask2)} words
                          </strong>{' '}
                          (Min: 250)
                        </span>

                        <button
                          onClick={() => handleCopyEssay(2, inspectingResult.writingTask2)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-semibold flex items-center space-x-1"
                        >
                          {copiedEssayTask === 2 ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedEssayTask === 2 ? 'Copied!' : 'Copy Essay'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Question Prompt */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                        <span className="font-bold text-slate-900 block mb-1 text-[11px] uppercase tracking-wider">Question Prompt:</span>
                        {allTests.find(t => t.id === inspectingResult.testId)?.writingTasks?.[1]?.prompt ||
                          'Some people believe that technological progress is the primary driver of human advancement, while others argue that social equity and preservation of cultural heritage are more important. Discuss both views and give your own opinion.'}
                      </div>

                      {/* Student's Typed Essay */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">Student&apos;s Submitted Answer:</span>
                        {inspectingResult.writingTask2 && inspectingResult.writingTask2.trim().length > 0 ? (
                          <div className="p-4 bg-slate-50/40 rounded-lg border border-slate-300 text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-sans min-h-[140px]">
                            {inspectingResult.writingTask2}
                          </div>
                        ) : (
                          <div className="p-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-400 italic">
                            The student did not submit an essay response for Task 2.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Examiner / Teacher Grading & Feedback Panel */}
                  <div className="p-5 bg-purple-50/60 rounded-xl border border-purple-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-purple-700" />
                        <h4 className="font-bold text-sm text-purple-950">Examiner Official Writing Evaluation</h4>
                      </div>
                      <span className="text-[11px] text-purple-700 font-semibold">
                        {inspectingResult.examinerFeedback?.gradedAt
                          ? `Last graded on ${new Date(inspectingResult.examinerFeedback.gradedAt).toLocaleDateString()}`
                          : 'Pending Examiner Evaluation'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <label className="block text-xs font-bold text-purple-950 mb-1">Task 1 Band Score</label>
                        <select
                          value={teacherTask1Band}
                          onChange={(e) => setTeacherTask1Band(Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded font-bold text-sm bg-white"
                        >
                          {[9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0].map((b) => (
                            <option key={b} value={b}>Band {b.toFixed(1)}</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <label className="block text-xs font-bold text-purple-950 mb-1">Task 2 Band Score (2x Weight)</label>
                        <select
                          value={teacherTask2Band}
                          onChange={(e) => setTeacherTask2Band(Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded font-bold text-sm bg-white"
                        >
                          {[9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0].map((b) => (
                            <option key={b} value={b}>Band {b.toFixed(1)}</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-purple-300 bg-purple-100/30">
                        <label className="block text-xs font-bold text-purple-950 mb-1">Overall Writing Band Score</label>
                        <select
                          value={teacherOverallWritingBand}
                          onChange={(e) => setTeacherOverallWritingBand(Number(e.target.value))}
                          className="w-full p-2 border border-purple-300 rounded font-black text-sm bg-white text-purple-900"
                        >
                          {[9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0].map((b) => (
                            <option key={b} value={b}>Official Band {b.toFixed(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-950">
                        Teacher / Examiner Feedback &amp; Diagnostic Notes:
                      </label>
                      <textarea
                        value={teacherNotes}
                        onChange={(e) => setTeacherNotes(e.target.value)}
                        rows={3}
                        placeholder="Enter detailed feedback on Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Accuracy for the candidate..."
                        className="w-full p-3 border border-purple-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveExaminerFeedback}
                        className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Evaluation &amp; Update Band Scores</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. LISTENING TAB */}
              {inspectActiveTab === 'listening' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Listening Test Performance Breakdown</h4>
                      <p className="text-xs text-slate-500">Total Raw Score: {inspectingResult.listeningScore} / 40 • Band {calculateBand(inspectingResult.listeningScore || 0).toFixed(1)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {allTests.find(t => t.id === inspectingResult.testId)?.listeningQuestions?.map((q) => {
                      const userAns = inspectingResult.userAnswers?.[q.id] || '';
                      
                      const isMulti = q.type === 'multiple-response';
                      let isCorrect = false;
                      if (!userAns) {
                        isCorrect = false;
                      } else if (isMulti) {
                        const uSet = userAns.split('|').map(s => s.trim().toLowerCase()).sort();
                        const cSet = q.correctAnswer.split('|').map(s => s.trim().toLowerCase()).sort();
                        isCorrect = uSet.join('|') === cSet.join('|') && uSet.length > 0;
                      } else {
                        const validAnswers = q.correctAnswer.split('|').map(s => s.trim().toLowerCase());
                        isCorrect = validAnswers.includes(userAns.trim().toLowerCase());
                      }

                      return (
                        <div key={q.id} className="p-3.5 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 font-mono">
                                Q{q.questionNumber}
                              </span>
                              <span className="font-semibold text-slate-800 text-xs">{q.questionText}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs pt-1">
                              <span>Candidate Answer: <strong className="text-slate-900 font-mono">{userAns || '<No Answer>'}</strong></span>
                              <span>Correct Answer: <strong className="text-emerald-700 font-mono">{q.correctAnswer}</strong></span>
                            </div>
                          </div>

                          <div>
                            {isCorrect ? (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-bold text-[11px] flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Incorrect
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. READING TAB */}
              {inspectActiveTab === 'reading' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Reading Test Performance Breakdown</h4>
                      <p className="text-xs text-slate-500">Total Raw Score: {inspectingResult.readingScore} / 40 • Band {calculateBand(inspectingResult.readingScore || 0).toFixed(1)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {allTests.find(t => t.id === inspectingResult.testId)?.readingQuestions?.map((q) => {
                      const userAns = inspectingResult.userAnswers?.[q.id] || '';
                      
                      const isMulti = q.type === 'multiple-response';
                      let isCorrect = false;
                      if (!userAns) {
                        isCorrect = false;
                      } else if (isMulti) {
                        const uSet = userAns.split('|').map(s => s.trim().toLowerCase()).sort();
                        const cSet = q.correctAnswer.split('|').map(s => s.trim().toLowerCase()).sort();
                        isCorrect = uSet.join('|') === cSet.join('|') && uSet.length > 0;
                      } else {
                        const validAnswers = q.correctAnswer.split('|').map(s => s.trim().toLowerCase());
                        isCorrect = validAnswers.includes(userAns.trim().toLowerCase());
                      }

                      return (
                        <div key={q.id} className="p-3.5 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 font-mono">
                                Q{q.questionNumber}
                              </span>
                              <span className="font-semibold text-slate-800 text-xs">{q.questionText}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs pt-1">
                              <span>Candidate Answer: <strong className="text-slate-900 font-mono">{userAns || '<No Answer>'}</strong></span>
                              <span>Correct Answer: <strong className="text-emerald-700 font-mono">{q.correctAnswer}</strong></span>
                            </div>
                          </div>

                          <div>
                            {isCorrect ? (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-bold text-[11px] flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Incorrect
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. TRF CERTIFICATE TAB */}
              {inspectActiveTab === 'trf' && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-300 shadow-sm space-y-6 text-slate-900">
                  <div className="border-b-2 border-slate-900 pb-4 text-center">
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Official Simulation</div>
                    <h2 className="text-xl font-black tracking-tight">IELTS TEST REPORT FORM (TRF)</h2>
                    <p className="text-xs text-slate-600 font-mono">JJ Academy Computer-Delivered Examination</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Candidate Name</span>
                      <strong className="text-sm">{inspectingResult.candidateName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Candidate ID</span>
                      <strong className="font-mono text-sm">#{inspectingResult.candidateId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Date of Birth</span>
                      <span>{inspectingResult.candidateDob || '2000-01-01'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Test Date</span>
                      <span>{new Date(inspectingResult.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Scores Grid */}
                  <div className="grid grid-cols-5 gap-2 text-center pt-2">
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="text-[10px] font-bold text-indigo-700 uppercase">Listening</div>
                      <div className="text-xl font-black text-indigo-950 mt-1">
                        {calculateBand(inspectingResult.listeningScore || 0).toFixed(1)}
                      </div>
                      <div className="text-[9px] text-indigo-500">Raw: {inspectingResult.listeningScore}/40</div>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase">Reading</div>
                      <div className="text-xl font-black text-emerald-950 mt-1">
                        {calculateBand(inspectingResult.readingScore || 0).toFixed(1)}
                      </div>
                      <div className="text-[9px] text-emerald-500">Raw: {inspectingResult.readingScore}/40</div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-[10px] font-bold text-amber-700 uppercase">Writing</div>
                      <div className="text-xl font-black text-amber-950 mt-1">
                        {(inspectingResult.examinerFeedback?.overallWritingBand || inspectingResult.writingBand || 7.0).toFixed(1)}
                      </div>
                      <div className="text-[9px] text-amber-600">Examiner Graded</div>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-[10px] font-bold text-purple-700 uppercase">Speaking</div>
                      <div className="text-xl font-black text-purple-950 mt-1">
                        {(inspectingResult.speakingBand || 7.0).toFixed(1)}
                      </div>
                      <div className="text-[9px] text-purple-500">Standard Band</div>
                    </div>

                    <div className="p-3 bg-blue-900 text-white rounded-lg shadow-sm">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Overall</div>
                      <div className="text-2xl font-black mt-1">
                        {(
                          inspectingResult.overallBand ||
                          Math.round(
                            ((calculateBand(inspectingResult.listeningScore || 0) +
                              calculateBand(inspectingResult.readingScore || 0) +
                              (inspectingResult.examinerFeedback?.overallWritingBand || inspectingResult.writingBand || 7.0) +
                              (inspectingResult.speakingBand || 7.0)) /
                              4) *
                              2
                          ) / 2
                        ).toFixed(1)}
                      </div>
                      <div className="text-[9px] text-blue-300">CEFR C1</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Lead Examiner Remarks:</span>
                    <p className="text-slate-600 italic">
                      {inspectingResult.examinerFeedback?.teacherNotes ||
                        'Candidate demonstrated proficient command of English with fluent communication and accurate task responses.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500 font-mono">
                Submission Record: {inspectingResult.id || 'local_record'}
              </span>
              <button
                onClick={() => setInspectingResult(null)}
                className="px-5 py-2 bg-[#214162] hover:bg-[#1a334e] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Candidate Test Assignment & Timers Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#214162] text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-sm">Edit Profile & Timers for {editingCandidate.name}</h3>
                <p className="text-[11px] text-blue-200">Registration ID: #{editingCandidate.id} • DOB: {editingCandidate.dob}</p>
              </div>
              <button onClick={() => setEditingCandidate(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {/* Test Assignments Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  1. Allowed Mock Tests:
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {allTests.map(t => {
                    const isChecked = editAssignments.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setEditAssignments(prev =>
                              prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id]
                            );
                          }}
                          className="mt-0.5 text-blue-600 rounded"
                        />
                        <div className="leading-tight">
                          <div className="font-bold text-xs">{t.title}</div>
                          <div className="text-[10px] text-slate-500 uppercase">{t.module} Module • ID: {t.id}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* IELTS Part Timers & Accommodations */}
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. IELTS Part Timers & Accommodations
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    Total: {(Number(editListeningTimer) || 0) + (Number(editReadingTimer) || 0) + (Number(editWritingTimer) || 0) + (Number(editSpeakingTimer) || 0)} mins
                  </span>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(Object.keys(TIMER_PRESETS) as Array<keyof typeof TIMER_PRESETS>).map((key) => {
                    const preset = TIMER_PRESETS[key];
                    const isSelected = editTimerPreset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectEditTimerPreset(key as any)}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{preset.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {key === 'custom' ? 'Custom' : `${preset.listening + preset.reading + preset.writing + preset.speaking}m`}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Minutes Input Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Headphones className="w-3 h-3 text-indigo-600" />
                      <span>Listening</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={editListeningTimer}
                        onChange={(e) => {
                          setEditListeningTimer(Number(e.target.value));
                          setEditTimerPreset('custom');
                        }}
                        className="w-full p-1 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">min</span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>Reading</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={editReadingTimer}
                        onChange={(e) => {
                          setEditReadingTimer(Number(e.target.value));
                          setEditTimerPreset('custom');
                        }}
                        className="w-full p-1 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">min</span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <FileEdit className="w-3 h-3 text-amber-600" />
                      <span>Writing</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={editWritingTimer}
                        onChange={(e) => {
                          setEditWritingTimer(Number(e.target.value));
                          setEditTimerPreset('custom');
                        }}
                        className="w-full p-1 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">min</span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mic className="w-3 h-3 text-purple-600" />
                      <span>Speaking</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={editSpeakingTimer}
                        onChange={(e) => {
                          setEditSpeakingTimer(Number(e.target.value));
                          setEditTimerPreset('custom');
                        }}
                        className="w-full p-1 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 shrink-0">
              <button
                onClick={() => setEditingCandidate(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditAssignments}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Save Settings & Timers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {bulkModalSection && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#214162] text-white flex justify-between items-center">
              <h3 className="font-bold text-sm capitalize">
                Bulk Import {bulkModalSection} Questions (JSON)
              </h3>
              <button onClick={() => setBulkModalSection(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs">
              <textarea
                value={bulkJsonText}
                onChange={(e) => setBulkJsonText(e.target.value)}
                rows={12}
                className="w-full p-3 border border-slate-300 rounded font-mono text-xs bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-2">
              <button
                onClick={() => setBulkModalSection(null)}
                className="px-4 py-2 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyBulkImport}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold"
              >
                Import Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {showValidationModal && testToValidate && (
        <ValidationReportModal
          test={testToValidate}
          onClose={() => setShowValidationModal(false)}
          onPublishAnyway={() => {
            setShowValidationModal(false);
            handleSaveTest(testToValidate);
          }}
        />
      )}
    </div>
  );
};
