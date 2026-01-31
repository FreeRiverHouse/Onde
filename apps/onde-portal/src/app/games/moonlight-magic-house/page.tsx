'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'

// ============ SOUND & HAPTIC FEEDBACK SYSTEM ============

// Audio context singleton (lazy init for SSR)
let audioCtx: AudioContext | null = null
const getAudioCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch { return null }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// ============ AMBIENT MUSIC SYSTEM ============
// Magical generative ambient music using Web Audio API

class AmbientMusicEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private droneOscs: OscillatorNode[] = []
  private isPlaying = false
  private noteInterval: ReturnType<typeof setInterval> | null = null
  private enabled = true
  
  private magicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]
  
  start(enabled: boolean) {
    this.enabled = enabled
    if (!enabled || this.isPlaying) return
    this.ctx = getAudioCtx()
    if (!this.ctx) return
    this.isPlaying = true
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime)
    this.masterGain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 2)
    this.masterGain.connect(this.ctx.destination)
    this.createDrone()
    this.scheduleNotes()
  }
  
  private createDrone() {
    if (!this.ctx || !this.masterGain) return
    const droneFreqs = [65.41, 98.00, 130.81]
    droneFreqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      const filter = this.ctx!.createBiquadFilter()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime)
      const lfo = this.ctx!.createOscillator()
      const lfoGain = this.ctx!.createGain()
      lfo.frequency.setValueAtTime(0.2 + i * 0.1, this.ctx!.currentTime)
      lfoGain.gain.setValueAtTime(1.5, this.ctx!.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(200 + i * 100, this.ctx!.currentTime)
      gain.gain.setValueAtTime(0.25 - i * 0.06, this.ctx!.currentTime)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain!)
      osc.start()
      this.droneOscs.push(osc)
    })
  }
  
  private scheduleNotes() {
    const playNote = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying || !this.enabled) return
      const note = this.magicNotes[Math.floor(Math.random() * this.magicNotes.length)]
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(note, this.ctx.currentTime)
      gain.gain.setValueAtTime(0, this.ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3)
      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start()
      osc.stop(this.ctx.currentTime + 3)
    }
    setTimeout(playNote, 2000)
    this.noteInterval = setInterval(() => { if (Math.random() > 0.3) playNote() }, 4500)
  }
  
  setVolume(enabled: boolean) {
    this.enabled = enabled
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(enabled ? 0.06 : 0, this.ctx.currentTime + 0.5)
    }
  }
  
  stop() {
    this.isPlaying = false
    if (this.noteInterval) { clearInterval(this.noteInterval); this.noteInterval = null }
    if (this.masterGain && this.ctx) this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1)
    setTimeout(() => { this.droneOscs.forEach(osc => { try { osc.stop() } catch {} }); this.droneOscs = [] }, 1100)
  }
}

let ambientMusic: AmbientMusicEngine | null = null
const getAmbientMusic = () => { if (!ambientMusic) ambientMusic = new AmbientMusicEngine(); return ambientMusic }


// Haptic feedback with pattern support
const haptic = {
  light: () => navigator?.vibrate?.(8),
  medium: () => navigator?.vibrate?.(20),
  heavy: () => navigator?.vibrate?.(40),
  success: () => navigator?.vibrate?.([25, 40, 50]),
  error: () => navigator?.vibrate?.([40, 25, 40]),
  double: () => navigator?.vibrate?.([15, 30, 15]),
  celebration: () => navigator?.vibrate?.([20, 30, 20, 30, 40]),
}

// Sound synthesis - all gentle, child-friendly tones
const sounds = {
  // Soft click for buttons - quick sine pop
  tap: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(600, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08)
    o.type = 'sine'
    g.gain.setValueAtTime(0.12, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    o.start(); o.stop(ctx.currentTime + 0.08)
    haptic.light()
  },

  // Menu button - warm ascending boop
  menuClick: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(350, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.1)
    o.type = 'sine'
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    o.start(); o.stop(ctx.currentTime + 0.12)
    haptic.medium()
  },

  // Peek/search - curious question mark sound
  peek: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(280, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.1)
    o.type = 'triangle'
    g.gain.setValueAtTime(0.14, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    o.start(); o.stop(ctx.currentTime + 0.12)
    haptic.light()
  },

  // Found! - magical sparkle chime (C-E-G-C arpeggio)
  found: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08)
      o.type = 'sine'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08)
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25)
      o.start(ctx.currentTime + i * 0.08); o.stop(ctx.currentTime + i * 0.08 + 0.25)
    })
    haptic.success()
  },

  // Miss - gentle descending "aww"
  miss: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(380, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.2)
    o.type = 'sine'
    g.gain.setValueAtTime(0.12, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
    o.start(); o.stop(ctx.currentTime + 0.22)
    haptic.error()
  },

  // Food pickup - satisfying plop
  pickup: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(220, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.06)
    o.type = 'sine'
    g.gain.setValueAtTime(0.16, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    o.start(); o.stop(ctx.currentTime + 0.1)
    haptic.double()
  },

  // Eating - happy nom nom sounds
  eating: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(180 + i * 25, ctx.currentTime + i * 0.12)
      o.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + i * 0.12 + 0.08)
      o.type = 'sine'
      g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.1)
      o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.1)
    }
    haptic.medium()
  },

  // Happy purr - warm low vibration
  purr: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), lfo = ctx.createOscillator()
    const lfoG = ctx.createGain(), g = ctx.createGain()
    lfo.frequency.setValueAtTime(22, ctx.currentTime)
    lfoG.gain.setValueAtTime(25, ctx.currentTime)
    lfo.connect(lfoG); lfoG.connect(o.frequency)
    o.frequency.setValueAtTime(70, ctx.currentTime)
    o.type = 'sine'
    o.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.15)
    g.gain.setValueAtTime(0.12, ctx.currentTime + 0.5)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    lfo.start(); o.start(); lfo.stop(ctx.currentTime + 0.8); o.stop(ctx.currentTime + 0.8)
    haptic.celebration()
  },

  // Celebration fanfare - ascending major scale
  celebrate: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [392, 440, 523, 659, 784, 1047] // G-A-C-E-G-C
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1)
      o.type = i === notes.length - 1 ? 'sine' : 'triangle'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1)
      g.gain.linearRampToValueAtTime(0.14, ctx.currentTime + i * 0.1 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.35)
      o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.35)
    })
    haptic.celebration()
  },

  // Toggle sound (always plays)
  toggle: (nowEnabled: boolean) => {
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(nowEnabled ? 660 : 330, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(nowEnabled ? 880 : 220, ctx.currentTime + 0.1)
    o.type = 'sine'
    g.gain.setValueAtTime(0.12, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    o.start(); o.stop(ctx.currentTime + 0.12)
    haptic.light()
  },

  // Wind chime - magical transition sound
  windChime: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    // Random pentatonic notes like wind chimes
    const chimeNotes = [523, 587, 659, 784, 880, 1047, 1175] // C-D-E-G-A pentatonic
    for (let i = 0; i < 5; i++) {
      const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)]
      const o = ctx.createOscillator(), g = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      o.connect(filter); filter.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(note, ctx.currentTime + i * 0.12)
      o.type = 'triangle'
      filter.type = 'highpass'
      filter.frequency.setValueAtTime(600, ctx.currentTime)
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
      g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.12 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6)
      o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.6)
    }
  },

  // Magical sparkle burst - for special moments
  sparkle: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    // Rapid high sparkle sounds
    for (let i = 0; i < 6; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(1500 + Math.random() * 2500, ctx.currentTime + i * 0.05)
      o.type = 'sine'
      g.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.05)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.15)
      o.start(ctx.currentTime + i * 0.05); o.stop(ctx.currentTime + i * 0.05 + 0.15)
    }
  },

  // ========== INTERACTIVE FURNITURE SOUNDS ==========

  // Lamp click - soft switch click with warm tone
  lampClick: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(800, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05)
    o.type = 'sine'
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    o.start(); o.stop(ctx.currentTime + 0.08)
    haptic.light()
  },

  // Cuckoo clock - bird chirp sound
  cuckoo: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    // Two-note cuckoo
    for (let i = 0; i < 2; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(i === 0 ? 880 : 660, ctx.currentTime + i * 0.4)
      o.frequency.exponentialRampToValueAtTime(i === 0 ? 770 : 550, ctx.currentTime + i * 0.4 + 0.15)
      o.type = 'triangle'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.4)
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.4 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 0.3)
      o.start(ctx.currentTime + i * 0.4); o.stop(ctx.currentTime + i * 0.4 + 0.3)
    }
    haptic.double()
  },

  // Piano notes - musical scale
  pianoNote: (enabled: boolean, noteIndex: number = 0) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [262, 294, 330, 349, 392, 440, 494, 523] // C major scale
    const freq = notes[noteIndex % notes.length]
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(freq, ctx.currentTime)
    o.type = 'triangle'
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    o.start(); o.stop(ctx.currentTime + 0.8)
    haptic.light()
  },

  // Book shuffle - paper rustling sound
  bookShuffle: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    // White noise filtered for paper sound
    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
    }
    const source = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const g = ctx.createGain()
    source.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2000, ctx.currentTime)
    filter.Q.setValueAtTime(0.5, ctx.currentTime)
    source.connect(filter); filter.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(0.08, ctx.currentTime)
    source.start()
    haptic.light()
  },

  // Picture frame magic - ethereal shimmer
  frameMagic: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      o.connect(filter); filter.connect(g); g.connect(ctx.destination)
      filter.type = 'highpass'
      filter.frequency.setValueAtTime(400, ctx.currentTime)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06)
      o.type = 'sine'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.06)
      g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.06 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.5)
      o.start(ctx.currentTime + i * 0.06); o.stop(ctx.currentTime + i * 0.06 + 0.5)
    })
    haptic.medium()
  },

  // Flower bloom - soft ascending chime
  flowerBloom: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [392, 523, 659, 784]
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1)
      o.type = 'sine'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1)
      g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.1 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4)
      o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.4)
    })
    haptic.success()
  },

  // Carpet whoosh - airy levitation sound
  carpetWhoosh: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    o.connect(filter); filter.connect(g); g.connect(ctx.destination)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(200, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3)
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.6)
    o.frequency.setValueAtTime(100, ctx.currentTime)
    o.type = 'sine'
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1)
    g.gain.setValueAtTime(0.12, ctx.currentTime + 0.4)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    o.start(); o.stop(ctx.currentTime + 0.8)
    haptic.celebration()
  },

  // Mirror shimmer - magical reflection sound
  mirrorShimmer: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    // Descending then ascending arpeggio for mirror effect
    const notes = [1047, 880, 784, 659, 784, 880, 1047]
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08)
      o.type = 'sine'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08)
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + i * 0.08 + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25)
      o.start(ctx.currentTime + i * 0.08); o.stop(ctx.currentTime + i * 0.08 + 0.25)
    })
    haptic.double()
  },

  // Jukebox click - musical button press with melody hint
  jukeboxClick: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    // Quick musical arpeggio to indicate song change
    const notes = [523, 659, 784] // C-E-G chord
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.05)
      o.type = 'triangle'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.05)
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.05 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.15)
      o.start(ctx.currentTime + i * 0.05); o.stop(ctx.currentTime + i * 0.05 + 0.15)
    })
    haptic.medium()
  },

  // Jukebox stop - descending notes
  jukeboxStop: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [523, 392, 262] // C-G-C descending
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08)
      o.type = 'triangle'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08)
      g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.08 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2)
      o.start(ctx.currentTime + i * 0.08); o.stop(ctx.currentTime + i * 0.08 + 0.2)
    })
    haptic.light()
  },

  // ========== COLLECTIBLE SOUNDS ==========

  // Star collect - bright ascending chime
  collectStar: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [659, 880, 1047, 1319] // E-A-C-E high sparkle
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06)
      o.type = 'sine'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.06)
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.06 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.2)
      o.start(ctx.currentTime + i * 0.06); o.stop(ctx.currentTime + i * 0.06 + 0.2)
    })
    haptic.success()
  },

  // Heart collect - warm loving tone
  collectHeart: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [392, 523, 659] // G-C-E warm chord
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.05)
      o.type = 'triangle'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.05)
      g.gain.linearRampToValueAtTime(0.14, ctx.currentTime + i * 0.05 + 0.03)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.35)
      o.start(ctx.currentTime + i * 0.05); o.stop(ctx.currentTime + i * 0.05 + 0.35)
    })
    haptic.celebration()
  },

  // Gem collect - crystalline shimmer
  collectGem: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    // Crystal resonance - two detuned oscillators
    for (let j = 0; j < 2; j++) {
      const notes = [784, 988, 1175, 1568] // G-B-D-G crystal
      notes.forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.setValueAtTime(f + (j * 3), ctx.currentTime + i * 0.04)
        o.type = 'sine'
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.04)
        g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.04 + 0.01)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.3)
        o.start(ctx.currentTime + i * 0.04); o.stop(ctx.currentTime + i * 0.04 + 0.3)
      })
    }
    haptic.success()
  },

  // ========== PET COMPANION SOUNDS ==========

  // Cute kitten meow - soft ascending mew
  meow: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    o.connect(filter); filter.connect(g); g.connect(ctx.destination)
    
    // Start high, go higher, then drop - classic meow contour
    o.frequency.setValueAtTime(600, ctx.currentTime)
    o.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.1)
    o.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3)
    o.type = 'sine'
    
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)
    filter.Q.setValueAtTime(2, ctx.currentTime)
    
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05)
    g.gain.setValueAtTime(0.1, ctx.currentTime + 0.15)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    
    o.start(); o.stop(ctx.currentTime + 0.35)
    haptic.light()
  },

  // Cute puppy bark - short happy yip
  bark: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    
    // Two short yips
    for (let i = 0; i < 2; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      
      // Sharp attack, quick decay - yip!
      o.frequency.setValueAtTime(450, ctx.currentTime + i * 0.15)
      o.frequency.linearRampToValueAtTime(550, ctx.currentTime + i * 0.15 + 0.03)
      o.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + i * 0.15 + 0.1)
      o.type = 'triangle'
      
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.15)
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.15 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.12)
      
      o.start(ctx.currentTime + i * 0.15); o.stop(ctx.currentTime + i * 0.15 + 0.12)
    }
    haptic.double()
  },

  // Pet happy sound - cute little chirp
  petHappy: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [523, 659, 784] // C-E-G happy chord
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08)
      o.type = 'sine'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08)
      g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.08 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2)
      o.start(ctx.currentTime + i * 0.08); o.stop(ctx.currentTime + i * 0.08 + 0.2)
    })
    haptic.light()
  },

  // ========== PUZZLE & MEMORY GAME SOUNDS ==========

  // Puzzle tile slide - soft whoosh
  puzzleSlide: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    o.connect(filter); filter.connect(g); g.connect(ctx.destination)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)
    o.frequency.setValueAtTime(200, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1)
    o.type = 'sine'
    g.gain.setValueAtTime(0.1, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    o.start(); o.stop(ctx.currentTime + 0.15)
    haptic.light()
  },

  // Puzzle complete - triumphant fanfare
  puzzleComplete: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [523, 659, 784, 1047, 1319] // C-E-G-C-E triumph
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12)
      o.type = i === notes.length - 1 ? 'sine' : 'triangle'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4)
      o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.4)
    })
    haptic.celebration()
  },

  // Memory card flip - soft pop
  cardFlip: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(400, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08)
    o.type = 'sine'
    g.gain.setValueAtTime(0.12, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    o.start(); o.stop(ctx.currentTime + 0.1)
    haptic.light()
  },

  // Memory match success - happy chime
  memoryMatch: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const notes = [659, 784, 880] // E-G-A happy
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1)
      o.type = 'triangle'
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1)
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.1 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25)
      o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.25)
    })
    haptic.success()
  },

  // Memory mismatch - gentle no
  memoryMismatch: (enabled: boolean) => {
    if (!enabled) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(300, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
    o.type = 'sine'
    g.gain.setValueAtTime(0.08, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    o.start(); o.stop(ctx.currentTime + 0.18)
    haptic.light()
  }
}

// Sound toggle button component
const SoundToggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all duration-200"
    aria-label={enabled ? 'Mute sounds' : 'Unmute sounds'}
  >
    {enabled ? (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" opacity="0.3" />
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" opacity="0.2" />
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    )}
  </button>
)

// ============ TYPES ============

// Time of day for day/night cycle
type TimeOfDay = 'night' | 'dawn' | 'day' | 'dusk'

// Game state machine
type GameState = 'menu' | 'find-toy' | 'feed-time' | 'puzzle' | 'memory' | 'reward' | 'loading'

// Reward types
interface Rewards {
  treats: number
  toys: number
  stars: number
}

// Collectible item type
interface CollectibleItem {
  id: string
  type: 'star' | 'heart' | 'gem'
  x: number
  y: number
  points: number
  collected: boolean
  spawnTime: number
}

// Hidden spot type for Find the Toy game
interface HidingSpot {
  id: number
  x: number
  y: number
  type: 'couch' | 'plant' | 'box' | 'teddy' | 'gift' | 'chair' | 'bed' | 'basket'
  hasToy: boolean
}

// Food item for Feed Time game
interface FoodItem {
  id: number
  type: 'fish' | 'meat' | 'steak' | 'chicken'
  name: string
}

// Puzzle tile for sliding puzzle game
interface PuzzleTile {
  id: number
  currentPos: number
  correctPos: number
  emoji: string
}

