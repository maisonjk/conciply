import { NextRequest, NextResponse } from "next/server";

// Called by the client after a free report completes successfully.
// Sets an HttpOnly monthly cookie so the server can enforce the 1/month cap.
export async function POST(req: NextRequest) {
  const now = new Date();
  const monthStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const cookieName = `free_used_${monthStr}`;

  const existing = parseInt(req.cookies.get(cookieName)?.value ?? "0", 10);
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, String(existing + 1), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: nextMonthStart,
  });
  return res;
}
