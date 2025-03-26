// deployTrustScore.ts
import { ethers } from 'hardhat';

async function main() {
  // 1) TrustScore гэрээний factory
  const TrustScoreFactory = await ethers.getContractFactory('UserTrustScore');

  // 2) Deploy хийхдээ FundraisingContract-ийн хаягийг constructor-д дамжуулна
  const FUNDRAISING_CONTRACT_ADDRESS =
    '0x833a49B99acA780e601D5D249509dc681Af4a510'; // таны Fundraising гэрээ
  const trustScore = await TrustScoreFactory.deploy(
    FUNDRAISING_CONTRACT_ADDRESS
  );

  await trustScore.waitForDeployment();

  const deployedAddress = await trustScore.getAddress();
  console.log('UserTrustScore deployed at:', deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
