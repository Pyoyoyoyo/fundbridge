import { ethers } from 'hardhat';

async function main() {
  const FundraisingFactory = await ethers.getContractFactory(
    'FundraisingContract'
  );
  const fundraising = await FundraisingFactory.deploy();
  await fundraising.waitForDeployment();
  const fundraisingAddress = await fundraising.getAddress();
  console.log('FundraisingContract deployed at:', fundraisingAddress);

  // энд та FundraisingContract-тэй холбоотой тохиргоо хийж болно
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
