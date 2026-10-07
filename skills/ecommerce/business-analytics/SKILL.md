---
name: executive-business-analytics
description: Computes daily e-commerce business health, revenue, ad spend, supplier costs, net profit margins, and generates 8 AM & 8 PM executive Telegram digests.
---

# Executive Business Analytics Skill

## Purpose
Enables Hermes to monitor store financial health in real time and deliver executive digests to Ajay via Telegram.

## Metrics Monitored
1. **Financial Performance:**
   - Gross Revenue (Stripe / Razorpay)
   - Cost of Goods Sold (COGS from CJ Dropshipping)
   - Marketing Ad Spend (ROAS tracking)
   - Net Profit Margin (Gross - COGS - Ads - Processing Fees)
2. **Order Logistics:**
   - Unfulfilled Orders count
   - In-Transit Orders count
   - Disputed / Refunded Orders rate
3. **Daily Executive Telegram Briefing:**
   - Dispatched at 8:00 AM IST (Morning Status & Tasks) and 8:00 PM IST (Evening Revenue & Wrap-up).
