import React from 'react';
import { isValidNumberInput } from '../utils/calculator';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  suffix?: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  placeholder,
  icon,
  suffix,
  onChange,
  autoFocus,
  inputRef,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Strictly enforce valid numeric characters and partial typing states
    if (isValidNumberInput(val)) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 select-none"
      >
        {label}
      </label>

      {/* Large white translucent input surface with soft lavender border and purple glow */}
      <div className="group relative flex items-center bg-white/95 hover:bg-white border border-purple-100/90 hover:border-purple-200/90 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/12 focus-within:shadow-[0_4px_20px_rgba(168,85,247,0.15)] rounded-2xl p-2 pl-3 transition-all duration-200 shadow-sm shadow-purple-900/5">
        {/* Purple circular icon badge */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-100 via-purple-50 to-indigo-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200/60 shadow-xs transition-transform duration-200 group-focus-within:scale-105">
          {icon}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full bg-transparent px-3 py-1.5 text-slate-900 text-lg sm:text-xl font-bold font-mono-numbers placeholder:text-slate-400 placeholder:font-normal outline-none"
        />

        {suffix && (
          <span className="text-purple-600/70 font-bold text-base px-2.5 select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};
