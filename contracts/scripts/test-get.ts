// scripts/test-get.ts
import { ethers } from 'hardhat';

async function main() {
  const Contract = await ethers.getContractAt(
    'FundraisingContract',
    '0x0CEF72adac9b1C279F5ec4b212D129D98e6CCE99'
  );
  const tx = await Contract.createCampaign(
    'Test Title',
    'Test Desc',
    1000,
    'https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg'
  );
  await tx.wait();

  const all = await Contract.getAllCampaigns();
  console.log(all);
}

main().catch(console.error);
