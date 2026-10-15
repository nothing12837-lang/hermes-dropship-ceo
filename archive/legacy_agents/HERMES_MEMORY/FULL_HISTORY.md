# HERMES + KRONOS - FULL SESSION MEMORY (READ EVERY START)
> This file is read by Hermes Agent on every session. Update after each chat.

## WHO WE ARE
- User: Ajay Rajbhar (5238068527) - Goal: Passive income via trading bot, free from 9-5, basic life
- Assistant: Hermes Agent (Radha on Telegram @AiRadhabot) - built by Nous Research, runs on Nvidia NIM
- Past project: KronosBot — REMOVED 24.09.2026 per Ajay (stopped, do not resume)

## WHAT WE DID (21.09.2026)
1. YouTube: https://youtu.be/oZ-766itSvM - Hermes Masterclass Hindi - Fetched captions 1642 snippets via youtube-transcript-api, saved to C:\Users\AJAYKU~1\AppData\Local\Temp\opencode\transcript_oZ-766itSvM_hi.txt
2. Hermes Install: Native Windows to %LOCALAPPDATA%\hermes via install.ps1 -SkipSetup, v0.21.3, Python 3.11, Node 22
3. Gemini API: Primary nvidia/nemotron-3-ultra-550b-a55b via NVIDIA_API_KEY=nvapi-sN2ID... (81 models, 550b chosen for quality, Super 120b fastest 8.9s). Also pooled 2x Gemini AQ.Ab8RN6... (GOOGLE_API_KEY + GEMINI_API_KEY + gemini-2) for 40/min fallback, but all hit 429 free tier 20/min
4. Telegram: Bot @AiRadhabot 8717067478:AAGvw... Chat 5238068527, gateway PID 11316, Startup Hermes_Gateway.vbs, polling healthy
5. Groq: gsk_C7X... for auxiliary compression/title -> 14k/day free, qwen/qwen3.8-27b 32k->128k
6. OpenRouter: sk-or-v1-a9d6... 446 models, 21 free, but hit free-models-per-day 429 until 05:30, fallback nex-agi/liquid tried, now fallback cleared to only Nvidia
7. Nvidia NIM: nvapi-sN2ID... 81 models, chose 550b Ultra for Kronos (1M context), Super 120b fastest
8. Kronos Fixes: Killed hanging python (7260:8080), fixed config.yaml min_confidence 0.10->0.35, min_agents_agree 1->2, risk 0.02->0.01, max_daily 0.05->0.02, verified http://localhost:8080/api/status running equity 10000
9. Rate Limits: Gemini 20/min, OpenRouter free 200/day, Groq 14k/day, Nvidia 503 overloaded retries 5, auto_recovery 10, fallback [] to keep trying not cancel
10. Big Works Fix: Prompt 59k ->22k via disabled_toolsets, then back to [] for big, compression to nvidia 1M, threshold 0.75, target 0.3, to handle Kronos 77339 tokens without 413
11. Gateway Issues: taskkill /F /IM python.exe killed Hermes too -> SIGKILL UNCLEANLY -> No gateway -> restarted PID 8960, 9940, 11316, etc. Fix: use taskkill /PID <kronos> only
12. Memory Issue: After restart/gateway stop, auto-reset due to 413 + compression fails -> forget. Fixed by 1M context and not using small qwen fallback

## CURRENT WORKING CONFIG (C:\Users\ajay kumar\AppData\Local\hermes\config.yaml)
- model.provider: nvidia, model.default: nvidia/nemotron-3-ultra-550b-a55b, providers.nvidia.context_length: 1000000
- fallback_providers: [] (only Nvidia, keep trying 5 retries)
- agent.api_max_retries: 5, auto_recovery_cycles: 10, max_turns: 500
- auxiliary.compression.provider: nvidia, model: same 550b
- worktree: true, max_concurrent_sessions: 5, busy_input_mode: interrupt (Telegram multi-task)
- Kronos config.yaml: paper mode, DOGSUSD/BTCUSD 15m, min_confidence 0.35, min_agents_agree 2, paper_equity 10000

## SECRETS (C:\Users\ajay kumar\AppData\Local\hermes\.env and Kronos\.env)
- GOOGLE_API_KEY=AQ.Ab8RN6IdP... , GEMINI_API_KEY same, gemini-2=AQ.Ab8RN6JNHJT...
- GROQ_API_KEY=gsk_C7X..., OPENROUTER_API_KEY=sk-or-v1-a9d6..., NVIDIA_API_KEY=nvapi-sN2ID...
- Kronos .env: DELTA_API_KEY=ode6..., TELEGRAM_BOT_TOKEN same, GEMINI_API_KEY same

