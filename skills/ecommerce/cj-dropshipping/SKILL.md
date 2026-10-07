---
name: cj-dropshipping-fulfillment
description: Autonomous product sourcing, inventory synchronization, pricing markup, and auto-fulfillment via CJ Dropshipping API.
---

# CJ Dropshipping Fulfillment Skill

## Purpose
Enables Hermes to autonomously connect to CJ Dropshipping API, sync inventory, fulfill customer orders automatically, and fetch tracking numbers.

## Workflow
1. **Product Sourcing & Catalog Sync:**
   - Query CJ Dropshipping trending products in profitable categories (Gadgets, Beauty, Home).
   - Sync product titles, high-resolution media, variant pricing, and stock levels to Supabase.
2. **Auto-Fulfillment Loop:**
   - Detect new confirmed orders from Stripe/Razorpay webhook.
   - Call CJ Dropshipping `createOrder` API endpoint to place supplier orders automatically.
3. **Tracking & Shipping Updates:**
   - Continuously poll CJ Dropshipping for tracking number generation.
   - Update customer orders and trigger automated dispatch notification emails.
