'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Advisor {
  sessionid: string;
  topic: string;
  name: string;
  designation?: string;
  place?: string;
  profilepic?: string;
  thumbfile?: string;
  avatar?: string;
  from_ts?: number;
  to_ts?: number;
  division?: string;
  subdivision?: string;
}

interface UserEventBody {
  userid: string;
  end_time: string;
}

function AdvisorListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const careerRaw = searchParams.get('career') || '';
  const [fieldOfStudy, setFieldOfStudy] = useState<string>('');
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [similarAdvisors, setSimilarAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const displayedSessionIds = useRef<Set<string>>(new Set());

  // 🔹 Fetch Field of Study (replaces PHP Guzzle client logic)
  useEffect(() => {
    if (!careerRaw) return;

    async function fetchFieldOfStudy() {
      try {
        const res = await fetch('https://www.lifepage.in/n/api/ask', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: `give a single term answer for what is the field of study for ${careerRaw}`
          })
        });
        const json = await res.json();
        const detectedField = json.data || '';
        setFieldOfStudy(detectedField);
        sessionStorage.setItem('fieldOfStudy', detectedField);
      } catch (err) {
        console.error("Field of Study API error:", err);
      }
    }

    fetchFieldOfStudy();
  }, [careerRaw]);

  // 🔹 Fetch Main Career Results based on "career" search query
  useEffect(() => {
    if (!careerRaw) return;

    setIsLoading(true);
    sessionStorage.setItem("term", careerRaw);

    fetch("https://www.lifepage.in/n/api/SearchByName", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: careerRaw })
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (!data.data || data.data.length === 0) {
          setErrorMsg("No careers found.");
          return;
        }

        const mainList: Advisor[] = data.data;
        setAdvisors(mainList);

        // Track seen session ids
        mainList.forEach(item => displayedSessionIds.current.add(String(item.sessionid)));

        // Load similar talks if division and subdivision exist on the first item
        const first = mainList[0];
        if (first?.division && first?.subdivision) {
          loadSimilarTalks(first.division, first.subdivision);
        }
      })
      .catch(err => {
        console.error("Search API failed:", err);
        setIsLoading(false);
        setErrorMsg("Something went wrong. Please try again.");
      });
  }, [careerRaw]);

  // 🔹 Fetch Similar Careers
  const loadSimilarTalks = (div: string, subdiv: string) => {
    fetch("https://www.lifepage.in/n/api/SimilarTalk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: div,
        subcategory: subdiv,
        excludeIds: Array.from(displayedSessionIds.current)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.data || data.data.length === 0) return;

        const filtered: Advisor[] = data.data.filter(
          (item: Advisor) => !displayedSessionIds.current.has(String(item.sessionid))
        );

        setSimilarAdvisors(filtered);
      })
      .catch(err => console.error("Similar Talks API failed:", err));
  };

  // 🔹 Event End-Time Tracker API call helper
  const sendEndTime = async () => {
    const userid = typeof window !== 'undefined' ? sessionStorage.getItem("lp_userid") : null;
    if (!userid) return;

    const payload: UserEventBody = {
      userid: userid,
      end_time: new Date().toISOString()
    };

    try {
      await fetch("https://www.lifepage.in/n/api/update_user_event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Tracking API error:", err);
    }
  };

  // 🔹 Tab closing / Visibility Change Page exit lifecycles
  useEffect(() => {
    const handleUnload = () => {
      const userid = sessionStorage.getItem("lp_userid");
      if (!userid) return;
      
      const payload = JSON.stringify({
        userid: userid,
        end_time: new Date().toISOString()
      });

      // Beacon API is the gold standard in modern JS for reliable window unload sends
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon("https://www.lifepage.in/n/api/update_user_event", blob);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };

    window.addEventListener("pagehide", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 🔹 Navigation Click handlers
  const selectSpeaker = async (advisor: Advisor) => {
    await sendEndTime();

    sessionStorage.removeItem("isAi");
    sessionStorage.setItem("avatar", advisor.avatar || '');
    sessionStorage.setItem("profileid", advisor.sessionid);
    sessionStorage.setItem("thumbfile", advisor.thumbfile || '');
    sessionStorage.setItem("topic", advisor.topic);

    router.push(`/articles?profileid=${advisor.sessionid}`);
  };

  const aiRedirect = async () => {
    //  console.log("fieldOfStudy:", fieldOfStudy);
    await sendEndTime();

    sessionStorage.setItem("isAi", "true");
    sessionStorage.setItem("fieldOfStudy", fieldOfStudy);

    router.push(`/articles?fieldOfStudy=${encodeURIComponent(fieldOfStudy)}`);
  };

  const reset = async () => {
    await sendEndTime();
    router.push('/');
  };

  // Helper calculation for rendering experience years
  const getExperienceYears = (from?: number, to?: number) => {
    if (!from || !to) return null;
    const fromYear = new Date(from * 1000).getFullYear();
    const toYear = new Date(to * 1000).getFullYear();
    return toYear - fromYear;
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-white text-[#262626] p-[10px] sm:p-5 box-border font-sans">
      
      {/* Container Box */}
      <div className="w-full max-w-[1170px] bg-[#ffc000] border-2 border-[#505050] p-5 sm:p-10 rounded-lg text-center box-border shadow-md">
        
        <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-900 leading-tight">
          Choose an Advisor for {fieldOfStudy || (careerRaw ? uppercaseFirst(careerRaw) : 'Your Path')}
        </h2>

        {/* AI Career Advisor Card (Pre-rendered option) */}
        <div 
          onClick={aiRedirect}
          className="max-w-[450px] mx-auto bg-[#222222] text-white p-5 rounded-lg mb-6 cursor-pointer hover:scale-[1.01] transition-all border border-gray-700 shadow-md"
        >
          <div className="flex flex-col items-center">
            <img 
              src="/ai.jpg" 
              className="w-[100px] h-[100px] rounded-full object-cover border-2 border-[#ffc000] mb-3" 
              alt="AI Career Advisor"
            />
            <b className="text-lg text-[#ffc000]">{fieldOfStudy || 'AI Guide'}</b>
            <b className="text-sm font-semibold tracking-wide">AI Career Advisor</b>
            <span className="text-xs text-gray-400 mt-1">
              {careerRaw ? uppercaseFirst(careerRaw) : ''} | AI
            </span>
          </div>
        </div>

        {/* Loading and Error Overlays */}
        {isLoading && <p className="text-gray-800 font-semibold my-5">Loading available mentors...</p>}
        {errorMsg && <p className="text-red-700 font-medium my-5">{errorMsg}</p>}

        {/* Dynamic Main Result Advisors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1170px] mx-auto">
          {advisors.map(item => {
            const exp = getExperienceYears(item.from_ts, item.to_ts);
            return (
              <div 
                key={item.sessionid}
                onClick={() => selectSpeaker(item)}
                className="bg-[#222222] text-white p-5 rounded-lg cursor-pointer hover:scale-[1.01] transition-all border border-gray-700 flex flex-col justify-between"
              >
                <div className="flex flex-col items-center">
                  <img 
                    src={item.profilepic ? `https://storage.googleapis.com/lifepage-plan/amscareerprofile/${item.profilepic}` : "/contact.png"} 
                    className="w-[100px] h-[100px] rounded-full object-cover border-2 border-gray-500 mb-3" 
                    alt={item.name}
                  />
                  <b className="text-md text-[#ffc000] leading-tight mb-1">{item.topic}</b>
                  <b className="text-sm text-gray-200">{item.name}</b>
                  
                  <div className="text-[12px] text-gray-400 mt-2">
                    {item.designation} {item.place ? `| ${item.place}` : ''}
                  </div>
                </div>
                
                {exp !== null && (
                  <div className="text-[11px] text-[#ffc000] font-semibold mt-3">
                    [{exp} years Experience]
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Similar / Comparison Career Advisors Section */}
        {similarAdvisors.length > 0 && (
          <div className="mt-10 border-t border-gray-700 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Similar Careers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1170px] mx-auto">
              {similarAdvisors.map(item => {
                const exp = getExperienceYears(item.from_ts, item.to_ts);
                return (
                  <div 
                    key={`similar-${item.sessionid}`}
                    onClick={() => selectSpeaker(item)}
                    className="bg-[#222222] text-white p-5 rounded-lg cursor-pointer hover:scale-[1.01] transition-all border border-gray-700 flex flex-col justify-between"
                  >
                    <div className="flex flex-col items-center">
                      <img 
                        src={item.profilepic ? `https://storage.googleapis.com/lifepage-plan/amscareerprofile/${item.profilepic}` : "/contact.png"} 
                        className="w-[100px] h-[100px] rounded-full object-cover border-2 border-gray-500 mb-3" 
                        alt={item.name}
                      />
                      <b className="text-md text-[#ffc000] leading-tight mb-1">{item.topic || ''}</b>
                      <b className="text-sm text-gray-200">{item.name || ''}</b>
                      
                      <div className="text-[12px] text-gray-400 mt-2">
                        {item.designation || ''} {item.place ? `| ${item.place}` : ''}
                      </div>
                    </div>
                    
                    {exp !== null && (
                      <div className="text-[11px] text-[#ffc000] font-semibold mt-3">
                        [{exp} years Experience]
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Restart Button */}
      <button 
        onClick={reset} 
        className="bg-[#505050] text-white font-bold py-3 px-6 rounded-md shadow-md transition hover:bg-gray-800 mt-[18px] max-sm:w-full max-sm:max-w-[1170px]"
      >
        &nbsp; Restart &nbsp;
      </button>

    </div>
  );
}

// 🔹 Capitalization helper function
function uppercaseFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🔹 Wrap in Suspense for Next.js query parameters safety during the build step
export default function AdvisorList() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading Advisor Lists...</div>}>
      <AdvisorListContent />
    </Suspense>
  );
}