## KRONOS STRUCTURE (STRUCTURE.md)
- bot/adaptive_bot.py, arbiter, risk, execution, signals (kronos, smc, liquidity...), data/delta_client, webui/app.py, tests, etc.
- WebUI 8080 + bot together via start_all.py asyncio.gather

## NEXT TASK FOR HERMES
- (24.09.2026) KronosBot REMOVED per Ajay — processes stopped, do NOT resume or auto-start; await Ajay's next direction
- (30.09.2026) Hermes gateway moved to Render free: hermes-gateway-wib4.onrender.com (gateway_alive:true, model nemotron-3-ultra-550b). Laptop gateway STOPPED to avoid Telegram polling conflict — only restart with `hermes gateway run --replace` if Render dies. Deploy repo = github.com/nothing12837-lang/ajaybot (PUBLIC, branch main, local mirror Downloads/vps-deploy/space). Pushed 30.09: fixed buildCommand, checkpoint_required=false, /logs route, removed app/config/config.yaml from tracking. SECURITY: repo public + old commit had live bot token + Gemini key in history -> MUST revoke via BotFather and rotate Gemini key.
- Use Telegram @AiRadhabot /new + targeted reads, keep laptop on, avoid broad taskkill

## RULES TO REMEMBER
- Low-end laptop no GPU -> use cloud Nvidia/Groq/Gemini, not local Ollama
- Keep free: Groq 14k/day, OpenRouter free after 05:30, Gemini 20/min pooled
- Big works need 1M context, small tasks ok with 32k, but Kronos needs 1M
- After gateway restart, read this file first

Last updated: 24.09.2026 by Hermes — KronosBot removed per Ajay


## LATEST SYSTEM STATUS UPDATE (01.10.2026 11:30 IST)
- Fee modeling code pushed to GitHub (commits fc72796 and 7a2d2c1). Paper trading runs include taker fees (0.05%), maker fees (0.02%), and slippage (0.01%).
- AjayBot Monitor workflow active (.github/workflows/ajaybot-monitor.yml) and dedicated Daily Report workflow (.github/workflows/daily-report.yml) scheduled for 10:30 AM IST (05:00 UTC) with scripts/daily_report.py.
- 10:00 AM IST Morning News Brief job ACTIVE (.github/workflows/morning-news.yml + scripts/morning_news.py) covering National, UP, Punjab, and Markets.
- Train Reminder Check configured (scripts/train_reminder.py) for Ajay's journey on 04-Nov-2026 (Train 12649 Sampark Kranti Express from YPR to NZM, Coach B1 Berth 18, PNR 4764141969).
- Auxiliary compression updated to Google Gemini Flash to eliminate 600s timeout auto-resets.
- TELEGRAM_HOME_CHANNEL set to Ajay's chat 5238068527 to permanently eliminate "No home channel set" notices.
- SOUL.md and USER.md enriched so Radha greets Ajay warmly and recognizes him across all resets.

