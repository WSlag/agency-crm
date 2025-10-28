import React from 'react';
import { PublicResume } from '../../types/resume';
import { calculateTotalExperience, getHighestEducation } from '../../services/resumeBuilder';

interface ResumeCardProps {
  resume: PublicResume;
  onClick: () => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onClick }) => {
  // Calculate experience from work history
  const totalExperience = React.useMemo(() => {
    let totalMonths = 0;
    resume.workExperience.forEach((exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    });
    return Math.floor(totalMonths / 12);
  }, [resume.workExperience]);

  // Get highest education
  const education = React.useMemo(() => {
    if (resume.education.length === 0) return 'Not specified';
    const educationLevels = [
      'Elementary',
      'High School',
      'Vocational',
      'College',
      'Bachelor',
      'Master',
      'Doctorate',
    ];
    let highest = resume.education[0].level;
    let highestIndex = educationLevels.findIndex(
      (level) => level.toLowerCase() === highest.toLowerCase()
    );
    resume.education.forEach((edu) => {
      const currentIndex = educationLevels.findIndex(
        (level) => level.toLowerCase() === edu.level.toLowerCase()
      );
      if (currentIndex > highestIndex) {
        highest = edu.level;
        highestIndex = currentIndex;
      }
    });
    return highest;
  }, [resume.education]);

  // Get top 3 skills
  const topSkills = resume.skills.slice(0, 3);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-[#F18A00] group"
    >
      {/* Photo Section */}
      <div className="bg-[#00263E] p-6 flex justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00263E] to-[#003d5c] opacity-90"></div>
        {resume.photoUrl ? (
          <img
            src={resume.photoUrl}
            alt={resume.fullName}
            className="w-32 h-32 rounded-lg border-4 border-white object-cover shadow-lg relative z-10"
          />
        ) : (
          <div className="w-32 h-32 rounded-lg border-4 border-white bg-gray-300 flex items-center justify-center shadow-lg relative z-10">
            <svg
              className="w-16 h-16 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-5">
        <h3 className="text-lg font-black text-[#00263E] mb-2 text-center" style={{fontFamily: 'Lato, sans-serif'}}>
          {resume.fullName}
        </h3>

        {/* Basic Info */}
        <div className="flex justify-center items-center space-x-3 text-xs text-[#63656A] mb-3 font-light">
          <span>{resume.age} yrs</span>
          <span>•</span>
          <span>{resume.nationality}</span>
        </div>

        {/* Position & Country */}
        <div className="mb-4 space-y-2">
          {resume.positionApplied && (
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#F7F7F7] text-[#00263E] uppercase tracking-wide" style={{fontFamily: 'Lato, sans-serif'}}>
                {resume.positionApplied}
              </span>
            </div>
          )}
          {resume.countryDestination && (
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#F18A00] text-white" style={{fontFamily: 'Lato, sans-serif'}}>
                📍 {resume.countryDestination}
              </span>
            </div>
          )}
        </div>

        {/* Education & Experience */}
        <div className="border-t border-gray-200 pt-3 mb-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#63656A] font-light">Education:</span>
            <span className="font-bold text-[#00263E]" style={{fontFamily: 'Lato, sans-serif'}}>{education}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#63656A] font-light">Experience:</span>
            <span className="font-bold text-[#00263E]" style={{fontFamily: 'Lato, sans-serif'}}>
              {totalExperience} {totalExperience === 1 ? 'yr' : 'yrs'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#63656A] font-light">Languages:</span>
            <span className="font-bold text-[#00263E]" style={{fontFamily: 'Lato, sans-serif'}}>
              {resume.languages.length}
            </span>
          </div>
        </div>

        {/* Top Skills */}
        {topSkills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1 justify-center">
              {topSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-light bg-gray-100 text-[#63656A] rounded"
                >
                  {skill}
                </span>
              ))}
              {resume.skills.length > 3 && (
                <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-[#63656A] rounded">
                  +{resume.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Button */}
        <button className="w-full bg-[#F18A00] text-white py-2 px-4 rounded-lg hover:bg-[#d67a00] transition-all duration-300 font-bold text-sm uppercase tracking-wide" style={{fontFamily: 'Lato, sans-serif'}}>
          View Details
        </button>
      </div>
    </div>
  );
};
