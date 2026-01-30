'use client';

import { useXRInputSourceState, useXRInputSourceStateContext } from '@react-three/xr';
import { useEffect, useRef } from 'react';

interface VRControlsProps {
  onNextPage: () => void;
  onPrevPage: () => void;
  onFontIncrease: () => void;
  onFontDecrease: () => void;
}

export function VRControls({ 
  onNextPage, 
  onPrevPage,
  onFontIncrease,
  onFontDecrease,
}: VRControlsProps) {
  return (
    <>
      <ControllerHandler 
        hand="right"
        onTrigger={onNextPage}
        onSqueeze={onFontIncrease}
      />
      <ControllerHandler 
        hand="left"
        onTrigger={onPrevPage}
        onSqueeze={onFontDecrease}
      />
    </>
  );
}

interface ControllerHandlerProps {
  hand: 'left' | 'right';
  onTrigger: () => void;
  onSqueeze: () => void;
}

function ControllerHandler({ hand, onTrigger, onSqueeze }: ControllerHandlerProps) {
  const controller = useXRInputSourceState('controller', hand);
  const lastTriggerRef = useRef(false);
  const lastSqueezeRef = useRef(false);
  
  useEffect(() => {
    if (!controller) return;
    
    const gamepad = controller.inputSource?.gamepad;
    if (!gamepad) return;
    
    // Check trigger (index 0)
    const triggerPressed = gamepad.buttons[0]?.pressed ?? false;
    if (triggerPressed && !lastTriggerRef.current) {
      onTrigger();
    }
    lastTriggerRef.current = triggerPressed;
    
    // Check squeeze/grip (index 1)
    const squeezePressed = gamepad.buttons[1]?.pressed ?? false;
    if (squeezePressed && !lastSqueezeRef.current) {
      onSqueeze();
    }
    lastSqueezeRef.current = squeezePressed;
  });
  
  return null;
}
