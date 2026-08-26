import React from 'react';

interface CandidateInstructionsProps {
  candidateName: string;
  candidateId: string;
  onStart: () => void;
}

export const CandidateInstructions: React.FC<CandidateInstructionsProps> = ({
  candidateName,
  candidateId,
  onStart,
}) => {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-3xl border-t-8 border-blue-800">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-black text-blue-900 tracking-tight mb-2">JJ ACADEMY</h1>
          <h2 className="text-xl font-bold uppercase tracking-widest text-gray-600 mb-6">Computer-Delivered Test</h2>
        </div>

        <div className="mb-8 border border-gray-200 rounded p-6 bg-gray-50 text-sm">
          <h3 className="font-bold text-lg mb-4 text-black border-b pb-2">Candidate Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 font-semibold mb-1">Name</p>
              <p className="font-bold text-black">{candidateName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold mb-1">Candidate ID</p>
              <p className="font-bold text-black">{candidateId}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 text-black">Instructions to Candidates</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Answer all the questions.</li>
            <li>You can change your answers at any time during the test.</li>
            <li>Do not click the "Finish Test" button until you have completed all sections.</li>
            <li>If you have a problem, raise your hand to attract the invigilator's attention.</li>
            <li>Once you start, the timer will begin automatically. Do not refresh the page.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onStart}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded shadow transition-colors text-lg"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};
