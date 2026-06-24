export type AppSettings = {
  defaultCountryCode: string;
};

async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch("/api/settings");
  return parseOrThrow(res);
}

export async function updateSettings(input: AppSettings): Promise<AppSettings> {
  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}
