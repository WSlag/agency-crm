# Form Components

## Overview
The form components provide a consistent and accessible way to handle user input in the application. They are built with TypeScript, integrate with Zod for validation, and follow WAI-ARIA guidelines for accessibility.

## Components

### TextField
A text input component that supports various input types and validation states.

```tsx
import { TextField } from '@/components/forms/fields/TextField';

// Basic usage
<TextField
  name="email"
  label="Email Address"
  value={email}
  onChange={setEmail}
/>

// With validation
<TextField
  name="password"
  label="Password"
  type="password"
  value={password}
  onChange={setPassword}
  error={errors.password}
  required
/>
```

#### Props
- `name`: string (required) - Input field name
- `label`: string (required) - Label text
- `value`: string (required) - Current input value
- `onChange`: (value: string) => void (required) - Change handler
- `type`: 'text' | 'email' | 'password' | 'tel' | 'url' (optional) - Input type
- `error`: string (optional) - Error message
- `disabled`: boolean (optional) - Disable the input
- `required`: boolean (optional) - Mark as required
- `className`: string (optional) - Additional CSS classes

### SelectField
A dropdown select component with support for option groups and custom rendering.

```tsx
import { SelectField } from '@/components/forms/fields/SelectField';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' }
];

<SelectField
  name="select"
  label="Select Option"
  value={selectedValue}
  onChange={setSelectedValue}
  options={options}
/>
```

#### Props
- `name`: string (required) - Select field name
- `label`: string (required) - Label text
- `value`: string (required) - Current selected value
- `onChange`: (value: string) => void (required) - Change handler
- `options`: Option[] (required) - Array of options
- `error`: string (optional) - Error message
- `disabled`: boolean (optional) - Disable the select
- `required`: boolean (optional) - Mark as required
- `className`: string (optional) - Additional CSS classes

## Validation
Form components integrate with Zod validation through the `useFormHelper` hook:

```tsx
import { useFormHelper } from '@/utils/formHelpers';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

function LoginForm() {
  const {
    data,
    errors,
    setValue,
    handleSubmit
  } = useFormHelper({
    validationSchema: schema,
    onSubmit: async (data) => {
      // Handle form submission
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        name="email"
        label="Email"
        value={data.email || ''}
        onChange={(value) => setValue('email', value)}
        error={errors.email}
      />
      {/* ... other fields ... */}
    </form>
  );
}
```

## Accessibility
All form components:
- Use semantic HTML elements
- Support keyboard navigation
- Include proper ARIA attributes
- Provide clear error messages
- Handle focus management

## Best Practices
1. Always provide labels for form fields
2. Use appropriate input types
3. Show validation errors inline
4. Include helper text when needed
5. Make forms keyboard accessible
6. Test with screen readers
