// test/Fundraising.test.ts
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import type {
  FundraisingContract,
  FundraisingContract__factory,
} from '../typechain-types';

describe('FundraisingContract', function () {
  let fundraising: FundraisingContract;
  let owner: any, donor1: any, donor2: any;
  const goal = ethers.parseEther('1');

  beforeEach(async () => {
    [owner, donor1, donor2] = await ethers.getSigners();
    const factory = (await ethers.getContractFactory(
      'FundraisingContract'
    )) as FundraisingContract__factory;
    fundraising = await factory.deploy();
  });

  it('creates a campaign and emits CampaignCreated', async () => {
    const block = await ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block found');
    const deadline = block.timestamp + 86400;

    await expect(
      fundraising.createCampaign(
        'Test Campaign',
        'Хандив',
        'A sample description',
        goal,
        'https://example.com/image.png',
        'QmTestHash',
        deadline
      )
    )
      .to.emit(fundraising, 'CampaignCreated')
      .withArgs(1, owner.address, goal, deadline);

    const campaign = await fundraising.getCampaign(1);
    const [id, ownerAddress, title, , , , , isActive] = campaign;
    expect(id).to.equal(1);
    expect(ownerAddress).to.equal(owner.address);
    expect(title).to.equal('Test Campaign');
    expect(isActive).to.be.true;
    expect(campaign[1]).to.equal(owner.address);
    expect(campaign[2]).to.equal('Test Campaign');
    expect(campaign[5]).to.equal(goal);
    expect(campaign[7]).to.be.true;
  });

  it('accepts donations and updates raised amount', async () => {
    const block = await ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block found');
    const deadline = block.timestamp + 86400;
    await fundraising.createCampaign(
      'Fund',
      'Хандив',
      'Desc',
      goal,
      'img',
      'hash',
      deadline
    );

    const amount = goal / BigInt(2);
    // Use overloaded signature for comment
    await expect(
      fundraising
        .connect(donor1)
        ['donate(uint256,string)'](1, 'Best wishes', { value: amount })
    )
      .to.emit(fundraising, 'DonationReceived')
      .withArgs(1, donor1.address, amount, 'Best wishes');

    const stored = await fundraising.campaigns(1);
    expect(stored.raised).to.equal(amount);
  });

  it('finalizes campaign when goal reached', async () => {
    const block = await ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block found');
    const deadline = block.timestamp + 86400;
    await fundraising.createCampaign(
      'Reach',
      'Хандив',
      'Desc',
      goal,
      'img',
      'hash',
      deadline
    );

    // Donate in two halves using overloaded signature without comment
    await fundraising
      .connect(donor1)
      ['donate(uint256)'](1, { value: goal / BigInt(2) });
    await fundraising
      .connect(donor2)
      ['donate(uint256)'](1, { value: goal / BigInt(2) });

    const updated = await fundraising.campaigns(1);
    expect(updated.wasGoalReached).to.be.true;

    await expect(fundraising.finalizeCampaign(1, 'finalHash'))
      .to.emit(fundraising, 'MetadataHashUpdated')
      .withArgs(1, 'finalHash');

    const closed = await fundraising.getCampaign(1);
    expect(closed[7]).to.be.false;
  });

  it('fails campaign after deadline without reaching goal', async () => {
    const block = await ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block found');
    const shortDeadline = block.timestamp + 5;
    await fundraising.createCampaign(
      'FailMe',
      'Хандив',
      'Desc',
      goal,
      'img',
      'hash',
      shortDeadline
    );

    await network.provider.send('evm_increaseTime', [10]);
    await network.provider.send('evm_mine');

    await expect(fundraising.failCampaign(1))
      .to.emit(fundraising, 'CampaignClosed')
      .withArgs(1, false);
  });

  it('allows owner to withdraw funds', async () => {
    const block = await ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block found');
    const deadline = block.timestamp + 86400;
    await fundraising.createCampaign(
      'Withdraw',
      'Хандив',
      'Desc',
      goal,
      'img',
      'hash',
      deadline
    );
    await (fundraising as any).donate(1, '', { value: goal });

    const before = await ethers.provider.getBalance(owner.address);
    const tx = await fundraising.withdraw(1, goal / BigInt(2));
    const receipt = await tx.wait();
    if (!receipt) throw new Error('Transaction receipt is null');
    const gasCost = receipt.gasUsed * BigInt(tx.gasPrice || 0);
    const after = await ethers.provider.getBalance(owner.address);

    expect(after + gasCost).to.equal(before + goal / BigInt(2));
  });
});