// Memory card for memory match game
interface MemoryCard {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const HIDING_SPOT_TYPES: HidingSpot['type'][] = ['couch', 'plant', 'box', 'teddy', 'gift', 'chair', 'bed', 'basket']

// Time of day cycle configuration
const TIME_OF_DAY_CONFIG = {
  night: {
    sky: 'from-[#0a0a1a] via-[#1a1a3e] to-[#0f2040]',
    starOpacity: 1,
    moonOpacity: 1,
    sunOpacity: 0,
    ambientLight: 'rgba(100, 100, 180, 0.1)',
    warmGlow: 'rgba(255, 200, 100, 0.08)',
    duration: 30000, // 30 seconds per phase
  },
  dawn: {
    sky: 'from-[#1a1a3e] via-[#4a3a6e] to-[#ff9966]',
    starOpacity: 0.3,
    moonOpacity: 0.4,
    sunOpacity: 0.6,
    ambientLight: 'rgba(255, 180, 150, 0.15)',
    warmGlow: 'rgba(255, 150, 100, 0.15)',
    duration: 20000,
  },
  day: {
    sky: 'from-[#87CEEB] via-[#98D8E8] to-[#E0F4FF]',
    starOpacity: 0,
    moonOpacity: 0,
    sunOpacity: 1,
    ambientLight: 'rgba(255, 255, 200, 0.2)',
    warmGlow: 'rgba(255, 220, 100, 0.1)',
    duration: 30000,
  },
  dusk: {
    sky: 'from-[#2d1b4e] via-[#8b4a6b] to-[#ff6b6b]',
    starOpacity: 0.5,
    moonOpacity: 0.6,
    sunOpacity: 0.3,
    ambientLight: 'rgba(255, 100, 100, 0.12)',
    warmGlow: 'rgba(255, 100, 50, 0.12)',
    duration: 20000,
  },
}

const TIME_SEQUENCE: TimeOfDay[] = ['night', 'dawn', 'day', 'dusk']
const FOOD_ITEMS: FoodItem[] = [
  { id: 1, type: 'fish', name: 'Fish' },
  { id: 2, type: 'meat', name: 'Meat' },
  { id: 3, type: 'steak', name: 'Steak' },
  { id: 4, type: 'chicken', name: 'Chicken' },
]

// ============ ROOM CUSTOMIZATION TYPES ============
interface WallpaperPattern {
  id: string
  name: string
  svg: string
  opacity: number
  emoji: string
}

interface RoomTheme {
  id: string
  name: string
  emoji: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  windowTint: string
  wallGradient: string
  floorColor: string
  glowColor: string
}

interface RoomCustomization {
  themeId: string
  wallpaperId: string
}

const ROOM_THEMES: RoomTheme[] = [
  { id: 'cozy', name: 'Cozy Night', emoji: '🌙', primaryColor: '#2a2a4e', secondaryColor: '#1a1a3e', accentColor: '#ff9966', windowTint: '#FFE566', wallGradient: 'from-[#2a2a4e] to-[#1a1a3e]', floorColor: '#1a1a2e', glowColor: 'rgba(255, 200, 100, 0.15)' },
  { id: 'dreamy', name: 'Dreamy Pink', emoji: '💖', primaryColor: '#3e2a4e', secondaryColor: '#2e1a3e', accentColor: '#ff66b2', windowTint: '#FFB6C1', wallGradient: 'from-[#3e2a4e] to-[#2e1a3e]', floorColor: '#2e1a2e', glowColor: 'rgba(255, 105, 180, 0.15)' },
  { id: 'forest', name: 'Enchanted Forest', emoji: '🌲', primaryColor: '#1e3e2a', secondaryColor: '#0e2e1a', accentColor: '#66ff99', windowTint: '#90EE90', wallGradient: 'from-[#1e3e2a] to-[#0e2e1a]', floorColor: '#0e2e1a', glowColor: 'rgba(144, 238, 144, 0.15)' },
  { id: 'ocean', name: 'Deep Ocean', emoji: '🌊', primaryColor: '#1a2e4e', secondaryColor: '#0a1e3e', accentColor: '#66b2ff', windowTint: '#87CEEB', wallGradient: 'from-[#1a2e4e] to-[#0a1e3e]', floorColor: '#0a1e2e', glowColor: 'rgba(135, 206, 235, 0.15)' },
]

const WALLPAPER_PATTERNS: WallpaperPattern[] = [
  { id: 'none', name: 'None', svg: '', opacity: 0, emoji: '⬜' },
  { id: 'stars', name: 'Stars', svg: '<pattern id="stars-pattern" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.5"/><circle cx="30" cy="25" r="1.5" fill="currentColor" opacity="0.7"/><circle cx="20" cy="35" r="1" fill="currentColor" opacity="0.4"/></pattern>', opacity: 0.3, emoji: '⭐' },
  { id: 'hearts', name: 'Hearts', svg: '<pattern id="hearts-pattern" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M25 35 L15 25 Q10 20 15 15 Q20 10 25 18 Q30 10 35 15 Q40 20 35 25 Z" fill="currentColor" opacity="0.3"/></pattern>', opacity: 0.25, emoji: '💕' },
  { id: 'moons', name: 'Moons', svg: '<pattern id="moons-pattern" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="8" fill="currentColor" opacity="0.4"/><circle cx="24" cy="18" r="6" fill="black" opacity="0.6"/></pattern>', opacity: 0.2, emoji: '🌙' },
  { id: 'dots', name: 'Dots', svg: '<pattern id="dots-pattern" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3"/></pattern>', opacity: 0.35, emoji: '🔵' },
  { id: 'waves', name: 'Waves', svg: '<pattern id="waves-pattern" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q10 5 20 10 T40 10" stroke="currentColor" fill="none" strokeWidth="2" opacity="0.3"/></pattern>', opacity: 0.25, emoji: '🌊' },
]

const DEFAULT_ROOM_CUSTOMIZATION: RoomCustomization = {
  themeId: 'cozy',
  wallpaperId: 'stars',
}

// ============ OPTIMIZED ANIMATION STYLES ============
// GPU-accelerated animations with smooth easing curves
const animationStyles = `
  /* Smooth easing functions */
  :root {
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-in-out-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* GPU acceleration hints */
  .gpu-accelerated {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* Smooth star twinkle - 60fps optimized */
  @keyframes twinkle {
    0%, 100% { 
      opacity: 0.3; 
      transform: scale3d(0.8, 0.8, 1); 
    }
    50% { 
      opacity: 1; 
      transform: scale3d(1.2, 1.2, 1); 
    }
  }

  /* Smooth floating animation */
  @keyframes float {
    0%, 100% { 
      transform: translate3d(0, 0, 0); 
    }
    25% { 
      transform: translate3d(5px, -10px, 0); 
    }
    50% { 
      transform: translate3d(-5px, -5px, 0); 
    }
    75% { 
      transform: translate3d(3px, -15px, 0); 
    }
  }

  /* Optimized cloud drift - uses GPU transform */
  @keyframes slide-clouds {
    0% { 
      transform: translate3d(-100%, 0, 0); 
    }
    100% { 
      transform: translate3d(200%, 0, 0); 
    }
  }

  /* Firefly with smooth opacity transitions */
  @keyframes firefly {
    0%, 100% { 
      opacity: 0;
      transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
    }
    10% { 
      opacity: 1; 
    }
    50% { 
      opacity: 0.8;
      transform: translate3d(50px, -30px, 0) scale3d(1, 1, 1);
    }
    90% { 
      opacity: 1; 
    }
  }

  /* Sparkle rotation - GPU optimized */
  @keyframes sparkle {
    0%, 100% { 
      opacity: 0; 
      transform: scale3d(0, 0, 1) rotate(0deg); 
    }
    50% { 
      opacity: 1; 
      transform: scale3d(1, 1, 1) rotate(180deg); 
    }
  }

  /* Floating sparkle particles */
  @keyframes sparkle-float {
    0% { 
      opacity: 0; 
      transform: translate3d(0, 0, 0) scale3d(0, 0, 1); 
    }
    20% { 
      opacity: 1; 
      transform: translate3d(0, -10px, 0) scale3d(1, 1, 1); 
    }
    80% { 
      opacity: 1; 
      transform: translate3d(0, -40px, 0) scale3d(1, 1, 1); 
    }
    100% { 
      opacity: 0; 
      transform: translate3d(0, -60px, 0) scale3d(0, 0, 1); 
    }
  }

  /* Breathing animation for cat body - subtle */
  @keyframes breathe {
    0%, 100% { 
      transform: scale3d(1, 1, 1); 
    }
    50% { 
      transform: scale3d(1.02, 1.02, 1); 
    }
  }

  /* Smooth tail wag */
  @keyframes tail-wag {
    0%, 100% { 
      transform: rotate(-5deg); 
    }
    50% { 
      transform: rotate(5deg); 
    }
  }

  /* Gentle bounce */
  @keyframes bounce-gentle {
    0%, 100% { 
      transform: translate3d(0, 0, 0); 
    }
    50% { 
      transform: translate3d(0, -5px, 0); 
    }
  }

  /* Glow pulse - opacity only for performance */
  @keyframes glow-pulse {
    0%, 100% { 
      filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.3)); 
    }
    50% { 
      filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.6)); 
    }
  }

  /* Celebration burst */
  @keyframes celebration-burst {
    0% {
      transform: translate3d(0, 0, 0) scale3d(0, 0, 1);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      transform: translate3d(var(--burst-x, 0), var(--burst-y, -100px), 0) scale3d(1, 1, 1);
      opacity: 0;
    }
  }

  /* Animation classes with will-change hints */
  .animate-twinkle { 
    animation: twinkle 2s var(--ease-in-out-smooth) infinite;
    will-change: transform, opacity;
  }
  
  .animate-float { 
    animation: float 6s var(--ease-in-out-smooth) infinite;
    will-change: transform;
  }
  
  .animate-slide-clouds { 
    animation: slide-clouds 60s linear infinite;
    will-change: transform;
  }
  
  .animate-firefly { 
    animation: firefly 8s var(--ease-in-out-smooth) infinite;
    will-change: transform, opacity;
  }
  
  .animate-sparkle { 
    animation: sparkle 1.5s var(--ease-out-back) infinite;
    will-change: transform, opacity;
  }
  
  .animate-sparkle-float { 
    animation: sparkle-float 3s var(--ease-out-expo) infinite;
    will-change: transform, opacity;
  }
  
  .animate-breathe { 
    animation: breathe 3s var(--ease-in-out-smooth) infinite;
    will-change: transform;
  }
  
  .animate-tail-wag { 
    animation: tail-wag 0.5s var(--ease-in-out-smooth) infinite;
    transform-origin: 75px 80px;
    will-change: transform;
  }
  
  .animate-bounce-gentle { 
    animation: bounce-gentle 2s var(--ease-spring) infinite;
    will-change: transform;
  }
  
  .animate-glow-pulse { 
    animation: glow-pulse 2s var(--ease-in-out-smooth) infinite;
    will-change: filter;
  }

  .animate-celebration-burst {
    animation: celebration-burst 1.5s var(--ease-out-expo) forwards;
    will-change: transform, opacity;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .animate-twinkle,
    .animate-float,
    .animate-slide-clouds,
    .animate-firefly,
    .animate-sparkle,
    .animate-sparkle-float,
    .animate-breathe,
    .animate-tail-wag,
    .animate-bounce-gentle,
    .animate-glow-pulse,
    .animate-celebration-burst {
      animation: none !important;
    }
  }

  /* Button glow effect - GPU optimized */
  .glow-button {
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
  }
  
  .glow-button::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s var(--ease-out-expo);
    pointer-events: none;
  }
  
  .glow-button:hover::before {
    opacity: 1;
  }

  /* Smooth transitions for interactive elements */
  .smooth-transition {
    transition: transform 0.3s var(--ease-out-expo), 
                opacity 0.3s var(--ease-out-expo),
                filter 0.3s var(--ease-out-expo);
  }

  /* Warm vignette effect */
  .warm-vignette {
    box-shadow: inset 0 0 150px 50px rgba(255, 180, 100, 0.15);
  }

  /* Contain paint for performance */
  .contain-paint {
    contain: paint;
  }

  /* Smooth scale on hover for hiding spots */
  .spot-hover {
    transition: transform 0.2s var(--ease-out-back),
                filter 0.2s var(--ease-out-expo);
  }

  /* ========== DAY/NIGHT CYCLE ANIMATIONS ========== */
  
  /* Sun ray rotation */
  @keyframes sun-ray-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Celestial body rise/set */
  @keyframes celestial-rise {
    0% { transform: translateY(50px) scale(0.8); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }

  @keyframes celestial-set {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-30px) scale(0.9); opacity: 0; }
  }

  /* Sky color transition pulse */
  @keyframes sky-transition {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }

  /* Star fade for day/night */
  @keyframes star-fade-in {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes star-fade-out {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.5); }
  }

  .animate-celestial-rise {
    animation: celestial-rise 2s var(--ease-out-expo);
  }

  .animate-celestial-set {
    animation: celestial-set 2s var(--ease-out-expo);
  }

  .animate-sky-transition {
    animation: sky-transition 2s var(--ease-in-out-smooth);
  }
  
  .spot-hover:hover:not(:disabled) {
    transform: scale(1.1);
    filter: drop-shadow(0 0 15px rgba(255, 200, 100, 0.5));
  }
  
  .spot-hover:active:not(:disabled) {
    transform: scale(0.95);
  }

  /* ========== MAGIC PARTICLES ========== */
  
  /* Shooting star with trail */
  @keyframes shooting-star {
    0% {
      opacity: 0;
      transform: translate3d(0, 0, 0) scale3d(0, 0, 1);
    }
    5% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
    }
    100% {
      opacity: 0;
      transform: translate3d(200px, 150px, 0) scale3d(0.3, 0.3, 1);
    }
  }

  /* Glitter sparkle effect */
  @keyframes glitter {
    0%, 100% {
      opacity: 0;
      transform: scale3d(0, 0, 1) rotate(0deg);
      filter: drop-shadow(0 0 0 transparent);
    }
    25% {
      opacity: 1;
      transform: scale3d(1.2, 1.2, 1) rotate(90deg);
      filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
    }
    50% {
      opacity: 0.6;
      transform: scale3d(0.8, 0.8, 1) rotate(180deg);
      filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.5));
    }
    75% {
      opacity: 1;
      transform: scale3d(1, 1, 1) rotate(270deg);
      filter: drop-shadow(0 0 10px rgba(255, 215, 0, 1));
    }
  }

  /* Magic dust floating particles */
  @keyframes magic-dust {
    0% {
      opacity: 0;
      transform: translate3d(0, 0, 0) scale3d(0, 0, 1);
    }
    10% {
      opacity: 0.8;
      transform: translate3d(var(--dust-x1, 5px), var(--dust-y1, -10px), 0) scale3d(1, 1, 1);
    }
    50% {
      opacity: 1;
      transform: translate3d(var(--dust-x2, -10px), var(--dust-y2, -30px), 0) scale3d(1.2, 1.2, 1);
    }
    90% {
      opacity: 0.6;
      transform: translate3d(var(--dust-x3, 5px), var(--dust-y3, -60px), 0) scale3d(0.8, 0.8, 1);
    }
    100% {
      opacity: 0;
      transform: translate3d(var(--dust-x4, 0), var(--dust-y4, -80px), 0) scale3d(0, 0, 1);
    }
  }

  /* Fairy trail effect */
  @keyframes fairy-trail {
    0% {
      opacity: 0;
      transform: translate3d(var(--trail-start-x, 0), var(--trail-start-y, 0), 0);
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate3d(var(--trail-end-x, 100px), var(--trail-end-y, -50px), 0);
    }
  }

  /* Stardust cascade */
  @keyframes stardust-fall {
    0% {
      opacity: 0;
      transform: translate3d(0, -20px, 0) rotate(0deg);
    }
    10% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate3d(var(--fall-x, 30px), 100vh, 0) rotate(720deg);
    }
  }

  /* Magic orb pulse */
  @keyframes magic-orb {
    0%, 100% {
      transform: scale3d(1, 1, 1);
      filter: drop-shadow(0 0 10px var(--orb-color, rgba(138, 43, 226, 0.6)));
    }
    50% {
      transform: scale3d(1.3, 1.3, 1);
      filter: drop-shadow(0 0 25px var(--orb-color, rgba(138, 43, 226, 0.9)));
    }
  }

  /* Animation classes for magic particles */
  .animate-shooting-star {
    animation: shooting-star 3s var(--ease-out-expo) infinite;
    will-change: transform, opacity;
  }

  .animate-glitter {
    animation: glitter 2s var(--ease-in-out-smooth) infinite;
    will-change: transform, opacity, filter;
  }

  .animate-magic-dust {
    animation: magic-dust 4s var(--ease-out-expo) infinite;
    will-change: transform, opacity;
  }

  .animate-fairy-trail {
    animation: fairy-trail 2.5s var(--ease-out-expo) infinite;
    will-change: transform, opacity;
  }

  .animate-stardust-fall {
    animation: stardust-fall 6s linear infinite;
    will-change: transform, opacity;
  }

  .animate-magic-orb {
    animation: magic-orb 3s var(--ease-in-out-smooth) infinite;
    will-change: transform, filter;
  }

  /* Reduced motion support for magic particles */
  @media (prefers-reduced-motion: reduce) {
    .animate-shooting-star,
    .animate-glitter,
    .animate-magic-dust,
    .animate-fairy-trail,
    .animate-stardust-fall,
    .animate-magic-orb {
      animation: none !important;
    }
  }

  /* ========== INTERACTIVE FURNITURE ANIMATIONS ========== */

  /* Lamp glow pulse when lit */
  @keyframes lamp-glow {
    0%, 100% {
      filter: drop-shadow(0 0 15px rgba(255, 220, 100, 0.8));
    }
    50% {
      filter: drop-shadow(0 0 35px rgba(255, 220, 100, 1));
    }
  }

  /* Lamp flicker on activation */
  @keyframes lamp-flicker {
    0%, 100% { opacity: 1; }
    10% { opacity: 0.8; }
    20% { opacity: 1; }
    30% { opacity: 0.6; }
    40% { opacity: 1; }
    50% { opacity: 0.9; }
    60% { opacity: 1; }
  }

  /* Cuckoo bird pop out */
  @keyframes cuckoo-pop {
    0% { transform: translateX(-100%); opacity: 0; }
    20% { transform: translateX(0); opacity: 1; }
    40% { transform: translateX(0) rotate(-5deg); }
    50% { transform: translateX(0) rotate(5deg); }
    60% { transform: translateX(0) rotate(-5deg); }
    70% { transform: translateX(0) rotate(5deg); }
    80% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(-100%); opacity: 0; }
  }

  /* Clock pendulum swing */
  @keyframes pendulum-swing {
    0%, 100% { transform: rotate(-15deg); }
    50% { transform: rotate(15deg); }
  }

  /* Piano key press */
  @keyframes key-press {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.9); }
  }

  /* Piano note float */
  @keyframes note-float {
    0% { 
      opacity: 1; 
      transform: translate3d(0, 0, 0) scale(1); 
    }
    100% { 
      opacity: 0; 
      transform: translate3d(var(--note-x, 20px), -60px, 0) scale(0.5); 
    }
  }

  /* Book wiggle */
  @keyframes book-wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-8deg) translateY(-2px); }
    50% { transform: rotate(5deg) translateY(-4px); }
    75% { transform: rotate(-3deg) translateY(-2px); }
  }

  /* Book pop out */
  @keyframes book-pop {
    0% { transform: translateX(0); }
    30% { transform: translateX(15px); }
    100% { transform: translateX(0); }
  }

  /* Picture frame morph */
  @keyframes frame-shimmer {
    0% { filter: hue-rotate(0deg) brightness(1); }
    50% { filter: hue-rotate(180deg) brightness(1.2); }
    100% { filter: hue-rotate(360deg) brightness(1); }
  }

  /* Flower grow */
  @keyframes flower-grow {
    0% { transform: scaleY(0); transform-origin: bottom; }
    50% { transform: scaleY(1.1); }
    100% { transform: scaleY(1); }
  }

  /* Flower bloom */
  @keyframes flower-bloom {
    0% { transform: scale(0) rotate(0deg); }
    50% { transform: scale(1.2) rotate(180deg); }
    100% { transform: scale(1) rotate(360deg); }
  }

  /* Carpet wave */
  @keyframes carpet-wave {
    0%, 100% { 
      transform: perspective(200px) rotateX(0deg) translateY(0); 
    }
    25% { 
      transform: perspective(200px) rotateX(5deg) translateY(-5px); 
    }
    50% { 
      transform: perspective(200px) rotateX(-3deg) translateY(-10px); 
    }
    75% { 
      transform: perspective(200px) rotateX(2deg) translateY(-5px); 
    }
  }

  /* Magic carpet float up */
  @keyframes carpet-levitate {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(1deg); }
  }

  /* Mirror sparkle burst */
  @keyframes mirror-sparkle {
    0% { 
      opacity: 0;
      transform: scale(0) rotate(0deg);
    }
    50% {
      opacity: 1;
      transform: scale(1) rotate(180deg);
    }
    100% {
      opacity: 0;
      transform: scale(0) rotate(360deg);
    }
  }

  /* Mirror reflection wave */
  @keyframes mirror-wave {
    0%, 100% { 
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      filter: brightness(1);
    }
    50% {
      clip-path: polygon(5% 5%, 95% 5%, 95% 95%, 5% 95%);
      filter: brightness(1.3);
    }
  }

  /* Animation classes for furniture */
  .animate-lamp-glow {
    animation: lamp-glow 2s var(--ease-in-out-smooth) infinite;
  }

  .animate-lamp-flicker {
    animation: lamp-flicker 0.5s ease-out;
  }

  .animate-cuckoo-pop {
    animation: cuckoo-pop 2s var(--ease-out-back) forwards;
  }

  .animate-pendulum {
    animation: pendulum-swing 1s var(--ease-in-out-smooth) infinite;
    transform-origin: top center;
  }

  .animate-key-press {
    animation: key-press 0.2s var(--ease-out-expo);
    transform-origin: top;
  }

  .animate-note-float {
    animation: note-float 1.5s var(--ease-out-expo) forwards;
  }

  .animate-book-wiggle {
    animation: book-wiggle 0.5s var(--ease-out-back);
  }

  .animate-book-pop {
    animation: book-pop 0.6s var(--ease-out-back);
  }

  .animate-frame-shimmer {
    animation: frame-shimmer 2s var(--ease-in-out-smooth);
  }

  .animate-flower-grow {
    animation: flower-grow 0.8s var(--ease-out-back);
  }

  .animate-flower-bloom {
    animation: flower-bloom 0.6s var(--ease-out-back);
  }

  .animate-carpet-wave {
    animation: carpet-wave 2s var(--ease-in-out-smooth);
  }

  .animate-carpet-levitate {
    animation: carpet-levitate 3s var(--ease-in-out-smooth) infinite;
  }

  .animate-mirror-sparkle {
    animation: mirror-sparkle 1s var(--ease-out-expo);
  }

  .animate-mirror-wave {
    animation: mirror-wave 1.5s var(--ease-in-out-smooth);
  }

  /* Interactive furniture base styles */
  .furniture-interactive {
    cursor: pointer;
    transition: transform 0.2s var(--ease-out-back), filter 0.2s ease;
  }

  .furniture-interactive:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 0 10px rgba(255, 200, 100, 0.4));
  }

  .furniture-interactive:active {
    transform: scale(0.95);
  }

  /* Reduced motion for furniture */
  @media (prefers-reduced-motion: reduce) {
    .animate-lamp-glow,
    .animate-lamp-flicker,
    .animate-cuckoo-pop,
    .animate-pendulum,
    .animate-key-press,
    .animate-note-float,
    .animate-book-wiggle,
    .animate-book-pop,
    .animate-frame-shimmer,
    .animate-flower-grow,
    .animate-flower-bloom,
    .animate-carpet-wave,
    .animate-carpet-levitate,
    .animate-mirror-sparkle,
    .animate-mirror-wave {
      animation: none !important;
    }
  }

  /* ========== COLLECTIBLE ITEM ANIMATIONS ========== */

  /* Collectible spawn - pop in with sparkle */
  @keyframes collectible-spawn {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.3) rotate(10deg);
      opacity: 1;
    }
    75% {
      transform: scale(0.9) rotate(-5deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  /* Collectible idle - gentle float and glow */
  @keyframes collectible-idle {
    0%, 100% {
      transform: translateY(0) scale(1);
      filter: drop-shadow(0 0 8px var(--glow-color, rgba(255, 215, 0, 0.6)));
    }
    50% {
      transform: translateY(-6px) scale(1.05);
      filter: drop-shadow(0 0 15px var(--glow-color, rgba(255, 215, 0, 0.9)));
    }
  }

  /* Collectible collect - burst away */
  @keyframes collectible-collect {
    0% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    30% {
      transform: scale(1.5) rotate(15deg);
      opacity: 1;
    }
    100% {
      transform: scale(0) rotate(360deg) translateY(-50px);
      opacity: 0;
    }
  }

  /* Star specific rotation */
  @keyframes star-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Heart pulse */
  @keyframes heart-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
  }

  /* Gem shimmer */
  @keyframes gem-shimmer {
    0%, 100% {
      filter: hue-rotate(0deg) brightness(1);
    }
    50% {
      filter: hue-rotate(30deg) brightness(1.3);
    }
  }

  /* Points popup */
  @keyframes points-popup {
    0% {
      transform: translateY(0) scale(0.5);
      opacity: 0;
    }
    20% {
      transform: translateY(-10px) scale(1.2);
      opacity: 1;
    }
    80% {
      transform: translateY(-40px) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(-60px) scale(0.8);
      opacity: 0;
    }
  }

  /* Animation classes for collectibles */
  .animate-collectible-spawn {
    animation: collectible-spawn 0.6s var(--ease-out-back) forwards;
  }

  .animate-collectible-idle {
    animation: collectible-idle 2s var(--ease-in-out-smooth) infinite;
  }

  .animate-collectible-collect {
    animation: collectible-collect 0.5s var(--ease-out-expo) forwards;
  }

  .animate-star-rotate {
    animation: star-rotate 8s linear infinite;
  }

  .animate-heart-pulse {
    animation: heart-pulse 1s var(--ease-in-out-smooth) infinite;
  }

  .animate-gem-shimmer {
    animation: gem-shimmer 2s var(--ease-in-out-smooth) infinite;
  }

  .animate-points-popup {
    animation: points-popup 1s var(--ease-out-expo) forwards;
  }

  /* Collectible hover effect */
  .collectible-hover {
    cursor: pointer;
    transition: transform 0.15s var(--ease-out-back);
  }

  .collectible-hover:hover {
    transform: scale(1.2);
  }

  .collectible-hover:active {
    transform: scale(0.9);
  }

  /* Reduced motion for collectibles */
  @media (prefers-reduced-motion: reduce) {
    .animate-collectible-spawn,
    .animate-collectible-idle,
    .animate-collectible-collect,
    .animate-star-rotate,
    .animate-heart-pulse,
    .animate-gem-shimmer,
    .animate-points-popup {
      animation: none !important;
    }
  }
`

// ============ CUTE SVG COMPONENTS ============

// ============ PET COMPANION COMPONENT ============
// Adorable pet that follows the player around!

type PetType = 'kitten' | 'puppy'
type PetState = 'idle' | 'walking' | 'sitting' | 'happy'

const PetCompanion = ({ 
  type = 'kitten', 
  state = 'idle', 
  facingRight = true,
  className = '' 
}: { 
  type?: PetType
  state?: PetState
  facingRight?: boolean
  className?: string 
}) => {
  const transform = facingRight ? '' : 'scale(-1, 1)'
  
  if (type === 'puppy') {
    return (
      <svg viewBox="0 0 80 80" className={`${className} gpu-accelerated`} style={{ filter: 'drop-shadow(0 4px 15px rgba(200, 150, 100, 0.4))' }}>
        <g transform={`translate(40, 40) ${transform} translate(-40, -40)`}>
          {/* Puppy body */}
          <ellipse cx="40" cy="55" rx="22" ry="18" fill="#D4A574" className={state === 'walking' ? 'animate-breathe' : ''} />
          
          {/* Puppy head */}
          <circle cx="40" cy="32" r="20" fill="#D4A574" />
          
          {/* Floppy ears */}
          <ellipse cx="22" cy="30" rx="10" ry="14" fill="#C4956A" transform="rotate(-15 22 30)" />
          <ellipse cx="58" cy="30" rx="10" ry="14" fill="#C4956A" transform="rotate(15 58 30)" />
          <ellipse cx="24" cy="32" rx="6" ry="9" fill="#E8C5A0" transform="rotate(-15 24 32)" />
          <ellipse cx="56" cy="32" rx="6" ry="9" fill="#E8C5A0" transform="rotate(15 56 32)" />
          
          {/* Face markings */}
          <circle cx="40" cy="38" r="14" fill="#E8C5A0" opacity="0.7" />
          
          {/* Eyes */}
          {state === 'happy' ? (
            <>
              <path d="M32 30 Q36 24 40 30" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M48 30 Q44 24 40 30" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="34" cy="30" rx="4" ry="5" fill="#333" />
              <ellipse cx="46" cy="30" rx="4" ry="5" fill="#333" />
              <circle cx="35.5" cy="28.5" r="1.5" fill="white" />
              <circle cx="47.5" cy="28.5" r="1.5" fill="white" />
            </>
          )}
          
          {/* Nose */}
          <ellipse cx="40" cy="38" rx="5" ry="4" fill="#3D3D3D" />
          <ellipse cx="40" cy="37" rx="2" ry="1" fill="#666" />
          
          {/* Mouth */}
          <path d="M36 42 Q40 46 44 42" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Tongue when happy */}
          {state === 'happy' && (
            <ellipse cx="40" cy="46" rx="4" ry="5" fill="#FF6B8A" />
          )}
          
          {/* Blush */}
          <circle cx="26" cy="36" r="4" fill="#FFB6C1" opacity="0.5" />
          <circle cx="54" cy="36" r="4" fill="#FFB6C1" opacity="0.5" />
          
          {/* Legs */}
          <ellipse cx="28" cy="70" rx="6" ry="8" fill="#D4A574" className={state === 'walking' ? 'animate-bounce-gentle' : ''} />
          <ellipse cx="52" cy="70" rx="6" ry="8" fill="#D4A574" className={state === 'walking' ? 'animate-bounce-gentle' : ''} style={{ animationDelay: '0.15s' }} />
          
          {/* Paws */}
          <ellipse cx="28" cy="75" rx="5" ry="3" fill="#C4956A" />
          <ellipse cx="52" cy="75" rx="5" ry="3" fill="#C4956A" />
          
          {/* Tail - wagging when happy */}
          <path 
            d="M60 55 Q70 45 68 35" 
            fill="none" 
            stroke="#D4A574" 
            strokeWidth="6" 
            strokeLinecap="round"
            className={state === 'happy' || state === 'walking' ? 'animate-tail-wag' : ''}
            style={{ transformOrigin: '60px 55px' }}
          />
          
          {/* Sparkles when happy */}
          {state === 'happy' && (
            <>
              <circle cx="18" cy="20" r="2" fill="#FFD700" className="animate-sparkle" />
              <circle cx="62" cy="20" r="2" fill="#FFD700" className="animate-sparkle" style={{ animationDelay: '0.3s' }} />
            </>
          )}
        </g>
      </svg>
    )
  }
  
