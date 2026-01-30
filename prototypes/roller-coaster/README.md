# 🎢 Roller Coaster Prototype

Professional roller coaster simulation with GPU acceleration via Radeon 7900 XT.

## Features

- **Physics Engine**: Real physics simulation with gravity, drag, friction
- **G-Force Calculation**: Accurate lateral, vertical, and longitudinal G-forces
- **Track Builder**: Fluent API for creating professional tracks
  - Lift hills, drops, loops, corkscrews
  - Banked turns, helixes, airtime hills
  - Brake runs and stations
- **POV Camera**: First-person ride camera with:
  - Dynamic FOV based on speed
  - Camera shake from G-forces
  - Motion blur
  - Smooth interpolation
- **GPU Acceleration**: TinyGrad backend for Radeon 7900 XT
- **Blender Export**: Full pipeline to render in Cycles

## Structure

```
roller-coaster/
├── core/
│   └── vector_math.py      # GPU-ready vector operations
├── physics/
│   └── dynamics.py         # Physics simulation engine
├── track/
│   └── generator.py        # Track element builder
├── camera/
│   └── pov.py              # POV camera system
├── gpu/
│   └── tinygrad_backend.py # Radeon GPU acceleration
├── main.py                 # Main entry point
├── blender_import.py       # Blender import script
└── blender_export/         # Generated data for Blender
```

## Usage

### 1. Generate Track & Simulation

```bash
cd /Users/mattia/Projects/Onde/prototypes/roller-coaster
python main.py
```

This generates:
- Track geometry (splines, rails, supports)
- Physics simulation (velocities, G-forces)
- Camera animation data
- Exports to `blender_export/`

### 2. Import into Blender

1. Open Blender
2. Go to Scripting workspace
3. Open `blender_import.py`
4. Run the script

### 3. Render with Radeon

The script auto-configures Cycles for AMD GPU:
- Render engine: Cycles
- Device: HIP (AMD)
- Denoising: OpenImageDenoise
- Resolution: 1920x1080

Press `F12` for single frame, `Ctrl+F12` for animation.

## GPU Benchmark

```bash
python main.py --benchmark
```

Compare CPU vs GPU (TinyGrad) performance.

## Track Elements

```python
from track.generator import TrackBuilder

track = (TrackBuilder()
    .straight(10)
    .lift_hill(height=40)
    .drop(height=38, angle=70)
    .loop(radius=12)
    .corkscrew(length=25, twist=360)
    .banked_turn(radius=20, angle=180, bank=60)
    .helix(radius=15, turns=1.5, height_change=-10)
    .airtime_hill(height=8)
    .brake_run(30)
    .build()
)
```

## Physics Parameters

```python
from physics.dynamics import CoasterParams

params = CoasterParams(
    mass=8000.0,              # kg (train + passengers)
    drag_coefficient=0.4,     # Aerodynamic drag
    frontal_area=5.0,         # m²
    rolling_resistance=0.008, # Wheel friction
    wheel_friction=0.015      # Track friction
)
```

## GPU Portability

All numpy operations use a common interface for easy TinyGrad porting:

```python
# CPU (NumPy)
from core.vector_math import Array  # = np.ndarray

# GPU (TinyGrad)
from gpu.tinygrad_backend import to_gpu, to_cpu
gpu_array = to_gpu(numpy_array)
result = to_cpu(gpu_result)
```

## Next Steps

1. [ ] Add more track elements (cobra roll, zero-G roll)
2. [ ] Implement real-time preview
3. [ ] Add terrain/environment generation
4. [ ] Create coaster car model
5. [ ] Add sound design (wind, track clicks)

---

Built for Onde - Gaming House Professional 🎮
