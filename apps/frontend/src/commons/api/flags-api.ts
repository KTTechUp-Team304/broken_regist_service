export interface FlagItem {
  id: number;
  name: string;
  category: string;
  description: string;
  hint: string;
  points: number;
  difficulty: number;
  flagValue?: string; // 획득한 flag만 포함, 미획득은 undefined
  captured: boolean;
  capturedAt?: string | null;
}

export interface SubmitFlagResult {
  success: boolean;
  message: string;
  points?: number;
  flagName?: string;
}

export async function fetchFlags(): Promise<FlagItem[]> {
  const res = await fetch('/api/flags');
  if (!res.ok) throw new Error('Failed to fetch flags');
  return res.json();
}

export async function submitFlag(flag: string): Promise<SubmitFlagResult> {
  const res = await fetch('/api/flags/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flag }),
  });
  if (!res.ok) throw new Error('Failed to submit flag');
  return res.json();
}
