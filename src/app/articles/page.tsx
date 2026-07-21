// 'use client';

// import React, { useState, useEffect, useRef, Suspense } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';

// // 🔹 TypeScript Interfaces
// interface QuestionDetail {
//   sessionid: string;
//   que_category: string;
//   question: string;
//   percentage: string | number;
// }

// interface ContentSection {
//   id: string;
//   title: string;
//   content: {
//     subtitle: string;
//     text: string;
//     image?: string;
//   }[];
// }

// interface QuestionResponse {
//   category: string;
//   weight: number;
//   value: number;
// }

// interface UserResponses {
//   maxScore: number;
//   questions: QuestionResponse[];
// }

// interface OrbitConfigItem {
//   angle: number;
//   label: string;
//   offsetX?: string;
//   offsetY?: string;
// }

// // 🔹 Orbit Steps Configuration
// const orbitConfig: OrbitConfigItem[] = [
//   { angle: -90, label: "What Is" },
//   { angle: -30, label: "Education" },
//   { angle: 30, label: "Skills" },
//   { angle: 90, label: "Positives" },
//   { angle: 150, label: "Challenges" },
//   { angle: 210, label: "A Day" }
// ];

// function ArticlesContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Parse URL query params
//   const profileIdFromUrl = searchParams.get('profileid') || '';
//   const fieldOfStudyFromUrl = searchParams.get('fieldOfStudy') || '';

//   const [articleTitle, setArticleTitle] = useState<string>("Deep dive into Your Career");
//   const [topic, setTopic] = useState<string>('');
//   const [profileImageSrc, setProfileImageSrc] = useState<string>('support/choices.jpg');

//   // Dynamic state indexes
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [contentIndex, setContentIndex] = useState<number>(0);
//   const [sections, setSections] = useState<ContentSection[]>([]);
//   const [allQuestions, setAllQuestions] = useState<QuestionDetail[]>([]);
//   const [sliderValue, setSliderValue] = useState<number>(5);

//   // Name configuration
//   const [savedName, setSavedName] = useState<string>('');
//   const [isEditingName, setIsEditingName] = useState<boolean>(false);
//   const [nameInputValue, setNameInputValue] = useState<string>('');

//   // Self assessment state
//   const [dreamIndexScore, setDreamIndexScore] = useState<number | null>(null);
//   const [isJourneyComplete, setIsJourneyComplete] = useState<boolean>(false);
//   const [certificateUrl, setCertificateUrl] = useState<string>('');

//   // Loading & generation counters
//   const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
//   const [countdown, setCountdown] = useState<number>(30);

//   // Persisted tracker variables inside React refs
//   const weights = useRef<Record<string, number>>({});
//   const sessionId = useRef<string>('');
//   const userResponses = useRef<UserResponses>({ maxScore: 10, questions: [] });
//   const displayedSessionIds = useRef<Set<string>>(new Set());

//   const profileId = useRef<string>('');
//   const isAi = useRef<boolean>(false);
//   const fieldOfStudy = useRef<string>('');

