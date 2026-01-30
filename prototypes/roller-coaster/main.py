#!/usr/bin/env python3
"""
🎢 Roller Coaster Prototype - Main Entry Point
Professional physics simulation with GPU acceleration

Usage:
    python main.py              # Generate demo track + simulation
    python main.py --export     # Export to Blender-ready format
    python main.py --benchmark  # Run GPU benchmarks
"""
import sys
import json
import numpy as np
from pathlib import Path

# Add module paths
sys.path.insert(0, str(Path(__file__).parent))

from core.vector_math import normalize, cross
from physics.dynamics import PhysicsEngine, BatchedPhysics, CoasterParams, CoasterState
from track.generator import TrackBuilder, Track, create_demo_track
from camera.pov import POVCamera, BatchedCamera, CameraSettings
from gpu.tinygrad_backend import GPUOps, GPUPhysics, GPURenderer, benchmark_gpu, TINYGRAD_AVAILABLE

def create_pro_track() -> Track:
    """
    Create a professional-grade roller coaster track
    Inspired by real coasters like Fury 325, Steel Vengeance
    """
    builder = TrackBuilder(points_per_meter=4.0)
    
    track = (builder
        # Station and launch
        .straight(15)
        .lift_hill(height=50)          # Tall lift for max speed
        
        # First drop - the money shot
        .drop(height=48, angle=85)     # Near-vertical!
        
        # Speed elements
        .airtime_hill(height=12)       # First airtime
        .banked_turn(radius=25, angle=90, bank=70)
        
        # Inversions
        .loop(radius=14)               # Vertical loop
        .straight(10)
        .corkscrew(length=30, twist=720)  # Double corkscrew!
        
        # More airtime
        .airtime_hill(height=8)
        .airtime_hill(height=6)
        
        # High-G helix
        .helix(radius=15, turns=2, height_change=-20)
        
        # Final elements
        .banked_turn(radius=20, angle=180, bank=60)
        .airtime_hill(height=5)
        
        # Brake run
        .brake_run(40)
        .straight(20)
        
        .build()
    )
    
    return track


def simulate_ride(track: Track, verbose: bool = True) -> dict:
    """
    Run full physics simulation on the track
    """
    if verbose:
        print("\n🔬 Physics Simulation")
        print("=" * 50)
    
    # Physics parameters (realistic coaster)
    params = CoasterParams(
        mass=8000.0,           # 8 tons (train + passengers)
        drag_coefficient=0.4,
        frontal_area=5.0,
        rolling_resistance=0.008,
        wheel_friction=0.015
    )
    
    physics = BatchedPhysics(params)
    
    # Simulate!
    states = physics.simulate_full_ride(
        track.points,
        track.tangents,
        track.normals,
        initial_speed=2.0  # Slow start from station
    )
    
    if verbose:
        # Analyze results
        speeds = physics.compute_speed_profile(states)
        g_forces = physics.compute_g_force_profile(states)
        max_g, max_g_idx = physics.find_max_g(states)
        
        print(f"Track length: {track.total_length:.0f}m")
        print(f"Ride time: {states[-1].time:.1f}s")
        print(f"Max speed: {np.max(speeds):.1f} m/s ({np.max(speeds) * 3.6:.0f} km/h)")
        print(f"Max G-force: {max_g:.2f}G at point {max_g_idx}")
        print(f"Max vertical G: {np.max(g_forces[:, 1]):.2f}G")
        print(f"Min vertical G (airtime): {np.min(g_forces[:, 1]):.2f}G")
        print(f"Max lateral G: {np.max(np.abs(g_forces[:, 0])):.2f}G")
    
    return {
        'states': states,
        'speeds': speeds,
        'g_forces': g_forces
    }


def generate_camera_data(states: list, verbose: bool = True) -> dict:
    """
    Generate POV camera data for the entire ride
    """
    if verbose:
        print("\n🎬 Camera System")
        print("=" * 50)
    
    settings = CameraSettings(
        base_fov=70.0,
        speed_fov_factor=0.4,
        max_fov=110.0,
        motion_blur_enabled=True
    )
    
    camera = BatchedCamera(settings)
    frames = camera.compute_all_frames(states)
    
    if verbose:
        fovs = [f.fov for f in frames]
        blur_frames = sum(1 for f in frames if f.motion_blur > 0)
        
        print(f"Total frames: {len(frames)}")
        print(f"FOV range: {min(fovs):.0f}° - {max(fovs):.0f}°")
        print(f"Motion blur frames: {blur_frames} ({100*blur_frames/len(frames):.0f}%)")
    
    return camera.export_camera_data(frames)


