// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FundraisingContract
 * @dev Кампанит ажил үүсгэх, түүнд хандив авах логик
 */
contract FundraisingContract {
    struct Campaign {
        uint id;
        address owner;
        string title;
        string primaryCategory; // "Хандив", "Хөрөнгө оруулалт", эсвэл бусад
        string description;
        uint goal; // wei
        uint raised; // wei
        bool isActive;
        string imageUrl;
        string metadataHash; // IPFS CID
        uint deadline; // timestamp
    }

    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;

    // (campaignId -> (donor -> totalDonatedWei))
    mapping(uint => mapping(address => uint)) public donations;

    // Events
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

    /**
     * @notice Кампанит ажил үүсгэх
     */
    function createCampaign(
        string memory _title,
        string memory _primaryCategory,
        string memory _description,
        uint _goal,
        string memory _imageUrl,
        string memory _metadataHash,
        uint _deadline
    ) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_goal > 0, "Goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        // ... бусад шаардлагатай шалгалтууд

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            owner: msg.sender,
            title: _title,
            primaryCategory: _primaryCategory,
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

    /**
     * @notice Кампанит ажлын мэдээллийг шинэчлэх
     */
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

    /**
     * @notice Кампанит ажлыг хаах (owner эсвэл deadline өнгөрсөн үед)
     */
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

    /**
     * @notice donate хийх
     */
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

    /**
     * @notice Кампанит ажлаас мөнгө татах
     */
    function withdraw(uint _campaignId, uint _amount) public {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.owner, "Only owner can withdraw");
        require(_amount <= c.raised, "Not enough funds");

        c.raised -= _amount;
        payable(c.owner).transfer(_amount);

        emit Withdrawn(_campaignId, msg.sender, _amount);
    }

    /**
     * @notice Нэг кампанит ажлын мэдээллийг авах
     */
    function getCampaign(
        uint _campaignId
    )
        public
        view
        returns (
            uint,
            address,
            string memory, // title
            string memory, // primaryCategory
            string memory, // description
            uint, // goal
            uint, // raised
            bool, // isActive
            string memory, // imageUrl
            string memory, // metadataHash
            uint // deadline
        )
    {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign memory c = campaigns[_campaignId];
        return (
            c.id,
            c.owner,
            c.title,
            c.primaryCategory,
            c.description,
            c.goal,
            c.raised,
            c.isActive,
            c.imageUrl,
            c.metadataHash,
            c.deadline
        );
    }

    /**
     * @notice Бүх кампанит ажлуудыг авах
     */
    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint i = 1; i <= campaignCount; i++) {
            all[i - 1] = campaigns[i];
        }
        return all;
    }
}
