// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Жишээ: WorldID эсвэл KYC гэрээний интерфэйс
import "./IWorldID.sol";

/**
 * @title FundraisingContract
 * @dev Кампанит ажил үүсгэх, түүнд хандив авах, метадата шинэчлэх зэрэг логик.
 */

interface IKYC {
    function isKycApprovedUser(address user) external view returns (bool);
}

contract FundraisingContract {
    // ----------------------------------------------------
    // 1) Data Structures
    // ----------------------------------------------------
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
        bool wasGoalReached; // Шинээр нэмсэн талбар
    }

    // Хандивын мэдээлэл (коммент, дүн)
    struct Donation {
        address donor;
        uint amount; // wei
        string comment;
    }

    // ----------------------------------------------------
    // 2) State Variables
    // ----------------------------------------------------
    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;

    // (campaignId -> Donation[])
    mapping(uint => Donation[]) public donationsHistory;

    // (campaignId -> (donor -> totalDonatedWei)) — хүсвэл үлдээж болно
    mapping(uint => mapping(address => uint)) public donations;

    // userAddress -> activeCampaignId (0 бол идэвхтэй кампанит ажил байхгүй)
    mapping(address => uint) public userActiveCampaign;

    // World ID (эсвэл KYC) гэрээний хаяг - одоогоор ашиглахгүй, жишээ
    address public kycContract;

    // ----------------------------------------------------
    // 3) Events
    // ----------------------------------------------------
    event CampaignCreated(
        uint indexed campaignId,
        address indexed owner,
        uint goal,
        uint deadline
    );
    event CampaignUpdated(uint indexed campaignId);
    event CampaignClosed(uint indexed campaignId, bool success);
    event DonationReceived(
        uint indexed campaignId,
        address indexed donor,
        uint amount,
        string comment
    );
    event Withdrawn(
        uint indexed campaignId,
        address indexed owner,
        uint amount
    );
    // Метадата шинэчлэгдсэнийг зарлах эвент
    event MetadataHashUpdated(uint256 indexed campaignId, string newHash);

    // ----------------------------------------------------
    // 4) Constructor
    // ----------------------------------------------------
    constructor() /* address _kycContract */
    {
        // kycContract = _kycContract;
    }

    // Хэрэв KYC шалгахыг хүсвэл энэ мэтээр ашиглаж болно:
    // modifier onlyKycApproved() {
    //     require(
    //         IKYC(kycContract).isKycApprovedUser(msg.sender),
    //         "User not KYC-approved!"
    //     );
    //     _;
    // }

    // ----------------------------------------------------
    // 5) createCampaign
    // ----------------------------------------------------
    /**
     * @notice Кампанит ажил үүсгэх
     * @param _title       Төслийн нэр
     * @param _primaryCategory  Ангилал (Жишээ: "Хандив")
     * @param _description Төслийн тайлбар
     * @param _goal        Зорилтот дүн (wei)
     * @param _imageUrl    Зургийн линк
     * @param _metadataHash IPFS CID
     * @param _deadline    Дуусах хугацаа (timestamp)
     */
    function createCampaign(
        string memory _title,
        string memory _primaryCategory,
        string memory _description,
        uint _goal,
        string memory _imageUrl,
        string memory _metadataHash,
        uint _deadline
    ) external {
        // require(userActiveCampaign[msg.sender] == 0, "You already have an active campaign!");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_goal > 0, "Goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

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
            deadline: _deadline,
            wasGoalReached: false // анх false
        });

        // Энэ хэрэглэгчид энэ campaignId‐г идэвхтэй гэж тэмдэглэнэ
        userActiveCampaign[msg.sender] = campaignCount;

        emit CampaignCreated(campaignCount, msg.sender, _goal, _deadline);
    }

    // ----------------------------------------------------
    // updateCampaign
    // ----------------------------------------------------
    /**
     * @notice Кампанит ажлын үндсэн мэдээллийг шинэчлэх
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
        require(c.isActive, "Campaign not active");

        c.title = _newTitle;
        c.description = _newDescription;
        c.imageUrl = _newImageUrl;
        c.metadataHash = _newMetadataHash;

        emit CampaignUpdated(_campaignId);
    }

    // ----------------------------------------------------
    // closeCampaign
    // ----------------------------------------------------
    /**
     * @notice Кампанит ажлыг хаах (owner эсвэл deadline өнгөрсөн үед)
     */
    function closeCampaign(uint _campaignId) external {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive, "Campaign already inactive");
        require(
            msg.sender == c.owner || block.timestamp > c.deadline,
            "Not allowed"
        );

        c.isActive = false;
        userActiveCampaign[msg.sender] = 0;
        emit CampaignClosed(_campaignId, false);
    }

    // ----------------------------------------------------
    // donate(uint _campaignId, string memory _comment)
    // ----------------------------------------------------
    /**
     * @notice Хандив өгөх (comment-той), мөн raised нэмэгдүүлнэ.
     * @dev msg.value = хандивын дүн (wei)
     */
    function donate(uint _campaignId, string memory _comment) public payable {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive, "Campaign not active");
        require(block.timestamp <= c.deadline, "Deadline passed");
        require(msg.value > 0, "Donation must be > 0");

        c.raised += msg.value;
        donations[_campaignId][msg.sender] += msg.value;

        // Зорилгодоо хүрсэн эсэхийг шалгах
        if (!c.wasGoalReached && c.raised >= c.goal) {
            c.wasGoalReached = true;
        }

        donationsHistory[_campaignId].push(
            Donation({donor: msg.sender, amount: msg.value, comment: _comment})
        );

        emit DonationReceived(_campaignId, msg.sender, msg.value, _comment);
    }

    // ----------------------------------------------------
    // donate(uint _campaignId) payable - Нэмэлт wrapper
    // ----------------------------------------------------
    /**
     * @notice Зөвхөн 1 параметртэй donate функц.
     *  Marketplace-аас "donate(uint256)" дуудлагыг шууд хүлээн авахад хэрэглэнэ.
     *  (comment-ыг хоосон string-ээр орлуулж үндсэн donate функц руу чиглүүлнэ.)
     */
    function donate(uint _campaignId) external payable {
        donate(_campaignId, "");
    }

    // ----------------------------------------------------
    // finalizeCampaign (амжилттай хаах)
    // ----------------------------------------------------
    function finalizeCampaign(
        uint _campaignId,
        string memory _finalCid
    ) external {
        Campaign storage c = campaigns[_campaignId];
        require(c.wasGoalReached, "Goal not reached");
        require(msg.sender == c.owner, "Not owner!");
        require(c.isActive, "Already closed");

        // Өмнө нь зорилгодоо хүрсэн үү?
        require(c.wasGoalReached, "Goal not reached => cannot finalize yet");

        // Тайланг metadataHash-д шинэчлэнэ
        c.metadataHash = _finalCid;
        emit MetadataHashUpdated(_campaignId, _finalCid);

        // Хаах
        c.isActive = false;
        userActiveCampaign[msg.sender] = 0;

        // Амжилттай хаалаа
        emit CampaignClosed(_campaignId, true);
    }

    // ----------------------------------------------------
    // failCampaign (амжилтгүй хаах)
    // ----------------------------------------------------
    /**
     * @notice Хугацаа дууссан ч зорилгодоо хүрээгүй бол (raised < goal) амжилтгүй хаана
     */
    function failCampaign(uint _campaignId) external {
        Campaign storage c = campaigns[_campaignId];
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        require(c.isActive, "Already closed");
        require(block.timestamp > c.deadline, "Deadline not yet passed");
        require(c.raised < c.goal, "Goal reached or exceeded => not fail");

        c.isActive = false;
        userActiveCampaign[c.owner] = 0;

        // Амжилтгүй хаалаа
        emit CampaignClosed(_campaignId, false);
    }

    // ----------------------------------------------------
    // withdraw (хөрөнгийг нь татах — гэхдээ хаахгүй)
    // ----------------------------------------------------
    function withdraw(uint _campaignId, uint _amount) public {
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.owner, "Only owner can withdraw");
        require(c.isActive, "Campaign not active");
        require(_amount <= c.raised, "Not enough funds");

        c.raised -= _amount;
        payable(c.owner).transfer(_amount);
        // эвент
    }

    // ----------------------------------------------------
    // withdrawAll (бүх хөрөнгийг татах — гэхдээ хаахгүй)
    // ----------------------------------------------------
    function withdrawAll(uint _campaignId) public {
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.owner, "Only owner can withdrawAll");
        require(c.isActive, "Already closed");

        uint amount = c.raised;
        require(amount > 0, "No funds to withdraw");

        // c.raised = 0;
        payable(c.owner).transfer(amount);
        // эвент
    }

    // ----------------------------------------------------
    // getCampaign
    // ----------------------------------------------------
    /**
     * @notice Тухайн ID-тай кампанит ажлын дэлгэрэнгүйг авах
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
            uint, // deadline
            bool // 11 wasGoalReached
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
            c.deadline,
            c.wasGoalReached
        );
    }

    // ----------------------------------------------------
    // getAllCampaigns
    // ----------------------------------------------------
    /**
     * @notice Бүх кампанит ажлын массивыг буцаана
     */
    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint i = 1; i <= campaignCount; i++) {
            all[i - 1] = campaigns[i];
        }
        return all;
    }

    // ----------------------------------------------------
    // getDonationsHistory
    // ----------------------------------------------------
    /**
     * @notice Нэг кампанит ажлын бүх donation түүхийг (comment-тай нь) авах
     */
    function getDonationsHistory(
        uint _campaignId
    ) public view returns (Donation[] memory) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid ID");
        return donationsHistory[_campaignId];
    }

    // ----------------------------------------------------
    // updateMetadataHash
    // ----------------------------------------------------
    /**
     * @notice _campaignId-тэй кампанийн metadataHash утгыг шинэчилнэ (IPFS CID, жишээ нь)
     */
    function updateMetadataHash(
        uint256 _campaignId,
        string memory _newHash
    ) external {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Invalid campaign ID"
        );
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.owner, "Not owner!");

        c.metadataHash = _newHash;
        emit MetadataHashUpdated(_campaignId, _newHash);
    }

    // ----------------------------------------------------
    // checkGoalReached – туслах функц
    // ----------------------------------------------------
    /**
     * @dev Хэрэв энэ кампани өмнө нь wasGoalReached=false байсан
     *     ч raised >= goal болсон бол wasGoalReached=true болгож update хийнэ.
     */
    function checkGoalReached(uint _campaignId) internal {
        Campaign storage c = campaigns[_campaignId];
        // Хэрэв аль хэдийн true бол дахин шалгах шаардлагагүй
        if (!c.wasGoalReached && c.raised >= c.goal) {
            c.wasGoalReached = true;
        }
    }
}
