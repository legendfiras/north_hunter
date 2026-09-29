import { signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await signOut();
  return Response.json({ ok: true });
}
