import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = '0x0CEF72adac9b1C279F5ec4b212D129D98e6CCE99';
export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'campaignCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'campaigns',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'title',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'goal',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'raised',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'imageUrl',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_title',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_description',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '_goal',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_imageUrl',
        type: 'string',
      },
    ],
    name: 'createCampaign',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllCampaigns',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'title',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'description',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'goal',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'raised',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isActive',
            type: 'bool',
          },
          {
            internalType: 'string',
            name: 'imageUrl',
            type: 'string',
          },
        ],
        internalType: 'struct FundraisingContract.Campaign[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_campaignId',
        type: 'uint256',
      },
    ],
    name: 'getCampaign',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export function getFundraisingContract(signerOrProvider: any) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}
