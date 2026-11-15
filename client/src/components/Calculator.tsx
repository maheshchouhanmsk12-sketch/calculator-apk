import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calculator as CalculatorIcon, Hash, Percent, RotateCcw, Zap } from 'lucide-react';
import { InputField } from './InputField';
import { AnswerField } from './AnswerField';
import { calculatePercentage } from '../utils/calculator';

export const Calculator: React.FC = () => {
  // All three fields are strictly initialized as completely blank strings
  const [number, setNumber] = useState<string>('');
  const [percentage, setPercentage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const numberInputRef = useRef<HTMLInputElement>(null);

  // Real-time calculation triggered automatically whenever number or percentage state changes
  const answer = useMemo(() => {
    return calculatePercentage(number, percentage);
  }, [number, percentage]);

  // Reset copied feedback if the calculated answer changes
  useEffect(() => {
    setCopied(false);
  }, [answer]);

  // Reset functionality: clears all fields and refocuses the number input
  const handleClear = () => {
    setNumber('');
    setPercentage('');
    setCopied(false);
    if (numberInputRef.current) {
      numberInputRef.current.focus();
    }
  };

  // Copy answer to clipboard handler
  const handleCopy = async () => {
    if (!answer) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(answer);
      } else {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = answer;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const hasAnyInput = number !== '' || percentage !== '';

  return (
    <div className="w-full max-w-md mx-auto animate-card-entrance">
      {/* Premium Purple & Blue Glassmorphism Calculator Card */}
      <div className="relative bg-white/80 backdrop-blur-2xl border border-white/90 rounded-[28px] sm:rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(112,68,229,0.18)] ring-1 ring-purple-100/70 transition-all duration-300">
        
        {/* Header Design */}
        <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-purple-100/80">
          {/* Premium calculator icon inside purple-blue gradient square */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/50 shrink-0">
            <CalculatorIcon size={24} className="stroke-[2.2]" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Percentage Calculator
            </h1>
            <p className="text-xs sm:text-sm font-medium text-purple-900/60 mt-0.5">
              Enter two values and get instant result.
            </p>
          </div>
        </div>

        {/* The Exact 3 Fields Container */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Field 1: Number */}
          <InputField
            id="number-input"
            label="Number"
            value={number}
            placeholder="Enter number..."
            icon={<Hash size={16} className="stroke-[2.8]" />}
            onChange={setNumber}
            inputRef={numberInputRef}
            autoFocus
          />

          {/* Field 2: Percentage (%) */}
          <InputField
            id="percentage-input"
            label="Percentage (%)"
            value={percentage}
            placeholder="Enter percentage..."
            icon={<Percent size={16} className="stroke-[2.8]" />}
            suffix="%"
            onChange={setPercentage}
          />

          {/* Field 3: Answer Section (Main Visual Highlight) */}
          <div className="pt-1">
            <AnswerField
              value={answer}
              onCopy={handleCopy}
              isCopied={copied}
            />
          </div>

          {/* Full-width Redesigned Clear Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasAnyInput}
              title="Clear all fields"
              aria-label="Clear all input fields"
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer ${
                hasAnyInput
                  ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 hover:from-slate-800 hover:to-purple-800 text-white shadow-lg shadow-purple-950/20 hover:shadow-purple-950/30 active:scale-[0.98]'
                  : 'bg-slate-200/80 text-slate-400 border border-slate-200/50 cursor-not-allowed opacity-60'
              }`}
            >
              <RotateCcw size={16} className={`stroke-[2.5] ${hasAnyInput ? 'text-purple-300' : 'text-slate-400'}`} />
              <span>Clear</span>
            </button>
          </div>

          {/* Subtle Decorative Footer */}
          <div className="flex items-center justify-center gap-3 pt-4 mt-1 border-t border-purple-100/70 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-purple-900/50 select-none">
            <div className="h-px bg-gradient-to-r from-transparent to-purple-200/80 flex-1" />
            <div className="flex items-center gap-1.5 shrink-0">
              <Zap size={13} className="text-amber-500 fill-amber-500/40 stroke-[2.5]" />
              <span>Simple • Fast • Accurate</span>
            </div>
            <div className="h-px bg-gradient-to-l from-transparent to-purple-200/80 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
