import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_USER = "admin";
export const ADMIN_PASSWORD = "NorthHunter123";

const COOKIE = "nh_admin";
const SECRET = "north-hunter-dashboard";

function sessionToken() {
  return createHmac("sha256", SECRET).update(ADMIN_USER).digest("hex");
}

export function credentialsMatch(username: string, password: string) {
  return username.trim() === ADMIN_USER && password === ADMIN_PASSWORD;
}

export async function isSignedIn() {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value ?? "";
  const expected = sessionToken();
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function signIn() {
  const jar = await cookies();
  jar.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function denyUnlessSignedIn() {
  if (await isSignedIn()) return null;
  return Response.json({ error: "login" }, { status: 401 });
}
