import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface OnboardingTourProps {
  onComplete?: () => void;
}

export const useOnboardingTour = ({ onComplete }: OnboardingTourProps = {}) => {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: '#report-builder-header',
          popover: {
            title: 'Welcome to Report Builder! 🎉',
            description:
              'This powerful tool lets you create custom reports with filters, metrics, and schedules. Let me show you around!',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#quick-reports-section',
          popover: {
            title: 'Quick Reports',
            description:
              'These are pre-built reports ready to use. Click "View Report" to see the data, or "Use as Template" to customize them in the builder below.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#basic-info-section',
          popover: {
            title: 'Step 1: Basic Information',
            description:
              'Start by giving your report a name and selecting the type. The type determines what data fields will be available.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#report-name-input',
          popover: {
            title: 'Report Name',
            description:
              'Choose a descriptive name like "Monthly Branch Performance" or "Q1 Financial Summary".',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#report-type-select',
          popover: {
            title: 'Report Type',
            description:
              'Select what you want to report on. Each type has specific fields available for filtering and calculations.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#filters-section',
          popover: {
            title: 'Step 2: Filters (What data to include)',
            description:
              'Filters help you narrow down your data. For example, "Branch equals Main" or "Date between Jan 1 and Mar 31".',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#add-filter-button',
          popover: {
            title: 'Adding Filters',
            description:
              'Click here to add a filter. You can add as many as you need. Common filters include date ranges, branches, statuses, etc.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#metrics-section',
          popover: {
            title: 'Step 3: Metrics (What to calculate)',
            description:
              'Metrics are the calculations you want to see in your report. Examples: "Count of Applicants", "Sum of Expenses", "Average Salary".',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#add-metric-button',
          popover: {
            title: 'Adding Metrics',
            description:
              'Click here to add metrics. Choose what you want to calculate (count, sum, average) and which field to calculate on.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#schedule-section',
          popover: {
            title: 'Step 4: Schedule (Optional)',
            description:
              'Want this report automatically? Set up a schedule to receive it daily, weekly, or monthly via email.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#preview-section',
          popover: {
            title: 'Live Preview',
            description:
              'As you build your report, this preview shows sample data so you can see what your report will look like before creating it.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#help-button',
          popover: {
            title: 'Need Help?',
            description:
              'Click this button anytime to access the help center with guides, examples, and FAQs. You can also restart this tour from there!',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#create-report-button',
          popover: {
            title: "You're All Set! 🚀",
            description:
              'Once you\'ve configured your filters and metrics, click here to generate your report. Happy reporting!',
            side: 'top',
            align: 'start',
          },
        },
      ],
      onDestroyStarted: () => {
        driverObj.destroy();
        onComplete?.();
      },
    });

    driverObj.drive();
  };

  return { startTour };
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  onComplete,
}) => {
  const { startTour } = useOnboardingTour({ onComplete });

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('reportBuilderTourCompleted');

    if (!hasSeenTour) {
      // Delay to ensure all elements are rendered
      const timer = setTimeout(() => {
        startTour();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};

// Helper to mark tour as completed
export const markTourCompleted = () => {
  localStorage.setItem('reportBuilderTourCompleted', 'true');
};

// Helper to reset tour (for testing or user request)
export const resetTour = () => {
  localStorage.removeItem('reportBuilderTourCompleted');
};
