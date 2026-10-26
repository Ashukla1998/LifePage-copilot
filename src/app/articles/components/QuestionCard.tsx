import { MessageCircleQuestion } from "lucide-react";
import { questionText, type QuestionDetail } from "@/lib/articles";

interface QuestionCardProps {
  question: QuestionDetail;
  value: number;
  onChange: (value: number) => void;
}

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const text = questionText(question.que_category, question.question);
  const fill = ((value - 1) / 9) * 100;

  return (
    <div className="mt-6 w-full rounded-2xl border border-amber-100 bg-gradient-to-br from-[#fdf6ec] via-[#fffaf3] to-white p-5 text-left sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#B87523]">
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            Rate this
          </span>
          <h3 id="rating-question" className="text-base font-bold leading-snug text-gray-900 sm:text-lg">
            {text}
          </h3>
        </div>
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C9822B] text-xl font-extrabold text-white shadow-[0_8px_20px_-8px_rgba(201,130,43,0.7)]"
        >
          {value}
        </span>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        aria-labelledby="rating-question"
        aria-valuetext={`${value} out of 10`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#C9822B]"
        style={{ background: `linear-gradient(to right, #C9822B ${fill}%, #e5e7eb ${fill}%)` }}
      />

      <div className="mt-2 flex justify-between px-0.5 text-[11px] font-medium text-gray-400" aria-hidden="true">
        {RATINGS.map((rating) => (
          <span key={rating} className={rating === value ? "font-bold text-[#C9822B]" : ""}>
            {rating}
          </span>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500" aria-hidden="true">
        <span>Not at all</span>
        <span>Absolutely</span>
      </div>
    </div>
  );
}
