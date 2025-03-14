import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data'; // npm install form-data

// (Next.js 13 дээр Edge runtime биш Node runtime сонгоно)
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // 1) multipart/form-data унших
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2) File -> Buffer хөрвүүлэх
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3) Pinata-ийн нууц түлхүүрүүдээ env-с унших
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
    if (!PINATA_API_KEY || !PINATA_API_SECRET) {
      return NextResponse.json(
        { error: 'Missing Pinata credentials' },
        { status: 500 }
      );
    }

    // 4) Node-н FormData үүсгэж, "file" талбарт buffer-ээ хавсаргана
    const form = new FormData();
    form.append('file', buffer, file.name || 'upload.png');

    // 5) Pinata руу formData-гээ дамжуулна
    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      form,
      {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: {
          // formData-н header-үүдийг задлаж оруулна (boundary гэх мэт)
          ...form.getHeaders(),
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );

    // 6) Амжилттай upload болсон тохиолдолд Pinata-аас JSON хэлбэрийн хариу ирнэ
    //    { IpfsHash: 'Qm...', PinSize: 12345, Timestamp: '...' } гэх мэт
    const ipfsHash = pinataRes.data.IpfsHash;
    // Gateway link үүсгэх
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // 7) Клиентэд буцаах
    return NextResponse.json({ ipfsUrl }, { status: 200 });
  } catch (err: any) {
    console.error('pinataUploadImage error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
