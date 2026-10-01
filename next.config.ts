import type { NextConfig } from "next";

const remotePatterns: URL[] = [];
if (process.env.R2_PUBLIC_BASE_URL) {
  const r2Base = new URL(process.env.R2_PUBLIC_BASE_URL);
  r2Base.pathname = `${r2Base.pathname.replace(/\/+$/, "")}/**`;
  r2Base.search = "";
  r2Base.hash = "";
  remotePatterns.push(r2Base);
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns,
  },
};

export default nextConfig;
