import React, { useState } from 'react';
import { db, logout, isConfigured } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { X, LogOut, Check, Save } from 'lucide-react';
import { TestConfiguration } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [jsonText, setJsonText] = useState('');
  const [testId, setTestId] = useState('custom-test-1');
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = async () => {
    if (!isConfigured) {
      setStatus("Firebase is not configured.");
      return;
    }
    
    try {
      const parsedData = JSON.parse(jsonText);
      // Optional: Add basic validation here to check if parsedData matches TestConfiguration
      await setDoc(doc(db, 'tests', testId), parsedData);
      setStatus("Test data saved successfully to Firebase Firestore!");
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const templateFormat = `{
  "id": "custom-test-1",
  "title": "JJ Academy Custom Test",
  "module": "academic",
  "listeningAudioUrl": "https://example.com/audio.mp3",
  "listeningAudioParts": [],
  "listeningQuestions": [
    {
      "id": "l1",
      "type": "fill-blank",
      "questionNumber": 1,
      "questionText": "When uranium was discovered to be radioactive, Marie Curie found that the element called ___ had the same property.",
      "correctAnswer": "thorium",
      "explanation": "Thorium was also found to be radioactive."
    }
  ],
  "readingPassages": [],
  "readingQuestions": [],
  "writingTasks": [],
  "speakingTasks": []
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded shadow-2xl flex flex-col h-full max-h-[90vh]">
        <div className="p-4 bg-[#214162] text-white flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold">Admin Dashboard - Test Management</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center space-x-1 text-xs text-blue-200 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button onClick={onClose} className="text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-900">
            <strong>Welcome to the Admin Dashboard!</strong>
            <p className="mt-1">
              Here you can paste a complete JSON representation of an IELTS test (Listening, Reading, Writing, Speaking). 
              This data will be saved to your connected Firebase Firestore database under the <code>tests</code> collection.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Test Document ID (Firestore)
            </label>
            <input 
              type="text" 
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col space-y-2 flex-1 h-full min-h-[300px]">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex justify-between">
              <span>Paste Test JSON Data</span>
              <button 
                onClick={() => setJsonText(templateFormat)}
                className="text-blue-600 hover:underline"
              >
                Load Template Format
              </button>
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full flex-1 p-3 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[300px]"
              placeholder="Paste the complete test JSON format here..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
          <div className="text-sm font-semibold">
            {status && (
              <span className={status.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}>
                {status}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#214162] hover:bg-[#2b547e] text-white text-sm font-bold rounded transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save to Firebase</span>
          </button>
        </div>
      </div>
    </div>
  );
};
