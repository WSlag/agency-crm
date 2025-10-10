import { Document, DocumentTemplate, DocumentHistory } from '../../types/document';

export const mockDocument: Document = {
  id: '1',
  applicantId: '1',
  documentType: 'passport',
  documentStage: 'interview',
  fileUrl: 'https://example.com/document.pdf',
  fileName: 'document.pdf',
  fileSize: 1024,
  fileType: 'application/pdf',
  uploadDate: new Date('2023-01-01'),
  expiryDate: new Date('2024-01-01'),
  verifiedBy: null,
  verifiedAt: null,
  rejectedBy: null,
  rejectedAt: null,
  rejectionReason: null,
  status: 'pending',
  version: 1,
  metadata: {
    pageCount: 2,
    issuedBy: 'Government',
    issuedAt: new Date('2023-01-01'),
    documentNumber: 'ABC123',
  },
  tags: ['important', 'original'],
  notes: 'Test document',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

export const mockTemplate: DocumentTemplate = {
  id: '1',
  name: 'Passport Template',
  description: 'Template for passport documents',
  documentType: 'passport',
  isActive: true,
  requiredFields: [
    {
      name: 'passportNumber',
      type: 'text',
      required: true,
    },
    {
      name: 'expiryDate',
      type: 'date',
      required: true,
    },
  ],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

export const mockHistory: DocumentHistory[] = [
  {
    id: '1',
    documentId: '1',
    action: 'created',
    performedBy: 'user1',
    performedAt: new Date('2023-01-01'),
    details: {
      newStatus: 'pending',
      newVersion: 1,
    },
  },
  {
    id: '2',
    documentId: '1',
    action: 'updated',
    performedBy: 'user1',
    performedAt: new Date('2023-01-02'),
    details: {
      changes: [
        {
          field: 'status',
          oldValue: 'pending',
          newValue: 'verified',
        },
      ],
    },
  },
];

export const createMockFile = (
  name = 'test.pdf',
  type = 'application/pdf',
  size = 1024
) => {
  const file = new File(['test'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

export const mockDocumentStore = {
  documents: [mockDocument],
  selectedDocument: null,
  documentHistory: mockHistory,
  documentTemplates: [mockTemplate],
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'uploadDate',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
  },
  fetchDocuments: jest.fn(),
  fetchDocumentById: jest.fn(),
  uploadDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  verifyDocument: jest.fn(),
  rejectDocument: jest.fn(),
  fetchTemplates: jest.fn(),
  createTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  fetchDocumentHistory: jest.fn(),
};
