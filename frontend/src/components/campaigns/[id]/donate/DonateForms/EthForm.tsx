import { Button } from '@/components/ui/button';

// -------------------------- ETH Form --------------------------
export function EthForm({
  donationAmountEth,
  setDonationAmountEth,
  handleDonateEth,
  donating,
}: {
  donationAmountEth: string;
  setDonationAmountEth: (val: string) => void;
  handleDonateEth: () => void;
  donating: boolean;
}) {
  return (
    <div className='space-y-2'>
      <label className='text-sm text-gray-600'>Хандивын дүн (ETH)</label>
      <input
        type='number'
        step='0.0001'
        min='0'
        value={donationAmountEth}
        onChange={(e) => setDonationAmountEth(e.target.value)}
        className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full'
        placeholder='Жишээ нь 0.01'
        disabled={donating}
      />
      <Button
        onClick={handleDonateEth}
        disabled={donating}
        className='bg-blue-600 hover:bg-blue-500 text-white w-full mt-2'
      >
        {donating ? 'Илгээж байна...' : 'ETH-ээр шууд хандив өгөх'}
      </Button>
    </div>
  );
}
