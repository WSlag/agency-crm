import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateForm } from '../../../components/documents/templates/TemplateForm';
import { TemplateList } from '../../../components/documents/templates/TemplateList';
import { mockTemplate, mockDocumentStore } from '../../utils/documentTestUtils';

// Mock the document store
jest.mock('../../../stores/documentStore', () => ({
  useDocumentStore: () => mockDocumentStore,
}));

describe('TemplateForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', () => {
    render(
      <TemplateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Template Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Document Type')).toBeInTheDocument();
    expect(screen.getByText('Required Fields')).toBeInTheDocument();
  });

  it('handles adding and removing fields', async () => {
    render(
      <TemplateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const addButton = screen.getByText('Add Field');
    fireEvent.click(addButton);

    expect(screen.getByLabelText('Field Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Field Type')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByLabelText('Field Name')).not.toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(
      <TemplateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Save Template');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Template name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('handles form submission with valid data', async () => {
    render(
      <TemplateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText('Template Name'), {
      target: { value: 'Test Template' },
    });

    fireEvent.change(screen.getByLabelText('Document Type'), {
      target: { value: 'passport' },
    });

    const addButton = screen.getByText('Add Field');
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText('Field Name'), {
      target: { value: 'Test Field' },
    });

    const submitButton = screen.getByText('Save Template');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});

describe('TemplateList Component', () => {
  const mockOnTemplateUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders template list', () => {
    render(
      <TemplateList
        templates={[mockTemplate]}
        onTemplateUpdate={mockOnTemplateUpdate}
      />
    );

    expect(screen.getByText('Document Templates')).toBeInTheDocument();
    expect(screen.getByText(mockTemplate.name)).toBeInTheDocument();
  });

  it('shows empty state when no templates', () => {
    render(
      <TemplateList
        templates={[]}
        onTemplateUpdate={mockOnTemplateUpdate}
      />
    );

    expect(screen.getByText('No templates')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating a new template.')).toBeInTheDocument();
  });

  it('handles template creation', async () => {
    render(
      <TemplateList
        templates={[]}
        onTemplateUpdate={mockOnTemplateUpdate}
      />
    );

    const newButton = screen.getByText('New Template');
    fireEvent.click(newButton);

    expect(screen.getByText('Create Template')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Template Name'), {
      target: { value: 'New Template' },
    });

    fireEvent.change(screen.getByLabelText('Document Type'), {
      target: { value: 'passport' },
    });

    const saveButton = screen.getByText('Save Template');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockDocumentStore.createTemplate).toHaveBeenCalled();
      expect(mockOnTemplateUpdate).toHaveBeenCalled();
    });
  });

  it('handles template editing', async () => {
    render(
      <TemplateList
        templates={[mockTemplate]}
        onTemplateUpdate={mockOnTemplateUpdate}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit template/i });
    fireEvent.click(editButton);

    expect(screen.getByText('Edit Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Template Name')).toHaveValue(mockTemplate.name);

    fireEvent.change(screen.getByLabelText('Template Name'), {
      target: { value: 'Updated Template' },
    });

    const saveButton = screen.getByText('Save Template');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockDocumentStore.updateTemplate).toHaveBeenCalledWith(
        mockTemplate.id,
        expect.objectContaining({
          name: 'Updated Template',
        })
      );
      expect(mockOnTemplateUpdate).toHaveBeenCalled();
    });
  });

  it('handles template deletion', async () => {
    render(
      <TemplateList
        templates={[mockTemplate]}
        onTemplateUpdate={mockOnTemplateUpdate}
      />
    );

    window.confirm = jest.fn(() => true);

    const deleteButton = screen.getByRole('button', { name: /delete template/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDocumentStore.deleteTemplate).toHaveBeenCalledWith(mockTemplate.id);
      expect(mockOnTemplateUpdate).toHaveBeenCalled();
    });
  });

  it('cancels template deletion when not confirmed', async () => {
    render(
      <TemplateList
        templates={[mockTemplate]}
        onTemplateUpdate={mockOnTemplateUpdate}
      />
    );

    window.confirm = jest.fn(() => false);

    const deleteButton = screen.getByRole('button', { name: /delete template/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDocumentStore.deleteTemplate).not.toHaveBeenCalled();
    });
  });
});
