import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Agent {
  id: string;
  agentName: string;
  email?: string;
  contactNumber?: string;
  branchId?: string;
}

interface SearchableAgentSelectProps {
  agents: Agent[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableAgentSelect: React.FC<SearchableAgentSelectProps> = ({
  agents,
  value,
  onChange,
  onBlur,
  placeholder = 'Search agents...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected agent display name
  const selectedAgent = agents.find((a) => a.id === value);
  const displayValue = selectedAgent ? selectedAgent.agentName : 'All Agents';

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) {
      return agents.sort((a, b) => a.agentName.localeCompare(b.agentName));
    }

    const query = searchQuery.toLowerCase();
    return agents
      .filter((agent) => {
        const nameMatch = agent.agentName.toLowerCase().includes(query);
        const emailMatch = agent.email?.toLowerCase().includes(query);
        const contactMatch = agent.contactNumber?.toLowerCase().includes(query);
        return nameMatch || emailMatch || contactMatch;
      })
      .sort((a, b) => a.agentName.localeCompare(b.agentName));
  }, [agents, searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (agentId: string) => {
    onChange(agentId);
    setIsOpen(false);
    setSearchQuery('');
    onBlur?.();
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white text-left flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border-2 border-indigo-300 rounded-lg shadow-xl max-h-80 overflow-hidden animate-fadeIn">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm transition-all"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {/* All Agents Option */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full text-left px-4 py-3 transition-colors duration-150 flex items-center space-x-3 ${
                !value
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-500'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <UserCircleIcon className="h-5 w-5 text-gray-400" />
              <span>All Agents</span>
            </button>

            {/* Filtered Agents */}
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => handleSelect(agent.id)}
                  className={`w-full text-left px-4 py-3 transition-colors duration-150 group ${
                    value === agent.id
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-500'
                      : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <UserCircleIcon className={`h-5 w-5 mt-0.5 ${
                      value === agent.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        value === agent.id ? 'text-indigo-700' : 'text-gray-900'
                      }`}>
                        {agent.agentName}
                      </div>
                      {agent.email && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {agent.email}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <UserCircleIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">No agents found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>

          {/* Footer with count */}
          {filteredAgents.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Showing {filteredAgents.length} of {agents.length} agent{agents.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