## SESSION 05.10.2026 - PAPER FLEET OVERHAUL (opencode agent)
- Repos: nothing12837-lang/ajaybot, arbitrage-bot, btc-eth-pair, hermes (all public, main).
- Ajaybot daily reset pushed 9df5476 (equity 9490.49 kept, daily_pnl 0, consec 0). Later bot sync ce070d4 showed equity 9767.91, 4 consec losses, loss pause on. Live paper: 28 closed, 3 wins, 10.7pct WR, net about minus 519. NOT profitable.
- Pair ENTRY_Z 1.5->1.0 (ef82155) ->0.8 (f3a3d0b), EXIT_Z 0.5->0.2 (d144333). 30d Kraken replay at 0.8/0.5: 20 closed, 55pct, minus 0.15 (fees eat all). Sweep best 1.5/0.2: 7 trades, 86pct, plus 2.00 (tiny n, in-sample). Live: 0 closed, 1 OPEN spread BTC SHORT 85800 / ETH LONG 2701 since 04.10. EXIT 0.2 holds it longer. NOT profitable, edge near zero.
- Arb: 1 open BUY 0.35 BTC at 86051 (fee 18.05, equity 9981.95), 0 closed. Theory doc only, UNPROVEN. Needs 10 closed paper trades first.
- Fast cycles: ajaybot+arb paper.yml timeout 480s->70s (9e65d1f, 1d30758). Pair single-run already seconds.
- Full-month GitHub: Hermes TRADE_INTERVAL 900->14400 (4h, 62a9b41). Est about 1440 min/mo inside free 2000. 15min would die in 3 days.
- Hermes powers: anytime tune (hourly auto + manual /tune, 70pct WR target, wider bounds incl new EXIT_Z rule), /heal /flatten /reset skills, TOOL tune/heal/flatten/reset, simple-easy msgs (simple_text strips hashtag star), /start rewritten. Commits 23b744f, 88bbfcc, 87f1aa9, c1ad0b2, 62a9b41.
- Hermes 24/7 verified live: Worker A in_progress, B handed over, watchdog+morning report success.
- VPS bundle: hermes/deploy/gratisvps/ (setup.sh systemd, env.template, README) pushed 9f428ec + max-speed update c1ad0b2 (pair 5min, TRADE_FIRE=off, auto-disable GitHub workflows). GratisVPS box tested EMPTY (no sudo/python, user rareember, simulated banner) -> DROPPED, no keys pasted. GitHub 4h stays primary.
- Research: Waifly 300MB free (fits Pair+Hermes only), GratisVPS 6GB/120d trial, AlaVPS 8GB = SCAM (Trustpilot 1.9, avoid), UPI hosts: AIC 99/mo 1GB, HeavenCloud 4GB 490/mo, Joy free credit 1GB. Oracle needs card (user has none; Fino RuPay works only on Indian Razorpay hosts).
- Backups: BOT_BACKUPS/originals (pre-change: ajaybot state 724ea1e, papers, pair 75be4ef, hermes f387b4b) + BOT_BACKUPS/current (live versions). All changes also in git history.
- Note: empty auto-tune commits appear on pair (75be4ef, daba81c) with no diff - harmless history noise, file unchanged. Pair idle logic sees 0 closed trades as idle 999d and keeps relaxing ENTRY - may drift ENTRY down to 0.5 bound over days; EXIT 0.2 test unaffected.
- SECURITY: hermes clone remote URL embeds GH_PAT token - rotate if shared. Windows Credential Manager had 2 GitHub accounts; stale password cred erased after GitHub rejection; x-access-token used now.
Last updated: 05.10.2026 by opencode agent - EXIT 0.2 live d144333, full-month mode on, backups saved.

## SESSION 05.10.2026 PART 2 - IDLE FIX + VPS HUNT
- Idle 999 FIXED in hermes.py (aadf547): added _bot_position_open + _bot_last_run_ts. Open spot or fresh run means alive 0d. Relax-entry fires only when truly dead 7d. Pair ENTRY 0.8 test now safe from drift. Goes live on next worker handover (Worker A mid-shift).
- Month checklist verified live: ajaybot success 10.14 UTC, arb 10.15 UTC, pair 10.13 UTC, Hermes Worker A in_progress. Tune hourly, heal/flatten/reset, state auto-push, BOT_BACKUPS + this file saved. Month burn about 1440 min inside free 2000. Entries can still lag between wakes (burst nature, only VPS fixes).
- GratisVPS box tested EMPTY: no sudo, no git, no python3, user rareember, simulated banner, USA. DROPPED. Never paste keys there. Creds seen in chat - password must be changed if box kept (recommend abandon).
- YouTube VPS videos given (10 links): f9LlXkvQg4E setup 2026, yTBKtR2PpeM 10GB Colab, umy2EMWNWP0 12GB, PoKpG4f9sZ0 root no card, ob4xnegmP3Q panel, DlW5KDgrKvY 8GB, aWmS5CHcMO8 32GB RDP, NKzLATmPXao, tIxQg4CmYIw Hindi shell, playlist PLdE8dVOLOav0WLS5CHuIh5Ss598jag16F. Warned: Colab/IDX tricks die fast + ban risk, learning only.
- Big-RAM free research: GratisVPS 6GB/120d trial (real path), FreeVPS.edu.pl 4GB, FreeVPS.it.com 4GB, FreeVPS.info/GratisVPS 6GB 120d. AlaVPS 8GB = SCAM (Trustpilot 1.9, data harvest, pending forever) - NEVER use.
- UPI hosts (no card): Joy free credit 1GB about 1 week then UPI top-up 150; HostPeppy 72h trial; HeavenCloud free 715MB panel; AIC 99/mo 1GB (tight for all 3); HeavenCloud 2GB 390/mo; PowerHost 4GB 399/mo (PICK for all 3+Hermes); GreatHost from 299; GigaNodes Nano 2GB 500/mo. Fino RuPay works on Indian Razorpay hosts, rejected on foreign hosts.
- RAM truth: all 3 + Hermes need about 860MB-1GB. 300MB fits Pair+Hermes only. User has no card; PC script declined; 3-GitHub-accts idea rejected (ban risk + still only 8 days at 15min).
- Monorepo idea rejected (same owner = same minute pool, no savings). 2-account split rejected (Hermes 24/7 alone needs 40k min, dies day 2 on free).
- Profitability verdict delivered HONEST: ajaybot NOT profitable (28 trades, 10.7pct, minus 519), pair NOT profitable (30d replay 55pct minus 0.15, edge near zero), arb UNPROVEN (0 closed). Nothing proves future profit. User said yes to EXIT 0.2 (applied) - open spread holds longer now.
Last updated: 05.10.2026 by opencode agent - idle fix aadf547, month verified green.

