'use client';

import * as React from 'react';

/**
 * FundBridge лого - сайжруулсан concept
 * -------------------------------------
 * - “F” болон “B” санааг гүүрийн нум, босоо шон, хэвтээ шугамуудтай хослуулсан.
 * - Илүү “уран” харагдуулахын тулд зарим муруй шугам, жижиг чимэглэл, градиент ашиглав.
 * - strokeWidth, fill, болон gradient-ийг та өөрийн хүссэнээр өөрчилж болно.
 */
export default function LogoWhite({
  size = 64,
  primaryColor = '#276EF1', // Гол өнгө (жишээ нь FundBridge-ийн цэнхэр)
  secondaryColor = '#1E88E5', // Градиентын хоёр дахь өнгө
  strokeColor = '#ffffff', // Шугамын өнгө
  strokeWidth = 2,
  ...props
}: {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
} & React.SVGProps<SVGSVGElement>) {
  const gradientId = 'fundbridgeLogoGradient';

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox='0 0 64 64'
      fill='none'
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      {/* 
        Градиент тодорхойлолт: 
        primaryColor ба secondaryColor хоёрын хооронд зөөлөн шилжилт үүсгэнэ.
      */}
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor={primaryColor} />
          <stop offset='100%' stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      {/*
        1) Зүүн талын шон - “F” санаа
           - Босоо шугам + хэвтээ зураас => “F”‐ийн хэв маяг
      */}
      <path d='M16 48V16' stroke={`url(#${gradientId})`} />
      <path d='M16 24h12' stroke={`url(#${gradientId})`} />

      {/*
        2) Гүүрийн тавцан
           - Голдоо байрлах шулуун
      */}
      <path d='M8 32h48' stroke={strokeColor} />

      {/*
        3) Баруун талд “B” үсгийг санагдуулах муруй (гүүрний нум)
           - “B”‐ийн гаднах нум маягийн шугам
      */}
      <path
        d='M28 16c10 2 20 6 20 16s-10 14-20 16'
        stroke={`url(#${gradientId})`}
      />

      {/*
        4) Төв хэсгийн дугуй (бэхэлгээ, илэрхийлэл)
           - Fill‐ийг градиент ашиглаж илүү өнгөлөг болгож болно.
      */}
      <circle
        cx='32'
        cy='32'
        r='3.5'
        fill={`url(#${gradientId})`}
        stroke='none'
      />

      {/*
        5) Дагалдах жижиг муруй шугамууд - “уран” чимэглэл
           - Зүүн доод, баруун дээд гэх мэт жижиг штрих
      */}
      <path
        d='M16 48c-2 1-4 2-6 2'
        stroke={strokeColor}
        strokeWidth={strokeWidth - 1}
      />
      <path
        d='M48 16c2-1 4-2 6-2'
        stroke={strokeColor}
        strokeWidth={strokeWidth - 1}
      />

      {/*
        6) Баруун талд “F”‐ийн дотор талд байрлуулж болох жижиг “crossbar” 
           - Логоны “F”‐ийг илүү тодотгох. 
      */}
      <path d='M16 28h8' stroke={`url(#${gradientId})`} />

      {/*
        7) Доод талд жижиг нум
           - “B”‐ийн доод хэсгийг илэрхийлэх / нэмэлт чимэглэл
      */}
      <path
        d='M30 48c-4 0-8-1-10-3'
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth - 1}
      />
    </svg>
  );
}
