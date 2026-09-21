'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { AkaProjects } from '../types';

export interface AkaProjectsEditFormData {
  title: string;
  description: string;
  location: string;
  size: string;
  buildup: string;
  service: string;
  status: string;
  gallerypath: string;
  category: string;
  is_active: boolean;
  cover: File | null; // Null if keeping existing image
}

interface EditProjectModalProps {
  isOpen: boolean;
  project: AkaProjects | null;
  onClose: () => void;
  onSubmit: (projectid: number, data: AkaProjectsEditFormData) => Promise<void> | void;
}

const INITIAL_FORM_STATE: AkaProjectsEditFormData = {
  title: '',
  description: '',
  location: '',
  size: '',
  buildup: '',
  service: '',
  status: '',
  gallerypath: '',
  category: '',
  is_active: true,
  cover: null,
};

export default function EditProjectModal({
  isOpen,
  project,
  onClose,
  onSubmit,
}: EditProjectModalProps) {
  const [formData, setFormData] = useState<AkaProjectsEditFormData>(INITIAL_FORM_STATE);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when project changes or modal opens
  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        location: project.location || '',
        size: project.size || '',
        buildup: project.buildup || '',
        service: project.service || '',
        status: project.status || '',
        gallerypath: project.gallerypath || '',
        category: project.category || '',
        is_active: project.is_active ?? true,
        cover: null,
      });
      // Use existing string URL as preview initially
      setPreviewUrl(project.cover || null);
    } else {
      setPreviewUrl(null);
      setFormData(INITIAL_FORM_STATE);
    }
  }, [isOpen, project]);

  // Clean up object URLs to prevent leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen || !project) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      cover: file,
    }));

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      // Revert to original project cover if cleared
      setPreviewUrl(project.cover || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(project.projectid, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Project</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update project details and assets.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm text-slate-700">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. GEIMS HOSPITAL"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Healthcare, Residential"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Progress Status <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="e.g. 100% completed, In Progress"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Location & Services */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Dhulkot, Dehradun"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Services Provided <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  placeholder="e.g. Architecture | Interior | Landscape"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Size & Buildup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Land Size <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g. 20 acres"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Built-up Area <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="buildup"
                  value={formData.buildup}
                  onChange={handleChange}
                  placeholder="e.g. 12,00,000 sq.ft."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Gallery Path & Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Gallery Folder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="gallerypath"
                  value={formData.gallerypath}
                  onChange={handleChange}
                  placeholder="e.g. /images/projects/Healthcare/"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cover Image <span className="text-slate-400 font-normal">(optional if unchanged)</span>
                </label>

                <div className="flex items-center gap-3">
                  {previewUrl && (
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    name="cover"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief project details..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
              />
            </div>

            {/* Active Toggle */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition"
              />
              <div>
                <span className="font-semibold text-slate-800 text-xs">Active Project</span>
                <p className="text-[11px] text-slate-500">
                  Visible to users across the platform when enabled.
                </p>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}