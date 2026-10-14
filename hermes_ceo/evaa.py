"""
Evaa Hindi Virtual Influencer Compatibility Module
Proxies 1:1 to radha_ceo.evaa for seamless backwards compatibility.
"""

from radha_ceo.evaa import (
    DEFAULT_VOICE,
    EVAA_AVATAR_URL,
    generate_evaa_audio,
    generate_evaa_storyboard_card,
    build_evaa_video_reel
)

__all__ = [
    "DEFAULT_VOICE",
    "EVAA_AVATAR_URL",
    "generate_evaa_audio",
    "generate_evaa_storyboard_card",
    "build_evaa_video_reel"
]
