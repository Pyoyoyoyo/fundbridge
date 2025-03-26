export interface Campaign {
  id: number;
  owner: string;
  title: string;
  primaryCategory: string; // "Хандив" эсвэл "Хөрөнгө оруулалт"
  description: string;
  goalWei: bigint;
  raisedWei: bigint;
  goalMnt: number;
  raisedMnt: number;
  isActive: boolean;
  imageUrl: string;
  metadataHash: string;
  deadline: number;
  wasGoalReached: boolean; // шинэ талбар
}
