"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MWareXLogoProps {
  className?: string;
  showText?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  href?: string;
  // For cinematic intro — allows overriding rendered size in px
  width?: number;
  height?: number;
}

const SIZES = {
  xs: { w: 28,  h: 28  },
  sm: { w: 40,  h: 40  },
  md: { w: 52,  h: 52  },
  lg: { w: 80,  h: 80  },
  xl: { w: 120, h: 120 },
};

export function MWareXLogo({
  className,
  showText = false,
  size = "md",
  href,
  width,
  height,
}: MWareXLogoProps) {
  const dim = SIZES[size] ?? SIZES.md;
  const w = width  ?? dim.w;
  const h = height ?? dim.h;

  const logoContent = (
    <div className={cn("flex items-center gap-2 shrink-0", href && "cursor-pointer", className)}>
      <Image
        src="/mwarexlogo.png"
        alt="MWareX"
        width={w}
        height={h}
        priority
        className="object-contain"
        style={{ width: w, height: h }}
      />
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
