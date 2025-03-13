import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0x954413e57cd2C9B6AEaCce6ED112BcdC338f1262';
  const Contract = await ethers.getContractAt(
    'FundraisingContract',
    contractAddress
  );

  // Кампанит ажил үүсгэх
  const tx = await Contract.createCampaign(
    'Test Title',
    'Test Description',
    1000,
    'https://example.com/test.png',
    'QmSomeMetadataHash'
  );
  await tx.wait();

  console.log('New campaign created!');

  // Кампанит ажлыг шалгах
  const campaign = await Contract.getCampaign(1);
  console.log('Campaign #1 =>', campaign);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
