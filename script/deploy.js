async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("deploying with", deployer.address);
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + 60 * 60;
  const Poll = await ethers.getContractFactory("EncryptedPoll");
  const poll = await Poll.deploy(deadline);
  await poll.deployed();
  console.log("EncryptedPoll deployed to:", poll.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});