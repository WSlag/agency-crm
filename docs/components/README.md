# Components

## Core Components

### ErrorBoundary
Error handling component that catches JavaScript errors in child components.

```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

<ErrorBoundary fallback={<ErrorMessage />}>
  <MyComponent />
</ErrorBoundary>
```

#### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Components to be wrapped |
| fallback | ReactNode | No | Custom error UI |
| onError | (error: Error, info: ErrorInfo) => void | No | Error callback |

### PageTransition
Animated page transition component using Framer Motion.

```tsx
import { PageTransition } from '@/components/animation/PageTransition';

<PageTransition isLoading={loading}>
  <MyPage />
</PageTransition>
```

#### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Page content |
| isLoading | boolean | No | Loading state |
| loadingText | string | No | Custom loading text |

## Form Components

### TextField
Text input component with validation and error handling.

```tsx
import { TextField } from '@/components/forms/fields/TextField';

<TextField
  name="email"
  label="Email Address"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>
```

#### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Field name |
| label | string | Yes | Field label |
| value | string | Yes | Current value |
| onChange | (value: string) => void | Yes | Change handler |
| error | string | No | Error message |
| required | boolean | No | Required field |

### SelectField
Dropdown select component with options support.

```tsx
import { SelectField } from '@/components/forms/fields/SelectField';

<SelectField
  name="type"
  label="Document Type"
  value={type}
  onChange={setType}
  options={documentTypes}
  error={errors.type}
/>
```

#### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Field name |
| label | string | Yes | Field label |
| value | string | Yes | Selected value |
| onChange | (value: string) => void | Yes | Change handler |
| options | Option[] | Yes | Select options |
| error | string | No | Error message |

## Layout Components

### ResponsiveContainer
Container component with responsive breakpoints.

```tsx
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';

<ResponsiveContainer maxWidth="xl" padding centered>
  <Content />
</ResponsiveContainer>
```

#### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Content |
| maxWidth | 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' | No | Max width |
| padding | boolean | No | Add padding |
| centered | boolean | No | Center content |

### ResponsiveGrid
Grid layout component with responsive columns.

```tsx
import { ResponsiveGrid } from '@/components/layout/ResponsiveContainer';

<ResponsiveGrid
  cols={{ default: 1, sm: 2, lg: 3 }}
  gap={4}
>
  <GridItem />
</ResponsiveGrid>
```

#### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Grid items |
| cols | GridCols | Yes | Column config |
| gap | number | No | Grid gap |

## Navigation Components

### Breadcrumbs
Navigation breadcrumbs with role-based visibility.

```tsx
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

<Breadcrumbs />
```

### BackButton
Back navigation button with history support.

```tsx
import { BackButton } from '@/components/navigation/BackButton';

<BackButton
  fallbackPath="/dashboard"
  label="Back to Dashboard"
/>
```

#### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| fallbackPath | string | No | Fallback route |
| label | string | No | Button label |

## Feature Components

### NotificationCenter
Notification management component with offline support.

```tsx
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

<NotificationCenter />
```

### OfflineIndicator
Offline status indicator with sync controls.

```tsx
import { OfflineIndicator } from '@/components/offline/OfflineIndicator';

<OfflineIndicator />
```

## Best Practices

### Component Structure
1. Use TypeScript interfaces for props
2. Implement error boundaries
3. Handle loading states
4. Support keyboard navigation
5. Include ARIA attributes

### Performance
1. Memoize expensive computations
2. Implement lazy loading
3. Use proper suspense boundaries
4. Monitor render performance

### Accessibility
1. Use semantic HTML
2. Include ARIA labels
3. Support keyboard navigation
4. Maintain focus management
5. Provide text alternatives

### Testing
1. Write unit tests
2. Include integration tests
3. Test accessibility
4. Test error states
5. Test performance
