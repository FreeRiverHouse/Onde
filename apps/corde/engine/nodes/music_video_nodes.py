"""
CORDE Music Video Nodes - VISUALS-SYNC-WITH-MUSIC Engine
Optimized for Apple Silicon M4 Pro
Open Source only (librosa for audio analysis)

Nodes:
- AudioAnalyzerNode: Beat detection, energy extraction, tempo analysis
- VisualSyncNode: Sync visuals to audio timeline
- MusicVideoNode: Orchestrates the full VideoPoesia pipeline
"""

import os
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path
from datetime import datetime
import subprocess
import tempfile
import json
from dataclasses import dataclass, asdict
from .base import BaseNode

# Set cache to SSD
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'


def clear_memory():
    """Clear MPS memory"""
    import gc
    import torch
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
        torch.mps.synchronize()


@dataclass
class AudioMarker:
    """Represents a sync point in the audio timeline"""
    time: float  # seconds
    type: str  # 'beat', 'downbeat', 'energy_peak', 'speech_start', 'speech_end', 'section'
    strength: float  # 0.0 to 1.0
    data: Optional[Dict] = None  # Additional metadata

    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class AudioAnalysis:
    """Complete audio analysis result"""
    duration: float
    sample_rate: int
    tempo: float
    beats: List[float]  # beat times in seconds
    downbeats: List[float]  # measure starts
    energy_curve: List[Tuple[float, float]]  # (time, energy) pairs
    markers: List[AudioMarker]  # all sync points
    sections: List[Dict]  # structural sections
    speech_segments: List[Tuple[float, float]]  # (start, end) pairs

    def to_dict(self) -> Dict:
        return {
            'duration': self.duration,
            'sample_rate': self.sample_rate,
            'tempo': self.tempo,
            'beats': self.beats,
            'downbeats': self.downbeats,
            'energy_curve': self.energy_curve,
            'markers': [m.to_dict() for m in self.markers],
            'sections': self.sections,
            'speech_segments': self.speech_segments,
        }


