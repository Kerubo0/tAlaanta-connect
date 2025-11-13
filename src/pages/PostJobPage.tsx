/**
 * Post Job Page
 * Create new job postings (Client only)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext-supabase';
import { createJob, JobType, ExperienceLevel } from '../lib/jobs-supabase';
import { Briefcase, DollarSign, Clock, Users, X } from 'lucide-react';

const categories = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Data Science',
  'Content Writing',
  'Marketing',
  'Video Editing',
  'Graphics Design',
  'Other',
];

export default function PostJobPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [] as string[],
    skillInput: '',
    budget: '',
    jobType: 'fixed-price' as JobType,
    experienceLevel: 'intermediate' as ExperienceLevel,
    duration: '',
    deadline: '',
    location: '',
    remote: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      setError('Please enter a valid budget');
      return;
    }

    if (!userProfile) {
      setError('You must be logged in to post a job');
      return;
    }

    setLoading(true);

    try {
      await createJob({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: formData.skills,
        budget: parseFloat(formData.budget),
        job_type: formData.jobType,
        experience_level: formData.experienceLevel,
        duration: formData.duration,
        deadline: formData.deadline,
        location: formData.location,
        remote: formData.remote,
        client_id: userProfile.uid,
        client_name: userProfile.display_name,
        client_address: userProfile.wallet_address,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const addSkill = () => {
    const skill = formData.skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill],
        skillInput: '',
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-600 text-white p-3 rounded-lg">
              <Briefcase size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600">Find the perfect freelancer for your project</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Full-Stack Developer for E-commerce Website"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the project, requirements, deliverables, and any other important details..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={formData.skillInput}
                onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                onKeyPress={handleSkillKeyPress}
                placeholder="e.g., React, Node.js, TypeScript"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-purple-900"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Budget & Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              >
                <option value="fixed-price">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
          </div>

          {/* Duration & Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Duration
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 2-3 weeks"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., New York, USA (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                name="remote"
                checked={formData.remote}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-sm text-gray-700">Remote work allowed</span>
            </label>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
