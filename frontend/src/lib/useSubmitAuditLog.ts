'use client';

import { getAuditLogContract } from '@/services/auditLogConfig';
import { BrowserProvider } from 'ethers';

export async function submitAuditLog({
  action,
  entity_type,
  entity_id,
  ip_address,
}: {
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
}) {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = getAuditLogContract(signer);

  const tx = await contract.addLog(action, entity_type, entity_id, ip_address);
  await tx.wait();
}
