import { ethers } from 'hardhat';

async function main() {
  // 1) MarketplaceContract-ын factory авах
  const MarketplaceFactory = await ethers.getContractFactory(
    'MarketplaceContract'
  );

  // 2) Deploy хийх
  const fundraisingContractAddress =
    '0x82ec9513218A1fBB430d616AF91E5F8D7Fc0493b';
  const marketplace = await MarketplaceFactory.deploy(
    fundraisingContractAddress
  );

  // Ethers v6-д: deploy хийсний дараа transaction confirm-дож дуусахыг хүлээнэ
  await marketplace.waitForDeployment();

  const deployedAddress = await marketplace.getAddress();
  console.log('MarketplaceContract deployed at:', deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
