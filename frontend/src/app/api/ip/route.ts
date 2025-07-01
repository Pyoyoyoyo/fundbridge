import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'localhost';

  return Response.json({ ip });
}
