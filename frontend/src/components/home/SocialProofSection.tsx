'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider, JsonRpcProvider, ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFundraisingContract } from '@/services/fundraisingConfig';

interface SocialProofStats {
  totalBackers: number;
  successRate: number; // in %
  totalRaisedWei: bigint;
}

const ETH_TO_MNT_RATE = 6_000_000;

export default function SocialProofSection() {
  const [stats, setStats] = useState<SocialProofStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        // Provider
        let provider: BrowserProvider | JsonRpcProvider;
        if ((window as any).ethereum) {
          provider = new BrowserProvider((window as any).ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new JsonRpcProvider('http://127.0.0.1:8545');
        }

        // Fetch campaigns
        const contract = getFundraisingContract(provider);
        const allCampaigns: any[] = await contract.getAllCampaigns();

        // Compute:
        const total = allCampaigns.length;
        let totalRaisedWei = BigInt(0);
        let successCount = 0;
        const backers = new Set<string>();

        allCampaigns.forEach((c) => {
          const owner: string = c[1];
          const goal: bigint = c[5];
          const raised: bigint = c[6];
          totalRaisedWei += raised;
          if (raised >= goal) successCount++;
          backers.add(owner);
        });

        const totalBackers = backers.size;
        const successRate =
          total > 0 ? Math.round((successCount / total) * 100) : 0;

        setStats({ totalBackers, successRate, totalRaisedWei });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load social proof stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Convert Wei → MNT
  const raisedEth = stats
    ? parseFloat(ethers.formatEther(stats.totalRaisedWei))
    : 0;
  const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

  return (
    <section className='py-12 bg-white w-full px-4'>
      <div className='container mx-auto text-center'>
        <motion.h2
          className='mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl'
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          Хэрэглэгчдийн итгэл
        </motion.h2>

        {loading && (
          <div className='grid gap-6 sm:grid-cols-3'>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className='h-40 w-full rounded-md bg-gray-300'
              />
            ))}
          </div>
        )}

        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>⚠️ Алдаа гарлаа</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && stats && (
          <div className='grid gap-6 sm:grid-cols-3'>
            <motion.div
              className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
            >
              <p className='text-gray-600 mb-2'>Нийт бүртгэгдсэн хэрэглэгчид</p>
              <h3 className='text-3xl font-bold text-blue-600'>
                {stats.totalBackers.toLocaleString()}
              </h3>
            </motion.div>

            <motion.div
              className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <p className='text-gray-600 mb-2'>Амжилттай төслүүдийн хувь</p>
              <h3 className='text-3xl font-bold text-blue-600'>
                {stats.successRate}%
              </h3>
            </motion.div>

            <motion.div
              className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className='text-gray-600 mb-2'>Нийт хөрөнгө оруулалт</p>
              <h3 className='text-3xl font-bold text-blue-600'>
                {raisedMnt.toLocaleString()} MNT
              </h3>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
