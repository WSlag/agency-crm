# Hybrid Dashboard Implementation

## Overview

The hybrid dashboard combines simple role-based metrics with advanced visualizations and real-time data aggregation. It provides a rich, interactive experience while maintaining excellent performance.

## Architecture

### Components Structure

```
src/components/dashboard/
├── MetricCard.tsx              # Enhanced metric card with sparklines
├── SimpleBreakdownChart.tsx    # Bar chart for data breakdowns
├── EnhancedDashboard.tsx       # Main dashboard layout component
├── QuickStats.tsx              # Highlighted stats banner
├── DashboardSkeleton.tsx       # Loading state
├── DashboardError.tsx          # Error state
├── DashboardGrid.tsx           # Advanced grid (optional)
├── BreakdownChart.tsx          # Advanced breakdown chart
├── TrendChart.tsx              # Advanced trend visualization
├── PerformanceTable.tsx        # Performance data table
└── MetricGroup.tsx             # Metric grouping component
```

### Data Flow

```
Dashboard.tsx
    ↓
useDashboardMetrics(role, branchId)
    ↓
Firestore Collections → Data Aggregation → DashboardMetric[]
    ↓
EnhancedDashboard Component
    ↓
├── QuickStats (4 key metrics)
├── MetricCard[] (detailed metrics with sparklines)
└── SimpleBreakdownChart[] (data distributions)
```

## Key Features

### 1. Enhanced MetricCard

**Features:**
- Mini sparkline visualizations
- Trend indicators (up/down/neutral)
- Percentage change badges
- Optional descriptions
- Hover animations

**Props:**
```typescript
interface MetricCardProps extends DashboardMetric {
  trendData?: number[];      // Array of 7 data points for sparkline
  description?: string;      // Additional context
}
```

**Example:**
```tsx
<MetricCard
  label="Total Applicants"
  value={150}
  type="number"
  trend="up"
  change={8}
  trendData={[120, 125, 130, 135, 140, 145, 150]}
  description="Last 7 days"
/>
```

### 2. useDashboardMetrics Hook

**Enhanced Return Value:**
```typescript
{
  metrics: DashboardMetric[];           // Main metrics
  breakdowns?: Record<string, DashboardMetric[]>; // Grouped data
  isLoading: boolean;
  error: Error | null;
}
```

**Automatic Features:**
- Real-time Firestore queries
- Automatic trend calculation
- Data breakdowns by status/type
- Role-based data filtering
- Sparkline data generation

### 3. Role-Specific Dashboards

#### Admin Dashboard
**Metrics:**
- Total Users (with trend)
- Active Branches (with trend)
- Total Applicants (with trend + change)
- Pending Expenses (with total amount)
- Total Commissions (with trend)

**Breakdowns:**
- Applicants by Status

#### Branch Manager Dashboard
**Metrics:**
- Active Applicants (with trend + change)
- Total Applicants (with trend)
- Pending Expenses (with total amount + change)
- Deployment Rate (percentage + change)

**Breakdowns:**
- Applicants by Status

#### HO Recruitment Officer Dashboard
**Metrics:**
- Pending Reviews (with trend + change)
- In Process (with trend)
- Completed (with trend + change)
- Pending Documents (with description)

**Breakdowns:**
- None (can be added)

#### HO Accountant Dashboard
**Metrics:**
- Pending Expenses (count + amount + change)
- Approved Expenses (total amount + trend)
- Pending Commissions (count + amount)
- Paid Commissions (total amount + trend + change)

**Breakdowns:**
- Expenses by Type

## Utility Functions

### Dashboard Helpers (`src/utils/dashboardHelpers.ts`)

**Aggregation Functions:**
```typescript
// Group by status
aggregateByStatus(docs, 'status')

// Aggregate amounts
aggregateAmountsByField(docs, 'type', 'amount')

// Count by field
countByField(docs, 'branchId')

// Convert to metrics
aggregateToMetrics(data, 'currency')
```

**Calculation Functions:**
```typescript
// Calculate totals
calculateTotal(docs, 'amount')

// Calculate averages
calculateAverage(docs, 'processingTime')

// Growth rate
calculateGrowthRate(current, previous)

// Trend direction
getTrendFromGrowth(growthRate)
```

**Time-based Functions:**
```typescript
// Filter by date range
filterByDateRange(docs, 'createdAt', startDate, endDate)

// Get recent documents
getRecentDocs(docs, 'createdAt', 7) // Last 7 days

// Group by period
groupByPeriod(docs, 'createdAt', 'month')
```

**Helper Functions:**
```typescript
// Get top N items
getTopN(data, 5, 'desc')

// Calculate percentages
calculatePercentages(data)

// Create comparative metric
createComparativeMetric('Sales', 150, 140, 'number')

// Batch create metrics
createMetricsBatch([
  { label: 'Users', value: 100, previousValue: 95 },
  { label: 'Revenue', value: 50000, type: 'currency' }
])
```

## Usage Examples

### Basic Dashboard Setup

```tsx
import { EnhancedDashboard, QuickStats } from '../../components/dashboard/EnhancedDashboard';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';

const MyDashboard = () => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('admin');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      <EnhancedDashboard 
        metrics={metrics} 
        breakdowns={breakdowns}
        title="Overview"
      />
    </div>
  );
};
```

