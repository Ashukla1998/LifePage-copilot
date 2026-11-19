import { API_BASE } from "@/lib/api";
import { resolveVideoUrl } from "@/lib/articles";

// Random career videos for the home page grid.
// Primary source: the backend's RandomCareerVideos endpoint (one query, speaker included).
// Backup: the older randomCareer (2 careers per call, no speaker) + SearchByName lookups,
// used only if RandomCareerVideos fails or returns nothing.

export interface CareerVideo {
  sessionId: string;
  career: string;
  speaker: string;
  designation: string;
  place: string;
  /** Language the talk is in, e.g. "Hindi" */
  lang: string;
  /** Years in the career, from from_ts/to_ts (null when unknown) */
  experienceYears: number | null;
  thumbUrl: string;
  videoUrl: string;
}

/** A session row as RandomCareerVideos and SearchByName return it */
interface SessionRow {
  sessionid: string;
  topic: string;
  name?: string | null;
  designation?: string | null;
  place?: string | null;
  lang?: string | null;
  from_ts?: string | number | null;
  to_ts?: string | number | null;
  videofile?: string | null;
  thumbfile?: string | null;
}

interface RandomCareerRow {
  session: { sessionid: string; topic: string };
}

const isFullUrl = (value: string) => /^https?:\/\//i.test(value);
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

/**
 * from_ts/to_ts are Unix seconds (as strings). Same rule as the advisor list: difference
 * of calendar years, e.g. 2012 → 2020 = 8.
 */
function experienceYears(from?: string | number | null, to?: string | number | null): number | null {
  const fromSec = Number(from);
  const toSec = Number(to);
  if (!fromSec || !toSec || toSec < fromSec) return null;
  return new Date(toSec * 1000).getFullYear() - new Date(fromSec * 1000).getFullYear();
}

/** Maps a session row to a grid item, or null when it has no playable bucket video or speaker */
function toCareerVideo(row: SessionRow | undefined): CareerVideo | null {
  // Grid previews need a playable bucket MP4 (not a YouTube link)
  if (!row?.sessionid || !row.videofile || isFullUrl(row.videofile) || !row.name?.trim()) return null;
  const sessionId = String(row.sessionid);

  return {
    sessionId,
    career: row.topic,
    speaker: row.name.trim(),
    designation: row.designation?.trim() ?? "",
    place: row.place?.trim() ?? "",
    lang: capitalize(row.lang?.trim() ?? ""),
    experienceYears: experienceYears(row.from_ts, row.to_ts),
    thumbUrl: row.thumbfile ? resolveVideoUrl(row.thumbfile, sessionId) : "",
    videoUrl: resolveVideoUrl(row.videofile, sessionId),
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? (json.data as T) : null;
  } catch {
    return null;
  }
}

// The backend caps one RandomCareerVideos call at 12 careers
const BACKEND_MAX_PER_CALL = 12;

/**
 * Primary: RandomCareerVideos returns random careers with speaker details. Above the backend's
 * per-call cap, top up with follow-up calls that exclude what we already have.
 */
async function fromRandomCareerVideos(count: number): Promise<CareerVideo[]> {
  const videos: CareerVideo[] = [];
  const seenIds = new Set<string>();
  const seenTopics = new Set<string>();

  for (let call = 0; call < 3 && videos.length < count; call++) {
    const rows = await postJson<SessionRow[]>("RandomCareerVideos", {
      count: Math.min(count - videos.length, BACKEND_MAX_PER_CALL),
      exclude: [...seenIds],
    });
    if (!rows?.length) break;

    for (const video of rows.map(toCareerVideo)) {
      // exclude only covers session ids, so also skip a career (topic) we already have
      if (!video || seenIds.has(video.sessionId) || seenTopics.has(video.career)) continue;
      seenIds.add(video.sessionId);
      seenTopics.add(video.career);
      videos.push(video);
    }
  }

  return videos;
}

// ---- Backup path (older endpoints; ~1 + N backend calls) ----

const PARALLEL_CALLS = 3;
const MAX_ROUNDS = 6;

async function randomCareers(exclude: string[], names: string[]) {
  const rows = await postJson<RandomCareerRow[]>("randomCareer", { exclude, names });
  return (rows ?? []).map((r) => r.session).filter((s) => s?.sessionid && s?.topic);
}

async function sessionDetails(sessionId: string, topic: string): Promise<CareerVideo | null> {
  const rows = await postJson<SessionRow[]>("SearchByName", { name: topic });
  return toCareerVideo(rows?.find((r) => String(r.sessionid) === sessionId));
}

async function fromLegacyEndpoints(count: number): Promise<CareerVideo[]> {
  const videos: CareerVideo[] = [];
  const seenIds = new Set<string>();
  const seenTopics = new Set<string>();

  for (let round = 0; round < MAX_ROUNDS && videos.length < count; round++) {
    const exclude = [...seenIds];
    const names = [...seenTopics];

    // A few randomCareer calls at once; parallel calls can overlap, so dedupe below
    const batches = await Promise.all(
      Array.from({ length: PARALLEL_CALLS }, () => randomCareers(exclude, names))
    );

    const fresh = batches.flat().filter((s) => {
      if (seenIds.has(s.sessionid) || seenTopics.has(s.topic)) return false;
      seenIds.add(s.sessionid);
      seenTopics.add(s.topic);
      return true;
    });

    const details = await Promise.all(fresh.map((s) => sessionDetails(s.sessionid, s.topic)));
    for (const video of details) {
      if (video && videos.length < count) videos.push(video);
    }
  }

  return videos;
}

export async function getRandomCareerVideos(count = 9): Promise<CareerVideo[]> {
  const videos = await fromRandomCareerVideos(count);
  if (videos.length > 0) return videos.slice(0, count);

  console.warn("RandomCareerVideos returned nothing; falling back to randomCareer + SearchByName");
  return fromLegacyEndpoints(count);
}
