// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFundraising {
    function donate(uint _campaignId) external payable;
    // Бусад шаардлагатай функцууд...
}

contract MarketplaceContract {
    struct MarketplaceItem {
        uint id;
        address seller;
        string title;
        string description;
        uint price; // MNT эсвэл wei?
        string imageUrl;
        uint campaignId; // FundraisingContract дахь кампаанийн ID
        bool isSold;
        bool isActive; // item идэвхтэй эсэх
    }

    uint public itemCount;
    mapping(uint => MarketplaceItem) public items;

    address public fundraisingContract; // FundraisingContract-ийн хаяг

    // Events
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

    constructor(address _fundraisingContract) {
        itemCount = 0;
        fundraisingContract = _fundraisingContract;
    }

    // createItem
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

    // getAllItems
    function getAllItems() public view returns (MarketplaceItem[] memory) {
        MarketplaceItem[] memory all = new MarketplaceItem[](itemCount);
        for (uint i = 1; i <= itemCount; i++) {
            all[i - 1] = items[i];
        }
        return all;
    }

    // getItem
    function getItem(
        uint _itemId
    ) public view returns (MarketplaceItem memory) {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        return items[_itemId];
    }

    // updateItem: зөвхөн seller нь засаж болно
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

    // deactivateItem: зарим үед зарлагаа түр идэвхгүй болгох
    function deactivateItem(uint _itemId) public {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        MarketplaceItem storage mItem = items[_itemId];
        require(msg.sender == mItem.seller, "Only seller can deactivate");
        require(mItem.isActive, "Already inactive");
        require(!mItem.isSold, "Already sold");

        mItem.isActive = false;

        emit ItemDeactivated(_itemId);
    }

    // buyItem: item-ыг худалдаж авах
    // Энд MNT-р үнэ тогтоосон гэж үзэж байгаа бол жишээ нь 1 MNT = 1 wei биш тул
    // танд ETH ↔ MNT харьцааг эсвэл stable token ашиглах зэрэг бодит шийдэл хэрэгтэй
    // Одоогоор mock байдлаар: buyer msg.value = mItem.price (wei) гэж үзье
    function buyItem(uint _itemId) public payable {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid itemId");
        MarketplaceItem storage mItem = items[_itemId];
        require(mItem.isActive, "Item not active");
        require(!mItem.isSold, "Already sold");
        require(msg.value == mItem.price, "Price mismatch");

        // 1) item зарагдлаа
        mItem.isSold = true;
        mItem.isActive = false;

        // 2) Орлогоос хэсгийг FundraisingContract руу donate хийх
        //  - жишээ нь 50% нь кампаанд, 50% нь seller-т
        //  - эсвэл 100% кампаанд, гэх мэт. Энд 100% donate гэж үзье:
        uint donateAmount = msg.value;

        // 3) cross-contract call → FundraisingContract.donate(campaignId)
        IFundraising(fundraisingContract).donate{value: donateAmount}(
            mItem.campaignId
        );

        // Хэрэв тодорхой хувь нь seller рүү очих бол:
        // uint sellerPart = (msg.value * 50) / 100;
        // payable(mItem.seller).transfer(sellerPart);
        // uint donatePart = msg.value - sellerPart;
        // IFundraising(fundraisingContract).donate{value: donatePart}(
        //     mItem.campaignId
        // );

        emit ItemBought(_itemId, msg.sender, msg.value, mItem.campaignId);
    }
}
