// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditLog {
    event LogAdded(
        address indexed user,
        string action,
        string entityType,
        string entityId,
        string ipAddress,
        uint256 timestamp
    );

    struct Log {
        address user;
        string action;
        string entityType;
        string entityId;
        string ipAddress;
        uint256 timestamp;
    }

    Log[] public logs;

    function addLog(
        string memory action,
        string memory entityType,
        string memory entityId,
        string memory ipAddress
    ) public {
        logs.push(
            Log(
                msg.sender,
                action,
                entityType,
                entityId,
                ipAddress,
                block.timestamp
            )
        );
        emit LogAdded(
            msg.sender,
            action,
            entityType,
            entityId,
            ipAddress,
            block.timestamp
        );
    }

    function getLogs() public view returns (Log[] memory) {
        return logs;
    }

    function getLog(uint256 index) public view returns (Log memory) {
        require(index < logs.length, "Index out of bounds");
        return logs[index];
    }

    function getCount() public view returns (uint256) {
        return logs.length;
    }
}
