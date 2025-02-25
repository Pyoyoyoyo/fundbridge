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
    }

    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;

    constructor() {
        campaignCount = 0;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        uint _goal
    ) public {
        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            owner: msg.sender,
            title: _title,
            description: _description,
            goal: _goal,
            raised: 0,
            isActive: true
        });
    }

    function donate(uint _campaignId) public payable {
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive, "Campaign is not active.");
        c.raised += msg.value;
    }

    function getCampaign(
        uint _campaignId
    )
        public
        view
        returns (uint, address, string memory, string memory, uint, uint, bool)
    {
        Campaign memory c = campaigns[_campaignId];
        return (
            c.id,
            c.owner,
            c.title,
            c.description,
            c.goal,
            c.raised,
            c.isActive
        );
    }

    // Шинээр нэмэх функц: getAllCampaigns()
    // Энэ нь campaignCount-оор циклдэж, бүх Campaign struct-ыг нэг массивад хувилаад буцаана.
    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint i = 1; i <= campaignCount; i++) {
            all[i - 1] = campaigns[i];
        }
        return all;
    }

    function closeCampaign(uint _campaignId) public {
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.owner, "Not owner");
        c.isActive = false;
    }
}
