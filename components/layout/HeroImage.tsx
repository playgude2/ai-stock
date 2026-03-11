import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeroImageProps {
  src: string;
  alt: string;
  overlay?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function HeroImage({
  src,
  alt,
  overlay = true,
  children,
  className,
}: HeroImageProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      )}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}
