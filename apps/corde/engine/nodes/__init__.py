"""
CORDE Engine Nodes
Ultra-modular node system for content generation
"""

from .base import BaseNode
from .image_nodes import SDXLNode, IPAdapterNode
from .video_nodes import SVDNode, AnimateDiffNode, FFmpegNode
from .text_nodes import PromptNode, LLMNode
from .utility_nodes import LoadImageNode, SaveNode, PreviewNode

# v2 nodes (optimized for Apple Silicon)
from .image_nodes_v2 import PixArtNode, SDXLTurboNode
from .video_nodes_v2 import LTXVideoNode, FFmpegNodeV2, VideoConcatNode

# Music Video nodes (VISUALS-SYNC-WITH-MUSIC engine)
from .music_video_nodes import AudioAnalyzerNode, VisualSyncNode, MusicVideoNode

__all__ = [
    # Base
    'BaseNode',
    # Original image nodes
    'SDXLNode',
    'IPAdapterNode',
    # Original video nodes
    'SVDNode',
    'AnimateDiffNode',
    'FFmpegNode',
    # Text nodes
    'PromptNode',
    'LLMNode',
    # Utility nodes
    'LoadImageNode',
    'SaveNode',
    'PreviewNode',
    # v2 image nodes
    'PixArtNode',
    'SDXLTurboNode',
    # v2 video nodes
    'LTXVideoNode',
    'FFmpegNodeV2',
    'VideoConcatNode',
    # Music video nodes
    'AudioAnalyzerNode',
    'VisualSyncNode',
    'MusicVideoNode',
]
