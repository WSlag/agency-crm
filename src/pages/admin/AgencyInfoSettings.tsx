import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  limit as firestoreLimit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore as db, storage } from '../../config/firebase';
import { AgencyInfo } from '../../types/resume';
import { useAuth } from '../../contexts/AuthContext';

export const AgencyInfoSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);

  const [formData, setFormData] = useState({
    agencyName: '',
    logoUrl: '',
    tagline: '',
    about: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    linkedin: '',
    twitter: '',
    licenseNumber: '',
  });

  useEffect(() => {
    fetchAgencyInfo();
  }, []);

  const fetchAgencyInfo = async () => {
    setLoading(true);
    try {
      const agencyInfoRef = collection(db, 'agency_info');
      const q = query(agencyInfoRef, firestoreLimit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const info: AgencyInfo = {
          id: doc.id,
          agencyName: data.agencyName,
          logoUrl: data.logoUrl,
          tagline: data.tagline,
          about: data.about,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          socialMedia: data.socialMedia,
          licenseNumber: data.licenseNumber,
          updatedAt: data.updatedAt?.toDate(),
          updatedBy: data.updatedBy,
        };
        setAgencyInfo(info);
        setFormData({
          agencyName: info.agencyName,
          logoUrl: info.logoUrl,
          tagline: info.tagline || '',
          about: info.about,
          address: info.address,
          phone: info.phone,
          email: info.email,
          website: info.website || '',
          facebook: info.socialMedia?.facebook || '',
          linkedin: info.socialMedia?.linkedin || '',
          twitter: info.socialMedia?.twitter || '',
          licenseNumber: info.licenseNumber || '',
        });
      }
    } catch (error) {
      console.error('Error fetching agency info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `agency/logo_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData({ ...formData, logoUrl: downloadURL });
      alert('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        agencyName: formData.agencyName,
        logoUrl: formData.logoUrl,
        tagline: formData.tagline,
        about: formData.about,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        socialMedia: {
          facebook: formData.facebook,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
        },
        licenseNumber: formData.licenseNumber,
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid || 'unknown',
      };

      if (agencyInfo) {
        // Update existing
        const agencyRef = doc(db, 'agency_info', agencyInfo.id);
        await updateDoc(agencyRef, data);
      } else {
        // Create new
        await addDoc(collection(db, 'agency_info'), data);
      }

      alert('Agency information saved successfully!');
      fetchAgencyInfo();
    } catch (error) {
      console.error('Error saving agency info:', error);
      alert('Failed to save agency information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Agency Information</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Configure how your agency appears on the public employer portal
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
          {formData.logoUrl && (
            <img
              src={formData.logoUrl}
              alt="Logo"
              className="h-12 sm:h-16 w-auto bg-white rounded px-2 sm:px-3 py-1 sm:py-2"
            />
          )}
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
              {formData.agencyName || 'Your Agency Name'}
            </h2>
            {formData.tagline && <p className="text-sm sm:text-base text-blue-100 mt-1">{formData.tagline}</p>}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-blue-100">
          This is how your agency will appear to employers
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agency Logo
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {formData.logoUrl && (
              <img
                src={formData.logoUrl}
                alt="Logo preview"
                className="h-16 sm:h-20 w-auto border border-gray-300 rounded p-2"
              />
            )}
            <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">
              {uploading ? 'Uploading...' : 'Upload Logo'}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-2">
              Agency Name *
            </label>
            <input
              type="text"
              id="agencyName"
              name="agencyName"
              value={formData.agencyName}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g., Your Trusted Recruitment Partner"
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* About */}
        <div>
          <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
            About Agency *
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe your agency and services..."
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                License Number
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                id="facebook"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={fetchAgencyInfo}
            className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
