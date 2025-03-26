'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DonateButtonProps {
  /** Хандив өгөх гэж буй кампанит ажлын ID */
  campaignId: number;
  /** Ямар нэг нэмэлт className эсвэл style */
  className?: string;
}

/**
 * Хоёр хуудсан дээр хоёуланд нь ижил Donate товчийг ашиглахад зориулсан
 * дахин ашиглах боломжтой компонент.
 */
export default function DonateButton({
  campaignId,
  className,
}: DonateButtonProps) {
  return (
    <Link href={`/campaigns/${campaignId}/donate`}>
      <Button
        className={className ?? 'bg-blue-600 hover:bg-blue-500 text-white'}
      >
        Хандив өгөх
      </Button>
    </Link>
  );
}
