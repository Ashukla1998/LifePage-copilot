'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';

interface Question {
  question: string;
  que_category: 'Skills' | 'Education' | 'Positives' | 'Challenges' | string;
  percentage: number;
}

interface Session {
  sessionid: string;
  topic: string;
  division?: string;
  subdivision?: string;
  thumbfile?: string;
  avatar?: string;
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

export default function CareerDiscover() {
  const [leftCareer, setLeftCareer] = useState<CareerData | null>(null);
  const [rightCareer, setRightCareer] = useState<CareerData | null>(null);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');

  const [leftClickCount, setLeftClickCount] = useState<number>(0);
  const [rightClickCount, setRightClickCount] = useState<number>(0);
  // const [count, setCount] = useState<string>('');

  const excludeList = useRef<string[]>([]);
  const lastSelected = useRef<'left' | 'right' | null>(null);
  const usedQuestionsMap = useRef<Record<string, Set<string>>>({});

  // 🔹 FETCH NAVBAR DATA
  // useEffect(() => {
  //   const fetchNavbarData = async () => {
  //     try {
  //       const res = await fetch('https://www.lifepage.in/n/api/navbar', {
  //         method: 'GET',
  //         headers: { 'Content-Type': 'application/json' },
  //       });
  //       const json = await res.json();
  //       if (json.success === 1) {
  //         setCount(json.count);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching navbar data:', error);
  //     }
  //   };
  //   fetchNavbarData();
  // }, []);

  // 🔹 INIT DATA FETCH
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('https://www.lifepage.in/n/api/getUserQuestions', {
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
      } catch (err) {
        console.error(err);
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

    fetch('https://www.lifepage.in/n/api/update_user_event', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch((err) => console.error('Tracking error:', err));
  };

  // 🔹 FIND NEXT RELEVANT CAREER
  const getNextCareer = async (baseCareer: CareerData): Promise<CareerData | null> => {
    const sessionId = baseCareer.session.sessionid;
    if (!usedQuestionsMap.current[sessionId]) {
      usedQuestionsMap.current[sessionId] = new Set<string>();
    }
    const usedSet = usedQuestionsMap.current[sessionId];
    const dynamicExclude = [
      ...excludeList.current,
      leftCareer?.session.sessionid,
      rightCareer?.session.sessionid,
    ].filter((id): id is string => !!id);

    const filterAndSort = (cat: string) =>
      baseCareer.questions
        .filter((q) => q.que_category === cat)
        .sort((a, b) => b.percentage - a.percentage);

    const matchCategories = ['Skills', 'Education', 'Positives', 'Challenges'];

    for (const category of matchCategories) {
      const questions = filterAndSort(category);
      for (const item of questions) {
        if (usedSet.has(item.question)) continue;

        const res = await fetch('https://www.lifepage.in/n/api/getCareerByQuestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: item.question,
            percentage: item.percentage,
            exclude: [...new Set(dynamicExclude)],
            names: [baseCareer.session.topic],
          }),
        });

        const data = await res.json();
        usedSet.add(item.question);
        if (data.data && data.data.length > 0) {
          const newCareer: CareerData = data.data[0];
          excludeList.current.push(newCareer.session.sessionid);
          return newCareer;
        }
      }
    }

    try {
      const res = await fetch('https://www.lifepage.in/n/api/randomCareer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exclude: [...new Set(dynamicExclude)],
          names: [baseCareer.session.topic],
        }),
      });
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const newCareer: CareerData = data.data[0];
        excludeList.current.push(newCareer.session.sessionid);
        return newCareer;
      }
    } catch (err) {
      console.error('Random API failed:', err);
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
    if (lastSelected.current && lastSelected.current !== 'left') excludeList.current = [];
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

    if (lastSelected.current === 'left') setLeftClickCount(0);
    if (nextCount >= 5) return;

    if (lastSelected.current && lastSelected.current !== 'right') excludeList.current = [];
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
      if (!data.success || !data.data || data.data.length < 2) return;

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
  const RenderLearnMore = ({
    count,
    career,
    isVisible,
  }: {
    count: number;
    career: CareerData | null;
    isVisible: boolean;
  }) => {
    return (
      <div className="h-10 flex items-center justify-center w-full mt-2 shrink-0">
        {isVisible && count > 0 && career && (
          <>
            {count >= 5 ? (
              <button
                className="bg-[#2196f3] text-white text-[13px] font-bold py-1.5 px-4 rounded-[3px] shadow-sm inline-flex items-center gap-2 hover:bg-[#1e88e5]"
                onClick={(e) => {
                  e.stopPropagation();
                  openCareer(career.session.topic);
                }}
              >
                Learn More
              </button>
            ) : (
              <div className="text-center max-w-[240px] w-full mx-auto">
                <div className="font-bold text-[12px] mb-1 text-gray-900 animate-pulse">
                  Learn More ({count * 20}%)
                </div>
                <div className="w-full h-[5px] bg-[#bdbdbd] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00c853] transition-all duration-300"
                    style={{ width: `${count * 20}%` }}
                  ></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderCardContent = (career: CareerData | null, isSelected: boolean) => {
    if (!career) {
      return (
        <div className="bg-[#e46c09] rounded-lg p-6 shadow-md h-[340px] flex items-center justify-center">
          <p className="text-white font-medium text-sm">Finding matching comparison...</p>
        </div>
      );
    }

    const { session, questions } = career;
    const skills = questions.filter((q) => q.que_category === 'Skills');
    const education = questions.filter((q) => q.que_category === 'Education');
    const positives = questions.filter((q) => q.que_category === 'Positives');
    const challenges = questions.filter((q) => q.que_category === 'Challenges');

    const img = session.thumbfile
      ? `https://storage.googleapis.com/lifepage-video-android/${session.sessionid}/${session.thumbfile}`
      : '/support/NoCareer.png';

    const renderOverlayCategory = (title: string, items: Question[]) => {
      return (
        <div className="bg-[rgba(0,0,0,0.8)] text-white p-1.5 rounded-[3px] h-[80%] overflow-hidden border border-white/10 shadow-sm flex flex-col justify-start">
          <div className="text-[11px] sm:text-[11px] font-bold border-b border-gray-600 pb-0.5 mb-1 text-center text-orange-400 shrink-0">
            {title}
          </div>
          <div className="text-[11px] leading-snug text-gray-200 space-y-0.5 overflow-hidden text-left">
            {items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="truncate" title={item.question}>
                • {item.question}
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="relative flex flex-col group/card w-full">
        {/* Tick Selection Indicator */}
        <div
          className={`absolute top-[6%] left-[92%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-[url('https://www.lifepage.in/support/tick.png')] bg-no-repeat bg-center bg-contain transition-all duration-200 pointer-events-none z-10 ${
            isSelected
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-75 group-hover/card:opacity-100 group-hover/card:scale-100'
          }`}
        />

        <div className="bg-[#e46c09] rounded-lg overflow-hidden shadow-md flex flex-col h-[330px] sm:h-[350px]">
          {/* Header Title with Fixed Height */}
          <div className="text-center px-2 py-1.5 text-white font-semibold text-[14px] sm:text-[16px] h-11 flex items-center justify-center leading-tight truncate shrink-0">
            {session.topic}
          </div>

          {/* Card Image Area with Fixed Height */}
          <div className="relative w-full flex-1 overflow-hidden">
            <img
              src={img}
              alt={session.topic}
              className="w-full h-full object-cover block"
            />

            {/* 2x2 Overlay Grid */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5 p-2 pointer-events-none">
              {renderOverlayCategory('Education', education)}
              {renderOverlayCategory('Skills', skills)}
              {renderOverlayCategory('Positives', positives)}
              {renderOverlayCategory('Challenges', challenges)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen h-dvh w-full bg-gray-50 flex flex-col overflow-hidden">
      {/* 🔹 Fixed / Sticky Top Navbar */}
      <Navbar  />

      {/* 🔹 Scrollable Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto px-4 py-6 sm:py-8 box-border">
        <div className="flex flex-col items-center gap-6 max-w-5xl w-full mx-auto">
          
          {/* Yellow Card */}
          <div className="w-full p-4 sm:p-6 text-center bg-[#ffc000] border-2 border-black rounded-lg shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">
              Which Career do you prefer?
            </h2>

            <div className="flex gap-4 sm:gap-6 justify-center items-center md:items-start group/parent max-[768px]:flex-col max-[768px]:items-center">
              {/* LEFT COLUMN */}
              <div
                className="flex-1 max-w-[420px] w-full flex flex-col cursor-pointer"
                onClick={selectLeft}
              >
                {renderCardContent(leftCareer, selectedSide === 'left')}
                <RenderLearnMore
                  count={leftClickCount}
                  career={leftCareer}
                  isVisible={selectedSide === 'left'}
                />
              </div>

              {/* VS DIVISION */}
              <div className="flex items-center justify-center self-center md:self-start md:pt-36 shrink-0 my-2 md:my-0">
                <img src="/vs.png" alt="VS" className="w-12 sm:w-16 h-auto" />
              </div>

              {/* RIGHT COLUMN */}
              <div
                className="flex-1 max-w-[420px] w-full flex flex-col cursor-pointer"
                onClick={selectRight}
              >
                {renderCardContent(rightCareer, selectedSide === 'right')}
                <RenderLearnMore
                  count={rightClickCount}
                  career={rightCareer}
                  isVisible={selectedSide === 'right'}
                />
              </div>
            </div>
          </div>

          {/* None of the Above Button */}
          <div className="shrink-0 pb-4">
            <button
              className="bg-[#363636] text-white font-bold py-2.5 px-6 rounded-[3px] text-xs sm:text-sm border-none cursor-pointer shadow-md transition hover:bg-gray-800 active:scale-95"
              onClick={nextCareer}
            >
              None of the Above
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}