'use client';

import { useState } from 'react';
import { FiPower, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { AkaProjects } from '../types';

interface StatusModalProps {
  isOpen: boolean;
  project: AkaProjects | null;
  onClose: () => void;
  onSuccess: (updatedProject: AkaProjects) => void;
}

const EDIT_API_URL = 'https://www.lifepage.in/n/api/EditMember';

export default function StatusModal({
  isOpen,
  project,
  onClose,
  onSuccess,
}: StatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const willBeActive = !project.is_active;

  // const handleConfirm = async () => {
  //   setErrorMsg(null);
  //   setLoading(true);

  //   try {
  //     const payload = {
  //       memberid: member.memberid,
  //       name: member.name,
  //       role: member.role,
  //       photo: member.photo || null,
  //       degree: member.degree || null,
  //       category: member.category,
  //       experience: member.experience || null,
  //       description: member.description || null,
  //       is_active: willBeActive,
  //     };

  //     const res = await fetch(EDIT_API_URL, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const result = await res.json();

  //     if (res.ok && result.success === 1) {
  //       onSuccess(result.data || { ...member, is_active: willBeActive });
  //       onClose();
  //     } else {
  //       setErrorMsg(result.message || 'Failed to update member status.');
  //     }
  //   } catch (err: unknown) {
  //     setErrorMsg(err instanceof Error ? err.message : 'Network error occurred.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
            willBeActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {willBeActive ? <FiCheckCircle className="w-5 h-5" /> : <FiPower className="w-5 h-5" />}
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          {willBeActive ? 'Activate Project' : 'Deactivate Project'}
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          Are you sure you want to {willBeActive ? 'activate' : 'deactivate'}{' '}
          <span className="font-semibold text-slate-800">{project.title}</span>?
        </p>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            // onClick={handleConfirm}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition disabled:opacity-60 ${
              willBeActive
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {loading && <FiLoader className="w-4 h-4 animate-spin" />}
            {willBeActive ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}