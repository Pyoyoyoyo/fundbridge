import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('FundraisingContract', function () {
  it('Should create a new campaign', async function () {
    const Contract = await ethers.getContractFactory('FundraisingContract');
    const fundraising = await Contract.deploy();
    await fundraising.waitForDeployment();

    await fundraising.createCampaign('Test Title', 'Test Desc', 1000);

    // getCampaign(1) нь tuple массив буцаана
    // [id, owner, title, description, goal, raised, isActive]
    const [id, owner, title, description, goal, raised, isActive] =
      await fundraising.getCampaign(1);

    expect(title).to.equal('Test Title');
    expect(description).to.equal('Test Desc');
    expect(goal).to.equal(1000n);
    // ethers v6-д BigInt хэлбэрээр ирдэг тул 1000 → 1000n гэж бичих
    expect(isActive).to.equal(true);
  });

  it('Should donate to a campaign', async function () {
    const Contract = await ethers.getContractFactory('FundraisingContract');
    const fundraising = await Contract.deploy();
    await fundraising.waitForDeployment();

    await fundraising.createCampaign('Test Title', 'Test Desc', 1000);

    // donate хийхдээ ethers.parseEther("1.0") ашиглах
    await fundraising.donate(1, {
      value: ethers.parseEther('1.0'),
    });

    // Tuple-ыг задлан авч, raised утгыг шалгана
    const [id, owner, title, description, goal, raised, isActive] =
      await fundraising.getCampaign(1);

    // raised нь BigInt хэлбэртэй тул parseEther("1.0") ч бас BigInt буцаана
    expect(raised).to.equal(ethers.parseEther('1.0'));
  });
});
