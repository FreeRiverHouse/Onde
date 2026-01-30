"""
🎢 Blender Import Script
Run this inside Blender's Python console or as a script

Usage in Blender:
    1. Open Blender
    2. Switch to Scripting workspace
    3. Open this file
    4. Run the script

For Radeon 7900 XT rendering:
    - Edit > Preferences > System
    - Cycles Render Devices: AMD GPU
    - Enable the Radeon 7900 XT
"""
import bpy
import bmesh
import json
import numpy as np
from pathlib import Path
from mathutils import Vector, Matrix

# Path to exported data
EXPORT_DIR = Path(__file__).parent / "blender_export"

def clear_scene():
    """Remove default objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def load_data():
    """Load all exported numpy arrays and JSON"""
    data = {}
    
    # Load numpy arrays
    for name in ['track_points', 'track_tangents', 'track_normals', 'track_bank_angles',
                 'camera_positions', 'camera_look_at', 'camera_fov', 'camera_roll',
                 'physics_speeds', 'physics_g_forces', 
                 'rail_vertices', 'rail_faces']:
        path = EXPORT_DIR / f"{name}.npy"
        if path.exists():
            data[name] = np.load(path)
            print(f"Loaded {name}: {data[name].shape}")
    
    # Load JSON
    for name in ['supports', 'metadata']:
        path = EXPORT_DIR / f"{name}.json"
        if path.exists():
            with open(path) as f:
                data[name] = json.load(f)
            print(f"Loaded {name}")
    
    return data

def create_track_curve(points, name="Track"):
    """Create a curve from track points"""
    # Create curve data
    curve_data = bpy.data.curves.new(name=name, type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.resolution_u = 12
    
    # Create spline
    spline = curve_data.splines.new(type='NURBS')
    spline.points.add(len(points) - 1)  # Already has 1 point
    
    for i, p in enumerate(points):
        spline.points[i].co = (p[0], p[1], p[2], 1)
    
    spline.use_endpoint_u = True
    
    # Create object
    curve_obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(curve_obj)
    
    return curve_obj

def create_rail_mesh(vertices, faces, name="Rails"):
    """Create mesh from exported rail geometry"""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    
    # Create mesh from vertices and faces
    bm = bmesh.new()
    
    # Add vertices
    for v in vertices:
        bm.verts.new(v)
    
    bm.verts.ensure_lookup_table()
    
    # Add faces
    for f in faces:
        try:
            bm.faces.new([bm.verts[i] for i in f])
        except:
            pass  # Skip invalid faces
    
    bm.to_mesh(mesh)
    bm.free()
    
    # Smooth shading
    for poly in mesh.polygons:
        poly.use_smooth = True
    
    return obj

def create_supports(support_data, name_prefix="Support"):
    """Create support columns"""
    supports = []
    
    for i, s in enumerate(support_data):
        top = Vector(s['top'])
        bottom = Vector(s['bottom'])
        
        # Create cylinder
        length = (top - bottom).length
        center = (top + bottom) / 2
        
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.3,
            depth=length,
            location=center
        )
        
        support = bpy.context.active_object
        support.name = f"{name_prefix}_{i:03d}"
        
        # Rotate to point from bottom to top
        direction = (top - bottom).normalized()
        up = Vector((0, 0, 1))
        
        if direction.dot(up) < 0.9999:
            rotation_axis = up.cross(direction)
            rotation_angle = up.angle(direction)
            support.rotation_euler = Matrix.Rotation(rotation_angle, 4, rotation_axis).to_euler()
        
        supports.append(support)
    
    return supports

def create_coaster_train(name="Train"):
    """Create a simple coaster train"""
    # Create main car body
    bpy.ops.mesh.primitive_cube_add(size=1)
    car = bpy.context.active_object
    car.name = name
    car.scale = (2, 1, 0.8)
    
    # Add wheels (simplified)
    wheel_positions = [(-0.7, 0.5, -0.4), (0.7, 0.5, -0.4),
                      (-0.7, -0.5, -0.4), (0.7, -0.5, -0.4)]
    
    for i, pos in enumerate(wheel_positions):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=0.1)
        wheel = bpy.context.active_object
        wheel.name = f"{name}_Wheel_{i}"
        wheel.location = pos
        wheel.rotation_euler = (1.5708, 0, 0)  # 90 degrees
        wheel.parent = car
    
    return car

def setup_camera_animation(positions, look_at, fov, roll, fps=60):
    """Set up camera with keyframed animation"""
    # Create camera
    cam_data = bpy.data.cameras.new("POV_Camera")
    cam = bpy.data.objects.new("POV_Camera", cam_data)
    bpy.context.collection.objects.link(cam)
    
    # Create empty for look-at target
    target = bpy.data.objects.new("Camera_Target", None)
    bpy.context.collection.objects.link(target)
    target.empty_display_type = 'SPHERE'
    target.empty_display_size = 0.5
    
    # Add track-to constraint
    constraint = cam.constraints.new(type='TRACK_TO')
    constraint.target = target
    constraint.track_axis = 'TRACK_NEGATIVE_Z'
    constraint.up_axis = 'UP_Y'
    
    # Set up animation
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = len(positions)
    bpy.context.scene.render.fps = fps
    
    # Keyframe every nth frame for performance
    keyframe_step = 1  # Every frame
    
    for i in range(0, len(positions), keyframe_step):
        frame = i + 1
        
        # Camera position
        cam.location = positions[i]
        cam.keyframe_insert(data_path="location", frame=frame)
        
        # Camera FOV
        cam_data.lens = 50 * (50 / fov[i])  # Convert FOV to focal length
        cam_data.keyframe_insert(data_path="lens", frame=frame)
        
        # Target position
        target.location = look_at[i]
        target.keyframe_insert(data_path="location", frame=frame)
        
        # Roll
        cam.rotation_euler[2] = np.radians(roll[i])
        cam.keyframe_insert(data_path="rotation_euler", index=2, frame=frame)
    
    # Set camera as active
    bpy.context.scene.camera = cam
    
    return cam, target

def create_materials():
    """Create materials for the coaster"""
    materials = {}
    
    # Rail material (metallic)
    mat = bpy.data.materials.new("Rail_Metal")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.8, 0.2, 0.1, 1)  # Red
    bsdf.inputs["Metallic"].default_value = 0.9
    bsdf.inputs["Roughness"].default_value = 0.3
    materials['rail'] = mat
    
    # Support material (steel gray)
    mat = bpy.data.materials.new("Support_Steel")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.4, 0.4, 0.45, 1)
    bsdf.inputs["Metallic"].default_value = 0.8
    bsdf.inputs["Roughness"].default_value = 0.4
    materials['support'] = mat
    
    # Train material
    mat = bpy.data.materials.new("Train_Body")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.1, 0.1, 0.9, 1)  # Blue
    bsdf.inputs["Metallic"].default_value = 0.3
    bsdf.inputs["Roughness"].default_value = 0.5
    materials['train'] = mat
    
    return materials

def setup_scene_lighting():
    """Add lighting for outdoor coaster scene"""
    # Sun light
    sun_data = bpy.data.lights.new("Sun", type='SUN')
    sun_data.energy = 5
    sun = bpy.data.objects.new("Sun", sun_data)
    sun.location = (50, -50, 100)
    sun.rotation_euler = (0.8, 0.2, 0.3)
    bpy.context.collection.objects.link(sun)
    
    # Sky (HDRI-like)
    world = bpy.context.scene.world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    
    # Clear existing nodes
    nodes.clear()
    
    # Add sky texture
    sky = nodes.new("ShaderNodeTexSky")
    sky.sky_type = 'NISHITA'
    sky.sun_elevation = 0.8
    
    bg = nodes.new("ShaderNodeBackground")
    output = nodes.new("ShaderNodeOutputWorld")
    
    links.new(sky.outputs[0], bg.inputs[0])
    links.new(bg.outputs[0], output.inputs[0])

def setup_cycles_radeon():
    """Configure Cycles for Radeon GPU rendering"""
    # Set render engine
    bpy.context.scene.render.engine = 'CYCLES'
    
    # Enable GPU
    cycles = bpy.context.preferences.addons['cycles'].preferences
    cycles.compute_device_type = 'HIP'  # AMD GPU
    
    # Enable all available devices
    cycles.get_devices()
    for device in cycles.devices:
        device.use = True
        print(f"Enabled: {device.name}")
    
    # Set scene to GPU
    bpy.context.scene.cycles.device = 'GPU'
    
    # Optimize settings for speed
    bpy.context.scene.cycles.samples = 128
    bpy.context.scene.cycles.use_denoising = True
    bpy.context.scene.cycles.denoiser = 'OPENIMAGEDENOISE'
    
    # Resolution
    bpy.context.scene.render.resolution_x = 1920
    bpy.context.scene.render.resolution_y = 1080
    bpy.context.scene.render.resolution_percentage = 100

def main():
    """Main import function"""
    print("\n🎢 BLENDER IMPORT")
    print("=" * 50)
    
    # Clear scene
    clear_scene()
    print("✓ Scene cleared")
    
    # Load data
    data = load_data()
    if 'track_points' not in data:
        print("❌ No track data found! Run main.py first.")
        return
    
    # Create materials
    materials = create_materials()
    print("✓ Materials created")
    
    # Create track curve (for reference)
    track_curve = create_track_curve(data['track_points'])
    print(f"✓ Track curve: {len(data['track_points'])} points")
    
    # Create rail mesh
    if 'rail_vertices' in data:
        rails = create_rail_mesh(data['rail_vertices'], data['rail_faces'])
        rails.data.materials.append(materials['rail'])
        print(f"✓ Rail mesh: {len(data['rail_vertices'])} vertices")
    
    # Create supports
    if 'supports' in data:
        supports = create_supports(data['supports'])
        for s in supports:
            s.data.materials.append(materials['support'])
        print(f"✓ Supports: {len(supports)} columns")
    
    # Create train
    train = create_coaster_train()
    train.data.materials.append(materials['train'])
    print("✓ Train created")
    
    # Set up camera
    if 'camera_positions' in data:
        cam, target = setup_camera_animation(
            data['camera_positions'],
            data['camera_look_at'],
            data['camera_fov'],
            data['camera_roll']
        )
        print(f"✓ Camera animation: {len(data['camera_positions'])} frames")
    
    # Set up lighting
    setup_scene_lighting()
    print("✓ Lighting set up")
    
    # Configure Cycles for Radeon
    try:
        setup_cycles_radeon()
        print("✓ Cycles configured for Radeon GPU")
    except Exception as e:
        print(f"⚠️ Could not configure Cycles: {e}")
    
    # Print metadata
    if 'metadata' in data:
        meta = data['metadata']
        print(f"\n📊 Track Info:")
        print(f"   Length: {meta['track_length']:.0f}m")
        print(f"   Max Speed: {meta['max_speed_kmh']:.0f} km/h")
        print(f"   Max G: {meta['max_g']:.1f}G")
        print(f"   Ride Time: {meta['ride_time']:.1f}s")
    
    print("\n🎉 Import complete!")
    print("Press Space to play animation")
    print("F12 to render frame, Ctrl+F12 for animation")

# Run when executed as script
if __name__ == "__main__":
    main()
