// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundraisingContract {
    struct Campaign {
        uint id;
        address owner;
        string title;
        string description;
        uint goal; // wei хэлбэрээр хадгална
        uint raised; // wei хэлбэрээр хадгална
        bool isActive;
        string imageUrl;
        string metadataHash; // e.g. IPFS CID
        uint deadline; // Хугацаа (timestamp)
    }

    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;

    // Донорын бүртгэл (campaignId -> donorAddress -> totalDonatedWei)
    mapping(uint => mapping(address => uint)) public donations;

    // Event-үүд
    event CampaignCreated(
        uint indexed campaignId,
        address indexed owner,
        uint goal,
        uint deadline
    );
    event CampaignUpdated(uint indexed campaignId);
    event CampaignClosed(uint indexed campaignId);
    event DonationReceived(
        uint indexed campaignId,
        address indexed donor,
        uint amount
    );
    event Withdrawn(
        uint indexed campaignId,
        address indexed owner,
        uint amount
    );

    constructor() {
        campaignCount = 0;
    }

    // createCampaign
    function createCampaign(
        string memory _title,
        string memory _description,
        uint _goal, // Wei
        string memory _imageUrl,
        string memory _metadataHash, // IPFS CID л дамжуулна
        uint _deadline // block.timestamp + 30 days гэх мэт
    ) public {
        // 1) Тодорхой require шалгуур
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_title).length <= 200, "Title too long (max 200 chars)");
        require(_goal > 0, "Goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_metadataHash).length > 0, "metadataHash required");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            owner: msg.sender,
            title: _title,
            description: _description,
            goal: _goal,
            raised: 0,
            isActive: true,
            imageUrl: _imageUrl,
            metadataHash: _metadataHash,
            deadline: _deadline
        });

        emit CampaignCreated(campaignCount, msg.sender, _goal, _deadline);
    }

    // updateCampaign
    function updateCampaign(
        uint _campaignId,
        string memory _newTitle,
        string memory _newDescription,
        string memory _newImageUrl,
        string memory _newMetadataHash
    ) public {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.owner, "Only owner can update");

        c.title = _newTitle;
        c.description = _newDescription;
        c.imageUrl = _newImageUrl;
        c.metadataHash = _newMetadataHash;

        emit CampaignUpdated(_campaignId);
    }

    // closeCampaign
    function closeCampaign(uint _campaignId) public {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive, "Already inactive");
        require(
            msg.sender == c.owner || block.timestamp > c.deadline,
            "Not allowed"
        );

        c.isActive = false;
        emit CampaignClosed(_campaignId);
    }

    // donate
    function donate(uint _campaignId) public payable {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive, "Campaign not active");
        require(block.timestamp <= c.deadline, "Campaign deadline passed");
        require(msg.value > 0, "Donation must be > 0");

        c.raised += msg.value;
        donations[_campaignId][msg.sender] += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    // withdraw
    function withdraw(uint _campaignId, uint _amount) public {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.owner, "Only owner can withdraw");
        require(_amount <= c.raised, "Not enough funds");

        c.raised -= _amount;
        payable(c.owner).transfer(_amount);

        emit Withdrawn(_campaignId, msg.sender, _amount);
    }

    // getCampaign
    function getCampaign(
        uint _campaignId
    )
        public
        view
        returns (
            uint,
            address,
            string memory,
            string memory,
            uint,
            uint,
            bool,
            string memory,
            string memory,
            uint
        )
    {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign memory c = campaigns[_campaignId];
        return (
            c.id,
            c.owner,
            c.title,
            c.description,
            c.goal,
            c.raised,
            c.isActive,
            c.imageUrl,
            c.metadataHash,
            c.deadline
        );
    }

    // getAllCampaigns
    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint i = 1; i <= campaignCount; i++) {
            all[i - 1] = campaigns[i];
        }
        return all;
    }
}
