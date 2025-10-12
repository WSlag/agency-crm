import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock Firebase Auth Context
const mockAuthContext = {
  user: null,
  loading: false,
  error: null,
  customClaims: null,
  signIn: async () => {},
  signOut: async () => {}
};

interface WrapperProps {
  children: React.ReactNode;
  initialRoute?: string;
  authContext?: typeof mockAuthContext;
}

function AllTheProviders({ children, initialRoute = '/', authContext = mockAuthContext }: WrapperProps) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider value={authContext}>
        {children}
      </AuthProvider>
    </MemoryRouter>
  );
}

function render(
  ui: ReactElement,
  {
    initialRoute,
    authContext,
    ...renderOptions
  }: RenderOptions & {
    initialRoute?: string;
    authContext?: typeof mockAuthContext;
  } = {}
) {
  return rtlRender(ui, {
    wrapper: (props) => (
      <AllTheProviders
        {...props}
        initialRoute={initialRoute}
        authContext={authContext}
      />
    ),
    ...renderOptions,
  });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };
