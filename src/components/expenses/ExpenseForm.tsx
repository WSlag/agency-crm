import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '../../schemas/financial';
import { EXPENSE_CONFIG, type Expense, type Currency } from '../../types/expense';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';

interface ExpenseFormProps {
  initialData?: Partial<Expense>;
  onSubmit: (data: Partial<Expense>) => Promise<void>;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    initialData?.receiptUrl || null
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      ...initialData,
      expenseDate: initialData?.expenseDate
        ? new Date(initialData.expenseDate)
        : new Date(),
      currency: initialData?.currency || 'PHP',
      branchId: initialData?.branchId || user?.branchId || '',
    },
  });

  const expenseType = watch('expenseType');
  const config = expenseType ? EXPENSE_CONFIG[expenseType] : null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedFile && config?.requiresReceipt) {
        const receiptUrl = await useExpenseStore
          .getState()
          .uploadReceipt(initialData?.id || 'temp', selectedFile);
        data.receiptUrl = receiptUrl;
      }
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit expense:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 bg-white p-6 rounded-lg shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expense Type
          </label>
          <Controller
            name="expenseType"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Type</option>
                {Object.entries(EXPENSE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.expenseType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.expenseType.message as string}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  className="block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                />
              )}
            />
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="rounded-r-md border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {config?.allowedCurrencies.map((currency: Currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.amount.message as string}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter expense description..."
              />
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message as string}
            </p>
          )}
        </div>

        {/* Applicant Selection (if required) */}
        {config?.requiresApplicant && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Applicant
            </label>
            <Controller
              name="applicantId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Applicant</option>
                  {/* TODO: Add applicant options from context/store */}
                </select>
              )}
            />
            {errors.applicantId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.applicantId.message as string}
              </p>
            )}
          </div>
        )}

        {/* Receipt Upload (if required) */}
        {config?.requiresReceipt && (
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700">
              Receipt
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {previewUrl && (
                <div className="relative h-20 w-20">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="h-full w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setValue('receiptUrl', null);
                    }}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {errors.receiptUrl && (
              <p className="mt-1 text-sm text-red-600">
                {errors.receiptUrl.message as string}
              </p>
            )}
          </div>
        )}

        {/* Receipt Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Receipt Number
          </label>
          <Controller
            name="receiptNumber"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter receipt number..."
              />
            )}
          />
          {errors.receiptNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.receiptNumber.message as string}
            </p>
          )}
        </div>

        {/* Expense Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expense Date
          </label>
          <Controller
            name="expenseDate"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                {...field}
                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            )}
          />
          {errors.expenseDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.expenseDate.message as string}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                value={field.value?.join(', ') || ''}
                onChange={(e) =>
                  field.onChange(
                    e.target.value.split(',').map((tag) => tag.trim())
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter tags separated by commas..."
              />
            )}
          />
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600">
              {errors.tags.message as string}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter additional notes..."
              />
            )}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">
              {errors.notes.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
