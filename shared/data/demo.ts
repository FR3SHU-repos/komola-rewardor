export type CampaignStatus = "Published" | "Draft" | "Paused" | "Expired";
export type Campaign = { id: string; title: string; reward: string; claims: number; limit: number; status: CampaignStatus; ends: string; category: string };
export const campaigns: Campaign[] = [
  { id:"fresh-box", title:"Fresh harvest welcome", reward:"1,500 Komola points", claims:184, limit:500, status:"Published", ends:"30 Sep 2026", category:"New buyers" },
  { id:"millet-monday", title:"Millet Monday", reward:"2× Komola points", claims:92, limit:250, status:"Published", ends:"12 Oct 2026", category:"Category" },
  { id:"fpo-friends", title:"FPO friends", reward:"1,000 Komola points", claims:0, limit:100, status:"Draft", ends:"—", category:"Member segment" },
  { id:"monsoon", title:"Monsoon pantry", reward:"750 Komola points", claims:341, limit:350, status:"Paused", ends:"25 Sep 2026", category:"Location" },
];
export const recentClaims = [
  { code:"KM-8J4P", campaign:"Fresh harvest welcome", buyer:"Ananya R.", status:"Claimed", date:"Today, 10:42 AM" },
  { code:"KM-2Q7M", campaign:"Millet Monday", buyer:"Ravi K.", status:"Redeemed", date:"Today, 9:18 AM" },
  { code:"KM-1L9X", campaign:"Fresh harvest welcome", buyer:"Meera S.", status:"Claimed", date:"Yesterday, 4:06 PM" },
];
