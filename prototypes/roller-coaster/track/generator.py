"""
Track Generator - GPU-Ready Spline System
Create professional roller coaster tracks
"""
import numpy as np
from dataclasses import dataclass, field
from typing import List, Tuple, Optional
from enum import Enum
import sys
sys.path.append('..')
from core.vector_math import (
    normalize, cross, catmull_rom, catmull_rom_derivative,
    BatchedOps, Array
)

class TrackElementType(Enum):
    """Types of track elements"""
    STRAIGHT = "straight"
    LIFT_HILL = "lift_hill"
    DROP = "drop"
    LOOP = "loop"
    CORKSCREW = "corkscrew"
    HELIX = "helix"
    BANKED_TURN = "banked_turn"
    BUNNY_HOP = "bunny_hop"
    AIRTIME_HILL = "airtime_hill"
    BRAKE_RUN = "brake_run"
    STATION = "station"

@dataclass
class TrackElement:
    """A segment of track"""
    element_type: TrackElementType
    length: float = 10.0
    height: float = 0.0
    radius: float = 10.0
    bank_angle: float = 0.0  # degrees
    twist_angle: float = 0.0  # degrees (for corkscrews)
    direction_change: float = 0.0  # degrees
    
@dataclass
class TrackPoint:
    """A point on the track with full frame"""
    position: Array
    tangent: Array
    normal: Array
    binormal: Array
    bank_angle: float = 0.0
    
@dataclass
class Track:
    """Complete track data"""
    points: Array  # Nx3 positions
    tangents: Array  # Nx3 tangent vectors
    normals: Array  # Nx3 normal vectors
    binormals: Array  # Nx3 binormal vectors
    bank_angles: Array  # N bank angles
    total_length: float = 0.0
    
