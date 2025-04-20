'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider, JsonRpcProvider, ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFundraisingContract } from '@/services/fundraisingConfig';

interface StatsProps {
  totalProjects: number;
  totalRaisedWei: bigint;
  activeProjects: number;
}

const ETH_TO_MNT_RATE = 6_000_000;

export default function StatsSection() {
  const [stats, setStats] = useState<StatsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        // 1) Provider setup (MetaMask or fallback)
        let provider: BrowserProvider | JsonRpcProvider;
        if ((window as any).ethereum) {
          provider = new BrowserProvider((window as any).ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new JsonRpcProvider('http://127.0.0.1:8545');
        }

        // 2) Contract call
        const contract = getFundraisingContract(provider);
        const allCampaigns: any[] = await contract.getAllCampaigns();

        // 3) Compute metrics
        const totalProjects = allCampaigns.length;
        let totalRaisedWei = BigInt(0);
        let activeProjects = 0;

        allCampaigns.forEach((c) => {
          const raised: bigint = c[6];
          const isActive: boolean = c[7];
          totalRaisedWei += raised;
          if (isActive) activeProjects++;
        });

        setStats({ totalProjects, totalRaisedWei, activeProjects });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Convert Wei → ETH → MNT
  const totalRaisedEth = stats
    ? parseFloat(ethers.formatEther(stats.totalRaisedWei))
    : 0;
  const totalRaisedMnt = Math.floor(totalRaisedEth * ETH_TO_MNT_RATE);

  return (
    <section className='py-12 bg-gray-50 w-full px-4'>
      <div className='container mx-auto text-center'>
        <motion.h2
          className='text-2xl font-bold text-gray-800 sm:text-3xl mb-8'
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          Төслийн статистик
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
              className='rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
            >
              <p className='text-gray-600 mb-2'>Нийт төслүүд</p>
              <h3 className='text-3xl font-bold text-blue-600'>
                {stats.totalProjects}
              </h3>
            </motion.div>

            <motion.div
              className='rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <p className='text-gray-600 mb-2'>Цугласан нийт хөрөнгө</p>
              <h3 className='text-3xl font-bold text-blue-600'>
                {totalRaisedMnt.toLocaleString()} MNT
              </h3>
            </motion.div>

            <motion.div
              className='rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className='text-gray-600 mb-2'>Идэвхтэй төслүүд</p>
              <h3 className='text-3xl font-bold text-blue-600'>
                {stats.activeProjects}
              </h3>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
