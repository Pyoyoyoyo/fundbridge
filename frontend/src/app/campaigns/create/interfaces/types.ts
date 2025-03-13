// /app/campaigns/create/interfaces.ts

/**
 * StoryData – Төслийн түүх, эрсдэл, FAQ зэрэг мэдээллийг агуулна.
 */
export interface StoryData {
  introduceProject: string; // 1. Төслөө танилцуул
  storyDetail: string; // 2. Төслийн түүх
  risks: string; // 3. Эрсдэл ба сорилтууд
  faq: string; // 4. Түгээмэл асуулт, хариулт
}

/**
 * PeopleData – Хувийн мэдээлэл, багийн гишүүд, хамтрагчид зэрэг талбарууд.
 */
export interface PeopleData {
  vanityURL: string;
  demographics: string;
  collaborators: string; // Хамтрагчид, багийн гишүүд
}

/**
 * PaymentData – Банкны данс, Crypto wallet зэрэг төлбөрийн мэдээлэл.
 */
export interface PaymentData {
  bankInfo: string; // Банкны данс
  cryptoWallet: string; // Crypto wallet
}

/**
 * PromotionData – Маркетинг, олон нийтийн сүлжээ, сурталчилгаа зэрэг төлөвлөгөөний талбарууд.
 */
export interface PromotionData {
  marketingPlan: string;
  socialMedia: string;
}

/**
 * Rewards-т багтах Item
 */
export interface Item {
  name: string;
  description: string;
  image: string;
}

/**
 * RewardsData – Reward-уудын жагсаалт, тайлбар.
 */
export interface RewardsData {
  items: Item[];
  description: string;
}

/**
 * Basics – Төслийн үндсэн мэдээлэл.
 */
export interface BasicsData {
  title: string;
  description: string;
  primaryCategory: string;
  imageUrl: string; // зургийн урсгал
  videoUrl: string; // видеоны урсгал
  goal: string; // string хэлбэрээр хадгална
  targetLaunchDate: string;
  latePledges: boolean;
}

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