//   // 🔹 Sync Initial URL variables & session storage on load
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     if (!sessionStorage.getItem("lp_session_started")) {
//       localStorage.removeItem("hasUploaded");
//       localStorage.removeItem("hasCalculated");
//       sessionStorage.setItem("lp_session_started", "true");
//     }

//     const cachedTopic = sessionStorage.getItem("topic") || '';
//     setTopic(cachedTopic);

//     const storedIsAi = sessionStorage.getItem("isAi") === "true";
//     isAi.current = storedIsAi;

//     const storedFieldOfStudy = sessionStorage.getItem("fieldOfStudy") || '';
//     fieldOfStudy.current = storedFieldOfStudy;

//     const storedProfileId = sessionStorage.getItem("profileid") || '';
//     profileId.current = storedProfileId;

//     // Direct fallback checks
//     if (profileIdFromUrl) profileId.current = profileIdFromUrl;
//     if (fieldOfStudyFromUrl) fieldOfStudy.current = fieldOfStudyFromUrl;

//     initData();
//     startAvatarProcess();

//     // Prevent secondary default right-click popups
//     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
//     document.addEventListener('contextmenu', handleContextMenu);
//     return () => document.removeEventListener('contextmenu', handleContextMenu);
//   }, [profileIdFromUrl, fieldOfStudyFromUrl]);

//   // 🔹 Countdown Timer hook
//   useEffect(() => {
//     if (!isAiLoading) return;
//     const interval = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [isAiLoading]);

//   // 🔹 Fetch Article title
//   useEffect(() => {
//     async function fetchHeading() {
//       const type = profileId.current ? 'profile' : fieldOfStudy.current ? 'ai' : '';
//       const val = type === 'profile' ? profileId.current : fieldOfStudy.current;
//       if (!type || !val) return;

//       try {
//         if (type === 'profile') {
//           const res = await fetch('https://www.lifepage.in/n/api/checksession', {
//             method: 'POST',
//             headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
//             body: JSON.stringify({ id: val })
//           });
//           const result = await res.json();
//           if (result.success === 1) {
//             const markdown = result.data[0].content;
//             const matches = markdown.match(/^#\s*(.+)/m);
//             if (matches) setArticleTitle(matches[1].trim());
//           }
//         } else {
//           const res = await fetch('https://www.lifepage.in/n/api/getDescription', {
//             method: 'POST',
//             headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
//             body: JSON.stringify({ name: val })
//           });
//           const result = await res.json();
//           if (result.success === 1) {
//             setArticleTitle(result.data);
//           }
//         }
//       } catch (err) {
//         console.error("Article Heading API error:", err);
//       }
//     }
//     fetchHeading();
//   }, [profileIdFromUrl, fieldOfStudyFromUrl]);

//   // 🔹 Init Assessment and Questions
//   const initData = async () => {
//     try {
//       if (isAi.current) {
//         setIsAiLoading(true);
//         setCountdown(30);
//         await fetchAiData();
//         setIsAiLoading(false);
//       } else {
//         await fetchQuestionDetails();
//         await fetchSessionContent();
//       }
//     } catch (err) {
//       console.error("Initialization error:", err);
//     }
//   };

//   const fetchQuestionDetails = async () => {
//     if (!profileId.current) return;
//     try {
//       const res = await fetch("https://www.lifepage.in/n/api/questiondetails", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: profileId.current })
//       });
//       const data = await res.json();
//       if (data.success === 1) {
//         const questions: QuestionDetail[] = data.data[0].array_to_json;
//         setAllQuestions(questions);
//         sessionId.current = questions[0]?.sessionid || "";
//         calculateWeights(questions);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const calculateWeights = (questions: QuestionDetail[]) => {
//     const totals: Record<string, number> = {};
//     questions.forEach(q => {
//       const cleanApiCategory = q.que_category.toLowerCase().replace(/\bof\b/g, "").trim();
//       const val = Number(q.percentage);
//       if (!totals[cleanApiCategory]) totals[cleanApiCategory] = 0;
//       totals[cleanApiCategory] += val;
//     });

//     const totalSum = Object.values(totals).reduce((a, b) => a + b, 0);
//     Object.keys(totals).forEach(cat => {
//       totals[cat] = Math.round((totals[cat] / totalSum) * 100);
//     });
//     weights.current = totals;
//   };

//   const fetchSessionContent = async () => {
//     if (!profileId.current) return;
//     try {
//       const res = await fetch("https://www.lifepage.in/n/api/checksession", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: profileId.current })
//       });
//       const data = await res.json();
//       if (data.success === 1) {
//         const parsed = parseMarkdown(data.data[0].content);
//         setSections(parsed);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchAiData = async () => {
//     const career = sessionStorage.getItem("fieldOfStudy") || fieldOfStudy.current;
//     if (!career) return;
//     try {
//       const res = await fetch("https://www.lifepage.in/n/api/testing", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ career_name: career })
//       });
//       const data = await res.json();
//       if (data.success === 1) {
//         const markdown = data.article.data.replace(/\\n/g, "\n");
//         const match = markdown.match(/^#\s*(.+)/m);
//         if (match) {
//           setArticleTitle(match[1].trim());
//         }
//         const parsed = parseMarkdown(markdown);
//         setSections(parsed);

//         const apiQuestions: QuestionDetail[] = data.article.percentage.map((item: any) => ({
//           que_category: item.category,
//           question: item.question,
//           percentage: item.percentage
//         }));
//         setAllQuestions(apiQuestions);
//         calculateWeights(apiQuestions);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // 🔹 YOUR WORKING ORIGINAL PARSER LOGIC INTEGRATED HERE PERFECTLY
//   const parseMarkdown = (markdown: string): ContentSection[] => {
//     const lines = markdown.split("\n");
//     const parsedSections: ContentSection[] = [];

//     let currentSection: ContentSection | null = null;
//     let currentSub: { subtitle: string; text: string; image?: string } | null = null;

//     let imageCounter = 4;
//     let imageEnabled = false;

//     const pad = (n: number) => String(n).padStart(4, "0");

//     const getImageUrl = () =>
//       `https://storage.googleapis.com/lifepage-video-android/${profileId.current}/${profileId.current}-${pad(imageCounter)}.JPG`;

//     const slugify = (text: string) =>
//       text.toLowerCase()
//         .replace(/[^a-z0-9]+/g, "-")
//         .replace(/(^-|-$)/g, "");

//     const pushSub = () => {
//       if (!currentSub || !currentSection) return;

//       if (imageEnabled) {
//         if (isAi.current) {
//           currentSub.image = "support/ai_career_advisor.png";
//         } else {
//           currentSub.image = getImageUrl();
//           imageCounter += 1;
//         }
//       }

//       currentSection.content.push(currentSub);
//       currentSub = null;
//     };

//     const finishCategory = () => {
//       pushSub();
//       if (imageEnabled) {
//         imageCounter += 1; // GAP after category
//       }
//     };

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i].trim();
//       if (!line) continue;

//       /* MAIN TITLE */
//       if (line.startsWith("# ") && !parsedSections.length) {
//         currentSection = {
//           id: slugify(line.replace("# ", "")),
//           title: line.replace("# ", ""),
//           content: []
//         };
//         parsedSections.push(currentSection);
//         continue;
//       }

//       /* NEW CATEGORY */
//       if (line.startsWith("## ")) {
//         if (currentSection) finishCategory();

//         const title = line.replace("## ", "").trim();

//         // Matching your logic exactly: imageEnabled is set to true on every ## category
//         imageEnabled = true;

//         currentSection = {
//           id: slugify(title),
//           title,
//           content: []
//         };

//         parsedSections.push(currentSection);
//         continue;
//       }

//       /* SUBTEXT */
//       if (line.startsWith("### ")) {
//         pushSub();

//         currentSub = {
//           subtitle: line.replace("### ", "").trim(),
//           text: ""
//         };
//         continue;
//       }

//       /* TEXT */
//       if (currentSection) {
//         if (!currentSub) {
//           currentSub = { subtitle: "", text: "" };
//         }

//         currentSub.text += (currentSub.text ? "\n\n" : "") + line;
//       }
//     }

//     finishCategory();
//     return parsedSections;
//   };

