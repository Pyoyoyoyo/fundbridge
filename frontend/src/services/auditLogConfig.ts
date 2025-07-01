import { ethers } from 'ethers';

const AUDIT_LOG_CONTRACT_ADDRESS = '0x706B5BC35e4BC09D60C69BC7f5f59618eF38a53d';
const AUDIT_LOG_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'action',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'entityType',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'entityId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'ipAddress',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'LogAdded',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'action',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'entityType',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'entityId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'ipAddress',
        type: 'string',
      },
    ],
    name: 'addLog',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCount',
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
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getLog',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'action',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'entityType',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'entityId',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'ipAddress',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
        ],
        internalType: 'struct AuditLog.Log',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLogs',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'action',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'entityType',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'entityId',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'ipAddress',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
        ],
        internalType: 'struct AuditLog.Log[]',
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
        name: '',
        type: 'uint256',
      },
    ],
    name: 'logs',
    outputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'action',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'entityType',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'entityId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'ipAddress',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export function getAuditLogContract(
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  return new ethers.Contract(
    AUDIT_LOG_CONTRACT_ADDRESS,
    AUDIT_LOG_ABI,
    signerOrProvider
  );
}
