import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobStore } from '../../stores/jobStore';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { JobType, JobStatus, CreateJobData } from '../../types/job';

export const JobForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedJob, loading, error, createJob, updateJob, fetchJobById } = useJobStore();
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateJobData>({
    jobTitle: '',
    employerName: '',
    employerContact: {
      name: '',
      email: '',
      phone: ''
    },
    country: '',
    location: '',
    jobType: 'full-time',
    description: '',
    requirements: [''],
    requiredSkills: [],
    requiredCertifications: [],
    salaryRange: {
      min: 0,
      max: 0,
      currency: 'PHP'
    },
    openings: 1,
    deadline: undefined,
    status: 'open'
  });

  const [tempSkill, setTempSkill] = useState('');
  const [tempCert, setTempCert] = useState('');

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedJob && id) {
      setFormData({
        jobTitle: selectedJob.jobTitle,
        employerName: selectedJob.employerName,
        employerContact: selectedJob.employerContact,
        country: selectedJob.country,
        location: selectedJob.location,
        jobType: selectedJob.jobType,
        description: selectedJob.description,
        requirements: selectedJob.requirements,
        requiredSkills: selectedJob.requiredSkills,
        requiredCertifications: selectedJob.requiredCertifications,
        salaryRange: selectedJob.salaryRange,
        openings: selectedJob.openings,
        deadline: selectedJob.deadline,
        status: selectedJob.status
      });
    }
  }, [selectedJob, id]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.jobTitle.trim()) errors.jobTitle = 'Job title is required';
    if (!formData.employerName.trim()) errors.employerName = 'Employer name is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.requirements.filter(r => r.trim()).length === 0) {
      errors.requirements = 'At least one requirement is required';
    }
    if (formData.salaryRange.min < 0) errors.salaryMin = 'Minimum salary must be positive';
    if (formData.salaryRange.max < formData.salaryRange.min) {
      errors.salaryMax = 'Maximum salary must be greater than minimum';
    }
    if (formData.openings < 1) errors.openings = 'At least one opening is required';
    if (!formData.employerContact.email.trim()) errors.employerEmail = 'Employer email is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim()),
      };

      if (id) {
        await updateJob(id, cleanedData);
      } else {
        await createJob(cleanedData);
      }
      navigate('/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addSkill = () => {
    if (tempSkill.trim() && !formData.requiredSkills.includes(tempSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, tempSkill.trim()]
      }));
      setTempSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  };

  const addCertification = () => {
    if (tempCert.trim() && !formData.requiredCertifications.includes(tempCert.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredCertifications: [...prev.requiredCertifications, tempCert.trim()]
      }));
      setTempCert('');
    }
  };

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      requiredCertifications: prev.requiredCertifications.filter(c => c !== cert)
    }));
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link
              to="/jobs"
              className="inline-flex items-center text-white hover:text-blue-100"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Jobs
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {id ? 'Edit Job' : 'Post New Job'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.jobTitle ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.jobTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Employer Name *</label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.employerName ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.employerName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.employerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.country ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.country && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.location ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Type *</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="filled">Filled</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Employer Contact */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Employer Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    value={formData.employerContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      employerContact: { ...formData.employerContact, name: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={formData.employerContact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      employerContact: { ...formData.employerContact, email: e.target.value }
                    })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.employerEmail ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.employerEmail && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.employerEmail}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.employerContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      employerContact: { ...formData.employerContact, phone: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Description *</label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  validationErrors.description ? 'border-red-300' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements *</h2>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter requirement"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Requirement
                </button>
                {validationErrors.requirements && (
                  <p className="text-sm text-red-600">{validationErrors.requirements}</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempSkill}
                  onChange={(e) => setTempSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter skill and press Enter"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Certifications</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempCert}
                  onChange={(e) => setTempCert(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter certification and press Enter"
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredCertifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Salary and Openings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Compensation & Openings</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    value={formData.salaryRange.currency}
                    onChange={(e) => setFormData({
                      ...formData,
                      salaryRange: { ...formData.salaryRange, currency: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Salary *</label>
                  <input
                    type="number"
                    value={formData.salaryRange.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      salaryRange: { ...formData.salaryRange, min: Number(e.target.value) }
                    })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.salaryMin ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.salaryMin && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.salaryMin}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Salary *</label>
                  <input
                    type="number"
                    value={formData.salaryRange.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      salaryRange: { ...formData.salaryRange, max: Number(e.target.value) }
                    })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.salaryMax ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.salaryMax && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.salaryMax}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Openings *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: Number(e.target.value) })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.openings ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.openings && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.openings}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
              <input
                type="date"
                value={formData.deadline ? formData.deadline.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  deadline: e.target.value ? new Date(e.target.value) : undefined
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Link
                to="/jobs"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : id ? 'Update Job' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

