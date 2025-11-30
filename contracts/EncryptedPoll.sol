// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EncryptedPoll {
    // Admin address
    address public admin;

    // Voting deadline (timestamp)
    uint256 public deadline;

    // Flag to indicate if the final tally has been revealed
    bool public revealed;

    // Encrypted tallies for option 0 and 1
    bytes public tally0;
    bytes public tally1;

    // Mapping of voter address => encrypted vote handle
    mapping(address => bytes) public encryptedVoteHandle;

    // Mapping to prevent double voting
    mapping(address => bool) public hasVoted;

    // Events
    event VoteCast(address indexed voter);
    event Revealed(bytes tally0Ciphertext, bytes tally1Ciphertext);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    modifier beforeDeadline() {
        require(block.timestamp < deadline, "voting closed");
        _;
    }

    modifier afterDeadline() {
        require(block.timestamp >= deadline, "voting still open");
        _;
    }

    // Constructor sets admin and deadline
    constructor(uint256 _deadline) {
        require(_deadline > block.timestamp, "deadline must be in future");
        admin = msg.sender;
        deadline = _deadline;
        revealed = false;
        tally0 = hex"";
        tally1 = hex"";
    }

    // Cast an encrypted vote
    function castVote(bytes calldata encryptedChoiceHandle) external beforeDeadline {
        require(!hasVoted[msg.sender], "already voted");
        encryptedVoteHandle[msg.sender] = encryptedChoiceHandle;
        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender);
    }

    // Reveal final tally (only after deadline)
    function reveal() external afterDeadline {
        require(!revealed, "already revealed");
        revealed = true;
        // In a real FHE setup, tally0 and tally1 would contain the combined homomorphic ciphertext
        emit Revealed(tally0, tally1);
    }

    // Admin can extend the deadline
    function extendDeadline(uint256 newDeadline) external onlyAdmin {
        require(newDeadline > deadline, "must extend");
        deadline = newDeadline;
    }

    // Retrieve a voter's encrypted vote
    function getEncryptedVoteHandle(address voter) external view returns (bytes memory) {
        return encryptedVoteHandle[voter];
    }
}