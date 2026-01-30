"""
Roller Coaster Physics - GPU-Ready Dynamics
Real physics simulation for professional results
"""
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple, Optional
import sys
sys.path.append('..')
from core.vector_math import normalize, dot, cross, Array

# Physical constants
GRAVITY = 9.81  # m/s²
AIR_DENSITY = 1.225  # kg/m³

@dataclass
class CoasterState:
    """State of the coaster at a point in time"""
    position: Array          # 3D position (m)
    velocity: Array          # 3D velocity (m/s)
    speed: float            # Scalar speed (m/s)
    tangent: Array          # Track tangent (normalized)
    normal: Array           # Track normal (normalized)
    binormal: Array         # Track binormal (normalized)
    g_force: Array          # G-forces (lateral, vertical, longitudinal)
    time: float             # Simulation time (s)
    distance: float         # Distance along track (m)

@dataclass  
class CoasterParams:
    """Physical parameters of the coaster"""
    mass: float = 5000.0           # Total mass (kg)
    drag_coefficient: float = 0.5  # Aerodynamic drag
    frontal_area: float = 4.0      # m²
    rolling_resistance: float = 0.01  # Coefficient
    wheel_friction: float = 0.02   # Track friction
    
    def get_drag_force(self, speed: float) -> float:
        """Air resistance: F = 0.5 * ρ * v² * Cd * A"""
        return 0.5 * AIR_DENSITY * speed**2 * self.drag_coefficient * self.frontal_area
    
    def get_friction_force(self) -> float:
        """Rolling resistance + wheel friction"""
        return self.mass * GRAVITY * (self.rolling_resistance + self.wheel_friction)

class PhysicsEngine:
    """
    GPU-Ready Physics Engine
    All computations use vectorized operations for easy TinyGrad porting
    """
    
    def __init__(self, params: Optional[CoasterParams] = None):
        self.params = params or CoasterParams()
        self.dt = 1/60  # 60 FPS simulation
        
    def compute_acceleration(self, 
                            position: Array, 
                            velocity: Array,
                            tangent: Array,
                            normal: Array) -> Tuple[Array, Array]:
        """
        Compute acceleration from forces
        Returns: (acceleration, g_forces)
        """
        speed = np.linalg.norm(velocity)
        
        # Gravity component along track
        gravity_vec = np.array([0, 0, -GRAVITY])
        gravity_tangent = dot(gravity_vec, tangent)
        gravity_normal = dot(gravity_vec, normal)
        
        # Drag (opposite to velocity direction)
        drag_magnitude = self.params.get_drag_force(speed) / self.params.mass
        drag_acc = -drag_magnitude * (velocity / max(speed, 0.01))
        
        # Friction (always opposes motion)
        friction_acc = -np.sign(speed) * self.params.get_friction_force() / self.params.mass
        
        # Total tangential acceleration
        tangent_acc = gravity_tangent + friction_acc - drag_magnitude * np.sign(speed)
        
        # Centripetal acceleration (from track curvature)
        # a_c = v² / r, where r is radius of curvature
        # For now, we get this from the track geometry
        
        # Total acceleration
        acceleration = tangent_acc * tangent + drag_acc
        
        # G-forces (what the rider feels)
        # Lateral (sideways), Vertical (up/down), Longitudinal (forward/back)
        binormal = cross(tangent, normal)
        g_forces = np.array([
            -dot(acceleration, binormal) / GRAVITY,  # Lateral
            (dot(acceleration, normal) + GRAVITY) / GRAVITY,  # Vertical (1G when stationary)
            -tangent_acc / GRAVITY  # Longitudinal
        ])
        
        return acceleration, g_forces
    
    def integrate_step(self, state: CoasterState, 
                      next_tangent: Array,
                      next_normal: Array,
                      track_speed_limit: Optional[float] = None) -> CoasterState:
        """
        Single physics step using semi-implicit Euler
        GPU-friendly: all operations are vectorized
        """
        # Compute acceleration
        acc, g_forces = self.compute_acceleration(
            state.position, state.velocity, state.tangent, state.normal
        )
        
        # Update velocity (semi-implicit Euler)
        new_velocity = state.velocity + acc * self.dt
        new_speed = np.linalg.norm(new_velocity)
        
        # Apply speed limits (brakes, safety)
        if track_speed_limit and new_speed > track_speed_limit:
            new_velocity = new_velocity * (track_speed_limit / new_speed)
            new_speed = track_speed_limit
        
        # Ensure minimum speed (no going backwards on lift hill)
        if new_speed < 0.1:
            new_speed = 0.1
            new_velocity = next_tangent * new_speed
        
        # Constrain velocity to track tangent
        new_velocity = next_tangent * new_speed
        
        # Update position
        new_position = state.position + new_velocity * self.dt
        
        # Update distance traveled
        new_distance = state.distance + new_speed * self.dt
        
        return CoasterState(
            position=new_position,
            velocity=new_velocity,
            speed=new_speed,
            tangent=next_tangent,
            normal=next_normal,
            binormal=cross(next_tangent, next_normal),
            g_force=g_forces,
            time=state.time + self.dt,
            distance=new_distance
        )
    
    def compute_centripetal_g(self, speed: float, radius: float) -> float:
        """Centripetal G-force: v² / (r * g)"""
        if radius < 0.1:  # Avoid division by zero
            return 0.0
        return (speed ** 2) / (radius * GRAVITY)
    
    def estimate_radius(self, p0: Array, p1: Array, p2: Array) -> float:
        """Estimate radius of curvature from 3 points"""
        # Menger curvature
        a = np.linalg.norm(p1 - p0)
        b = np.linalg.norm(p2 - p1)
        c = np.linalg.norm(p2 - p0)
        
        # Area of triangle using cross product
        area = 0.5 * np.linalg.norm(cross(p1 - p0, p2 - p0))
        
        if area < 1e-8:
            return float('inf')  # Straight line
        
        return (a * b * c) / (4 * area)

