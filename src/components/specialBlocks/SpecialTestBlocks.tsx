import React from 'react';
import { Question, HighlightItem } from '../../types';
import { HighlightText } from '../HighlightText';
import { ArrowDown, AlertCircle } from 'lucide-react';

interface SpecialBlockProps {
  groupId: string;
  questions: { q: Question; index: number }[];
  userAnswers: Record<string, string>;
  onAnswerChange: (id: string, value: string) => void;
  highlights: HighlightItem[];
  onRemoveHighlight?: (id: string) => void;
  onUpdateHighlight?: (id: string, updates: Partial<HighlightItem>) => void;
  questionRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export const AustralianVisaFlowChart: React.FC<SpecialBlockProps> = ({
  questions,
  userAnswers,
  onAnswerChange,
  highlights,
  onRemoveHighlight,
  onUpdateHighlight,
  questionRefs,
}) => {
  const getQ = (num: number) => questions.find((item) => item.q.questionNumber === num);

  const renderInput = (qNum: number, placeholder = '', maxWidth = '220px') => {
    const item = getQ(qNum);
    if (!item) return null;
    const { q, index } = item;
    const value = userAnswers[q.id] || '';

    return (
      <span
        ref={(el) => {
          if (questionRefs && questionRefs.current) {
            questionRefs.current[index] = el as unknown as HTMLDivElement;
          }
        }}
        data-highlight-context={`question_${q.id}`}
        className="inline-flex items-center gap-1.5 mx-1.5 align-middle select-text"
      >
        <span className="w-6 h-6 border border-[#00529b] text-[#00529b] text-xs font-bold flex items-center justify-center shrink-0 rounded-xs bg-white shadow-2xs">
          {q.questionNumber}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onAnswerChange(q.id, e.target.value)}
          placeholder={placeholder || String(q.questionNumber)}
          style={{ maxWidth }}
          className="border-2 border-slate-700 bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] px-2.5 py-1 text-sm rounded-sm shadow-inner transition-colors"
        />
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-2 px-1 select-text">
      {/* Title banner */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
          Online Application Process
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Complete the flow-chart below with NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage.
        </p>
      </div>

      <div className="flex flex-col items-center w-full space-y-4">
        {/* STEP 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full items-center">
          <div className="md:col-span-8 bg-white border-2 border-slate-800 rounded-lg p-4 shadow-sm">
            <span className="font-bold text-slate-900 text-[15px]">
              (i) Complete the onscreen questionnaire to confirm you have chosen the correct type of visa for your circumstances.
            </span>
          </div>

          <div className="md:col-span-4 bg-amber-50/80 border-2 border-amber-300 rounded-lg p-3 text-xs flex items-start gap-2 shadow-xs">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-black text-sm shrink-0">
              !
            </div>
            <div className="leading-relaxed text-slate-900">
              <strong className="block text-slate-950 font-black uppercase tracking-wider text-[11px] mb-1">
                REMEMBER !
              </strong>
              Not all types of visa application can be accessed {renderInput(27, 'online / over...', '170px')}.
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center w-full py-0.5">
          <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-full shadow-sm">
            <ArrowDown className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        {/* STEP 2 */}
        <div className="w-full">
          <div className="bg-white border-2 border-slate-800 rounded-lg p-4 shadow-sm text-[15px] leading-relaxed text-slate-900">
            <strong>(ii) Click Apply Online.</strong> Read the guidelines on Page 1 on how to apply carefully. Then, to start the actual application process, tick the{' '}
            {renderInput(28, 'I Agree box', '160px')} once you have familiarised yourself with, and if you accept, the{' '}
            {renderInput(29, 'terms and conditions', '190px')}.
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center w-full py-0.5">
          <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-full shadow-sm">
            <ArrowDown className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        {/* STEP 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full items-center">
          <div className="md:col-span-7 bg-white border-2 border-slate-800 rounded-lg p-4 shadow-sm text-[15px] leading-relaxed text-slate-900">
            <strong>(iii) You are now in the main application form.</strong> You will have to fill in information on between 5 and 9 short screens, depending on which visa you want. Fill in the form carefully and answer all questions{' '}
            {renderInput(30, 'truly and honestly', '180px')}.
          </div>

          <div className="md:col-span-5 bg-amber-50/80 border-2 border-amber-300 rounded-lg p-3 text-xs flex items-start gap-2 shadow-xs">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-black text-sm shrink-0">
              !
            </div>
            <div className="leading-relaxed text-slate-900">
              <strong className="block text-slate-950 font-black uppercase tracking-wider text-[11px] mb-1">
                REMEMBER !
              </strong>
              Allow yourself approximately {renderInput(31, '40 minutes', '140px')} at most to complete the form, or 4 minutes for{' '}
              {renderInput(32, 'each screen', '140px')}.
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center w-full py-0.5">
          <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-full shadow-sm">
            <ArrowDown className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        {/* STEP 4 */}
        <div className="w-full">
          <div className="bg-white border-2 border-slate-800 rounded-lg p-4 shadow-sm text-[15px] leading-relaxed text-slate-900">
            <strong>(iv)</strong> {renderInput(33, 'Review', '140px')} the details you have entered and, if you wish, print a copy of the application for your{' '}
            {renderInput(34, 'reference', '140px')}.
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center w-full py-0.5">
          <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-full shadow-sm">
            <ArrowDown className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        {/* STEP 5 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full items-center">
          <div className="md:col-span-8 bg-white border-2 border-slate-800 rounded-lg p-4 shadow-sm text-[15px] leading-relaxed text-slate-900">
            <strong>(v) Wait to be</strong> {renderInput(35, 'prompted', '150px')} , then enter your payment information. Record your{' '}
            {renderInput(36, 'Transaction ref #', '220px')} , which will be generated once your bank has accepted the payment request. Now click <em>Submit</em> and your application has gone through.
          </div>

          <div className="md:col-span-4 bg-amber-50/80 border-2 border-amber-300 rounded-lg p-3 text-xs flex items-start gap-2 shadow-xs">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-black text-sm shrink-0">
              !
            </div>
            <div className="leading-relaxed text-slate-900">
              <strong className="block text-slate-950 font-black uppercase tracking-wider text-[11px] mb-1">
                REMEMBER !
              </strong>
              If applying from overseas, you may be prompted to download and complete certain health forms. Follow any requirements stipulated.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DearDiarySchedule: React.FC<SpecialBlockProps> = ({
  questions,
  userAnswers,
  onAnswerChange,
  questionRefs,
}) => {
  const getQ = (num: number) => questions.find((item) => item.q.questionNumber === num);

  const renderInput = (qNum: number, placeholder = '', width = 'w-44') => {
    const item = getQ(qNum);
    if (!item) return null;
    const { q, index } = item;
    const value = userAnswers[q.id] || '';

    return (
      <span
        ref={(el) => {
          if (questionRefs && questionRefs.current) {
            questionRefs.current[index] = el as unknown as HTMLDivElement;
          }
        }}
        data-highlight-context={`question_${q.id}`}
        className="inline-flex items-center gap-1.5 mx-1.5 align-middle select-text"
      >
        <span className="w-6 h-6 border border-[#00529b] text-[#00529b] text-xs font-bold flex items-center justify-center shrink-0 rounded-xs bg-white shadow-2xs">
          {q.questionNumber}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onAnswerChange(q.id, e.target.value)}
          placeholder={placeholder || String(q.questionNumber)}
          className={`border-b-2 border-slate-700 bg-transparent text-black font-bold focus:outline-none focus:border-[#00529b] px-2 py-0.5 text-sm ${width} transition-colors`}
        />
      </span>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-2 p-6 bg-[#fbf9f4] border-2 border-slate-700 rounded-xl shadow-md font-sans select-text">
      {/* Header with calendar date and title */}
      <div className="flex items-center justify-between border-b-2 border-slate-700 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-md text-center shadow-xs">
            <span className="text-[11px] font-bold block uppercase tracking-wider">NOV</span>
            <span className="text-xl font-black block leading-none">14</span>
          </div>
          <h3 className="text-2xl font-serif italic text-slate-800 tracking-tight">
            Dear Diary
          </h3>
        </div>
        <div className="text-right text-xs text-slate-600 bg-white/80 border border-slate-300 px-3 py-1.5 rounded-md">
          <span className="text-slate-400 block font-semibold uppercase text-[10px]">Example</span>
          <span className="font-bold text-slate-800">Venue: New Malden Theatre</span>
        </div>
      </div>

      {/* Main performance schedule details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px] text-slate-800">
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-24 font-bold text-slate-600">Show:</span>
            {renderInput(1, 'Lions and Penguins', 'w-48')}
          </div>

          <div className="flex items-start">
            <span className="w-24 font-bold text-slate-600 pt-1">Seats:</span>
            <div className="flex-1">
              {renderInput(2, 'Royal Circle', 'w-40')}
              <span className="text-xs text-slate-500 block mt-1 ml-2 font-medium">Row 1, B, C and D</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Start time:</span>
              <span className="font-bold text-slate-800">2:00 p.m.</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {renderInput(3, 'Interval', 'w-32')}
                <span className="font-semibold text-slate-600">:</span>
              </div>
              <span className="font-bold text-slate-800">3:00 p.m.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Finish time:</span>
              <span className="font-bold text-slate-800">4:15 p.m.</span>
            </div>
          </div>
        </div>

        {/* Right column: Pricing and Terms */}
        <div className="space-y-3 border-l-0 md:border-l border-slate-200 md:pl-6">
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-bold text-slate-700 w-28">Ticket (£):</span>
              <span className="font-bold text-slate-900 mr-2">45.00</span>
              {renderInput(4, 'per person', 'w-36')}
            </div>

            <div className="flex items-center">
              <span className="font-bold text-slate-700 w-28">Total Price (£):</span>
              <span className="font-bold text-slate-900 mr-2">90.00</span>
              <div className="flex items-center text-xs">
                <span>(</span>
                {renderInput(5, 'buy two get', 'w-32')}
                <span>one free)</span>
              </div>
            </div>
          </div>

          {/* Remember section */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs space-y-2 mt-3">
            <strong className="block text-amber-900 font-black uppercase tracking-wider text-[11px]">
              Remember!
            </strong>
            <ul className="space-y-1.5 text-slate-700 leading-relaxed">
              <li className="flex items-center flex-wrap">
                <span>• £30 cancellation fee for cancellations within 10 days of the</span>
                {renderInput(6, 'performance', 'w-36')}
              </li>
              <li className="flex items-center flex-wrap">
                <span>• Dates are not</span>
                {renderInput(7, 'flexible', 'w-32')}
              </li>
              <li className="flex items-center flex-wrap">
                <span>•</span>
                {renderInput(8, '£10 charge', 'w-32')}
                <span>per seat to change your seating arrangements</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BankChequeForm: React.FC<SpecialBlockProps> = ({
  questions,
  userAnswers,
  onAnswerChange,
  questionRefs,
}) => {
  const getQ = (num: number) => questions.find((item) => item.q.questionNumber === num);

  const renderInput = (qNum: number, placeholder = '', width = 'w-64') => {
    const item = getQ(qNum);
    if (!item) return null;
    const { q, index } = item;
    const value = userAnswers[q.id] || '';

    return (
      <span
        ref={(el) => {
          if (questionRefs && questionRefs.current) {
            questionRefs.current[index] = el as unknown as HTMLDivElement;
          }
        }}
        data-highlight-context={`question_${q.id}`}
        className="inline-flex items-center gap-1.5 mx-1.5 align-middle select-text"
      >
        <span className="w-6 h-6 border border-[#00529b] text-[#00529b] text-xs font-bold flex items-center justify-center shrink-0 rounded-xs bg-white shadow-2xs">
          {q.questionNumber}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onAnswerChange(q.id, e.target.value)}
          placeholder={placeholder || String(q.questionNumber)}
          className={`border-b-2 border-slate-700 bg-transparent text-black font-bold focus:outline-none focus:border-[#00529b] px-2 py-0.5 text-sm ${width} transition-colors`}
        />
      </span>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-2 p-6 bg-[#f4f7f6] border-2 border-slate-600 rounded-lg shadow-md font-sans select-text">
      {/* Top row */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
        <div>
          <span className="font-bold text-slate-900 text-base tracking-wide block uppercase">
            John and Amanda Houghton
          </span>
          <span className="text-[11px] text-slate-500 font-mono">ACCOUNT HOLDER #482910</span>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-lg text-slate-700">1001</span>
          <span className="text-[10px] text-slate-400 block uppercase">Cheque No.</span>
        </div>
      </div>

      {/* Pay to order and Date */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center flex-wrap flex-1">
            <span className="font-black text-slate-700 text-xs uppercase tracking-wider mr-2">
              PAY TO THE ORDER OF:
            </span>
            {renderInput(9, 'Starr Theatre Bookings', 'w-72')}
          </div>

          <div className="flex items-center text-xs font-bold text-slate-600">
            <span>DATE:</span>
            <span className="ml-2 border-b-2 border-slate-500 w-32 inline-block text-center font-mono text-slate-800">
              14 / 11 / 2026
            </span>
          </div>
        </div>

        {/* Amount line */}
        <div className="flex items-center justify-between bg-white border border-slate-300 p-3 rounded-md">
          <span className="font-serif italic font-bold text-slate-800 text-sm">
            Ninety pounds only
          </span>
          <div className="bg-slate-100 border border-slate-400 px-3 py-1 font-mono font-black text-base text-slate-900 rounded-sm">
            £ 90.00 <span className="text-xs font-sans font-bold text-slate-600">GBP</span>
          </div>
        </div>

        {/* Bottom memo & signature line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center">
            <span className="font-black text-slate-700 text-xs uppercase tracking-wider mr-2">
              MEMO Booking Ref:
            </span>
            {renderInput(10, 'BUKTHTR14582', 'w-48')}
          </div>

          <div className="text-right">
            <div className="font-serif italic text-lg text-slate-800 border-b-2 border-slate-600 px-4 inline-block">
              J. Houghton
            </div>
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              AUTHORIZED SIGNATURE(S)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
