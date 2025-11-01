import React, { useState } from 'react';
import { DATE_PRESETS } from '../../config/reportFieldSchemas';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DatePresetSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DatePresetSelector: React.FC<DatePresetSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Enter date or select preset...'
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handlePresetSelect = (presetValue: string, presetLabel: string) => {
    setInputValue(presetLabel);
    onChange(presetValue);
    setShowPresets(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleInputFocus = () => {
    setShowPresets(true);
  };

  const handleInputBlur = () => {
    // Delay to allow clicking on preset
    setTimeout(() => setShowPresets(false), 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>

      {showPresets && (
        <div className="absolute z-10 mt-1 w-full bg-white border-2 border-indigo-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">
              Quick Presets
            </div>
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  handlePresetSelect(preset.value, preset.label);
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                      {preset.label}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-indigo-600">
                      {preset.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <div className="text-xs text-gray-600 px-2">
              💡 Tip: You can also type a custom date (e.g., 2024-01-15)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
