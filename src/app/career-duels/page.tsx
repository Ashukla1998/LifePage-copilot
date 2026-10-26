'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CareerDuelView, { type CareerData } from '@/components/CareerDuelView';
import { API_BASE } from '@/lib/api';

interface UserEventBody {
  userid: string;
  number_explore_click?: number;
  number_none_click?: number;
}

export default function CareerDiscover() {
  const router = useRouter();
  const [leftCareer, setLeftCareer] = useState<CareerData | null>(null);
  const [rightCareer, setRightCareer] = useState<CareerData | null>(null);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');

  const [leftClickCount, setLeftClickCount] = useState<number>(0);
  const [rightClickCount, setRightClickCount] = useState<number>(0);

  const excludeList = useRef<string[]>([]);
  const excludedTopics = useRef<string[]>([]);
  const lastSelected = useRef<'left' | 'right' | null>(null);

  // 🔹 INIT DATA FETCH
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${API_BASE}/getUserQuestions`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (!data.success || !data.data || data.data.length < 2) {
          return;
        }

        const initialLeft: CareerData = data.data[0];
        const initialRight: CareerData = data.data[1];

        setLeftCareer(initialLeft);
        setRightCareer(initialRight);

        excludeList.current = [
          initialLeft.session.sessionid,
          initialRight.session.sessionid,
        ];
        excludedTopics.current = [
          initialLeft.session.topic,
          initialRight.session.topic,
        ];
      } catch (err) {
        console.error('Init data fetch failed:', err);
      }
    }
    init();
  }, []);

  // 🔹 TRACKING
  const trackClick = (type: 'explore' | 'none') => {
    const userid =
      typeof window !== 'undefined' ? sessionStorage.getItem('lp_userid') : null;
    if (!userid) return;

    const body: UserEventBody = { userid };
    if (type === 'explore') body.number_explore_click = 1;
    if (type === 'none') body.number_none_click = 1;

    fetch(`${API_BASE}/update_user_event`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch((err) => console.error('Tracking error:', err));
  };

  // 🔹 FIND NEXT RELEVANT CAREER
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

  // 🔹 CLICK HANDLERS
  const selectLeft = async () => {
    if (!leftCareer) return;
    const nextCount = leftClickCount + 1;
    setLeftClickCount(nextCount);
    setSelectedSide('left');
    trackClick('explore');

    if (nextCount >= 5) return;

    if (lastSelected.current === 'right') setRightClickCount(0);
    lastSelected.current = 'left';

    const newCareer = await getNextCareer(leftCareer);
    if (newCareer) {
      setRightCareer(newCareer);
    }
  };

  const selectRight = async () => {
    if (!rightCareer) return;
    const nextCount = rightClickCount + 1;
    setRightClickCount(nextCount);
    setSelectedSide('right');
    trackClick('explore');

    if (lastSelected.current === 'left') setLeftClickCount(0);
    if (nextCount >= 5) return;

    lastSelected.current = 'right';

    const newCareer = await getNextCareer(rightCareer);
    if (newCareer) {
      setLeftCareer(newCareer);
    }
  };

  const openCareer = (topic: string) => {
    router.push(`/advisor-list?career=${encodeURIComponent(topic)}`);
  };

  const nextCareer = async () => {
    setLeftClickCount(0);
    setRightClickCount(0);
    lastSelected.current = null;
    trackClick('none');

    if (leftCareer && !excludeList.current.includes(leftCareer.session.sessionid)) {
      excludeList.current.push(leftCareer.session.sessionid);
      excludedTopics.current.push(leftCareer.session.topic);
    }
    if (rightCareer && !excludeList.current.includes(rightCareer.session.sessionid)) {
      excludeList.current.push(rightCareer.session.sessionid);
      excludedTopics.current.push(rightCareer.session.topic);
    }

    try {
      const res = await fetch(`${API_BASE}/randomCareer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exclude: excludeList.current,
          names: excludedTopics.current,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.data || data.data.length < 2) return;

      const initialLeft: CareerData = data.data[0];
      const initialRight: CareerData = data.data[1];

      setLeftCareer(initialLeft);
      setRightCareer(initialRight);

      excludeList.current.push(initialLeft.session.sessionid, initialRight.session.sessionid);
      excludedTopics.current.push(initialLeft.session.topic, initialRight.session.topic);
      excludeList.current = [...new Set(excludeList.current)];
      excludedTopics.current = [...new Set(excludedTopics.current)];
    } catch (err) {
      console.error('Random API failed in nextCareer:', err);
    }
  };

  return (
    <CareerDuelView
      badgeLabel="Career Duels"
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
