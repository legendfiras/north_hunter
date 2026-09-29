import { credentialsMatch, signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  if (!credentialsMatch(body.username ?? "", body.password ?? "")) {
    return Response.json({ error: "login" }, { status: 401 });
  }
  await signIn();
  return Response.json({ ok: true });
}
