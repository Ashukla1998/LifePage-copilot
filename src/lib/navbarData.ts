import { API_BASE } from "@/lib/api";

export interface NavbarTopic {
  topic: string;
  thumbfile?: string;
}

export interface NavbarData {
  count: string;
  topics: NavbarTopic[];
}

// One request per page load, shared by the Navbar (career count) and the homepage (trending careers)
let pending: Promise<NavbarData> | null = null;

export function getNavbarData(): Promise<NavbarData> {
  pending ??= fetch(`${API_BASE}/navbar`)
    .then((res) => res.json())
    .then((json) => {
      if (json.success !== 1) throw new Error(json.message || "Navbar API failed");
      return { count: String(json.count ?? ""), topics: json.data ?? [] };
    })
    .catch((err) => {
      pending = null; // allow a retry on the next call
      throw err;
    });
  return pending;
}