//   // 🔹 Avatar Engine Setup
//   const startAvatarProcess = () => {
//     if (fieldOfStudy.current) {
//       fetch("https://www.lifepage.in/n/api/generateCareerAvatar", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ career_name: fieldOfStudy.current })
//       })
//         .then(res => res.json())
//         .then(data => {
//           if (data.success && data.avatar) {
//             updateImage(data.avatar);
//           }
//         });
//     } else {
//       fetch("https://www.lifepage.in/n/api/getAvatar", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: profileId.current })
//       })
//         .then(res => res.json())
//         .then(data => {
//           const avatarPath = data?.data?.[0]?.avatar;
//           if (data.success === 1 && avatarPath) {
//             updateImage(avatarPath);
//           } else {
//             generateAvatar();
//           }
//         });
//     }
//   };

//   const generateAvatar = () => {
//     const prompt = `Create a high-quality 3D animated character illustration representing a professional ${topic}...`;
//     fetch("https://www.lifepage.in/n/api/avatar", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         careerName: topic,
//         prompt: prompt,
//         session_id: profileId.current
//       })
//     })
//       .then(res => res.json())
//       .then(() => {
//         setTimeout(() => {
//           fetch("https://www.lifepage.in/n/api/getAvatar", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ id: profileId.current })
//           })
//             .then(res => res.json())
//             .then(data => {
//               const avatarPath = data?.data?.[0]?.avatar;
//               if (data.success === 1 && avatarPath) updateImage(avatarPath);
//             });
//         }, 50000);
//       });
//   };

//   const updateImage = (avatarPath: string) => {
//     const bucketBase = "https://storage.googleapis.com/lifepage-video-android/";
//     setProfileImageSrc(`${bucketBase}${avatarPath}?v=${Date.now()}`);
//   };

//   // 🔹 Progress Calculation Utility
//   const calculateProgress = (): number => {
//     if (!sections.length || !sections[currentIndex]) return 0;
//     let totalSteps = 0;
//     sections.forEach(s => totalSteps += s.content.length);

//     if (currentIndex === 0 && contentIndex === 0) return 0;

//     let completedSteps = 0;
//     for (let i = 0; i < currentIndex; i++) {
//       if (sections[i]) completedSteps += sections[i].content.length;
//     }
//     completedSteps += contentIndex + 1;
//     return completedSteps / totalSteps;
//   };

//   const isCompletedStep = (): boolean => {
//     return sections.length > 0 &&
//       sections[currentIndex] !== undefined &&
//       currentIndex === sections.length - 1 &&
//       contentIndex === sections[currentIndex].content.length - 1;
//   };

//   const saveCurrentAnswer = () => {
//     if (!sections.length || !sections[currentIndex]) return;
//     const section = sections[currentIndex];
//     const categoryName = section.title.trim().toLowerCase();

//     const relatedQuestions = allQuestions.filter(q => {
//       const apiCategory = q.que_category.trim().toLowerCase();
//       const cleanApiCategory = apiCategory.replace("of", "").trim();
//       return categoryName.includes(cleanApiCategory);
//     });

//     if (!relatedQuestions.length) return;

//     const questionIndex = contentIndex < relatedQuestions.length ? contentIndex : 0;
//     const currentQuestion = relatedQuestions[questionIndex];

//     const existingIndex = userResponses.current.questions.findIndex(q =>
//       q.category === currentQuestion.que_category &&
//       q.weight === Number(currentQuestion.percentage)
//     );

//     if (existingIndex !== -1) {
//       userResponses.current.questions[existingIndex].value = sliderValue;
//     } else {
//       userResponses.current.questions.push({
//         category: currentQuestion.que_category,
//         weight: Number(currentQuestion.percentage),
//         value: sliderValue
//       });
//     }
//   };

//   // const handleNext = () => {
//   //   if (!sections.length || !sections[currentIndex]) return;

//   //   saveCurrentAnswer();
//   //   const totalContents = sections[currentIndex].content.length;

//   //   if (contentIndex < totalContents - 1) {
//   //     setContentIndex(prev => prev + 1);
//   //   } else if (currentIndex < sections.length - 1) {
//   //     setCurrentIndex(prev => prev + 1);
//   //     setContentIndex(0);
//   //   }

//   //   const section = sections[currentIndex];
//   //   const categoryName = section?.title.trim().toLowerCase() || "";
//   //   const relatedQuestions = allQuestions.filter(q => {
//   //     const apiCategory = q.que_category.trim().toLowerCase();
//   //     const cleanApiCategory = apiCategory.replace("of", "").trim();
//   //     return categoryName.includes(cleanApiCategory);
//   //   });

//   //   const questionIndex = (contentIndex + 1) < relatedQuestions.length ? (contentIndex + 1) : 0;
//   //   const nextQuestion = relatedQuestions[questionIndex];
//   //   if (nextQuestion) {
//   //     const existingAnswer = userResponses.current.questions.find(q =>
//   //       q.category === nextQuestion.que_category &&
//   //       q.weight === Number(nextQuestion.percentage)
//   //     );
//   //     setSliderValue(existingAnswer ? existingAnswer.value : 5);
//   //   } else {
//   //     setSliderValue(5);
//   //   }
//   // };

//   // 🔹 Navigation Control Trigger Functions
//   const handleNext = () => {
//     if (!sections.length || !sections[currentIndex]) return;

//     saveCurrentAnswer();
//     const totalContents = sections[currentIndex].content.length;

//     // 1. Calculate what the next index positions will be
//     let nextCurrentIndex = currentIndex;
//     let nextContentIndex = contentIndex;

//     if (contentIndex < totalContents - 1) {
//       nextContentIndex = contentIndex + 1;
//     } else if (currentIndex < sections.length - 1) {
//       nextCurrentIndex = currentIndex + 1;
//       nextContentIndex = 0;
//     }

