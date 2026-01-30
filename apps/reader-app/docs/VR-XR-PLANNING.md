# Reader App VR/XR Version Planning

**Created**: 2026-01-29
**Status**: Research & Planning
**Task**: [T669]

## Vision

Transform the web-based Reader App into an immersive VR reading experience. The goal is to create the ultimate distraction-free reading environment - imagine reading in a cozy virtual library, a peaceful cafe, or floating among the clouds.

## Target Platforms

### Primary Targets
1. **Meta Quest 3/Pro** - WebXR via Quest Browser, native via Unity
2. **Apple Vision Pro** - visionOS native app (SwiftUI + RealityKit)

### Secondary Targets
3. **Quest 2** - Lower-spec WebXR
4. **PCVR** - SteamVR headsets via browser WebXR
5. **Flatscreen VR Mode** - 360° environments for non-VR users

## Tech Stack Options

### Option A: React-Three-Fiber + WebXR (Recommended for MVP)

**Pros:**
- Reuses existing React knowledge
- Same codebase as web app
- Quick iteration, hot reload
- Works on all WebXR browsers
- No app store approval needed

**Cons:**
- Performance limited vs native
- No Vision Pro native features
- Hand tracking limited

**Stack:**
```
react-three-fiber + @react-three/drei + @react-three/xr
├── Three.js for 3D rendering
├── WebXR for VR/AR session
├── troika-three-text for readable text
└── drei helpers (Environment, Sky, etc.)
```

**Estimated effort:** 2-3 weeks for MVP

### Option B: A-Frame (Simpler, Declarative)

**Pros:**
- Very easy to get started
- HTML-like syntax
- Good community/examples
- Built-in components

**Cons:**
- Less flexible than R3F
- Performance ceiling lower
- React integration awkward

**Estimated effort:** 1-2 weeks for MVP

### Option C: Unity (Native, Best Performance)

**Pros:**
- Best performance
- Full platform features
- Vision Pro native support
- Hand tracking, eye tracking
- Haptics, spatial audio

**Cons:**
- Separate codebase (C#)
- Longer dev time
- App store submissions
- Needs different expertise

**Estimated effort:** 4-6 weeks for MVP

### Option D: visionOS Native (Vision Pro Only)

**Pros:**
- Best Vision Pro experience
- Native spatial UI
- SharePlay, iCloud sync
- App Store presence

**Cons:**
- Vision Pro only
- Swift/SwiftUI required
- Separate codebase

**Estimated effort:** 3-4 weeks for MVP

## Recommendation

**Phase 1: WebXR MVP with React-Three-Fiber**
- Fastest to market
- Works on Quest and flatscreen
- Can share code with existing web app
- Validate concept before investing in native

**Phase 2: Unity Native (if MVP successful)**
- Better performance
- Full platform features
- App store distribution

**Phase 3: visionOS Native (optional)**
- Premium Vision Pro experience
- If market warrants investment

## MVP Features (Phase 1)

### Environment
- [ ] 3 reading environments:
  - Cozy library (warm lighting, bookshelves)
  - Mountain cabin (window with nature view)
  - Floating in clouds (minimal, dreamy)
- [ ] Time-of-day lighting (match device time or manual)
- [ ] Ambient sound integration (reuse existing Web Audio code)

### Reading Experience
- [ ] Floating text panel at comfortable reading distance
- [ ] Page turn with controller buttons or hand gestures
- [ ] Font size adjustment via slider or pinch gesture
- [ ] Theme modes (light text on dark, sepia, etc.)
- [ ] Progress indicator (floating or attached to book)

### Navigation
- [ ] Virtual bookshelf for library view
- [ ] Pick up book to start reading
- [ ] Teleport between environments
- [ ] Seated or standing mode

### Comfort
- [ ] Reading distance adjustment
- [ ] Panel angle/tilt
- [ ] Text column width
- [ ] Night mode (reduced blue light)
- [ ] Break reminders (VR eye strain)

## Technical Considerations

### Text Rendering in VR
**Challenge:** Text readability in VR requires special handling.

**Solution:** Use `troika-three-text` - SDF-based text rendering that stays crisp at any distance.

```jsx
import { Text } from '@react-three/drei'

<Text
  fontSize={0.05}
  maxWidth={1.5}
  lineHeight={1.4}
  font="/fonts/georgia.woff"
  anchorX="center"
  anchorY="middle"
>
  {chapterText}
</Text>
```

**Recommendations:**
- Min font size: 24pt equivalent (0.05 units at 2m)
- Line length: 60-80 characters max
- High contrast: White on dark gray, not pure black
- Serif fonts for long-form reading

### EPUB Integration
Reuse existing epub.js integration from web app:
- Extract chapters as plain text
- Render in VR text component
- Track progress same as web

### Performance Budgets
- **Quest 2/3:** 72Hz, target 90fps
  - Max 500k triangles
  - Max 50 draw calls
  - Baked lighting preferred
- **Vision Pro:** 90Hz
  - More headroom, but still optimize

### Data Sync
- Use existing IndexedDB/localStorage for offline
- Future: Supabase sync (same as web task T698)
- Progress syncs between VR and web

## Environment Asset Sources

### Free/Open Source
- [Poly Haven](https://polyhaven.com/) - Free HDRIs, textures
- [Sketchfab](https://sketchfab.com/) - CC models
- [Kenney Assets](https://kenney.nl/) - Game-ready 3D

### Paid (High Quality)
- [CGTrader](https://cgtrader.com/)
- [TurboSquid](https://turbosquid.com/)
- Custom commissions on Fiverr/Upwork

## UX Research Questions

1. **Reading duration:** How long can users comfortably read in VR?
2. **Text distance:** What's the optimal panel distance?
3. **Page turning:** Controller click vs hand swipe vs gaze dwell?
4. **Environment:** Do users prefer realistic or stylized?
5. **Social:** Interest in reading together (shareplay)?

## Success Metrics

- **Completion rate:** % of users who finish a book in VR
- **Session length:** Average reading time per session
- **Return rate:** Users who come back to read again
- **Comfort score:** Self-reported eye strain/discomfort
- **NPS:** Would recommend to a friend?

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| VR text fatigue | High | Break reminders, adjustable font/distance |
| Low Quest browser performance | Medium | Optimize, fallback to simpler environments |
| WebXR API changes | Low | Use abstraction layer (react-xr) |
| Limited audience | Medium | Also works as cool 3D flatscreen experience |

## Timeline

### Phase 1: WebXR MVP (3 weeks)
- Week 1: Basic VR shell, text rendering, one environment
- Week 2: EPUB integration, controls, settings
- Week 3: Polish, testing, deploy to onde.la/reader-vr

### Phase 2: Unity Native (if MVP validates, 6 weeks)
- Weeks 1-2: Unity setup, Quest build
- Weeks 3-4: Feature parity with WebXR
- Weeks 5-6: Vision Pro port, polish

## Next Steps

1. **Prototype:** Create minimal R3F scene with floating text
2. **Test:** Try reading 10 pages of a book in Quest 3 browser
3. **Iterate:** Adjust text size, distance, environment based on feedback
4. **Build:** Full MVP with library view and multiple environments

## Resources

- [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [@react-three/xr](https://github.com/pmndrs/xr)
- [troika-three-text](https://github.com/protectwise/troika/tree/main/packages/troika-three-text)
- [Meta Quest Developer Hub](https://developer.oculus.com/)
- [visionOS Documentation](https://developer.apple.com/visionos/)

---

*This document is a living plan. Update as research progresses.*
