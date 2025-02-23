import { ethers } from 'hardhat';

async function main() {
  const Contract = await ethers.getContractFactory('FundraisingContract');
  const fundraising = await Contract.deploy();
  await fundraising.waitForDeployment();

  console.log(
    'FundraisingContract deployed to:',
    await fundraising.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