class AudioAnalyzerNode(BaseNode):
    """Analyze audio for beat detection, energy extraction, and sync points.

    Uses librosa (open source) for all audio analysis.
    Optimized for Apple Silicon with numpy vectorization.
    """

    NODE_ID = "audio_analyzer"
    NODE_NAME = "Audio Analyzer"
    NODE_CATEGORY = "audio"
    NODE_DESCRIPTION = "Extract beats, tempo, energy, and sync points from audio"

    INPUTS = {
        'audio_path': {'type': 'string', 'required': True, 'description': 'Path to WAV audio file'},
        'detect_speech': {'type': 'bool', 'required': False, 'default': True,
                         'description': 'Detect speech segments'},
        'energy_hop_ms': {'type': 'int', 'required': False, 'default': 50,
                         'description': 'Energy calculation hop size in milliseconds'},
        'min_beat_strength': {'type': 'float', 'required': False, 'default': 0.3,
                             'description': 'Minimum strength for beat markers (0-1)'},
        'section_threshold': {'type': 'float', 'required': False, 'default': 0.5,
                             'description': 'Threshold for section change detection'},
    }

    OUTPUTS = {
        'analysis': {'type': 'object', 'description': 'Complete audio analysis'},
        'markers': {'type': 'list', 'description': 'List of sync markers'},
        'tempo': {'type': 'float', 'description': 'Detected BPM'},
        'duration': {'type': 'float', 'description': 'Audio duration in seconds'},
        'beat_times': {'type': 'list', 'description': 'Beat timestamps'},
    }

    def _detect_speech_segments(self, y, sr) -> List[Tuple[float, float]]:
        """Detect speech segments using energy-based VAD"""
        import numpy as np
        import librosa

        # Calculate RMS energy in small frames
        frame_length = int(0.025 * sr)  # 25ms frames
        hop_length = int(0.010 * sr)  # 10ms hop

        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
        times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)

        # Simple threshold-based detection
        threshold = np.mean(rms) + 0.5 * np.std(rms)
        is_speech = rms > threshold

        # Find contiguous speech regions
        segments = []
        in_segment = False
        start = 0

        for i, active in enumerate(is_speech):
            if active and not in_segment:
                start = times[i]
                in_segment = True
            elif not active and in_segment:
                if times[i] - start > 0.1:  # Minimum 100ms
                    segments.append((start, times[i]))
                in_segment = False

        # Merge close segments
        merged = []
        for seg in segments:
            if merged and seg[0] - merged[-1][1] < 0.3:  # Merge if gap < 300ms
                merged[-1] = (merged[-1][0], seg[1])
            else:
                merged.append(seg)

        return merged

    def _detect_sections(self, y, sr, threshold: float) -> List[Dict]:
        """Detect structural sections using spectral features"""
        import numpy as np
        import librosa

        # Use MFCC for section detection
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)

        # Calculate novelty curve
        novelty = np.sum(np.abs(np.diff(mfccs, axis=1)), axis=0)
        novelty = novelty / np.max(novelty) if np.max(novelty) > 0 else novelty

        # Find peaks (section boundaries)
        from scipy.signal import find_peaks
        peaks, properties = find_peaks(novelty, height=threshold, distance=sr//512*10)

        times = librosa.frames_to_time(peaks, sr=sr)

        sections = []
        prev_time = 0.0
        for i, t in enumerate(times):
            sections.append({
                'start': prev_time,
                'end': t,
                'index': i,
                'duration': t - prev_time
            })
            prev_time = t

        # Add final section
        duration = len(y) / sr
        if prev_time < duration:
            sections.append({
                'start': prev_time,
                'end': duration,
                'index': len(sections),
                'duration': duration - prev_time
            })

        return sections

    def execute(self) -> Dict[str, Any]:
        import numpy as np
        import librosa

        errors = self.validate_inputs()
        if errors:
            raise ValueError(", ".join(errors))

        audio_path = self.inputs['audio_path']
        detect_speech = self.inputs.get('detect_speech', True)
        energy_hop_ms = self.inputs.get('energy_hop_ms', 50)
        min_beat_strength = self.inputs.get('min_beat_strength', 0.3)
        section_threshold = self.inputs.get('section_threshold', 0.5)

        if not Path(audio_path).exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        self.log_progress(5, f'Loading audio: {Path(audio_path).name}')

        # Load audio with librosa
        y, sr = librosa.load(audio_path, sr=None, mono=True)
        duration = len(y) / sr

        self.log_progress(15, f'Audio loaded: {duration:.1f}s @ {sr}Hz')

        # Beat and tempo detection
        self.log_progress(25, 'Detecting beats and tempo...')
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()

        # Convert tempo to float (it might be array)
        tempo = float(tempo) if hasattr(tempo, '__iter__') else tempo

        # Detect downbeats (measure starts)
        self.log_progress(35, 'Detecting downbeats...')
        try:
            # Use beat synchronous features for downbeat detection
            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            tempo_estimate, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)

            # Estimate downbeats (every 4 beats for 4/4 time)
            downbeat_indices = list(range(0, len(beat_times), 4))
            downbeats = [beat_times[i] for i in downbeat_indices if i < len(beat_times)]
        except Exception:
            downbeats = beat_times[::4] if beat_times else []

        # Energy curve calculation
        self.log_progress(45, 'Calculating energy curve...')
        hop_length = int(sr * energy_hop_ms / 1000)
        rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
        rms_times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)

        # Normalize energy
        rms_norm = rms / np.max(rms) if np.max(rms) > 0 else rms
        energy_curve = list(zip(rms_times.tolist(), rms_norm.tolist()))

        # Find energy peaks
        from scipy.signal import find_peaks
        energy_peaks, _ = find_peaks(rms_norm, height=0.7, distance=sr//hop_length//2)
        energy_peak_times = rms_times[energy_peaks].tolist()

        # Speech detection
        self.log_progress(55, 'Detecting speech segments...')
        speech_segments = []
        if detect_speech:
            speech_segments = self._detect_speech_segments(y, sr)

        # Section detection
        self.log_progress(65, 'Detecting sections...')
        sections = self._detect_sections(y, sr, section_threshold)

        # Build markers list
        self.log_progress(75, 'Building sync markers...')
        markers = []

        # Beat markers
        beat_strengths = librosa.onset.onset_strength(y=y, sr=sr)
        for i, bt in enumerate(beat_times):
            frame_idx = librosa.time_to_frames(bt, sr=sr)
            strength = float(beat_strengths[frame_idx]) if frame_idx < len(beat_strengths) else 0.5
            strength = min(1.0, strength / np.max(beat_strengths)) if np.max(beat_strengths) > 0 else 0.5

            if strength >= min_beat_strength:
                markers.append(AudioMarker(
                    time=bt,
                    type='beat',
                    strength=strength,
                    data={'index': i}
                ))

        # Downbeat markers (stronger)
        for i, dt in enumerate(downbeats):
            markers.append(AudioMarker(
                time=dt,
                type='downbeat',
                strength=1.0,
                data={'measure': i}
            ))

        # Energy peak markers
        for pt in energy_peak_times:
            markers.append(AudioMarker(
                time=pt,
                type='energy_peak',
                strength=0.9,
            ))

        # Speech markers
        for start, end in speech_segments:
            markers.append(AudioMarker(
                time=start,
                type='speech_start',
                strength=0.8,
            ))
            markers.append(AudioMarker(
                time=end,
                type='speech_end',
                strength=0.6,
            ))

        # Section markers
        for sec in sections:
            if sec['start'] > 0:  # Skip first section start
                markers.append(AudioMarker(
                    time=sec['start'],
                    type='section',
                    strength=1.0,
                    data=sec
                ))

        # Sort markers by time
        markers.sort(key=lambda m: m.time)

        self.log_progress(90, 'Building analysis result...')

        analysis = AudioAnalysis(
            duration=duration,
            sample_rate=sr,
            tempo=tempo,
            beats=beat_times,
            downbeats=downbeats,
            energy_curve=energy_curve,
            markers=markers,
            sections=sections,
            speech_segments=speech_segments,
        )

        self.outputs = {
            'analysis': analysis,
            'markers': markers,
            'tempo': tempo,
            'duration': duration,
            'beat_times': beat_times,
        }

        self.log_progress(100, f'Analysis complete: {len(beat_times)} beats, {tempo:.1f} BPM')
        return self.outputs


class VisualSyncNode(BaseNode):
    """Sync visual elements to audio timeline.

    Takes audio analysis and visual assets, creates a synchronized timeline
    with transitions matched to audio events.
    """

    NODE_ID = "visual_sync"
    NODE_NAME = "Visual Sync"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Sync visuals to audio markers with transitions"

    INPUTS = {
        'analysis': {'type': 'object', 'required': True, 'description': 'AudioAnalysis from AudioAnalyzerNode'},
        'images': {'type': 'list', 'required': True, 'description': 'List of image paths or PIL Images'},
        'transition_mode': {'type': 'string', 'required': False, 'default': 'beat_sync',
                          'options': ['beat_sync', 'energy_sync', 'section_sync', 'uniform']},
        'min_segment_duration': {'type': 'float', 'required': False, 'default': 2.0,
                                'description': 'Minimum duration per visual in seconds'},
        'max_segment_duration': {'type': 'float', 'required': False, 'default': 8.0,
                                'description': 'Maximum duration per visual in seconds'},
        'transition_style': {'type': 'string', 'required': False, 'default': 'crossfade',
                           'options': ['cut', 'crossfade', 'fade_black', 'zoom_morph', 'ken_burns']},
        'transition_duration': {'type': 'float', 'required': False, 'default': 0.5,
                               'description': 'Duration of transitions in seconds'},
        'energy_scaling': {'type': 'bool', 'required': False, 'default': True,
                          'description': 'Scale visual intensity with audio energy'},
    }

    OUTPUTS = {
        'timeline': {'type': 'list', 'description': 'List of timeline segments'},
        'total_duration': {'type': 'float'},
        'segment_count': {'type': 'int'},
    }

    def _select_sync_points(self, analysis: AudioAnalysis, mode: str,
                           min_dur: float, max_dur: float) -> List[float]:
        """Select sync points based on mode"""

        if mode == 'uniform':
            # Simple uniform distribution
            count = max(1, int(analysis.duration / ((min_dur + max_dur) / 2)))
            return [i * analysis.duration / count for i in range(count)]

        elif mode == 'section_sync':
            # Sync to section boundaries
            points = [0.0]
            for sec in analysis.sections:
                if sec['start'] not in points and sec['start'] > 0:
                    points.append(sec['start'])
            return sorted(points)

        elif mode == 'energy_sync':
            # Sync to energy peaks
            points = [0.0]
            for marker in analysis.markers:
                if marker.type == 'energy_peak':
                    # Check minimum distance from last point
                    if marker.time - points[-1] >= min_dur:
                        points.append(marker.time)
            return points

        else:  # beat_sync (default)
            # Sync to downbeats, respecting duration constraints
            points = [0.0]

            # Prefer downbeats, fall back to regular beats
            candidates = analysis.downbeats if analysis.downbeats else analysis.beats

            for t in candidates:
                gap = t - points[-1]
                if gap >= min_dur:
                    if gap <= max_dur or len(points) == 1:
                        points.append(t)
                elif gap > max_dur:
                    # Insert intermediate point
                    mid = points[-1] + max_dur
                    points.append(mid)

            # Ensure we don't exceed max duration for last segment
            if analysis.duration - points[-1] > max_dur:
                points.append(analysis.duration - max_dur/2)

            return points

    def _get_energy_at_time(self, analysis: AudioAnalysis, time: float) -> float:
        """Get interpolated energy value at specific time"""
        if not analysis.energy_curve:
            return 0.5

        # Find surrounding energy points
        prev_e = (0.0, 0.5)
        next_e = (analysis.duration, 0.5)

        for t, e in analysis.energy_curve:
            if t <= time:
                prev_e = (t, e)
            else:
                next_e = (t, e)
                break

        # Linear interpolation
        if next_e[0] == prev_e[0]:
            return prev_e[1]

        ratio = (time - prev_e[0]) / (next_e[0] - prev_e[0])
        return prev_e[1] + ratio * (next_e[1] - prev_e[1])

    def execute(self) -> Dict[str, Any]:
        errors = self.validate_inputs()
        if errors:
            raise ValueError(", ".join(errors))

        analysis = self.inputs['analysis']
        images = self.inputs['images']
        mode = self.inputs.get('transition_mode', 'beat_sync')
        min_dur = self.inputs.get('min_segment_duration', 2.0)
        max_dur = self.inputs.get('max_segment_duration', 8.0)
        trans_style = self.inputs.get('transition_style', 'crossfade')
        trans_dur = self.inputs.get('transition_duration', 0.5)
        energy_scaling = self.inputs.get('energy_scaling', True)

        if not images:
            raise ValueError("No images provided")

        self.log_progress(10, f'Creating timeline for {len(images)} images')

        # Get sync points
        sync_points = self._select_sync_points(analysis, mode, min_dur, max_dur)

        # Ensure we have enough sync points for all images
        while len(sync_points) < len(images):
            # Add more points by subdividing largest gap
            gaps = [(sync_points[i+1] - sync_points[i], i)
                    for i in range(len(sync_points)-1)]
            if not gaps:
                sync_points.append(analysis.duration)
                continue

            gaps.sort(reverse=True)
            largest_gap, idx = gaps[0]
            mid = (sync_points[idx] + sync_points[idx+1]) / 2
            sync_points.insert(idx+1, mid)

        # Add end point if not present
        if sync_points[-1] < analysis.duration:
            sync_points.append(analysis.duration)

        self.log_progress(40, f'Generated {len(sync_points)} sync points')

        # Build timeline segments
        timeline = []
        image_idx = 0

        for i in range(len(sync_points) - 1):
            start = sync_points[i]
            end = sync_points[i + 1]
            duration = end - start

            # Cycle through images
            image = images[image_idx % len(images)]
            image_idx += 1

            # Calculate average energy for this segment
            if energy_scaling:
                mid_time = (start + end) / 2
                energy = self._get_energy_at_time(analysis, mid_time)
            else:
                energy = 0.5

            # Determine effect based on energy
            if energy > 0.8:
                effect = 'zoom_in'
                effect_strength = 1.2
            elif energy > 0.5:
                effect = 'ken_burns'
                effect_strength = 1.0
            else:
                effect = 'subtle_motion'
                effect_strength = 0.5

            # Check for markers in this segment
            segment_markers = [m for m in analysis.markers
                             if start <= m.time < end]

            segment = {
                'index': i,
                'start': start,
                'end': end,
                'duration': duration,
                'image': image,
                'image_index': (image_idx - 1) % len(images),
                'transition_in': trans_style if i > 0 else 'none',
                'transition_out': trans_style if i < len(sync_points) - 2 else 'fade_black',
                'transition_duration': trans_dur,
                'effect': effect,
                'effect_strength': effect_strength,
                'energy': energy,
                'markers': [m.to_dict() for m in segment_markers],
            }

            timeline.append(segment)

            self.log_progress(40 + int(50 * (i + 1) / len(sync_points)),
                            f'Segment {i+1}/{len(sync_points)-1}')

        self.outputs = {
            'timeline': timeline,
            'total_duration': analysis.duration,
            'segment_count': len(timeline),
        }

        self.log_progress(100, f'Timeline created: {len(timeline)} segments')
        return self.outputs


class MusicVideoNode(BaseNode):
    """Orchestrate the complete VideoPoesia pipeline.

    Combines audio analysis, image generation, and video synthesis
    to create music-synced videos.
    """

    NODE_ID = "music_video"
    NODE_NAME = "Music Video Generator"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Generate complete music video from audio and prompts"

    INPUTS = {
        'audio_path': {'type': 'string', 'required': True, 'description': 'Path to WAV audio file'},
        'style_prompt': {'type': 'string', 'required': True,
                        'description': 'Visual style (e.g., "dreamy watercolor", "dark surrealist")'},
        'narrative_prompt': {'type': 'string', 'required': False, 'default': '',
                           'description': 'Story/narrative to visualize'},
        'reference_images': {'type': 'list', 'required': False, 'default': [],
                           'description': 'Style reference images (paths or PIL Images)'},
        'num_keyframes': {'type': 'int', 'required': False, 'default': 8,
                         'description': 'Number of keyframes to generate'},
        'resolution': {'type': 'string', 'required': False, 'default': '1920x1080',
                      'options': ['1920x1080', '1080x1920', '1080x1080', '3840x2160']},
        'fps': {'type': 'int', 'required': False, 'default': 30, 'options': [24, 30, 60]},
        'image_generator': {'type': 'string', 'required': False, 'default': 'pixart',
                          'options': ['pixart', 'sdxl_turbo']},
        'use_img2vid': {'type': 'bool', 'required': False, 'default': False,
                       'description': 'Use LTX-Video for animated segments'},
        'transition_style': {'type': 'string', 'required': False, 'default': 'crossfade',
                           'options': ['cut', 'crossfade', 'fade_black', 'ken_burns']},
    }

    OUTPUTS = {
        'video_path': {'type': 'string'},
        'duration': {'type': 'float'},
        'keyframes': {'type': 'list'},
        'timeline': {'type': 'list'},
    }

    def _generate_prompts(self, style: str, narrative: str,
                         num_frames: int, sections: List[Dict]) -> List[str]:
        """Generate varied prompts for each keyframe"""
        prompts = []

        # Base elements
        style_base = style.strip()
        narrative_elements = [e.strip() for e in narrative.split(',') if e.strip()]

        # If no narrative, generate abstract variations
        if not narrative_elements:
            variations = [
                "ethereal landscape",
                "abstract flowing forms",
                "cosmic patterns",
                "organic textures",
                "dreamlike atmosphere",
                "surreal composition",
                "mystical elements",
                "emotional expression",
            ]
        else:
            variations = narrative_elements

        # Generate prompts cycling through variations
        for i in range(num_frames):
            variation = variations[i % len(variations)]

            # Add section-specific modifiers
            if sections and i < len(sections):
                section_idx = sections[i % len(sections)].get('index', 0)
                if section_idx == 0:
                    modifier = "opening, establishing"
                elif section_idx == len(sections) - 1:
                    modifier = "closing, resolution"
                else:
                    modifier = "development, transition"
            else:
                modifier = ""

            prompt = f"{variation}, {style_base}"
            if modifier:
                prompt = f"{prompt}, {modifier}"

            prompts.append(prompt)

        return prompts

    def _generate_images(self, prompts: List[str], generator: str,
                        reference_images: List = None) -> List[str]:
        """Generate keyframe images"""
        from .image_nodes_v2 import PixArtNode, SDXLTurboNode

        generated_paths = []

        NodeClass = PixArtNode if generator == 'pixart' else SDXLTurboNode

        for i, prompt in enumerate(prompts):
            self.log_progress(20 + int(30 * i / len(prompts)),
                            f'Generating image {i+1}/{len(prompts)}')

            node = NodeClass()
            node.set_input('prompt', prompt)

            if generator == 'pixart':
                node.set_input('width', 1024)
                node.set_input('height', 1024)
                node.set_input('steps', 20)
                node.set_input('style_preset', 'none')  # We already have style in prompt
            else:
                node.set_input('width', 512)
                node.set_input('height', 512)
                node.set_input('steps', 4)

            result = node.execute()
            generated_paths.append(result['image_path'])

            clear_memory()

        return generated_paths

    def _create_video_segment(self, image_path: str, duration: float,
                             effect: str, resolution: str, fps: int,
                             fade_in: float = 0.0, fade_out: float = 0.0) -> str:
        """Create video segment from single image using FFmpeg"""
        from .video_nodes_v2 import FFmpegNodeV2

        node = FFmpegNodeV2()
        node.set_input('input_path', image_path)
        node.set_input('effect', effect)
        node.set_input('duration', duration)
        node.set_input('resolution', resolution)
        node.set_input('fps', fps)
        node.set_input('fade_in', fade_in)
        node.set_input('fade_out', fade_out)
        node.set_input('use_hw_accel', True)

        result = node.execute()
        return result['video_path']

    def _concatenate_with_transitions(self, segments: List[str],
                                      timeline: List[Dict],
                                      audio_path: str,
                                      output_path: str,
                                      transition_style: str) -> str:
        """Concatenate video segments with transitions and audio"""

        if transition_style == 'cut':
            # Simple concat
            concat_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
            for seg in segments:
                concat_file.write(f"file '{seg}'\n")
            concat_file.close()

            cmd = [
                'ffmpeg', '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', concat_file.name,
                '-i', audio_path,
                '-c:v', 'h264_videotoolbox',
                '-q:v', '65',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-map', '0:v',
                '-map', '1:a',
                '-shortest',
                str(output_path)
            ]

            subprocess.run(cmd, check=True, capture_output=True)
            os.unlink(concat_file.name)

        else:
            # Use xfade for crossfade transitions
            if len(segments) < 2:
                # Single segment, just add audio
                cmd = [
                    'ffmpeg', '-y',
                    '-i', segments[0],
                    '-i', audio_path,
                    '-c:v', 'h264_videotoolbox',
                    '-q:v', '65',
                    '-c:a', 'aac',
                    '-map', '0:v',
                    '-map', '1:a',
                    '-shortest',
                    str(output_path)
                ]
                subprocess.run(cmd, check=True, capture_output=True)
            else:
                # Build complex filter for crossfades
                filter_parts = []
                prev_output = "[0:v]"

                for i in range(1, len(segments)):
                    offset = sum(timeline[j]['duration'] for j in range(i)) - 0.5 * i
                    offset = max(0, offset)

                    cur_input = f"[{i}:v]"
                    cur_output = f"[v{i}]" if i < len(segments) - 1 else "[vout]"

                    filter_parts.append(
                        f"{prev_output}{cur_input}xfade=transition=fade:duration=0.5:offset={offset:.2f}{cur_output}"
                    )
                    prev_output = cur_output

                filter_complex = ";".join(filter_parts)

                # Build input arguments
                inputs = []
                for seg in segments:
                    inputs.extend(['-i', seg])
                inputs.extend(['-i', audio_path])

                cmd = [
                    'ffmpeg', '-y',
                    *inputs,
                    '-filter_complex', filter_complex,
                    '-map', '[vout]',
                    '-map', f'{len(segments)}:a',
                    '-c:v', 'h264_videotoolbox',
                    '-q:v', '65',
                    '-c:a', 'aac',
                    '-b:a', '192k',
                    '-shortest',
                    str(output_path)
                ]

                try:
                    subprocess.run(cmd, check=True, capture_output=True)
                except subprocess.CalledProcessError:
                    # Fallback to simple concat if xfade fails
                    self.log_progress(85, 'Falling back to simple concat...')
                    concat_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
                    for seg in segments:
                        concat_file.write(f"file '{seg}'\n")
                    concat_file.close()

                    cmd = [
                        'ffmpeg', '-y',
                        '-f', 'concat',
                        '-safe', '0',
                        '-i', concat_file.name,
                        '-i', audio_path,
                        '-c:v', 'h264_videotoolbox',
                        '-q:v', '65',
                        '-c:a', 'aac',
                        '-map', '0:v',
                        '-map', '1:a',
                        '-shortest',
                        str(output_path)
                    ]
                    subprocess.run(cmd, check=True, capture_output=True)
                    os.unlink(concat_file.name)

        return str(output_path)

    def execute(self) -> Dict[str, Any]:
        errors = self.validate_inputs()
        if errors:
            raise ValueError(", ".join(errors))

        audio_path = self.inputs['audio_path']
        style_prompt = self.inputs['style_prompt']
        narrative_prompt = self.inputs.get('narrative_prompt', '')
        reference_images = self.inputs.get('reference_images', [])
        num_keyframes = self.inputs.get('num_keyframes', 8)
        resolution = self.inputs.get('resolution', '1920x1080')
        fps = self.inputs.get('fps', 30)
        generator = self.inputs.get('image_generator', 'pixart')
        transition_style = self.inputs.get('transition_style', 'crossfade')

        self.log_progress(5, 'Starting VideoPoesia generation...')

        # Step 1: Analyze audio
        self.log_progress(10, 'Analyzing audio...')
        analyzer = AudioAnalyzerNode()
        analyzer.set_input('audio_path', audio_path)
        audio_result = analyzer.execute()

        analysis = audio_result['analysis']
        self.log_progress(15, f'Audio: {analysis.duration:.1f}s, {analysis.tempo:.1f} BPM')

        # Step 2: Generate prompts
        self.log_progress(18, 'Generating prompts...')
        prompts = self._generate_prompts(
            style_prompt,
            narrative_prompt,
            num_keyframes,
            analysis.sections
        )

        # Step 3: Generate keyframe images
        self.log_progress(20, f'Generating {num_keyframes} keyframes...')
        keyframe_paths = self._generate_images(prompts, generator, reference_images)

        # Step 4: Create visual timeline
        self.log_progress(55, 'Creating sync timeline...')
        sync_node = VisualSyncNode()
        sync_node.set_input('analysis', analysis)
        sync_node.set_input('images', keyframe_paths)
        sync_node.set_input('transition_mode', 'beat_sync')
        sync_node.set_input('transition_style', transition_style)
        sync_result = sync_node.execute()

        timeline = sync_result['timeline']

        # Step 5: Create video segments
        self.log_progress(60, 'Creating video segments...')
        video_segments = []

        # Map resolution to FFmpeg format
        width, height = map(int, resolution.split('x'))
        ffmpeg_res = f"{height}x{width}" if width > height else resolution

        for i, seg in enumerate(timeline):
            self.log_progress(60 + int(20 * i / len(timeline)),
                            f'Processing segment {i+1}/{len(timeline)}')

            # Determine fades
            fade_in = seg['transition_duration'] if seg['transition_in'] != 'none' else 0.0
            fade_out = seg['transition_duration'] if seg['transition_out'] != 'none' else 0.0

            # Get image path
            img_path = seg['image'] if isinstance(seg['image'], str) else keyframe_paths[seg['image_index']]

            # Create segment
            seg_path = self._create_video_segment(
                img_path,
                seg['duration'],
                seg['effect'],
                ffmpeg_res,
                fps,
                fade_in,
                fade_out
            )
            video_segments.append(seg_path)

        # Step 6: Concatenate with audio
        self.log_progress(82, 'Compositing final video...')

        output_dir = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs/videos')
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'videopoesia_{timestamp}.mp4'

        final_path = self._concatenate_with_transitions(
            video_segments,
            timeline,
            audio_path,
            output_path,
            transition_style
        )

        # Cleanup temporary segments
        self.log_progress(95, 'Cleaning up...')
        for seg in video_segments:
            try:
                Path(seg).unlink()
            except Exception:
                pass

        clear_memory()

        self.outputs = {
            'video_path': final_path,
            'duration': analysis.duration,
            'keyframes': keyframe_paths,
            'timeline': timeline,
        }

        self.log_progress(100, f'Done: {Path(final_path).name}')
        return self.outputs


# Node registry
MUSIC_VIDEO_NODES = {
    'audio_analyzer': AudioAnalyzerNode,
    'visual_sync': VisualSyncNode,
    'music_video': MusicVideoNode,
}
