# Grok Feedback on Pizza Gelato Rush v9
*Date: 2026-02-18, via PROC-002*

## 1. GRAPHICS QUALITY - Roadside Objects
- Current scenery is basic polygons/circles
- Need: layered sprites with shading, windows, foliage
- Draw objects procedurally with more complexity: gradients for depth, patterns for texture, shadows, animation
- Use multiple layers (background hills, mid buildings/trees, foreground signs) with parallax scrolling

### Actionable:
- **Buildings/Pizzerias**: Draw with roof (triangle gradient), walls (rect with window loops), door, chimney. Add brick pattern via small rects or createPattern
- **Trees**: Trunk + layered ellipses for foliage, sway with sin(time)
- **Italian Flair**: Gelato stands (umbrella cone), pizza ovens (dome + smoke particles), Vespa parked
- **Parallax Layers**: Add 3 arrays: bg (mountains), mid (buildings), fg (signs). Scroll at 0.5x, 0.8x, 1x road speed

## 2. HILLS/ELEVATION - Dramatic Visibility
- Flat due to subtle y-scale or missing visual cues
- Need: Exaggerate 2-3x height multiplier, camera pitch/roll, height-based shading/fog, sky tint

### Actionable:
- **Cam Pitch**: `camPitch = lerp(camPitch, road[segment].hill * 0.02, 0.1);`
- **Road Curve**: `y = prevY + hill * hillScale * (1 - z/camD); Set hillScale = 200;`
- **Visuals**: Shade road darker on valleys, sky gradient shifts blue->orange with height

## 3. AI BEHAVIOR - Competitive & Realistic
- Predictable = constant speed/lane
- Need: state machine: patrol lanes, chase player, overtake with risk

### Actionable:
- Each AI: `{pos, lane: 0-2, speed: base+rand, targetLane, accel, reactionTime: rand(0.2-0.8)}`
- Logic: If distToPlayer < 500, chase (accel to playerSpeed*1.05, change lane toward player)
- Random lane wobble, overtake: boost speed briefly, drift out

## 4. PERFORMANCE - Post-Processing on Mobile
- v9 effects likely tank FPS on mobile

### Optimization Table:
| Effect | Bottleneck | Fix |
|--------|-----------|-----|
| Bloom | Gaussian blur loops | Downsample to 1/4 res, 3-5 passes max, separable blur |
| Vignette | Radial gradient fill | Precompute texture, modulateImageData |
| God Rays | Radial sample | Threshold bright pixels only, low res |
| Heat Haze | Distort/warp | Skip every other frame, low freq sin |

### Key Tips:
- Use `willReadFrequently: true` on canvas
- RAF throttle: if (time - lastDraw < 16) return
- Mobile: `ctx.imageSmoothingEnabled = false`
- Target 60FPS: <2000 fills/strokes/frame
- Expect 30-60FPS on mid mobile post-opt

## 5. GAME FEEL - Polished Arcade Racer
- Missing: juice! Particles, audio reactivity, haptics, forgiving controls

### Quick Wins:
- **Particles**: Dust/skid on accel/brake/turn
- **Audio**: WebAudio oscillator pitch = speed/maxSpeed * 440 + 200; Free SFX: engine loop + whoosh
- **Controls**: Steer lerp with speed factor `steerForce *= (1 - speed/maxSpeed);` Add drift
- **UI/Feedback**: Speed blur (motion radial), nitro bar fill anim, crash shake
- **Polish**: Screen shake on overtake, combo streak, Italian music loop, powerups (pizza boost speed)
- **Haptics**: `navigator.vibrate(10);` on bump

## New Tasks from Grok (PROC-002)
- [ ] TG-011: Implement parallax layers (bg/mid/fg) for depth
- [ ] TG-012: Enhance building/pizzeria drawings with gradients, windows, roofs
- [ ] TG-013: Add camera pitch on hills for dramatic elevation feel
- [ ] TG-014: Improve AI with chase/overtake state machine
- [ ] TG-015: Add WebAudio engine sound
- [ ] TG-016: Optimize post-processing for mobile (bloom downsampling, vignette texture)
- [ ] TG-017: Add drift mechanics and steer lerp with speed
- [ ] TG-018: Add screen shake on overtake + combo streaks