//     // Update indexes to step forward
//     setContentIndex(nextContentIndex);
//     setCurrentIndex(nextCurrentIndex);

//     // 2. Fetch the upcoming section content data proactively to check for existing answers
//     const nextSection = sections[nextCurrentIndex];
//     const nextCategoryName = nextSection?.title.trim().toLowerCase() || "";

//     const nextRelatedQuestions = allQuestions.filter(q => {
//       const apiCategory = q.que_category.trim().toLowerCase();
//       const cleanApiCategory = apiCategory.replace("of", "").trim();
//       return nextCategoryName.includes(cleanApiCategory);
//     });

//     const targetQuestionIndex = nextContentIndex < nextRelatedQuestions.length ? nextContentIndex : 0;
//     const nextQuestion = nextRelatedQuestions[targetQuestionIndex];

//     if (nextQuestion) {
//       // Look up if the user already scored this question previously
//       const existingAnswer = userResponses.current.questions.find(q =>
//         q.category === nextQuestion.que_category &&
//         q.weight === Number(nextQuestion.percentage)
//       );

//       // 🔹 FIXED: If an answer exists, load it. If not, explicitly force-reset it back to 5!
//       setSliderValue(existingAnswer ? existingAnswer.value : 5);
//     } else {
//       setSliderValue(5);
//     }
//   };

//   const handleBack = () => {
//     // 1. Calculate what the previous index positions will be
//     let prevCurrentIndex = currentIndex;
//     let prevContentIndex = contentIndex;

//     if (contentIndex > 0) {
//       prevContentIndex = contentIndex - 1;
//     } else if (currentIndex > 0) {
//       prevCurrentIndex = currentIndex - 1;
//       if (sections[prevCurrentIndex]) {
//         prevContentIndex = sections[prevCurrentIndex].content.length - 1;
//       }
//     } else {
//       // Already at the very first page, nowhere back to go
//       return;
//     }

//     // Step the actual React indices backward
//     setContentIndex(prevContentIndex);
//     setCurrentIndex(prevCurrentIndex);

//     // 2. Look up the question for this previous page
//     const prevSection = sections[prevCurrentIndex];
//     const prevCategoryName = prevSection?.title.trim().toLowerCase() || "";

//     const prevRelatedQuestions = allQuestions.filter(q => {
//       const apiCategory = q.que_category.trim().toLowerCase();
//       const cleanApiCategory = apiCategory.replace("of", "").trim();
//       return prevCategoryName.includes(cleanApiCategory);
//     });

//     const targetQuestionIndex = prevContentIndex < prevRelatedQuestions.length ? prevContentIndex : 0;
//     const prevQuestion = prevRelatedQuestions[targetQuestionIndex];

//     if (prevQuestion) {
//       // 🔹 Look up your previously saved response for this exact question
//       const existingAnswer = userResponses.current.questions.find(q =>
//         q.category === prevQuestion.que_category &&
//         q.weight === Number(prevQuestion.percentage)
//       );

//       // Load the saved answer, or fallback to 5 if somehow untouched
//       setSliderValue(existingAnswer ? existingAnswer.value : 5);
//     } else {
//       setSliderValue(5);
//     }
//   };

//   const handleSaveName = () => {
//     setSavedName(nameInputValue);
//     setIsEditingName(false);
//   };

//   const calculateSelfAssessment = async () => {
//     saveCurrentAnswer();
//     if (isCompletedStep()) {
//       try {
//         const res = await fetch("https://www.lifepage.in/n/api/DreamIndex", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(userResponses.current)
//         });
//         const data = await res.json();
//         if (data.success === 1) {
//           const score = data.data.overall_percentage;
//           setDreamIndexScore(score);

//           localStorage.setItem("hasCalculated", "true");
//           updateAvatarType();

//           const params = new URLSearchParams({
//             name: savedName || "Career Seeker",
//             career: topic || fieldOfStudy.current,
//             score: score + "%",
//             image: profileImageSrc.split('?')[0],
//             profileid: profileId.current,
//             fieldOfStudy: fieldOfStudy.current
//           });

//           setCertificateUrl(`/certificate?${params.toString()}`);
//           setIsJourneyComplete(true);
//         }
//       } catch (err) {
//         console.error("Calculation Error", err);
//       }
//     }
//   };

//   const updateAvatarType = () => {
//     const userid = localStorage.getItem("lp_userid");
//     if (!userid) return;

//     const hasUploaded = localStorage.getItem("hasUploaded") === "true";
//     let which_avatar = "generic_without_self_assessment";

//     if (!hasUploaded) {
//       which_avatar = "generic_with_self_assessment";
//     } else {
//       which_avatar = "personal_with_self_assessment";
//     }

//     fetch("https://www.lifepage.in/n/api/update_user_event", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userid, which_avatar })
//     });
//   };

//   const handleDownloadAvatar = () => {
//     import('html2canvas-pro').then(({ default: html2canvasPro }) => {
//       const element = document.getElementById("avatar-download-target");
//       if (!element) return;

//       html2canvasPro(element, {
//         scale: 5,
//         backgroundColor: null,
//         useCORS: true
//       }).then(canvas => {
//         const link = document.createElement("a");
//         link.download = "self-assessment.png";
//         link.href = canvas.toDataURL("image/png");
//         link.click();
//       });
//     });
//   };

//   const getDynamicQuestionElement = () => {
//     if (!sections.length || !sections[currentIndex]) return null;
//     const section = sections[currentIndex];
//     const categoryName = section.title.trim().toLowerCase();

//     const relatedQuestions = allQuestions.filter(q => {
//       return categoryName.includes(q.que_category.trim().toLowerCase().replace("of", "").trim());
//     });

