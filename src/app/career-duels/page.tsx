'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';

// 🔹 Define explicit interfaces for your API response structures
interface Question {
  question: string;
  que_category: 'Skills' | 'Education' | string;
  percentage: number;
}

interface Session {
  sessionid: string;
  topic: string;
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
  const [count, setCount] = useState<string>('');

  const excludeList = useRef<string[]>([]);
  const lastSelected = useRef<'left' | 'right' | null>(null);
  const usedQuestionsMap = useRef<Record<string, Set<string>>>({});

  // 🔹 FETCH NAVBAR DATA
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

  // 🔹 SAFE TRACKING FUNCTION
  const trackClick = (type: 'explore' | 'none') => {
    const userid =
      typeof window !== 'undefined' ? sessionStorage.getItem('lp_userid') : null;
    if (!userid) {
      console.warn("Tracking event omitted: 'lp_userid' missing from sessionStorage.");
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

    const matchCategories = ['Skills', 'Education'];

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

  // 🔹 CARD SELECTION LOGIC
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

  // 🔹 NONE OF THE ABOVE BUTTON
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

  // 🔹 PROGRESS BAR SUBCOMPONENT (With reserved height slot to prevent vertical shifts)
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
      <div className="min-h-[52px] flex items-center justify-center w-full mt-3">
        {isVisible && count > 0 && career && (
          <>
            {count >= 5 ? (
              <button
                className="bg-[#2196f3] text-white text-[14px] font-bold py-[8px] px-[20px] rounded-[3px] border-none cursor-pointer shadow-[0_4px_6px_rgba(0,0,0,0.15)] inline-flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  openCareer(career.session.topic);
                }}
              >
                Learn More
              </button>
            ) : (
              <div className="overflow-hidden transition-all duration-400 ease-in-out text-center max-w-[280px] w-full mx-auto">
                <div className="font-bold text-[14px] mb-1 text-gray-900 animate-pulse">
                  Learn More ({count * 20}%)
                </div>
                <div className="w-full h-[6px] bg-[#bdbdbd] rounded-[10px] overflow-hidden">
                  <div
                    className="h-full bg-[#00c853] transition-all duration-400 ease-in-out"
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
        <div className="bg-[#e46c09] rounded-lg p-10 shadow-md min-h-[300px] flex items-center justify-center">
          <p className="text-white font-medium">Finding matching comparison...</p>
        </div>
      );
    }

    const { session, questions } = career;
    const skills = questions.filter((q) => q.que_category === 'Skills');
    const education = questions.filter((q) => q.que_category === 'Education');

    const img = session.thumbfile
      ? `https://storage.googleapis.com/lifepage-video-android/${session.sessionid}/${session.thumbfile}`
      : '/support/NoCareer.png';

    return (
      <div className="relative flex flex-col group/card w-full">
        {/* Hover/Selection Tick Icon Overlay */}
        <div
          className={`absolute top-[6%] left-[92%] -translate-x-1/2 -translate-y-1/2 w-[46px] h-[44px] bg-[url('https://www.lifepage.in/support/tick.png')] bg-no-repeat bg-center bg-contain transition-all duration-300 ease-in-out pointer-events-none z-[10] ${
            isSelected
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-75 group-hover/card:opacity-100 group-hover/card:scale-100 md:group-hover/parent:opacity-0'
          }`}
        />

        <div className="bg-[#e46c09] m-0 rounded-lg overflow-hidden shadow-md flex flex-col">
          <div className="cardtext flex flex-col h-full">
            <div className="relative flex flex-col h-full">
              {/* Header Title with Fixed Height & Centered Text */}
              <div className="text-center px-[6px] py-2 text-white font-semibold text-[15px] sm:text-[18px] md:text-[20px] min-h-[48px] flex items-center justify-center leading-tight">
                {session.topic}
              </div>

              {/* Card Image Wrapper */}
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <img
                  src={img}
                  alt={session.topic}
                  className="w-full h-full object-cover block rounded-b-[6px]"
                />

                {/* Category Tags Container */}
                <div className="absolute inset-0 pointer-events-none flex justify-between p-2">
                  {/* Education Overlay Box */}
                  <div className="bg-black/90 text-white p-2 rounded-[2px] w-[45%] h-[70%] overflow-y-auto z-[2] text-left border border-white/10 shadow-lg pointer-events-auto">
                    <div className="text-[12px] sm:text-[13px] font-bold border-b border-gray-600 pb-1 mb-1 text-center">
                      Education
                    </div>
                    <div className="text-[10px] sm:text-[11px] leading-tight text-gray-200 space-y-1">
                      {education.slice(0, 4).map((e, idx) => (
                        <div key={idx} className="truncate" title={e.question}>
                          • {e.question}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Overlay Box */}
                  <div className="bg-black/90 text-white p-2 rounded-[2px] w-[45%] h-[70%] overflow-y-auto z-[2] text-left border border-white/10 shadow-lg pointer-events-auto">
                    <div className="text-[12px] sm:text-[13px] font-bold border-b border-gray-600 pb-1 mb-1 text-center">
                      Skills
                    </div>
                    <div className="text-[10px] sm:text-[11px] leading-tight text-gray-200 space-y-1">
                      {skills.slice(0, 4).map((s, idx) => (
                        <div key={idx} className="truncate" title={s.question}>
                          • {s.question}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* 🔹 Top Navbar */}
      <Navbar careerCount={count} />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex items-center justify-center p-[15px] sm:p-5 md:p-8 box-border">
        {/* Outer Flex Container */}
        <div className="flex flex-col items-center gap-7 max-w-[1170px] w-full my-0 mx-auto">
          {/* Yellow Card */}
          <div className="w-full p-5 text-center bg-[#ffc000] border-2 border-black rounded-lg box-border">
            <h2 className="text-2xl font-bold mb-5 text-gray-900 max-[768px]:text-[18px]">
              Which Career do you prefer?
            </h2>

            <div className="flex gap-[30px] justify-center items-start group/parent max-[1024px]:gap-5 max-[768px]:flex-col max-[768px]:items-center max-[768px]:px-[10px]">
              {/* LEFT COLUMN */}
              <div
                className="flex-1 max-w-[450px] w-full flex flex-col cursor-pointer max-[1024px]:max-w-full"
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
              <div className="flex items-center justify-center self-center sm:self-start sm:pt-28 shrink-0">
                <img src="/vs.png" alt="VS" className="w-[60px] sm:w-[80px] h-auto" />
              </div>

              {/* RIGHT COLUMN */}
              <div
                className="flex-1 max-w-[450px] w-full flex flex-col cursor-pointer max-[1024px]:max-w-full"
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
          <div>
            <button
              className="bg-[#363636] text-white font-bold py-3 px-6 rounded-[3px] border-none cursor-pointer shadow-[0_6px_10px_rgba(0,0,0,0.25)] transition hover:bg-gray-800 max-[480px]:w-full"
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