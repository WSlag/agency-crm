import React from 'react';
import { render, screen, fireEvent } from '../../../utils/testUtils';
import { TextField } from '../TextField';

describe('TextField', () => {
  const defaultProps = {
    name: 'test-field',
    label: 'Test Field',
    value: '',
    onChange: jest.fn()
  };

  it('renders correctly', () => {
    render(<TextField {...defaultProps} />);
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
  });

  it('shows required indicator when required prop is true', () => {
    render(<TextField {...defaultProps} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    const error = 'This field is required';
    render(<TextField {...defaultProps} error={error} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('calls onChange handler when value changes', () => {
    const onChange = jest.fn();
    render(<TextField {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByLabelText('Test Field');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('is disabled when disabled prop is true', () => {
    render(<TextField {...defaultProps} disabled />);
    expect(screen.getByLabelText('Test Field')).toBeDisabled();
  });

  it('applies custom className', () => {
    const className = 'custom-class';
    render(<TextField {...defaultProps} className={className} />);
    expect(screen.getByLabelText('Test Field').parentElement).toHaveClass(className);
  });
});