//     if (relatedQuestions.length > 0) {
//       const questionIndex = contentIndex < relatedQuestions.length ? contentIndex : 0;
//       const currentQuestion = relatedQuestions[questionIndex];

//       const questionText = (cat: string, qText: string) => {
//         const smlCat = cat.toLowerCase();
//         const smlQue = qText.toLowerCase();
//         if (smlCat === `what is ${smlQue}`) return `How much did you like ${qText}?`;
//         if (smlCat === "education") return `How much did you like to study ${qText}?`;
//         if (smlCat === "skills") return `How much did you like to develop ${qText}?`;
//         if (smlCat === "positives") return `How much did you like ${qText}?`;
//         if (smlCat === "challenges") return `Are you prepared to face ${qText}?`;
//         if (smlCat === "a day of") return `How much did you like a day in ${qText}?`;
//         return `How much did you like ${qText}?`;
//       };

//       return (
//         <div id="questionSection" className="w-full mt-4 p-5 bg-white rounded-xl shadow-inner text-left">
//           <h3 className="font-bold text-gray-800 text-lg mb-4">
//             {questionText(currentQuestion.que_category, currentQuestion.question)}
//           </h3>

//           <input
//             type="range"
//             min="1"
//             max="10"
//             step="1"
//             value={sliderValue}
//             onChange={(e) => setSliderValue(Number(e.target.value))}
//             className="w-full accent-[#E46C09]"
//           />

//           <div className="flex justify-between text-xs px-1 text-gray-500 mt-2 font-medium">
//             {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => <span key={val}>{val}</span>)}
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   const progress = calculateProgress();
//   const percent = Math.round(progress * 100);

//   const section = sections[currentIndex];
//   const activeContent = section?.content[contentIndex];

//   return (
//     <div className="w-full min-h-screen bg-white font-sans  box-border">
//       <div className="max-w-[1280px] mx-auto grid grid-cols-[400px_1fr] gap-12 max-[1024px]:grid-cols-1 max-[1024px]:gap-14 max-[1024px]:py-14 max-[1024px]:px-5">

//         {/* LEFT COLUMN */}
//         <div className="flex flex-col items-center gap-6 w-full">
//           <h4 className="text-xl font-bold text-gray-800">
//             Career in <span className="text-[#E46C09]">{topic || fieldOfStudy.current}</span>
//           </h4>

//           {/* Profile Canvas Container */}
//           <div
//             id="avatar-download-target"
//             className="w-[220px] h-[220px] rounded-full overflow-hidden relative border border-[#323232]"
//             style={{ backgroundColor: '#e5e7eb' }}
//           >
//             <img
//               id="profileImage"
//               src={profileImageSrc}
//               className="w-full h-full object-cover transition-all duration-600"
//               alt="Career Profile"
//             />

//             <div
//               className="rounded-lg absolute bottom-0 left-1/2 -translate-x-1/2 w-[213px] h-[51px] flex flex-col justify-between items-center py-1 text-white z-10"
//               style={{ backgroundColor: '#363636' }}
//             >
//               <span className="text-[10px] text-[#E46C09] font-semibold">www.lifepage.in/ai</span>
//               <div className="w-[136px] h-[1px]" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
//               <span className="text-[12px] font-medium mb-1">
//                 {dreamIndexScore !== null
//                   ? `${savedName || "Career Seeker"} ${dreamIndexScore}%`
//                   : (savedName || "Career Seeker")}
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-row justify-center gap-4 w-full">
//             {dreamIndexScore !== null && (
//               <button onClick={handleDownloadAvatar} className="py-3 px-[22px] bg-[#2196f3] text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md text-sm">
//                 Download Avatar
//               </button>
//             )}

//             <div className="flex gap-2 items-center">
//               {!isEditingName ? (
//                 <button onClick={() => { setIsEditingName(true); setNameInputValue(savedName); }} className="py-3 px-[22px] bg-[#2196f3] text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md text-sm">
//                   {savedName ? 'Edit Name' : '+ Add Name'}
//                 </button>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <input type="text" placeholder="Enter your name" value={nameInputValue} onChange={(e) => setNameInputValue(e.target.value)} className="p-3 text-sm rounded-xl border border-black text-black bg-white focus:outline-none" />
//                   <button onClick={handleSaveName} className="py-3 px-[22px] bg-[#2196f3] text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md text-sm">Save</button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* RIGHT COLUMN */}
//         <div className="bg-[#f9fafb] p-5 sm:p-10 rounded-[28px] shadow-sm border border-gray-100 box-border">

//           {!isJourneyComplete ? (
//             <div id="assessmentContent">
//               {isAiLoading && (
//                 <div className="text-center p-5 font-semibold text-[#E46C09] animate-pulse">
//                   AI is generating your career insights... please wait ({countdown}s)
//                 </div>
//               )}

//               {/* Progress Steps Header */}
//               <div className="grid grid-cols-6 gap-2 mb-6 text-xs text-center font-bold">
//                 {orbitConfig.map((config, idx) => {
//                   const label = config.label.toLowerCase();
//                   const sectionIndex = sections.findIndex(s => s.title.toLowerCase().startsWith(label));
//                   const isCompleted = sectionIndex !== -1 && (sectionIndex < currentIndex);
//                   const isActive = section?.title.toLowerCase().startsWith(label);

