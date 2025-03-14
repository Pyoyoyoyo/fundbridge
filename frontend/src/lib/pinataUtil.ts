// lib/pinataUtil.ts

import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || '';

// Pinata-ийн file upload endpoint
const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

// Файл (Buffer)-ийг Pinata руу илгээгээд, { IpfsHash: ... } үр дүн буцаадаг функц
export async function pinFileToPinata(fileBuffer: Buffer, fileName: string) {
  try {
    const formData = new FormData();
    // fileBuffer болон fileName‐ийг multipart/form-data хэлбэрээр append
    formData.append('file', new Blob([fileBuffer]), fileName);

    const metadata = JSON.stringify({
      name: fileName,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const res = await axios.post(PINATA_PIN_FILE_URL, formData, {
      maxBodyLength: Infinity, // том файл дамжуулж болдог
      headers: {
        'Content-Type': `multipart/form-data; boundary=${
          (formData as any)._boundary
        }`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    // Pinata‐ийн амжилттай хариу: { IpfsHash, PinSize, Timestamp, ... }
    return res.data;
  } catch (error) {
    console.error('pinFileToPinata error:', error);
    throw error;
  }
}
