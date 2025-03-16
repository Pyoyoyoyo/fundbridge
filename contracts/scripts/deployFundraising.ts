import { ethers } from 'hardhat';

async function main() {
  // Анх "FundraisingContract" гэхэд олон artifact олдож зөрчилдсөн
  // Тиймээс fully qualified name ашиглана:
  const FundraisingFactory = await ethers.getContractFactory(
    'contracts/FundraisingContract.sol:FundraisingContract'
  );

  const fundraising = await FundraisingFactory.deploy();
  await fundraising.waitForDeployment();

  const address = await fundraising.getAddress();
  console.log('FundraisingContract deployed at:', address);

  // Хүсвэл энд createCampaign(...) дуудаж болно
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
