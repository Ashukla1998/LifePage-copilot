import { getRandomCareerVideos } from "@/lib/careerVideos";

// GET /api/career-videos?count=9
// Returns a fresh random set of career videos with speaker name and career on every request.
const MAX_COUNT = 16;

export async function GET(request: Request) {
  const requested = Number(new URL(request.url).searchParams.get("count") ?? 9);
  const count = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), MAX_COUNT) : 9;

  const videos = await getRandomCareerVideos(count);

  if (videos.length === 0) {
    return Response.json({ success: 0, data: [], message: "No career videos available" }, { status: 502 });
  }

  return Response.json(
    { success: 1, data: videos },
    { headers: { "Cache-Control": "no-store" } }
  );
}
