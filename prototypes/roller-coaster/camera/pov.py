"""
POV Camera System - GPU-Ready
Professional camera effects for ride-along videos
"""
import numpy as np
from dataclasses import dataclass
from typing import List, Optional, Tuple
import sys
sys.path.append('..')
from core.vector_math import normalize, lerp, cross, Array
from physics.dynamics import CoasterState

@dataclass
class CameraFrame:
    """A single camera frame"""
    position: Array        # Camera position
    look_at: Array         # Look-at point
    up: Array              # Up vector
    fov: float            # Field of view (degrees)
    roll: float           # Roll angle (degrees)
    shake: Array          # Camera shake offset
    motion_blur: float    # Motion blur amount (0-1)
    
@dataclass
class CameraSettings:
    """Camera configuration"""
    # Position offsets from coaster
    height_offset: float = 1.5       # Eye height above track
    forward_offset: float = 0.5      # Look ahead distance
    
    # FOV settings
    base_fov: float = 75.0           # Base field of view
    speed_fov_factor: float = 0.3    # FOV increase per m/s
    max_fov: float = 120.0           # Maximum FOV
    
    # Shake settings
    base_shake: float = 0.01         # Base shake amount
    speed_shake_factor: float = 0.002  # Shake increase with speed
    g_shake_factor: float = 0.03     # Shake from G-forces
    
    # Smoothing
    position_smoothing: float = 0.8  # Position lerp factor
    rotation_smoothing: float = 0.7  # Rotation lerp factor
    
    # Motion blur
    motion_blur_enabled: bool = True
    motion_blur_speed_threshold: float = 10.0  # m/s to start blur

class POVCamera:
    """
    First-person POV camera following the coaster
    GPU-friendly: all operations vectorized
    """
    
    def __init__(self, settings: Optional[CameraSettings] = None):
        self.settings = settings or CameraSettings()
        self.prev_frame: Optional[CameraFrame] = None
        
    def compute_frame(self, state: CoasterState, 
                     next_state: Optional[CoasterState] = None) -> CameraFrame:
        """Compute camera frame for current coaster state"""
        s = self.settings
        
        # Base position: on the track, elevated to eye height
        position = state.position + state.normal * s.height_offset
        
        # Look-at point: ahead along track
        if next_state:
            look_at = next_state.position + next_state.normal * s.height_offset
        else:
            look_at = position + state.tangent * 10.0
        
        # Up vector: track normal, adjusted for banking
        up = state.normal
        
        # FOV: increases with speed for intensity
        speed_factor = min(state.speed * s.speed_fov_factor, s.max_fov - s.base_fov)
        fov = s.base_fov + speed_factor
        
        # Roll: from track banking and lateral G-forces
        roll = np.degrees(np.arctan2(state.g_force[0], state.g_force[1] + 0.01))
        roll = np.clip(roll, -45, 45)  # Limit roll
        
        # Camera shake: based on speed and G-forces
        shake = self._compute_shake(state)
        
        # Motion blur
        motion_blur = 0.0
        if s.motion_blur_enabled and state.speed > s.motion_blur_speed_threshold:
            motion_blur = min((state.speed - s.motion_blur_speed_threshold) / 20.0, 1.0)
        
        frame = CameraFrame(
            position=position + shake,
            look_at=look_at,
            up=up,
            fov=fov,
            roll=roll,
            shake=shake,
            motion_blur=motion_blur
        )
        
        # Apply smoothing
        if self.prev_frame is not None:
            frame = self._smooth_frame(frame, self.prev_frame)
        
        self.prev_frame = frame
        return frame
    
    def _compute_shake(self, state: CoasterState) -> Array:
        """Compute realistic camera shake"""
        s = self.settings
        
        # Base noise
        t = state.time * 20  # Frequency
        noise_x = np.sin(t * 7.3) * np.cos(t * 3.7)
        noise_y = np.sin(t * 5.1) * np.cos(t * 4.3)
        noise_z = np.sin(t * 6.7) * np.cos(t * 2.9)
        noise = np.array([noise_x, noise_y, noise_z])
        
        # Scale by speed
        speed_scale = s.base_shake + state.speed * s.speed_shake_factor
        
        # Scale by G-forces (more shake in intense moments)
        g_magnitude = np.linalg.norm(state.g_force)
        g_scale = 1.0 + (g_magnitude - 1.0) * s.g_shake_factor
        
        return noise * speed_scale * g_scale
    
    def _smooth_frame(self, current: CameraFrame, 
                      previous: CameraFrame) -> CameraFrame:
        """Smooth camera movement between frames"""
        s = self.settings
        
        return CameraFrame(
            position=lerp(previous.position, current.position, s.position_smoothing),
            look_at=lerp(previous.look_at, current.look_at, s.rotation_smoothing),
            up=normalize(lerp(previous.up, current.up, s.rotation_smoothing)),
            fov=lerp(previous.fov, current.fov, s.rotation_smoothing),
            roll=lerp(previous.roll, current.roll, s.rotation_smoothing),
            shake=current.shake,  # Don't smooth shake
            motion_blur=lerp(previous.motion_blur, current.motion_blur, 0.5)
        )
    
    def reset(self):
        """Reset camera state (for new ride)"""
        self.prev_frame = None


