import React, { useState } from 'react';
import { db, storage, logout, isConfigured } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { X, LogOut, Save, Plus, Trash2, UploadCloud, Edit3, Code, FileJson, Copy, Check } from 'lucide-react';
import { TestConfiguration, Question, ReadingPassage } from '../types';

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
    questionText: 'Customer phone number: ___',
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
    questionText: 'Which day will the venue be available?',
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
  },
  {
    id: 'r2',
    section: 'reading',
    passageId: 'p1',
    partNumber: 1,
    questionNumber: 2,
    instruction: 'Complete the sentence. Write NO MORE THAN TWO WORDS from the passage.',
    questionText: 'Electric buses are recharged using ultra-fast ___ systems.',
    type: 'fill-blank',
    correctAnswer: 'pantograph',
    explanation: 'Paragraph 2 mentions pantograph systems.'
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Bulk Import Modal State
  const [bulkModalSection, setBulkModalSection] = useState<'listening' | 'reading' | null>(null);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [copied, setCopied] = useState(false);

  // Test State
  const [testId, setTestId] = useState('custom-test-1');
  const [title, setTitle] = useState('JJ Academy Custom Test');
  const [module, setModule] = useState<'academic' | 'general'>('academic');
  
  // Listening Data
  const [listeningAudioUrl, setListeningAudioUrl] = useState('');
  const [listeningQuestions, setListeningQuestions] = useState<Question[]>([]);

  // Reading Data
  const [readingPassages, setReadingPassages] = useState<ReadingPassage[]>([]);
  const [readingQuestions, setReadingQuestions] = useState<Question[]>([]);

  // JSON State (Fallback)
  const [jsonText, setJsonText] = useState('');

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!isConfigured || !storage) {
      setStatus("Error: Firebase Storage is not configured.");
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

  const addQuestion = (section: 'listening' | 'reading') => {
    const list = section === 'listening' ? listeningQuestions : readingQuestions;
    const newQ: Question = {
      id: `${section.charAt(0)}${list.length + 1}_${Date.now()}`,
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
        alert('Invalid format: JSON must be an array of question objects e.g. [ { ... }, { ... } ]');
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

  const handleCopySample = () => {
    navigator.clipboard.writeText(bulkJsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addReadingPassage = () => {
    const newPassage: ReadingPassage = {
      id: `p${readingPassages.length + 1}_${Date.now()}`,
      title: `Reading Passage ${readingPassages.length + 1}`,
      content: ''
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

  const generateTestObject = (): TestConfiguration => {
    return {
      id: testId,
      title,
      module,
      listeningAudioUrl,
      listeningAudioParts: [], // Simplified for now
      listeningQuestions,
      readingPassages,
      readingQuestions,
      writingTasks: [],
      speakingTasks: []
    };
  };

  const handleSave = async () => {
    if (!isConfigured) {
      setStatus("Error: Firebase is not configured.");
      return;
    }
    
    try {
      const dataToSave = activeTab === 'json' ? JSON.parse(jsonText) : generateTestObject();
      await setDoc(doc(db, 'tests', dataToSave.id), dataToSave);
      setStatus("Test data saved successfully to Firebase Firestore!");
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleTabSwitch = (tab: 'visual' | 'json') => {
    if (tab === 'json') {
      setJsonText(JSON.stringify(generateTestObject(), null, 2));
    }
    setActiveTab(tab);
  };

  const renderQuestionEditor = (q: Question, qIndex: number, section: 'listening' | 'reading') => (
    <div key={q.id} className="border border-gray-200 rounded p-4 space-y-4 bg-gray-50 relative">
      <button onClick={() => removeQuestion(section, qIndex)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
        <Trash2 className="w-4 h-4" />
      </button>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Q. Number</label>
          <input type="number" value={q.questionNumber} onChange={(e) => updateQuestion(section, qIndex, { ...q, questionNumber: Number(e.target.value) })} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Question Type</label>
          <select value={q.type} onChange={(e) => updateQuestion(section, qIndex, { ...q, type: e.target.value as any })} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
            <option value="multiple-choice">Multiple Choice</option>
            <option value="fill-blank">Fill in the Blanks</option>
            <option value="true-false-not-given">True/False/Not Given</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Question Text {q.type === 'fill-blank' && <span className="text-blue-500 font-normal normal-case">(Use ___ for blank spaces)</span>}</label>
        <textarea value={q.questionText} onChange={(e) => updateQuestion(section, qIndex, { ...q, questionText: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-sm bg-white resize-none" rows={2} />
      </div>

      {(q.type === 'multiple-choice' || q.type === 'true-false-not-given') && (
        <div className="space-y-2 p-3 bg-white border border-gray-200 rounded">
          <label className="block text-xs font-bold uppercase text-gray-500">Options</label>
          {q.options?.map((opt, optIndex) => (
            <div key={optIndex} className="flex items-center space-x-2">
              <input type="text" value={opt.value} onChange={(e) => {
                const newOpts = [...(q.options || [])];
                newOpts[optIndex].value = e.target.value;
                updateQuestion(section, qIndex, { ...q, options: newOpts });
              }} placeholder="Value (e.g., A)" className="w-16 p-1.5 border border-gray-300 rounded text-xs" />
              <input type="text" value={opt.label} onChange={(e) => {
                const newOpts = [...(q.options || [])];
                newOpts[optIndex].label = e.target.value;
                updateQuestion(section, qIndex, { ...q, options: newOpts });
              }} placeholder="Label text" className="flex-1 p-1.5 border border-gray-300 rounded text-xs" />
              <button onClick={() => {
                const newOpts = q.options?.filter((_, i) => i !== optIndex);
                updateQuestion(section, qIndex, { ...q, options: newOpts });
              }} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4"/></button>
            </div>
          ))}
          <button onClick={() => {
            const newOpts = [...(q.options || []), { label: `Option ${q.options ? q.options.length + 1 : 1}`, value: String.fromCharCode(65 + (q.options ? q.options.length : 0)) }];
            updateQuestion(section, qIndex, { ...q, options: newOpts });
          }} className="text-xs text-blue-600 font-medium hover:underline">+ Add Option</button>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Correct Answer</label>
        <input type="text" value={q.correctAnswer} onChange={(e) => updateQuestion(section, qIndex, { ...q, correctAnswer: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="e.g., A or the exact word" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded shadow-2xl flex flex-col h-full max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#214162] text-white flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold">Admin Dashboard - Test Builder</h2>
          <div className="flex items-center space-x-6">
            <div className="flex bg-[#162d44] rounded p-1 space-x-1">
              <button 
                onClick={() => handleTabSwitch('visual')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'visual' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Visual Builder</span>
              </button>
              <button 
                onClick={() => handleTabSwitch('json')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'json' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}`}
              >
                <Code className="w-4 h-4" />
                <span>JSON Editor</span>
              </button>
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center space-x-1 text-sm text-blue-200 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button onClick={onClose} className="text-gray-300 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
          
          {activeTab === 'visual' ? (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Test Metadata */}
              <div className="bg-white p-6 rounded shadow-sm border border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">1. Test Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Test ID</label>
                    <input type="text" value={testId} onChange={(e) => setTestId(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Module</label>
                    <select value={module} onChange={(e) => setModule(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                      <option value="academic">Academic</option>
                      <option value="general">General Training</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Test Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" />
                </div>
              </div>

              {/* Listening Section Builder */}
              <div className="bg-white p-6 rounded shadow-sm border border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex justify-between items-center">
                  <span>2. Listening Section</span>
                </h3>
                
                {/* Audio Upload */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded space-y-3">
                  <label className="block text-sm font-bold text-gray-800">Listening Audio</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Upload MP3</span>
                      <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                    </label>
                    <div className="flex-1">
                      <input type="text" value={listeningAudioUrl} onChange={(e) => setListeningAudioUrl(e.target.value)} placeholder="Or paste audio URL here..." className="w-full p-2 border border-gray-300 rounded text-sm bg-white" />
                    </div>
                  </div>
                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>

                {/* Questions List */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-700">Listening Questions</h4>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleOpenBulkModal('listening')} className="flex items-center space-x-1 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-200 font-medium transition-colors">
                        <FileJson className="w-4 h-4" />
                        <span>Bulk Upload (JSON)</span>
                      </button>
                      <button onClick={() => addQuestion('listening')} className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Add Question</span>
                      </button>
                    </div>
                  </div>

                  {listeningQuestions.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded text-gray-500 text-sm">
                      No listening questions added yet. Click "Add Question" or "Bulk Upload (JSON)" to start building.
                    </div>
                  )}

                  {listeningQuestions.map((q, qIndex) => renderQuestionEditor(q, qIndex, 'listening'))}
                </div>
              </div>

              {/* Reading Section Builder */}
              <div className="bg-white p-6 rounded shadow-sm border border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">3. Reading Section</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-700">Reading Passages</h4>
                    <button onClick={addReadingPassage} className="flex items-center space-x-1 text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded hover:bg-emerald-200 font-medium">
                      <Plus className="w-4 h-4" />
                      <span>Add Passage</span>
                    </button>
                  </div>

                  {readingPassages.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded text-gray-500 text-sm">
                      No reading passages added yet. Click "Add Passage" to start building.
                    </div>
                  )}

                  {readingPassages.map((p, pIndex) => (
                    <div key={p.id} className="border border-gray-200 rounded p-4 space-y-4 bg-gray-50 relative">
                      <button onClick={() => removeReadingPassage(pIndex)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Passage Title</label>
                        <input type="text" value={p.title} onChange={(e) => updateReadingPassage(pIndex, { ...p, title: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-sm bg-white font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Content (Use HTML/Markdown)</label>
                        <textarea value={p.content} onChange={(e) => updateReadingPassage(pIndex, { ...p, content: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-sm bg-white font-mono" rows={6} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t mt-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-700">Reading Questions</h4>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleOpenBulkModal('reading')} className="flex items-center space-x-1 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-200 font-medium transition-colors">
                        <FileJson className="w-4 h-4" />
                        <span>Bulk Upload (JSON)</span>
                      </button>
                      <button onClick={() => addQuestion('reading')} className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Add Question</span>
                      </button>
                    </div>
                  </div>

                  {readingQuestions.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded text-gray-500 text-sm">
                      No reading questions added yet. Click "Add Question" or "Bulk Upload (JSON)" to start building.
                    </div>
                  )}

                  {readingQuestions.map((q, qIndex) => renderQuestionEditor(q, qIndex, 'reading'))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-[400px]">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-900 mb-4 shrink-0">
                <strong>Advanced JSON Editor</strong>
                <p className="mt-1">
                  Paste the full JSON format here. This allows you to configure Reading Passages, Writing Tasks, and Speaking Tasks which are not yet in the visual builder.
                </p>
              </div>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full flex-1 p-4 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                spellCheck="false"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="text-sm font-semibold">
            {status && (
              <span className={status.startsWith('Error') || status.startsWith('Upload fail') ? 'text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100' : 'text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100'}>
                {status}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className={`flex items-center space-x-2 px-8 py-2.5 bg-[#214162] hover:bg-[#2b547e] text-white text-sm font-bold rounded shadow-sm transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save className="w-4 h-4" />
            <span>Save Test to Firebase</span>
          </button>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {bulkModalSection && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="p-4 bg-[#214162] text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileJson className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-base capitalize">
                  Bulk Upload {bulkModalSection} Questions (JSON)
                </h3>
              </div>
              <button onClick={() => setBulkModalSection(null)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto text-sm">
              <div className="bg-purple-50 border border-purple-200 rounded p-3 text-purple-900 text-xs leading-relaxed space-y-1">
                <p className="font-bold">Format Guidance:</p>
                <p>Paste a JSON array containing question objects. Supported question types: <code className="bg-purple-100 px-1 rounded">multiple-choice</code>, <code className="bg-purple-100 px-1 rounded font-mono">fill-blank</code>, <code className="bg-purple-100 px-1 rounded font-mono">true-false-not-given</code>.</p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-600 uppercase">Question Array JSON</span>
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="flex items-center space-x-1 text-xs text-purple-700 hover:text-purple-900 bg-purple-50 px-2.5 py-1 rounded border border-purple-200 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Sample!' : 'Copy Sample Template'}</span>
                </button>
              </div>

              <textarea
                value={bulkJsonText}
                onChange={(e) => setBulkJsonText(e.target.value)}
                rows={14}
                className="w-full p-3 border border-gray-300 rounded font-mono text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="[ { ... }, { ... } ]"
              />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const sample = bulkModalSection === 'listening' ? SAMPLE_LISTENING_QUESTIONS : SAMPLE_READING_QUESTIONS;
                  setBulkJsonText(JSON.stringify(sample, null, 2));
                }}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline"
              >
                Reset to Sample Template
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setBulkModalSection(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkImport}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-bold shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <FileJson className="w-4 h-4" />
                  <span>Import Questions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
