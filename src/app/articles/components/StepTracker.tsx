import { Check } from "lucide-react";
import type { ContentSection, Step } from "@/lib/articles";

// The six standard article sections, matched by the start of each section title
const STEP_LABELS = ["What Is", "Education", "Skills", "Positives", "Challenges", "A Day"];

interface StepTrackerProps {
  sections: ContentSection[];
  step: Step;
}

export default function StepTracker({ sections, step }: StepTrackerProps) {
  const currentTitle = sections[step.section]?.title.toLowerCase() ?? "";

  return (
    <ol className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Article sections">
      {STEP_LABELS.map((label, idx) => {
        const key = label.toLowerCase();
        const sectionIndex = sections.findIndex((s) => s.title.toLowerCase().startsWith(key));
        const isCompleted = sectionIndex !== -1 && sectionIndex < step.section;
        const isActive = currentTitle.startsWith(key);

        return (
          <li
            key={label}
            aria-current={isActive ? "step" : undefined}
            className={`flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-semibold transition-all duration-300 sm:text-[13px] ${
              isCompleted
                ? "bg-[#C9822B] text-white"
                : isActive
                  ? "bg-[#fdf6ec] text-[#B87523] ring-2 ring-[#C9822B]"
                  : "bg-gray-50 text-gray-400"
            }`}
          >
            {isCompleted ? (
              <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
            ) : (
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  isActive ? "bg-[#C9822B] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {idx + 1}
              </span>
            )}
            <span className="truncate">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
