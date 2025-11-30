import { expect } from "chai";
import { ethers } from "hardhat";

describe("EncryptedPoll Unit Tests", function () {
  it("deploys the contract and enforces voting rules", async function () {
    const [admin, voter1, voter2] = await ethers.getSigners();

    // Set a short deadline for testing
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 10; // 10 seconds
    const Poll = await ethers.getContractFactory("EncryptedPoll");
    const poll = await Poll.deploy(deadline);
    await poll.deployed();

    // Check admin is set correctly
    expect(await poll.admin()).to.equal(admin.address);

    // Voter1 casts a vote
    const dummyVote = "0x01";
    await expect(poll.connect(voter1).castVote(dummyVote)).to.not.be.reverted;

    // Prevent double voting
    await expect(poll.connect(voter1).castVote(dummyVote)).to.be.revertedWith("already voted");

    // Voter2 casts a vote
    await expect(poll.connect(voter2).castVote(dummyVote)).to.not.be.reverted;

    // Wait until after deadline
    await ethers.provider.send("evm_increaseTime", [20]);
    await ethers.provider.send("evm_mine", []);

    // Reveal should succeed
    await expect(poll.connect(admin).reveal()).to.not.be.reverted;

    // Reveal again should fail
    await expect(poll.connect(admin).reveal()).to.be.revertedWith("already revealed");
  });
});