### Custom Metrics with Helpers

```tsx
import { createMetricsBatch, aggregateByStatus, aggregateToMetrics } from '../utils/dashboardHelpers';

// Fetch data
const applicants = await getDocs(collection(firestore, 'applicants'));

// Aggregate by status
const statusData = aggregateByStatus(applicants, 'status');

// Convert to metrics
const statusMetrics = aggregateToMetrics(statusData, 'number');

// Create comparative metrics
const metrics = createMetricsBatch([
  {
    label: 'Total Applicants',
    value: applicants.size,
    previousValue: 145,
    trendData: [130, 135, 140, 145, 150, 155, 160]
  },
  {
    label: 'Revenue',
    value: 250000,
    type: 'currency',
    description: 'This month'
  }
]);
```

### Adding Custom Breakdowns

```tsx
import { aggregateAmountsByField, aggregateToMetrics } from '../utils/dashboardHelpers';

// Get expenses by type
const expensesByType = aggregateAmountsByField(expenses, 'type', 'amount');
const expenseMetrics = aggregateToMetrics(expensesByType, 'currency');

// Use in dashboard
const breakdowns = {
  expensesByType: expenseMetrics,
  applicantsByStatus: statusMetrics
};

<EnhancedDashboard metrics={metrics} breakdowns={breakdowns} />
```

## Styling & Customization

### Color Schemes

**QuickStats:** Primary gradient background
**MetricCards:** White with hover shadow
**Charts:** Multi-color bars with tooltips

### Responsive Grid

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
- XL: 4 columns

### Customization Options

```tsx
// Custom metric card styling
<MetricCard
  {...metric}
  className="custom-class"
/>

// Custom chart colors
const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];

// Custom layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <EnhancedDashboard metrics={leftMetrics} />
  <EnhancedDashboard metrics={rightMetrics} />
</div>
```

## Performance Optimization

### Current Optimizations

1. **React.memo** on expensive components
2. **useMemo** for calculated values
3. **Batched Firestore queries** with Promise.all
4. **Conditional rendering** based on role
5. **Lazy loading** for chart components

### Best Practices

```tsx
// ✅ Good - Batch queries
const [users, branches, applicants] = await Promise.all([
  getDocs(collection(firestore, 'users')),
  getDocs(collection(firestore, 'branches')),
  getDocs(collection(firestore, 'applicants'))
]);

// ❌ Bad - Sequential queries
const users = await getDocs(collection(firestore, 'users'));
const branches = await getDocs(collection(firestore, 'branches'));
const applicants = await getDocs(collection(firestore, 'applicants'));
```

## Future Enhancements

### Planned Features

1. **Real Historical Data:** Replace generated sparklines with actual time-series data
2. **Export Functionality:** Export dashboard data as PDF/Excel
3. **Custom Date Ranges:** Filter metrics by custom date ranges
4. **Drill-down Views:** Click metrics to see detailed breakdowns
5. **Real-time Updates:** WebSocket/Firestore listeners for live updates
6. **Comparative Analysis:** Compare periods side-by-side
7. **Custom Dashboards:** User-configurable dashboard layouts
8. **Alerts & Notifications:** Threshold-based alerts

### Migration Path

To add historical data tracking:

```typescript
// Create a metrics collection
interface MetricSnapshot {
  date: Date;
  role: string;
  metrics: Record<string, number>;
}

// Store daily snapshots
const saveSnapshot = async (role: string, metrics: Record<string, number>) => {
  await addDoc(collection(firestore, 'metricSnapshots'), {
    date: new Date(),
    role,
    metrics,
    timestamp: serverTimestamp()
  });
};

// Fetch historical data
const getHistoricalData = async (role: string, days: number = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    collection(firestore, 'metricSnapshots'),
    where('role', '==', role),
    where('date', '>=', startDate),
    orderBy('date', 'asc')
  );
  
  return await getDocs(q);
};
```

## Testing

### Unit Tests

```tsx
describe('useDashboardMetrics', () => {
  it('should fetch admin metrics', async () => {
    const { result } = renderHook(() => useDashboardMetrics('admin'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.metrics).toHaveLength(5);
  });
});

describe('Dashboard Helpers', () => {
  it('should calculate growth rate', () => {
    const growth = calculateGrowthRate(150, 100);
    expect(growth).toBe(50);
  });
  
  it('should aggregate by status', () => {
    const result = aggregateByStatus(mockDocs, 'status');
    expect(result).toEqual({ active: 5, pending: 3 });
  });
});
```

### Integration Tests

```tsx
describe('Dashboard Integration', () => {
  it('should render admin dashboard with metrics', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Applicants')).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Common Issues

**Issue: Metrics not loading**
- Check Firestore permissions
- Verify user role is set correctly
- Check console for errors

**Issue: Breakdowns not showing**
- Ensure data has the grouping field
- Check if breakdowns object is empty
- Verify field names match

**Issue: Trends showing incorrect data**
- Check calculateTrend function parameters
- Verify previous value calculation
- Ensure numbers are not strings

## Support

For issues or questions:
1. Check this documentation
2. Review component source code
3. Check TypeScript types
4. Contact development team

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Maintainer:** Development Team