  // Default: Kitten
  return (
    <svg viewBox="0 0 80 80" className={`${className} gpu-accelerated`} style={{ filter: 'drop-shadow(0 4px 15px rgba(255, 180, 100, 0.4))' }}>
      <g transform={`translate(40, 40) ${transform} translate(-40, -40)`}>
        {/* Kitten body */}
        <ellipse cx="40" cy="55" rx="20" ry="16" fill="#FFB366" className={state === 'walking' ? 'animate-breathe' : ''} />
        
        {/* Kitten head */}
        <circle cx="40" cy="32" r="18" fill="#FFB366" />
        
        {/* Pointy ears */}
        <path d="M22 28 L18 8 L30 22 Z" fill="#FFB366" />
        <path d="M58 28 L62 8 L50 22 Z" fill="#FFB366" />
        <path d="M24 26 L22 14 L29 22 Z" fill="#FFD4B8" />
        <path d="M56 26 L58 14 L51 22 Z" fill="#FFD4B8" />
        
        {/* Face markings */}
        <circle cx="40" cy="38" r="12" fill="#FFD4B8" opacity="0.6" />
        
        {/* Eyes */}
        {state === 'happy' ? (
          <>
            <path d="M32 30 Q36 24 40 30" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M48 30 Q44 24 40 30" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : state === 'sitting' ? (
          <>
            <path d="M32 32 L38 32" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            <path d="M42 32 L48 32" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="34" cy="30" rx="4" ry="5" fill="#333" />
            <ellipse cx="46" cy="30" rx="4" ry="5" fill="#333" />
            <circle cx="35.5" cy="28.5" r="1.5" fill="white" />
            <circle cx="47.5" cy="28.5" r="1.5" fill="white" />
          </>
        )}
        
        {/* Nose */}
        <ellipse cx="40" cy="38" rx="3" ry="2.5" fill="#FF8FAB" />
        
        {/* Mouth */}
        <path d="M37 41 L40 44 L43 41" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Whiskers */}
        <g stroke="#333" strokeWidth="0.8" opacity="0.5">
          <line x1="18" y1="36" x2="30" y2="38" />
          <line x1="18" y1="40" x2="30" y2="40" />
          <line x1="18" y1="44" x2="30" y2="42" />
          <line x1="62" y1="36" x2="50" y2="38" />
          <line x1="62" y1="40" x2="50" y2="40" />
          <line x1="62" y1="44" x2="50" y2="42" />
        </g>
        
        {/* Blush */}
        <circle cx="26" cy="38" r="4" fill="#FF8FAB" opacity="0.4" />
        <circle cx="54" cy="38" r="4" fill="#FF8FAB" opacity="0.4" />
        
        {/* Legs */}
        <ellipse cx="30" cy="68" rx="5" ry="7" fill="#FFB366" className={state === 'walking' ? 'animate-bounce-gentle' : ''} />
        <ellipse cx="50" cy="68" rx="5" ry="7" fill="#FFB366" className={state === 'walking' ? 'animate-bounce-gentle' : ''} style={{ animationDelay: '0.15s' }} />
        
        {/* Paws */}
        <ellipse cx="30" cy="73" rx="4" ry="2.5" fill="#FFD4B8" />
        <ellipse cx="50" cy="73" rx="4" ry="2.5" fill="#FFD4B8" />
        
        {/* Tail - curved and animated */}
        <path 
          d="M58 55 Q72 50 70 35 Q68 28 72 25" 
          fill="none" 
          stroke="#FFB366" 
          strokeWidth="5" 
          strokeLinecap="round"
          className={state === 'happy' || state === 'walking' ? 'animate-tail-wag' : ''}
          style={{ transformOrigin: '58px 55px' }}
        />
        
        {/* Stripes on tail */}
        <path d="M64 45 Q66 44 65 42" fill="none" stroke="#F5A050" strokeWidth="2" strokeLinecap="round" />
        <path d="M68 38 Q70 36 68 34" fill="none" stroke="#F5A050" strokeWidth="2" strokeLinecap="round" />
        
