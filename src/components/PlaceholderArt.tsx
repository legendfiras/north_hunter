import type { ReactNode } from "react";
import type { PlaceholderKind } from "@/content/products";

type PlaceholderArtProps = {
  kind: PlaceholderKind;
  className?: string;
};

export function PlaceholderArt({ kind, className = "h-full w-full" }: PlaceholderArtProps) {
  return (
    <svg viewBox="0 0 400 520" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {plates[kind]}
    </svg>
  );
}

const plates: Record<PlaceholderKind, ReactNode> = {
  jacket: <JacketPlate />,
  outfit: <OutfitPlate />,
  fleece: <FleecePlate />,
  vest: <VestPlate />,
  flashlight: <FlashlightPlate />,
  chair: <ChairPlate />,
  optics: <OpticsPlate />,
  shotgun: <ShotgunPlate />,
  cartridge: <CartridgePlate />,
};

function Ground() {
  return (
    <>
      <rect width="400" height="520" fill="#1a2420" />
      <path d="M0 390c70-40 140-20 210-48 60-24 120-18 190 10v168H0Z" fill="#243128" />
      <path d="M0 430c90-28 160-8 250-30 50-12 100-6 150 16v104H0Z" fill="#141c16" />
    </>
  );
}

function CamoJacket({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M70 28c18-16 42-16 60 0l22 18 28-8 8 22-24 16v92l-16 78H52l-14-78V76L14 60l8-22 28 8Z" fill="#3c4630" />
      <path d="M92 36c10 18 28 22 46 8l18 14-8 18-22-6v24H86V70l-16 6-6-16Z" fill="#2a331f" />
      <path d="M78 120h54l8 28-18 10-8-16h-18l-8 16-16-8Z" fill="#6a6842" />
      <path d="M64 168h82l6 36H58Z" fill="#24301c" />
      <path d="M108 28v150" stroke="#c4a35a" strokeWidth="2" fill="none" />
      <circle cx="108" cy="78" r="3" fill="#c4a35a" />
      <circle cx="108" cy="108" r="3" fill="#c4a35a" />
    </g>
  );
}

function JacketPlate() {
  return (
    <>
      <Ground />
      <CamoJacket x={86} y={70} scale={1.15} />
    </>
  );
}

function OutfitPlate() {
  return (
    <>
      <Ground />
      <CamoJacket x={28} y={78} scale={0.92} />
      <g transform="translate(210 150)">
        <path d="M36 0h48l18 150H18Z" fill="#3c4630" />
        <path d="M28 40h64l8 36H22Z" fill="#6a6842" />
        <path d="M42 90h28l10 60H30Z" fill="#24301c" />
        <path d="M60 0v150" stroke="#c4a35a" strokeWidth="2" />
      </g>
    </>
  );
}

function FleecePlate() {
  return (
    <>
      <rect width="400" height="520" fill="#243028" />
      <path d="M0 400c80-50 180-20 400-60v180H0Z" fill="#1a2420" />
      <g transform="translate(100 70)">
        <path d="M40 20c16-18 64-18 80 0l24 26 18-10 10 24-22 18v80c0 40-16 70-30 96H62c-14-26-30-56-30-96V78L10 60l10-24 18 10Z" fill="#6d7344" />
        <path d="M78 28c8 22 28 30 48 14 6 16-2 28-16 32-20 6-40-4-48-18-6 10-20 12-28 4 2-16 16-24 24-32Z" fill="#3e4a30" />
        <path d="M70 150h60c6 28-4 60-14 84H84c-8-24-18-56-14-84Z" fill="#4e5834" />
        <path d="M100 48v170" stroke="#e7d7a4" strokeWidth="2" fill="none" />
      </g>
    </>
  );
}

function VestPlate() {
  return (
    <>
      <rect width="400" height="520" fill="#1c2820" />
      <path d="M0 420c100-30 200-10 400-40v140H0Z" fill="#141c16" />
      <g transform="translate(108 80)">
        <path d="M36 8c12-12 48-12 62 0l28 22v150l-18 70H28L10 180V30Z" fill="#5c6240" />
        <path d="M58 20c6 16 22 22 36 10v48c-14 8-30 4-36-8Z" fill="#1c2820" />
        <path d="M28 120h36v34H28Z" fill="#2c3420" />
        <path d="M78 120h36v34H78Z" fill="#2c3420" />
        <path d="M28 168h36v28H28Z" fill="#3e4630" />
        <path d="M78 168h36v28H78Z" fill="#3e4630" />
        <path d="M66 36v200" stroke="#c4a35a" strokeWidth="2" />
      </g>
    </>
  );
}

function FlashlightPlate() {
  return (
    <>
      <rect width="400" height="520" fill="#121816" />
      <path d="M250 40 400 200 400 40Z" fill="#c4a35a" opacity="0.18" />
      <path d="M230 70 400 210 400 90Z" fill="#d7c07a" opacity="0.12" />
      <g transform="translate(70 250) rotate(-28)">
        <rect x="0" y="0" width="168" height="42" rx="8" fill="#d7d2c6" />
        <rect x="150" y="-6" width="36" height="54" rx="6" fill="#c4a35a" />
        <rect x="18" y="10" width="70" height="22" rx="4" fill="#1c3328" />
        <circle cx="28" cy="21" r="4" fill="#c4a35a" />
      </g>
      <path d="M0 430c120-24 220-8 400-28v118H0Z" fill="#1c2820" />
    </>
  );
}

function ChairPlate() {
  return (
    <>
      <rect width="400" height="520" fill="#1a2820" />
      <path d="M0 360c80 20 140-10 220 8 70 16 120 4 180-16v168H0Z" fill="#243228" />
      <g transform="translate(90 110)" fill="none" stroke="#e7dcc4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 20h120l-16 150H56Z" />
        <path d="M56 170 30 250M144 170l26 80" />
        <path d="M48 210h104" />
        <path d="M70 40v70M130 40v70" />
        <path d="M40 20c20-28 90-28 120 0" />
      </g>
      <circle cx="300" cy="150" r="28" fill="#c4a35a" opacity="0.85" />
    </>
  );
}

function ShotgunPlate() {
  return (
    <>
      <Ground />
      <path d="M70 250h250l20-16h40" stroke="#c4a35a" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M86 250v36" stroke="#e7d7a4" strokeWidth="10" strokeLinecap="round" />
    </>
  );
}

function CartridgePlate() {
  return (
    <>
      <Ground />
      <rect x="145" y="150" width="110" height="150" rx="8" fill="#c4a35a" />
      <rect x="160" y="175" width="80" height="16" fill="#1a2420" />
      <rect x="160" y="210" width="80" height="16" fill="#1a2420" />
    </>
  );
}

function OpticsPlate() {
  return (
    <>
      <Ground />
      <circle cx="150" cy="220" r="58" fill="#101612" stroke="#c4a35a" strokeWidth="10" />
      <circle cx="250" cy="220" r="58" fill="#101612" stroke="#c4a35a" strokeWidth="10" />
      <rect x="192" y="206" width="16" height="28" rx="4" fill="#c4a35a" />
    </>
  );
}