class BatchedPhysics:
    """
    GPU-Optimized Batched Physics
    Pre-compute entire ride in parallel
    """
    
    def __init__(self, params: Optional[CoasterParams] = None):
        self.engine = PhysicsEngine(params)
        
    def simulate_full_ride(self, 
                          track_points: Array,
                          track_tangents: Array,
                          track_normals: Array,
                          initial_speed: float = 1.0) -> List[CoasterState]:
        """
        Simulate entire ride at once
        Perfect for GPU batching
        """
        n_points = len(track_points)
        states = []
        
        # Initial state
        state = CoasterState(
            position=track_points[0],
            velocity=track_tangents[0] * initial_speed,
            speed=initial_speed,
            tangent=track_tangents[0],
            normal=track_normals[0],
            binormal=cross(track_tangents[0], track_normals[0]),
            g_force=np.array([0.0, 1.0, 0.0]),  # 1G vertical at start
            time=0.0,
            distance=0.0
        )
        states.append(state)
        
        # Simulate through all points
        for i in range(1, n_points):
            state = self.engine.integrate_step(
                state,
                track_tangents[i],
                track_normals[i]
            )
            # Snap to track (prevent drift)
            state.position = track_points[i]
            states.append(state)
            
        return states
    
    def compute_g_force_profile(self, states: List[CoasterState]) -> Array:
        """Extract G-force profile for analysis/display"""
        return np.array([s.g_force for s in states])
    
    def compute_speed_profile(self, states: List[CoasterState]) -> Array:
        """Extract speed profile"""
        return np.array([s.speed for s in states])
    
    def find_max_g(self, states: List[CoasterState]) -> Tuple[float, int]:
        """Find maximum G-force and its location"""
        g_magnitudes = [np.linalg.norm(s.g_force) for s in states]
        max_idx = np.argmax(g_magnitudes)
        return g_magnitudes[max_idx], max_idx
