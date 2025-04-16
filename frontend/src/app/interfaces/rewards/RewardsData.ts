// /app/campaigns/create/interfaces/RewardsData.ts

import { RewardItem } from './RewardItem';

/**
 * RewardsData – Reward-уудын жагсаалт, тайлбар.
 */
export interface RewardsData {
  items: RewardItem[];
  description: string;
}
