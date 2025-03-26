export interface MarketplaceItem {
  id: number;
  seller: string;
  buyer: string;
  title: string;
  description: string;
  price: string; // wei хэлбэр
  imageUrl: string;
  campaignId: number;
  isSold: boolean;
  isActive: boolean;
}
