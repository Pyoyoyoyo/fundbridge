import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const user = await User.findOne({ email: 'bataa123@gmail.com' });
  console.log('📦 Олдсон хэрэглэгч:', user);
  console.log('Нууц үг:', user?.password);

  await mongoose.disconnect();
}

main();
