// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockKYC {
    // userAddress -> bool
    mapping(address => bool) public isKycApproved;

    // kycId -> address (1:1 mapping)
    mapping(string => address) public kycIdToAddress;

    // Admin address (зөвхөн энэ хүн approveKYC дуудаж болно гэж үзье)
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin can call this");
        _;
    }

    /**
     * @notice Нэг л KYC ID‐г нэг л address‐т холбож, approve хийнэ
     */
    function approveKYC(
        address _user,
        string memory _kycId
    ) external onlyOwner {
        // 1) Хэрэв энэ kycId өмнө нь өөр address‐т холбоотой бол хориглоно
        require(
            kycIdToAddress[_kycId] == address(0),
            "This KYC ID is already used by another address!"
        );
        // 2) _user өөр KYC ID‐д холбогдсон эсэхийг шалгахыг хүсвэл энд давхар шалгаж болно
        // 3) approve
        kycIdToAddress[_kycId] = _user;
        isKycApproved[_user] = true;
    }

    function isKycApprovedUser(address user) external view returns (bool) {
        return isKycApproved[user];
    }
}
