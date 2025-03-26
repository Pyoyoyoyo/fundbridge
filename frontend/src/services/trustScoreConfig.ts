// // trustScoreConfig.ts
// import { ethers } from 'ethers';

// export const TRUST_SCORE_ADDRESS = '0x5d6d71E5598520e21CaF40Edb6bB8757eC5C10Eb'; // deploy хийсний дараа гарч ирсэн
// export const TRUST_SCORE_ABI = [
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: '_fundraisingContract',
//         type: 'address',
//       },
//     ],
//     stateMutability: 'nonpayable',
//     type: 'constructor',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         indexed: false,
//         internalType: 'int256',
//         name: 'amount',
//         type: 'int256',
//       },
//       {
//         indexed: false,
//         internalType: 'int256',
//         name: 'newScore',
//         type: 'int256',
//       },
//     ],
//     name: 'ScoreDecreased',
//     type: 'event',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         indexed: false,
//         internalType: 'int256',
//         name: 'amount',
//         type: 'int256',
//       },
//       {
//         indexed: false,
//         internalType: 'int256',
//         name: 'newScore',
//         type: 'int256',
//       },
//     ],
//     name: 'ScoreIncreased',
//     type: 'event',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         internalType: 'int256',
//         name: 'amount',
//         type: 'int256',
//       },
//     ],
//     name: 'decreaseScore',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'fundraisingContract',
//     outputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         internalType: 'int256',
//         name: 'amount',
//         type: 'int256',
//       },
//     ],
//     name: 'increaseScore',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//     ],
//     name: 'setInitialScoreIfNone',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     name: 'userScore',
//     outputs: [
//       {
//         internalType: 'int256',
//         name: '',
//         type: 'int256',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
// ];

// export function getTrustScoreContract(signerOrProvider: any) {
//   return new ethers.Contract(
//     TRUST_SCORE_ADDRESS,
//     TRUST_SCORE_ABI,
//     signerOrProvider
//   );
// }
