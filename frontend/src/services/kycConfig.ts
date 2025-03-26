// services/kycConfig.ts
import { ethers } from 'ethers';

export const KYC_ADDRESS = '0x6938516235eD21476Fe5feC0109fb748C429103c';
export const KYC_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'approveKYC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'isKycApproved',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'isKycApprovedUser',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export function getKYCContract(signerOrProvider: any) {
  return new ethers.Contract(KYC_ADDRESS, KYC_ABI, signerOrProvider);
}
