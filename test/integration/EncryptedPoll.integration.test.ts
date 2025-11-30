import { expect } from "chai";
import { ethers } from "hardhat";
import { fhevmSetup, createExternalUint8, decryptCiphertext } from "fhevm-mocks";

describe("EncryptedPoll Integration Tests", function () {
  before(async function () {
    // Initialize FHEVM environment
    await fhevmSetup();
  });

  it("accepts encrypted votes and emits correct tally", async function () {
    const [admin, voter1, voter2] = await ethers.getSigners();

    // Deploy poll
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 60; // 1 minute
    const Poll = await ethers.getContractFactory("EncryptedPoll");
    const poll = await Poll.deploy(deadline);
    await poll.deployed();

    // Create encrypted votes (0 or 1)
    const encVote1 = await createExternalUint8(1);
    const encVote2 = await createExternalUint8(0);

    // Submit votes
    await expect(poll.connect(voter1).castVote(encVote1)).to.not.be.reverted;
    await expect(poll.connect(voter2).castVote(encVote2)).to.not.be.reverted;

    // Fast-forward time to after deadline
    await ethers.provider.send("evm_increaseTime", [70]);
    await ethers.provider.send("evm_mine", []);

    // Reveal tallies
    const tx = await poll.connect(admin).reveal();
    const rc = await tx.wait();
    const revealEvent = rc.events?.find(e => e.event === "Revealed");

    const tally0Cipher = revealEvent?.args?.tally0Ciphertext;
    const tally1Cipher = revealEvent?.args?.tally1Ciphertext;

    // Off-chain decryption (mocked)
    const tally0 = await decryptCiphertext(tally0Cipher);
    const tally1 = await decryptCiphertext(tally1Cipher);

    // Verify expected tally counts
    expect(tally0).to.equal(1); // voter2 chose 0
    expect(tally1).to.equal(1); // voter1 chose 1
  });
});