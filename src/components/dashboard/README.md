# Dashboard Components

This directory contains the hybrid dashboard implementation that combines simple role-based metrics with advanced visualizations.

## Components

### Core Components

- **`MetricCard.tsx`** - Enhanced metric card with sparklines, trends, and descriptions
- **`EnhancedDashboard.tsx`** - Main dashboard layout with metrics grid and breakdowns
- **`QuickStats.tsx`** - Highlighted stats banner for key metrics
- **`SimpleBreakdownChart.tsx`** - Bar chart for data distribution visualization

### Supporting Components

- **`DashboardSkeleton.tsx`** - Loading state placeholder
- **`DashboardError.tsx`** - Error state display
- **`MetricGroup.tsx`** - Groups related metrics together

### Advanced Components (Optional)

- **`DashboardGrid.tsx`** - Advanced grid layout with report store integration
- **`BreakdownChart.tsx`** - Advanced breakdown with tooltips
- **`TrendChart.tsx`** - Time-series trend visualization
- **`PerformanceTable.tsx`** - Tabular performance data

## Quick Start

```tsx
import { EnhancedDashboard, QuickStats } from './components/dashboard/EnhancedDashboard';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';

const MyDashboard = () => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('admin');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      <EnhancedDashboard metrics={metrics} breakdowns={breakdowns} />
    </div>
  );
};
```

## Features

### MetricCard Features
- ✅ Sparkline visualizations
- ✅ Trend indicators (up/down/neutral)
- ✅ Percentage change badges
- ✅ Optional descriptions
- ✅ Hover animations
- ✅ Support for number, currency, and percentage types

### Dashboard Features
- ✅ Role-based metrics
- ✅ Real-time Firestore data
- ✅ Automatic trend calculation
- ✅ Data breakdowns by status/type
- ✅ Responsive grid layout
- ✅ Loading and error states

## Data Flow

```
useDashboardMetrics Hook
    ↓
Firestore Collections
    ↓
Data Aggregation (dashboardHelpers)
    ↓
DashboardMetric[] + Breakdowns
    ↓
EnhancedDashboard Component
    ↓
Rendered UI
```

## TypeScript Interfaces

```typescript
interface DashboardMetric {
  label: string;
  value: string | number;
  type?: 'number' | 'currency' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  trendData?: number[];      // For sparklines
  description?: string;      // Additional context
}

interface DashboardData {
  metrics: DashboardMetric[];
  breakdowns?: Record<string, DashboardMetric[]>;
  isLoading: boolean;
  error: Error | null;
}
```

## Customization

### Custom Colors
Edit the colors array in `SimpleBreakdownChart.tsx`:
```typescript
const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  // Add more...
];
```

### Custom Grid Layout
```tsx
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
  {metrics.map(metric => (
    <MetricCard key={metric.label} {...metric} />
  ))}
</div>
```

## Related Files

- **Hook:** `src/hooks/useDashboardMetrics.ts`
- **Utilities:** `src/utils/dashboardHelpers.ts`
- **Types:** `src/types/navigation.ts`
- **Page:** `src/pages/dashboard/Dashboard.tsx`
- **Documentation:** `docs/features/hybrid-dashboard.md`

## Best Practices

1. **Use batch queries** - Fetch multiple collections with `Promise.all()`
2. **Add loading states** - Always show skeleton during data fetch
3. **Handle errors gracefully** - Display error component with retry option
4. **Memoize expensive calculations** - Use `useMemo` for trend data
5. **Keep metrics focused** - 4-8 metrics per dashboard maximum

## Performance

- Optimized with React.memo
- Memoized calculations
- Batched Firestore queries
- Conditional rendering
- Lazy loading support

## Support

See full documentation: `docs/features/hybrid-dashboard.md`

