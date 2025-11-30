import React from "react";
import VoteForm from "./components/VoteForm";
import { ethers } from "ethers";

function App() {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  // Connect to MetaMask provider
  const provider = new ethers.BrowserProvider(window.ethereum as any);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Encrypted Poll DApp</h1>
      <VoteForm contractAddress={contractAddress} provider={provider} />
    </div>
  );
}

export default App;