## SESSION 08.10.2026 - RAREEMBER PRODUCTION LAUNCH & FULL HERMES A-TO-Z ACCESS
- Primary Mission: Autonomous COO & E-Commerce Concierge for RareEmber (https://rareember-store.vercel.app).
- Full details in: HERMES_MEMORY/RAREMBER_OPERATIONS.md
- Python CLI toolkit ready: `python hermes_rareember_tool.py status`
- Production Site: https://rareember-store.vercel.app (HTTP 200 OK, Public)
- Multi-Currency Engine: Domestic India in INR (₹) and US/Global in USD ($)
- Supabase DB: Connected to qdkkxpfhwrwyoardlceo.supabase.co
- Razorpay Gateway: Active (UPI, Cards, NetBanking) + Doorstep Cash on Delivery (COD)
- Domestic Factory-Direct Network: 100% Indian logistics via BlueDart & Delhivery Express (CJ Dropshipping completely purged everywhere).
- Telegram Command Center: Bot 8898923626:... alerts to Ajay's chat 5238068527 tested and verified LIVE.
- Hermes now has 100% full-stack control to monitor, fulfill, alert, and run the business 24/7.
Last updated: 08.10.2026 by Antigravity AI - RareEmber live, Hermes empowered A to Z.

## SESSION 08-09.10.2026 - CJ PURGE, HINDI DIALOGUE 3D REEL ENGINE & MASTER BRAIN
1. Total CJ Dropshipping Purge:
   - Purged all CJ references, tokens, functions, and fallbacks across hermes-dropship-ceo, harmess agemnt, frontend (`products-server.ts`), and GitHub Actions workflows (`worker_a.yml`, `worker_b.yml`).
   - Standardized strictly on Domestic Indian Factory-Direct fulfillment (Bhiwandi, Gurugram, Bengaluru hubs) with 2-4 day express delivery via BlueDart & Delhivery.
2. Total Pet Content Elimination:
   - Replaced all legacy pet SKUs, blogs, quiz questions, and reviews with curated tech, minimalist workspaces, and smart living aesthetics.
3. Checkout Idempotency & Webhook Resilience:
   - Strict `idempotency_key` verification on `/api/orders` prevents double-charging and duplicate order rows. Verified live with 0 duplicate records.
4. Telegram Report Deduplication:
   - Cryptographic SHA-256 hash checking and cooldown timers in `report_idempotency.json` prevent duplicate Hermes alerts across Worker A & B.
5. Viral 3D Cartoon Hindi Dialogue Reel Engine:
   - Built comedic banter dialogue engine (`@amitverse_ai` style): Gappu vs Pappu mall price debate.
   - Voiced via Google TTS (`gTTS`) in fluent Hindi with character pitch-shifting and upbeat background lo-fi music bed.
   - Dynamic 1080x1920 (9:16) video with multi-character avatars, Devanagari Hindi text, Roman subtitles, studio product showcase, and animated bottom progress bar.
   - Verified end-to-end: generated 4.85 MB video and delivered preview to Ajay on Telegram.
6. Master Brain Neural Vault Created:
   - Permanent memory saved to `HERMES_MEMORY/MASTER_BRAIN.md`.
Last updated: 09.10.2026 by Antigravity AI - System 100% production verified.
