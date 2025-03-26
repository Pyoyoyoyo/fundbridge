// /app/campaigns/create/interfaces/FormData.ts

import { BasicsData } from './basics/BasicsData';
import { RewardsData } from './rewards/RewardsData';
import { StoryData } from './story/StoryData';
import { PeopleData } from './people/PeopleData';
import { PaymentData } from './payment/PaymentData';
import { PromotionData } from './promotion/PromotionData';

/**
 * FormData – Бүх хэсгийн (Basics, Rewards, Story, People, Payment, Promotion) нэгдсэн өгөгдөл.
 */
export interface FormData {
  basics: BasicsData;
  rewards: RewardsData;
  story: StoryData;
  people: PeopleData;
  paymentInfo: PaymentData;
  promotion: PromotionData;
}
