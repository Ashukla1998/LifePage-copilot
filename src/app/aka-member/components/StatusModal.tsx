'use client';

import { FiPower, FiCheckCircle } from 'react-icons/fi';
import { AkaMember } from '../types';

interface StatusModalProps {
  isOpen: boolean;
  member: AkaMember | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function StatusModal({
  isOpen,
  member,
  onClose,
  onConfirm,
}: StatusModalProps) {
  if (!isOpen || !member) return null;

  const willBeActive = !member.is_active;

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
          {willBeActive ? 'Activate Member' : 'Deactivate Member'}
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          Are you sure you want to {willBeActive ? 'activate' : 'deactivate'}{' '}
          <span className="font-semibold text-slate-800">{member.name}</span>?
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition ${
              willBeActive
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {willBeActive ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}