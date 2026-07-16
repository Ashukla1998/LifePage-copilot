"use client";

import { useEffect, useState } from "react";
import {
  getUserQuestions,
  getRandomCareer,
  getCareerByQuestion,
} from "@/services/career.service";

export interface Question {
  question: string;
  que_category: string;
  percentage: number;
}

export interface Session {
  sessionid: number;
  topic: string;
  thumbfile: string;
  avatar?: string;
}

export interface Career {
  session: Session;
  questions: Question[];
}

export default function useCareerDuels() {
  const [leftCareer, setLeftCareer] = useState<Career | null>(null);
  const [rightCareer, setRightCareer] = useState<Career | null>(null);

  const [loading, setLoading] = useState(true);

  const [excludeList, setExcludeList] = useState<number[]>([]);

  const [lastSelected, setLastSelected] = useState<
    "left" | "right" | null
  >(null);

  const [leftClickCount, setLeftClickCount] = useState(0);

  const [rightClickCount, setRightClickCount] = useState(0);

  const [round, setRound] = useState(1);

  const MAX_ROUNDS = 4;

  useEffect(() => {
    loadInitialCareers();
  }, []);

  async function loadInitialCareers() {
    try {
      setLoading(true);

      const res = await getUserQuestions();

      if (!res.success || res.data.length < 2) return;

      setLeftCareer(res.data[0]);

      setRightCareer(res.data[1]);

      setExcludeList([
        res.data[0].session.sessionid,
        res.data[1].session.sessionid,
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function getNextCareer(baseCareer: Career) {
    const skills = baseCareer.questions
      .filter((q) => q.que_category === "Skills")
      .sort((a, b) => b.percentage - a.percentage);

    for (const skill of skills) {
      const res = await getCareerByQuestion({
        question: skill.question,
        percentage: skill.percentage,
        exclude: excludeList,
        names: [baseCareer.session.topic],
      });

      if (res.data?.length) {
        return res.data[0];
      }
    }

    const random = await getRandomCareer({
      exclude: excludeList,
      names: [baseCareer.session.topic],
    });

    return random.data?.[0] || null;
  }

  async function chooseLeft() {
    if (!leftCareer) return;

    setLeftClickCount((c) => c + 1);

    setLastSelected("left");

    const next = await getNextCareer(leftCareer);

    if (!next) return;

    setExcludeList((prev) => [...prev, next.session.sessionid]);

    setRightCareer(next);

    setRound((r) => Math.min(r + 1, MAX_ROUNDS));
  }

  async function chooseRight() {
    if (!rightCareer) return;

    setRightClickCount((c) => c + 1);

    setLastSelected("right");

    const next = await getNextCareer(rightCareer);

    if (!next) return;

    setExcludeList((prev) => [...prev, next.session.sessionid]);

    setLeftCareer(next);

    setRound((r) => Math.min(r + 1, MAX_ROUNDS));
  }

  async function skip() {
    if (!leftCareer || !rightCareer) return;

    const res = await getRandomCareer({
      exclude: [
        ...excludeList,
        leftCareer.session.sessionid,
        rightCareer.session.sessionid,
      ],
      names: [
        leftCareer.session.topic,
        rightCareer.session.topic,
      ],
    });

    if (!res.success) return;

    setLeftCareer(res.data[0]);

    setRightCareer(res.data[1]);

    setExcludeList((prev) => [
      ...prev,
      res.data[0].session.sessionid,
      res.data[1].session.sessionid,
    ]);
  }

  return {
    loading,

    round,

    leftCareer,

    rightCareer,

    chooseLeft,

    chooseRight,

    skip,

    leftClickCount,

    rightClickCount,

    lastSelected,
  };
}