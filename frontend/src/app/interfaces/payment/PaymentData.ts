import { PaymentCostItem } from './PaymentCostItem';
import { ReportItem } from './ReportItem';

/**
 * PaymentData – Төслийн санхүүжилтийн задаргаа, шимтгэл, төлбөрийн мэдээлэл.
 */
export interface PaymentData {
  fundingCosts: PaymentCostItem[]; // Санхүүжилтийн задаргаа (олон мөр)
  fundbridgeFee: string; // Фандиа шимтгэл
  publishingFee: string; // Төсөл нийтлэх төлбөр

  // Нийт босгох мөнгөн дүнгээ BasicsData.goal-оос шууд авна.

  reports?: ReportItem[]; // Хөрөнгө ашиглалтын тайлан
}
