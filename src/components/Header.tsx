import React from 'react';
import { Wifi, Bell, Menu, Monitor } from 'lucide-react';

interface HeaderProps {
  candidateName: string;
  candidateId: string;
  onAdminClick?: () => void;
  onFinishTest?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  candidateName,
  candidateId,
  onAdminClick,
  onFinishTest,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 select-none sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Brand Logo & Test Taker Info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-start text-red-600">
            <span className="font-extrabold text-3xl tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>IELTS</span>
            <span className="text-[10px] mt-1 ml-0.5">TM</span>
          </div>
          <div className="text-sm font-bold text-black mt-1 cursor-default">
            Test taker ID
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-6 text-black">
          <button type="button" className="hover:opacity-70 transition-opacity">
            <Wifi className="w-5 h-5" />
          </button>
          <button type="button" className="hover:opacity-70 transition-opacity">
            <Bell className="w-5 h-5" />
          </button>
          <button type="button" className="hover:opacity-70 transition-opacity">
            <Menu className="w-5 h-5" />
          </button>
          <button type="button" className="hover:opacity-70 transition-opacity">
            <Monitor className="w-5 h-5" />
          </button>
          {onFinishTest && (
            <button
              onClick={onFinishTest}
              className="ml-4 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded shadow transition-colors"
            >
              Finish Test
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
