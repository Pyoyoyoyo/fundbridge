'use client';

import DetailTab from '@/components/campaigns/[id]/tabs/DetailTab';
import RisksTab from '@/components/campaigns/[id]/tabs/RisksTab';
import FAQTab from '@/components/campaigns/[id]/tabs/FAQTab';
import PeopleTab from '@/components/campaigns/[id]/tabs/PeopleTab';
import RewardsTab from '@/components/campaigns/[id]/tabs/RewardsTab';
import PaymentTab from '@/components/campaigns/[id]/tabs/PaymentTab';
import CommentsTab from '@/components/campaigns/[id]/tabs/CommentsTab';
import WarningBoxes from '@/components/campaigns/[id]/tabs/WarningBoxes';

interface TabsContentSectionProps {
  activeTab: string;
  metadata: any;
  campaignId: number;
}

export default function TabsContentSection({
  activeTab,
  metadata,
  campaignId,
}: TabsContentSectionProps) {
  return (
    <div className='mt-4'>
      {activeTab === 'detail' && <DetailTab metadata={metadata} />}
      {activeTab === 'risks' && <RisksTab metadata={metadata} />}
      {activeTab === 'faq' && <FAQTab metadata={metadata} />}
      {activeTab === 'people' && <PeopleTab metadata={metadata} />}
      {activeTab === 'rewards' && <RewardsTab metadata={metadata} />}
      {activeTab === 'payment' && <PaymentTab metadata={metadata} />}
      {activeTab === 'comments' && <CommentsTab campaignId={campaignId} />}
      {/* Бүх табуудын доор WarningBoxes үргэлж гарч ирнэ */}
      <WarningBoxes />
    </div>
  );
}
