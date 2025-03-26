// /app/campaigns/create/interfaces/StoryData.ts

import { FaqItem } from './FaqItem';

/**
 * StoryData – Төслийн түүх, эрсдэл, FAQ зэрэг мэдээллийг агуулна.
 */
export interface StoryData {
  introduceProject: string; // 1. Төслөө танилцуул
  storyDetail: string; // 2. Төслийн түүх
  risks: string; // 3. Эрсдэл ба сорилтууд
  faq: FaqItem[]; // 4. Түгээмэл асуулт, хариулт
}
