"""
Vector Math - GPU-Ready Operations
Designed for easy TinyGrad/Radeon porting
"""
import numpy as np
from typing import Tuple, Union

# Type alias for GPU portability
Array = np.ndarray  # Replace with tinygrad.Tensor when porting

def normalize(v: Array) -> Array:
    """Normalize vector(s) - GPU friendly"""
    norm = np.linalg.norm(v, axis=-1, keepdims=True)
    return np.where(norm > 1e-8, v / norm, v)

def cross(a: Array, b: Array) -> Array:
    """Cross product - batched for GPU"""
    return np.cross(a, b)

def dot(a: Array, b: Array) -> Array:
    """Dot product - batched for GPU"""
    return np.sum(a * b, axis=-1)

def lerp(a: Array, b: Array, t: float) -> Array:
    """Linear interpolation"""
    return a + (b - a) * t

def catmull_rom(p0: Array, p1: Array, p2: Array, p3: Array, t: float) -> Array:
    """Catmull-Rom spline interpolation - smooth curves for tracks"""
    t2 = t * t
    t3 = t2 * t
    return 0.5 * (
        2 * p1 +
        (-p0 + p2) * t +
        (2*p0 - 5*p1 + 4*p2 - p3) * t2 +
        (-p0 + 3*p1 - 3*p2 + p3) * t3
    )

def catmull_rom_derivative(p0: Array, p1: Array, p2: Array, p3: Array, t: float) -> Array:
    """Derivative of Catmull-Rom - for tangent/velocity"""
    t2 = t * t
    return 0.5 * (
        (-p0 + p2) +
        (4*p0 - 10*p1 + 8*p2 - 2*p3) * t +
        (-3*p0 + 9*p1 - 9*p2 + 3*p3) * t2
    )

def rotation_matrix_from_vectors(vec1: Array, vec2: Array) -> Array:
    """Rotation matrix to align vec1 to vec2"""
    a = normalize(vec1)
    b = normalize(vec2)
    v = cross(a, b)
    c = dot(a, b)
    
    if c < -0.9999:  # Opposite vectors
        return -np.eye(3)
    
    s = np.linalg.norm(v)
    if s < 1e-8:
        return np.eye(3)
    
    kmat = np.array([
        [0, -v[2], v[1]],
        [v[2], 0, -v[0]],
        [-v[1], v[0], 0]
    ])
    return np.eye(3) + kmat + kmat @ kmat * ((1 - c) / (s * s))

# GPU-ready batched operations
class BatchedOps:
    """Operations optimized for GPU batch processing"""
    
    @staticmethod
    def compute_all_points(control_points: Array, num_samples: int) -> Array:
        """Compute all spline points in one go - perfect for GPU"""
        n = len(control_points)
        t_values = np.linspace(0, 1, num_samples)
        points = []
        
        for i in range(n - 3):
            p0, p1, p2, p3 = control_points[i:i+4]
            for t in t_values[:-1] if i < n-4 else t_values:
                points.append(catmull_rom(p0, p1, p2, p3, t))
        
        return np.array(points)
    
    @staticmethod
    def compute_all_tangents(control_points: Array, num_samples: int) -> Array:
        """Compute all tangents - for orientation"""
        n = len(control_points)
        t_values = np.linspace(0, 1, num_samples)
        tangents = []
        
        for i in range(n - 3):
            p0, p1, p2, p3 = control_points[i:i+4]
            for t in t_values[:-1] if i < n-4 else t_values:
                tangents.append(catmull_rom_derivative(p0, p1, p2, p3, t))
        
        return normalize(np.array(tangents))
