'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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
  fieldOfStudy?: string;
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
  
  const excludeList = useRef<string[]>([]);
  const lastSelected = useRef<'left' | 'right' | null>(null);
  const usedQuestionsMap = useRef<Record<string, Set<string>>>({});

  // 🔹 INIT DATA FETCH BASED ON URL "?career=..."
  useEffect(() => {
    async function init() {
      if (!term) return;
      try {
        // 1. Fetch search career for the left side
        const LeftResult = await fetch('https://www.lifepage.in/n/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: term })
        });
        const LeftData = await LeftResult.json();

        if (!LeftData.success || !LeftData.data) {
          console.error("Career not found in API search.");
          return;
        }

        // 2. Fetch alternative list for right side comparison
        const res = await fetch('https://www.lifepage.in/n/api/getUserQuestions', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (!data.success || !data.data || data.data.length === 0) {
          return;
        }

        const initialLeft: CareerData = LeftData.data;

        // Find a comparison career different from the searched Left side career
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
          initialRight.session.sessionid
        ];
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, [term]);

  // 🔹 EVENT TRACKING
  const trackClick = (type: 'explore' | 'none') => {
    const userid = typeof window !== 'undefined' ? sessionStorage.getItem("lp_userid") : null;
    if (!userid) {
      console.warn("Tracking skipped: 'lp_userid' missing from sessionStorage.");
      return;
    }

    const body: UserEventBody = { userid };
    if (type === "explore") {
      body.number_explore_click = 1;
    } else if (type === "none") {
      body.number_none_click = 1;
    }

    fetch("https://www.lifepage.in/n/api/update_user_event", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).catch(err => console.error("Tracking error:", err));
  };

  // 🔹 GET NEXT RELEVANT CAREER
  const getNextCareer = async (baseCareer: CareerData): Promise<CareerData | null> => {
    const sessionId = baseCareer.session.sessionid;
    if (!usedQuestionsMap.current[sessionId]) {
      usedQuestionsMap.current[sessionId] = new Set<string>();
    }
    const usedSet = usedQuestionsMap.current[sessionId];
    const dynamicExclude = [
      ...excludeList.current,
      leftCareer?.session.sessionid,
      rightCareer?.session.sessionid
    ].filter((id): id is string => !!id);

    const filterAndSort = (cat: string) => 
      baseCareer.questions
        .filter(q => q.que_category === cat)
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
            names: [baseCareer.session.topic]
          })
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
          names: [baseCareer.session.topic] 
        })
      });
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const newCareer: CareerData = data.data[0];
        excludeList.current.push(newCareer.session.sessionid);
        return newCareer;
      }
    } catch (err) {
      console.error("Random API failed:", err);
    }
    return null;
  };

  // 🔹 CLICK INTERACTION HANDLERS
  const selectLeft = async () => {
    if (!leftCareer) return;
    const nextCount = leftClickCount + 1;
    setLeftClickCount(nextCount);
    setSelectedSide('left');
    trackClick("explore");

    if (nextCount >= 5) return;

    if (lastSelected.current === "right") {
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
    trackClick("explore");

    if (lastSelected.current === "left") {
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
    trackClick("none");
    
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
          names: [leftCareer?.session.topic, rightCareer?.session.topic].filter(Boolean)
        })
      });

      const data = await res.json();
      if (!data.success || !data.data || data.data.length < 2) {
        alert("Not enough data available!");
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

  // 🔹 PROGRESS HUD COMPONENT
  const RenderLearnMore = ({ count, career }: { count: number; career: CareerData | null }) => {
    if (count === 0 || !career) return null;
    const progress = count * 20;

    if (count >= 5) {
      return (
        <div className="text-center mt-3">
          <button 
            className="bg-[#2196f3] text-white text-[14px] font-bold py-[8px] px-[20px] rounded-[3px] border-none cursor-pointer shadow-[0_4px_6px_rgba(0,0,0,0.15)] inline-flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              openCareer(career.session.topic);
            }}
          >
            Learn More
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-hidden transition-all duration-400 ease-in-out text-center mt-3 max-w-[280px] mx-auto">
        <div className="font-bold text-[14px] mb-1 text-gray-900 animate-pulse">
          Learn More ({progress}%)
        </div>
        <div className="w-full h-[6px] bg-[#bdbdbd] rounded-[10px] overflow-hidden">
          <div className="h-full bg-[#00c853] transition-all duration-400 ease-in-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  };

  const renderCardContent = (career: CareerData | null, isSelected: boolean) => {
    if (!career) return <p className="text-white py-10 font-medium">Finding matching comparison...</p>;
    const { session, questions } = career;
    const skills = questions.filter(q => q.que_category === 'Skills');
    const education = questions.filter(q => q.que_category === 'Education');
    
    const img = session.thumbfile
      ? `https://storage.googleapis.com/lifepage-video-android/${session.sessionid}/${session.thumbfile}`
      : '/support/NoCareer.png';

    return (
      <div className="relative flex flex-col group/card">
        {/* Hover/Selection Tick Icon Overlay */}
        <div 
          className={`absolute top-[6%] left-[92%] -translate-x-1/2 -translate-y-1/2 w-[46px] h-[44px] bg-[url('https://www.lifepage.in/support/tick.png')] bg-no-repeat bg-center bg-contain transition-all duration-300 ease-in-out pointer-events-none z-[10]
            ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/card:opacity-100 group-hover/card:scale-100 md:group-hover/parent:opacity-0'}`}
        />
        
        <div className="bg-[#e46c09] m-0 rounded-lg overflow-hidden shadow-md">
          <div className="cardtext">
            <div className="relative">
              <div className="text-center px-[6px] pb-[6px] pt-2 text-white font-semibold text-[100%] sm:text-[120%] md:text-[140%]">
                {session.topic}
              </div>
              <img src={img} alt={session.topic} className="w-full h-auto block rounded-[6px]" />
              
              {/* Category Tags Container */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Skills Overlay Box */}
                <div className="absolute top-[45px] right-[10px] bg-black/90 text-white p-2 rounded-[2px] text-[12px] max-w-[45%] z-[2] max-[768px]:text-[10px] max-[768px]:max-w-[60%] max-[768px]:right-[5px] max-[480px]:text-[9px] max-[480px]:p-[5px]">
                  <div className="text-[110%] font-bold">Skills</div>
                  <div className="text-[90%] leading-tight text-gray-300">
                    {skills.map((s, idx) => <span key={idx}>{s.question}<br/></span>)}
                  </div>
                </div>

                {/* Education Overlay Box */}
                <div className="absolute top-[45px] left-[10px] bg-black/90 text-white p-2 rounded-[2px] text-[12px] max-w-[45%] z-[2] max-[768px]:text-[10px] max-[768px]:max-w-[60%] max-[768px]:left-[5px] max-[480px]:text-[9px] max-[480px]:p-[5px]">
                  <div className="text-[110%] font-bold">Education</div>
                  <div className="text-[90%] leading-tight text-gray-300">
                    {education.map((e, idx) => <span key={idx}>{e.question}<br/></span>)}
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
    <div className="min-h-screen w-full flex items-center justify-center p-[10px] sm:p-5 md:p-8 bg-gray-50 box-border">
      
      {/* Parent Flex Container maintaining vertical alignment and horizontal centering */}
      <div className="flex flex-col items-center gap-7 max-w-[1170px] w-full my-0 mx-auto">
        
        {/* Yellow Comparison Card */}
        <div className="w-full p-5 text-center bg-[#ffc000] border-2 border-black rounded-lg box-border">
          
          <h2 className="text-2xl font-bold text-gray-900 max-[768px]:text-[18px] mb-[20px]">
            Which Career do you prefer?
          </h2>

          <div className="flex justify-center items-start group/parent max-[1024px]:gap-5 max-[768px]:flex-col max-[768px]:px-[10px]">
            
            {/* SEARCH TARGET CAREER (LEFT CARD) */}
            <div 
              className="flex-1 max-w-[450px] cursor-pointer max-[1024px]:max-w-full"
              onClick={selectLeft}
            >
              {renderCardContent(leftCareer, selectedSide === 'left')}
              {selectedSide === 'left' && <RenderLearnMore count={leftClickCount} career={leftCareer} />}
            </div>

            {/* VS CONTAINER */}
            <div className="flex items-center justify-center self-center">
              <img src="/vs.png" alt="VS" className="w-[80px] h-auto" />
            </div>

            {/* COMPARATIVE CAREER (RIGHT CARD) */}
            <div 
              className="flex-1 max-w-[450px] cursor-pointer max-[1024px]:max-w-full"
              onClick={selectRight}
            >
              {renderCardContent(rightCareer, selectedSide === 'right')}
              {selectedSide === 'right' && <RenderLearnMore count={rightClickCount} career={rightCareer} />}
            </div>

          </div>

        </div>

        {/* None of the Above Button (Outside Yellow Card, Centered directly below it) */}
        <div>
          <button 
            className="bg-[#363636] text-white font-bold py-3 px-6 rounded-[3px] border-none cursor-pointer shadow-[0_6px_10px_rgba(0,0,0,0.25)] transition hover:bg-gray-800 max-[480px]:w-full"
            onClick={nextCareer}
          >
            None of the Above
          </button>
        </div>

      </div>

    </div>
  );
}

// 🔹 Suspense Boundary wrapper for parameter parsing safety during static page optimizations
export default function CompareCareers() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen font-sans">Preparing comparisons...</div>}>
      <CompareCareersContent />
    </Suspense>
  );
}