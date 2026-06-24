async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export async function setupTwoFactor(): Promise<{
  secret: string;
  otpauthUri: string;
  qrCodeDataUrl: string;
}> {
  const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
  return parseOrThrow(res);
}

export async function confirmTwoFactor(code: string): Promise<{ backupCodes: string[] }> {
  const res = await fetch("/api/auth/2fa/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return parseOrThrow(res);
}

export async function disableTwoFactor(password: string): Promise<{ ok: boolean }> {
  const res = await fetch("/api/auth/2fa/disable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return parseOrThrow(res);
}
