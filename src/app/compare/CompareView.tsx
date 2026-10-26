'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import CareerDuelView, { type CareerData } from '@/components/CareerDuelView';
import { API_BASE } from '@/lib/api';

interface UserEventBody {
  userid: string;
  number_explore_click?: number;
  number_none_click?: number;
}

function CompareCareersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const term = searchParams.get('career') || '';

  const [leftCareer, setLeftCareer] = useState<CareerData | null>(null);
  const [rightCareer, setRightCareer] = useState<CareerData | null>(null);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');

  const [leftClickCount, setLeftClickCount] = useState<number>(0);
  const [rightClickCount, setRightClickCount] = useState<number>(0);

  const excludeList = useRef<string[]>([]);
  const lastSelected = useRef<'left' | 'right' | null>(null);
  const excludedTopics = useRef<string[]>([]);

  // 🔹 INIT DATA FETCH BASED ON URL "?career=..."
  useEffect(() => {
    async function init() {
      if (!term) return;
      try {
        const LeftResult = await fetch(`${API_BASE}/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: term }),
        });
        const LeftData = await LeftResult.json();

        if (!LeftData.success || !LeftData.data) {
          console.error('Career not found in API search.');
          return;
        }

        const res = await fetch(`${API_BASE}/getUserQuestions`, {
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

    fetch(`${API_BASE}/update_user_event`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch((err) => console.error('Tracking error:', err));
  };

  // 🔹 GET NEXT RELEVANT CAREER
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
      const res = await fetch(`${API_BASE}/getCareerByQuestion`, {
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
      const fallbackRes = await fetch(`${API_BASE}/randomCareer`, {
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
    router.push(`/advisor-list?career=${encodeURIComponent(topic)}`);
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
      const res = await fetch(`${API_BASE}/randomCareer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exclude: excludeList.current,
          names: [leftCareer?.session.topic, rightCareer?.session.topic].filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!data.success || !data.data || data.data.length < 2) {
        toast.error('Not enough careers available right now. Please try again.');
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

  return (
    <CareerDuelView
      badgeLabel="Compare Careers"
      headerExtra={
        term && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-600 shadow-sm sm:text-sm">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            You searched for <span className="font-semibold text-gray-900">{term}</span>
          </div>
        )
      }
      leftCareer={leftCareer}
      rightCareer={rightCareer}
      selectedSide={selectedSide}
      leftClickCount={leftClickCount}
      rightClickCount={rightClickCount}
      onSelectLeft={selectLeft}
      onSelectRight={selectRight}
      onOpenCareer={openCareer}
      onNone={nextCareer}
    />
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