---
name: google-vids-creator
description: Autonomous product promo and viral social media video creation via Google Vids AI studio storyboard, TTS voiceover synthesis, and project manifest generation.
created_by: hermes-agent
tags: [video, google-vids, reels, ai-studio, tts, marketing]
---

# Google Vids AI Video Creator Skill

## Purpose
Enables Hermes Agent to autonomously generate multi-scene promotional videos, reels, and product showcases using the Google Vids architecture, including automatic scene storyboards, AI voiceover narration, layout cards, and Google Workspace export manifests.

## Workflow
1. **Product & Storyboard Ingestion:**
   - Ingest catalog product or user video prompt.
   - Generate structured 5-scene narrative: Hook, Problem/Solution, Feature Demonstration, Social Proof & Logistics, and CTA.
2. **AI Voiceover Synthesis:**
   - Synthesize neural TTS audio per scene and full combined narration track (supports Indian English, Hindi, and Global English).
3. **Visual Media & Layout Rendering:**
   - Render 9:16 vertical reels (1080x1920) or 16:9 presentation slides with product photography, badges, and synchronized subtitles.
4. **Google Vids Manifest Export:**
   - Generate official Google Workspace Vids JSON project schema ready for import into Google Vids, Google Drive, or video publishing channels.

## Verification
- Verified by generating project manifests in `generated_posts/google_vids/`.
- Accessible via `/dots` dashboard under the Google Vids AI Studio tab.
