'use client';

import * as React from 'react';

export default function Logo({
  size = 32,
  color = 'currentColor',
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number; color?: string }) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox='0 0 64 64'
      fill='none'
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      {/* 
        A stylized "bridge" with a letter "F" suggestion 
        and "B" arch. This is just an example.
      */}
      {/* Horizontal line / "bridge deck" */}
      <path d='M8 32h48' />
      {/* Left vertical post */}
      <path d='M16 32v-16' />
      {/* Right vertical post */}
      <path d='M48 32v-16' />
      {/* Arch / partial circle referencing bridging or letter B */}
      <path d='M16 16c6-8 26-8 32 0' />
      {/* A small stroke that can hint the letter F on the left post */}
      <path d='M16 24h10' />
      {/* Add a small circle to represent a node or something symbolic */}
      <circle cx='32' cy='32' r='2' fill={color} />
    </svg>
  );
}
