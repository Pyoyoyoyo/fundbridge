// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Энэхүү middleware нь /campaigns/create болон /marketplace/* замууд руу хандах үед
 * хэрэглэгчийн cookie эсвэл session-д DAN системийн token (жишээ нь, "danToken") байгаа эсэхийг шалгана.
 * Хэрэв токен олдохгүй бол хэрэглэгчийг DAN системийн нэвтрэлтийн хуудас руу шилжүүлнэ.
 */
export function middleware(request: NextRequest) {
  // Хэрэглэгчийн DAN системийн token-ийг cookie-аас уншина (энэ token-ийг нэвтрэлтэнд амжилттай орсны дараа DAN систем таны
  // апп-д хадгалах юм)
  const danToken = request.cookies.get('danToken')?.value;

  // Хэрэв токен байхгүй бол хэрэглэгчийг DAN систем рүү шилжүүлнэ.
  if (!danToken) {
    const url = request.nextUrl.clone();
    // Энэхүү хаяг нь DAN системийн нэвтрэлтийн хуудас руу шилжүүлэх URL байна.
    // Үүнд танай DAN системийн нэвтрэлтээс өгсөн URL-ийг ашиглах эсвэл өөр тохиргоог хийх боломжтой.
    url.href =
      'https://dan.example.com/login?redirect=' +
      encodeURIComponent(request.nextUrl.href);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Энэхүү middleware нь зөвхөн тодорхой замууд дээр ажиллах болно.
export const config = {
  matcher: ['/campaigns/create', '/marketplace/create*'],
};
