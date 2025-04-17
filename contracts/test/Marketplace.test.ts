// test/Marketplace.test.ts
import { expect } from 'chai';
import { ethers } from 'hardhat';
import type {
  MarketplaceContract,
  FundraisingContract,
  MarketplaceContract__factory,
  FundraisingContract__factory,
} from '../typechain-types';
import { ContractRunner, Signer } from 'ethers';

describe('MarketplaceContract', function () {
  let fundraising: FundraisingContract;
  let marketplace: MarketplaceContract;
  let owner: Signer, seller: Signer, buyer: Signer;
  const price = ethers.parseEther('0.1');

  beforeEach(async () => {
    [owner, seller, buyer] = await ethers.getSigners();

    const F = (await ethers.getContractFactory(
      'FundraisingContract'
    )) as FundraisingContract__factory;
    fundraising = await F.deploy();

    const block = await ethers.provider.getBlock('latest');
    const deadline = (block?.timestamp ?? 0) + 86400;
    await fundraising.createCampaign(
      'MC',
      'Хандив',
      'Desc',
      ethers.parseEther('1'),
      'img',
      'hash',
      deadline
    );

    const M = (await ethers.getContractFactory(
      'MarketplaceContract'
    )) as MarketplaceContract__factory;
    // v6 -> getAddress()
    const addr = await fundraising.getAddress();
    marketplace = await M.deploy(addr);
  });

  it('creates and fetches an item', async () => {
    await marketplace
      .connect(seller)
      .createItem('Reward', 'Desc', price, 'img', 1);
    const item = await marketplace.getItem(1);
    expect(item.id).to.equal(1);
    expect(item.seller).to.equal(await seller.getAddress());
    expect(item.price).to.equal(price);
    expect(item.isActive).to.be.true;
  });

  it('allows purchase and forwards funds', async () => {
    await marketplace
      .connect(seller)
      .createItem('Gift', 'Desc', price, 'img', 1);

    await expect(marketplace.connect(buyer).buyItem(1, { value: price }))
      .to.emit(marketplace, 'ItemBought')
      .withArgs(1, await buyer.getAddress(), price, 1);

    const camp = await fundraising.campaigns(1);
    expect(camp.raised).to.equal(price);
  });
});
