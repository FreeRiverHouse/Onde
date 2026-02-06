'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

// Piano note frequencies (C4 to C5 - one octave)
const PIANO_NOTES = [
  { note: 'C4', freq: 261.63, key: 'a', label: 'C', color: 'white' },
  { note: 'C#4', freq: 277.18, key: 'w', label: 'C#', color: 'black' },
  { note: 'D4', freq: 293.66, key: 's', label: 'D', color: 'white' },
  { note: 'D#4', freq: 311.13, key: 'e', label: 'D#', color: 'black' },
  { note: 'E4', freq: 329.63, key: 'd', label: 'E', color: 'white' },
  { note: 'F4', freq: 349.23, key: 'f', label: 'F', color: 'white' },
  { note: 'F#4', freq: 369.99, key: 't', label: 'F#', color: 'black' },
  { note: 'G4', freq: 392.00, key: 'g', label: 'G', color: 'white' },
  { note: 'G#4', freq: 415.30, key: 'y', label: 'G#', color: 'black' },
  { note: 'A4', freq: 440.00, key: 'h', label: 'A', color: 'white' },
  { note: 'A#4', freq: 466.16, key: 'u', label: 'A#', color: 'black' },
  { note: 'B4', freq: 493.88, key: 'j', label: 'B', color: 'white' },
  { note: 'C5', freq: 523.25, key: 'k', label: 'C', color: 'white' },
]

// Guitar strings (standard tuning)
const GUITAR_STRINGS = [
  { id: 'E2', freq: 82.41, label: 'E', color: 'from-red-400 to-red-600' },
  { id: 'A2', freq: 110.00, label: 'A', color: 'from-orange-400 to-orange-600' },
  { id: 'D3', freq: 146.83, label: 'D', color: 'from-yellow-400 to-yellow-600' },
  { id: 'G3', freq: 196.00, label: 'G', color: 'from-green-400 to-green-600' },
  { id: 'B3', freq: 246.94, label: 'B', color: 'from-blue-400 to-blue-600' },
  { id: 'E4', freq: 329.63, label: 'e', color: 'from-purple-400 to-purple-600' },
]

// Xylophone notes (C5 to C6)
const XYLOPHONE_NOTES = [
  { id: 'X_C5', freq: 523.25, label: 'C', color: 'bg-red-500' },
  { id: 'X_D5', freq: 587.33, label: 'D', color: 'bg-orange-500' },
  { id: 'X_E5', freq: 659.25, label: 'E', color: 'bg-yellow-500' },
  { id: 'X_F5', freq: 698.46, label: 'F', color: 'bg-green-500' },
  { id: 'X_G5', freq: 783.99, label: 'G', color: 'bg-teal-500' },
  { id: 'X_A5', freq: 880.00, label: 'A', color: 'bg-blue-500' },
  { id: 'X_B5', freq: 987.77, label: 'B', color: 'bg-indigo-500' },
  { id: 'X_C6', freq: 1046.50, label: 'C', color: 'bg-purple-500' },
]

// Extended drum sounds
const DRUM_PADS = [
  { id: 'kick', label: '🥁', name: 'Kick', key: '1', color: 'from-red-500 to-red-700' },
  { id: 'snare', label: '🪘', name: 'Snare', key: '2', color: 'from-orange-500 to-orange-700' },
  { id: 'hihat', label: '🎵', name: 'Hi-Hat', key: '3', color: 'from-yellow-500 to-yellow-700' },
  { id: 'hihat-open', label: '🔔', name: 'Open HH', key: '4', color: 'from-lime-500 to-lime-700' },
  { id: 'tom', label: '🔊', name: 'Tom', key: '5', color: 'from-green-500 to-green-700' },
  { id: 'tom-low', label: '📯', name: 'Low Tom', key: '6', color: 'from-teal-500 to-teal-700' },
  { id: 'crash', label: '💥', name: 'Crash', key: '7', color: 'from-blue-500 to-blue-700' },
  { id: 'ride', label: '🔔', name: 'Ride', key: '8', color: 'from-indigo-500 to-indigo-700' },
  { id: 'clap', label: '👏', name: 'Clap', key: '9', color: 'from-purple-500 to-purple-700' },
  { id: 'rim', label: '🥢', name: 'Rim', key: '0', color: 'from-pink-500 to-pink-700' },
  { id: 'cowbell', label: '🔔', name: 'Cowbell', key: '-', color: 'from-amber-500 to-amber-700' },
  { id: 'shaker', label: '🎶', name: 'Shaker', key: '=', color: 'from-rose-500 to-rose-700' },
]

// Sequencer patterns
const SEQUENCER_STEPS = 16
const DEFAULT_BPM = 120

type InstrumentType = 'piano' | 'guitar' | 'xylophone' | 'drums'

