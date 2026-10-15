"""
Master Entry Point for RareEmber CrewAI Suite
Run:
    python -m rareember_crew.run_crew           # 24/7 background mode (every 300s)
    python -m rareember_crew.run_crew --once    # Single test cycle
    python -m rareember_crew.run_crew --interval 180
"""

import sys
import json
import argparse
from rareember_crew.crew import RareEmberCrew

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def main():
    parser = argparse.ArgumentParser(description="RareEmber CrewAI Master Autonomous Engine")
    parser.add_argument("--interval", type=int, default=300, help="Interval in seconds between cycles (default: 300)")
    parser.add_argument("--once", action="store_true", help="Execute single cycle and exit")
    args = parser.parse_args()

    crew = RareEmberCrew(cycle_interval_seconds=args.interval)
    if args.once:
        result = crew.run_business_cycle()
        print(f"\n[SINGLE CYCLE RESULT]:\n{json.dumps(result, indent=2, default=str)}")
    else:
        crew.start_autonomous_engine(interval_seconds=args.interval)

if __name__ == "__main__":
    main()
