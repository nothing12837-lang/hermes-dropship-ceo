// RTO risk scoring - cloud-safe, no external API.
// Score 0-100 from phone/pincode history + order signals.
export type RtoRecommendation = "ALLOW_COD" | "PREPAID_ONLY" | "CONFIRM_FIRST";

export function scoreRtoRisk(opts: {
  phone?: string;
  pincode?: string;
  orderCount?: number;
  rtoCount?: number;
  totalInr?: number;
}): { risk_score: number; recommendation: RtoRecommendation } {
  const { orderCount = 0, rtoCount = 0, totalInr = 0, pincode = "" } = opts;
  let score = 15;
  if (orderCount === 0) score += 10;
  if (rtoCount > 0 && orderCount > 0) score += Math.min(50, Math.round((rtoCount / orderCount) * 60));
  if (totalInr >= 1500) score += 10;
  if (!/^[1-9][0-9]{5}$/.test(pincode || "")) score += 15;
  score = Math.max(0, Math.min(100, score));
  if (score >= 60) return { risk_score: score, recommendation: "PREPAID_ONLY" };
  if (score >= 35) return { risk_score: score, recommendation: "CONFIRM_FIRST" };
  return { risk_score: score, recommendation: "ALLOW_COD" };
}
