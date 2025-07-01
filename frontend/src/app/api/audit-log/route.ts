import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const contractAddress = '0x706B5BC35e4BC09D60C69BC7f5f59618eF38a53d';
const AuditLogABI = [
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
// -------------------------
// POST: Add log to blockchain
// -------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, entity_type, entity_id, ip_address, username } = body;

    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(contractAddress, AuditLogABI, wallet);

    const tx = await contract.addLog(
      action,
      entity_type,
      entity_id,
      ip_address
    );
    await tx.wait();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[AUDIT POST ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to log audit event' },
      { status: 500 }
    );
  }
}

// -------------------------
// GET: Read logs from blockchain
// -------------------------
export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    const contract = new ethers.Contract(
      contractAddress,
      AuditLogABI,
      provider
    );
    const logs = await contract.getLogs();

    const parsed = logs.map((log: any) => ({
      user: log.user,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      ip_address: log.ipAddress,
      timestamp: new Date(Number(log.timestamp) * 1000).toISOString(),
    }));

    return NextResponse.json({ data: parsed });
  } catch (err) {
    console.error('[AUDIT GET ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