class ExternalCamera:
    """
    External/cinematic camera views
    For beauty shots and promotional footage
    """
    
    @staticmethod
    def orbit_shot(center: Array, radius: float, height: float,
                   angle: float) -> Tuple[Array, Array, Array]:
        """
        Orbiting camera around a point
        Returns: (position, look_at, up)
        """
        rad = np.radians(angle)
        position = center + np.array([
            radius * np.cos(rad),
            radius * np.sin(rad),
            height
        ])
        return position, center, np.array([0, 0, 1])
    
    @staticmethod
    def tracking_shot(track_points: Array, coaster_pos: Array,
                     offset: Array = np.array([20, 0, 5])) -> Tuple[Array, Array, Array]:
        """
        Camera tracks coaster from fixed offset
        """
        position = coaster_pos + offset
        return position, coaster_pos, np.array([0, 0, 1])
    
    @staticmethod
    def flyby_shot(coaster_pos: Array, path_t: float,
                  path_points: Array) -> Tuple[Array, Array, Array]:
        """
        Camera follows its own path while looking at coaster
        """
        # Interpolate camera position along path
        idx = int(path_t * (len(path_points) - 1))
        idx = min(idx, len(path_points) - 2)
        t_local = path_t * (len(path_points) - 1) - idx
        
        position = lerp(path_points[idx], path_points[idx + 1], t_local)
        return position, coaster_pos, np.array([0, 0, 1])


class BatchedCamera:
    """
    GPU-Optimized: Compute all camera frames at once
    Perfect for pre-rendering entire ride
    """
    
    def __init__(self, settings: Optional[CameraSettings] = None):
        self.camera = POVCamera(settings)
        
    def compute_all_frames(self, states: List[CoasterState]) -> List[CameraFrame]:
        """
        Compute all camera frames in batch
        Can be parallelized on GPU
        """
        self.camera.reset()
        frames = []
        
        for i, state in enumerate(states):
            next_state = states[i + 1] if i < len(states) - 1 else None
            frame = self.camera.compute_frame(state, next_state)
            frames.append(frame)
            
        return frames
    
    def export_camera_data(self, frames: List[CameraFrame]) -> dict:
        """
        Export camera data for Blender/rendering
        """
        return {
            'positions': np.array([f.position for f in frames]),
            'look_at': np.array([f.look_at for f in frames]),
            'up': np.array([f.up for f in frames]),
            'fov': np.array([f.fov for f in frames]),
            'roll': np.array([f.roll for f in frames]),
            'motion_blur': np.array([f.motion_blur for f in frames])
        }
