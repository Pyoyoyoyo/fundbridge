// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev FundraisingContract‐ийн донат хийх үндсэн функцийг илэрхийлэх interface
 */
interface IFundraising {
    function donate(uint _campaignId) external payable;
}
