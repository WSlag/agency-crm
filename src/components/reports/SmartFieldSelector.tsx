import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Info,
  Calendar,
  DollarSign,
  Hash,
  Type,
  ToggleLeft,
  Percent,
} from 'lucide-react';
import { FieldSchema } from '../../config/reportFieldSchemas';

interface SmartFieldSelectorProps {
  value: string;
  onChange: (value: string) => void;
  reportType: string;
  availableFields: FieldSchema[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  showAdvancedToggle?: boolean;
}

const getFieldTypeIcon = (type: string) => {
  switch (type) {
    case 'date':
      return <Calendar className="w-4 h-4 text-blue-500" />;
    case 'currency':
      return <DollarSign className="w-4 h-4 text-green-500" />;
    case 'number':
      return <Hash className="w-4 h-4 text-purple-500" />;
    case 'percentage':
      return <Percent className="w-4 h-4 text-orange-500" />;
    case 'boolean':
      return <ToggleLeft className="w-4 h-4 text-indigo-500" />;
    default:
      return <Type className="w-4 h-4 text-gray-500" />;
  }
};

export const SmartFieldSelector: React.FC<SmartFieldSelectorProps> = ({
  value,
  onChange,
  reportType,
  availableFields,
  placeholder = 'Select or type a field...',
  label,
  required = false,
  showAdvancedToggle = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Get common fields for quick access
  const commonFields = useMemo(
    () => availableFields.filter((f) => f.common),
    [availableFields]
  );

  // Filter fields based on search query
  const filteredFields = useMemo(() => {
    if (!searchQuery) return isAdvancedMode ? availableFields : commonFields;

    const query = searchQuery.toLowerCase();
    return availableFields.filter(
      (field) =>
        field.label.toLowerCase().includes(query) ||
        field.value.toLowerCase().includes(query) ||
        field.description.toLowerCase().includes(query)
    );
  }, [searchQuery, availableFields, commonFields, isAdvancedMode]);

  // Group fields by category
  const groupedFields = useMemo(() => {
    const groups: Record<string, FieldSchema[]> = {};
    filteredFields.forEach((field) => {
      const category = field.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(field);
    });
    return groups;
  }, [filteredFields]);

  // Get selected field details
  const selectedField = useMemo(
    () => availableFields.find((f) => f.value === value),
    [value, availableFields]
  );

  const handleSelect = (fieldValue: string) => {
    onChange(fieldValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleManualInput = (inputValue: string) => {
    onChange(inputValue);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Main Input/Display */}
        {isAdvancedMode ? (
          // Advanced mode: Free text input
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => handleManualInput(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Type className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ) : (
          // Standard mode: Dropdown selector
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 text-left">
              {selectedField ? (
                <>
                  {getFieldTypeIcon(selectedField.type)}
                  <span className="font-medium">{selectedField.label}</span>
                  <span className="text-xs text-gray-500">
                    ({selectedField.value})
                  </span>
                </>
              ) : (
                <span className="text-gray-400">{placeholder}</span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}

        {/* Dropdown Menu */}
        {isOpen && !isAdvancedMode && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-hidden">
            {/* Search Box */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fields..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Field List */}
            <div className="overflow-y-auto max-h-80">
              {Object.keys(groupedFields).length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No fields found matching "{searchQuery}"
                </div>
              ) : (
                Object.entries(groupedFields).map(([category, fields]) => (
                  <div key={category}>
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        {category}
                      </span>
                    </div>
                    {fields.map((field) => (
                      <button
                        key={field.value}
                        type="button"
                        onClick={() => handleSelect(field.value)}
                        onMouseEnter={() => setShowTooltip(field.value)}
                        onMouseLeave={() => setShowTooltip(null)}
                        className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-blue-50 transition-colors text-left relative ${
                          value === field.value ? 'bg-blue-100' : ''
                        }`}
                      >
                        {getFieldTypeIcon(field.type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">
                            {field.label}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {field.value}
                          </div>
                        </div>
                        <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />

                        {/* Tooltip */}
                        {showTooltip === field.value && (
                          <div className="absolute left-full ml-2 top-0 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-md shadow-lg pointer-events-none">
                            <div className="font-semibold mb-1">
                              {field.label}
                            </div>
                            <div className="text-gray-300">
                              {field.description}
                            </div>
                            <div className="mt-2 text-gray-400">
                              Field: <code className="text-blue-300">{field.value}</code>
                            </div>
                            <div className="text-gray-400">
                              Type: <span className="capitalize">{field.type}</span>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Show All Fields Toggle */}
            {!searchQuery && commonFields.length < availableFields.length && (
              <div className="p-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdvancedMode(false);
                    setSearchQuery('advanced');
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Show all {availableFields.length} fields
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Mode Toggle */}
      {showAdvancedToggle && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAdvancedMode(!isAdvancedMode);
              setIsOpen(false);
            }}
            className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <ToggleLeft
              className={`w-4 h-4 ${
                isAdvancedMode ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
            <span>
              {isAdvancedMode
                ? 'Switch to dropdown mode'
                : 'Advanced: Type custom field name'}
            </span>
          </button>
          {isAdvancedMode && (
            <div className="text-xs text-gray-500 italic">
              Enter exact database field name
            </div>
          )}
        </div>
      )}

      {/* Selected Field Info */}
      {selectedField && !isAdvancedMode && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600">
              <span className="font-medium">{selectedField.label}:</span>{' '}
              {selectedField.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