interface RecordedNote {
  type: 'piano' | 'drum' | 'guitar' | 'xylophone'
  id: string
  time: number
}

interface SavedRecording {
  id: string
  name: string
  notes: RecordedNote[]
  duration: number
  createdAt: number
}

interface SequencerPattern {
  [drumId: string]: boolean[]
}

interface LoopLayer {
  id: string
  notes: RecordedNote[]
  muted: boolean
  volume: number
}

export default function MusicMaker() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  const [activeDrums, setActiveDrums] = useState<Set<string>>(new Set())
  const [activeGuitar, setActiveGuitar] = useState<Set<string>>(new Set())
  const [activeXylophone, setActiveXylophone] = useState<Set<string>>(new Set())
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([])
  const [recordings, setRecordings] = useState<SavedRecording[]>([])
  const [recordingName, setRecordingName] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [volume, setVolume] = useState(0.5)
  const [activeTab, setActiveTab] = useState<InstrumentType>('piano')
  
  // Sequencer state
  const [sequencerPattern, setSequencerPattern] = useState<SequencerPattern>(() => {
    const pattern: SequencerPattern = {}
    DRUM_PADS.forEach(drum => {
      pattern[drum.id] = new Array(SEQUENCER_STEPS).fill(false)
    })
    return pattern
  })
  const [sequencerPlaying, setSequencerPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [bpm, setBpm] = useState(DEFAULT_BPM)
  
  // Looper state
  const [loopLayers, setLoopLayers] = useState<LoopLayer[]>([])
  const [loopRecording, setLoopRecording] = useState(false)
  const [loopPlaying, setLoopPlaying] = useState(false)
  const [loopLength, setLoopLength] = useState(4000) // 4 seconds default
  const [currentLoopNotes, setCurrentLoopNotes] = useState<RecordedNote[]>([])
  
  // Keep a ref to the latest pattern so the interval always reads current state
  const sequencerPatternRef = useRef<SequencerPattern>(sequencerPattern)
  useEffect(() => {
    sequencerPatternRef.current = sequencerPattern
  }, [sequencerPattern])

  const audioContextRef = useRef<AudioContext | null>(null)
  const recordingStartRef = useRef<number>(0)
  const playbackTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const gainNodeRef = useRef<GainNode | null>(null)
  const sequencerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const loopStartTimeRef = useRef<number>(0)

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      gainNodeRef.current.gain.value = volume
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [volume])

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [volume])

  // Load recordings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onde-music-recordings')
    if (saved) {
      try {
        setRecordings(JSON.parse(saved))
      } catch {
        console.error('Failed to load recordings')
      }
    }
    
    // Check for shared recording in URL
    const params = new URLSearchParams(window.location.search)
    const sharedData = params.get('r')
    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(sharedData))
        setRecordedNotes(decoded.notes || [])
      } catch {
        console.error('Failed to load shared recording')
      }
    }
  }, [])

  // Play piano note
  const playPianoNote = useCallback((freq: number, noteId: string) => {
    const ctx = getAudioContext()
    const gainNode = gainNodeRef.current!
    
    const oscillator = ctx.createOscillator()
    const noteGain = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
    
    noteGain.gain.setValueAtTime(0.3, ctx.currentTime)
    noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
    
    oscillator.connect(noteGain)
    noteGain.connect(gainNode)
    
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.8)
    
    // Visual feedback
    setActiveNotes(prev => new Set(prev).add(noteId))
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev)
        next.delete(noteId)
        return next
      })
    }, 150)
    
    // Record if recording
    if (isRecording) {
      const time = Date.now() - recordingStartRef.current
      setRecordedNotes(prev => [...prev, { type: 'piano', id: noteId, time }])
    }
    
    // Loop recording
    if (loopRecording) {
      const time = Date.now() - loopStartTimeRef.current
      setCurrentLoopNotes(prev => [...prev, { type: 'piano', id: noteId, time }])
    }
  }, [getAudioContext, isRecording, loopRecording])

  // Play guitar string
  const playGuitarString = useCallback((freq: number, stringId: string) => {
    const ctx = getAudioContext()
    const gainNode = gainNodeRef.current!
    
    // Create multiple harmonics for guitar-like sound
    const baseGain = ctx.createGain()
    baseGain.connect(gainNode)
    baseGain.gain.setValueAtTime(0.4, ctx.currentTime)
    baseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5)
    
    // Fundamental
    const osc1 = ctx.createOscillator()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(freq, ctx.currentTime)
    
    // Add harmonics
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime)
    
    const osc3 = ctx.createOscillator()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(freq * 3, ctx.currentTime)
    
    const harmGain = ctx.createGain()
    harmGain.gain.value = 0.05
    
    osc1.connect(baseGain)
    osc2.connect(harmGain)
    osc3.connect(harmGain)
    harmGain.connect(baseGain)
    
    osc1.start()
    osc2.start()
    osc3.start()
    osc1.stop(ctx.currentTime + 1.5)
    osc2.stop(ctx.currentTime + 1.5)
    osc3.stop(ctx.currentTime + 1.5)
    
    // Visual feedback
    setActiveGuitar(prev => new Set(prev).add(stringId))
    setTimeout(() => {
      setActiveGuitar(prev => {
        const next = new Set(prev)
        next.delete(stringId)
        return next
      })
    }, 200)
    
    // Record if recording
    if (isRecording) {
      const time = Date.now() - recordingStartRef.current
      setRecordedNotes(prev => [...prev, { type: 'guitar', id: stringId, time }])
    }
    
    // Loop recording
    if (loopRecording) {
      const time = Date.now() - loopStartTimeRef.current
      setCurrentLoopNotes(prev => [...prev, { type: 'guitar', id: stringId, time }])
    }
  }, [getAudioContext, isRecording, loopRecording])

  // Play xylophone note
  const playXylophoneNote = useCallback((freq: number, noteId: string) => {
    const ctx = getAudioContext()
    const gainNode = gainNodeRef.current!
    
    // Metallic xylophone sound
    const osc = ctx.createOscillator()
    const noteGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(freq, ctx.currentTime)
    filter.Q.value = 10
    
    noteGain.gain.setValueAtTime(0.5, ctx.currentTime)
    noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
    
    // Add metallic overtone
    const overtone = ctx.createOscillator()
    overtone.type = 'sine'
    overtone.frequency.setValueAtTime(freq * 4.2, ctx.currentTime)
    const overtoneGain = ctx.createGain()
    overtoneGain.gain.setValueAtTime(0.1, ctx.currentTime)
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    
    osc.connect(filter)
    filter.connect(noteGain)
    noteGain.connect(gainNode)
    
    overtone.connect(overtoneGain)
    overtoneGain.connect(gainNode)
    
    osc.start()
    overtone.start()
    osc.stop(ctx.currentTime + 0.6)
    overtone.stop(ctx.currentTime + 0.3)
    
    // Visual feedback
    setActiveXylophone(prev => new Set(prev).add(noteId))
    setTimeout(() => {
      setActiveXylophone(prev => {
        const next = new Set(prev)
        next.delete(noteId)
        return next
      })
    }, 150)
    
    // Record if recording
    if (isRecording) {
      const time = Date.now() - recordingStartRef.current
      setRecordedNotes(prev => [...prev, { type: 'xylophone', id: noteId, time }])
    }
    
    // Loop recording
    if (loopRecording) {
      const time = Date.now() - loopStartTimeRef.current
      setCurrentLoopNotes(prev => [...prev, { type: 'xylophone', id: noteId, time }])
    }
  }, [getAudioContext, isRecording, loopRecording])

  // Play drum sound
  const playDrumSound = useCallback((drumId: string) => {
    const ctx = getAudioContext()
    const gainNode = gainNodeRef.current!
    
    const drumGain = ctx.createGain()
    drumGain.connect(gainNode)
    
    switch (drumId) {
      case 'kick': {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1)
        drumGain.gain.setValueAtTime(0.8, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.connect(drumGain)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
        break
      }
      case 'snare': {
        const noise = ctx.createBufferSource()
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1
        noise.buffer = noiseBuffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = 1000
        drumGain.gain.setValueAtTime(0.5, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        noise.connect(filter)
        filter.connect(drumGain)
        noise.start()
        break
      }
      case 'hihat': {
        const noise = ctx.createBufferSource()
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1
        noise.buffer = noiseBuffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = 5000
        drumGain.gain.setValueAtTime(0.3, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        noise.connect(filter)
        filter.connect(drumGain)
        noise.start()
        break
      }
      case 'hihat-open': {
        const noise = ctx.createBufferSource()
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1
        noise.buffer = noiseBuffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = 4000
        drumGain.gain.setValueAtTime(0.35, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        noise.connect(filter)
        filter.connect(drumGain)
        noise.start()
        break
      }
      case 'tom': {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(200, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15)
        drumGain.gain.setValueAtTime(0.6, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        osc.connect(drumGain)
        osc.start()
        osc.stop(ctx.currentTime + 0.2)
        break
      }
      case 'tom-low': {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(120, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2)
        drumGain.gain.setValueAtTime(0.7, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.connect(drumGain)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
        break
      }
      case 'crash': {
        const noise = ctx.createBufferSource()
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1
        noise.buffer = noiseBuffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = 3000
        drumGain.gain.setValueAtTime(0.4, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        noise.connect(filter)
        filter.connect(drumGain)
        noise.start()
        break
      }
      case 'ride': {
        const noise = ctx.createBufferSource()
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1
        noise.buffer = noiseBuffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 6000
        filter.Q.value = 2
        drumGain.gain.setValueAtTime(0.25, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        noise.connect(filter)
        filter.connect(drumGain)
        noise.start()
        break
      }
      case 'clap': {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const noise = ctx.createBufferSource()
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate)
            const output = noiseBuffer.getChannelData(0)
            for (let j = 0; j < output.length; j++) output[j] = Math.random() * 2 - 1
            noise.buffer = noiseBuffer
            const clapGain = ctx.createGain()
            clapGain.gain.setValueAtTime(0.4, ctx.currentTime)
            clapGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
            noise.connect(clapGain)
            clapGain.connect(gainNode)
            noise.start()
          }, i * 15)
        }
        break
      }
      case 'rim': {
        const osc = ctx.createOscillator()
        osc.type = 'square'
        osc.frequency.setValueAtTime(1800, ctx.currentTime)
        drumGain.gain.setValueAtTime(0.2, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03)
        osc.connect(drumGain)
        osc.start()
        osc.stop(ctx.currentTime + 0.03)
        break
      }
      case 'cowbell': {
        const osc = ctx.createOscillator()
        osc.type = 'square'
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        const osc2 = ctx.createOscillator()
        osc2.type = 'square'
        osc2.frequency.setValueAtTime(540, ctx.currentTime)
        drumGain.gain.setValueAtTime(0.2, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        osc.connect(drumGain)
        osc2.connect(drumGain)
        osc.start()
        osc2.start()
        osc.stop(ctx.currentTime + 0.15)
        osc2.stop(ctx.currentTime + 0.15)
        break
      }
      case 'shaker': {
        const noise = ctx.createBufferSource()
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < output.length; i++) output[i] = (Math.random() * 2 - 1) * Math.sin(i / output.length * Math.PI)
        noise.buffer = noiseBuffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 8000
        drumGain.gain.setValueAtTime(0.2, ctx.currentTime)
        drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
        noise.connect(filter)
        filter.connect(drumGain)
        noise.start()
        break
      }
    }
    
    // Visual feedback
    setActiveDrums(prev => new Set(prev).add(drumId))
    setTimeout(() => {
      setActiveDrums(prev => {
        const next = new Set(prev)
        next.delete(drumId)
        return next
      })
    }, 150)
    
    // Record if recording
    if (isRecording) {
      const time = Date.now() - recordingStartRef.current
      setRecordedNotes(prev => [...prev, { type: 'drum', id: drumId, time }])
    }
    
    // Loop recording
    if (loopRecording) {
      const time = Date.now() - loopStartTimeRef.current
      setCurrentLoopNotes(prev => [...prev, { type: 'drum', id: drumId, time }])
    }
  }, [getAudioContext, isRecording, loopRecording])

  // Play a recorded note (for playback)
  const playNote = useCallback((note: RecordedNote) => {
    if (note.type === 'piano') {
      const pianoNote = PIANO_NOTES.find(n => n.note === note.id)
      if (pianoNote) playPianoNote(pianoNote.freq, pianoNote.note)
    } else if (note.type === 'guitar') {
      const guitarString = GUITAR_STRINGS.find(s => s.id === note.id)
      if (guitarString) playGuitarString(guitarString.freq, guitarString.id)
    } else if (note.type === 'xylophone') {
      const xyloNote = XYLOPHONE_NOTES.find(n => n.id === note.id)
      if (xyloNote) playXylophoneNote(xyloNote.freq, xyloNote.id)
    } else {
      playDrumSound(note.id)
    }
  }, [playPianoNote, playGuitarString, playXylophoneNote, playDrumSound])

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || showSaveModal || showShareModal) return
      
      const pianoNote = PIANO_NOTES.find(n => n.key === e.key.toLowerCase())
      if (pianoNote) {
        playPianoNote(pianoNote.freq, pianoNote.note)
        return
      }
      
      const drum = DRUM_PADS.find(d => d.key === e.key)
      if (drum) {
        playDrumSound(drum.id)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playPianoNote, playDrumSound, showSaveModal, showShareModal])

  // Recording controls
  const startRecording = () => {
    setRecordedNotes([])
    recordingStartRef.current = Date.now()
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordedNotes.length > 0) {
      setShowSaveModal(true)
    }
  }

  // Playback
  const playRecording = useCallback(() => {
    if (recordedNotes.length === 0 || isPlaying) return
    
    setIsPlaying(true)
    playbackTimeoutsRef.current = []
    
    recordedNotes.forEach(note => {
      const timeout = setTimeout(() => {
        playNote(note)
      }, note.time)
      playbackTimeoutsRef.current.push(timeout)
    })
    
    const maxTime = Math.max(...recordedNotes.map(n => n.time), 0)
    const endTimeout = setTimeout(() => {
      setIsPlaying(false)
    }, maxTime + 500)
    playbackTimeoutsRef.current.push(endTimeout)
  }, [recordedNotes, isPlaying, playNote])

  const stopPlayback = () => {
    playbackTimeoutsRef.current.forEach(t => clearTimeout(t))
    playbackTimeoutsRef.current = []
    setIsPlaying(false)
  }

  // Sequencer controls
  const toggleSequencerStep = (drumId: string, step: number) => {
    setSequencerPattern(prev => ({
      ...prev,
      [drumId]: prev[drumId].map((v, i) => i === step ? !v : v)
    }))
  }

  const startSequencer = useCallback(() => {
    setSequencerPlaying(true)
    setCurrentStep(0)
    
    const stepTime = (60 / bpm / 4) * 1000 // 16th note
    
    let step = 0
    sequencerIntervalRef.current = setInterval(() => {
      setCurrentStep(step)
      
      // Read from ref so we always get the LATEST pattern (real-time updates!)
      const currentPattern = sequencerPatternRef.current
      DRUM_PADS.forEach(drum => {
        if (currentPattern[drum.id][step]) {
          playDrumSound(drum.id)
        }
      })
      
      step = (step + 1) % SEQUENCER_STEPS
    }, stepTime)
  }, [bpm, playDrumSound])

  const stopSequencer = () => {
    if (sequencerIntervalRef.current) {
      clearInterval(sequencerIntervalRef.current)
      sequencerIntervalRef.current = null
    }
    setSequencerPlaying(false)
    setCurrentStep(0)
  }

  const clearSequencer = () => {
    const pattern: SequencerPattern = {}
    DRUM_PADS.forEach(drum => {
      pattern[drum.id] = new Array(SEQUENCER_STEPS).fill(false)
    })
    setSequencerPattern(pattern)
  }

  // Looper controls
  const startLoopRecording = () => {
    setCurrentLoopNotes([])
    loopStartTimeRef.current = Date.now()
    setLoopRecording(true)
    
    // Auto-stop after loop length
    setTimeout(() => {
      stopLoopRecording()
    }, loopLength)
  }

  const stopLoopRecording = () => {
    setLoopRecording(false)
    if (currentLoopNotes.length > 0) {
      const newLayer: LoopLayer = {
        id: Date.now().toString(),
        notes: currentLoopNotes.map(n => ({ ...n, time: n.time % loopLength })),
        muted: false,
        volume: 1
      }
      setLoopLayers(prev => [...prev, newLayer])
      setCurrentLoopNotes([])
    }
  }

  const toggleLoopPlayback = useCallback(() => {
    if (loopPlaying) {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current)
        loopIntervalRef.current = null
      }
      playbackTimeoutsRef.current.forEach(t => clearTimeout(t))
      playbackTimeoutsRef.current = []
      setLoopPlaying(false)
    } else {
      setLoopPlaying(true)
      
      const playLoop = () => {
        loopLayers.forEach(layer => {
          if (!layer.muted) {
            layer.notes.forEach(note => {
              const timeout = setTimeout(() => {
                playNote(note)
              }, note.time)
              playbackTimeoutsRef.current.push(timeout)
            })
          }
        })
      }
      
      playLoop()
      loopIntervalRef.current = setInterval(playLoop, loopLength)
    }
  }, [loopPlaying, loopLayers, loopLength, playNote])

  const toggleLayerMute = (layerId: string) => {
    setLoopLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, muted: !l.muted } : l
    ))
  }

  const deleteLoopLayer = (layerId: string) => {
    setLoopLayers(prev => prev.filter(l => l.id !== layerId))
  }

  const clearLooper = () => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current)
      loopIntervalRef.current = null
    }
    playbackTimeoutsRef.current.forEach(t => clearTimeout(t))
    setLoopLayers([])
    setLoopPlaying(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequencerIntervalRef.current) clearInterval(sequencerIntervalRef.current)
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current)
      playbackTimeoutsRef.current.forEach(t => clearTimeout(t))
    }
  }, [])

  // Save recording
  const saveRecording = () => {
    if (!recordingName.trim() || recordedNotes.length === 0) return
    
    const maxTime = Math.max(...recordedNotes.map(n => n.time), 0)
    const newRecording: SavedRecording = {
      id: Date.now().toString(),
      name: recordingName.trim(),
      notes: recordedNotes,
      duration: maxTime,
      createdAt: Date.now(),
    }
    
    const updated = [...recordings, newRecording]
    setRecordings(updated)
    localStorage.setItem('onde-music-recordings', JSON.stringify(updated))
    
    setShowSaveModal(false)
    setRecordingName('')
  }

  // Load recording
  const loadRecording = (recording: SavedRecording) => {
    setRecordedNotes(recording.notes)
  }

  // Delete recording
  const deleteRecording = (id: string) => {
    const updated = recordings.filter(r => r.id !== id)
    setRecordings(updated)
    localStorage.setItem('onde-music-recordings', JSON.stringify(updated))
  }

  // Share recording
  const shareRecording = () => {
    if (recordedNotes.length === 0) return
    
    const data = { notes: recordedNotes }
    const encoded = btoa(JSON.stringify(data))
    const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`
    setShareUrl(url)
    setShowShareModal(true)
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }

  const whiteKeys = PIANO_NOTES.filter(n => n.color === 'white')
  const blackKeys = PIANO_NOTES.filter(n => n.color === 'black')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 overflow-x-hidden">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/games/arcade/"
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm"
          >
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg text-center flex items-center gap-2">
            <span className="animate-bounce">🎹</span>
            <span>Music Maker</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎵</span>
          </h1>
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-white text-xl">🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 accent-white"
          />
          <span className="text-white text-xl">🔊</span>
        </div>

        {/* Instrument Tabs */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {(['piano', 'guitar', 'xylophone', 'drums'] as InstrumentType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white text-purple-600 scale-105 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {tab === 'piano' && '🎹 Piano'}
              {tab === 'guitar' && '🎸 Guitar'}
              {tab === 'xylophone' && '🎵 Xylophone'}
              {tab === 'drums' && '🥁 Drums'}
            </button>
          ))}
        </div>

        {/* Piano Section */}
        {activeTab === 'piano' && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 text-center">🎹 Piano</h2>
            <div className="relative flex justify-center">
              {/* White keys */}
              <div className="flex gap-1">
                {whiteKeys.map((note, i) => (
                  <button
                    key={note.note}
                    onClick={() => playPianoNote(note.freq, note.note)}
                    className={`
                      w-10 md:w-14 h-32 md:h-44 rounded-b-lg shadow-lg transition-all duration-75
                      ${activeNotes.has(note.note)
                        ? 'bg-gradient-to-b from-yellow-200 to-yellow-400 transform scale-95'
                        : 'bg-gradient-to-b from-white to-gray-100 hover:from-gray-50 hover:to-gray-200'
                      }
                      border-2 border-gray-200 relative
                    `}
                    style={{ zIndex: 1 }}
                  >
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs md:text-sm text-gray-500 font-bold">
                      {note.label}
                    </span>
                    <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 uppercase">
                      {note.key}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Black keys overlay */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex" style={{ width: 'calc(100% - 0.25rem)' }}>
                {whiteKeys.slice(0, -1).map((_, i) => {
                  // Position black keys correctly
                  const hasBlackKey = [0, 1, 3, 4, 5].includes(i)
                  if (!hasBlackKey) return <div key={i} className="w-10 md:w-14" />
                  
                  const blackKeyIndex = [0, 1, 3, 4, 5].indexOf(i)
                  const actualBlackKey = blackKeys[blackKeyIndex]
                  if (!actualBlackKey) return <div key={i} className="w-10 md:w-14" />
                  
                  return (
                    <div key={i} className="relative w-10 md:w-14">
                      <button
                        onClick={() => playPianoNote(actualBlackKey.freq, actualBlackKey.note)}
                        className={`
                          absolute left-1/2 w-6 md:w-9 h-20 md:h-28 rounded-b-md shadow-lg transition-all duration-75
                          ${activeNotes.has(actualBlackKey.note)
                            ? 'bg-gradient-to-b from-yellow-500 to-yellow-700 transform scale-95'
                            : 'bg-gradient-to-b from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'
                          }
                          border border-gray-800
                        `}
                        style={{ zIndex: 2, transform: 'translateX(-50%)' }}
                      >
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] text-gray-400 uppercase">
                          {actualBlackKey.key}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Guitar Section */}
        {activeTab === 'guitar' && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 text-center">🎸 Guitar</h2>
            <div className="flex flex-col gap-2 max-w-md mx-auto">
              {GUITAR_STRINGS.map((string) => (
                <button
                  key={string.id}
                  onClick={() => playGuitarString(string.freq, string.id)}
                  className={`
                    h-10 rounded-full shadow-lg transition-all duration-100
                    bg-gradient-to-r ${string.color}
                    ${activeGuitar.has(string.id)
                      ? 'scale-y-150 brightness-150 ring-2 ring-white'
                      : 'hover:scale-y-110 hover:brightness-110'
                    }
                    flex items-center justify-between px-4
                    border-2 border-white/30
                  `}
                >
                  <span className="text-white font-bold text-lg">{string.label}</span>
                  <span className="text-white/60 text-sm">{string.freq.toFixed(0)} Hz</span>
                </button>
              ))}
            </div>
            <p className="text-white/60 text-center mt-4 text-sm">Click strings to strum!</p>
          </div>
        )}

        {/* Xylophone Section */}
        {activeTab === 'xylophone' && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 text-center">🎵 Xylophone</h2>
            <div className="flex justify-center gap-1 md:gap-2">
              {XYLOPHONE_NOTES.map((note, i) => (
                <button
                  key={note.id}
                  onClick={() => playXylophoneNote(note.freq, note.id)}
                  className={`
                    ${note.color} rounded-lg shadow-lg transition-all duration-75
                    ${activeXylophone.has(note.id)
                      ? 'transform scale-95 brightness-150 ring-2 ring-white'
                      : 'hover:scale-105 hover:brightness-110'
                    }
                    flex flex-col items-center justify-end p-2 md:p-3
                    border-2 border-white/30
                  `}
                  style={{ 
                    width: `${60 - i * 3}px`,
                    height: `${140 - i * 10}px`
                  }}
                >
                  <span className="text-white font-bold text-sm md:text-base">{note.label}</span>
                </button>
              ))}
            </div>
            <p className="text-white/60 text-center mt-4 text-sm">Tap the bars to play!</p>
          </div>
        )}

        {/* Drum Pads Section */}
        {activeTab === 'drums' && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 text-center">🥁 Drum Pads</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
              {DRUM_PADS.map((drum) => (
                <button
                  key={drum.id}
                  onClick={() => playDrumSound(drum.id)}
                  className={`
                    aspect-square rounded-2xl shadow-lg transition-all duration-75
                    bg-gradient-to-br ${drum.color}
                    ${activeDrums.has(drum.id)
                      ? 'transform scale-90 brightness-150 ring-4 ring-white'
                      : 'hover:scale-105 hover:brightness-110'
                    }
                    flex flex-col items-center justify-center gap-0.5 p-1 md:p-2
                    border-2 border-white/30
                  `}
                >
                  <span className="text-2xl md:text-3xl">{drum.label}</span>
                  <span className="text-white font-bold text-[10px] md:text-xs">{drum.name}</span>
                  <span className="text-white/60 text-[8px] md:text-[10px]">[{drum.key}]</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Beat Sequencer */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 text-center">🎛️ Beat Sequencer</h2>
          
          {/* BPM Control */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-white font-bold">BPM:</span>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-32 accent-white"
            />
            <span className="text-white font-mono w-12">{bpm}</span>
          </div>
          
          {/* Sequencer Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-max">
              {DRUM_PADS.slice(0, 8).map((drum) => (
                <div key={drum.id} className="flex items-center gap-1 mb-1">
                  <span className="w-16 text-white text-xs font-bold truncate">{drum.name}</span>
                  <div className="flex gap-0.5">
                    {Array(SEQUENCER_STEPS).fill(0).map((_, step) => (
                      <button
                        key={step}
                        onClick={() => toggleSequencerStep(drum.id, step)}
                        className={`
                          w-6 h-6 md:w-8 md:h-8 rounded transition-all
                          ${sequencerPattern[drum.id][step]
                            ? `bg-gradient-to-br ${drum.color} ring-1 ring-white`
                            : 'bg-white/10 hover:bg-white/20'
                          }
                          ${currentStep === step && sequencerPlaying ? 'ring-2 ring-yellow-400' : ''}
                          ${step % 4 === 0 ? 'ml-1' : ''}
                        `}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sequencer Controls */}
          <div className="flex justify-center gap-3 mt-4">
            {!sequencerPlaying ? (
              <button
                onClick={startSequencer}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105"
              >
                ▶️ Play
              </button>
            ) : (
              <button
                onClick={stopSequencer}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105"
              >
                ⏹️ Stop
              </button>
            )}
            <button
              onClick={clearSequencer}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Looper */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 text-center">🔁 Looper</h2>
          
          {/* Loop Length */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-white font-bold">Loop:</span>
            {[2000, 4000, 8000].map(len => (
              <button
                key={len}
                onClick={() => setLoopLength(len)}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  loopLength === len
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {len / 1000}s
              </button>
            ))}
          </div>
          
          {/* Loop Layers */}
          {loopLayers.length > 0 && (
            <div className="mb-4 space-y-2">
              {loopLayers.map((layer, i) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-3 p-2 rounded-xl ${
                    layer.muted ? 'bg-white/5' : 'bg-white/15'
                  }`}
                >
                  <span className="text-white font-bold">Layer {i + 1}</span>
                  <span className="text-white/60 text-sm">{layer.notes.length} notes</span>
                  <div className="flex-1" />
                  <button
                    onClick={() => toggleLayerMute(layer.id)}
                    className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                      layer.muted
                        ? 'bg-red-500/50 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {layer.muted ? '🔇' : '🔊'}
                  </button>
                  <button
                    onClick={() => deleteLoopLayer(layer.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold transition-all"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Recording indicator */}
          {loopRecording && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-bold">Recording loop...</span>
            </div>
          )}
          
          {/* Looper Controls */}
          <div className="flex justify-center gap-3">
            {!loopRecording ? (
              <button
                onClick={startLoopRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <span className="w-3 h-3 bg-white rounded-full" />
                Add Layer
              </button>
            ) : (
              <button
                onClick={stopLoopRecording}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105 animate-pulse ring-2 ring-red-500"
              >
                ⏹️ Stop
              </button>
            )}
            
            {loopLayers.length > 0 && (
              <>
                <button
                  onClick={toggleLoopPlayback}
                  className={`${
                    loopPlaying
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105`}
                >
                  {loopPlaying ? '⏹️ Stop' : '▶️ Play Loop'}
                </button>
                <button
                  onClick={clearLooper}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105"
                >
                  🗑️ Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 text-center">🎙️ Recording Studio</h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                Record
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2 animate-pulse ring-2 ring-red-500"
              >
                <span className="w-3 h-3 bg-red-500 rounded" />
                Stop Recording
              </button>
            )}
            
            {recordedNotes.length > 0 && !isRecording && (
              <>
                {!isPlaying ? (
                  <button
                    onClick={playRecording}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    ▶️ Play
                  </button>
                ) : (
                  <button
                    onClick={stopPlayback}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    ⏹️ Stop
                  </button>
                )}
                
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                >
                  💾 Save
                </button>
                
                <button
                  onClick={shareRecording}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                >
                  📤 Share
                </button>
                
                <button
                  onClick={() => setRecordedNotes([])}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                >
                  🗑️ Clear
                </button>
              </>
            )}
          </div>
          
          {/* Recording visualization */}
          {recordedNotes.length > 0 && (
            <div className="bg-black/30 rounded-xl p-3 overflow-hidden">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {recordedNotes.slice(-50).map((note, i) => (
                  <div
                    key={i}
                    className={`
                      flex-shrink-0 w-6 h-8 rounded flex items-center justify-center text-xs font-bold
                      ${note.type === 'piano' 
                        ? 'bg-gradient-to-b from-yellow-400 to-orange-500 text-white'
                        : note.type === 'guitar'
                        ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white'
                        : note.type === 'xylophone'
                        ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 text-white'
                        : 'bg-gradient-to-b from-pink-500 to-purple-600 text-white'
                      }
                    `}
                  >
                    {note.type === 'piano' ? '♪' : note.type === 'guitar' ? '🎸' : note.type === 'xylophone' ? '✨' : '●'}
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-xs text-center mt-2">
                {recordedNotes.length} notes recorded
              </p>
            </div>
          )}
        </div>

        {/* Saved Recordings */}
        {recordings.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 text-center">📁 My Recordings</h2>
            <div className="grid gap-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="bg-white/10 rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-white/20 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate">{recording.name}</h3>
                    <p className="text-white/60 text-sm">
                      {recording.notes.length} notes • {Math.round(recording.duration / 1000)}s
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadRecording(recording)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 text-center">
          <h2 className="text-xl font-bold text-white mb-3">🎮 How to Play</h2>
          <div className="text-white/80 text-sm md:text-base space-y-2">
            <p>🎹 <strong>Piano:</strong> Click keys or use keyboard (A-K for white, W-E-T-Y-U for black)</p>
            <p>🎸 <strong>Guitar:</strong> Click strings to strum different notes</p>
            <p>🎵 <strong>Xylophone:</strong> Tap the colorful bars for metallic tones</p>
            <p>🥁 <strong>Drums:</strong> Click pads or use keys 1-0, -, =</p>
            <p>🎛️ <strong>Sequencer:</strong> Click grid to program beats, then play!</p>
            <p>🔁 <strong>Looper:</strong> Record multiple layers and play them together</p>
            <p>🎙️ <strong>Record:</strong> Capture your performance to save or share!</p>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-bounce-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">💾 Save Recording</h3>
            <input
              type="text"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              placeholder="Enter a name..."
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-gray-800 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveRecording}
                disabled={!recordingName.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl font-bold transition-all disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-bounce-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">📤 Share Your Music!</h3>
            <div className="bg-gray-100 rounded-xl p-3 mb-4 break-all text-sm text-gray-600">
              {shareUrl}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold transition-all"
              >
                Close
              </button>
              <button
                onClick={copyShareUrl}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-bold transition-all"
              >
                📋 Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  )
}