class TrackBuilder:
    """
    Build tracks from elements
    GPU-friendly: generates all geometry at once
    """
    
    def __init__(self, points_per_meter: float = 2.0):
        self.points_per_meter = points_per_meter
        self.elements: List[TrackElement] = []
        
    def add(self, element: TrackElement) -> 'TrackBuilder':
        """Add element to track (fluent interface)"""
        self.elements.append(element)
        return self
    
    def lift_hill(self, height: float = 30.0, length: float = 50.0) -> 'TrackBuilder':
        """Add a lift hill"""
        return self.add(TrackElement(
            TrackElementType.LIFT_HILL,
            length=length,
            height=height
        ))
    
    def drop(self, height: float = 25.0, angle: float = 60.0) -> 'TrackBuilder':
        """Add a drop"""
        length = height / np.sin(np.radians(angle))
        return self.add(TrackElement(
            TrackElementType.DROP,
            length=length,
            height=-height
        ))
    
    def loop(self, radius: float = 15.0) -> 'TrackBuilder':
        """Add a vertical loop"""
        return self.add(TrackElement(
            TrackElementType.LOOP,
            radius=radius,
            length=2 * np.pi * radius
        ))
    
    def corkscrew(self, length: float = 20.0, twist: float = 360.0) -> 'TrackBuilder':
        """Add a corkscrew"""
        return self.add(TrackElement(
            TrackElementType.CORKSCREW,
            length=length,
            twist_angle=twist
        ))
    
    def helix(self, radius: float = 20.0, turns: float = 1.5, 
              height_change: float = 10.0) -> 'TrackBuilder':
        """Add a helix"""
        return self.add(TrackElement(
            TrackElementType.HELIX,
            radius=radius,
            length=2 * np.pi * radius * turns,
            height=height_change,
            direction_change=360 * turns
        ))
    
    def banked_turn(self, radius: float = 25.0, angle: float = 90.0,
                   bank: float = 45.0) -> 'TrackBuilder':
        """Add a banked turn"""
        length = (abs(angle) / 360) * 2 * np.pi * radius
        return self.add(TrackElement(
            TrackElementType.BANKED_TURN,
            radius=radius,
            length=length,
            bank_angle=bank,
            direction_change=angle
        ))
    
    def airtime_hill(self, height: float = 8.0, length: float = 30.0) -> 'TrackBuilder':
        """Add an airtime hill (negative G at top)"""
        return self.add(TrackElement(
            TrackElementType.AIRTIME_HILL,
            length=length,
            height=height
        ))
    
    def straight(self, length: float = 20.0) -> 'TrackBuilder':
        """Add a straight section"""
        return self.add(TrackElement(
            TrackElementType.STRAIGHT,
            length=length
        ))
    
    def brake_run(self, length: float = 30.0) -> 'TrackBuilder':
        """Add brake section"""
        return self.add(TrackElement(
            TrackElementType.BRAKE_RUN,
            length=length
        ))
    
    def build(self) -> Track:
        """
        Build the complete track
        Generates all geometry - GPU ready
        """
        all_control_points = []
        all_bank_angles = []
        
        # Current position and direction
        pos = np.array([0.0, 0.0, 0.0])
        direction = np.array([1.0, 0.0, 0.0])
        up = np.array([0.0, 0.0, 1.0])
        
        for element in self.elements:
            points, banks = self._generate_element(
                element, pos, direction, up
            )
            
            if points:
                all_control_points.extend(points)
                all_bank_angles.extend(banks)
                pos = points[-1]
                
                # Update direction based on element
                if len(points) >= 2:
                    direction = normalize(points[-1] - points[-2])
        
        if len(all_control_points) < 4:
            raise ValueError("Need at least 4 control points for spline")
        
        control_points = np.array(all_control_points)
        
        # Generate smooth spline through control points
        num_samples = int(self._total_length() * self.points_per_meter)
        points = BatchedOps.compute_all_points(control_points, 
                                               num_samples // len(control_points) + 1)
        tangents = BatchedOps.compute_all_tangents(control_points,
                                                    num_samples // len(control_points) + 1)
        
        # Compute normals and binormals
        normals = self._compute_normals(tangents, all_bank_angles, len(points))
        binormals = np.array([cross(t, n) for t, n in zip(tangents, normals)])
        
        # Interpolate bank angles
        bank_angles = np.interp(
            np.linspace(0, 1, len(points)),
            np.linspace(0, 1, len(all_bank_angles)),
            all_bank_angles
        )
        
        return Track(
            points=points,
            tangents=tangents,
            normals=normals,
            binormals=binormals,
            bank_angles=bank_angles,
            total_length=self._total_length()
        )
    
    def _total_length(self) -> float:
        return sum(e.length for e in self.elements)
    
    def _generate_element(self, element: TrackElement, 
                         start_pos: Array, direction: Array, 
                         up: Array) -> Tuple[List[Array], List[float]]:
        """Generate control points for an element"""
        points = []
        banks = []
        
        num_points = max(4, int(element.length / 5))  # Point every ~5m
        
        if element.element_type == TrackElementType.STRAIGHT:
            for i in range(num_points):
                t = i / (num_points - 1)
                points.append(start_pos + direction * element.length * t)
                banks.append(0.0)
                
        elif element.element_type == TrackElementType.LIFT_HILL:
            # Gradual incline
            for i in range(num_points):
                t = i / (num_points - 1)
                pos = start_pos + direction * element.length * t
                # Smooth height increase
                height = element.height * (3*t**2 - 2*t**3)  # Smoothstep
                pos[2] += height
                points.append(pos)
                banks.append(0.0)
                
        elif element.element_type == TrackElementType.DROP:
            # Steep descent
            for i in range(num_points):
                t = i / (num_points - 1)
                pos = start_pos + direction * element.length * t
                # Fast initial drop, smooth at bottom
                height = element.height * (1 - (1-t)**3)
                pos[2] += height
                points.append(pos)
                banks.append(0.0)
                
        elif element.element_type == TrackElementType.LOOP:
            # Vertical loop
            radius = element.radius
            center = start_pos + direction * radius + up * radius
            
            for i in range(num_points):
                angle = np.pi * 2 * i / (num_points - 1)
                # Start going up, loop over, come back down
                pos = center.copy()
                pos -= up * radius * np.cos(angle)
                pos += direction * radius * np.sin(angle)
                points.append(pos)
                banks.append(0.0)  # No banking in loop
                
        elif element.element_type == TrackElementType.CORKSCREW:
            # Helical twist
            for i in range(num_points):
                t = i / (num_points - 1)
                twist = np.radians(element.twist_angle * t)
                
                pos = start_pos + direction * element.length * t
                # Slight barrel roll offset
                roll_radius = 3.0
                right = cross(direction, up)
                pos += right * roll_radius * np.sin(twist)
                pos += up * roll_radius * (1 - np.cos(twist))
                
                points.append(pos)
                banks.append(element.twist_angle * t)
                
        elif element.element_type == TrackElementType.HELIX:
            # Helical turn
            radius = element.radius
            turns = element.direction_change / 360
            right = cross(direction, up)
            center = start_pos + right * radius
            
            for i in range(num_points):
                t = i / (num_points - 1)
                angle = np.radians(element.direction_change * t)
                
                pos = center - right * radius * np.cos(angle)
                pos += direction * radius * np.sin(angle)
                pos[2] += element.height * t
                
                points.append(pos)
                banks.append(45.0)  # Banked for G-force
                
        elif element.element_type == TrackElementType.BANKED_TURN:
            radius = element.radius
            right = cross(direction, up)
            center = start_pos + right * radius
            
            for i in range(num_points):
                t = i / (num_points - 1)
                angle = np.radians(element.direction_change * t)
                
                pos = center - right * radius * np.cos(angle)
                pos += direction * radius * np.sin(angle)
                
                points.append(pos)
                # Smooth bank transition
                bank = element.bank_angle * np.sin(np.pi * t)  # Ramp up and down
                banks.append(bank)
                
        elif element.element_type == TrackElementType.AIRTIME_HILL:
            # Parabolic hill for negative G at top
            for i in range(num_points):
                t = i / (num_points - 1)
                pos = start_pos + direction * element.length * t
                # Parabola: peaks in middle
                height = element.height * 4 * t * (1 - t)
                pos[2] += height
                points.append(pos)
                banks.append(0.0)
                
        elif element.element_type == TrackElementType.BRAKE_RUN:
            for i in range(num_points):
                t = i / (num_points - 1)
                points.append(start_pos + direction * element.length * t)
                banks.append(0.0)
        
        else:  # Default: straight
            for i in range(num_points):
                t = i / (num_points - 1)
                points.append(start_pos + direction * element.length * t)
                banks.append(0.0)
                
        return points, banks
    
    def _compute_normals(self, tangents: Array, bank_angles: List[float], 
                        num_points: int) -> Array:
        """Compute normal vectors with banking"""
        world_up = np.array([0.0, 0.0, 1.0])
        normals = []
        
        bank_interp = np.interp(
            np.linspace(0, 1, num_points),
            np.linspace(0, 1, len(bank_angles)),
            bank_angles
        )
        
        for i, tangent in enumerate(tangents):
            # Base normal (perpendicular to tangent and world up)
            right = normalize(cross(tangent, world_up))
            normal = normalize(cross(right, tangent))
            
            # Apply banking
            bank = np.radians(bank_interp[i])
            cos_b, sin_b = np.cos(bank), np.sin(bank)
            
            # Rotate normal around tangent by bank angle
            rotated_normal = normal * cos_b + right * sin_b
            normals.append(normalize(rotated_normal))
            
        return np.array(normals)


def create_demo_track() -> Track:
    """Create a demo roller coaster track"""
    builder = TrackBuilder(points_per_meter=4.0)
    
    track = (builder
        .straight(10)              # Station exit
        .lift_hill(height=40)      # Main lift
        .drop(height=38, angle=70) # First drop
        .loop(radius=12)           # Vertical loop
        .airtime_hill(height=10)   # Airtime!
        .banked_turn(radius=20, angle=180, bank=60)  # U-turn
        .corkscrew(length=25, twist=360)  # Corkscrew
        .helix(radius=18, turns=1.5, height_change=-15)  # Descending helix
        .airtime_hill(height=6)    # Small hill
        .brake_run(30)             # Final brakes
        .straight(15)              # Back to station
        .build()
    )
    
    return track