//                   return (
//                     <div
//                       key={idx}
//                       className="flex-1 min-w-0 text-center px-1.5 py-1 sm:p-2 rounded-lg border font-bold text-xs sm:text-sm md:text-base leading-tight transition-all duration-300 break-words flex items-center justify-center"
//                       style={{
//                         // 🔹 Explicit hex overrides bypass Tailwind v4 oklch() space conversions entirely
//                         backgroundColor: isCompleted ? '#E46C09' : '#ffffff',
//                         color: isCompleted ? '#ffffff' : isActive ? '#111827' : '#9ca3af',
//                         borderColor: isActive ? '#E46C09' : '#363636',
//                         borderWidth: isActive ? '2px' : '1px'
//                       }}
//                     >
//                       {config.label}
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Slider Progress HUD */}
//               <div className="flex justify-between font-bold text-sm text-gray-500 mb-1">
//                 <span>Progress</span>
//                 <span className="text-gray-900">{percent}%</span>
//               </div>
//               <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
//                 <div className="h-full bg-[#E46C09] transition-all duration-600" style={{ width: `${percent}%` }} />
//               </div>

//               {activeContent && !activeContent.image && (
//                 <h1 className="text-2xl font-extrabold text-gray-900 leading-snug mb-5 max-sm:text-[20px]">
//                   {articleTitle}
//                 </h1>
//               )}

//               {/* Sub-Card Grid Container */}
//               <div className="flex md:flex-row flex-col gap-5 items-start mt-4 mb-6">
//                 <div className="flex-1 w-full max-w-[700px] mx-auto">

//                   {activeContent?.image && (
//                     <div className="relative mb-6">
//                       {isAi.current && (
//                         <div className="absolute top-0 left-0 w-full bg-[#323232]/90 text-white p-3 font-semibold flex justify-between items-center text-sm rounded-t-lg">
//                           <span>[{section?.title}] {activeContent.subtitle}</span>
//                         </div>
//                       )}
//                       <img
//                         src={activeContent.image}
//                         className="w-full h-auto block rounded-lg shadow-md max-h-[500px] object-cover"
//                         alt="Step Cover"
//                       />
//                     </div>
//                   )}

//                   {getDynamicQuestionElement()}
//                 </div>
//               </div>

//               <div className="flex justify-between items-center gap-6 mt-6">
//                 <button onClick={handleBack} className={`py-3 px-6 bg-[#363636] text-white font-semibold rounded-xl transition hover:bg-gray-800 shadow-sm text-sm ${(currentIndex === 0 && contentIndex === 0) ? 'invisible' : 'visible'}`}>← Back</button>
//                 {!isCompletedStep() ? (
//                   <button
//                     onClick={handleNext}
//                     className="py-3 px-6 bg-[#E46C09] text-white font-semibold rounded-xl transition hover:bg-[#c95d05] shadow-sm text-sm"
//                   >
//                     Next →
//                   </button>
//                 ) : (
//                   <button
//                     onClick={calculateSelfAssessment}
//                     className="py-3 px-6 bg-[#E46C09] text-white font-semibold rounded-xl transition hover:bg-[#c95d05] shadow-md text-sm animate-bounce"
//                   >
//                     Calculate Self Assessment
//                   </button>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="w-full">
//               {/*  <h2 className="text-2xl font-bold text-gray-900 mb-6">Journey Complete 🎉</h2> */}
//               <iframe
//                 src={certificateUrl}
//                 className="w-full h-[800px] border-none rounded-[20px] bg-white shadow-inner"
//                 title="Self Assessment Certificate"
//               />
//             </div>
//           )}

//         </div>

//       </div>

//       {/* Expanded Bottom Text Subtitle details */}
//       {activeContent && (
//         <div id="bottomTextContainer" className="mt-10 max-w-[1240px] mx-auto p-8 bg-[#363636] text-white rounded-2xl text-left shadow-lg">
//           {activeContent.subtitle && (
//             <h3 className="text-center font-bold text-xl text-[#E46C09] mb-4">
//               {activeContent.subtitle}
//             </h3>
//           )}
//           <p className="text-gray-200 text-md leading-[1.8] whitespace-pre-wrap">
//             {activeContent.text}
//           </p>
//         </div>
//       )}

//     </div>
//   );
// }

// export default function ArticlesPage() {
//   return (
//     <Suspense fallback={<div className="flex justify-center items-center min-h-screen font-sans text-[#E46C09] font-bold animate-pulse">Loading assessments...</div>}>
//       <ArticlesContent />
//     </Suspense>
//   );
// }



'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// 🔹 TypeScript Interfaces
interface QuestionDetail {
  sessionid: string;
  que_category: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL query params
  const profileIdFromUrl = searchParams.get('profileid') || '';
  const fieldOfStudyFromUrl = searchParams.get('fieldOfStudy') || '';

  const [articleTitle, setArticleTitle] = useState<string>("Deep dive into Your Career");
  const [topic, setTopic] = useState<string>('');
  const [profileImageSrc, setProfileImageSrc] = useState<string>('support/choices.jpg');

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
  const displayedSessionIds = useRef<Set<string>>(new Set());

  const profileId = useRef<string>('');
  const isAi = useRef<boolean>(false);
  const fieldOfStudy = useRef<string>('');

