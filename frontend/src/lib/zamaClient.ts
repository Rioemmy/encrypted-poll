import { ethers } from "ethers";

// Zama FHE client mock / interface
export class ZamaClient {
  contract: ethers.Contract;

  constructor(contractAddress: string, provider: ethers.providers.Web3Provider) {
    const abi = [
      "function castVote(bytes calldata encryptedChoiceHandle) external",
      "function getEncryptedVoteHandle(address voter) external view returns (bytes memory)",
      "function reveal() external"
    ];
    this.contract = new ethers.Contract(contractAddress, abi, provider.getSigner());
  }

  // Encrypt vote (mock for now, replace with Zama TFHE)
  async encryptVote(choice: number): Promise<Uint8Array> {
    return new Uint8Array([choice]);
  }

  // Submit encrypted vote
  async submitVote(choice: number) {
    const encrypted = await this.encryptVote(choice);
    const tx = await this.contract.castVote(encrypted);
    await tx.wait();
    return tx;
  }

  // Retrieve encrypted vote
  async getVote(address: string) {
    return await this.contract.getEncryptedVoteHandle(address);
  }

  // Reveal final tally
  async reveal() {
    const tx = await this.contract.reveal();
    await tx.wait();
    return tx;
  }
}