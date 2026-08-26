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
  generateUniqueRegNumber
} from '../lib/candidateStorage';
import { Candidate, IELTSTest, Question, ReadingPassage, CandidateTestResult } from '../types';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  X, LogOut, Save, Plus, Trash2, UploadCloud, Edit3, Code, FileJson, Copy, Check,
  Users, BookOpen, Award, Sparkles, RefreshCw, CheckSquare, Square, Search, Filter, ShieldCheck, ChevronRight
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'tests' | 'visual-builder' | 'json-builder' | 'results'>('candidates');
  
  // Candidates State
  const [candidatesList, setCandidatesList] = useState<Candidate[]>([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDob, setNewCandidateDob] = useState('2000-01-01');
  const [newCandidateRegId, setNewCandidateRegId] = useState('');
  const [selectedTestAssignments, setSelectedTestAssignments] = useState<string[]>([]);
  
  // Editing Candidate Test Assignments Modal
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editAssignments, setEditAssignments] = useState<string[]>([]);

  // Tests State
  const [allTests, setAllTests] = useState<IELTSTest[]>([]);
  const [resultsList, setResultsList] = useState<CandidateTestResult[]>([]);
  
  // Status & Feedback
  const [status, setStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Builder State
  const [testId, setTestId] = useState(`jj-test-${Date.now().toString().slice(-4)}`);
  const [testTitle, setTestTitle] = useState('JJ Academy Custom Mock Test');
  const [testModule, setTestModule] = useState<'academic' | 'general'>('academic');
  const [testDescription, setTestDescription] = useState('Official simulation test created via Admin Panel.');
  const [testAssignedToAll, setTestAssignedToAll] = useState(false);
  const [listeningAudioUrl, setListeningAudioUrl] = useState('');
  const [listeningQuestions, setListeningQuestions] = useState<Question[]>([]);
  const [readingPassages, setReadingPassages] = useState<ReadingPassage[]>([]);
  const [readingQuestions, setReadingQuestions] = useState<Question[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Generate unique 6 digit registration number
  const handleGenerateRegNumber = () => {
    const uniqueNumber = generateUniqueRegNumber(candidatesList);
    setNewCandidateRegId(uniqueNumber);
  };

  // Create new Candidate
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

    const newCand: Candidate = {
      id: cleanId,
      name: newCandidateName.trim(),
      dob: newCandidateDob,
      assignedTestIds: selectedTestAssignments.length > 0 ? selectedTestAssignments : (allTests[0] ? [allTests[0].id] : []),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    try {
      await saveCandidate(newCand);
      setStatus(`Candidate ${newCand.name} (Reg #${newCand.id}) registered successfully with ${newCand.assignedTestIds.length} test(s)!`);
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

  // Save updated candidate assignments from modal
  const handleSaveEditAssignments = async () => {
    if (!editingCandidate) return;
    const updated = {
      ...editingCandidate,
      assignedTestIds: editAssignments
    };
    await saveCandidate(updated);
    setEditingCandidate(null);
    refreshAllData();
    setStatus(`Updated assigned tests for ${updated.name} (Reg #${updated.id})`);
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
    return {
      id: testId,
      title: testTitle,
      module: testModule,
      description: testDescription,
      assignedToAll: testAssignedToAll,
      listeningData: [{ partNumber: 1, title: 'Listening Test', audioUrl: listeningAudioUrl, audioDuration: 0, instructions: '' }],
      listeningQuestions,
      readingPassages,
      readingQuestions,
      writingTasks: [
        {
          taskNumber: 1,
          title: 'Writing Task 1',
          prompt: 'Summarize the given chart or information. Write at least 150 words.',
          minWordCount: 150,
          timeLimitMinutes: 20
        },
        {
          taskNumber: 2,
          title: 'Writing Task 2',
          prompt: 'Write an essay discussing the given topic. Write at least 250 words.',
          minWordCount: 250,
          timeLimitMinutes: 40
        }
      ],
      speakingTasks: [
        {
          partNumber: 1,
          title: 'Speaking Part 1',
          topic: 'General Introduction & Everyday Life',
          questions: ['Introduce yourself.', 'Describe your studies or work.']
        }
      ],
      createdAt: new Date().toISOString()
    };
  };

  const handleSaveTest = async () => {
    try {
      const dataToSave: IELTSTest = activeTab === 'json-builder' ? JSON.parse(jsonText) : generateTestObject();
      await saveTest(dataToSave);
      setStatus(`Test "${dataToSave.title}" saved successfully!`);
      refreshAllData();
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

  const filteredCandidates = candidatesList.filter(c =>
    c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    c.id.includes(candidateSearch) ||
    c.dob.includes(candidateSearch)
  );

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
                onClick={() => setActiveTab('visual-builder')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'visual-builder' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Test</span>
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
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredCandidates.map((c) => {
                        const assignedCount = (c.assignedTestIds || []).length;
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
                                <button
                                  onClick={() => {
                                    setEditingCandidate(c);
                                    setEditAssignments(c.assignedTestIds || []);
                                  }}
                                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                                >
                                  Edit Assignments
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleDeleteCandidate(c.id, c.name)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete Candidate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredCandidates.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
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
                      Create multiple mock tests for your institute and assign them to specific candidates.
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
                  {allTests.map(test => (
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
                        
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-3 pt-3 border-t border-slate-100">
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
                          {test.id !== 'jj-ielts-acad-01' && (
                            <button
                              onClick={() => handleDeleteTest(test.id, test.title)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete Test"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VISUAL TEST BUILDER */}
          {activeTab === 'visual-builder' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-base font-bold text-slate-900">1. Test Details</h3>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Test Unique ID</label>
                    <input
                      type="text"
                      value={testId}
                      onChange={(e) => setTestId(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
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
                          <option value="fill-blank">Fill in the Blanks</option>
                          <option value="true-false-not-given">True / False / Not Given</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => updateQuestion('listening', idx, { ...q, questionText: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        placeholder="Question text (use ___ for fill-in blank)"
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
                    <textarea
                      value={p.paragraphs?.[0]?.text || ''}
                      onChange={(e) => updateReadingPassage(idx, { ...p, paragraphs: [{ id: 'A', text: e.target.value }] })}
                      rows={4}
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-white"
                      placeholder="Passage Text Content..."
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
                          <option value="true-false-not-given">True / False / Not Given</option>
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="fill-blank">Fill in the Blanks</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => updateQuestion('reading', idx, { ...q, questionText: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        placeholder="Question text"
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

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveTest}
                  className="px-8 py-3 bg-[#214162] hover:bg-[#1a334e] text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Test & Publish</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: JSON BUILDER */}
          {activeTab === 'json-builder' && (
            <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-full">
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">Advanced JSON Schema Editor</h3>
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
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveTest}
                    className="px-6 py-2.5 bg-[#214162] hover:bg-[#1a334e] text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    Save JSON Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESULTS & SUBMISSIONS */}
          {activeTab === 'results' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-base text-slate-900">
                    Candidate Test Results & Submissions ({resultsList.length})
                  </h3>
                  <button onClick={refreshAllData} className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 text-left">Reg ID</th>
                        <th className="py-3 px-4 text-left">Candidate Name</th>
                        <th className="py-3 px-4 text-left">Test ID</th>
                        <th className="py-3 px-4 text-left">Listening</th>
                        <th className="py-3 px-4 text-left">Reading</th>
                        <th className="py-3 px-4 text-left">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {resultsList.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-blue-900">{r.candidateId}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{r.candidateName}</td>
                          <td className="py-3 px-4 text-slate-600">{r.testId}</td>
                          <td className="py-3 px-4 font-bold text-indigo-700">{r.listeningScore}/40</td>
                          <td className="py-3 px-4 font-bold text-emerald-700">{r.readingScore}/40</td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                      {resultsList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No candidate submissions recorded yet.
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

      {/* Edit Candidate Test Assignment Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#214162] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Assign Tests for {editingCandidate.name}</h3>
                <p className="text-[11px] text-blue-200">Registration ID: #{editingCandidate.id}</p>
              </div>
              <button onClick={() => setEditingCandidate(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Select which tests this candidate is allowed to access when logging in with Registration ID <span className="font-mono font-bold text-blue-900">#{editingCandidate.id}</span>:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allTests.map(t => {
                  const isChecked = editAssignments.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-start space-x-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
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
                      <div>
                        <div className="font-bold text-xs">{t.title}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{t.module} Module • ID: {t.id}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setEditingCandidate(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditAssignments}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Save Assignments
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
    </div>
  );
};
