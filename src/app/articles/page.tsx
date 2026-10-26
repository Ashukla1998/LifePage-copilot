'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Download,
  MessageCircleQuestion,
  Pencil,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import AdaptiveVideo from '@/components/AdaptiveVideo';
import { API_BASE } from '@/lib/api';
import { jakarta } from '@/lib/fonts';

// 🔹 TypeScript Interfaces
interface QuestionDetail {
  sessionid: string;
  que_category: string;
  question: string;
  percentage: string | number;
}

interface AiPercentageItem {
  category: string;
  question: string;
  percentage: string | number;
}

interface ContentSection {
  id: string;
  title: string;
  content: {
    subtitle: string;
    text: string;
    image?: string;
  }[];
}

interface QuestionResponse {
  category: string;
  weight: number;
  value: number;
}

interface UserResponses {
  maxScore: number;
  questions: QuestionResponse[];
}

interface OrbitConfigItem {
  angle: number;
  label: string;
  offsetX?: string;
  offsetY?: string;
}

// 🔹 Orbit Steps Configuration
const orbitConfig: OrbitConfigItem[] = [
  { angle: -90, label: "What Is" },
  { angle: -30, label: "Education" },
  { angle: 30, label: "Skills" },
  { angle: 90, label: "Positives" },
  { angle: 150, label: "Challenges" },
  { angle: 210, label: "A Day" }
];

