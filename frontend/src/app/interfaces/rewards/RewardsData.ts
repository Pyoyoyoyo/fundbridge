// /app/campaigns/create/interfaces/RewardsData.ts

import { Item } from './RewardItem';

/**
 * RewardsData – Reward-уудын жагсаалт, тайлбар.
 */
export interface RewardsData {
  items: Item[];
  description: string;
}