        {/* Sparkles when happy */}
        {state === 'happy' && (
          <>
            <circle cx="15" cy="15" r="2" fill="#FFD700" className="animate-sparkle" />
            <circle cx="65" cy="15" r="2" fill="#FFD700" className="animate-sparkle" style={{ animationDelay: '0.3s' }} />
            <circle cx="70" cy="40" r="1.5" fill="#FFD700" className="animate-sparkle" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </g>
    </svg>
  )
}

// Pet companion hook - handles mouse following logic
const usePetCompanion = (enabled: boolean = true, soundEnabled: boolean = true) => {
  const [petPosition, setPetPosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [petState, setPetState] = useState<PetState>('idle')
  const [facingRight, setFacingRight] = useState(true)
  const [petType] = useState<PetType>(() => Math.random() > 0.5 ? 'kitten' : 'puppy')
  
  const lastMoveTime = useRef(Date.now())
  const animationRef = useRef<number | null>(null)
  const lastSoundTime = useRef(0)
  
  // Initialize pet position
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialX = window.innerWidth / 2
      const initialY = window.innerHeight * 0.8
      setPetPosition({ x: initialX, y: initialY })
      setTargetPosition({ x: initialX, y: initialY })
    }
  }, [])
  
  // Track mouse/touch position
  useEffect(() => {
    if (!enabled) return
    
    const handleMove = (clientX: number, clientY: number) => {
      // Add offset so pet follows a bit behind and below cursor
      const offsetY = 60
      setTargetPosition({ x: clientX, y: clientY + offsetY })
      lastMoveTime.current = Date.now()
    }
    
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [enabled])
  
  // Smooth follow animation loop
  useEffect(() => {
    if (!enabled) return
    
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }
    
    const animate = () => {
      setPetPosition(prev => {
        const dx = targetPosition.x - prev.x
        const dy = targetPosition.y - prev.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Update facing direction
        if (Math.abs(dx) > 5) {
          setFacingRight(dx > 0)
        }
        
        // Update pet state based on movement
        const timeSinceMove = Date.now() - lastMoveTime.current
        if (distance > 20) {
          setPetState('walking')
        } else if (timeSinceMove > 3000) {
          setPetState('sitting')
        } else if (timeSinceMove > 1000) {
          setPetState('idle')
        }
        
        // Smooth interpolation - faster when far, slower when close
        const speed = distance > 100 ? 0.08 : distance > 50 ? 0.06 : 0.04
        
        return {
          x: lerp(prev.x, targetPosition.x, speed),
          y: lerp(prev.y, targetPosition.y, speed)
        }
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [enabled, targetPosition])
  
  // Make pet happy occasionally and play sounds
  useEffect(() => {
    if (!enabled) return
    
    const interval = setInterval(() => {
      // Randomly become happy for a moment
      if (Math.random() > 0.7 && petState === 'idle') {
        setPetState('happy')
        
        // Play pet sound occasionally
        const now = Date.now()
        if (soundEnabled && now - lastSoundTime.current > 10000) {
          lastSoundTime.current = now
          if (petType === 'kitten') {
            sounds.meow(true)
          } else {
            sounds.bark(true)
          }
        }
        
        setTimeout(() => setPetState('idle'), 2000)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [enabled, petState, petType, soundEnabled])
  
  return { petPosition, petState, facingRight, petType }
}

const CuteCat = ({ mood = 'neutral', className = '' }: { mood?: 'neutral' | 'happy' | 'eating' | 'sleepy' | 'excited'; className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} gpu-accelerated`} style={{ filter: 'drop-shadow(0 4px 20px rgba(255, 200, 100, 0.3))' }}>
    {/* Body */}
    <ellipse cx="50" cy="70" rx="30" ry="25" fill="#FFB366" className="animate-breathe" />
    {/* Head */}
    <circle cx="50" cy="40" r="28" fill="#FFB366" />
    {/* Ears */}
    <path d="M25 25 L20 5 L35 20 Z" fill="#FFB366" />
    <path d="M75 25 L80 5 L65 20 Z" fill="#FFB366" />
    <path d="M27 23 L24 10 L34 20 Z" fill="#FFD4B8" />
    <path d="M73 23 L76 10 L66 20 Z" fill="#FFD4B8" />
    {/* Face markings */}
    <circle cx="50" cy="45" r="20" fill="#FFD4B8" opacity="0.5" />
    {/* Eyes */}
    {mood === 'happy' || mood === 'excited' ? (
      <>
        <path d="M35 38 Q40 32 45 38" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
        <path d="M55 38 Q60 32 65 38" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      </>
    ) : mood === 'sleepy' ? (
      <>
        <path d="M35 40 L45 40" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <path d="M55 40 L65 40" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      </>
    ) : mood === 'eating' ? (
      <>
        <ellipse cx="40" cy="38" rx="5" ry="6" fill="#333" />
        <ellipse cx="60" cy="38" rx="5" ry="6" fill="#333" />
        <circle cx="42" cy="36" r="2" fill="white" />
        <circle cx="62" cy="36" r="2" fill="white" />
      </>
    ) : (
      <>
        <ellipse cx="40" cy="38" rx="5" ry="6" fill="#333" />
        <ellipse cx="60" cy="38" rx="5" ry="6" fill="#333" />
        <circle cx="42" cy="36" r="2" fill="white" />
        <circle cx="62" cy="36" r="2" fill="white" />
      </>
    )}
    {/* Nose */}
    <ellipse cx="50" cy="48" rx="4" ry="3" fill="#FF8FAB" />
    {/* Mouth */}
    {mood === 'eating' ? (
      <ellipse cx="50" cy="55" rx="6" ry="4" fill="#333" />
    ) : mood === 'happy' || mood === 'excited' ? (
      <path d="M45 52 Q50 58 55 52" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d="M47 52 L50 55 L53 52" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    )}
    {/* Whiskers */}
    <g stroke="#333" strokeWidth="1" opacity="0.6">
      <line x1="20" y1="45" x2="35" y2="48" />
      <line x1="20" y1="50" x2="35" y2="50" />
      <line x1="20" y1="55" x2="35" y2="52" />
      <line x1="80" y1="45" x2="65" y2="48" />
      <line x1="80" y1="50" x2="65" y2="50" />
      <line x1="80" y1="55" x2="65" y2="52" />
    </g>
    {/* Blush */}
    <circle cx="30" cy="48" r="5" fill="#FF8FAB" opacity="0.4" />
    <circle cx="70" cy="48" r="5" fill="#FF8FAB" opacity="0.4" />
    {/* Tail */}
    <path d="M75 80 Q95 70 90 50 Q88 45 92 40" fill="none" stroke="#FFB366" strokeWidth="8" strokeLinecap="round" className="animate-tail-wag" />
    {/* Sparkles for excited mood */}
    {mood === 'excited' && (
      <>
        <circle cx="25" cy="25" r="2" fill="#FFD700" className="animate-sparkle" />
        <circle cx="75" cy="25" r="2" fill="#FFD700" className="animate-sparkle" style={{ animationDelay: '0.3s' }} />
        <circle cx="85" cy="45" r="1.5" fill="#FFD700" className="animate-sparkle" style={{ animationDelay: '0.5s' }} />
      </>
    )}
  </svg>
)

const MagicMoon = ({ className = '', phase = 'full' }: { className?: string; phase?: 'full' | 'waning' | 'crescent' | 'new' }) => (
  <svg viewBox="0 0 100 100" className={`${className} gpu-accelerated`}>
    <defs>
      <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF9E6" />
        <stop offset="70%" stopColor="#FFE566" />
        <stop offset="100%" stopColor="#FFD700" />
      </radialGradient>
      <filter id="moonBlur">
        <feGaussianBlur stdDeviation="2" />
      </filter>
      <mask id="moonPhaseMask">
        <circle cx="50" cy="50" r="28" fill="white" />
        {phase === 'waning' && <circle cx="60" cy="50" r="20" fill="black" />}
        {phase === 'crescent' && <circle cx="65" cy="50" r="24" fill="black" />}
        {phase === 'new' && <circle cx="50" cy="50" r="28" fill="black" />}
      </mask>
    </defs>
    {/* Outer glow */}
    <circle cx="50" cy="50" r="45" fill="#FFE566" opacity="0.3" filter="url(#moonBlur)" />
    <circle cx="50" cy="50" r="35" fill="#FFF9E6" opacity="0.4" filter="url(#moonBlur)" />
    {/* Moon with phase */}
    <g mask="url(#moonPhaseMask)">
      <circle cx="50" cy="50" r="28" fill="url(#moonGlow)" />
      {/* Craters */}
      <circle cx="40" cy="45" r="5" fill="#E6D280" opacity="0.5" />
      <circle cx="55" cy="55" r="7" fill="#E6D280" opacity="0.4" />
      <circle cx="60" cy="38" r="4" fill="#E6D280" opacity="0.3" />
      {/* Face */}
      <circle cx="42" cy="45" r="2" fill="#D4A84B" />
      <circle cx="58" cy="45" r="2" fill="#D4A84B" />
      <path d="M45 55 Q50 60 55 55" fill="none" stroke="#D4A84B" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
)

// Cute animated sun for daytime
const MagicSun = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} gpu-accelerated`}>
    <defs>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFACD" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </radialGradient>
      <filter id="sunBlur">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
    {/* Outer glow rays */}
    <circle cx="50" cy="50" r="48" fill="#FFD700" opacity="0.2" filter="url(#sunBlur)" />
    <circle cx="50" cy="50" r="38" fill="#FFFACD" opacity="0.3" filter="url(#sunBlur)" />
    {/* Sun rays */}
    <g className="animate-spin" style={{ animationDuration: '30s', transformOrigin: '50px 50px' }}>
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="10"
          x2="50"
          y2="20"
          stroke="#FFD700"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
    </g>
    {/* Sun body */}
    <circle cx="50" cy="50" r="25" fill="url(#sunGlow)" />
    {/* Face */}
    <circle cx="42" cy="47" r="3" fill="#E67E00" />
    <circle cx="58" cy="47" r="3" fill="#E67E00" />
    <path d="M42 56 Q50 62 58 56" fill="none" stroke="#E67E00" strokeWidth="2.5" strokeLinecap="round" />
    {/* Cheeks */}
    <circle cx="35" cy="52" r="4" fill="#FFA07A" opacity="0.5" />
    <circle cx="65" cy="52" r="4" fill="#FFA07A" opacity="0.5" />
  </svg>
)

// Memoized star component for performance
const Star = ({ delay = 0, size = 'md' }: { delay?: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  return (
    <svg viewBox="0 0 24 24" className={`${sizeClass} animate-twinkle gpu-accelerated`} style={{ animationDelay: `${delay}s` }}>
      <path d="M12 2L14 9L21 9L15.5 13.5L17.5 21L12 17L6.5 21L8.5 13.5L3 9L10 9Z" fill="#FFE566" />
    </svg>
  )
}

const Cloud = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 50" className={`${className} gpu-accelerated`}>
    <ellipse cx="30" cy="35" rx="20" ry="15" fill="white" opacity="0.15" />
    <ellipse cx="50" cy="30" rx="25" ry="18" fill="white" opacity="0.15" />
    <ellipse cx="75" cy="35" rx="18" ry="12" fill="white" opacity="0.15" />
  </svg>
)

const Firefly = ({ delay = 0 }: { delay?: number }) => (
  <div 
    className="absolute w-2 h-2 rounded-full animate-firefly gpu-accelerated"
    style={{ 
      animationDelay: `${delay}s`,
      background: 'radial-gradient(circle, #FFE566 0%, transparent 70%)',
      boxShadow: '0 0 10px 3px rgba(255, 229, 102, 0.6)',
    }}
  />
)

const Sparkle = ({ delay = 0, className = '' }: { delay?: number; className?: string }) => (
  <div 
    className={`absolute animate-sparkle-float gpu-accelerated ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M12 0L13 9L22 12L13 15L12 24L11 15L2 12L11 9Z" fill="#FFE566" opacity="0.8" />
    </svg>
  </div>
)

// ============ INTERACTIVE FURNITURE COMPONENTS ============

// Interactive furniture type
interface FurnitureState {
  lamp: boolean
  clock: boolean
  piano: number
  bookshelf: boolean
  picture: number
  flowers: boolean
  carpet: boolean
  mirror: boolean
}

// Magic Lamp - glows when clicked
const MagicLamp = ({ isOn, onClick, soundEnabled }: { isOn: boolean; onClick: () => void; soundEnabled: boolean }) => {
  const [flickering, setFlickering] = useState(false)
  
  const handleClick = () => {
    sounds.lampClick(soundEnabled)
    setFlickering(true)
    setTimeout(() => setFlickering(false), 500)
    onClick()
  }
  
  return (
    <div 
      className="furniture-interactive gpu-accelerated relative"
      onClick={handleClick}
      role="button"
      aria-label="Magic lamp - click to toggle"
    >
      <svg viewBox="0 0 60 80" className="w-14 h-20">
        {/* Lamp base */}
        <ellipse cx="30" cy="75" rx="18" ry="4" fill="#8B4513" />
        <rect x="18" y="60" width="24" height="16" fill="#A0522D" rx="2" />
        
        {/* Lamp stand */}
        <rect x="27" y="35" width="6" height="28" fill="#CD853F" />
        
        {/* Lamp shade */}
        <path d="M10 35 L30 10 L50 35 Z" fill="#FFF8DC" stroke="#DEB887" strokeWidth="2" />
        
        {/* Light glow when on */}
        {isOn && (
          <g className={flickering ? 'animate-lamp-flicker' : 'animate-lamp-glow'}>
            <ellipse cx="30" cy="28" rx="25" ry="20" fill="url(#lampGlow)" opacity="0.6" />
            <ellipse cx="30" cy="25" rx="15" ry="12" fill="#FFEB3B" opacity="0.4" />
          </g>
        )}
        
        {/* Bulb glow */}
        {isOn && (
          <circle cx="30" cy="30" r="8" fill="#FFD700" className="animate-lamp-glow" style={{ filter: 'blur(2px)' }} />
        )}
        
        <defs>
          <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFEB3B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Sparkles when on */}
      {isOn && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="animate-sparkle-float" style={{ animationDelay: '0s' }}>
            <Star size="sm" delay={0} />
          </div>
        </div>
      )}
    </div>
  )
}

// Cuckoo Clock - bird pops out when clicked
const CuckooClock = ({ isActive, onClick, soundEnabled }: { isActive: boolean; onClick: () => void; soundEnabled: boolean }) => {
  const [showBird, setShowBird] = useState(false)
  
  const handleClick = () => {
    if (showBird) return
    sounds.cuckoo(soundEnabled)
    setShowBird(true)
    onClick()
    setTimeout(() => setShowBird(false), 2000)
  }
  
  return (
    <div 
      className="furniture-interactive gpu-accelerated relative"
      onClick={handleClick}
      role="button"
      aria-label="Cuckoo clock - click to see bird"
    >
      <svg viewBox="0 0 70 90" className="w-16 h-20">
        {/* Clock house shape */}
        <path d="M10 35 L35 10 L60 35 L60 80 L10 80 Z" fill="#8B4513" />
        <path d="M10 35 L35 10 L60 35" fill="none" stroke="#654321" strokeWidth="3" />
        
        {/* Roof details */}
        <rect x="30" y="5" width="10" height="8" fill="#654321" />
        
        {/* Clock face */}
        <circle cx="35" cy="50" r="18" fill="#FFF8DC" stroke="#654321" strokeWidth="2" />
        <circle cx="35" cy="50" r="15" fill="none" stroke="#8B4513" strokeWidth="1" />
        
        {/* Clock numbers */}
        <text x="35" y="40" textAnchor="middle" fill="#654321" fontSize="6" fontWeight="bold">12</text>
        <text x="48" y="53" textAnchor="middle" fill="#654321" fontSize="6" fontWeight="bold">3</text>
        <text x="35" y="65" textAnchor="middle" fill="#654321" fontSize="6" fontWeight="bold">6</text>
        <text x="22" y="53" textAnchor="middle" fill="#654321" fontSize="6" fontWeight="bold">9</text>
        
        {/* Clock hands */}
        <line x1="35" y1="50" x2="35" y2="38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="50" x2="44" y2="50" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Pendulum */}
        <g className={isActive ? 'animate-pendulum' : ''}>
          <line x1="35" y1="68" x2="35" y2="82" stroke="#8B4513" strokeWidth="2" />
          <circle cx="35" cy="84" r="5" fill="#DAA520" />
        </g>
        
        {/* Bird door */}
        <rect x="27" y="25" width="16" height="12" fill="#654321" rx="1" />
        
        {/* Bird popping out */}
        {showBird && (
          <g className="animate-cuckoo-pop">
            <ellipse cx="45" cy="31" rx="8" ry="6" fill="#FFD700" />
            <circle cx="48" cy="29" r="2" fill="#333" />
            <polygon points="52,30 58,31 52,33" fill="#FF6B00" />
            <path d="M38 28 Q40 25 38 22" fill="none" stroke="#8B4513" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  )
}

// Piano - plays notes when clicked
const MagicPiano = ({ noteIndex, onClick, soundEnabled }: { noteIndex: number; onClick: () => void; soundEnabled: boolean }) => {
  const [pressedKey, setPressedKey] = useState<number | null>(null)
  const [floatingNotes, setFloatingNotes] = useState<number[]>([])
  
  const handleClick = () => {
    const key = noteIndex % 8
    sounds.pianoNote(soundEnabled, key)
    setPressedKey(key)
    setFloatingNotes(prev => [...prev, Date.now()])
    setTimeout(() => setPressedKey(null), 200)
    setTimeout(() => setFloatingNotes(prev => prev.slice(1)), 1500)
    onClick()
  }
  
  return (
    <div 
      className="furniture-interactive gpu-accelerated relative"
      onClick={handleClick}
      role="button"
      aria-label="Magic piano - click to play notes"
    >
      <svg viewBox="0 0 100 50" className="w-24 h-12">
        {/* Piano body */}
        <rect x="5" y="15" width="90" height="30" fill="#1a1a1a" rx="3" />
        <rect x="5" y="12" width="90" height="8" fill="#333" rx="2" />
        
        {/* White keys */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect 
            key={i}
            x={10 + i * 10} 
            y="18" 
            width="9" 
            height="24" 
            fill={pressedKey === i ? '#E0E0E0' : '#FFFFF0'}
            rx="1"
            className={pressedKey === i ? 'animate-key-press' : ''}
          />
        ))}
        
        {/* Black keys */}
        {[0, 1, 3, 4, 5].map((i, idx) => (
          <rect 
            key={`black-${idx}`}
            x={17 + i * 10} 
            y="18" 
            width="6" 
            height="14" 
            fill="#1a1a1a"
            rx="1"
          />
        ))}
      </svg>
      
      {/* Floating music notes */}
      {floatingNotes.map((id, i) => (
        <div 
          key={id}
          className="absolute bottom-full left-1/2 animate-note-float pointer-events-none"
          style={{ 
            '--note-x': `${(Math.random() - 0.5) * 40}px`,
            animationDelay: `${i * 0.1}s`
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="#FFD700" />
          </svg>
        </div>
      ))}
    </div>
  )
}

// Magical Bookshelf - books wiggle when clicked
const MagicBookshelf = ({ isWiggling, onClick, soundEnabled }: { isWiggling: boolean; onClick: () => void; soundEnabled: boolean }) => {
  const [activeBooks, setActiveBooks] = useState<Set<number>>(new Set())
  
  const handleClick = () => {
    sounds.bookShuffle(soundEnabled)
    const bookCount = 4
    const newActive = new Set<number>()
    for (let i = 0; i < bookCount; i++) {
      if (Math.random() > 0.3) newActive.add(i)
    }
    setActiveBooks(newActive)
    onClick()
    setTimeout(() => setActiveBooks(new Set()), 600)
  }
  
  const bookColors = ['#C62828', '#1565C0', '#2E7D32', '#F9A825']
  
  return (
    <div 
      className="furniture-interactive gpu-accelerated"
      onClick={handleClick}
      role="button"
      aria-label="Magic bookshelf - click to animate books"
    >
      <svg viewBox="0 0 80 60" className="w-20 h-14">
        {/* Shelf frame */}
        <rect x="5" y="5" width="70" height="50" fill="#8B4513" rx="2" />
        <rect x="8" y="8" width="64" height="44" fill="#654321" rx="1" />
        
        {/* Shelf divider */}
        <rect x="8" y="30" width="64" height="3" fill="#8B4513" />
        
        {/* Books top row */}
        {[0, 1].map((i) => (
          <g 
            key={`top-${i}`} 
            className={activeBooks.has(i) ? (i % 2 === 0 ? 'animate-book-wiggle' : 'animate-book-pop') : ''}
          >
            <rect x={12 + i * 25} y="10" width="8" height="18" fill={bookColors[i]} rx="1" />
            <rect x={22 + i * 25} y="12" width="10" height="16" fill={bookColors[i + 1] || '#7B1FA2'} rx="1" />
          </g>
        ))}
        
        {/* Books bottom row */}
        {[2, 3].map((i) => (
          <g 
            key={`bottom-${i}`}
            className={activeBooks.has(i) ? (i % 2 === 0 ? 'animate-book-pop' : 'animate-book-wiggle') : ''}
          >
            <rect x={12 + (i - 2) * 22} y="35" width="10" height="14" fill={bookColors[i] || '#FF5722'} rx="1" />
            <rect x={24 + (i - 2) * 22} y="36" width="8" height="13" fill={bookColors[(i + 1) % 4]} rx="1" />
          </g>
        ))}
        
        {/* Sparkle on books */}
        {isWiggling && (
          <circle cx="40" cy="25" r="3" fill="#FFD700" className="animate-sparkle" />
        )}
      </svg>
    </div>
  )
}

// Magic Picture Frame - cycles through different scenes
const MagicPicture = ({ sceneIndex, onClick, soundEnabled }: { sceneIndex: number; onClick: () => void; soundEnabled: boolean }) => {
  const [isShimmering, setIsShimmering] = useState(false)
  
  const handleClick = () => {
    sounds.frameMagic(soundEnabled)
    setIsShimmering(true)
    onClick()
    setTimeout(() => setIsShimmering(false), 2000)
  }
  
  const scenes = [
    // Mountain scene
    <g key="mountain">
      <rect x="8" y="8" width="44" height="34" fill="#87CEEB" />
      <polygon points="15,40 30,18 45,40" fill="#4CAF50" />
      <polygon points="25,40 40,22 50,40" fill="#388E3C" />
      <circle cx="45" cy="15" r="5" fill="#FFD700" />
    </g>,
    // Beach scene
    <g key="beach">
      <rect x="8" y="8" width="44" height="20" fill="#64B5F6" />
      <rect x="8" y="28" width="44" height="14" fill="#FFE082" />
      <ellipse cx="45" cy="18" rx="6" ry="5" fill="#FFEB3B" />
      <path d="M15 35 Q20 30 25 35 Q30 30 35 35" fill="none" stroke="#42A5F5" strokeWidth="2" />
    </g>,
    // Space scene
    <g key="space">
      <rect x="8" y="8" width="44" height="34" fill="#1a1a3e" />
      <circle cx="35" cy="25" r="10" fill="#B39DDB" />
      <circle cx="18" cy="15" r="2" fill="#FFEB3B" />
      <circle cx="45" cy="35" r="1.5" fill="#FFEB3B" />
      <circle cx="12" cy="30" r="1" fill="#FFEB3B" />
    </g>,
    // Forest scene
    <g key="forest">
      <rect x="8" y="8" width="44" height="34" fill="#81C784" />
      <ellipse cx="20" cy="35" rx="8" ry="15" fill="#2E7D32" />
      <ellipse cx="35" cy="38" rx="10" ry="18" fill="#388E3C" />
      <ellipse cx="48" cy="36" rx="6" ry="12" fill="#4CAF50" />
    </g>,
  ]
  
  return (
    <div 
      className="furniture-interactive gpu-accelerated"
      onClick={handleClick}
      role="button"
      aria-label="Magic picture - click to change scene"
    >
      <svg viewBox="0 0 60 50" className={`w-16 h-12 ${isShimmering ? 'animate-frame-shimmer' : ''}`}>
        {/* Ornate frame */}
        <rect x="2" y="2" width="56" height="46" fill="#DAA520" rx="3" />
        <rect x="5" y="5" width="50" height="40" fill="#B8860B" rx="2" />
        
        {/* Inner frame */}
        <rect x="7" y="7" width="46" height="36" fill="#8B4513" />
        
        {/* Scene content */}
        {scenes[sceneIndex % scenes.length]}
        
        {/* Frame decorations */}
        <circle cx="5" cy="5" r="3" fill="#FFD700" />
        <circle cx="55" cy="5" r="3" fill="#FFD700" />
        <circle cx="5" cy="45" r="3" fill="#FFD700" />
        <circle cx="55" cy="45" r="3" fill="#FFD700" />
      </svg>
    </div>
  )
}

// Magic Flower Vase - flowers grow when clicked
const MagicFlowers = ({ isBlooming, onClick, soundEnabled }: { isBlooming: boolean; onClick: () => void; soundEnabled: boolean }) => {
  const [bloomed, setBloomed] = useState(false)
  
  const handleClick = () => {
    sounds.flowerBloom(soundEnabled)
    setBloomed(false)
    onClick()
    setTimeout(() => setBloomed(true), 100)
  }
  
  return (
    <div 
      className="furniture-interactive gpu-accelerated relative"
      onClick={handleClick}
      role="button"
      aria-label="Magic flowers - click to bloom"
    >
      <svg viewBox="0 0 60 70" className="w-14 h-16">
        {/* Vase */}
        <path d="M18 70 L22 45 L38 45 L42 70 Z" fill="#7B1FA2" />
        <ellipse cx="30" cy="45" rx="12" ry="4" fill="#9C27B0" />
        <ellipse cx="30" cy="70" rx="14" ry="3" fill="#4A148C" />
        
        {/* Stems */}
        <g className={bloomed ? 'animate-flower-grow' : ''} style={{ transformOrigin: 'center bottom' }}>
          <path d="M25 45 Q22 30 20 15" fill="none" stroke="#4CAF50" strokeWidth="2" />
          <path d="M30 45 Q30 28 30 10" fill="none" stroke="#4CAF50" strokeWidth="2" />
          <path d="M35 45 Q38 30 40 15" fill="none" stroke="#4CAF50" strokeWidth="2" />
        </g>
        
        {/* Flowers */}
        <g className={bloomed ? 'animate-flower-bloom' : ''} style={{ opacity: bloomed ? 1 : 0.3 }}>
          {/* Pink flower */}
          <circle cx="20" cy="12" r="6" fill="#E91E63" />
          <circle cx="16" cy="10" r="4" fill="#F48FB1" />
          <circle cx="24" cy="10" r="4" fill="#F48FB1" />
          <circle cx="18" cy="16" r="4" fill="#F48FB1" />
          <circle cx="22" cy="16" r="4" fill="#F48FB1" />
          <circle cx="20" cy="12" r="3" fill="#FFEB3B" />
          
          {/* Yellow flower */}
          <circle cx="30" cy="7" r="5" fill="#FFEB3B" />
          <ellipse cx="26" cy="5" rx="3" ry="4" fill="#FFF59D" />
          <ellipse cx="34" cy="5" rx="3" ry="4" fill="#FFF59D" />
          <ellipse cx="27" cy="10" rx="3" ry="4" fill="#FFF59D" />
          <ellipse cx="33" cy="10" rx="3" ry="4" fill="#FFF59D" />
          <circle cx="30" cy="7" r="2.5" fill="#FF9800" />
          
          {/* Purple flower */}
          <circle cx="40" cy="12" r="5" fill="#9C27B0" />
          <circle cx="37" cy="9" r="3" fill="#CE93D8" />
          <circle cx="43" cy="9" r="3" fill="#CE93D8" />
          <circle cx="37" cy="15" r="3" fill="#CE93D8" />
          <circle cx="43" cy="15" r="3" fill="#CE93D8" />
          <circle cx="40" cy="12" r="2.5" fill="#FFEB3B" />
        </g>
        
        {/* Leaves */}
        <ellipse cx="22" cy="38" rx="4" ry="8" fill="#81C784" transform="rotate(-20 22 38)" />
        <ellipse cx="38" cy="38" rx="4" ry="8" fill="#81C784" transform="rotate(20 38 38)" />
      </svg>
      
      {/* Sparkles when blooming */}
      {bloomed && (
        <>
          <div className="absolute top-0 left-1/4 animate-sparkle-float">
            <Star size="sm" delay={0} />
          </div>
          <div className="absolute top-0 right-1/4 animate-sparkle-float" style={{ animationDelay: '0.3s' }}>
            <Star size="sm" delay={0.3} />
          </div>
        </>
      )}
    </div>
  )
}

// Magic Flying Carpet - floats and waves when clicked
const MagicCarpet = ({ isFlying, onClick, soundEnabled }: { isFlying: boolean; onClick: () => void; soundEnabled: boolean }) => {
  const [flying, setFlying] = useState(false)
  
  const handleClick = () => {
    sounds.carpetWhoosh(soundEnabled)
    setFlying(true)
    onClick()
    setTimeout(() => setFlying(false), 3000)
  }
  
  return (
    <div 
      className={`furniture-interactive gpu-accelerated ${flying ? 'animate-carpet-levitate' : ''}`}
      onClick={handleClick}
      role="button"
      aria-label="Magic carpet - click to fly"
    >
      <svg viewBox="0 0 80 40" className={`w-20 h-10 ${flying ? 'animate-carpet-wave' : ''}`}>
        {/* Carpet body with pattern */}
        <rect x="5" y="10" width="70" height="20" fill="#7B1FA2" rx="2" />
        
        {/* Border design */}
        <rect x="8" y="12" width="64" height="16" fill="none" stroke="#FFD700" strokeWidth="2" />
        
        {/* Central pattern */}
        <ellipse cx="40" cy="20" rx="15" ry="6" fill="#9C27B0" />
        <ellipse cx="40" cy="20" rx="10" ry="4" fill="#CE93D8" />
        <ellipse cx="40" cy="20" rx="5" ry="2" fill="#FFD700" />
        
        {/* Diamond patterns */}
        <polygon points="20,20 25,15 30,20 25,25" fill="#FFD700" />
        <polygon points="50,20 55,15 60,20 55,25" fill="#FFD700" />
        
        {/* Tassels */}
        <g fill="#FFD700">
          <rect x="3" y="28" width="2" height="8" rx="1" />
          <rect x="10" y="28" width="2" height="10" rx="1" />
          <rect x="68" y="28" width="2" height="10" rx="1" />
          <rect x="75" y="28" width="2" height="8" rx="1" />
        </g>
        
        {/* Magic sparkles when flying */}
        {flying && (
          <g className="animate-sparkle">
            <circle cx="15" cy="30" r="2" fill="#FFD700" />
            <circle cx="65" cy="30" r="2" fill="#FFD700" />
            <circle cx="40" cy="35" r="1.5" fill="#FFD700" />
          </g>
        )}
      </svg>
    </div>
  )
}

// Enchanted Mirror - sparkles and shows magical reflection
const EnchantedMirror = ({ isActive, onClick, soundEnabled }: { isActive: boolean; onClick: () => void; soundEnabled: boolean }) => {
  const [sparkling, setSparkling] = useState(false)
  const [sparklePositions, setSparklePositions] = useState<{x: number; y: number}[]>([])
  
  const handleClick = () => {
    sounds.mirrorShimmer(soundEnabled)
    setSparkling(true)
    // Generate random sparkle positions
    const newSparkles = Array.from({ length: 8 }, () => ({
      x: 15 + Math.random() * 30,
      y: 15 + Math.random() * 40
    }))
    setSparklePositions(newSparkles)
    onClick()
    setTimeout(() => setSparkling(false), 1500)
  }
  
  return (
    <div 
      className="furniture-interactive gpu-accelerated relative"
      onClick={handleClick}
      role="button"
      aria-label="Enchanted mirror - click for magic"
    >
      <svg viewBox="0 0 60 70" className="w-14 h-16">
        {/* Ornate frame */}
        <ellipse cx="30" cy="35" rx="26" ry="32" fill="#DAA520" />
        <ellipse cx="30" cy="35" rx="22" ry="28" fill="#B8860B" />
        
        {/* Mirror glass */}
        <ellipse cx="30" cy="35" rx="18" ry="24" fill="#E3F2FD" className={sparkling ? 'animate-mirror-wave' : ''} />
        <ellipse cx="30" cy="35" rx="18" ry="24" fill="url(#mirrorGradient)" opacity="0.5" />
        
        {/* Reflection highlight */}
        <ellipse cx="22" cy="25" rx="8" ry="12" fill="white" opacity="0.3" transform="rotate(-15 22 25)" />
        
        {/* Frame decorations */}
        <circle cx="30" cy="5" r="5" fill="#FFD700" />
        <path d="M25 5 L30 0 L35 5" fill="#FFD700" />
        
        {/* Side ornaments */}
        <circle cx="6" cy="35" r="3" fill="#FFD700" />
        <circle cx="54" cy="35" r="3" fill="#FFD700" />
        
        {/* Magic sparkles */}
        {sparkling && sparklePositions.map((pos, i) => (
          <g key={i} className="animate-mirror-sparkle" style={{ animationDelay: `${i * 0.1}s` }}>
            <path 
              d={`M${pos.x} ${pos.y - 3}L${pos.x + 1} ${pos.y}L${pos.x} ${pos.y + 3}L${pos.x - 1} ${pos.y}Z`} 
              fill="#FFD700" 
            />
          </g>
        ))}
        
        <defs>
          <radialGradient id="mirrorGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#BBDEFB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#64B5F6" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

// ============ MAGIC PARTICLE COMPONENTS ============

// Shooting star with glowing trail
const ShootingStar = ({ delay = 0, size = 'md' }: { delay?: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'w-8', md: 'w-12', lg: 'w-16' }
  return (
    <div 
      className={`absolute animate-shooting-star gpu-accelerated ${sizes[size]}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <svg viewBox="0 0 60 20" className="w-full h-auto">
        {/* Trail gradient */}
        <defs>
          <linearGradient id={`trail-${delay}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="30%" stopColor="#FFE566" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#FFD700" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Trail */}
        <path d="M0 10 Q30 8 55 10" stroke={`url(#trail-${delay})`} strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Star head */}
        <circle cx="57" cy="10" r="3" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }} />
      </svg>
    </div>
  )
}

// Glitter particle - tiny sparkling diamonds
const Glitter = ({ delay = 0, color = 'gold' }: { delay?: number; color?: 'gold' | 'silver' | 'pink' | 'blue' }) => {
  const colors = {
    gold: { fill: '#FFD700', glow: 'rgba(255, 215, 0, 0.8)' },
    silver: { fill: '#E8E8E8', glow: 'rgba(255, 255, 255, 0.8)' },
    pink: { fill: '#FF69B4', glow: 'rgba(255, 105, 180, 0.8)' },
    blue: { fill: '#87CEEB', glow: 'rgba(135, 206, 235, 0.8)' },
  }
  const c = colors[color]
  return (
    <div 
      className="absolute animate-glitter gpu-accelerated"
      style={{ animationDelay: `${delay}s` }}
    >
      <svg viewBox="0 0 12 12" className="w-2 h-2">
        <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5Z" fill={c.fill} style={{ filter: `drop-shadow(0 0 4px ${c.glow})` }} />
      </svg>
    </div>
  )
}

// Magic dust - swirling ethereal particles
const MagicDust = ({ delay = 0, variant = 1 }: { delay?: number; variant?: 1 | 2 | 3 }) => {
  const paths = {
    1: { x1: '10px', y1: '-15px', x2: '-15px', y2: '-40px', x3: '8px', y3: '-65px', x4: '-5px', y4: '-90px' },
    2: { x1: '-8px', y1: '-12px', x2: '12px', y2: '-35px', x3: '-10px', y3: '-58px', x4: '5px', y4: '-85px' },
    3: { x1: '5px', y1: '-18px', x2: '-8px', y2: '-42px', x3: '15px', y3: '-62px', x4: '0px', y4: '-88px' },
  }
  const p = paths[variant]
  return (
    <div 
      className="absolute animate-magic-dust gpu-accelerated"
      style={{ 
        animationDelay: `${delay}s`,
        '--dust-x1': p.x1,
        '--dust-y1': p.y1,
        '--dust-x2': p.x2,
        '--dust-y2': p.y2,
        '--dust-x3': p.x3,
        '--dust-y3': p.y3,
        '--dust-x4': p.x4,
        '--dust-y4': p.y4,
      } as React.CSSProperties}
    >
      <div 
        className="w-1.5 h-1.5 rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(200, 150, 255, 0.9) 0%, rgba(138, 43, 226, 0.5) 50%, transparent 100%)',
          boxShadow: '0 0 8px 2px rgba(138, 43, 226, 0.6)',
        }}
      />
    </div>
  )
}

// Stardust - gentle falling sparkles
const Stardust = ({ delay = 0, fallDirection = 'right' }: { delay?: number; fallDirection?: 'left' | 'right' | 'straight' }) => {
  const directions = { left: '-40px', right: '40px', straight: '0px' }
  return (
    <div 
      className="absolute animate-stardust-fall gpu-accelerated"
      style={{ 
        animationDelay: `${delay}s`,
        '--fall-x': directions[fallDirection],
      } as React.CSSProperties}
    >
      <svg viewBox="0 0 16 16" className="w-3 h-3">
        <circle cx="8" cy="8" r="2" fill="#FFE566" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))' }} />
        <path d="M8 2L8.5 6L8 6.5L7.5 6Z" fill="#FFE566" opacity="0.6" />
        <path d="M8 14L8.5 10L8 9.5L7.5 10Z" fill="#FFE566" opacity="0.6" />
        <path d="M2 8L6 7.5L6.5 8L6 8.5Z" fill="#FFE566" opacity="0.6" />
        <path d="M14 8L10 7.5L9.5 8L10 8.5Z" fill="#FFE566" opacity="0.6" />
      </svg>
    </div>
  )
}

// Magic orb - glowing floating sphere
const MagicOrb = ({ delay = 0, color = 'purple', size = 'md' }: { delay?: number; color?: 'purple' | 'blue' | 'gold' | 'pink'; size?: 'sm' | 'md' | 'lg' }) => {
  const colors = {
    purple: { inner: '#9B59B6', outer: 'rgba(155, 89, 182, 0.3)', glow: 'rgba(138, 43, 226, 0.6)' },
    blue: { inner: '#3498DB', outer: 'rgba(52, 152, 219, 0.3)', glow: 'rgba(52, 152, 219, 0.6)' },
    gold: { inner: '#F39C12', outer: 'rgba(243, 156, 18, 0.3)', glow: 'rgba(255, 215, 0, 0.6)' },
    pink: { inner: '#E91E63', outer: 'rgba(233, 30, 99, 0.3)', glow: 'rgba(255, 105, 180, 0.6)' },
  }
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  const c = colors[color]
  return (
    <div 
      className={`absolute animate-magic-orb gpu-accelerated ${sizes[size]}`}
      style={{ 
        animationDelay: `${delay}s`,
        '--orb-color': c.glow,
      } as React.CSSProperties}
    >
      <div 
        className="w-full h-full rounded-full"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, white 0%, ${c.inner} 40%, ${c.outer} 100%)`,
          boxShadow: `0 0 15px 5px ${c.glow}`,
        }}
      />
    </div>
  )
}

// Fairy sparkle trail
const FairyTrail = ({ delay = 0, path = 1 }: { delay?: number; path?: 1 | 2 | 3 }) => {
  const trails = {
    1: { startX: '0', startY: '0', endX: '80px', endY: '-40px' },
    2: { startX: '0', startY: '0', endX: '-60px', endY: '-60px' },
    3: { startX: '0', startY: '0', endX: '50px', endY: '30px' },
  }
  const t = trails[path]
  return (
    <div className="absolute">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute animate-fairy-trail gpu-accelerated"
          style={{
            animationDelay: `${delay + i * 0.15}s`,
            '--trail-start-x': t.startX,
            '--trail-start-y': t.startY,
            '--trail-end-x': t.endX,
            '--trail-end-y': t.endY,
            opacity: 1 - i * 0.15,
          } as React.CSSProperties}
        >
          <div 
            className="w-1 h-1 rounded-full"
            style={{
              background: '#FFD700',
              boxShadow: `0 0 ${6 - i}px ${3 - i * 0.5}px rgba(255, 215, 0, ${0.8 - i * 0.1})`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

// ============ ROOM CUSTOMIZATION UI ============

// Room wallpaper pattern SVG renderer
const WallpaperPatternSVG = ({ pattern, color = 'white' }: { pattern: WallpaperPattern; color?: string }) => {
  if (!pattern.svg) return null
  
  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      style={{ opacity: pattern.opacity, color }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs dangerouslySetInnerHTML={{ __html: pattern.svg }} />
      <rect width="100%" height="100%" fill={`url(#${pattern.id}-pattern)`} />
    </svg>
  )
}

// Room Preview for customization selector
const RoomPreview = ({ 
  theme, 
  wallpaper, 
  isSelected,
  onClick 
}: { 
  theme: RoomTheme
  wallpaper: WallpaperPattern
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
      isSelected 
        ? 'border-yellow-400 shadow-lg shadow-yellow-400/30 scale-105' 
        : 'border-white/20 hover:border-white/40 hover:scale-102'
    }`}
  >
    {/* Room background */}
    <div className={`absolute inset-0 bg-gradient-to-b ${theme.wallGradient}`} />
    
    {/* Wallpaper pattern */}
    <WallpaperPatternSVG pattern={wallpaper} color={theme.windowTint} />
    
    {/* Floor */}
    <div 
      className="absolute bottom-0 left-0 right-0 h-1/4"
      style={{ background: `linear-gradient(to bottom, ${theme.floorColor}88, ${theme.floorColor})` }}
    />
    
    {/* Glow effect */}
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ background: `radial-gradient(ellipse at center 70%, ${theme.glowColor}, transparent 70%)` }}
    />
    
    {/* Selection indicator */}
    {isSelected && (
      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-3 h-3 text-black">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
        </svg>
      </div>
    )}
  </button>
)

// Room Customization Panel
const RoomCustomizationPanel = ({ 
  isOpen, 
  onClose,
  currentTheme,
  currentWallpaper,
  onThemeChange,
  onWallpaperChange,
  soundEnabled
}: {
  isOpen: boolean
  onClose: () => void
  currentTheme: RoomTheme
  currentWallpaper: WallpaperPattern
  onThemeChange: (themeId: string) => void
  onWallpaperChange: (wallpaperId: string) => void
  soundEnabled: boolean
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'wallpapers'>('colors')
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2a2a4e] to-[#1a1a3e] rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
            🏠 Room Customization
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => { setActiveTab('colors'); sounds.tap(soundEnabled) }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'colors' 
                ? 'text-yellow-300 border-b-2 border-yellow-300' 
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            🎨 Colors
          </button>
          <button
            onClick={() => { setActiveTab('wallpapers'); sounds.tap(soundEnabled) }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'wallpapers' 
                ? 'text-yellow-300 border-b-2 border-yellow-300' 
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            🖼️ Wallpapers
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'colors' ? (
            <div className="grid grid-cols-3 gap-3">
              {ROOM_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => { onThemeChange(theme.id); sounds.tap(soundEnabled) }}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                    currentTheme.id === theme.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${theme.wallGradient} mb-2`} />
                  <span className="text-xl">{theme.emoji}</span>
                  <p className="text-white/70 text-xs mt-1 truncate">{theme.name}</p>
                  {currentTheme.id === theme.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-black">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {WALLPAPER_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => { onWallpaperChange(pattern.id); sounds.tap(soundEnabled) }}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                    currentWallpaper.id === pattern.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`relative w-full aspect-square rounded-lg bg-gradient-to-br ${currentTheme.wallGradient} overflow-hidden mb-2`}>
                    {pattern.svg && (
                      <WallpaperPatternSVG pattern={pattern} color={currentTheme.windowTint} />
                    )}
                  </div>
                  <span className="text-xl">{pattern.emoji}</span>
                  <p className="text-white/70 text-xs mt-1 truncate">{pattern.name}</p>
                  {currentWallpaper.id === pattern.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-black">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Preview */}
        <div className="p-4 border-t border-white/10">
          <p className="text-white/50 text-xs mb-2 text-center">Preview</p>
          <RoomPreview 
            theme={currentTheme} 
            wallpaper={currentWallpaper}
            isSelected={false}
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  )
}

// Room Customization Button (floating button in games)
const RoomCustomizeButton = ({ onClick, soundEnabled }: { onClick: () => void; soundEnabled: boolean }) => (
  <button
    onClick={() => { sounds.tap(soundEnabled); onClick() }}
    className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border border-white/20"
    aria-label="Customize room"
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
      <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </button>
)

// Styled Room Container with theme applied
const ThemedRoomContainer = ({ 
  children, 
  theme, 
  wallpaper,
  className = ''
}: { 
  children: React.ReactNode
  theme: RoomTheme
  wallpaper: WallpaperPattern
  className?: string
}) => (
  <div className={`relative w-full max-w-lg bg-gradient-to-b ${theme.wallGradient} rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/10 z-10 contain-paint ${className}`}>
    {/* Wallpaper pattern */}
    <WallpaperPatternSVG pattern={wallpaper} color={theme.windowTint} />
    
    {/* Room warm glow */}
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ background: `radial-gradient(ellipse at center 80%, ${theme.glowColor}, transparent 60%)` }}
    />
    
    {/* Gradient overlay at bottom for floor effect */}
    <div 
      className="absolute bottom-0 left-0 right-0 h-1/4 pointer-events-none"
      style={{ background: `linear-gradient(to bottom, transparent, ${theme.floorColor}40)` }}
    />
    
    {/* Content */}
    {children}
  </div>
)

