'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAuditLogContract } from '@/services/auditLogConfig';
import { BrowserProvider, JsonRpcProvider } from 'ethers';

type AuditLog = {
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  timestamp: string;
};

export default function AuditLogWidget() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        let provider;

        if (typeof window !== 'undefined' && window?.ethereum) {
          provider = new BrowserProvider(window.ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_URL);
        }

        const contract = getAuditLogContract(provider);
        const result = await contract.getLogs();

        const parsed = result.map((log: any) => ({
          user: log.user,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          ipAddress: log.ipAddress,
          timestamp: new Date(Number(log.timestamp) * 1000).toISOString(),
        }));

        setLogs(parsed);
        console.log('Audit logs fetched:', parsed);
      } catch (error) {
        console.error('🧨 Failed to load audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className='p-4 border rounded-md shadow-sm bg-white'>
      <h2 className='text-lg font-semibold mb-3'>Audit Log</h2>

      {loading ? (
        <div className='space-y-2'>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className='h-6 w-full' />
          ))}
        </div>
      ) : (
        <ScrollArea className='max-h-[400px]'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[40px]'>#</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={`${log.user}-${log.timestamp}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell
                    className='truncate max-w-[180px]'
                    title={log.user}
                  >
                    {log.user}
                  </TableCell>
                  <TableCell>{log.entityId}</TableCell>
                  <TableCell>{log.ipAddress || '-'}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString('mn-MN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}
