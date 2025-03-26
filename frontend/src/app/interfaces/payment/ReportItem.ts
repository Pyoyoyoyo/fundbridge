/**
 * Хөрөнгө ашиглалтын тайлангийн нэг мөр
 */
export interface ReportItem {
  title: string; // Тайлангийн гарчиг (жишээ: "Тоног төхөөрөмж худалдан авалт")
  amount: string; // Зарцуулагдсан дүн (жишээ: "5000000")
  date: string; // Зарцуулсан огноо (жишээ: "2025-04-01")
  description: string; // Дэлгэрэнгүй тайлбар
  imageUrl?: string; // IPFS CID or direct link
}
