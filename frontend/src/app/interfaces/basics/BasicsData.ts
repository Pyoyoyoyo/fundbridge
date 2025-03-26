// /app/campaigns/create/interfaces/BasicsData.ts

/**
 * Basics – Төслийн үндсэн мэдээлэл.
 */
export interface BasicsData {
  title: string;
  description: string;
  primaryCategory: string;
  imageUrl: string; // зургийн урсгал
  videoUrl: string; // видеоны урсгал
  goal: string; // string хэлбэрээр хадгална (Нийт босгох мөнгөн дүн)
  targetLaunchDate: string;
  latePledges: boolean;
  targetEndDate: string;
}