// ============ COLLECTIBLE ITEM COMPONENTS ============

// Collectible Star - golden spinning star
const CollectibleStar = ({ 
  item, 
  onCollect, 
  soundEnabled 
}: { 
  item: CollectibleItem
  onCollect: (item: CollectibleItem) => void
  soundEnabled: boolean 
}) => {
  const [isCollecting, setIsCollecting] = useState(false)
  const [showPoints, setShowPoints] = useState(false)
  
  const handleClick = () => {
    if (item.collected || isCollecting) return
    sounds.collectStar(soundEnabled)
    setIsCollecting(true)
    setShowPoints(true)
    setTimeout(() => {
      onCollect(item)
    }, 400)
    setTimeout(() => setShowPoints(false), 1000)
  }
  
  if (item.collected && !isCollecting) return null
  
  return (
    <div 
      className={`absolute gpu-accelerated ${isCollecting ? '' : 'collectible-hover'}`}
      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={handleClick}
    >
      <div 
        className={`${isCollecting ? 'animate-collectible-collect' : 'animate-collectible-idle animate-collectible-spawn'}`}
        style={{ '--glow-color': 'rgba(255, 215, 0, 0.8)' } as React.CSSProperties}
      >
        <svg viewBox="0 0 40 40" className={`w-8 h-8 ${!isCollecting ? 'animate-star-rotate' : ''}`} style={{ animationDuration: '6s' }}>
          <defs>
            <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE566" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
            <filter id="starGlow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M20 2 L24 14 L37 14 L26 22 L30 35 L20 27 L10 35 L14 22 L3 14 L16 14 Z" 
            fill="url(#starGold)" 
            filter="url(#starGlow)"
          />
          {/* Inner sparkle */}
          <path d="M20 8 L22 16 L30 16 L23 20 L26 28 L20 23 L14 28 L17 20 L10 16 L18 16 Z" fill="#FFFACD" opacity="0.5" />
        </svg>
      </div>
      
      {/* Points popup */}
      {showPoints && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 animate-points-popup pointer-events-none">
          <span className="text-yellow-300 font-bold text-lg drop-shadow-lg">+{item.points}</span>
        </div>
      )}
    </div>
  )
}

// Collectible Heart - pulsing pink heart
const CollectibleHeart = ({ 
  item, 
  onCollect, 
  soundEnabled 
}: { 
  item: CollectibleItem
  onCollect: (item: CollectibleItem) => void
  soundEnabled: boolean 
}) => {
  const [isCollecting, setIsCollecting] = useState(false)
  const [showPoints, setShowPoints] = useState(false)
  
  const handleClick = () => {
    if (item.collected || isCollecting) return
    sounds.collectHeart(soundEnabled)
    setIsCollecting(true)
    setShowPoints(true)
    setTimeout(() => {
      onCollect(item)
    }, 400)
    setTimeout(() => setShowPoints(false), 1000)
  }
  
  if (item.collected && !isCollecting) return null
  
  return (
    <div 
      className={`absolute gpu-accelerated ${isCollecting ? '' : 'collectible-hover'}`}
      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={handleClick}
    >
      <div 
        className={`${isCollecting ? 'animate-collectible-collect' : 'animate-collectible-idle animate-collectible-spawn'}`}
        style={{ '--glow-color': 'rgba(255, 105, 180, 0.8)' } as React.CSSProperties}
      >
        <svg viewBox="0 0 40 36" className={`w-8 h-7 ${!isCollecting ? 'animate-heart-pulse' : ''}`}>
          <defs>
            <linearGradient id="heartPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF69B4" />
              <stop offset="50%" stopColor="#FF1493" />
              <stop offset="100%" stopColor="#C71585" />
            </linearGradient>
            <filter id="heartGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M20 35 C10 28 0 20 0 11 C0 5 5 0 11 0 C14 0 17 1.5 20 5 C23 1.5 26 0 29 0 C35 0 40 5 40 11 C40 20 30 28 20 35 Z" 
            fill="url(#heartPink)" 
            filter="url(#heartGlow)"
          />
          {/* Inner shine */}
          <ellipse cx="12" cy="12" rx="5" ry="6" fill="white" opacity="0.3" />
        </svg>
      </div>
      
      {/* Points popup */}
      {showPoints && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 animate-points-popup pointer-events-none">
          <span className="text-pink-300 font-bold text-lg drop-shadow-lg">+{item.points}</span>
        </div>
      )}
    </div>
  )
}

// Collectible Gem - shimmering crystal
const CollectibleGem = ({ 
  item, 
  onCollect, 
  soundEnabled 
}: { 
  item: CollectibleItem
  onCollect: (item: CollectibleItem) => void
  soundEnabled: boolean 
}) => {
  const [isCollecting, setIsCollecting] = useState(false)
  const [showPoints, setShowPoints] = useState(false)
  
  const handleClick = () => {
    if (item.collected || isCollecting) return
    sounds.collectGem(soundEnabled)
    setIsCollecting(true)
    setShowPoints(true)
    setTimeout(() => {
      onCollect(item)
    }, 400)
    setTimeout(() => setShowPoints(false), 1000)
  }
  
  if (item.collected && !isCollecting) return null
  
  return (
    <div 
      className={`absolute gpu-accelerated ${isCollecting ? '' : 'collectible-hover'}`}
      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={handleClick}
    >
      <div 
        className={`${isCollecting ? 'animate-collectible-collect' : 'animate-collectible-idle animate-collectible-spawn animate-gem-shimmer'}`}
        style={{ '--glow-color': 'rgba(138, 43, 226, 0.8)' } as React.CSSProperties}
      >
        <svg viewBox="0 0 36 40" className="w-7 h-8">
          <defs>
            <linearGradient id="gemPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0B0FF" />
              <stop offset="30%" stopColor="#9B59B6" />
              <stop offset="70%" stopColor="#8E44AD" />
              <stop offset="100%" stopColor="#6C3483" />
            </linearGradient>
            <filter id="gemGlow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Gem body */}
          <polygon points="18,0 36,12 30,40 6,40 0,12" fill="url(#gemPurple)" filter="url(#gemGlow)" />
          {/* Facets */}
          <polygon points="18,0 30,12 18,18 6,12" fill="#D8BFD8" opacity="0.5" />
          <polygon points="30,12 36,12 30,40 18,18" fill="#BA55D3" opacity="0.3" />
          <polygon points="6,12 0,12 6,40 18,18" fill="#9370DB" opacity="0.4" />
          {/* Center highlight */}
          <polygon points="18,8 24,14 18,22 12,14" fill="white" opacity="0.4" />
        </svg>
      </div>
      
      {/* Points popup */}
      {showPoints && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 animate-points-popup pointer-events-none">
          <span className="text-purple-300 font-bold text-lg drop-shadow-lg">+{item.points}</span>
        </div>
      )}
    </div>
  )
}

// Collectible renderer - renders the right type
const CollectibleRenderer = ({ 
  item, 
  onCollect, 
  soundEnabled 
}: { 
  item: CollectibleItem
  onCollect: (item: CollectibleItem) => void
  soundEnabled: boolean 
}) => {
  switch (item.type) {
    case 'star':
      return <CollectibleStar item={item} onCollect={onCollect} soundEnabled={soundEnabled} />
    case 'heart':
      return <CollectibleHeart item={item} onCollect={onCollect} soundEnabled={soundEnabled} />
    case 'gem':
      return <CollectibleGem item={item} onCollect={onCollect} soundEnabled={soundEnabled} />
    default:
      return null
  }
}

