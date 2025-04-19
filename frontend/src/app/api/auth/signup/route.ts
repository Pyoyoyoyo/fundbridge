// app/api/auth/signup/route.ts
import { hash } from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
  } catch (err: any) {
    console.error('💥 MongoDB connect error:', err);
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const { email, password, name } = body;
  if (!email || !password || !name) {
    return NextResponse.json(
      { error: 'Бүх талбарыг бөглөнө үү' },
      { status: 400 }
    );
  }

  // check for existing user
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'И-мэйл бүртгэлтэй байна' },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error('💥 User lookup error', err);
    return NextResponse.json(
      { error: 'Failed to query user' },
      { status: 500 }
    );
  }

  // hash + create
  let newUser;
  try {
    const hashed = await hash(password, 12);
    newUser = await User.create({ email, name, password: hashed });
  } catch (err) {
    console.error('💥 User create error', err);
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }

  return NextResponse.json(
    {
      message: 'Амжилттай бүртгэгдлээ',
      user: { id: newUser._id, email, name },
    },
    { status: 201 }
  );
}
