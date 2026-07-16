const API_BASE = "https://www.lifepage.in/n/api";

export async function getUserQuestions() {
  const response = await fetch(`${API_BASE}/getUserQuestions`);

  if (!response.ok) {
    throw new Error("Failed to fetch careers");
  }

  return response.json();
}

export async function getCareerByQuestion({
  question,
  percentage,
  exclude,
  names,
}: {
  question: string;
  percentage: number;
  exclude: number[];
  names: string[];
}) {
  const response = await fetch(`${API_BASE}/getCareerByQuestion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      percentage,
      exclude,
      names,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch next career");
  }

  return response.json();
}

export async function getRandomCareer({
  exclude,
  names,
}: {
  exclude: number[];
  names: string[];
}) {
  const response = await fetch(`${API_BASE}/randomCareer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      exclude,
      names,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch random careers");
  }

  return response.json();
}

export async function updateUserEvent(body: {
  userid: string;
  number_explore_click?: number;
  number_none_click?: number;
}) {
  await fetch(`${API_BASE}/update_user_event`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}