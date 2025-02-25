// scripts/test-get.ts
import { ethers } from 'hardhat';

async function main() {
  const Contract = await ethers.getContractAt(
    'FundraisingContract',
    '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  );
  const tx = await Contract.createCampaign('Test Title', 'Test Desc', 1000);
  await tx.wait();

  const all = await Contract.getAllCampaigns();
  console.log(all);
}

main().catch(console.error);