  // 🔹 Sync Initial URL variables & session storage on load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!sessionStorage.getItem("lp_session_started")) {
      localStorage.removeItem("hasUploaded");
      localStorage.removeItem("hasCalculated");
      sessionStorage.setItem("lp_session_started", "true");
    }

    const cachedTopic = sessionStorage.getItem("topic") || '';
    setTopic(cachedTopic);

    const storedIsAi = sessionStorage.getItem("isAi") === "true";
    isAi.current = storedIsAi;

    const storedFieldOfStudy = sessionStorage.getItem("fieldOfStudy") || '';
    fieldOfStudy.current = storedFieldOfStudy;

    const storedProfileId = sessionStorage.getItem("profileid") || '';
    profileId.current = storedProfileId;

    // Direct fallback checks
    if (profileIdFromUrl) profileId.current = profileIdFromUrl;
    if (fieldOfStudyFromUrl) fieldOfStudy.current = fieldOfStudyFromUrl;

    initData();
    startAvatarProcess();

    // Prevent secondary default right-click popups
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [profileIdFromUrl, fieldOfStudyFromUrl]);

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

  // 🔹 Fetch Article title
  useEffect(() => {
    async function fetchHeading() {
      const type = profileId.current ? 'profile' : fieldOfStudy.current ? 'ai' : '';
      const val = type === 'profile' ? profileId.current : fieldOfStudy.current;
      if (!type || !val) return;

      try {
        if (type === 'profile') {
          const res = await fetch('https://www.lifepage.in/n/api/checksession', {
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
          const res = await fetch('https://www.lifepage.in/n/api/getDescription', {
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
      const res = await fetch("https://www.lifepage.in/n/api/questiondetails", {
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
      const res = await fetch("https://www.lifepage.in/n/api/checksession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profileId.current })
      });
      const data = await res.json();
      if (data.success === 1) {
        const parsed = parseMarkdown(data.data[0].content);
        setSections(parsed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAiData = async () => {
    const career = sessionStorage.getItem("fieldOfStudy") || fieldOfStudy.current;
    if (!career) return;
    try {
      const res = await fetch("https://www.lifepage.in/n/api/testing", {
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

        const apiQuestions: QuestionDetail[] = data.article.percentage.map((item: any) => ({
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
          currentSub.image = "/ai.jpg"; // Updated static image path for AI articles
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
        imageCounter += 1; // GAP after category
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
  const startAvatarProcess = () => {
    if (fieldOfStudy.current) {
      fetch("https://www.lifepage.in/n/api/generateCareerAvatar", {
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
      fetch("https://www.lifepage.in/n/api/getAvatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profileId.current })
      })
        .then(res => res.json())
        .then(data => {
          const avatarPath = data?.data?.[0]?.avatar;
          if (data.success === 1 && avatarPath) {
            updateImage(avatarPath);
          } else {
            generateAvatar();
          }
        });
    }
  };

  const generateAvatar = () => {
    const prompt = `Create a high-quality 3D animated character illustration representing a professional ${topic}...`;
    fetch("https://www.lifepage.in/n/api/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        careerName: topic,
        prompt: prompt,
        session_id: profileId.current
      })
    })
      .then(res => res.json())
      .then(() => {
        setTimeout(() => {
          fetch("https://www.lifepage.in/n/api/getAvatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: profileId.current })
          })
            .then(res => res.json())
            .then(data => {
              const avatarPath = data?.data?.[0]?.avatar;
              if (data.success === 1 && avatarPath) updateImage(avatarPath);
            });
        }, 50000);
      });
  };

  const updateImage = (avatarPath: string) => {
    const bucketBase = "https://storage.googleapis.com/lifepage-video-android/";
    setProfileImageSrc(`${bucketBase}${avatarPath}?v=${Date.now()}`);
  };

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
        const res = await fetch("https://www.lifepage.in/n/api/DreamIndex", {
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
    const userid = localStorage.getItem("lp_userid");
    if (!userid) return;

    const hasUploaded = localStorage.getItem("hasUploaded") === "true";
    let which_avatar = "generic_without_self_assessment";

    if (!hasUploaded) {
      which_avatar = "generic_with_self_assessment";
    } else {
      which_avatar = "personal_with_self_assessment";
    }

    fetch("https://www.lifepage.in/n/api/update_user_event", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid, which_avatar })
    });
  };

  const handleDownloadAvatar = () => {
    import('html2canvas-pro').then(({ default: html2canvasPro }) => {
      const element = document.getElementById("avatar-download-target");
      if (!element) return;

      html2canvasPro(element, {
        scale: 5,
        backgroundColor: null,
        useCORS: true
      }).then(canvas => {
        const link = document.createElement("a");
        link.download = "self-assessment.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
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

      return (
        <div id="questionSection" className="w-full mt-4 p-5 bg-white rounded-xl shadow-inner text-left">
          <h3 className="font-bold text-gray-800 text-lg mb-4">
            {questionText(currentQuestion.que_category, currentQuestion.question)}
          </h3>

          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full accent-[#E46C09]"
          />

          <div className="flex justify-between text-xs px-1 text-gray-500 mt-2 font-medium">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => <span key={val}>{val}</span>)}
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

  return (
    <div className="w-full min-h-screen bg-white font-sans box-border">
      <div className="max-w-[1280px] mx-auto grid grid-cols-[400px_1fr] gap-12 max-[1024px]:grid-cols-1 max-[1024px]:gap-14 max-[1024px]:py-14 max-[1024px]:px-5">

        {/* LEFT COLUMN */}
        <div className="flex flex-col items-center gap-6 w-full">
          <h4 className="text-xl font-bold text-gray-800">
            Career in <span className="text-[#E46C09]">{topic || fieldOfStudy.current}</span>
          </h4>

          {/* Profile Canvas Container */}
          <div
            id="avatar-download-target"
            className="w-[220px] h-[220px] rounded-full overflow-hidden relative border border-[#323232]"
            style={{ backgroundColor: '#e5e7eb' }}
          >
            <img
              id="profileImage"
              src={profileImageSrc}
              className="w-full h-full object-cover transition-all duration-600"
              alt="Career Profile"
            />

            <div
              className="rounded-lg absolute bottom-0 left-1/2 -translate-x-1/2 w-[213px] h-[51px] flex flex-col justify-between items-center py-1 text-white z-10"
              style={{ backgroundColor: '#363636' }}
            >
              <span className="text-[10px] text-[#E46C09] font-semibold">www.lifepage.in/ai</span>
              <div className="w-[136px] h-[1px]" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <span className="text-[12px] font-medium mb-1">
                {dreamIndexScore !== null
                  ? `${savedName || "Career Seeker"} ${dreamIndexScore}%`
                  : (savedName || "Career Seeker")}
              </span>
            </div>
          </div>

          <div className="flex flex-row justify-center gap-4 w-full">
            {dreamIndexScore !== null && (
              <button onClick={handleDownloadAvatar} className="py-3 px-[22px] bg-[#2196f3] text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md text-sm">
                Download Avatar
              </button>
            )}

            <div className="flex gap-2 items-center">
              {!isEditingName ? (
                <button onClick={() => { setIsEditingName(true); setNameInputValue(savedName); }} className="py-3 px-[22px] bg-[#2196f3] text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md text-sm">
                  {savedName ? 'Edit Name' : '+ Add Name'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Enter your name" value={nameInputValue} onChange={(e) => setNameInputValue(e.target.value)} className="p-3 text-sm rounded-xl border border-black text-black bg-white focus:outline-none" />
                  <button onClick={handleSaveName} className="py-3 px-[22px] bg-[#2196f3] text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md text-sm">Save</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-[#f9fafb] p-5 sm:p-10 rounded-[28px] shadow-sm border border-gray-100 box-border">

          {!isJourneyComplete ? (
            <div id="assessmentContent">
              {isAiLoading && (
                <div className="text-center p-5 font-semibold text-[#E46C09] animate-pulse">
                  AI is generating your career insights... please wait ({countdown}s)
                </div>
              )}

              {/* Progress Steps Header */}
              <div className="grid grid-cols-6 gap-2 mb-6 text-xs text-center font-bold">
                {orbitConfig.map((config, idx) => {
                  const label = config.label.toLowerCase();
                  const sectionIndex = sections.findIndex(s => s.title.toLowerCase().startsWith(label));
                  const isCompleted = sectionIndex !== -1 && (sectionIndex < currentIndex);
                  const isActive = section?.title.toLowerCase().startsWith(label);

                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-0 text-center px-1.5 py-1 sm:p-2 rounded-lg border font-bold text-xs sm:text-sm md:text-base leading-tight transition-all duration-300 break-words flex items-center justify-center"
                      style={{
                        backgroundColor: isCompleted ? '#E46C09' : '#ffffff',
                        color: isCompleted ? '#ffffff' : isActive ? '#111827' : '#9ca3af',
                        borderColor: isActive ? '#E46C09' : '#363636',
                        borderWidth: isActive ? '2px' : '1px'
                      }}
                    >
                      {config.label}
                    </div>
                  );
                })}
              </div>

              {/* Slider Progress HUD */}
              <div className="flex justify-between font-bold text-sm text-gray-500 mb-1">
                <span>Progress</span>
                <span className="text-gray-900">{percent}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-[#E46C09] transition-all duration-600" style={{ width: `${percent}%` }} />
              </div>

              {activeContent && !activeContent.image && (
                <h1 className="text-2xl font-extrabold text-gray-900 leading-snug mb-5 max-sm:text-[20px]">
                  {articleTitle}
                </h1>
              )}

              {/* Sub-Card Grid Container */}
              <div className="flex md:flex-row flex-col gap-5 items-start mt-4 mb-6">
                <div className="flex-1 w-full max-w-[700px] mx-auto">

                  {activeContent?.image && (
                    <div className="relative mb-6">
                      {isAi.current && (
                        <div className="absolute top-0 left-0 w-full bg-[#323232]/90 text-white p-3 font-semibold flex justify-between items-center text-sm rounded-t-lg">
                          <span>[{section?.title}] {activeContent.subtitle}</span>
                        </div>
                      )}
                      <img
                        src={activeContent.image}
                        className="w-full h-auto block rounded-lg shadow-md max-h-[500px] object-cover"
                        alt="Step Cover"
                      />
                    </div>
                  )}

                  {getDynamicQuestionElement()}
                </div>
              </div>

              <div className="flex justify-between items-center gap-6 mt-6">
                <button onClick={handleBack} className={`py-3 px-6 bg-[#363636] text-white font-semibold rounded-xl transition hover:bg-gray-800 shadow-sm text-sm ${(currentIndex === 0 && contentIndex === 0) ? 'invisible' : 'visible'}`}>← Back</button>
                {!isCompletedStep() ? (
                  <button
                    onClick={handleNext}
                    className="py-3 px-6 bg-[#E46C09] text-white font-semibold rounded-xl transition hover:bg-[#c95d05] shadow-sm text-sm"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={calculateSelfAssessment}
                    className="py-3 px-6 bg-[#E46C09] text-white font-semibold rounded-xl transition hover:bg-[#c95d05] shadow-md text-sm animate-bounce"
                  >
                    Calculate Self Assessment
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <iframe
                src={certificateUrl}
                className="w-full h-[800px] border-none rounded-[20px] bg-white shadow-inner"
                title="Self Assessment Certificate"
              />
            </div>
          )}

        </div>

      </div>

      {/* Expanded Bottom Text Subtitle details */}
      {activeContent && (
        <div id="bottomTextContainer" className="mt-10 max-w-[1240px] mx-auto p-8 bg-[#363636] text-white rounded-2xl text-left shadow-lg">
          {activeContent.subtitle && (
            <h3 className="text-center font-bold text-xl text-[#E46C09] mb-4">
              {activeContent.subtitle}
            </h3>
          )}
          <p className="text-gray-200 text-md leading-[1.8] whitespace-pre-wrap">
            {activeContent.text}
          </p>
        </div>
      )}

    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen font-sans text-[#E46C09] font-bold animate-pulse">Loading assessments...</div>}>
      <ArticlesContent />
    </Suspense>
  );
}