// Hiding spot illustrations
const HidingSpotSVG = ({ type, revealed, hasToy }: { type: HidingSpot['type']; revealed: boolean; hasToy: boolean }) => {
  if (revealed && hasToy) {
    return (
      <div className="relative gpu-accelerated">
        <svg viewBox="0 0 80 80" className="w-20 h-20 animate-bounce-gentle">
          {/* Teddy bear toy */}
          <circle cx="40" cy="35" r="20" fill="#C4A484" />
          <circle cx="30" cy="30" r="6" fill="#A08060" />
          <circle cx="50" cy="30" r="6" fill="#A08060" />
          <circle cx="40" cy="55" r="15" fill="#C4A484" />
          <ellipse cx="25" cy="55" rx="8" ry="10" fill="#C4A484" />
          <ellipse cx="55" cy="55" rx="8" ry="10" fill="#C4A484" />
          <circle cx="35" cy="32" r="3" fill="#333" />
          <circle cx="45" cy="32" r="3" fill="#333" />
          <ellipse cx="40" cy="40" rx="4" ry="3" fill="#8B6F5A" />
          <path d="M36 45 Q40 50 44 45" fill="none" stroke="#333" strokeWidth="2" />
          <circle cx="40" cy="55" r="8" fill="#F5E6D3" />
        </svg>
        <div className="absolute -top-2 -right-2 animate-sparkle">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M12 0L14 9L22 12L14 15L12 24L10 15L2 12L10 9Z" fill="#FFD700" />
          </svg>
        </div>
      </div>
    )
  }

  const svgContent = () => {
    switch (type) {
      case 'couch':
        return (
          <svg viewBox="0 0 80 60" className="w-20 h-16">
            <rect x="5" y="20" width="70" height="35" rx="5" fill="#8B4513" />
            <rect x="10" y="15" width="25" height="25" rx="5" fill="#A0522D" />
            <rect x="45" y="15" width="25" height="25" rx="5" fill="#A0522D" />
            <rect x="5" y="45" width="10" height="10" fill="#654321" />
            <rect x="65" y="45" width="10" height="10" fill="#654321" />
          </svg>
        )
      case 'plant':
        return (
          <svg viewBox="0 0 60 80" className="w-14 h-20">
            <ellipse cx="30" cy="70" rx="15" ry="8" fill="#8B4513" />
            <rect x="22" y="55" width="16" height="18" fill="#CD853F" />
            <ellipse cx="30" cy="40" rx="20" ry="18" fill="#228B22" />
            <ellipse cx="20" cy="35" rx="8" ry="12" fill="#32CD32" />
            <ellipse cx="40" cy="35" rx="8" ry="12" fill="#32CD32" />
            <ellipse cx="30" cy="28" rx="10" ry="15" fill="#228B22" />
          </svg>
        )
      case 'box':
        return (
          <svg viewBox="0 0 70 60" className="w-16 h-14">
            <rect x="10" y="15" width="50" height="40" fill="#D2691E" />
            <polygon points="10,15 35,5 60,15 35,25" fill="#DEB887" />
            <line x1="35" y1="5" x2="35" y2="25" stroke="#8B4513" strokeWidth="2" />
            <rect x="25" y="28" width="20" height="3" fill="#8B4513" />
          </svg>
        )
      case 'teddy':
        return (
          <svg viewBox="0 0 60 70" className="w-14 h-16">
            <circle cx="30" cy="25" r="18" fill="#DEB887" />
            <circle cx="18" cy="15" r="8" fill="#D2B48C" />
            <circle cx="42" cy="15" r="8" fill="#D2B48C" />
            <circle cx="25" cy="22" r="3" fill="#333" />
            <circle cx="35" cy="22" r="3" fill="#333" />
            <ellipse cx="30" cy="30" rx="3" ry="2" fill="#8B4513" />
            <ellipse cx="30" cy="50" rx="15" ry="18" fill="#DEB887" />
            <ellipse cx="15" cy="55" rx="6" ry="8" fill="#DEB887" />
            <ellipse cx="45" cy="55" rx="6" ry="8" fill="#DEB887" />
          </svg>
        )
      case 'gift':
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14">
            <rect x="8" y="20" width="44" height="35" fill="#FF6B9D" />
            <rect x="5" y="15" width="50" height="10" fill="#FF8FAB" />
            <rect x="25" y="15" width="10" height="45" fill="#FFD700" />
            <rect x="5" y="15" width="50" height="5" fill="#FFD700" />
            <path d="M30 15 Q20 5 25 10 Q30 5 30 15" fill="#FFD700" />
            <path d="M30 15 Q40 5 35 10 Q30 5 30 15" fill="#FFD700" />
          </svg>
        )
      case 'chair':
        return (
          <svg viewBox="0 0 60 70" className="w-14 h-16">
            <rect x="10" y="10" width="40" height="35" rx="3" fill="#8B4513" />
            <rect x="15" y="45" width="30" height="8" fill="#A0522D" />
            <rect x="15" y="53" width="5" height="15" fill="#654321" />
            <rect x="40" y="53" width="5" height="15" fill="#654321" />
          </svg>
        )
      case 'bed':
        return (
          <svg viewBox="0 0 80 50" className="w-20 h-12">
            <rect x="5" y="25" width="70" height="20" fill="#4A3728" />
            <rect x="5" y="15" width="25" height="15" rx="3" fill="#87CEEB" />
            <rect x="50" y="15" width="25" height="15" rx="3" fill="#87CEEB" />
            <rect x="5" y="30" width="70" height="10" fill="#FFB6C1" />
          </svg>
        )
      case 'basket':
        return (
          <svg viewBox="0 0 70 55" className="w-16 h-13">
            <ellipse cx="35" cy="45" rx="28" ry="8" fill="#8B4513" />
            <path d="M10 45 Q10 25 35 20 Q60 25 60 45" fill="none" stroke="#A0522D" strokeWidth="4" />
            <ellipse cx="35" cy="20" rx="20" ry="6" fill="#CD853F" />
            {/* Woven pattern */}
            <path d="M15 35 Q25 30 35 35 Q45 30 55 35" fill="none" stroke="#654321" strokeWidth="2" />
            <path d="M12 42 Q25 37 35 42 Q45 37 58 42" fill="none" stroke="#654321" strokeWidth="2" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={`smooth-transition ${revealed ? 'opacity-40 grayscale' : ''}`}>
      {svgContent()}
    </div>
  )
}

// Food SVG illustrations
const FoodSVG = ({ type }: { type: FoodItem['type'] }) => {
  switch (type) {
    case 'fish':
      return (
        <svg viewBox="0 0 60 40" className="w-12 h-8">
          <ellipse cx="28" cy="20" rx="22" ry="12" fill="#4FC3F7" />
          <polygon points="50,20 60,10 60,30" fill="#29B6F6" />
          <circle cx="18" cy="17" r="3" fill="#333" />
          <ellipse cx="28" cy="20" rx="18" ry="8" fill="#81D4FA" opacity="0.5" />
          <path d="M35 15 Q40 20 35 25" fill="none" stroke="#29B6F6" strokeWidth="2" />
          <path d="M42 13 Q47 20 42 27" fill="none" stroke="#29B6F6" strokeWidth="2" />
        </svg>
      )
    case 'meat':
      return (
        <svg viewBox="0 0 50 50" className="w-10 h-10">
          <ellipse cx="25" cy="30" rx="18" ry="12" fill="#C62828" />
          <ellipse cx="25" cy="28" rx="15" ry="9" fill="#EF5350" />
          <ellipse cx="25" cy="26" rx="10" ry="5" fill="#FFCDD2" />
          <rect x="20" y="10" width="10" height="20" fill="#F5F5DC" rx="2" />
        </svg>
      )
    case 'steak':
      return (
        <svg viewBox="0 0 55 45" className="w-12 h-10">
          <ellipse cx="28" cy="25" rx="22" ry="16" fill="#8D6E63" />
          <ellipse cx="28" cy="23" rx="18" ry="12" fill="#A1887F" />
          <path d="M18 20 Q28 15 38 20" fill="none" stroke="#D7CCC8" strokeWidth="3" />
          <path d="M15 28 Q28 32 41 28" fill="none" stroke="#5D4037" strokeWidth="2" />
        </svg>
      )
    case 'chicken':
      return (
        <svg viewBox="0 0 50 50" className="w-10 h-10">
          <ellipse cx="28" cy="28" rx="16" ry="14" fill="#FFAB91" />
          <ellipse cx="28" cy="26" rx="12" ry="10" fill="#FFCCBC" />
          <rect x="8" y="22" width="8" height="18" fill="#F5F5DC" rx="3" />
          <circle cx="12" cy="40" r="4" fill="#EFEBE9" />
        </svg>
      )
    default:
      return null
  }
}

// ============ MAIN COMPONENT ============

// Helper to generate collectible items
const generateCollectibles = (count: number): CollectibleItem[] => {
  const types: CollectibleItem['type'][] = ['star', 'heart', 'gem']
  const pointValues = { star: 10, heart: 15, gem: 25 }
  
  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    return {
      id: `collectible-${Date.now()}-${i}`,
      type,
      x: 10 + Math.random() * 80, // 10-90% of container width
      y: 15 + Math.random() * 70, // 15-85% of container height
      points: pointValues[type],
      collected: false,
      spawnTime: Date.now(),
    }
  })
}

