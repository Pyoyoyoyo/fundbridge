// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundraisingContract {
    struct Campaign {
        uint id;
        address owner;
        string title;
        string description;
        uint goal;
        uint raised;
        bool isActive;
        string imageUrl; // 🆕 Зургийн линкийг хадгалах талбар нэмлээ
    }

    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;

    constructor() {
        campaignCount = 0;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        uint _goal,
        string memory _imageUrl // 🆕 Шинэ талбар
    ) public {
        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            owner: msg.sender,
            title: _title,
            description: _description,
            goal: _goal,
            raised: 0,
            isActive: true,
            imageUrl: _imageUrl
        });
    }

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
            string memory // 🆕 imageUrl буцаана
        )
    {
        Campaign memory c = campaigns[_campaignId];
        return (
            c.id,
            c.owner,
            c.title,
            c.description,
            c.goal,
            c.raised,
            c.isActive,
            c.imageUrl
        );
    }

    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint i = 1; i <= campaignCount; i++) {
            all[i - 1] = campaigns[i];
        }
        return all;
    }
}
