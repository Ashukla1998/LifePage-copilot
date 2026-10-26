// Serves images from the lifepage-video-android bucket through our own origin.
// The bucket sends no CORS headers, so a crossOrigin <img> (needed for the
// html2canvas avatar download) can't load it directly.
const BUCKET_BASE = "https://storage.googleapis.com/lifepage-video-android/";
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;
const IMAGE_FILE = /\.(png|jpe?g|webp)$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  const isValid =
    path.length > 0 &&
    path.every((segment) => SAFE_SEGMENT.test(segment) && segment !== "..") &&
    IMAGE_FILE.test(path[path.length - 1]);

  if (!isValid) {
    return new Response("Invalid image path", { status: 400 });
  }

  const upstream = await fetch(BUCKET_BASE + path.join("/"), { cache: "no-store" });

  if (!upstream.ok || !upstream.body) {
    return new Response("Image not found", { status: upstream.status === 404 ? 404 : 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