function ArticlesContent() {
  const searchParams = useSearchParams();

  // Parse URL query params
  const profileIdFromUrl = searchParams.get('profileid') || '';
  const fieldOfStudyFromUrl = searchParams.get('fieldOfStudy') || '';

  const [articleTitle, setArticleTitle] = useState<string>("Deep dive into Your Career");
  const [topic, setTopic] = useState<string>('');
  const [profileImageSrc, setProfileImageSrc] = useState<string>('/choices.jpg');

  // Dynamic state indexes
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [contentIndex, setContentIndex] = useState<number>(0);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuestionDetail[]>([]);
  const [sliderValue, setSliderValue] = useState<number>(5);

  // Name configuration
  const [savedName, setSavedName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInputValue, setNameInputValue] = useState<string>('');

  // Self assessment state
  const [dreamIndexScore, setDreamIndexScore] = useState<number | null>(null);
  const [isJourneyComplete, setIsJourneyComplete] = useState<boolean>(false);
  const [certificateUrl, setCertificateUrl] = useState<string>('');

  // Loading & generation counters
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);

  // Persisted tracker variables inside React refs
  const weights = useRef<Record<string, number>>({});
  const sessionId = useRef<string>('');
  const userResponses = useRef<UserResponses>({ maxScore: 10, questions: [] });

  // Youtube video of play 
  const [videoUrl, setVideoUrl] = useState<string>('');
  // DASH manifest for adaptive streaming; empty when the video isn't a bucket file
  const [dashUrl, setDashUrl] = useState<string>('');

  const profileId = useRef<string>('');
  const isAi = useRef<boolean>(false);
  const fieldOfStudy = useRef<string>('');

  const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  // checksession returns a bare file name (e.g. "20181219-0001.mp4") that lives in the session's
  // bucket folder, like the step images; full URLs (YouTube or otherwise) are used as they are
  const resolveVideoUrl = (videofile: string, sessionid: string): string => {
    if (!videofile) return '';
    if (/^https?:\/\//i.test(videofile)) return videofile;
    return `https://storage.googleapis.com/lifepage-video-android/${sessionid}/${encodeURIComponent(videofile)}`;
  };

  // 🔹 Countdown Timer hook
  useEffect(() => {
    if (!isAiLoading) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAiLoading]);

  // 🔹 Init Assessment and Questions
  const initData = async () => {
    try {
      if (isAi.current) {
        setIsAiLoading(true);
        setCountdown(30);
        await fetchAiData();
        setIsAiLoading(false);
      } else {
        await fetchQuestionDetails();
        await fetchSessionContent();
      }
    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  const fetchQuestionDetails = async () => {
    if (!profileId.current) return;
    try {
      const res = await fetch(`${API_BASE}/questiondetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profileId.current })
      });
      const data = await res.json();
      if (data.success === 1) {
        const questions: QuestionDetail[] = data.data[0].array_to_json;
        setAllQuestions(questions);
        sessionId.current = questions[0]?.sessionid || "";
        calculateWeights(questions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateWeights = (questions: QuestionDetail[]) => {
    const totals: Record<string, number> = {};
    questions.forEach(q => {
      const cleanApiCategory = q.que_category.toLowerCase().replace(/\bof\b/g, "").trim();
      const val = Number(q.percentage);
      if (!totals[cleanApiCategory]) totals[cleanApiCategory] = 0;
      totals[cleanApiCategory] += val;
    });

    const totalSum = Object.values(totals).reduce((a, b) => a + b, 0);
    Object.keys(totals).forEach(cat => {
      totals[cat] = Math.round((totals[cat] / totalSum) * 100);
    });
    weights.current = totals;
  };

  const fetchSessionContent = async () => {
    if (!profileId.current) return;
    try {
      const res = await fetch(`${API_BASE}/checksession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profileId.current })
      });
      const data = await res.json();
      if (data.success === 1) {
        const parsed = parseMarkdown(data.data[0].content);
        setSections(parsed);
        const videofile: string = data.data[0].videofile || '';
        setVideoUrl(resolveVideoUrl(videofile, profileId.current));
        // Bucket videos also have a DASH rendition set at {sessionid}/video/stream.mpd
        setDashUrl(
          videofile && !/^https?:\/\//i.test(videofile)
            ? `https://storage.googleapis.com/lifepage-video-android/${profileId.current}/video/stream.mpd`
            : ''
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAiData = async () => {
    const career = sessionStorage.getItem("fieldOfStudy") || fieldOfStudy.current;
    if (!career) return;
    try {
      const res = await fetch(`${API_BASE}/testing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career_name: career })
      });
      const data = await res.json();
      if (data.success === 1) {
        const markdown = data.article.data.replace(/\\n/g, "\n");
        const match = markdown.match(/^#\s*(.+)/m);
        if (match) {
          setArticleTitle(match[1].trim());
        }
        const parsed = parseMarkdown(markdown);
        setSections(parsed);

        const apiQuestions: QuestionDetail[] = data.article.percentage.map((item: AiPercentageItem) => ({
          que_category: item.category,
          question: item.question,
          percentage: item.percentage
        }));
        setAllQuestions(apiQuestions);
        calculateWeights(apiQuestions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 PARSER LOGIC WITH STATIC IMAGE FOR AI ARTICLES
  const parseMarkdown = (markdown: string): ContentSection[] => {
    const lines = markdown.split("\n");
    const parsedSections: ContentSection[] = [];

    let currentSection: ContentSection | null = null;
    let currentSub: { subtitle: string; text: string; image?: string } | null = null;

    let imageCounter = 4;
    let imageEnabled = false;

    const pad = (n: number) => String(n).padStart(4, "0");

    const getImageUrl = () =>
      `https://storage.googleapis.com/lifepage-video-android/${profileId.current}/${profileId.current}-${pad(imageCounter)}.JPG`;

    const slugify = (text: string) =>
      text.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const pushSub = () => {
      if (!currentSub || !currentSection) return;

      if (imageEnabled) {
        if (isAi.current) {
          currentSub.image = "/ai.jpg";
        } else {
          currentSub.image = getImageUrl();
          imageCounter += 1;
        }
      }

      currentSection.content.push(currentSub);
      currentSub = null;
    };

    const finishCategory = () => {
      pushSub();
      if (imageEnabled) {
        imageCounter += 1;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      /* MAIN TITLE */
      if (line.startsWith("# ") && !parsedSections.length) {
        currentSection = {
          id: slugify(line.replace("# ", "")),
          title: line.replace("# ", ""),
          content: []
        };
        parsedSections.push(currentSection);
        continue;
      }

      /* NEW CATEGORY */
      if (line.startsWith("## ")) {
        if (currentSection) finishCategory();

        const title = line.replace("## ", "").trim();

        imageEnabled = true;

        currentSection = {
          id: slugify(title),
          title,
          content: []
        };

        parsedSections.push(currentSection);
        continue;
      }

      /* SUBTEXT */
      if (line.startsWith("### ")) {
        pushSub();

        currentSub = {
          subtitle: line.replace("### ", "").trim(),
          text: ""
        };
        continue;
      }

      /* TEXT */
      if (currentSection) {
        if (!currentSub) {
          currentSub = { subtitle: "", text: "" };
        }

        currentSub.text += (currentSub.text ? "\n\n" : "") + line;
      }
    }

    finishCategory();
    return parsedSections;
  };

  // 🔹 Avatar Engine Setup
  // `topic` state isn't updated yet when this runs on mount, so the career name is passed in
  const startAvatarProcess = (knownTopic: string) => {
    if (fieldOfStudy.current) {
      fetch(`${API_BASE}/generateCareerAvatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career_name: fieldOfStudy.current })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.avatar) {
            updateImage(data.avatar);
          }
        });
    } else {
      fetch(`${API_BASE}/getAvatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profileId.current })
      })
        .then(res => res.json())
        .then(data => {
          const avatarPath = data?.data?.[0]?.avatar;
          // Direct links have no cached topic; getAvatar returns it for the session
          const careerName = knownTopic || data?.data?.[0]?.topic?.trim() || '';
          if (!knownTopic && careerName) setTopic(careerName);

          if (data.success === 1 && avatarPath) {
            updateImage(avatarPath);
          } else if (careerName) {
            generateAvatar(careerName);
          }
        });
    }
  };

  const generateAvatar = (careerName: string) => {
    const prompt = `Create a high-quality 3D animated character illustration representing a professional ${careerName}...`;
    fetch(`${API_BASE}/avatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        careerName,
        prompt: prompt,
        session_id: profileId.current
      })
    })
      .then(res => res.json())
      .then(data => {
        // The API responds only after the image is generated and saved, and returns the updated session row
        const avatarPath = data?.data?.[0]?.avatar;
        if (data.success === 1 && avatarPath) {
          updateImage(avatarPath);
        } else {
          console.error("Avatar generation failed:", data?.message, data?.error);
        }
      })
      .catch(err => console.error("Avatar API error:", err));
  };

  const updateImage = (avatarPath: string) => {
    // Proxied through our own origin: the bucket has no CORS headers, which blocks the
    // crossOrigin <img> and the html2canvas download
    const path = avatarPath.split('/').map(encodeURIComponent).join('/');
    setProfileImageSrc(`/api/bucket-image/${path}?v=${Date.now()}`);
  };

  // 🔹 Sync Initial URL variables & session storage on load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!sessionStorage.getItem("lp_session_started")) {
      localStorage.removeItem("hasUploaded");
      localStorage.removeItem("hasCalculated");
      sessionStorage.setItem("lp_session_started", "true");
    }

    const storedIsAi = sessionStorage.getItem("isAi") === "true";
    isAi.current = storedIsAi;

    const storedFieldOfStudy = sessionStorage.getItem("fieldOfStudy") || '';
    fieldOfStudy.current = storedFieldOfStudy;

    const storedProfileId = sessionStorage.getItem("profileid") || '';
    profileId.current = storedProfileId;

    // The URL decides the mode; sessionStorage can hold leftovers from an earlier article in this tab
    if (profileIdFromUrl) {
      profileId.current = profileIdFromUrl;
      fieldOfStudy.current = '';
      isAi.current = false;
      sessionStorage.setItem("profileid", profileIdFromUrl);
      sessionStorage.removeItem("fieldOfStudy");
      sessionStorage.removeItem("isAi");
    } else if (fieldOfStudyFromUrl) {
      fieldOfStudy.current = fieldOfStudyFromUrl;
      profileId.current = '';
      isAi.current = true;
      sessionStorage.setItem("fieldOfStudy", fieldOfStudyFromUrl);
      sessionStorage.setItem("isAi", "true");
      sessionStorage.removeItem("profileid");
    }

    // The cached topic belongs to whichever advisor was last opened, so only trust it for that same session
    const cachedTopic =
      !isAi.current && storedProfileId === profileId.current
        ? sessionStorage.getItem("topic") || ''
        : '';
    setTopic(cachedTopic);

    initData();
    startAvatarProcess(cachedTopic);

    // Prevent secondary default right-click popups
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
    // Re-run only when the article in the URL changes; the helpers it calls read refs, not props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileIdFromUrl, fieldOfStudyFromUrl]);

  // 🔹 Fetch Article title
  useEffect(() => {
    async function fetchHeading() {
      const type = profileId.current ? 'profile' : fieldOfStudy.current ? 'ai' : '';
      const val = type === 'profile' ? profileId.current : fieldOfStudy.current;
      if (!type || !val) return;

      try {
        if (type === 'profile') {
          const res = await fetch(`${API_BASE}/checksession`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: val })
          });
          const result = await res.json();
          if (result.success === 1) {
            const markdown = result.data[0].content;
            const matches = markdown.match(/^#\s*(.+)/m);
            if (matches) setArticleTitle(matches[1].trim());
          }
        } else {
          const res = await fetch(`${API_BASE}/getDescription`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: val })
          });
          const result = await res.json();
          if (result.success === 1) {
            setArticleTitle(result.data);
          }
        }
      } catch (err) {
        console.error("Article Heading API error:", err);
      }
    }
    fetchHeading();
  }, [profileIdFromUrl, fieldOfStudyFromUrl]);

  // 🔹 Progress Calculation Utility
  const calculateProgress = (): number => {
    if (!sections.length || !sections[currentIndex]) return 0;
    let totalSteps = 0;
    sections.forEach(s => totalSteps += s.content.length);

    if (currentIndex === 0 && contentIndex === 0) return 0;

    let completedSteps = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (sections[i]) completedSteps += sections[i].content.length;
    }
    completedSteps += contentIndex + 1;
    return completedSteps / totalSteps;
  };

  const isCompletedStep = (): boolean => {
    return sections.length > 0 &&
      sections[currentIndex] !== undefined &&
      currentIndex === sections.length - 1 &&
      contentIndex === sections[currentIndex].content.length - 1;
  };

  const saveCurrentAnswer = () => {
    if (!sections.length || !sections[currentIndex]) return;
    const section = sections[currentIndex];
    const categoryName = section.title.trim().toLowerCase();

    const relatedQuestions = allQuestions.filter(q => {
      const apiCategory = q.que_category.trim().toLowerCase();
      const cleanApiCategory = apiCategory.replace("of", "").trim();
      return categoryName.includes(cleanApiCategory);
    });

    if (!relatedQuestions.length) return;

    const questionIndex = contentIndex < relatedQuestions.length ? contentIndex : 0;
    const currentQuestion = relatedQuestions[questionIndex];

    const existingIndex = userResponses.current.questions.findIndex(q =>
      q.category === currentQuestion.que_category &&
      q.weight === Number(currentQuestion.percentage)
    );

    if (existingIndex !== -1) {
      userResponses.current.questions[existingIndex].value = sliderValue;
    } else {
      userResponses.current.questions.push({
        category: currentQuestion.que_category,
        weight: Number(currentQuestion.percentage),
        value: sliderValue
      });
    }
  };

  // 🔹 Navigation Control Trigger Functions
  const handleNext = () => {
    if (!sections.length || !sections[currentIndex]) return;

    saveCurrentAnswer();
    const totalContents = sections[currentIndex].content.length;

    let nextCurrentIndex = currentIndex;
    let nextContentIndex = contentIndex;

    if (contentIndex < totalContents - 1) {
      nextContentIndex = contentIndex + 1;
    } else if (currentIndex < sections.length - 1) {
      nextCurrentIndex = currentIndex + 1;
      nextContentIndex = 0;
    }

    setContentIndex(nextContentIndex);
    setCurrentIndex(nextCurrentIndex);

    const nextSection = sections[nextCurrentIndex];
    const nextCategoryName = nextSection?.title.trim().toLowerCase() || "";

    const nextRelatedQuestions = allQuestions.filter(q => {
      const apiCategory = q.que_category.trim().toLowerCase();
      const cleanApiCategory = apiCategory.replace("of", "").trim();
      return nextCategoryName.includes(cleanApiCategory);
    });

    const targetQuestionIndex = nextContentIndex < nextRelatedQuestions.length ? nextContentIndex : 0;
    const nextQuestion = nextRelatedQuestions[targetQuestionIndex];

    if (nextQuestion) {
      const existingAnswer = userResponses.current.questions.find(q =>
        q.category === nextQuestion.que_category &&
        q.weight === Number(nextQuestion.percentage)
      );

      setSliderValue(existingAnswer ? existingAnswer.value : 5);
    } else {
      setSliderValue(5);
    }
  };

  const handleBack = () => {
    let prevCurrentIndex = currentIndex;
    let prevContentIndex = contentIndex;

    if (contentIndex > 0) {
      prevContentIndex = contentIndex - 1;
    } else if (currentIndex > 0) {
      prevCurrentIndex = currentIndex - 1;
      if (sections[prevCurrentIndex]) {
        prevContentIndex = sections[prevCurrentIndex].content.length - 1;
      }
    } else {
      return;
    }

    setContentIndex(prevContentIndex);
    setCurrentIndex(prevCurrentIndex);

    const prevSection = sections[prevCurrentIndex];
    const prevCategoryName = prevSection?.title.trim().toLowerCase() || "";

    const prevRelatedQuestions = allQuestions.filter(q => {
      const apiCategory = q.que_category.trim().toLowerCase();
      const cleanApiCategory = apiCategory.replace("of", "").trim();
      return prevCategoryName.includes(cleanApiCategory);
    });

    const targetQuestionIndex = prevContentIndex < prevRelatedQuestions.length ? prevContentIndex : 0;
    const prevQuestion = prevRelatedQuestions[targetQuestionIndex];

    if (prevQuestion) {
      const existingAnswer = userResponses.current.questions.find(q =>
        q.category === prevQuestion.que_category &&
        q.weight === Number(prevQuestion.percentage)
      );

      setSliderValue(existingAnswer ? existingAnswer.value : 5);
    } else {
      setSliderValue(5);
    }
  };

  const handleSaveName = () => {
    setSavedName(nameInputValue);
    setIsEditingName(false);
  };

  const calculateSelfAssessment = async () => {
    saveCurrentAnswer();
    if (isCompletedStep()) {
      try {
        const res = await fetch(`${API_BASE}/DreamIndex`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userResponses.current)
        });
        const data = await res.json();
        if (data.success === 1) {
          const score = data.data.overall_percentage;
          setDreamIndexScore(score);

          localStorage.setItem("hasCalculated", "true");
          updateAvatarType();

          const params = new URLSearchParams({
            name: savedName || "Career Seeker",
            career: topic || fieldOfStudy.current,
            score: score + "%",
            image: profileImageSrc.split('?')[0],
            profileid: profileId.current,
            fieldOfStudy: fieldOfStudy.current
          });

          setCertificateUrl(`/certificate?${params.toString()}`);
          setIsJourneyComplete(true);
        }
      } catch (err) {
        console.error("Calculation Error", err);
      }
    }
  };

  const updateAvatarType = () => {
    const userid = sessionStorage.getItem("lp_userid");
    if (!userid) return;

    const hasUploaded = localStorage.getItem("hasUploaded") === "true";
    let which_avatar = "generic_without_self_assessment";

    if (!hasUploaded) {
      which_avatar = "generic_with_self_assessment";
    } else {
      which_avatar = "personal_with_self_assessment";
    }

    fetch(`${API_BASE}/update_user_event`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid, which_avatar })
    });
  };

  const handleDownloadAvatar = () => {
    const img = document.getElementById("profileImage") as HTMLImageElement;
    if (img && !img.complete) {
      toast.info("Image still loading. Please wait...");
      return;
    }

    import('html2canvas-pro').then(({ default: html2canvasPro }) => {
      const element = document.getElementById("avatar-download-target");
      if (!element) return;

      html2canvasPro(element, {
        scale: 5,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
      }).then(canvas => {
        const link = document.createElement("a");
        link.download = "self-assessment.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }).catch(err => {
        console.error("Download error:", err);
      });
    });
  };

  const getDynamicQuestionElement = () => {
    if (!sections.length || !sections[currentIndex]) return null;
    const section = sections[currentIndex];
    const categoryName = section.title.trim().toLowerCase();

    const relatedQuestions = allQuestions.filter(q => {
      return categoryName.includes(q.que_category.trim().toLowerCase().replace("of", "").trim());
    });

    if (relatedQuestions.length > 0) {
      const questionIndex = contentIndex < relatedQuestions.length ? contentIndex : 0;
      const currentQuestion = relatedQuestions[questionIndex];

      const questionText = (cat: string, qText: string) => {
        const smlCat = cat.toLowerCase();
        const smlQue = qText.toLowerCase();
        if (smlCat === `what is ${smlQue}`) return `How much did you like ${qText}?`;
        if (smlCat === "education") return `How much did you like to study ${qText}?`;
        if (smlCat === "skills") return `How much did you like to develop ${qText}?`;
        if (smlCat === "positives") return `How much did you like ${qText}?`;
        if (smlCat === "challenges") return `Are you prepared to face ${qText}?`;
        if (smlCat === "a day of") return `How much did you like a day in ${qText}?`;
        return `How much did you like ${qText}?`;
      };

      const sliderFill = ((sliderValue - 1) / 9) * 100;

      return (
        <div id="questionSection" className="mt-6 w-full rounded-2xl border border-amber-100 bg-gradient-to-br from-[#fdf6ec] via-[#fffaf3] to-white p-5 text-left sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#B87523]">
                <MessageCircleQuestion className="h-3.5 w-3.5" />
                Rate this
              </span>
              <h3 className="text-base font-bold leading-snug text-gray-900 sm:text-lg">
                {questionText(currentQuestion.que_category, currentQuestion.question)}
              </h3>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C9822B] text-xl font-extrabold text-white shadow-[0_8px_20px_-8px_rgba(201,130,43,0.7)]">
              {sliderValue}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#C9822B]"
            style={{ background: `linear-gradient(to right, #C9822B ${sliderFill}%, #e5e7eb ${sliderFill}%)` }}
          />

          <div className="mt-2 flex justify-between px-0.5 text-[11px] font-medium text-gray-400">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
              <span key={val} className={val === sliderValue ? 'font-bold text-[#C9822B]' : ''}>{val}</span>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Not at all</span>
            <span>Absolutely</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const progress = calculateProgress();
  const percent = Math.round(progress * 100);

  const section = sections[currentIndex];
  const activeContent = section?.content[contentIndex];
  const isAiArticle = fieldOfStudyFromUrl !== '';
  const youTubeEmbedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;
  const careerName = topic || fieldOfStudyFromUrl;
  const isFirstStep = currentIndex === 0 && contentIndex === 0;

  return (
    <div className="box-border flex flex-1 w-full flex-col bg-[linear-gradient(180deg,#f4f7fb_0%,#f8f9fb_55%,#fbf8f4_100%)]">
      {/* 🔹 Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className={`mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 lg:px-8 ${jakarta.className}`}>
        <div className="grid grid-cols-[340px_1fr] items-start gap-8 max-[1024px]:grid-cols-1">

          {/* LEFT COLUMN */}
          <aside className="flex w-full flex-col items-center gap-5 rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] lg:sticky lg:top-24">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-[#fdf6ec] px-3 py-1 text-xs font-medium text-[#B87523]">
                <Compass className="h-3.5 w-3.5" />
                Career Deep Dive
              </span>
              <h4 className="mt-3 text-xl font-extrabold tracking-[-0.01em] text-gray-900">
                Career in <span className="text-[#C9822B]">{careerName || '...'}</span>
              </h4>
            </div>

            {/* Profile Canvas Container (captured by Download Avatar) */}
            <div className="rounded-full bg-gradient-to-br from-[#C9822B] via-amber-300 to-[#C9822B] p-1 shadow-[0_12px_30px_-10px_rgba(201,130,43,0.6)]">
              <div
                id="avatar-download-target"
                className="relative h-[220px] w-[220px] overflow-hidden rounded-full border-4 border-white"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                {/* Plain <img>: html2canvas captures this element for the avatar download */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="profileImage"
                  src={profileImageSrc}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover text-transparent transition-all duration-600"
                  alt="Career Profile"
                />

                <div
                  className="absolute bottom-0 left-1/2 z-10 flex h-[54px] w-[213px] -translate-x-1/2 flex-col items-center justify-between py-1.5 text-white"
                  style={{ backgroundColor: 'rgba(17,24,39,0.88)' }}
                >
                  <span className="text-[10px] font-semibold text-[#E8A54B]">www.lifepage.in/ai</span>
                  <div className="h-[1px] w-[136px]" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  <span className="mb-1 text-[12px] font-semibold">
                    {dreamIndexScore !== null
                      ? `${savedName || "Career Seeker"} ${dreamIndexScore}%`
                      : (savedName || "Career Seeker")}
                  </span>
                </div>
              </div>
            </div>

            {dreamIndexScore !== null && (
              <div className="w-full rounded-2xl bg-gradient-to-br from-[#111827] to-[#3b2a17] p-4 text-white">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-300">Your Dream Index</p>
                <p className="mt-1 text-3xl font-extrabold">{dreamIndexScore}%</p>
              </div>
            )}

            {/* Name + Download Controls */}
            <div className="flex w-full flex-col gap-2.5">
              {!isEditingName ? (
                <button
                  onClick={() => { setIsEditingName(true); setNameInputValue(savedName); }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#C9822B] hover:text-[#C9822B]"
                >
                  {savedName ? <Pencil className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {savedName ? 'Edit Name' : 'Add Your Name'}
                </button>
              ) : (
                <div className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-4 pr-1 focus-within:border-[#C9822B] focus-within:ring-4 focus-within:ring-amber-100">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={nameInputValue}
                    onChange={(e) => setNameInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                    autoFocus
                    className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-gray-900 outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="rounded-full bg-[#C9822B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b4721f]"
                  >
                    Save
                  </button>
                </div>
              )}

              {dreamIndexScore !== null && (
                <button
                  onClick={handleDownloadAvatar}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#C9822B]"
                >
                  <Download className="h-4 w-4" />
                  Download Avatar
                </button>
              )}
            </div>
          </aside>

          {/* RIGHT COLUMN */}
          <section className="box-border rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] sm:p-8">

            {!isJourneyComplete ? (
              <div id="assessmentContent">
                {isAiLoading && (
                  <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-100 bg-[#fdf6ec] p-4 text-sm font-medium text-[#8a5a1c]">
                    <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#C9822B] border-t-transparent" />
                    <span>
                      AI is generating your career insights&hellip; please wait
                      <span className="ml-1 font-bold text-[#C9822B]">({countdown}s)</span>
                    </span>
                  </div>
                )}

                {/* Progress Steps Header */}
                <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {orbitConfig.map((config, idx) => {
                    const label = config.label.toLowerCase();
                    const sectionIndex = sections.findIndex(s => s.title.toLowerCase().startsWith(label));
                    const isCompleted = sectionIndex !== -1 && (sectionIndex < currentIndex);
                    const isActive = section?.title.toLowerCase().startsWith(label);

                    return (
                      <div
                        key={idx}
                        className={`flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-semibold transition-all duration-300 sm:text-[13px] ${
                          isCompleted
                            ? 'bg-[#C9822B] text-white'
                            : isActive
                              ? 'bg-[#fdf6ec] text-[#B87523] ring-2 ring-[#C9822B]'
                              : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                        ) : (
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${isActive ? 'bg-[#C9822B] text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {idx + 1}
                          </span>
                        )}
                        <span className="truncate">{config.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Slider Progress HUD */}
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span className="text-gray-500">Your progress</span>
                  <span className="text-[#C9822B]">{percent}%</span>
                </div>
                <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#C9822B] transition-all duration-600"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {activeContent && !activeContent.image && (
                  <h1 className="mb-5 text-2xl font-extrabold leading-snug tracking-[-0.01em] text-gray-900 max-sm:text-[20px]">
                    {articleTitle}
                  </h1>
                )}

                <div className="mx-auto w-full max-w-[760px]">
                  {activeContent?.image && (
                    <div className="relative mb-2">
                      {isAiArticle && (
                        <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white">
                          <span className="rounded-full bg-[#C9822B] px-2 py-0.5 text-[10px] uppercase tracking-wider">{section?.title}</span>
                          <span className="truncate">{activeContent.subtitle}</span>
                        </div>
                      )}
                      <div className={`grid items-center gap-4 ${videoUrl && activeContent?.image ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                        {/* Left: Career Video (bucket file, or YouTube embed) */}
                        {videoUrl && (
                          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-md">
                            {youTubeEmbedUrl ? (
                              <iframe
                                src={youTubeEmbedUrl}
                                title="Career Video"
                                className="h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <AdaptiveVideo
                                dashUrl={dashUrl}
                                mp4Url={videoUrl}
                                className="h-full w-full object-contain"
                              />
                            )}
                          </div>
                        )}

                        {/* Right: Step Image */}
                        {activeContent?.image && (
                          <div className="flex h-full w-full items-center justify-center">
                            <Image
                              src={activeContent.image}
                              width={1280}
                              height={720}
                              sizes="(min-width: 1024px) 760px, 100vw"
                              className={`block w-full rounded-2xl object-contain shadow-md ${videoUrl ? 'aspect-video max-h-[400px]' : 'h-auto max-h-[500px]'}`}
                              alt="Step visual"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Article Text */}
                  {activeContent && (
                    <article id="bottomTextContainer" className="mt-6 text-left">
                      {activeContent.subtitle && (
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                          <span className="h-5 w-1 rounded-full bg-[#C9822B]" />
                          {activeContent.subtitle}
                        </h3>
                      )}
                      <p className="whitespace-pre-wrap text-[15px] leading-[1.85] text-gray-600">
                        {activeContent.text}
                      </p>
                    </article>
                  )}

                  {getDynamicQuestionElement()}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
                  <button
                    onClick={handleBack}
                    className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-900 hover:bg-gray-900 hover:text-white ${isFirstStep ? 'invisible' : 'visible'}`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  {!isCompletedStep() ? (
                    <button
                      onClick={handleNext}
                      className="group inline-flex items-center gap-2 rounded-full bg-[#C9822B] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#b4721f] hover:shadow-lg"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      onClick={calculateSelfAssessment}
                      className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9822B] to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_-8px_rgba(201,130,43,0.8)] transition hover:-translate-y-0.5"
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#C9822B]/30" />
                      <Sparkles className="relative h-4 w-4" />
                      <span className="relative">Calculate Self Assessment</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <iframe
                  src={certificateUrl}
                  className="h-[800px] w-full rounded-2xl border-none bg-white"
                  title="Self Assessment Certificate"
                />
              </div>
            )}

          </section>

        </div>
      </main>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-3 bg-[#f6f8fb] text-sm font-medium text-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C9822B] border-t-transparent" />
          Loading assessments...
        </div>
      }
    >
      <ArticlesContent />
    </Suspense>
  );
}
