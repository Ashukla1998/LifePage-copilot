'use client';

import { useState, useEffect } from 'react';
import { FiX, FiLoader, FiMenu, FiChevronUp, FiChevronDown, FiSave } from 'react-icons/fi';
import { AkaProjects } from '../types';

export interface SliderOrderItem {
  projectid: number;
  slider_order: number;
}

interface SliderOrderModalProps {
  isOpen: boolean;
  projects: AkaProjects[];
  onClose: () => void;
  onSaved: (items: SliderOrderItem[]) => void;
}

// Projects with an order come first (ascending); unordered ones keep their list order at the end
export const sortBySliderOrder = (list: AkaProjects[]) =>
  [...list].sort(
    (a, b) => (a.slider_order ?? Number.MAX_SAFE_INTEGER) - (b.slider_order ?? Number.MAX_SAFE_INTEGER)
  );

export default function SliderOrderModal({
  isOpen,
  projects,
  onClose,
  onSaved,
}: SliderOrderModalProps) {
  const [items, setItems] = useState<AkaProjects[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems(sortBySliderOrder(projects.filter((p) => p.show_in_slider)));
    }
  }, [isOpen, projects]);

  if (!isOpen) return null;

  const moveItem = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null) moveItem(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleSave = async () => {
    const payload: SliderOrderItem[] = items.map((p, i) => ({
      projectid: p.projectid,
      slider_order: i + 1,
    }));

    try {
      setIsSaving(true);
      const res = await fetch('https://www.lifepage.in/n/api/UpdateSliderOrder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: payload }),
      });

      const result = await res.json();

      if (result.success === 1) {
        onSaved(payload);
        onClose();
      } else {
        alert(result.message || 'Failed to update slider order');
      }
    } catch (err) {
      console.error('Error updating slider order:', err);
      alert('Failed to update slider order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Home Slider Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">Drag projects to set the order they appear in the slider.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700">
          {items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((project, index) => (
                <li
                  key={project.projectid}
                  draggable
                  onDragStart={(e) => {
                    setDragIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (overIndex !== index) setOverIndex(index);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className={`flex items-center gap-3 p-2.5 bg-white rounded-xl border transition cursor-grab active:cursor-grabbing select-none ${
                    dragIndex === index
                      ? 'opacity-40 border-slate-200'
                      : overIndex === index && dragIndex !== null
                      ? 'border-blue-400 ring-2 ring-blue-100'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <FiMenu className="w-4 h-4 text-slate-400 shrink-0" />

                  <span className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
                    {index + 1}
                  </span>

                  <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    {project.cover ? (
                      <img src={project.cover} alt={project.title} className="w-full h-full object-cover" draggable={false} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                        {project.title ? project.title.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-xs truncate">{project.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {project.category || 'General'}
                      {!project.is_active && <span className="ml-1.5 text-rose-500">· Inactive</span>}
                    </div>
                  </div>

                  <div className="flex flex-col shrink-0">
                    <button
                      type="button"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={index === 0}
                      title="Move up"
                      className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                    >
                      <FiChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={index === items.length - 1}
                      title="Move down"
                      className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                    >
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center text-sm text-slate-400">
              No projects are marked &quot;Show in Home Slider&quot; yet.
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || items.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {isSaving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}
