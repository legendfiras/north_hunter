import type { Metadata } from "next";
import Link from "next/link";
import { isSignedIn } from "@/lib/auth";
import { AdminHome } from "@/components/AdminHome";
import { Container } from "@/components/Container";
import { LoginForm } from "@/components/LoginForm";
import { Logo, logoAlt } from "@/components/Logo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const signedIn = await isSignedIn();

  return (
    <Container className="py-8 md:py-12">
      <Link href="/en" prefetch={false} aria-label={logoAlt} className="inline-flex">
        <Logo locale="en" showName={false} priority />
      </Link>
      {signedIn ? <AdminHome /> : <LoginForm />}
    </Container>
  );
}
