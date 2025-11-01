import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  BookOpen,
  Video,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Search,
  Play,
} from 'lucide-react';
import { resetTour } from './OnboardingTour';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartTour: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is the difference between filters and metrics?',
    answer:
      'Filters determine WHICH data to include in your report (like "show only this month\'s data" or "only Main branch"). Metrics determine WHAT to calculate from that data (like "count applicants" or "sum expenses").',
    category: 'Basics',
  },
  {
    question: 'How do I create a date range filter?',
    answer:
      'Select a date field, choose the "Between" operator, then enter your start and end dates. Or use Quick Presets like "This Month" or "Last Quarter" for faster setup.',
    category: 'Filters',
  },
  {
    question: 'When should I use Sum vs Average?',
    answer:
      'Use SUM when you want the total (e.g., total revenue = $50,000). Use AVERAGE when you want the mean value (e.g., average salary = $3,500). Sum adds all values together, Average divides the sum by count.',
    category: 'Metrics',
  },
  {
    question: 'Can I save a report as a template?',
    answer:
      'Yes! After creating a report, click "Save as Template" to reuse it later. You can find your templates in the "My Templates" section at the top of the builder.',
    category: 'Templates',
  },
  {
    question: 'What does "Group By" do?',
    answer:
      'Group By organizes your results into categories. For example, grouping by "Branch" shows separate totals for each branch, rather than one grand total.',
    category: 'Advanced',
  },
  {
    question: 'How do schedules work?',
    answer:
      'Schedules automatically generate and email your report at regular intervals (daily, weekly, monthly). Perfect for reports you need to check regularly.',
    category: 'Schedules',
  },
  {
    question: 'Why can\'t I select certain fields?',
    answer:
      'Available fields depend on your selected Report Type. For example, "Officer Performance" reports have officer-specific fields, while "Financial Reports" have expense/commission fields.',
    category: 'Troubleshooting',
  },
  {
    question: 'What export formats are available?',
    answer:
      'You can export reports as CSV (for Excel), PDF (for presentations), or Excel (with formatting). Choose based on how you plan to use the data.',
    category: 'Export',
  },
];

const FIELD_GLOSSARY = [
  {
    term: 'Applicant Name',
    definition: 'Full name of the job applicant',
    reportTypes: ['Transfer Analytics', 'Deployment', 'Applicant Status'],
  },
  {
    term: 'Branch',
    definition: 'Agency branch location',
    reportTypes: ['All reports'],
  },
  {
    term: 'Commission',
    definition: 'Fee earned from successful placements',
    reportTypes: ['Financial', 'Officer Performance'],
  },
  {
    term: 'Deployment Date',
    definition: 'When applicant started work abroad',
    reportTypes: ['Deployment Reports'],
  },
  {
    term: 'Processing Time',
    definition: 'Days taken to complete an application or transfer',
    reportTypes: ['Transfer Analytics', 'Applicant Status'],
  },
  {
    term: 'Target Achievement',
    definition: 'Percentage of recruitment goal reached',
    reportTypes: ['Officer Performance', 'Branch Performance'],
  },
];

const EXAMPLE_REPORTS = [
  {
    title: 'Monthly Branch Revenue',
    description: 'Track revenue by branch for the current month',
    steps: [
      'Select Report Type: "Financial Reports"',
      'Add Filter: Transaction Date = "This Month"',
      'Add Metric: Sum of Commission Amount',
      'Group By: Branch Name',
    ],
  },
  {
    title: 'Top Performing Officers',
    description: 'Find officers who exceeded their targets',
    steps: [
      'Select Report Type: "Officer Performance"',
      'Add Filter: Target Achievement > 100',
      'Add Metric: Count of Recruitments',
      'Sort By: Commission Earned (Descending)',
    ],
  },
  {
    title: 'Pending Transfer Analysis',
    description: 'See how many transfers are still in progress',
    steps: [
      'Select Report Type: "Transfer Analytics"',
      'Add Filter: Status = "Pending"',
      'Add Metric: Count of Transfers',
      'Add Metric: Average Processing Time',
    ],
  },
];

export const HelpCenter: React.FC<HelpCenterProps> = ({
  isOpen,
  onClose,
  onRestartTour,
}) => {
  const [activeTab, setActiveTab] = useState<
    'guide' | 'faq' | 'glossary' | 'examples'
  >('guide');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredFAQs = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestartTour = () => {
    resetTour();
    onClose();
    onRestartTour();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Help Center</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'guide'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Quick Start
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'faq'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'glossary'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Glossary
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'examples'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lightbulb className="w-4 h-4 inline mr-2" />
            Examples
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Start Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  First Time Here?
                </h3>
                <p className="text-blue-800 mb-3">
                  Take our interactive tour to learn the basics!
                </p>
                <button
                  onClick={handleRestartTour}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Interactive Tour
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  How to Build a Report
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <div>
                      <strong>Choose Report Type</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Select what kind of data you want to report on (e.g.,
                        Officer Performance, Financial, Deployments).
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <div>
                      <strong>Add Filters (What to Include)</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Narrow down your data by adding conditions like "This
                        Month" or "Main Branch Only". Think of it as answering
                        "Which records do I want?"
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <div>
                      <strong>Add Metrics (What to Calculate)</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Specify what numbers you want to see: counts, sums,
                        averages, etc. Think of it as answering "What do I want
                        to measure?"
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <div>
                      <strong>Preview & Create</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Check the live preview to make sure it looks right, then
                        click "Create Report"!
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  💡 Pro Tips
                </h4>
                <ul className="space-y-2 text-yellow-800 text-sm">
                  <li>• Use date presets like "This Month" for quick filtering</li>
                  <li>• Hover over field names to see descriptions</li>
                  <li>• Save frequently used reports as templates</li>
                  <li>• Toggle to "Advanced Mode" if you know exact field names</li>
                </ul>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* FAQ List */}
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questions found matching "{searchQuery}"
                </div>
              ) : (
                filteredFAQs.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === index ? null : index)
                      }
                      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-left">
                        {item.question}
                      </span>
                      {expandedFAQ === index ? (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 py-3 bg-white">
                        <p className="text-gray-700">{item.answer}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Category: {item.category}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Glossary */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Common fields and their meanings across different report types.
              </p>
              {FIELD_GLOSSARY.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {item.term}
                  </h4>
                  <p className="text-gray-700 mb-2">{item.definition}</p>
                  <div className="text-xs text-gray-500">
                    Used in: {item.reportTypes.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Examples */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Follow these step-by-step examples to create common reports.
              </p>
              {EXAMPLE_REPORTS.map((example, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {example.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {example.description}
                  </p>
                  <div className="space-y-2">
                    {example.steps.map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                          {stepIndex + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
