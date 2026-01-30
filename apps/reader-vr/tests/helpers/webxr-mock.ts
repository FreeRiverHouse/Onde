import { Page } from '@playwright/test';

/**
 * WebXR Mock Helper for Playwright Tests
 * 
 * Injects a mock WebXR API into the page so tests can run
 * without physical VR hardware.
 */
export async function setupWebXRMock(page: Page) {
  await page.addInitScript(() => {
    // Mock XRReferenceSpace
    const mockReferenceSpace = {
      getOffsetReferenceSpace: () => mockReferenceSpace,
    };

    // Mock XRFrame
    const mockFrame = {
      getViewerPose: () => ({
        views: [{
          eye: 'left',
          projectionMatrix: new Float32Array(16).fill(0),
          transform: {
            matrix: new Float32Array(16).fill(0),
            position: { x: 0, y: 1.6, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 },
          },
        }],
        transform: {
          matrix: new Float32Array(16).fill(0),
          position: { x: 0, y: 1.6, z: 0 },
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
      }),
      getPose: () => ({
        transform: {
          matrix: new Float32Array(16).fill(0),
          position: { x: 0, y: 1.6, z: 0 },
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
      }),
      session: null as unknown, // Will be set to mockSession
    };

    // Mock XRSession
    const mockSession = {
      requestReferenceSpace: async (type: string) => mockReferenceSpace,
      requestAnimationFrame: (callback: XRFrameRequestCallback) => {
        mockFrame.session = mockSession;
        return requestAnimationFrame(() => callback(performance.now(), mockFrame as unknown as XRFrame));
      },
      cancelAnimationFrame: (handle: number) => cancelAnimationFrame(handle),
      end: async () => {
        console.log('[WebXR Mock] Session ended');
      },
      inputSources: [],
      addEventListener: () => {},
      removeEventListener: () => {},
      renderState: {
        baseLayer: null,
        depthFar: 1000,
        depthNear: 0.1,
      },
      updateRenderState: () => {},
      environmentBlendMode: 'opaque',
      interactionMode: 'world-space',
      isSystemKeyboardSupported: false,
    };

    // Mock XRSystem (navigator.xr)
    const mockXR = {
      isSessionSupported: async (mode: string) => {
        console.log(`[WebXR Mock] isSessionSupported(${mode})`);
        return ['immersive-vr', 'immersive-ar', 'inline'].includes(mode);
      },
      requestSession: async (mode: string, options?: object) => {
        console.log(`[WebXR Mock] requestSession(${mode})`, options);
        return mockSession;
      },
      addEventListener: (type: string, listener: EventListener) => {
        console.log(`[WebXR Mock] addEventListener(${type})`);
      },
      removeEventListener: (type: string, listener: EventListener) => {
        console.log(`[WebXR Mock] removeEventListener(${type})`);
      },
      ondevicechange: null,
    };

    // Inject mock into navigator
    Object.defineProperty(navigator, 'xr', {
      value: mockXR,
      writable: true,
      configurable: true,
    });

    console.log('[WebXR Mock] Initialized');
  });
}

/**
 * Simulates a controller button press
 */
export async function simulateControllerInput(page: Page, button: 'trigger' | 'grip' | 'a' | 'b') {
  await page.evaluate((btn) => {
    // Dispatch a keyboard event as proxy (since we can't inject real XR input)
    const keyMap: Record<string, string> = {
      trigger: 'Enter',
      grip: 'Space',
      a: 'KeyA',
      b: 'KeyB',
    };
    const event = new KeyboardEvent('keydown', { code: keyMap[btn] });
    document.dispatchEvent(event);
  }, button);
}
