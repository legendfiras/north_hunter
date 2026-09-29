import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "nh_admin";

function sessionToken() {
  const user = process.env.ADMIN_USERNAME;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!user || !secret) return "";
  return createHmac("sha256", secret).update(user).digest("hex");
}

export function credentialsMatch(username: string, password: string) {
  const user = process.env.ADMIN_USERNAME;
  const expected = process.env.ADMIN_PASSWORD;
  if (!user || !expected || !process.env.ADMIN_SESSION_SECRET) return false;
  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  return username.trim() === user && left.length === right.length && timingSafeEqual(left, right);
}

export async function isSignedIn() {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value ?? "";
  const expected = sessionToken();
  if (!expected) return false;
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function signIn() {
  const jar = await cookies();
  jar.set(COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
