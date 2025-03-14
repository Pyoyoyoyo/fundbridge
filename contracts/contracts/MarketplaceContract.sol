// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Fundraising гэрээний interface
 * - Таны Fundraising гэрээнд `donate(uint _campaignId)` функц заавал байдаг гэж үзье.
 */
interface IFundraising {
    function donate(uint _campaignId) external payable;
}

/**
 * @title MarketplaceContract
 * @dev Кампанит ажилд (FundraisingContract) хандив өгөх зорилготой бараа/зүйлсийг
 *      зарж борлуулах зах зээлийн гэрээ.
 */
contract MarketplaceContract {
    // ------------------------
    // 1. Data Structures
    // ------------------------
    struct MarketplaceItem {
        uint id; // [0]
        address seller; // [1]
        address buyer; // [2] - анх address(0), дараа нь buyItem() дээр buyer = msg.sender
        string title; // [3]
        string description; // [4]
        uint price; // [5] - wei хэлбэр
        string imageUrl; // [6]
        uint campaignId; // [7] - Fundraising гэрээний кампанийн ID
        bool isSold; // [8]
        bool isActive; // [9]
        // Хэрэв metadataHash ашиглах бол энд нэмнэ: string metadataHash; // [10]
    }

    // ------------------------
    // 2. State Variables
    // ------------------------
    uint public itemCount;
    mapping(uint => MarketplaceItem) public items;

    // Fundraising гэрээний хаяг (энд donate(...) функц руу дуудлага хийнэ)
    address public fundraisingContract;

    // ------------------------
    // 3. Events
    // ------------------------
    event ItemCreated(
        uint indexed itemId,
        address indexed seller,
        uint price,
        uint campaignId
    );
    event ItemUpdated(uint indexed itemId);
    event ItemDeactivated(uint indexed itemId);
    event ItemBought(
        uint indexed itemId,
        address indexed buyer,
        uint price,
        uint campaignId
    );

    // ------------------------
    // 4. Constructor
    // ------------------------
    constructor(address _fundraisingContract) {
        itemCount = 0;
        fundraisingContract = _fundraisingContract;
    }

    // --------------------------------------------------------
    // createItem
    // --------------------------------------------------------
    /**
     * @notice Шинэ бараа/зүйл үүсгэх
     * @param _title Барааны нэр
     * @param _description Барааны тайлбар
     * @param _price Үнэ (wei)
     * @param _imageUrl Зураг (IPFS URL гэх мэт)
     * @param _campaignId Fundraising гэрээ дээрх кампанийн ID
     */
    function createItem(
        string memory _title,
        string memory _description,
        uint _price,
        string memory _imageUrl,
        uint _campaignId
    ) public {
        require(_price > 0, "Price must be > 0");

        itemCount++;
        items[itemCount] = MarketplaceItem({
            id: itemCount,
            seller: msg.sender,
            buyer: address(0), // анх хоосон
            title: _title,
            description: _description,
            price: _price,
            imageUrl: _imageUrl,
            campaignId: _campaignId,
            isSold: false,
            isActive: true
        });

        emit ItemCreated(itemCount, msg.sender, _price, _campaignId);
    }

    // --------------------------------------------------------
    // getAllItems
    // --------------------------------------------------------
    /**
     * @notice Бүх item-уудын мэдээллийг авах
     */
    function getAllItems() public view returns (MarketplaceItem[] memory) {
        MarketplaceItem[] memory all = new MarketplaceItem[](itemCount);
        for (uint i = 1; i <= itemCount; i++) {
            all[i - 1] = items[i];
        }
        return all;
    }

    // --------------------------------------------------------
    // getItem
    // --------------------------------------------------------
    /**
     * @notice Тухайн itemId-тай item-ыг авах
     */
    function getItem(
        uint _itemId
    ) public view returns (MarketplaceItem memory) {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        return items[_itemId];
    }

    // --------------------------------------------------------
    // updateItem
    // --------------------------------------------------------
    /**
     * @notice Item-ийн мэдээллийг засварлах
     * Зөвхөн item-ийн seller нь update хийх эрхтэй
     */
    function updateItem(
        uint _itemId,
        string memory _newTitle,
        string memory _newDesc,
        uint _newPrice,
        string memory _newImageUrl
    ) public {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        MarketplaceItem storage mItem = items[_itemId];
        require(msg.sender == mItem.seller, "Only seller can update");
        require(!mItem.isSold, "Already sold");
        require(mItem.isActive, "Item not active");

        mItem.title = _newTitle;
        mItem.description = _newDesc;
        mItem.price = _newPrice;
        mItem.imageUrl = _newImageUrl;

        emit ItemUpdated(_itemId);
    }

    // --------------------------------------------------------
    // deactivateItem
    // --------------------------------------------------------
    /**
     * @notice Item-ыг идэвхгүй болгох (дараа нь зарахгүй)
     * Зөвхөн seller нь идэвхгүй болгох эрхтэй
     */
    function deactivateItem(uint _itemId) public {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        MarketplaceItem storage mItem = items[_itemId];
        require(msg.sender == mItem.seller, "Only seller can deactivate");
        require(mItem.isActive, "Already inactive");
        require(!mItem.isSold, "Already sold");

        mItem.isActive = false;
        emit ItemDeactivated(_itemId);
    }

    // --------------------------------------------------------
    // buyItem
    // --------------------------------------------------------
    /**
     * @notice Барааг худалдан авах
     * @dev msg.value = mItem.price (wei) гэж үзэж байна
     *      Худалдан авсны дараа 100% орлого Campaign руу donate хийдэг
     */
    function buyItem(uint _itemId) public payable {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        MarketplaceItem storage mItem = items[_itemId];
        require(mItem.isActive, "Item not active");
        require(!mItem.isSold, "Already sold");
        require(msg.value == mItem.price, "Price mismatch");

        // 1) item зарагдлаа
        mItem.isSold = true;
        mItem.isActive = false;
        mItem.buyer = msg.sender; // худалдан авагч тэмдэглэнэ

        // 2) 100% орлогыг FundraisingContract руу donate
        IFundraising(fundraisingContract).donate{value: msg.value}(
            mItem.campaignId
        );

        emit ItemBought(_itemId, msg.sender, msg.value, mItem.campaignId);
    }
}
