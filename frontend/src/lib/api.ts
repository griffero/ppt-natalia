export type Commitment = {
  id: string;
  initials: string;
  text: string;
  createdAt: string;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

function apiUrl(path: string) {
  if (API_BASE) return `${API_BASE}${path}`;
  return path;
}

export async function listCommitments(): Promise<Commitment[]> {
  const res = await fetch(apiUrl("/api/commitments"));
  if (!res.ok) throw new Error(`listCommitments failed: ${res.status}`);
  const data = (await res.json()) as { items: Commitment[] };
  return data.items;
}

export async function createCommitment(input: { initials: string; commitments: string }): Promise<Commitment> {
  const res = await fetch(apiUrl("/api/commitments"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`createCommitment failed: ${res.status}`);
  const data = (await res.json()) as { item: Commitment };
  return data.item;
}


