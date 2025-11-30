import React, { useState } from "react";
import { ZamaClient } from "../lib/zamaClient";

interface VoteFormProps {
  contractAddress: string;
  provider: any;
}

const VoteForm: React.FC<VoteFormProps> = ({ contractAddress, provider }) => {
  const [choice, setChoice] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting vote...");
    try {
      const client = new ZamaClient(contractAddress, provider);
      await client.submitVote(choice);
      setStatus("Vote submitted successfully!");
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Cast Your Vote</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Choice:
          <select value={choice} onChange={(e) => setChoice(Number(e.target.value))}>
            <option value={0}>Option 0</option>
            <option value={1}>Option 1</option>
          </select>
        </label>
        <br />
        <button type="submit" style={{ marginTop: 10 }}>
          Submit Vote
        </button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default VoteForm;