export default function MoonlightMagicHouse() {
  const [isLoading, setIsLoading] = useState(true)
  const [gameState, setGameState] = useState<GameState>('loading')
  const [rewards, setRewards] = useState<Rewards>({ treats: 0, toys: 0, stars: 0 })
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Day/Night cycle state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [moonPhase, setMoonPhase] = useState<'full' | 'waning' | 'crescent' | 'new'>('full')
  
  // Pet companion state - follows the player around!
  const { petPosition, petState, facingRight, petType } = usePetCompanion(
    gameState === 'menu', // Only active in menu
    soundEnabled
  )
  const [showPetIntro, setShowPetIntro] = useState(true)
  
  // Interactive furniture state
  const [furnitureState, setFurnitureState] = useState<FurnitureState>({
    lamp: false,
    clock: false,
    piano: 0,
    bookshelf: false,
    picture: 0,
    flowers: false,
    carpet: false,
    mirror: false,
  })
  const [interactionCount, setInteractionCount] = useState(0)
  
  // Room customization state
  const [roomCustomization, setRoomCustomization] = useState<RoomCustomization>(DEFAULT_ROOM_CUSTOMIZATION)
  const [showRoomCustomizer, setShowRoomCustomizer] = useState(false)
  
  // Get current theme and wallpaper
  const currentRoomTheme = useMemo(() => 
    ROOM_THEMES.find(t => t.id === roomCustomization.themeId) || ROOM_THEMES[0]
  , [roomCustomization.themeId])
  
  const currentWallpaper = useMemo(() => 
    WALLPAPER_PATTERNS.find(p => p.id === roomCustomization.wallpaperId) || WALLPAPER_PATTERNS[0]
  , [roomCustomization.wallpaperId])
  
  // Collectible items state
  const [collectibles, setCollectibles] = useState<CollectibleItem[]>([])
  const [totalCollected, setTotalCollected] = useState(0)
  const collectibleSpawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Find the Toy game state
  const [hidingSpots, setHidingSpots] = useState<HidingSpot[]>([])
  const [triesLeft, setTriesLeft] = useState(3)
  const [foundToy, setFoundToy] = useState(false)
  const [checkedSpots, setCheckedSpots] = useState<Set<number>>(new Set())
  
  // Feed Time game state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [petFed, setPetFed] = useState(false)
  const [petMood, setPetMood] = useState<'hungry' | 'eating' | 'happy'>('hungry')
  
  // Puzzle game state
  const [puzzleTiles, setPuzzleTiles] = useState<PuzzleTile[]>([])
  const [puzzleMoves, setPuzzleMoves] = useState(0)
  const [puzzleSolved, setPuzzleSolved] = useState(false)
  
  // Achievement tracking state
  const [achievementStats, setAchievementStats] = useState({
    puzzlesCompleted: 0,
    memoryGamesCompleted: 0,
    totalStars: 0,
  })
  
  // Check achievements (stub function - updates stats)
  const checkAchievements = useCallback((stats: Partial<typeof achievementStats>) => {
    setAchievementStats(prev => ({ ...prev, ...stats }))
  }, [])
  
  // Unlock speed achievement (stub function)
  const unlockSpeedAchievement = useCallback((gameType: string, moves: number) => {
    // Achievement logic could be expanded here
    console.log(`Achievement check: ${gameType} completed in ${moves} moves`)
  }, [])
  
  // Memory game state
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [memoryMoves, setMemoryMoves] = useState(0)
  const [memoryMatches, setMemoryMatches] = useState(0)
  const [isCheckingMatch, setIsCheckingMatch] = useState(false)
  
  // RAF-based smooth dragging
  const dragRef = useRef<HTMLDivElement>(null)
  const petRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragPositionRef = useRef<{ x: number; y: number } | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Memoized star positions for background (prevents recalculation)
  const starPositions = useMemo(() => 
    [...Array(40)].map((_, i) => ({
      id: `star-deep-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${1 + Math.random() * 2}px`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 2}s`,
      opacity: 0.3 + Math.random() * 0.4,
    }))
  , [])

  const brightStarPositions = useMemo(() =>
    [...Array(12)].map((_, i) => ({
      id: `star-bright-${i}`,
      left: `${5 + Math.random() * 90}%`,
      top: `${5 + Math.random() * 50}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${4 + Math.random() * 4}s`,
      size: (['sm', 'md', 'lg'] as const)[Math.floor(Math.random() * 3)],
      starDelay: Math.random() * 2,
    }))
  , [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setGameState('menu')
      // Start ambient music when entering menu
      if (soundEnabled) {
        getAmbientMusic().start(true)
        sounds.windChime(true) // Welcome chime
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [])
  
  // Load room customization from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('moonlight-room-customization')
      if (saved) {
        const parsed = JSON.parse(saved) as RoomCustomization
        // Validate the saved data
        if (ROOM_THEMES.some(t => t.id === parsed.themeId) && 
            WALLPAPER_PATTERNS.some(p => p.id === parsed.wallpaperId)) {
          setRoomCustomization(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load room customization:', e)
    }
  }, [])
  
  // Save room customization to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('moonlight-room-customization', JSON.stringify(roomCustomization))
    } catch (e) {
      console.warn('Failed to save room customization:', e)
    }
  }, [roomCustomization])
  
  // Room customization handlers
  const handleThemeChange = useCallback((themeId: string) => {
    setRoomCustomization(prev => ({ ...prev, themeId }))
    sounds.sparkle(soundEnabled)
  }, [soundEnabled])
  
  const handleWallpaperChange = useCallback((wallpaperId: string) => {
    setRoomCustomization(prev => ({ ...prev, wallpaperId }))
    sounds.sparkle(soundEnabled)
  }, [soundEnabled])
  
  // Hide pet intro bubble after a few seconds
  useEffect(() => {
    if (gameState === 'menu' && showPetIntro) {
      const timer = setTimeout(() => setShowPetIntro(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [gameState, showPetIntro])
  
  // Day/Night cycle automatic progression
  useEffect(() => {
    if (isLoading || gameState === 'loading') return
    
    const advanceTime = () => {
      setIsTransitioning(true)
      setTimeout(() => {
        setTimeOfDay(current => {
          const currentIndex = TIME_SEQUENCE.indexOf(current)
          const nextIndex = (currentIndex + 1) % TIME_SEQUENCE.length
          const nextTime = TIME_SEQUENCE[nextIndex]
          
          // Update moon phase when transitioning to night
          if (nextTime === 'night') {
            setMoonPhase(prev => {
              const phases: Array<'full' | 'waning' | 'crescent' | 'new'> = ['full', 'waning', 'crescent', 'new']
              const currentPhaseIndex = phases.indexOf(prev)
              return phases[(currentPhaseIndex + 1) % phases.length]
            })
          }
          
          return nextTime
        })
        setIsTransitioning(false)
      }, 1000) // Transition animation duration
    }
    
    const config = TIME_OF_DAY_CONFIG[timeOfDay]
    const timer = setInterval(advanceTime, config.duration)
    
    return () => clearInterval(timer)
  }, [timeOfDay, isLoading, gameState])
  
  // Handle ambient music based on sound toggle
  useEffect(() => {
    if (gameState !== 'loading') {
      getAmbientMusic().setVolume(soundEnabled)
    }
  }, [soundEnabled, gameState])
  
  // Cleanup ambient music on unmount
  useEffect(() => {
    return () => {
      getAmbientMusic().stop()
    }
  }, [])
  
  // Collectible items spawn system
  useEffect(() => {
    if (gameState !== 'menu') {
      // Clear collectibles when leaving menu
      if (collectibleSpawnTimerRef.current) {
        clearInterval(collectibleSpawnTimerRef.current)
        collectibleSpawnTimerRef.current = null
      }
      return
    }
    
    // Initial spawn of collectibles
    setCollectibles(generateCollectibles(5))
    
    // Periodically spawn new collectibles (every 8 seconds)
    collectibleSpawnTimerRef.current = setInterval(() => {
      setCollectibles(prev => {
        // Remove old collected items and add new ones
        const activeItems = prev.filter(item => !item.collected)
        const maxItems = 8
        
        if (activeItems.length < maxItems) {
          const newCount = Math.min(2, maxItems - activeItems.length)
          const newItems = generateCollectibles(newCount)
          return [...activeItems, ...newItems]
        }
        return activeItems
      })
    }, 8000)
    
    return () => {
      if (collectibleSpawnTimerRef.current) {
        clearInterval(collectibleSpawnTimerRef.current)
      }
    }
  }, [gameState])
  
  // Handle collectible collection
  const handleCollectItem = useCallback((item: CollectibleItem) => {
    setCollectibles(prev => 
      prev.map(c => c.id === item.id ? { ...c, collected: true } : c)
    )
    setRewards(prev => ({ ...prev, stars: prev.stars + item.points }))
    setTotalCollected(prev => prev + 1)
  }, [])

  // Smooth drag animation loop using RAF
  const updateDragPosition = useCallback(() => {
    if (dragRef.current && dragPositionRef.current) {
      dragRef.current.style.transform = `translate3d(${dragPositionRef.current.x}px, ${dragPositionRef.current.y}px, 0) translate(-50%, -50%)`
    }
    if (isDraggingRef.current) {
      rafIdRef.current = requestAnimationFrame(updateDragPosition)
    }
  }, [])

  // Handle smooth drag start
  const handleDragStart = useCallback((food: FoodItem, e: React.MouseEvent | React.TouchEvent) => {
    if (petFed) return
    
    sounds.pickup(soundEnabled)
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setSelectedFood(food)
    isDraggingRef.current = true
    setIsDragging(true)
    dragPositionRef.current = { x: clientX, y: clientY }
    
    // Start RAF loop
    rafIdRef.current = requestAnimationFrame(updateDragPosition)
  }, [petFed, updateDragPosition, soundEnabled])

  // Handle smooth drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return
    
    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    dragPositionRef.current = { x: clientX, y: clientY }
  }, [])

  // Handle drag end with drop detection
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current || !selectedFood || petFed) {
      isDraggingRef.current = false
      setIsDragging(false)
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      return
    }
    
    // Check if dropped on pet
    if (petRef.current && dragPositionRef.current) {
      const petRect = petRef.current.getBoundingClientRect()
      const isOverPet = 
        dragPositionRef.current.x >= petRect.left && 
        dragPositionRef.current.x <= petRect.right &&
        dragPositionRef.current.y >= petRect.top && 
        dragPositionRef.current.y <= petRect.bottom
      
      if (isOverPet) {
        sounds.eating(soundEnabled)
        setPetMood('eating')
        setTimeout(() => {
          sounds.purr(soundEnabled)
          setPetMood('happy')
          setPetFed(true)
          setRewards(prev => ({ ...prev, treats: prev.treats + 1 }))
          setTimeout(() => {
            sounds.celebrate(soundEnabled)
            setGameState('reward')
          }, 1500)
        }, 1000)
      }
    }
    
    isDraggingRef.current = false
    setIsDragging(false)
    dragPositionRef.current = null
    setSelectedFood(null)
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
  }, [selectedFood, petFed, soundEnabled])

  // Attach global event listeners for smooth dragging
  useEffect(() => {
    if (gameState === 'feed-time') {
      window.addEventListener('mousemove', handleDragMove, { passive: false })
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDragMove, { passive: false })
      window.addEventListener('touchend', handleDragEnd)
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove)
        window.removeEventListener('mouseup', handleDragEnd)
        window.removeEventListener('touchmove', handleDragMove)
        window.removeEventListener('touchend', handleDragEnd)
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [gameState, handleDragMove, handleDragEnd])

  // Initialize Find the Toy game
  const startFindToy = useCallback(() => {
    sounds.menuClick(soundEnabled)
    sounds.windChime(soundEnabled) // Transition sound
    
    const spots: HidingSpot[] = []
    const toyIndex = Math.floor(Math.random() * 6)
    
    for (let i = 0; i < 6; i++) {
      spots.push({
        id: i,
        x: 18 + (i % 3) * 32,
        y: 30 + Math.floor(i / 3) * 30,
        type: HIDING_SPOT_TYPES[Math.floor(Math.random() * HIDING_SPOT_TYPES.length)],
        hasToy: i === toyIndex,
      })
    }
    
    setHidingSpots(spots)
    setTriesLeft(3)
    setFoundToy(false)
    setCheckedSpots(new Set())
    setGameState('find-toy')
  }, [soundEnabled])

  // Handle spot check in Find the Toy
  const checkSpot = useCallback((spot: HidingSpot) => {
    if (checkedSpots.has(spot.id) || foundToy || triesLeft <= 0) return
    
    sounds.peek(soundEnabled)
    setCheckedSpots(prev => new Set([...prev, spot.id]))
    
    if (spot.hasToy) {
      setFoundToy(true)
      sounds.found(soundEnabled)
      sounds.sparkle(soundEnabled) // Extra magic sparkle!
      setRewards(prev => ({ ...prev, toys: prev.toys + 1 }))
      setTimeout(() => {
        sounds.celebrate(soundEnabled)
        setGameState('reward')
      }, 1500)
    } else {
      sounds.miss(soundEnabled)
      const newTries = triesLeft - 1
      setTriesLeft(newTries)
      if (newTries <= 0) {
        setTimeout(() => setGameState('menu'), 2000)
      }
    }
  }, [checkedSpots, foundToy, triesLeft, soundEnabled])

  // Initialize Feed Time game
  const startFeedTime = useCallback(() => {
    sounds.menuClick(soundEnabled)
    sounds.windChime(soundEnabled) // Transition sound
    setSelectedFood(null)
    setPetFed(false)
    setPetMood('hungry')
    setIsDragging(false)
    isDraggingRef.current = false
    dragPositionRef.current = null
    setGameState('feed-time')
  }, [soundEnabled])
  
  // Initialize Puzzle game - 3x3 sliding puzzle
  const PUZZLE_EMOJIS = ['🌟', '🌙', '✨', '🦋', '🌸', '🎀', '💫', '🌈']
  
  const startPuzzle = useCallback(() => {
    sounds.menuClick(soundEnabled)
    sounds.windChime(soundEnabled)
    
    // Create shuffled tiles (8 tiles + 1 empty)
    const tiles: PuzzleTile[] = PUZZLE_EMOJIS.map((emoji, i) => ({
      id: i,
      currentPos: i,
      correctPos: i,
      emoji
    }))
    
    // Shuffle tiles by making valid moves (ensures solvable puzzle)
    let emptyPos = 8 // Empty position starts at bottom-right
    const getAdjacent = (pos: number) => {
      const adj: number[] = []
      const row = Math.floor(pos / 3)
      const col = pos % 3
      if (row > 0) adj.push(pos - 3) // up
      if (row < 2) adj.push(pos + 3) // down
      if (col > 0) adj.push(pos - 1) // left
      if (col < 2) adj.push(pos + 1) // right
      return adj
    }
    
    // Perform 50 random valid moves to shuffle
    for (let i = 0; i < 50; i++) {
      const adjacent = getAdjacent(emptyPos)
      const moveFrom = adjacent[Math.floor(Math.random() * adjacent.length)]
      const tileToMove = tiles.find(t => t.currentPos === moveFrom)
      if (tileToMove) {
        tileToMove.currentPos = emptyPos
        emptyPos = moveFrom
      }
    }
    
    setPuzzleTiles(tiles)
    setPuzzleMoves(0)
    setPuzzleSolved(false)
    setGameState('puzzle')
  }, [soundEnabled])
  
  // Handle puzzle tile click
  const handlePuzzleTileClick = useCallback((tileId: number) => {
    if (puzzleSolved) return
    
    const tile = puzzleTiles.find(t => t.id === tileId)
    if (!tile) return
    
    // Find empty position
    const occupiedPositions = new Set(puzzleTiles.map(t => t.currentPos))
    let emptyPos = -1
    for (let i = 0; i < 9; i++) {
      if (!occupiedPositions.has(i)) {
        emptyPos = i
        break
      }
    }
    
    // Check if tile is adjacent to empty space
    const tileRow = Math.floor(tile.currentPos / 3)
    const tileCol = tile.currentPos % 3
    const emptyRow = Math.floor(emptyPos / 3)
    const emptyCol = emptyPos % 3
    
    const isAdjacent = 
      (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
      (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow)
    
    if (isAdjacent) {
      sounds.puzzleSlide(soundEnabled)
      
      // Move tile to empty position
      const newTiles = puzzleTiles.map(t => 
        t.id === tileId ? { ...t, currentPos: emptyPos } : t
      )
      setPuzzleTiles(newTiles)
      setPuzzleMoves(prev => prev + 1)
      
      // Check if solved
      const isSolved = newTiles.every(t => t.currentPos === t.correctPos)
      if (isSolved) {
        setPuzzleSolved(true)
        sounds.puzzleComplete(soundEnabled)
        setRewards(prev => ({ ...prev, stars: prev.stars + 50 }))
        
        // Track puzzle achievements
        const finalMoves = puzzleMoves + 1
        checkAchievements({
          puzzlesCompleted: achievementStats.puzzlesCompleted + 1,
        })
        unlockSpeedAchievement('puzzle', finalMoves)
        
        setTimeout(() => {
          sounds.celebrate(soundEnabled)
          setGameState('reward')
        }, 1500)
      }
    }
  }, [puzzleTiles, puzzleSolved, soundEnabled, puzzleMoves, checkAchievements, achievementStats, unlockSpeedAchievement])
  
  // Initialize Memory game - 4x3 card grid (6 pairs)
  const MEMORY_EMOJIS = ['🌟', '🌙', '🦋', '🌸', '🎀', '💫']
  
  const startMemory = useCallback(() => {
    sounds.menuClick(soundEnabled)
    sounds.windChime(soundEnabled)
    
    // Create pairs and shuffle
    const pairs = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS]
    const shuffled = pairs.sort(() => Math.random() - 0.5)
    
    const cards: MemoryCard[] = shuffled.map((emoji, i) => ({
      id: i,
      emoji,
      isFlipped: false,
      isMatched: false
    }))
    
    setMemoryCards(cards)
    setFlippedCards([])
    setMemoryMoves(0)
    setMemoryMatches(0)
    setIsCheckingMatch(false)
    setGameState('memory')
  }, [soundEnabled])
  
  // Handle memory card click
  const handleMemoryCardClick = useCallback((cardId: number) => {
    if (isCheckingMatch) return
    
    const card = memoryCards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return
    if (flippedCards.length >= 2) return
    
    sounds.cardFlip(soundEnabled)
    
    // Flip the card
    const newCards = memoryCards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    )
    setMemoryCards(newCards)
    
    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)
    
    // Check for match if two cards are flipped
    if (newFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1)
      setIsCheckingMatch(true)
      
      const [firstId, secondId] = newFlipped
      const firstCard = newCards.find(c => c.id === firstId)
      const secondCard = newCards.find(c => c.id === secondId)
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match!
        sounds.memoryMatch(soundEnabled)
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          ))
          setFlippedCards([])
          setMemoryMatches(prev => {
            const newMatches = prev + 1
            // Check if all matched
            if (newMatches === MEMORY_EMOJIS.length) {
              sounds.puzzleComplete(soundEnabled)
              setRewards(prev => ({ ...prev, stars: prev.stars + 30 }))
              setTimeout(() => {
                sounds.celebrate(soundEnabled)
                setGameState('reward')
              }, 1000)
            }
            return newMatches
          })
          setIsCheckingMatch(false)
        }, 500)
      } else {
        // No match - flip back
        sounds.memoryMismatch(soundEnabled)
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ))
          setFlippedCards([])
          setIsCheckingMatch(false)
        }, 1000)
      }
    }
  }, [memoryCards, flippedCards, isCheckingMatch, soundEnabled])
  
  // Sound toggle handler
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newState = !prev
      sounds.toggle(newState)
      getAmbientMusic().setVolume(newState)
      // Start ambient if wasn't playing and now enabled
      if (newState && gameState !== 'loading') {
        getAmbientMusic().start(true)
      }
      return newState
    })
  }, [gameState])

  // ============ BACKGROUND COMPONENT ============
  const MagicalBackground = useCallback(({ intense = false }: { intense?: boolean }) => {
    const config = TIME_OF_DAY_CONFIG[timeOfDay]
    
    return (
    <>
      {/* CSS Animations - injected once */}
      <style jsx global>{animationStyles}</style>
      
      {/* Base gradient with warm vignette - transitions based on time of day */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br ${config.sky} warm-vignette contain-paint`}
        style={{ 
          transition: 'all 2s ease-in-out',
          opacity: isTransitioning ? 0.8 : 1,
        }}
      />
      
      {/* Parallax layer 1: Deep stars (slowest) - fade based on time */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none contain-paint"
        style={{ 
          opacity: config.starOpacity,
          transition: 'opacity 2s ease-in-out',
        }}
      >
        {starPositions.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle gpu-accelerated"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
      
      {/* Parallax layer 2: Clouds (slow drift) - adjusted opacity for day/night */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none contain-paint">
        <div className="animate-slide-clouds gpu-accelerated" style={{ animationDelay: '0s' }}>
          <Cloud className={`absolute w-40 h-20 top-[10%] ${timeOfDay === 'day' ? 'opacity-90' : 'opacity-60'}`} />
        </div>
        <div className="animate-slide-clouds gpu-accelerated" style={{ animationDelay: '-20s' }}>
          <Cloud className={`absolute w-60 h-30 top-[25%] ${timeOfDay === 'day' ? 'opacity-70' : 'opacity-40'}`} />
        </div>
        <div className="animate-slide-clouds gpu-accelerated" style={{ animationDelay: '-40s' }}>
          <Cloud className={`absolute w-32 h-16 top-[60%] ${timeOfDay === 'day' ? 'opacity-60' : 'opacity-30'}`} />
        </div>
      </div>
      
      {/* Parallax layer 3: Moon (fades based on time) */}
      <div 
        className="fixed top-8 right-8 w-24 h-24 animate-float pointer-events-none gpu-accelerated" 
        style={{ 
          animationDuration: '8s',
          opacity: config.moonOpacity,
          transition: 'opacity 2s ease-in-out',
          transform: timeOfDay === 'day' ? 'translateY(-20px)' : 'translateY(0)',
        }}
      >
        <MagicMoon className="w-full h-full" phase={moonPhase} />
      </div>
      
      {/* Parallax layer 3b: Sun (appears during day/transitions) */}
      <div 
        className="fixed top-12 left-12 w-20 h-20 animate-float pointer-events-none gpu-accelerated" 
        style={{ 
          animationDuration: '10s',
          opacity: config.sunOpacity,
          transition: 'opacity 2s ease-in-out, transform 2s ease-in-out',
          transform: timeOfDay === 'night' ? 'translateY(50px) scale(0.8)' : 'translateY(0) scale(1)',
        }}
      >
        <MagicSun className="w-full h-full" />
      </div>
      
      {/* Parallax layer 4: Bright stars with shapes - fade based on time */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none contain-paint"
        style={{ 
          opacity: config.starOpacity,
          transition: 'opacity 2s ease-in-out',
        }}
      >
        {brightStarPositions.map((star) => (
          <div
            key={star.id}
            className="absolute animate-float gpu-accelerated"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          >
            <Star size={star.size} delay={star.starDelay} />
          </div>
        ))}
      </div>
      
      {/* Fireflies layer - only at night/dusk */}
      {intense && (timeOfDay === 'night' || timeOfDay === 'dusk') && (
        <div 
          className="fixed inset-0 overflow-hidden pointer-events-none contain-paint"
          style={{ 
            opacity: timeOfDay === 'night' ? 1 : 0.6,
            transition: 'opacity 2s ease-in-out',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={`firefly-${i}`}
              className="absolute gpu-accelerated"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${30 + Math.random() * 60}%`,
              }}
            >
              <Firefly delay={i * 1.5} />
            </div>
          ))}
        </div>
      )}
      
      {/* Daytime butterflies - only during day */}
      {intense && timeOfDay === 'day' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none contain-paint">
          {[...Array(4)].map((_, i) => (
            <div
              key={`butterfly-${i}`}
              className="absolute animate-float gpu-accelerated"
              style={{
                left: `${15 + i * 20}%`,
                top: `${25 + Math.random() * 40}%`,
                animationDuration: `${5 + i * 0.5}s`,
                animationDelay: `${i * 0.8}s`,
              }}
            >
              <svg viewBox="0 0 30 20" className="w-6 h-4">
                <ellipse cx="15" cy="10" rx="2" ry="6" fill="#8B4513" />
                <ellipse cx="10" cy="8" rx="6" ry="5" fill={['#FFB6C1', '#87CEEB', '#DDA0DD', '#98FB98'][i]} opacity="0.8" className="animate-pulse" />
                <ellipse cx="20" cy="8" rx="6" ry="5" fill={['#FFB6C1', '#87CEEB', '#DDA0DD', '#98FB98'][i]} opacity="0.8" className="animate-pulse" />
                <ellipse cx="10" cy="13" rx="4" ry="3" fill={['#FF69B4', '#4682B4', '#9370DB', '#32CD32'][i]} opacity="0.7" className="animate-pulse" />
                <ellipse cx="20" cy="13" rx="4" ry="3" fill={['#FF69B4', '#4682B4', '#9370DB', '#32CD32'][i]} opacity="0.7" className="animate-pulse" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* ✨ MAGIC PARTICLES LAYER ✨ */}
      
      {/* Shooting stars - only at night/dusk/dawn */}
      {(timeOfDay === 'night' || timeOfDay === 'dusk' || timeOfDay === 'dawn') && (
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none contain-paint"
        style={{ 
          opacity: config.starOpacity,
          transition: 'opacity 2s ease-in-out',
        }}
      >
        <div className="absolute top-[5%] left-[10%]">
          <ShootingStar delay={0} size="lg" />
        </div>
        <div className="absolute top-[15%] left-[60%]">
          <ShootingStar delay={4} size="md" />
        </div>
        <div className="absolute top-[8%] left-[35%]">
          <ShootingStar delay={8} size="sm" />
        </div>
        {intense && (
          <>
            <div className="absolute top-[20%] left-[80%]">
              <ShootingStar delay={2} size="md" />
            </div>
            <div className="absolute top-[12%] left-[45%]">
              <ShootingStar delay={6} size="lg" />
            </div>
          </>
        )}
      </div>
      )}

      {/* Glitter layer - sparkling diamonds scattered around */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none contain-paint">
        {[
          { left: '8%', top: '20%', color: 'gold' as const, delay: 0 },
          { left: '92%', top: '35%', color: 'silver' as const, delay: 0.5 },
          { left: '25%', top: '65%', color: 'pink' as const, delay: 1 },
          { left: '75%', top: '15%', color: 'gold' as const, delay: 1.5 },
          { left: '45%', top: '80%', color: 'blue' as const, delay: 0.3 },
          { left: '15%', top: '45%', color: 'silver' as const, delay: 0.8 },
          { left: '85%', top: '70%', color: 'pink' as const, delay: 1.2 },
          { left: '55%', top: '25%', color: 'gold' as const, delay: 0.6 },
        ].map((g, i) => (
          <div key={`glitter-${i}`} className="absolute" style={{ left: g.left, top: g.top }}>
            <Glitter delay={g.delay} color={g.color} />
          </div>
        ))}
        {intense && [
          { left: '30%', top: '10%', color: 'gold' as const, delay: 0.2 },
          { left: '70%', top: '50%', color: 'pink' as const, delay: 0.7 },
          { left: '10%', top: '85%', color: 'blue' as const, delay: 1.1 },
          { left: '60%', top: '40%', color: 'silver' as const, delay: 0.4 },
        ].map((g, i) => (
          <div key={`glitter-intense-${i}`} className="absolute" style={{ left: g.left, top: g.top }}>
            <Glitter delay={g.delay} color={g.color} />
          </div>
        ))}
      </div>

      {/* Magic dust layer - ethereal floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none contain-paint">
        {[
          { left: '20%', top: '60%', variant: 1 as const, delay: 0 },
          { left: '80%', top: '50%', variant: 2 as const, delay: 1.5 },
          { left: '50%', top: '70%', variant: 3 as const, delay: 0.8 },
          { left: '35%', top: '40%', variant: 1 as const, delay: 2.2 },
          { left: '65%', top: '75%', variant: 2 as const, delay: 3 },
        ].map((d, i) => (
          <div key={`dust-${i}`} className="absolute" style={{ left: d.left, top: d.top }}>
            <MagicDust delay={d.delay} variant={d.variant} />
          </div>
        ))}
        {intense && [
          { left: '15%', top: '30%', variant: 3 as const, delay: 0.5 },
          { left: '85%', top: '25%', variant: 1 as const, delay: 1.8 },
          { left: '40%', top: '55%', variant: 2 as const, delay: 2.5 },
        ].map((d, i) => (
          <div key={`dust-intense-${i}`} className="absolute" style={{ left: d.left, top: d.top }}>
            <MagicDust delay={d.delay} variant={d.variant} />
          </div>
        ))}
      </div>

      {/* Stardust falling gently */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none contain-paint">
        {[
          { left: '12%', delay: 0, dir: 'right' as const },
          { left: '38%', delay: 2, dir: 'left' as const },
          { left: '67%', delay: 4, dir: 'straight' as const },
          { left: '88%', delay: 1, dir: 'left' as const },
        ].map((s, i) => (
          <div key={`stardust-${i}`} className="absolute top-0" style={{ left: s.left }}>
            <Stardust delay={s.delay} fallDirection={s.dir} />
          </div>
        ))}
        {intense && [
          { left: '25%', delay: 3, dir: 'right' as const },
          { left: '55%', delay: 5, dir: 'straight' as const },
          { left: '78%', delay: 2.5, dir: 'left' as const },
        ].map((s, i) => (
          <div key={`stardust-intense-${i}`} className="absolute top-0" style={{ left: s.left }}>
            <Stardust delay={s.delay} fallDirection={s.dir} />
          </div>
        ))}
      </div>

      {/* Magic orbs - floating glowing spheres */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none contain-paint">
        <div className="absolute top-[30%] left-[5%] animate-float" style={{ animationDuration: '10s' }}>
          <MagicOrb delay={0} color="purple" size="sm" />
        </div>
        <div className="absolute top-[60%] right-[8%] animate-float" style={{ animationDuration: '12s', animationDelay: '-3s' }}>
          <MagicOrb delay={0.5} color="blue" size="md" />
        </div>
        {intense && (
          <>
            <div className="absolute top-[45%] left-[15%] animate-float" style={{ animationDuration: '9s', animationDelay: '-5s' }}>
              <MagicOrb delay={1} color="gold" size="sm" />
            </div>
            <div className="absolute top-[25%] right-[20%] animate-float" style={{ animationDuration: '11s', animationDelay: '-2s' }}>
              <MagicOrb delay={1.5} color="pink" size="lg" />
            </div>
            <div className="absolute top-[70%] left-[40%] animate-float" style={{ animationDuration: '8s', animationDelay: '-4s' }}>
              <MagicOrb delay={0.8} color="purple" size="md" />
            </div>
          </>
        )}
      </div>

      {/* Fairy trails - occasional magical streaks (only in intense mode) */}
      {intense && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none contain-paint">
          <div className="absolute top-[40%] left-[30%]">
            <FairyTrail delay={0} path={1} />
          </div>
          <div className="absolute top-[55%] right-[25%]">
            <FairyTrail delay={2} path={2} />
          </div>
          <div className="absolute top-[35%] left-[60%]">
            <FairyTrail delay={4} path={3} />
          </div>
        </div>
      )}
      
      {/* Ambient light overlay - changes with time of day */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: timeOfDay === 'day' 
            ? 'radial-gradient(ellipse at 20% 30%, rgba(255, 255, 200, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(255, 220, 100, 0.1) 0%, transparent 50%)'
            : timeOfDay === 'dawn'
            ? 'radial-gradient(ellipse at 50% 100%, rgba(255, 180, 100, 0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255, 150, 200, 0.1) 0%, transparent 50%)'
            : timeOfDay === 'dusk'
            ? 'radial-gradient(ellipse at 50% 100%, rgba(255, 100, 50, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(150, 100, 200, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 80% 20%, rgba(255, 200, 100, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(255, 150, 100, 0.05) 0%, transparent 50%)',
          transition: 'background 2s ease-in-out',
        }}
      />
      
      {/* Time of day indicator */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
        <span className="text-lg">
          {timeOfDay === 'night' ? '🌙' : timeOfDay === 'dawn' ? '🌅' : timeOfDay === 'day' ? '☀️' : '🌇'}
        </span>
        <span className="text-white/70 text-xs font-medium capitalize">{timeOfDay}</span>
      </div>
    </>
  )}, [starPositions, brightStarPositions, timeOfDay, moonPhase, isTransitioning])

  // Render loading screen
  if (isLoading || gameState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <MagicalBackground />
        <div className="relative z-10 text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <MagicMoon className="w-full h-full animate-float" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
            </div>
          </div>
          <p className="text-white text-xl font-semibold animate-pulse">Loading Moonlight Magic House...</p>
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <Sparkle key={i} delay={i * 0.5} className="relative" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Main menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <MagicalBackground intense />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        
        <div className="relative z-10 text-center">
          {/* Title with glow effect */}
          <div className="relative mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 drop-shadow-lg">
              Moonlight Magic House
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 blur-xl -z-10" />
          </div>
          <p className="text-purple-200/80 mb-8 text-lg">Choose a mini-game to play!</p>
          
          {/* Cute cat mascot */}
          <div className="w-28 h-28 mx-auto mb-6 animate-float gpu-accelerated" style={{ animationDuration: '4s' }}>
            <CuteCat mood="happy" className="w-full h-full" />
          </div>
          
          {/* Rewards display with glow */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 border border-purple-400/20 animate-glow-pulse gpu-accelerated" style={{ animationDuration: '3s' }}>
              <span className="text-2xl">🧸</span>
              <span className="text-white font-bold text-lg">{rewards.toys}</span>
            </div>
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 border border-orange-400/20 animate-glow-pulse gpu-accelerated" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
              <span className="text-2xl">🍬</span>
              <span className="text-white font-bold text-lg">{rewards.treats}</span>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 border border-yellow-400/20 animate-glow-pulse gpu-accelerated" style={{ animationDuration: '3s', animationDelay: '1s' }}>
              <span className="text-2xl">⭐</span>
              <span className="text-white font-bold text-lg">{rewards.stars}</span>
            </div>
          </div>
          
          {/* Game buttons with glow effects */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onClick={startFindToy}
              className="glow-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-400/50 border border-white/20 smooth-transition hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Find Toy
              </span>
            </button>
            <button
              onClick={startFeedTime}
              className="glow-button bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-400/50 border border-white/20 smooth-transition hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <ellipse cx="12" cy="17" rx="9" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 12 L12 8 M9 10 L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Feed Time
              </span>
            </button>
            <button
              onClick={startPuzzle}
              className="glow-button bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 border border-white/20 smooth-transition hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <rect x="3" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                Puzzle
              </span>
            </button>
            <button
              onClick={startMemory}
              className="glow-button bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50 border border-white/20 smooth-transition hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <rect x="2" y="4" width="8" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="4" width="8" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 8 L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 8 L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Memory
              </span>
            </button>
          </div>
          
          {/* ✨ Interactive Magic Room ✨ */}
          <div className="mt-8 w-full max-w-md">
            <p className="text-purple-200/60 text-sm mb-3">✨ Tap the magic objects and collect treasures!</p>
            
            {/* Interactive Room Container - themed */}
            <div 
              className={`relative bg-gradient-to-b ${currentRoomTheme.wallGradient} rounded-3xl p-4 backdrop-blur-sm border border-white/10 contain-paint`} 
              style={{ minHeight: '220px' }}
            >
              {/* Wallpaper pattern */}
              <WallpaperPatternSVG pattern={currentWallpaper} color={currentRoomTheme.windowTint} />
              
              {/* Room warm glow */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: `radial-gradient(ellipse at center 80%, ${currentRoomTheme.glowColor}, transparent 60%)` }}
              />
              
              {/* ✨ COLLECTIBLE ITEMS ✨ */}
              {collectibles.filter(item => !item.collected).map((item) => (
                <CollectibleRenderer
                  key={item.id}
                  item={item}
                  onCollect={handleCollectItem}
                  soundEnabled={soundEnabled}
                />
              ))}
              
              {/* Top row of furniture */}
              <div className="flex justify-around items-end mb-4">
                {/* Magic Lamp */}
                <div className="flex flex-col items-center">
                  <MagicLamp 
                    isOn={furnitureState.lamp} 
                    onClick={() => {
                      setFurnitureState(prev => ({ ...prev, lamp: !prev.lamp }))
                      setInteractionCount(prev => prev + 1)
                    }}
                    soundEnabled={soundEnabled}
                  />
                  <span className="text-[10px] text-purple-200/50 mt-1">Lamp</span>
                </div>
                
                {/* Cuckoo Clock */}
                <div className="flex flex-col items-center">
                  <CuckooClock 
                    isActive={furnitureState.clock}
                    onClick={() => {
                      setFurnitureState(prev => ({ ...prev, clock: !prev.clock }))
                      setInteractionCount(prev => prev + 1)
                    }}
                    soundEnabled={soundEnabled}
                  />
                  <span className="text-[10px] text-purple-200/50 mt-1">Clock</span>
                </div>
                
                {/* Magic Picture */}
                <div className="flex flex-col items-center">
                  <MagicPicture 
                    sceneIndex={furnitureState.picture}
                    onClick={() => {
                      setFurnitureState(prev => ({ ...prev, picture: prev.picture + 1 }))
                      setInteractionCount(prev => prev + 1)
                    }}
                    soundEnabled={soundEnabled}
                  />
                  <span className="text-[10px] text-purple-200/50 mt-1">Picture</span>
                </div>
                
                {/* Enchanted Mirror */}
                <div className="flex flex-col items-center">
                  <EnchantedMirror 
                    isActive={furnitureState.mirror}
                    onClick={() => {
                      setFurnitureState(prev => ({ ...prev, mirror: !prev.mirror }))
                      setInteractionCount(prev => prev + 1)
                    }}
                    soundEnabled={soundEnabled}
                  />
                  <span className="text-[10px] text-purple-200/50 mt-1">Mirror</span>
                </div>
              </div>
              
              {/* Bottom row of furniture */}
              <div className="flex justify-around items-end">
                {/* Magic Bookshelf */}
                <div className="flex flex-col items-center">
                  <MagicBookshelf 
                    isWiggling={furnitureState.bookshelf}
                    onClick={() => {
                      setFurnitureState(prev => ({ ...prev, bookshelf: !prev.bookshelf }))
                      setInteractionCount(prev => prev + 1)
                    }}
                    soundEnabled={soundEnabled}
                  />
                  <span className="text-[10px] text-purple-200/50 mt-1">Books</span>
                </div>
                
                {/* Magic Piano */}
                <div className="flex flex-col items-center">
                  <MagicPiano 
                    noteIndex={furnitureState.piano}
                    onClick={() => {
                      setFurnitureState(prev => ({ ...prev, piano: prev.piano + 1 }))
                      setInteractionCount(prev => prev + 1)
                    }}
                    soundEnabled={soundEnabled}
                  />
                  <span className="text-[10px] text-purple-200/50 mt-1">Piano</span>
                </div>
                
                {/* Magic Flowers */}
                <div className="flex flex-col items-center">
                  <MagicFlowers 
                    isBlooming={furnitureState.flowers}
                    onClick={() => {
                      setFurnitureState(prev => ({ ...prev, flowers: !prev.flowers }))
                      setInteractionCount(prev => prev + 1)
                    }}
                    soundEnabled={soundEnabled}
                  />
                  <span className="text-[10px] text-purple-200/50 mt-1">Flowers</span>
                </div>
                
                {/* Magic Carpet */}
                <div className="flex flex-col items-center">
                  <MagicCarpet 
                    isFlying={furnitureState.carpet}
                    onClick={() => {
                      setFurnitureState(prev => ({ ...prev, carpet: !prev.carpet }))
                      setInteractionCount(prev => prev + 1)
                    }}
                    soundEnabled={soundEnabled}
                  />
                  <span className="text-[10px] text-purple-200/50 mt-1">Carpet</span>
                </div>
              </div>
              
              {/* Interaction counter - fun feedback */}
              {interactionCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce-gentle">
                  ✨ {interactionCount}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating sparkles */}
        {[...Array(5)].map((_, i) => (
          <Sparkle 
            key={i} 
            delay={i * 0.8} 
            className={`bottom-${20 + i * 10}% ${i % 2 === 0 ? 'left-[10%]' : 'right-[10%]'}`}
          />
        ))}
        
        {/* 🐾 PET COMPANION - follows the player! */}
        <div 
          className="fixed pointer-events-none z-40 gpu-accelerated transition-opacity duration-500"
          style={{
            left: petPosition.x,
            top: petPosition.y,
            transform: 'translate(-50%, -50%)',
            opacity: petPosition.x === 0 ? 0 : 1, // Hide until initialized
          }}
        >
          <div className="relative">
            <PetCompanion 
              type={petType}
              state={petState}
              facingRight={facingRight}
              className="w-16 h-16"
            />
            
            {/* Pet intro bubble */}
            {showPetIntro && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap animate-bounce-gentle">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg border border-white/50">
                  <p className="text-xs font-medium text-gray-700">
                    {petType === 'kitten' ? '😺 Meow! I\'ll follow you!' : '🐶 Woof! I\'m your buddy!'}
                  </p>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 rotate-45 border-r border-b border-white/50" />
              </div>
            )}
            
            {/* Paw prints trail effect when walking */}
            {petState === 'walking' && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '0.1s' }} />
              </div>
            )}
          </div>
        </div>
        
        {/* Room customize button */}
        <RoomCustomizeButton onClick={() => setShowRoomCustomizer(true)} soundEnabled={soundEnabled} />
        
        {/* Room customization panel */}
        <RoomCustomizationPanel
          isOpen={showRoomCustomizer}
          onClose={() => setShowRoomCustomizer(false)}
          currentTheme={currentRoomTheme}
          currentWallpaper={currentWallpaper}
          onThemeChange={handleThemeChange}
          onWallpaperChange={handleWallpaperChange}
          soundEnabled={soundEnabled}
        />
      </div>
    )
  }

  // Find the Toy game
  if (gameState === 'find-toy') {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
        <MagicalBackground />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        
        {/* Header */}
        <div className="w-full max-w-lg relative z-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setGameState('menu')}
              className="text-white/70 hover:text-white text-sm flex items-center gap-1 smooth-transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
              Find the Toy!
            </h2>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className={`w-5 h-5 smooth-transition ${i < triesLeft ? 'text-red-400' : 'text-gray-600'}`}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                </svg>
              ))}
            </div>
          </div>
          
          <p className="text-center text-purple-200/80 mb-4">
            {foundToy 
              ? '🎉 You found it!' 
              : triesLeft <= 0 
                ? 'Out of tries! Try again?' 
                : 'Tap a hiding spot to find the toy!'}
          </p>
        </div>
        
        {/* Game area with cozy room feeling - themed */}
        <ThemedRoomContainer 
          theme={currentRoomTheme} 
          wallpaper={currentWallpaper}
          className="h-[55vh]"
        >
          {/* Decorative window with moonlight */}
          <div 
            className="absolute top-3 left-1/2 transform -translate-x-1/2 w-16 h-20 rounded-t-full border-2 border-yellow-900/30"
            style={{ 
              background: `linear-gradient(to bottom, ${currentRoomTheme.floorColor}, ${currentRoomTheme.floorColor}dd)`,
            }}
          >
            <MagicMoon className="w-8 h-8 mx-auto mt-2" />
          </div>
          
          {/* Floating sparkles in room - reduced count */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`room-sparkle-${i}`}
              className="absolute animate-sparkle-float pointer-events-none gpu-accelerated"
              style={{
                left: `${20 + i * 30}%`,
                bottom: '20%',
                animationDelay: `${i * 0.9}s`,
              }}
            >
              <Star size="sm" delay={0} />
            </div>
          ))}
          
          {/* Hiding spots */}
          {hidingSpots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => checkSpot(spot)}
              disabled={checkedSpots.has(spot.id) || foundToy || triesLeft <= 0}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 gpu-accelerated
                ${!checkedSpots.has(spot.id) && !foundToy && triesLeft > 0 
                  ? 'spot-hover cursor-pointer' 
                  : ''
                }
              `}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <HidingSpotSVG 
                type={spot.type} 
                revealed={checkedSpots.has(spot.id)} 
                hasToy={spot.hasToy} 
              />
            </button>
          ))}
          
          {/* Pet watching at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-20 gpu-accelerated">
            <CuteCat mood={foundToy ? 'excited' : 'neutral'} className="w-full h-full" />
          </div>
        </ThemedRoomContainer>
        
        {/* Room customize button */}
        <RoomCustomizeButton onClick={() => setShowRoomCustomizer(true)} soundEnabled={soundEnabled} />
        
        {/* Room customization panel */}
        <RoomCustomizationPanel
          isOpen={showRoomCustomizer}
          onClose={() => setShowRoomCustomizer(false)}
          currentTheme={currentRoomTheme}
          currentWallpaper={currentWallpaper}
          onThemeChange={handleThemeChange}
          onWallpaperChange={handleWallpaperChange}
          soundEnabled={soundEnabled}
        />
      </div>
    )
  }

  // Feed Time game
  if (gameState === 'feed-time') {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 select-none relative overflow-hidden">
        <MagicalBackground />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        
        {/* Header */}
        <div className="w-full max-w-lg relative z-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setGameState('menu')}
              className="text-white/70 hover:text-white text-sm flex items-center gap-1 smooth-transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-yellow-200">
              Feed Time!
            </h2>
            <div className="w-12" />
          </div>
          
          <p className="text-center text-purple-200/80 mb-4">
            {petFed 
              ? 'Yummy! Your pet is so happy!' 
              : isDragging 
                ? 'Drag the food to your hungry pet!' 
                : 'Select food and drag it to your pet!'}
          </p>
        </div>
        
        {/* Game area - themed */}
        <ThemedRoomContainer 
          theme={currentRoomTheme} 
          wallpaper={currentWallpaper}
          className="h-[50vh] flex items-center justify-center"
        >
          {/* Warm ambient light around pet */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="w-48 h-48 rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${currentRoomTheme.glowColor}, transparent)` }}
            />
          </div>
          
          {/* Pet */}
          <div 
            ref={petRef}
            className={`w-32 h-32 gpu-accelerated smooth-transition ${
              petMood === 'eating' ? 'scale-110' : 
              petMood === 'happy' ? 'animate-bounce-gentle' : ''
            }`}
          >
            <CuteCat 
              mood={petMood === 'hungry' ? 'neutral' : petMood === 'eating' ? 'eating' : 'excited'} 
              className="w-full h-full" 
            />
            {petMood === 'happy' && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(5)].map((_, i) => (
                  <Sparkle key={i} delay={i * 0.3} className={`absolute ${i % 2 === 0 ? '-top-4' : 'top-0'} ${i < 2 ? '-left-8' : i > 2 ? '-right-8' : ''}`} />
                ))}
              </div>
            )}
          </div>
          
          {/* Food bowl with glow */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <svg viewBox="0 0 80 40" className="w-20 h-10" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 200, 100, 0.3))' }}>
              <ellipse cx="40" cy="30" rx="35" ry="8" fill="#8B4513" />
              <ellipse cx="40" cy="25" rx="30" ry="12" fill="#A0522D" />
              <ellipse cx="40" cy="22" rx="25" ry="8" fill="#CD853F" />
            </svg>
          </div>
        </ThemedRoomContainer>
        
        {/* Room customize button */}
        <RoomCustomizeButton onClick={() => setShowRoomCustomizer(true)} soundEnabled={soundEnabled} />
        
        {/* Room customization panel */}
        <RoomCustomizationPanel
          isOpen={showRoomCustomizer}
          onClose={() => setShowRoomCustomizer(false)}
          currentTheme={currentRoomTheme}
          currentWallpaper={currentWallpaper}
          onThemeChange={handleThemeChange}
          onWallpaperChange={handleWallpaperChange}
          soundEnabled={soundEnabled}
        />
        
        {/* Food selection with glow on hover */}
        <div className="w-full max-w-lg mt-6 relative z-10">
          <p className="text-center text-white/50 mb-3 text-sm">Tap to select, then drag to pet</p>
          <div className="flex justify-center gap-4">
            {FOOD_ITEMS.map((food) => (
              <button
                key={food.id}
                onMouseDown={(e) => handleDragStart(food, e)}
                onTouchStart={(e) => handleDragStart(food, e)}
                disabled={petFed}
                className={`p-4 rounded-2xl border gpu-accelerated smooth-transition ${
                  selectedFood?.id === food.id && isDragging
                    ? 'bg-yellow-500/30 scale-110 border-yellow-400/50 shadow-[0_0_20px_rgba(255,200,0,0.4)]' 
                    : 'bg-white/10 hover:bg-white/20 border-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,200,100,0.2)]'
                } ${petFed ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
              >
                <FoodSVG type={food.type} />
              </button>
            ))}
          </div>
        </div>
        
        {/* Dragging food indicator - RAF positioned */}
        {isDragging && selectedFood && (
          <div 
            ref={dragRef}
            className="fixed pointer-events-none z-50 gpu-accelerated"
            style={{ 
              left: 0, 
              top: 0,
              filter: 'drop-shadow(0 0 20px rgba(255, 200, 100, 0.6))',
            }}
          >
            <FoodSVG type={selectedFood.type} />
          </div>
        )}
      </div>
    )
  }

  // Puzzle game screen
  if (gameState === 'puzzle') {
    // Find empty position
    const occupiedPositions = new Set(puzzleTiles.map(t => t.currentPos))
    let emptyPos = -1
    for (let i = 0; i < 9; i++) {
      if (!occupiedPositions.has(i)) {
        emptyPos = i
        break
      }
    }
    
    return (
      <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
        <MagicalBackground />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        
        {/* Header */}
        <div className="w-full max-w-lg relative z-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setGameState('menu')}
              className="text-white/70 hover:text-white text-sm flex items-center gap-1 smooth-transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">
              Magic Puzzle
            </h2>
            <div className="text-white/70 text-sm font-medium">
              Moves: {puzzleMoves}
            </div>
          </div>
          
          <p className="text-center text-purple-200/80 mb-4">
            {puzzleSolved 
              ? '🎉 Puzzle Complete!' 
              : 'Tap tiles next to the empty space to slide them!'}
          </p>
        </div>
        
        {/* Puzzle Grid - themed */}
        <ThemedRoomContainer 
          theme={currentRoomTheme} 
          wallpaper={currentWallpaper}
          className="max-w-xs aspect-square p-3"
        >
          <div className="grid grid-cols-3 gap-2 w-full h-full relative z-10">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((pos) => {
              const tile = puzzleTiles.find(t => t.currentPos === pos)
              const isCorrect = tile && tile.currentPos === tile.correctPos
              
              if (!tile) {
                // Empty space
                return (
                  <div 
                    key={`empty-${pos}`}
                    className="rounded-xl bg-black/20 border border-white/5"
                  />
                )
              }
              
              return (
                <button
                  key={tile.id}
                  onClick={() => handlePuzzleTileClick(tile.id)}
                  disabled={puzzleSolved}
                  className={`rounded-xl text-3xl flex items-center justify-center 
                    transition-all duration-200 ease-out
                    ${isCorrect 
                      ? 'bg-gradient-to-br from-emerald-500/80 to-teal-600/80 shadow-lg shadow-emerald-500/30' 
                      : 'bg-gradient-to-br from-cyan-500/80 to-blue-600/80 shadow-lg shadow-cyan-500/30'
                    }
                    ${!puzzleSolved ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''}
                    border border-white/20`}
                >
                  {tile.emoji}
                </button>
              )
            })}
          </div>
          
          {/* Celebration effect when solved */}
          {puzzleSolved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <Sparkle key={i} delay={i * 0.2} className={`absolute`} />
              ))}
            </div>
          )}
        </ThemedRoomContainer>
        
        {/* Cat watching */}
        <div className="w-24 h-24 mt-6 z-10 animate-float gpu-accelerated">
          <CuteCat mood={puzzleSolved ? 'excited' : 'neutral'} className="w-full h-full" />
        </div>
        
        {/* Hint */}
        <p className="text-purple-200/40 text-xs mt-4 z-10">
          Arrange tiles so each one glows green! ✨
        </p>
        
        {/* Room customize button */}
        <RoomCustomizeButton onClick={() => setShowRoomCustomizer(true)} soundEnabled={soundEnabled} />
        
        {/* Room customization panel */}
        <RoomCustomizationPanel
          isOpen={showRoomCustomizer}
          onClose={() => setShowRoomCustomizer(false)}
          currentTheme={currentRoomTheme}
          currentWallpaper={currentWallpaper}
          onThemeChange={handleThemeChange}
          onWallpaperChange={handleWallpaperChange}
          soundEnabled={soundEnabled}
        />
      </div>
    )
  }

  // Memory game screen
  if (gameState === 'memory') {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
        <MagicalBackground />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        
        {/* Header */}
        <div className="w-full max-w-lg relative z-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setGameState('menu')}
              className="text-white/70 hover:text-white text-sm flex items-center gap-1 smooth-transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">
              Memory Match
            </h2>
            <div className="text-white/70 text-sm font-medium">
              {memoryMatches}/{MEMORY_EMOJIS.length}
            </div>
          </div>
          
          <p className="text-center text-purple-200/80 mb-4">
            {memoryMatches === MEMORY_EMOJIS.length 
              ? '🎉 All Matched!' 
              : `Moves: ${memoryMoves} • Find all matching pairs!`}
          </p>
        </div>
        
        {/* Memory Card Grid - themed */}
        <ThemedRoomContainer 
          theme={currentRoomTheme} 
          wallpaper={currentWallpaper}
          className="max-w-sm p-4"
        >
          <div className="grid grid-cols-4 gap-2 relative z-10">
            {memoryCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleMemoryCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped || isCheckingMatch}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center 
                  transition-all duration-300 transform-gpu
                  ${card.isMatched 
                    ? 'bg-gradient-to-br from-emerald-500/80 to-teal-600/80 shadow-lg shadow-emerald-500/30 scale-95' 
                    : card.isFlipped
                    ? 'bg-gradient-to-br from-amber-500/80 to-orange-600/80 shadow-lg shadow-amber-500/30'
                    : 'bg-gradient-to-br from-slate-600/80 to-slate-700/80 hover:from-slate-500/80 hover:to-slate-600/80'
                  }
                  ${!card.isMatched && !card.isFlipped && !isCheckingMatch ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''}
                  border border-white/20`}
                style={{
                  transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(0deg)',
                }}
              >
                {card.isFlipped || card.isMatched ? (
                  <span className={card.isMatched ? 'animate-bounce-gentle' : ''}>{card.emoji}</span>
                ) : (
                  <span className="text-lg opacity-50">✨</span>
                )}
              </button>
            ))}
          </div>
          
          {/* Sparkles for matched cards */}
          {memoryMatches > 0 && memoryMatches < MEMORY_EMOJIS.length && (
            <div className="absolute top-2 right-2">
              <Star size="sm" delay={0} />
            </div>
          )}
        </ThemedRoomContainer>
        
        {/* Cat mascot */}
        <div className="w-24 h-24 mt-6 z-10 animate-float gpu-accelerated">
          <CuteCat mood={memoryMatches === MEMORY_EMOJIS.length ? 'excited' : memoryMatches > 2 ? 'happy' : 'neutral'} className="w-full h-full" />
        </div>
        
        {/* Progress indicator */}
        <div className="flex gap-1 mt-4 z-10">
          {[...Array(MEMORY_EMOJIS.length)].map((_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < memoryMatches 
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' 
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        
        {/* Room customize button */}
        <RoomCustomizeButton onClick={() => setShowRoomCustomizer(true)} soundEnabled={soundEnabled} />
        
        {/* Room customization panel */}
        <RoomCustomizationPanel
          isOpen={showRoomCustomizer}
          onClose={() => setShowRoomCustomizer(false)}
          currentTheme={currentRoomTheme}
          currentWallpaper={currentWallpaper}
          onThemeChange={handleThemeChange}
          onWallpaperChange={handleWallpaperChange}
          soundEnabled={soundEnabled}
        />
      </div>
    )
  }

  // Reward screen
  if (gameState === 'reward') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <MagicalBackground intense />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        
        {/* Extra celebration sparkles - optimized with CSS variables */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none contain-paint">
          {[...Array(20)].map((_, i) => {
            const angle = (i / 20) * Math.PI * 2
            const distance = 80 + Math.random() * 60
            return (
              <div
                key={`celebration-${i}`}
                className="absolute left-1/2 top-1/2 animate-celebration-burst gpu-accelerated"
                style={{
                  '--burst-x': `${Math.cos(angle) * distance}px`,
                  '--burst-y': `${Math.sin(angle) * distance - 50}px`,
                  animationDelay: `${Math.random() * 0.5}s`,
                } as React.CSSProperties}
              >
                <Star size={(['sm', 'md', 'lg'] as const)[Math.floor(Math.random() * 3)]} delay={0} />
              </div>
            )
          })}
        </div>
        
        <div className="relative z-10 text-center">
          {/* Happy cat celebration */}
          <div className="w-36 h-36 mx-auto mb-4 animate-bounce-gentle gpu-accelerated">
            <CuteCat mood="excited" className="w-full h-full" />
          </div>
          
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 mb-2">
            Great Job!
          </h2>
          <p className="text-purple-200/80 mb-8 text-lg">You earned a reward!</p>
          
          {/* Updated rewards with glow */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 border border-purple-400/30 animate-glow-pulse gpu-accelerated">
              <span className="text-3xl">🧸</span>
              <span className="text-white font-bold text-2xl">{rewards.toys}</span>
            </div>
            <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 border border-orange-400/30 animate-glow-pulse gpu-accelerated" style={{ animationDelay: '0.3s' }}>
              <span className="text-3xl">🍬</span>
              <span className="text-white font-bold text-2xl">{rewards.treats}</span>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 border border-yellow-400/30 animate-glow-pulse gpu-accelerated" style={{ animationDelay: '0.6s' }}>
              <span className="text-3xl">⭐</span>
              <span className="text-white font-bold text-2xl">{rewards.stars}</span>
            </div>
          </div>
          
          <button
            onClick={() => setGameState('menu')}
            className="glow-button bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-green-500/30 hover:shadow-green-400/50 border border-white/20 smooth-transition hover:scale-105 active:scale-95"
          >
            <span className="flex items-center justify-center gap-2">
              Play Again!
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M5 12l14 0M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    )
  }

  return null
}
