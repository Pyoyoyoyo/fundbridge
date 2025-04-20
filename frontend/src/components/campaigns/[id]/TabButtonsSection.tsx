'use client';

import { TabButton } from '@/components/SharedComponents/TabButton';

interface TabButtonsSectionProps {
  activeTab:
    | 'detail'
    | 'risks'
    | 'faq'
    | 'people'
    | 'rewards'
    | 'comments'
    | 'payment';
  setActiveTab: (
    tab:
      | 'detail'
      | 'risks'
      | 'faq'
      | 'people'
      | 'rewards'
      | 'comments'
      | 'payment'
  ) => void;
}

export default function TabButtonsSection({
  activeTab,
  setActiveTab,
}: TabButtonsSectionProps) {
  return (
    <div className='flex flex-wrap border-b border-gray-200'>
      <TabButton
        label='Дэлгэрэнгүй'
        isActive={activeTab === 'detail'}
        onClick={() => setActiveTab('detail')}
      />
      <TabButton
        label='Эрсдэл'
        isActive={activeTab === 'risks'}
        onClick={() => setActiveTab('risks')}
      />
      <TabButton
        label='FAQ'
        isActive={activeTab === 'faq'}
        onClick={() => setActiveTab('faq')}
      />
      <TabButton
        label='Баг'
        isActive={activeTab === 'people'}
        onClick={() => setActiveTab('people')}
      />
      <TabButton
        label='Урамшуулал'
        isActive={activeTab === 'rewards'}
        onClick={() => setActiveTab('rewards')}
      />
      <TabButton
        label='Санхүүжилт'
        isActive={activeTab === 'payment'}
        onClick={() => setActiveTab('payment')}
      />
      <TabButton
        label='Сэтгэгдэл'
        isActive={activeTab === 'comments'}
        onClick={() => setActiveTab('comments')}
      />
    </div>
  );
}
