// /services/pinata.ts
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!
);

// 1) JSON pin хийх
export async function pinJsonToIPFS(jsonData: any) {
  try {
    // pinJSONToIPFS(jsonData, options) → { IpfsHash, PinSize, Timestamp }
    const result = await pinata.pinJSONToIPFS(jsonData);
    console.log('Pinata result:', result);
    return result.IpfsHash; // CID
  } catch (err) {
    console.error('Pinata error:', err);
    throw err;
  }
}

// 2) Файл pin хийх (жишээ нь image)
import fs from 'fs';
import path from 'path';

export async function pinFileToIPFS(filePath: string) {
  try {
    const readableStreamForFile = fs.createReadStream(filePath);
    // pinFileToIPFS(stream, options) → { IpfsHash, PinSize, Timestamp }
    const result = await pinata.pinFileToIPFS(readableStreamForFile);
    return result.IpfsHash;
  } catch (err) {
    console.error('Pinata file error:', err);
    throw err;
  }
}
