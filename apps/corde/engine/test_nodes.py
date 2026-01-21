#!/usr/bin/env python3
"""Quick test for CORDE nodes on M4 Pro"""

import sys
sys.path.insert(0, '.')

def test_pixart():
    """Test PixArt-Sigma"""
    print("\n" + "="*60)
    print("Testing PixArt-Sigma")
    print("="*60)

    from nodes.image_nodes_v2 import PixArtNode

    node = PixArtNode()
    node.set_input('prompt', 'Young Roman boy reading under olive tree, Rome in background')
    node.set_input('width', 768)
    node.set_input('height', 768)
    node.set_input('steps', 15)
    node.set_input('style_preset', 'onde')

    result = node.execute()
    print(f"\nResult: {result['image_path']}")
    return result


def test_sdxl_turbo():
    """Test SDXL Turbo (fast)"""
    print("\n" + "="*60)
    print("Testing SDXL Turbo")
    print("="*60)

    from nodes.image_nodes_v2 import SDXLTurboNode

    node = SDXLTurboNode()
    node.set_input('prompt', 'watercolor painting of a Roman emperor')
    node.set_input('steps', 4)

    result = node.execute()
    print(f"\nResult: {result['image_path']}")
    return result


def test_ffmpeg():
    """Test FFmpeg video generation"""
    print("\n" + "="*60)
    print("Testing FFmpeg")
    print("="*60)

    from nodes.video_nodes_v2 import FFmpegNodeV2

    # Need an image first
    pixart_result = test_pixart()

    node = FFmpegNodeV2()
    node.set_input('input_path', pixart_result['image_path'])
    node.set_input('effect', 'ken_burns')
    node.set_input('duration', 5.0)
    node.set_input('resolution', '1080x1920')

    result = node.execute()
    print(f"\nResult: {result['video_path']}")
    return result


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--test', choices=['pixart', 'turbo', 'ffmpeg', 'all'], default='pixart')
    args = parser.parse_args()

    if args.test == 'pixart':
        test_pixart()
    elif args.test == 'turbo':
        test_sdxl_turbo()
    elif args.test == 'ffmpeg':
        test_ffmpeg()
    elif args.test == 'all':
        test_pixart()
        test_sdxl_turbo()
        test_ffmpeg()
