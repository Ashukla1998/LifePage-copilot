// Smoke test: checks that the main pages and the image route respond on a running server.
// Usage: npm run dev (in another terminal), then `npm run test:smoke`
// Target another server with BASE_URL, e.g. BASE_URL=https://staging.example.com npm run test:smoke

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const checks = [
  { path: "/", status: 200, includes: "Find the" },
  { path: "/career-duels", status: 200, includes: "<title>Career Duels | LifePage</title>" },
  { path: "/compare?career=Doctor", status: 200, includes: "<title>Compare Careers | LifePage</title>" },
  { path: "/advisor-list?career=Cardiology", status: 200, includes: "<title>Choose an Advisor | LifePage</title>" },
  { path: "/articles?profileid=20170603-0003", status: 200, includes: "<title>Career Deep Dive | LifePage</title>" },
  { path: "/login", status: 200, includes: "<title>Login | LifePage</title>" },
  { path: "/this-page-does-not-exist", status: 404, includes: "This path doesn" },
  { path: "/api/bucket-image/avatar/20170603-0003.png", status: 200, contentType: "image/" },
  { path: "/api/bucket-image/..%2Fsecret.txt", status: 400 },
];

let failures = 0;

for (const check of checks) {
  const problems = [];
  try {
    const res = await fetch(BASE_URL + check.path, { redirect: "manual" });
    if (res.status !== check.status) problems.push(`status ${res.status}, expected ${check.status}`);

    const type = res.headers.get("content-type") ?? "";
    if (check.contentType && !type.startsWith(check.contentType)) {
      problems.push(`content-type "${type}", expected ${check.contentType}*`);
    }
    if (check.includes) {
      const body = await res.text();
      if (!body.includes(check.includes)) problems.push(`body is missing ${JSON.stringify(check.includes)}`);
    }
  } catch (err) {
    problems.push(`request failed: ${err.message}`);
  }

  if (problems.length) failures++;
  console.log(`${problems.length ? "FAIL" : "ok  "}  ${check.path}${problems.length ? "  - " + problems.join("; ") : ""}`);
}

console.log(`\n${checks.length - failures}/${checks.length} checks passed against ${BASE_URL}`);
process.exit(failures ? 1 : 0);
