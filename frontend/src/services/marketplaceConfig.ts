import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = '0x4E773aE695A968633ac5Ef8E17c87cB0c517b7fD';
export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_fundraisingContract',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'campaignId',
        type: 'uint256',
      },
    ],
    name: 'ItemBought',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'campaignId',
        type: 'uint256',
      },
    ],
    name: 'ItemCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
    ],
    name: 'ItemDeactivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
    ],
    name: 'ItemUpdated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_itemId',
        type: 'uint256',
      },
    ],
    name: 'buyItem',
    outputs: [],
    stateMutability: 'payable',
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
        name: '_price',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_imageUrl',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '_campaignId',
        type: 'uint256',
      },
    ],
    name: 'createItem',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_itemId',
        type: 'uint256',
      },
    ],
    name: 'deactivateItem',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fundraisingContract',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllItems',
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
            name: 'seller',
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
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'imageUrl',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'campaignId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isSold',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isActive',
            type: 'bool',
          },
        ],
        internalType: 'struct MarketplaceContract.MarketplaceItem[]',
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
        name: '_itemId',
        type: 'uint256',
      },
    ],
    name: 'getItem',
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
            name: 'seller',
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
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'imageUrl',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'campaignId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isSold',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isActive',
            type: 'bool',
          },
        ],
        internalType: 'struct MarketplaceContract.MarketplaceItem',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'itemCount',
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
    name: 'items',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'seller',
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
        name: 'price',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'imageUrl',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'campaignId',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isSold',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_itemId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_newTitle',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_newDesc',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '_newPrice',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_newImageUrl',
        type: 'string',
      },
    ],
    name: 'updateItem',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export function getMarketplaceContract(signerOrProvider: any) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}
