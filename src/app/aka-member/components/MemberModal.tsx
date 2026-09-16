// 'use client';

// import { useState, useEffect } from 'react';
// import { FiX, FiLoader } from 'react-icons/fi';
// import { AkaMember, AkaMemberFormData } from '../types';

// interface MemberModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: (newOrUpdatedMember: AkaMember) => void;
//   initialData?: AkaMember | null;
// }

// const API_URL = 'https://www.lifepage.in/n/api/AkaMember';

// export default function MemberModal({
//   isOpen,
//   onClose,
//   onSuccess,
//   initialData,
// }: MemberModalProps) {
//   const [formData, setFormData] = useState<AkaMemberFormData>({
//     name: '',
//     role: '',
//     photo: '',
//     degree: '',
//     category: '',
//     experience: '',
//     description: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         name: initialData.name || '',
//         role: initialData.role || '',
//         photo: initialData.photo || '',
//         degree: initialData.degree ? initialData.degree.join(', ') : '',
//         category: initialData.category || '',
//         experience: initialData.experience || '',
//         description: initialData.description || '',
//       });
//     } else {
//       setFormData({
//         name: '',
//         role: '',
//         photo: '',
//         degree: '',
//         category: '',
//         experience: '',
//         description: '',
//       });
//     }
//     setErrorMsg(null);
//   }, [initialData, isOpen]);

//   if (!isOpen) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMsg(null);

//     if (!formData.name.trim() || !formData.role.trim()) {
//       setErrorMsg('Name and Role are required.');
//       return;
//     }

//     const degreeArray = formData.degree
//       ? formData.degree.split(',').map((d) => d.trim()).filter(Boolean)
//       : [];

//     setLoading(true);

//     try {
//       // POST payload matching backend expectations
//       const payload = {
//         name: formData.name.trim(),
//         role: formData.role.trim(),
//         photo: formData.photo.trim() || null,
//         degree: degreeArray,
//         category: formData.category.trim() || null,
//         experience: formData.experience.trim() || null,
//         description: formData.description.trim() || null,
//         is_active: initialData ? initialData.is_active : true,
//         ...(initialData ? { memberid: initialData.memberid } : {}),
//       };

//       const res = await fetch(API_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const result = await res.json();

//       if (res.ok && result.success === 1) {
//         onSuccess(result.data);
//         onClose();
//       } else {
//         setErrorMsg(result.message || 'Failed to submit member details.');
//       }
//     } catch (err: unknown) {
//       setErrorMsg(err instanceof Error ? err.message : 'Network error occurred.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between pb-4 border-b border-slate-100">
//           <h3 className="text-lg font-semibold text-slate-900">
//             {initialData ? 'Edit Member' : 'Add New Member'}
//           </h3>
//           <button
//             onClick={onClose}
//             disabled={loading}
//             className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
//           >
//             <FiX className="w-5 h-5" />
//           </button>
//         </div>

//         {errorMsg && (
//           <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
//             {errorMsg}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="mt-4 space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
//               Full Name *
//             </label>
//             <input
//               type="text"
//               required
//               disabled={loading}
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               placeholder="e.g. Dr. John Doe"
//               className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
//                 Role *
//               </label>
//               <input
//                 type="text"
//                 required
//                 disabled={loading}
//                 value={formData.role}
//                 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                 placeholder="e.g. Senior Career Advisor"
//                 className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
//                 Year of Experience
//               </label>
//               <input
//                 type="text"
//                 disabled={loading}
//                 value={formData.experience}
//                 onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
//                 placeholder="e.g. 2001"
//                 className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
//               Degrees / Qualifications (Comma-separated)
//             </label>
//             <input
//               type="text"
//               disabled={loading}
//               value={formData.degree}
//               onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
//               placeholder="e.g. B.Tech, MBA, Ph.D"
//               className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
//               Category
//             </label>
//             <input
//               type="text"
//               disabled={loading}
//               value={formData.category}
//               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//               placeholder="Design Team, Maenagement Team, etc."
//               className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
//               Photo
//             </label>
//             <input
//               type="url"
//               disabled={loading}
//               value={formData.photo}
//               onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
//               placeholder="https://..."
//               className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
//               Description
//             </label>
//             <textarea
//               rows={3}
//               disabled={loading}
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               placeholder="Brief professional summary..."
//               className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-100"
//             />
//           </div>

//           <div className="pt-2 flex justify-end gap-2">
//             <button
//               type="button"
//               disabled={loading}
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-60"
//             >
//               {loading && <FiLoader className="w-4 h-4 animate-spin" />}
//               {initialData ? 'Save Changes' : 'Create Member'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { FiX, FiLoader, FiUploadCloud } from 'react-icons/fi';
import { AkaMember, AkaMemberFormData } from '../types';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrUpdatedMember: AkaMember) => void;
  initialData?: AkaMember | null;
}

const API_URL = 'https://www.lifepage.in/n/api/AkaMember';

export default function MemberModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: MemberModalProps) {
  const [formData, setFormData] = useState<AkaMemberFormData>({
    name: '',
    role: '',
    photo: '',
    degree: '',
    category: '',
    experience: '',
    description: '',
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        role: initialData.role || '',
        photo: initialData.photo || '',
        degree: initialData.degree,
        category: (initialData as any).category || '',
        experience: initialData.experience || '',
        description: initialData.description || '',
      });
      setPreviewUrl(initialData.photo || '');
    } else {
      setFormData({
        name: '',
        role: '',
        photo: '',
        degree: '',
        category: '',
        experience: '',
        description: '',
      });
      setPreviewUrl('');
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit size to 2MB
    // if (file.size > 2 * 1024 * 1024) {
    //   setErrorMsg('Image size exceeds 2MB limit.');
    //   return;
    // }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      setFormData((prev) => ({ ...prev, photo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, photo: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.role.trim()) {
      setErrorMsg('Name and Role are required.');
      return;
    }

    const degreeArray = formData.degree
      ? formData.degree.split(',').map((d) => d.trim()).filter(Boolean)
      : [];

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        photo: formData.photo.trim() || null,
        degree: degreeArray,
        category: formData.category ? formData.category.trim() : null,
        experience: formData.experience.trim() || null,
        description: formData.description.trim() || null,
        is_active: initialData ? initialData.is_active : true,
        ...(initialData ? { memberid: initialData.memberid } : {}),
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success === 1) {
        onSuccess(result.data);
        onClose();
      } else {
        setErrorMsg(result.message || 'Failed to submit member details.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {initialData ? 'Edit Member' : 'Add New Member'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              disabled={loading}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. John Doe"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Role *
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Senior Career Advisor"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Year of Experience
              </label>
              <input
                type="text"
                disabled={loading}
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 2001"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Degrees / Qualifications
            </label>
            <input
              type="text"
              disabled={loading}
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="e.g. B.Tech | MBA | Ph.D"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <input
              type="text"
              disabled={loading}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Design Team, Management Team"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>

          {/* Photo File Input with Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiUploadCloud className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500
                    file:mr-3 file:py-1.5 file:px-3 file:rounded-lg
                    file:border-0 file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 file:cursor-pointer
                    cursor-pointer disabled:opacity-50"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>PNG, JPG, WEBP up to 2MB</span>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={loading}
                      className="text-rose-500 hover:text-rose-700 font-medium underline transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              disabled={loading}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief professional summary..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-60"
            >
              {loading && <FiLoader className="w-4 h-4 animate-spin" />}
              {initialData ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}