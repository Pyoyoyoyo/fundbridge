import { ethers } from 'hardhat';

async function main() {
  const MockKYCFactory = await ethers.getContractFactory('MockKYC');
  // Deploy
  const mockKYC = await MockKYCFactory.deploy();
  await mockKYC.waitForDeployment();

  const address = await mockKYC.getAddress();
  console.log('mockKYC deployed at:', address);

  // Жишээ нь ганц‐хоёр address‐ийг register хийж болох юм:
  // const tx = await mockKYC.mockRegister("0x1234...abcd");
  // await tx.wait();
  // console.log("mockRegister done!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
