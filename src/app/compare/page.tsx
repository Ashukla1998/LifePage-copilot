'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus_Jakarta_Sans } from 'next/font/google';
import {
  ArrowRight,
  Check,
  GraduationCap,
  RefreshCw,
  Search,
  Swords,
  ThumbsUp,
  TriangleAlert,
  Trophy,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

const CATEGORIES: { key: string; icon: LucideIcon; color: string }[] = [
  { key: 'Education', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
  { key: 'Skills', icon: Wrench, color: 'text-violet-600 bg-violet-50' },
  { key: 'Positives', icon: ThumbsUp, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'Challenges', icon: TriangleAlert, color: 'text-rose-500 bg-rose-50' },
];

interface Question {
  question: string;
  que_category: 'Skills' | 'Education' | 'Positives' | 'Challenges' | string;
  percentage: number;
}

interface Session {
  sessionid: string;
  topic: string;
  thumbfile?: string;
  avatar?: string;
  fieldOfStudy?: string;
  division?: string;
  subdivision?: string;
}

interface CareerData {
  session: Session;
  questions: Question[];
}

interface UserEventBody {
  userid: string;
  number_explore_click?: number;
  number_none_click?: number;
}

function CompareCareersContent() {
  const searchParams = useSearchParams();
  const term = searchParams.get('career') || '';

  const [leftCareer, setLeftCareer] = useState<CareerData | null>(null);
  const [rightCareer, setRightCareer] = useState<CareerData | null>(null);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');

  const [leftClickCount, setLeftClickCount] = useState<number>(0);
  const [rightClickCount, setRightClickCount] = useState<number>(0);
  const [count, setCount] = useState<string>('');

  const excludeList = useRef<string[]>([]);
  const lastSelected = useRef<'left' | 'right' | null>(null);
  const usedQuestionsMap = useRef<Record<string, Set<string>>>({});
  const excludedTopics = useRef<string[]>([]);

  // 🔹 FETCH NAVBAR COUNT
  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const res = await fetch('https://www.lifepage.in/n/api/navbar', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const json = await res.json();
        if (json.success === 1) {
          setCount(json.count);
        }
      } catch (error) {
        console.error('Error fetching navbar data:', error);
      }
    };
    fetchNavbarData();
  }, []);

  // 🔹 INIT DATA FETCH BASED ON URL "?career=..."
  useEffect(() => {
    async function init() {
      if (!term) return;
      try {
        const LeftResult = await fetch('https://www.lifepage.in/n/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: term }),
        });
        const LeftData = await LeftResult.json();

        if (!LeftData.success || !LeftData.data) {
          console.error('Career not found in API search.');
          return;
        }

        const res = await fetch('https://www.lifepage.in/n/api/getUserQuestions', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (!data.success || !data.data || data.data.length === 0) {
          return;
        }

        const initialLeft: CareerData = LeftData.data;
        const availableCareers = data.data.filter(
          (item: CareerData) => item.session.sessionid !== initialLeft.session.sessionid
        );

        if (availableCareers.length === 0) {
          return;
        }

        const initialRight: CareerData = availableCareers[0];

        setLeftCareer(initialLeft);
        setRightCareer(initialRight);

        excludeList.current = [
          initialLeft.session.sessionid,
          initialRight.session.sessionid,
        ];
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, [term]);

  // 🔹 EVENT TRACKING
  const trackClick = (type: 'explore' | 'none') => {
    const userid =
      typeof window !== 'undefined' ? sessionStorage.getItem('lp_userid') : null;
    if (!userid) {
      console.warn("Tracking skipped: 'lp_userid' missing from sessionStorage.");
      return;
    }

    const body: UserEventBody = { userid };
    if (type === 'explore') {
      body.number_explore_click = 1;
    } else if (type === 'none') {
      body.number_none_click = 1;
    }

    fetch('https://www.lifepage.in/n/api/update_user_event', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch((err) => console.error('Tracking error:', err));
  };

  // 🔹 GET NEXT RELEVANT CAREER
  // const getNextCareer = async (baseCareer: CareerData): Promise<CareerData | null> => {
  //   const sessionId = baseCareer.session.sessionid;
  //   if (!usedQuestionsMap.current[sessionId]) {
  //     usedQuestionsMap.current[sessionId] = new Set<string>();
  //   }
  //   const usedSet = usedQuestionsMap.current[sessionId];
  //   const dynamicExclude = [
  //     ...excludeList.current,
  //     leftCareer?.session.sessionid,
  //     rightCareer?.session.sessionid,
  //   ].filter((id): id is string => !!id);

  //   const filterAndSort = (cat: string) =>
  //     baseCareer.questions
  //       .filter((q) => q.que_category === cat)
  //       .sort((a, b) => b.percentage - a.percentage);

  //   const matchCategories = ['Skills', 'Education', 'Positives', 'Challenges'];

  //   for (const category of matchCategories) {
  //     const questions = filterAndSort(category);
  //     for (const item of questions) {
  //       if (usedSet.has(item.question)) continue;

  //       const res = await fetch('https://www.lifepage.in/n/api/getCareerByQuestion', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           question: item.question,
  //           percentage: item.percentage,
  //           exclude: [...new Set(dynamicExclude)],
  //           names: [baseCareer.session.topic],
  //         }),
  //       });

  //       const data = await res.json();
  //       usedSet.add(item.question);
  //       if (data.data && data.data.length > 0) {
  //         const newCareer: CareerData = data.data[0];
  //         excludeList.current.push(newCareer.session.sessionid);
  //         return newCareer;
  //       }
  //     }
  //   }

  //   try {
  //     const res = await fetch('https://www.lifepage.in/n/api/randomCareer', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         exclude: [...new Set(dynamicExclude)],
  //         names: [baseCareer.session.topic],
  //       }),
  //     });
  //     const data = await res.json();
  //     if (data.data && data.data.length > 0) {
  //       const newCareer: CareerData = data.data[0];
  //       excludeList.current.push(newCareer.session.sessionid);
  //       return newCareer;
  //     }
  //   } catch (err) {
  //     console.error('Random API failed:', err);
  //   }
  //   return null;
  // };
  const getNextCareer = async (baseCareer: CareerData): Promise<CareerData | null> => {
    // Extract category arrays with threshold >= 3%
    const getCategoryQuestions = (cat: string) =>
      baseCareer.questions
        .filter((q) => q.que_category === cat && q.percentage >= 3)
        .map((q) => q.question);

    const skills = getCategoryQuestions('Skills');
    const education = getCategoryQuestions('Education');
    const positives = getCategoryQuestions('Positives');
    const challenges = getCategoryQuestions('Challenges');

    const dynamicExclude = Array.from(
      new Set([
        ...excludeList.current,
        leftCareer?.session.sessionid,
        rightCareer?.session.sessionid,
      ].filter((id): id is string => !!id))
    );

    const dynamicTopicExclude = Array.from(
      new Set([
        ...excludedTopics.current,
        leftCareer?.session.topic,
        rightCareer?.session.topic,
      ].filter((t): t is string => !!t))
    );

    try {
      const res = await fetch('https://www.lifepage.in/n/api/getCareerByQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_sessionid: baseCareer.session.sessionid,
          division: baseCareer.session.division,
          subdivision: baseCareer.session.subdivision,
          skills,
          education,
          positives,
          challenges,
          exclude: dynamicExclude,
          names: dynamicTopicExclude,
        }),
      });

      const data = await res.json();
      if (data?.success && data?.data && data.data.length > 0) {
        const nextMatch: CareerData = data.data[0];
        excludeList.current.push(nextMatch.session.sessionid);
        excludedTopics.current.push(nextMatch.session.topic);
        return nextMatch;
      }
    } catch (err) {
      console.error('Category priority search error:', err);
    }

    // Fallback: If tag search yields nothing, pull an unseen random career
    try {
      const fallbackRes = await fetch('https://www.lifepage.in/n/api/randomCareer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exclude: dynamicExclude,
          names: dynamicTopicExclude,
        }),
      });
      const fallbackData = await fallbackRes.json();
      if (fallbackData?.success && fallbackData?.data && fallbackData.data.length > 0) {
        const randomMatch: CareerData = fallbackData.data[0];
        excludeList.current.push(randomMatch.session.sessionid);
        excludedTopics.current.push(randomMatch.session.topic);
        return randomMatch;
      }
    } catch (err) {
      console.error('Random fallback failed:', err);
    }

    return null;
  };


  // 🔹 CLICK INTERACTION HANDLERS
  const selectLeft = async () => {
    if (!leftCareer) return;
    const nextCount = leftClickCount + 1;
    setLeftClickCount(nextCount);
    setSelectedSide('left');
    trackClick('explore');

    if (nextCount >= 5) return;

    if (lastSelected.current === 'right') {
      setRightClickCount(0);
    }
    if (lastSelected.current && lastSelected.current !== 'left') {
      excludeList.current = [];
    }
    lastSelected.current = 'left';

    const newCareer = await getNextCareer(leftCareer);
    if (newCareer) {
      excludeList.current.push(newCareer.session.sessionid);
      setRightCareer(newCareer);
    }
  };

  const selectRight = async () => {
    if (!rightCareer) return;
    const nextCount = rightClickCount + 1;
    setRightClickCount(nextCount);
    setSelectedSide('right');
    trackClick('explore');

    if (lastSelected.current === 'left') {
      setLeftClickCount(0);
    }
    if (nextCount >= 5) return;

    if (lastSelected.current && lastSelected.current !== 'right') {
      excludeList.current = [];
    }
    lastSelected.current = 'right';

    const newCareer = await getNextCareer(rightCareer);
    if (newCareer) {
      excludeList.current.push(newCareer.session.sessionid);
      setLeftCareer(newCareer);
    }
  };

  const openCareer = (topic: string) => {
    window.location.href = `/advisor-list?career=${encodeURIComponent(topic)}`;
  };

  // 🔹 SKIP NEXT / NONE OF THE ABOVE BUTTON
  const nextCareer = async () => {
    setLeftClickCount(0);
    setRightClickCount(0);
    lastSelected.current = null;
    trackClick('none');

    if (leftCareer && !excludeList.current.includes(leftCareer.session.sessionid)) {
      excludeList.current.push(leftCareer.session.sessionid);
    }
    if (rightCareer && !excludeList.current.includes(rightCareer.session.sessionid)) {
      excludeList.current.push(rightCareer.session.sessionid);
    }

    try {
      const res = await fetch('https://www.lifepage.in/n/api/randomCareer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exclude: excludeList.current,
          names: [leftCareer?.session.topic, rightCareer?.session.topic].filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!data.success || !data.data || data.data.length < 2) {
        alert('Not enough data available!');
        return;
      }

      const initialLeft: CareerData = data.data[0];
      const initialRight: CareerData = data.data[1];

      setLeftCareer(initialLeft);
      setRightCareer(initialRight);

      excludeList.current.push(initialLeft.session.sessionid);
      excludeList.current.push(initialRight.session.sessionid);
      excludeList.current = [...new Set(excludeList.current)];
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 PROGRESS HUD
  const renderLearnMore = (count: number, career: CareerData | null, isVisible: boolean) => {
    if (!isVisible || !career || count === 0) {
      return (
        <div className="flex h-12 items-center justify-center text-xs font-medium text-gray-400 transition group-hover/col:text-[#C9822B]">
          Tap to choose this career
        </div>
      );
    }

    if (count >= 5) {
      return (
        <div className="flex h-12 items-center justify-center">
          <button
            className="group/btn inline-flex items-center gap-2 rounded-full bg-[#C9822B] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#b4721f] hover:shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              openCareer(career.session.topic);
            }}
          >
            <Trophy className="h-4 w-4" />
            Learn More
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex h-12 flex-col justify-center px-1">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-800">Unlocking Learn More</span>
          <span className="font-semibold text-[#C9822B]">{count * 20}%</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <span
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                step <= count ? 'bg-[#C9822B]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderCardContent = (career: CareerData | null, isSelected: boolean) => {
    if (!career) {
      return (
        <div className="flex h-[400px] animate-pulse flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-44 bg-gray-200" />
          <div className="grid flex-1 grid-cols-2 gap-2 p-3">
            {CATEGORIES.map(({ key }) => (
              <div key={key} className="rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      );
    }

    const { session, questions } = career;

    const img = session.thumbfile
      ? `https://storage.googleapis.com/lifepage-video-android/${session.sessionid}/${session.thumbfile}`
      : '/support/NoCareer.png';

    return (
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white transition duration-300 ${
          isSelected
            ? 'border-[#C9822B] shadow-[0_16px_40px_-14px_rgba(201,130,43,0.45)] ring-2 ring-[#C9822B]/30'
            : 'border-gray-100 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] group-hover/col:-translate-y-1 group-hover/col:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.25)]'
        }`}
      >
        {/* Image + Title */}
        <div className="relative h-40 w-full overflow-hidden sm:h-44">
          <img
            src={img}
            alt={session.topic}
            className="block h-full w-full object-cover transition-transform duration-500 group-hover/col:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* Selection Badge */}
          <span
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ${
              isSelected
                ? 'scale-100 border-white bg-[#C9822B] text-white opacity-100'
                : 'scale-90 border-white/80 bg-white/20 text-transparent opacity-80 backdrop-blur group-hover/col:opacity-100'
            }`}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>

          <div className="absolute inset-x-0 bottom-0 p-4 text-left">
            {session.division && (
              <span className="mb-1.5 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                {session.division}
              </span>
            )}
            <h3 className="truncate text-lg font-bold text-white sm:text-xl" title={session.topic}>
              {session.topic}
            </h3>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-2 p-3">
          {CATEGORIES.map(({ key, icon: Icon, color }) => {
            const items = questions.filter((q) => q.que_category === key).slice(0, 3);
            return (
              <div key={key} className="min-w-0 rounded-xl bg-gray-50/80 p-2.5 text-left">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-gray-900">{key}</span>
                </div>
                <ul className="space-y-0.5">
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <li key={idx} className="truncate text-[11px] leading-snug text-gray-600" title={item.question}>
                        • {item.question}
                      </li>
                    ))
                  ) : (
                    <li className="text-[11px] text-gray-400">No data yet</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 w-full flex-col bg-[linear-gradient(180deg,#f4f7fb_0%,#f8f9fb_55%,#fbf8f4_100%)]">
      {/* 🔹 Fixed / Sticky Top Navbar */}
      <Navbar careerCount={count} />

      <main className={`w-full flex-1 px-4 py-8 sm:py-10 ${jakarta.className}`}>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
          {/* Heading */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-[#fdf6ec] px-4 py-1.5 text-xs font-medium text-[#B87523] shadow-sm sm:text-sm">
            <Swords className="h-4 w-4" />
            Compare Careers
          </div>
          <h1 className="text-center text-2xl font-extrabold tracking-[-0.015em] text-[#111827] sm:text-4xl">
            Which career do you <span className="text-[#C9822B]">prefer</span>?
          </h1>
          <p className="mt-3 max-w-xl text-center text-sm text-gray-500 sm:text-base">
            Pick the one that excites you more. Each choice brings a closer
            match &mdash; pick the same career 5 times to unlock Learn More.
          </p>
          {term && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-600 shadow-sm sm:text-sm">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              You searched for <span className="font-semibold text-gray-900">{term}</span>
            </div>
          )}

          {/* Duel */}
          <div className="mt-8 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            {/* LEFT COLUMN */}
            <div className="group/col mx-auto flex w-full max-w-[440px] cursor-pointer flex-col gap-2" onClick={selectLeft}>
              {renderCardContent(leftCareer, selectedSide === 'left')}
              {renderLearnMore(leftClickCount, leftCareer, selectedSide === 'left')}
            </div>

            {/* VS DIVISION */}
            <div className="flex items-center justify-center md:h-[380px] md:flex-col">
              <span className="hidden w-px flex-1 bg-gradient-to-b from-transparent to-gray-300 md:block" />
              <span className="my-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-lg font-extrabold italic text-[#C9822B] shadow-[0_8px_24px_-8px_rgba(201,130,43,0.5)] ring-4 ring-[#fdf6ec]">
                VS
              </span>
              <span className="hidden w-px flex-1 bg-gradient-to-b from-gray-300 to-transparent md:block" />
            </div>

            {/* RIGHT COLUMN */}
            <div className="group/col mx-auto flex w-full max-w-[440px] cursor-pointer flex-col gap-2" onClick={selectRight}>
              {renderCardContent(rightCareer, selectedSide === 'right')}
              {renderLearnMore(rightClickCount, rightCareer, selectedSide === 'right')}
            </div>
          </div>

          {/* None of the Above Button */}
          <div className="mt-6 flex flex-col items-center gap-2 pb-6">
            <button
              className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-md active:scale-95"
              onClick={nextCareer}
            >
              <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
              None of the Above
            </button>
            <span className="text-xs text-gray-400">Show me two different careers</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CompareCareers() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-3 bg-[#f6f8fb] text-sm font-medium text-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C9822B] border-t-transparent" />
          Preparing comparisons...
        </div>
      }
    >
      <CompareCareersContent />
    </Suspense>
  );
}