def export_to_blender(track: Track, simulation: dict, camera_data: dict,
                     output_dir: str = "blender_export"):
    """
    Export everything for Blender import
    """
    print("\n📦 Exporting for Blender")
    print("=" * 50)
    
    out_path = Path(output_dir)
    out_path.mkdir(exist_ok=True)
    
    # Export track points
    np.save(out_path / "track_points.npy", track.points)
    np.save(out_path / "track_tangents.npy", track.tangents)
    np.save(out_path / "track_normals.npy", track.normals)
    np.save(out_path / "track_bank_angles.npy", track.bank_angles)
    
    # Export camera data
    np.save(out_path / "camera_positions.npy", camera_data['positions'])
    np.save(out_path / "camera_look_at.npy", camera_data['look_at'])
    np.save(out_path / "camera_fov.npy", camera_data['fov'])
    np.save(out_path / "camera_roll.npy", camera_data['roll'])
    
    # Export physics data
    speeds = simulation['speeds']
    g_forces = simulation['g_forces']
    np.save(out_path / "physics_speeds.npy", speeds)
    np.save(out_path / "physics_g_forces.npy", g_forces)
    
    # Generate rail mesh
    vertices, faces = GPURenderer.generate_rail_mesh(track.points)
    np.save(out_path / "rail_vertices.npy", vertices)
    np.save(out_path / "rail_faces.npy", faces)
    
    # Generate support positions  
    supports = GPURenderer.generate_support_positions(track.points, interval=15.0)
    support_data = [{'top': s['top'].tolist(), 'bottom': s['bottom'].tolist()} 
                   for s in supports]
    with open(out_path / "supports.json", 'w') as f:
        json.dump(support_data, f, indent=2)
    
    # Export metadata
    metadata = {
        'track_length': track.total_length,
        'num_points': len(track.points),
        'ride_time': simulation['states'][-1].time,
        'max_speed_ms': float(np.max(speeds)),
        'max_speed_kmh': float(np.max(speeds) * 3.6),
        'max_g': float(np.max([np.linalg.norm(g) for g in g_forces])),
        'num_supports': len(supports),
        'gpu_accelerated': TINYGRAD_AVAILABLE
    }
    with open(out_path / "metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✅ Exported to {out_path}/")
    print(f"   - Track: {len(track.points)} points")
    print(f"   - Camera: {len(camera_data['positions'])} frames")
    print(f"   - Rails: {len(vertices)} vertices")
    print(f"   - Supports: {len(supports)} columns")
    
    return out_path


def main():
    """Main entry point"""
    print("🎢 ROLLER COASTER PROTOTYPE")
    print("=" * 50)
    print(f"GPU Acceleration: {'✅ Radeon 7900 XT' if TINYGRAD_AVAILABLE else '❌ NumPy fallback'}")
    
    # Check for arguments
    if "--benchmark" in sys.argv:
        print("\n⚡ GPU Benchmark Mode")
        benchmark_gpu()
        return
    
    # Generate track
    print("\n🛤️ Generating Track")
    print("=" * 50)
    
    track = create_pro_track()
    print(f"Track generated: {len(track.points)} points, {track.total_length:.0f}m")
    
    # Height profile
    heights = track.points[:, 2]
    print(f"Height range: {heights.min():.1f}m - {heights.max():.1f}m")
    
    # Simulate physics
    simulation = simulate_ride(track)
    
    # Generate camera data
    camera_data = generate_camera_data(simulation['states'])
    
    # Export for Blender
    if "--export" in sys.argv or True:  # Always export for now
        export_path = export_to_blender(track, simulation, camera_data)
    
    print("\n🎉 Prototype Complete!")
    print("=" * 50)
    print("Next steps:")
    print("1. Run `python blender_import.py` in Blender")
    print("2. Set up Cycles rendering for Radeon 7900 XT")
    print("3. Render POV animation")


if __name__ == "__main__":
    main()
