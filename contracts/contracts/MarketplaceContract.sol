// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Fundraising гэрээний interface
 *   - Таны Fundraising гэрээ "donate(uint _campaignId) payable" функцтэй гэж үзье.
 */
interface IFundraising {
    function donate(uint _campaignId) external payable;
}

/**
 * @title MarketplaceContract
 * @dev Кампанит ажилд (FundraisingContract) хандив өгөх зорилготой бараа/зүйлсийг
 *      зарж борлуулах зах зээл.
 */
contract MarketplaceContract {
    // ------------------------
    // 1. Data Structures
    // ------------------------
    struct MarketplaceItem {
        uint id; // item ID
        address seller; // зарах хүн
        address buyer; // худалдан авагч
        string title; // барааны нэр
        string description; // тайлбар
        uint price; // wei хэлбэр
        string imageUrl; // Зураг (IPFS)
        uint campaignId; // Fundraising гэрээн дэх аль кампанит ажилд хандивлах вэ
        bool isSold;
        bool isActive;
    }

    // ------------------------
    // 2. State Variables
    // ------------------------
    uint public itemCount;
    mapping(uint => MarketplaceItem) public items;

    // Fundraising гэрээний хаяг
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
    function createItem(
        string memory _title,
        string memory _description,
        uint _price, // wei
        string memory _imageUrl,
        uint _campaignId
    ) public {
        require(_price > 0, "Price must be > 0");

        itemCount++;
        items[itemCount] = MarketplaceItem({
            id: itemCount,
            seller: msg.sender,
            buyer: address(0),
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
    function getItem(
        uint _itemId
    ) public view returns (MarketplaceItem memory) {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        return items[_itemId];
    }

    // --------------------------------------------------------
    // updateItem
    // --------------------------------------------------------
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
     * @dev msg.value = mItem.price (wei)
     *      Худалдан авсны дараа Fundraising гэрээ рүү donate(_campaignId) дуудаж
     *      кампанит ажлын raised дүнг нэмэгдүүлнэ.
     */
    function buyItem(uint _itemId) public payable {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        MarketplaceItem storage mItem = items[_itemId];
        require(mItem.isActive, "Item not active");
        require(!mItem.isSold, "Already sold");
        require(msg.value == mItem.price, "Price mismatch");

        // 1) Item зарагдсан гэж тэмдэглэх
        mItem.isSold = true;
        mItem.isActive = false;
        mItem.buyer = msg.sender;

        // 2) Fundraising руу donate(_campaignId) дуудлага илгээнэ
        // IFundraising интерфэйсийг ашиглаж болно, эсвэл .call ашиглаж болно
        // Энд бид call ашиглаж байна:
        (bool success, ) = fundraisingContract.call{value: msg.value}(
            abi.encodeWithSignature("donate(uint256)", mItem.campaignId)
        );
        require(success, "Donation failed");

        emit ItemBought(_itemId, msg.sender, msg.value, mItem.campaignId);
    }
}
