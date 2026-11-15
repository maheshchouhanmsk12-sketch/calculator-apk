import React from 'react';
import { Equal, Copy, Check } from 'lucide-react';

interface AnswerFieldProps {
  value: string;
  onCopy: () => void;
  isCopied: boolean;
}

export const AnswerField: React.FC<AnswerFieldProps> = ({
  value,
  onCopy,
  isCopied,
}) => {
  const hasAnswer = value.trim() !== '';

  return (
    <div className="flex flex-col w-full relative">
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor="answer-display"
          className="text-xs font-bold uppercase tracking-wider text-slate-600 select-none"
        >
          Answer
        </label>
        {isCopied && (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in">
            <Check size={13} className="stroke-[3]" />
            Copied to clipboard
          </span>
        )}
      </div>

      {/* Main Visual Highlight: Soft Blue-to-Purple Gradient Glass Display */}
      <div className="relative flex items-center bg-gradient-to-r from-blue-50/95 via-indigo-50/90 to-purple-50/95 border border-blue-200/80 rounded-2xl p-2.5 sm:p-3 shadow-inner shadow-purple-950/5 transition-all duration-300">
        
        {/* Equal icon inside purple-blue gradient circle */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25 border border-white/40">
          <Equal size={22} className="stroke-[2.8]" />
        </div>

        {/* Read-only centered prominent answer display */}
        <input
          id="answer-display"
          type="text"
          readOnly
          tabIndex={-1}
          value={value}
          placeholder=""
          aria-readonly="true"
          className="w-full bg-transparent px-3 py-1 text-center font-extrabold font-mono-numbers text-2xl sm:text-3xl text-purple-950 placeholder:text-purple-300/60 outline-none cursor-default select-all transition-all duration-200"
        />

        {/* Copy action positioned on the right - ONLY visible when answer exists */}
        <div className="w-11 h-11 flex items-center justify-center shrink-0">
          {hasAnswer && (
            <button
              type="button"
              onClick={onCopy}
              title="Copy answer"
              aria-label="Copy calculated answer"
              className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
                isCopied
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-sm'
                  : 'bg-white/90 hover:bg-white text-purple-700 hover:text-purple-900 border border-purple-200/70 shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
              }`}
            >
              {isCopied ? (
                <Check size={18} className="stroke-[2.5]" />
              ) : (
                <Copy size={18} className="stroke-[2.2]" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
