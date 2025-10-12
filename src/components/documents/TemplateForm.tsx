import React from 'react';
import { z } from 'zod';
import { FormWrapper } from '../forms/FormWrapper';
import { TextField } from '../forms/fields/TextField';
import { SelectField } from '../forms/fields/SelectField';
import { CheckboxField } from '../forms/fields/CheckboxField';
import { TextAreaField } from '../forms/fields/TextAreaField';
import { Template, CreateTemplateData } from '../../services/TemplateService';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  documentType: z.string().min(1, 'Document type is required'),
  isActive: z.boolean(),
  requiredFields: z.array(z.object({
    name: z.string().min(1, 'Field name is required'),
    type: z.enum(['text', 'number', 'date', 'select', 'checkbox']),
    required: z.boolean(),
    options: z.array(z.string()).optional()
  }))
});

interface TemplateFormProps {
  initialData?: Template;
  onSubmit: (data: CreateTemplateData) => Promise<void>;
  onCancel: () => void;
}

const documentTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'medical', label: 'Medical Certificate' },
  { value: 'contract', label: 'Employment Contract' },
  { value: 'other', label: 'Other' }
];

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' }
];

export const TemplateForm: React.FC<TemplateFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  return (
    <FormWrapper
      schema={templateSchema}
      defaultValues={initialData || {
        name: '',
        description: '',
        documentType: '',
        isActive: true,
        requiredFields: []
      }}
      onSubmit={onSubmit}
    >
      {({ register, formState: { errors }, watch, setValue }) => (
        <div className="space-y-6">
          <TextField
            label="Template Name"
            name="name"
            register={register}
            error={errors.name?.message}
            required
          />

          <TextAreaField
            label="Description"
            name="description"
            register={register}
            error={errors.description?.message}
          />

          <SelectField
            label="Document Type"
            name="documentType"
            register={register}
            error={errors.documentType?.message}
            options={documentTypes}
            required
          />

          <CheckboxField
            name="isActive"
            label="Active"
            register={register}
            error={errors.isActive?.message}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Required Fields</h3>
            {watch('requiredFields')?.map((field: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                <TextField
                  label="Field Name"
                  name={`requiredFields.${index}.name`}
                  register={register}
                  error={errors.requiredFields?.[index]?.name?.message}
                  required
                />

                <SelectField
                  label="Field Type"
                  name={`requiredFields.${index}.type`}
                  register={register}
                  error={errors.requiredFields?.[index]?.type?.message}
                  options={fieldTypes}
                  required
                />

                <CheckboxField
                  name={`requiredFields.${index}.required`}
                  label="Required Field"
                  register={register}
                  error={errors.requiredFields?.[index]?.required?.message}
                />

                {watch(`requiredFields.${index}.type`) === 'select' && (
                  <TextAreaField
                    label="Options (one per line)"
                    name={`requiredFields.${index}.options`}
                    register={register}
                    error={errors.requiredFields?.[index]?.options?.message}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter(Boolean);
                      setValue(`requiredFields.${index}.options`, options);
                    }}
                    value={watch(`requiredFields.${index}.options`)?.join('\n')}
                  />
                )}

                <button
                  type="button"
                  onClick={() => {
                    const fields = watch('requiredFields');
                    setValue(
                      'requiredFields',
                      fields.filter((_: any, i: number) => i !== index)
                    );
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove Field
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const fields = watch('requiredFields') || [];
                setValue('requiredFields', [
                  ...fields,
                  { name: '', type: 'text', required: false }
                ]);
              }}
              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Field
            </button>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {initialData ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      )}
    </FormWrapper>
  );
};
