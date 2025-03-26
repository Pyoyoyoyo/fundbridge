// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWorldID {
    /**
     * @dev verifyProof(...) – World ID‐ийн гэрээний үндсэн функц
     * @param root - the Merkle root of the identity group
     * @param nullifierHash - nullifier for this proof, preventing double signaling
     * @param proof - zero-knowledge proof
     * @param externalNullifier - таны DApp буюу use-case‐ийн unique ID
     * @param signal - хэрэглэгчийн оруулсан signal (e.g. msg.sender эсвэл өөр утга)
     */
    function verifyProof(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        bytes32 externalNullifier,
        bytes32 signal
    ) external view;
}
