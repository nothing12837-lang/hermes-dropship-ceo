"""
RareEmber CrewAI Business Tasks
Defines autonomous business tasks executed by the executive crew.
"""

from crewai import Task
from typing import Dict, Any

def create_procurement_task(agent):
    return Task(
        description="""1. Audit the live RareEmber catalog from Supabase products table.
2. Verify asset reachability and supplier stock health.
3. Enforce the Zero-Loss Margin Shield: Ensure Store Selling Price > (Wholesale Cost + ₹90 Overhead).
4. Scout at least 1 high-margin winning product from domestic Indian wholesale hubs (Surat/Bhiwandi/Delhi) and queue it into scouted_products table in Supabase.
5. Log findings to the Dots Terminal and return a structured procurement report.""",
        expected_output="A structured markdown report detailing: total products audited, zero-loss compliance, newly scouted winning product with wholesale cost, selling price, and projected profit margin percentage.",
        agent=agent,
    )

def create_seo_task(agent):
    return Task(
        description="""1. Research high-volume, low-competition e-commerce keywords in India (ambient lighting, water sensor diyas, ergonomic desk setups).
2. Generate a comprehensive, engaging, SEO-optimized lifestyle article (700+ words) formatted in Markdown with proper H1, H2, bullet points, and CTA to https://rareember.shop/shop.
3. Publish the article directly into Supabase blog_posts table with slug, title, excerpt, and category.
4. Return the published URL and target keyword density.""",
        expected_output="Confirmation of published blog post including slug, title, excerpt, target search intent, and live storefront URL (https://rareember.shop/blog/[slug]).",
        agent=agent,
    )

def create_pricing_task(agent):
    return Task(
        description="""1. Evaluate pricing elasticity across RareEmber's impulse purchase brackets: sub-₹399, ₹449-₹599, and ₹699-₹999.
2. Ensure compare_at_price anchors an irresistible 55%-65% perceived discount for Indian Cash on Delivery buyers.
3. Audit active promotional coupon codes (DIWALI100, FIRST50, NEWYEAR) and confirm minimum order value thresholds.
4. Recommend commercial adjustments to optimize checkout conversion rates.""",
        expected_output="Pricing and commercial recommendations breakdown including margin sweet spots, optimal compare_at_price ratios, and active coupon performance.",
        agent=agent,
    )

def create_creative_task(agent):
    return Task(
        description="""1. Craft an authentic 1080x1350 vertical feed image drop brief for the top trending winner.
2. Strict mandate: 100% authentic manufacturer photography, ZERO video reels, ZERO generic stock photos.
3. Formulate value overlay badges ('100% Domestic Quality', '2-4 Day Express Air Delivery', 'Cash on Delivery Available', '7-Day Easy Replacement').
4. Write high-converting caption hook and direct call-to-action for Instagram and Meta Ads.""",
        expected_output="Complete creative drop brief with headline, pricing overlay, trust badges, image URL reference, caption hook, and CTA link.",
        agent=agent,
    )

def create_operations_task(agent):
    return Task(
        description="""1. Inspect live order queue in Supabase orders table.
2. For any pending Cash on Delivery orders, generate pre-dispatch 1-click WhatsApp customer confirmation links.
3. Verify courier tracking status (Delhivery / Shadowfax / BlueDart).
4. Evaluate customer PIN code delivery reliability and maintain RTO risk below 8%.""",
        expected_output="Operational status report with pending order count, tracking health, WhatsApp COD links, and RTO risk mitigation measures.",
        agent=agent,
    )

def create_cfo_task(agent):
    return Task(
        description="""1. Audit 24-hour revenue, COGS, landed shipping costs (₹75), and COD reserve buffers (₹15).
2. Compute net cash profit and average order margin percentage.
3. Strictly verify that NO product or order is fulfilled at a financial loss.
4. Record updated financial ledger in Supabase orders_pnl table.""",
        expected_output="Financial ledger summary detailing 24h revenue, gross profit, net cash profit, average margin %, and confirmation of zero-loss guarantee.",
        agent=agent,
    )

def create_ceo_synthesis_task(agent):
    return Task(
        description="""1. Review and synthesize the reports from Arjun, Aarav, Vikram, Meera, Pooja, and Kabir.
2. Formulate Radha's God-CEO Executive Summary and multi-agent learnings.
3. Commit learning to cloud agent memory in Supabase.
4. Update the Dots Dashboard (/dots) state to 'Completed' and push terminal logs.
5. Dispatch the executive briefing directly to founder Ajay Rajbhar on Telegram (@rereemberbot).""",
        expected_output="Radha CEO's executive synthesis and confirmation of Telegram broadcast and Dots dashboard synchronization.",
        agent=agent,
    )
