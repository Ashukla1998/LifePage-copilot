'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Award,
  Bot,
  Briefcase,
  MapPin,
  MessageCircle,
  RotateCcw,
  SearchX,
  Sparkles,
  Users,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { API_BASE } from '@/lib/api';
import { jakarta } from '@/lib/fonts';

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
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [similarAdvisors, setSimilarAdvisors] = useState<Advisor[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  // The search term whose results have arrived; anything else is still loading
  const [loadedTerm, setLoadedTerm] = useState<string | null>(null);
  const isLoading = careerRaw !== '' && loadedTerm !== careerRaw;
  const emptyMessage = careerRaw ? errorMsg : 'Search for a career to see its advisors.';

  const displayedSessionIds = useRef<Set<string>>(new Set());

  // 🔹 Fetch Main Career Results based on "career" search query
  useEffect(() => {
    if (!careerRaw) return;

    // 🔹 Fetch Similar Careers
    const loadSimilarTalks = (div: string, subdiv: string) => {
      fetch(`${API_BASE}/SimilarTalk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: div,
          subcategory: subdiv,
          excludeIds: Array.from(displayedSessionIds.current),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.data || data.data.length === 0) return;

          const filtered: Advisor[] = data.data.filter(
            (item: Advisor) =>
              !displayedSessionIds.current.has(String(item.sessionid))
          );

          setSimilarAdvisors(filtered);
        })
        .catch((err) => console.error('Similar Talks API failed:', err));
    };

    fetch(`${API_BASE}/SearchByName`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: careerRaw }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoadedTerm(careerRaw);
        if (!data.data || data.data.length === 0) {
          setAdvisors([]);
          setErrorMsg('No careers found.');
          return;
        }

        const mainList: Advisor[] = data.data;
        setErrorMsg('');
        setAdvisors(mainList);

        // Track seen session ids
        mainList.forEach((item) =>
          displayedSessionIds.current.add(String(item.sessionid))
        );

        // Load similar talks if division and subdivision exist on the first item
        const first = mainList[0];
        if (first?.division && first?.subdivision) {
          loadSimilarTalks(first.division, first.subdivision);
        }
      })
      .catch((err) => {
        console.error('Search API failed:', err);
        setLoadedTerm(careerRaw);
        setErrorMsg('Something went wrong. Please try again.');
      });
  }, [careerRaw]);

  // 🔹 Event End-Time Tracker API call helper
  const sendEndTime = async () => {
    const userid =
      typeof window !== 'undefined' ? sessionStorage.getItem('lp_userid') : null;
    if (!userid) return;

    const payload: UserEventBody = {
      userid: userid,
      end_time: new Date().toISOString(),
    };

    try {
      await fetch(`${API_BASE}/update_user_event`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Tracking API error:', err);
    }
  };

  // 🔹 Tab closing / Visibility Change Page exit lifecycles
  useEffect(() => {
    const handleUnload = () => {
      const userid = sessionStorage.getItem('lp_userid');
      if (!userid) return;

      const payload = JSON.stringify({
        userid: userid,
        end_time: new Date().toISOString(),
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(
          `${API_BASE}/update_user_event`,
          blob
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };

    window.addEventListener('pagehide', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 🔹 Navigation Click handlers
  const selectSpeaker = async (advisor: Advisor) => {
    await sendEndTime();

    // The URL carries everything the article page needs
    const params = new URLSearchParams({ profileid: advisor.sessionid, topic: advisor.topic });
    router.push(`/articles?${params.toString()}`);
  };

  const aiRedirect = async () => {
    await sendEndTime();

    // Without a search term there's nothing for the AI to write about
    if (!careerRaw) {
      router.push('/');
      return;
    }

    router.push(`/articles?fieldOfStudy=${encodeURIComponent(careerRaw)}`);
  };

  const reset = async () => {
    await sendEndTime();
    router.push('/');
  };

  const getExperienceYears = (from?: number, to?: number) => {
    if (!from || !to) return null;
    const fromYear = new Date(from * 1000).getFullYear();
    const toYear = new Date(to * 1000).getFullYear();
    return toYear - fromYear;
  };

  const careerLabel = careerRaw ? uppercaseFirst(careerRaw) : 'Your Path';

  const renderAdvisorCard = (item: Advisor, keyPrefix = '') => {
    const exp = getExperienceYears(item.from_ts, item.to_ts);
    const cover = item.thumbfile
      ? `https://storage.googleapis.com/lifepage-video-android/${item.sessionid}/${item.thumbfile}`
      : null;

    return (
      <button
        type="button"
        key={`${keyPrefix}${item.sessionid}`}
        onClick={() => selectSpeaker(item)}
        className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.25)]"
      >
        {/* Cover */}
        <div className="relative h-24 w-full overflow-hidden bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200">
          {cover && (
            <Image
              src={cover}
              alt=""
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {exp !== null && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#B87523] shadow-sm backdrop-blur">
              <Award className="h-3.5 w-3.5" />
              {exp} {exp === 1 ? 'yr' : 'yrs'} exp
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-5 pb-5">
          <Image
            width={80}
            height={80}
            src={
              item.profilepic
                ? `https://storage.googleapis.com/lifepage-plan/amscareerprofile/${item.profilepic}`
                : '/contact.png'
            }
            className="relative z-10 -mt-10 mb-3 h-20 w-20 rounded-full border-4 border-white bg-white object-cover shadow-md"
            alt={item.name}
          />
          <span className="mb-1.5 w-fit max-w-full truncate rounded-full bg-[#fdf6ec] px-2.5 py-0.5 text-xs font-semibold text-[#B87523]">
            {item.topic || ''}
          </span>
          <h3 className="text-base font-bold text-gray-900">{item.name || ''}</h3>

          <div className="mt-2 space-y-1 text-xs text-gray-500">
            {item.designation && (
              <p className="flex items-start gap-1.5">
                <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="line-clamp-2">{item.designation}</span>
              </p>
            )}
            {item.place && (
              <p className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="line-clamp-1">{item.place}</span>
              </p>
            )}
          </div>

          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-[#C9822B]">
            Listen to their story
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-1 w-full flex-col bg-[linear-gradient(180deg,#f4f7fb_0%,#f8f9fb_55%,#fbf8f4_100%)] text-[#262626]">
      {/* 🔹 Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className={`w-full flex-1 px-4 py-8 sm:py-10 ${jakarta.className}`}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          {/* Heading */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-[#fdf6ec] px-4 py-1.5 text-xs font-medium text-[#B87523] shadow-sm sm:text-sm">
            <Users className="h-4 w-4" />
            Talk to an Advisor
          </div>
          <h1 className="text-center text-2xl font-extrabold tracking-[-0.015em] text-[#111827] sm:text-4xl">
            Choose an Advisor for <span className="text-[#C9822B]">{careerLabel}</span>
          </h1>
          <p className="mt-3 max-w-xl text-center text-sm text-gray-500 sm:text-base">
            Hear real stories from professionals in this field, or get instant
            answers from our AI career advisor.
          </p>

          {/* AI Career Advisor Card */}
          <button
            type="button"
            onClick={aiRedirect}
            className="group relative mt-8 flex w-full max-w-3xl flex-col items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#3b2a17] p-5 text-left text-white shadow-[0_20px_50px_-20px_rgba(17,24,39,0.6)] transition duration-300 hover:-translate-y-1 sm:flex-row sm:p-6"
          >
            <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C9822B]/30 blur-3xl" />
            <span className="relative shrink-0">
              <Image
                src="/ai.jpg"
                width={96}
                height={96}
                priority
                className="h-20 w-20 rounded-full border-2 border-[#C9822B] object-cover shadow-[0_0_30px_rgba(201,130,43,0.5)] sm:h-24 sm:w-24"
                alt="AI Career Advisor"
              />
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1f2937] bg-[#C9822B]">
                <Bot className="h-4 w-4" />
              </span>
            </span>

            <span className="relative flex-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                Available 24/7
              </span>
              <span className="mt-2 block text-lg font-bold sm:text-xl">AI Career Advisor</span>
              <span className="mt-1 block text-sm text-gray-300">
                Ask anything about <span className="font-semibold text-white">{careerLabel}</span> &mdash; skills,
                education, salaries and growth.
              </span>
            </span>

            <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-[#C9822B] px-5 py-2.5 text-sm font-semibold shadow-md transition group-hover:bg-[#b4721f]">
              <MessageCircle className="h-4 w-4" />
              Ask AI
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          {/* Advisors */}
          <section className="mt-12 w-full">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Career Advisors</h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Professionals sharing their journey in {careerLabel}
                </p>
              </div>
              {advisors.length > 0 && (
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                  {advisors.length} {advisors.length === 1 ? 'advisor' : 'advisors'}
                </span>
              )}
            </div>

            {/* Loading Skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[260px] animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <div className="h-24 bg-gray-200" />
                    <div className="space-y-3 px-5">
                      <div className="-mt-10 h-20 w-20 rounded-full border-4 border-white bg-gray-200" />
                      <div className="h-3 w-1/3 rounded bg-gray-200" />
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty / Error State */}
            {emptyMessage && (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <SearchX className="h-6 w-6" />
                </span>
                <p className="font-semibold text-gray-900">{emptyMessage}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Try the AI Career Advisor above, or start a new search.
                </p>
              </div>
            )}

            {/* Dynamic Main Result Advisors */}
            {advisors.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {advisors.map((item) => renderAdvisorCard(item))}
              </div>
            )}
          </section>

          {/* Similar / Comparison Career Advisors Section */}
          {similarAdvisors.length > 0 && (
            <section className="mt-12 w-full">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Similar Careers</h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Explore related paths you might also enjoy
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {similarAdvisors.map((item) => renderAdvisorCard(item, 'similar-'))}
              </div>
            </section>
          )}

          {/* Restart Button */}
          <button
            onClick={reset}
            className="group mt-10 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-md active:scale-95 max-sm:w-full max-sm:justify-center"
          >
            <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
            Start Over
          </button>
        </div>
      </main>
    </div>
  );
}

function uppercaseFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AdvisorList() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-3 bg-[#f6f8fb] text-sm font-medium text-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C9822B] border-t-transparent" />
          Loading Advisor Lists...
        </div>
      }
    >
      <AdvisorListContent />
    </Suspense>
  );
}