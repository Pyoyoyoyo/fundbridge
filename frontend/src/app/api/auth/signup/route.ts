import { hash } from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password, name } = await req.json();

  console.log('📥 Бүртгүүлэх хүсэлт ирлээ');
  console.log('➡️ Хүлээж авсан email:', email);
  console.log('➡️ Хүлээж авсан password:', password);

  if (!email || !password || !name) {
    return new Response(JSON.stringify({ error: 'Бүх талбарыг бөглөнө үү' }), {
      status: 400,
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify({ error: 'И-мэйл бүртгэлтэй байна' }), {
      status: 409,
    });
  }

  const hashedPassword = await hash(password, 12);
  console.log('🔐 hashedPassword:', hashedPassword);

  const user = await User.create({ email, name, password: hashedPassword });
  console.log('✅ Хэрэглэгч хадгалагдлаа:', user);

  return new Response(
    JSON.stringify({ message: 'Амжилттай бүртгэгдлээ', user }),
    { status: 201 }
  );
}
