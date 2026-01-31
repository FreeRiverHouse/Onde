'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParentalControls, AGE_PRESETS, TIME_PRESETS } from '@/hooks/useParentalControls'

// ============================================
// PIN Entry Component
// ============================================

function PinEntry({
  title,
  subtitle,
  onSubmit,
  onCancel,
  error,
  isSetup = false,
}: {
  title: string
  subtitle: string
  onSubmit: (pin: string) => void
  onCancel?: () => void
  error?: string
  isSetup?: boolean
}) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')

  const handleDigit = (digit: string) => {
    if (step === 'enter' && pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length === 4 && !isSetup) {
        onSubmit(newPin)
      } else if (newPin.length === 4 && isSetup) {
        setStep('confirm')
      }
    } else if (step === 'confirm' && confirmPin.length < 4) {
      const newConfirm = confirmPin + digit
      setConfirmPin(newConfirm)
      if (newConfirm.length === 4) {
        if (newConfirm === pin) {
          onSubmit(pin)
        } else {
          setConfirmPin('')
          setPin('')
          setStep('enter')
        }
      }
    }
  }

  const handleDelete = () => {
    if (step === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1))
    } else {
      setPin(prev => prev.slice(0, -1))
    }
  }

  const currentPin = step === 'confirm' ? confirmPin : pin

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-onde-dark/95 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-sm p-8">
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            {step === 'confirm' ? 'Confirm PIN' : title}
          </h2>
          <p className="text-white/60">
            {step === 'confirm' ? 'Enter the PIN again to confirm' : subtitle}
          </p>
        </motion.div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`w-4 h-4 rounded-full border-2 ${
                i < currentPin.length
                  ? 'bg-onde-teal border-onde-teal'
                  : 'border-white/30'
              }`}
              animate={i === currentPin.length - 1 ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        {error && (
          <motion.p
            className="text-red-400 text-center mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              onClick={() => handleDigit(num.toString())}
              className="w-16 h-16 rounded-full bg-white/10 text-white text-2xl font-bold
                         hover:bg-white/20 active:bg-onde-teal/50 transition-colors mx-auto"
              whileTap={{ scale: 0.95 }}
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            onClick={onCancel}
            className="w-16 h-16 rounded-full bg-white/5 text-white/60 text-sm
                       hover:bg-white/10 transition-colors mx-auto"
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-full bg-white/10 text-white text-2xl font-bold
                       hover:bg-white/20 active:bg-onde-teal/50 transition-colors mx-auto"
            whileTap={{ scale: 0.95 }}
          >
            0
          </motion.button>
          <motion.button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-white/5 text-white/60 text-xl
                       hover:bg-white/10 transition-colors mx-auto"
            whileTap={{ scale: 0.95 }}
          >
            ⌫
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Toggle Switch Component
// ============================================

function ToggleSwitch({ 
  enabled, 
  onChange, 
  label,
  description,
  disabled = false,
}: { 
  enabled: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex-1 pr-4">
        <p className="text-white font-medium">{label}</p>
        {description && (
          <p className="text-white/50 text-sm mt-1">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full 
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onde-gold focus-visible:ring-offset-2
          ${enabled ? 'bg-onde-teal' : 'bg-white/20'}
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`
            pointer-events-none inline-block h-6 w-6 transform rounded-full 
            bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}

// ============================================
// Section Card Component
// ============================================

function SettingsSection({
  icon,
  title,
  children,
  locked = false,
}: {
  icon: string
  title: string
  children: React.ReactNode
  locked?: boolean
}) {
  return (
    <motion.div
      className={`card-3d p-6 mb-6 ${locked ? 'opacity-50 pointer-events-none' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-display font-bold text-white">{title}</h2>
        {locked && <span className="text-white/40 text-sm ml-auto">🔒 PIN required</span>}
      </div>
      <div className="divide-y divide-white/5">
        {children}
      </div>
    </motion.div>
  )
}

// ============================================
// Time Slider Component
// ============================================

function TimeSlider({
  value,
  onChange,
  label,
  min = 15,
  max = 480,
  step = 15,
}: {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
  step?: number
}) {
  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white/70">{label}</span>
        <span className="text-onde-teal font-bold">{formatTime(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                   [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full 
                   [&::-webkit-slider-thumb]:bg-onde-teal [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-lg"
      />
      <div className="flex justify-between text-xs text-white/40 mt-1">
        <span>{formatTime(min)}</span>
        <span>{formatTime(max)}</span>
      </div>
    </div>
  )
}

// ============================================
// Activity Report Component
// ============================================

function ActivityReport({ report }: { 
  report: ReturnType<ReturnType<typeof useParentalControls>['getActivityReport']> 
}) {
  const maxMinutes = Math.max(...report.dailyBreakdown.map(d => d.minutes), 60)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-onde-teal">
            {Math.floor(report.totalMinutes / 60)}h {report.totalMinutes % 60}m
          </div>
          <div className="text-white/50 text-sm">Total Time</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-onde-purple">{report.bookOpened}</div>
          <div className="text-white/50 text-sm">Books Opened</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-onde-gold">{report.booksCompleted}</div>
          <div className="text-white/50 text-sm">Completed</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-onde-coral">{report.gamesPlayed}</div>
          <div className="text-white/50 text-sm">Games Played</div>
        </div>
      </div>

      {/* Daily Usage Chart */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-white font-medium mb-4">Daily Usage (Last 7 Days)</h4>
        <div className="flex items-end justify-between gap-2 h-32">
          {report.dailyBreakdown.map((day) => {
            const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0
            const date = new Date(day.date)
            const dayName = date.toLocaleDateString('en', { weekday: 'short' })
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-24">
                  <motion.div
                    className="w-full max-w-[40px] bg-gradient-to-t from-onde-teal to-onde-purple rounded-t-md"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 4)}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
                <span className="text-xs text-white/50">{dayName}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {report.recentActivity.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-medium mb-4">Recent Activity</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {report.recentActivity.map((activity) => {
              const icon = activity.type === 'book_opened' ? '📖' 
                : activity.type === 'book_completed' ? '✅'
                : activity.type === 'game_played' ? '🎮'
                : activity.type === 'session_start' ? '▶️'
                : '⏹️'
              
              const time = new Date(activity.timestamp).toLocaleString('en', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              
              return (
                <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      {activity.contentTitle || activity.type.replace('_', ' ')}
                    </p>
                    <p className="text-white/40 text-xs">{time}</p>
                  </div>
                  {activity.durationMinutes && (
                    <span className="text-white/50 text-xs">{activity.durationMinutes}m</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Parental Controls Page
// ============================================

export default function ParentalControlsPage() {
  const {
    controls,
    mounted,
    isPinVerified,
    hasPin,
    setPin,
    verifyPinCode,
    lockParentalControls,
    removePin,
    toggleKidsMode,
    updateTimeLimit,
    getTodayUsage,
    getRemainingTime,
    updateContentFilter,
    getActivityReport,
    clearActivityLog,
    resetAllControls,
  } = useParentalControls()

  const [showPinEntry, setShowPinEntry] = useState(false)
  const [pinError, setPinError] = useState<string>()
  const [pinAction, setPinAction] = useState<'verify' | 'setup' | 'change'>('verify')
  const [activeTab, setActiveTab] = useState<'controls' | 'activity'>('controls')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Show PIN entry if needed
  useEffect(() => {
    if (mounted && hasPin && !isPinVerified) {
      setShowPinEntry(true)
      setPinAction('verify')
    }
  }, [mounted, hasPin, isPinVerified])

  const handlePinSubmit = async (pin: string) => {
    setPinError(undefined)
    
    if (pinAction === 'verify') {
      const valid = await verifyPinCode(pin)
      if (valid) {
        setShowPinEntry(false)
      } else {
        setPinError('Incorrect PIN. Try again.')
      }
    } else if (pinAction === 'setup' || pinAction === 'change') {
      const success = await setPin(pin)
      if (success) {
        setShowPinEntry(false)
      } else {
        setPinError('Invalid PIN format')
      }
    }
  }

  const handleSetupPin = () => {
    setPinAction('setup')
    setShowPinEntry(true)
    setPinError(undefined)
  }

  const handleChangePin = () => {
    setPinAction('change')
    setShowPinEntry(true)
    setPinError(undefined)
  }

  const report = getActivityReport(7)

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="floating-orb w-[400px] h-[400px] -top-40 -right-40"
          style={{ background: 'var(--onde-purple)' }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="floating-orb w-[300px] h-[300px] bottom-40 -left-20"
          style={{ background: 'var(--onde-teal)' }}
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* PIN Entry Modal */}
      <AnimatePresence>
        {showPinEntry && (
          <PinEntry
            title={pinAction === 'setup' ? 'Create PIN' : pinAction === 'change' ? 'Set New PIN' : 'Enter PIN'}
            subtitle={
              pinAction === 'setup' 
                ? 'Create a 4-digit PIN to protect parental controls'
                : pinAction === 'change'
                ? 'Enter a new 4-digit PIN'
                : 'Enter your 4-digit parental PIN'
            }
            onSubmit={handlePinSubmit}
            onCancel={() => {
              if (pinAction !== 'verify') {
                setShowPinEntry(false)
              }
            }}
            error={pinError}
            isSetup={pinAction === 'setup' || pinAction === 'change'}
          />
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/settings" className="inline-block text-white/50 hover:text-white mb-4 transition-colors">
            ← Back to Settings
          </Link>
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            👨‍👩‍👧‍👦
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Parental Controls
          </h1>
          <p className="text-white/60">Keep your child&apos;s reading experience safe and balanced</p>
        </motion.div>

        {/* Kids Mode Status Banner */}
        <motion.div
          className={`mb-8 p-4 rounded-2xl flex items-center justify-between ${
            controls.kidsMode 
              ? 'bg-gradient-to-r from-onde-teal/20 to-onde-purple/20 border border-onde-teal/30'
              : 'bg-white/5 border border-white/10'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className={`text-4xl ${controls.kidsMode ? 'animate-bounce' : ''}`}>
              {controls.kidsMode ? '🧸' : '🔓'}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                Kids Mode {controls.kidsMode ? 'Active' : 'Inactive'}
              </h3>
              <p className="text-white/50 text-sm">
                {controls.kidsMode 
                  ? `${getRemainingTime()} minutes remaining today`
                  : 'Enable to apply all parental restrictions'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (controls.kidsMode && hasPin && !isPinVerified) {
                setShowPinEntry(true)
                setPinAction('verify')
              } else {
                toggleKidsMode()
              }
            }}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              controls.kidsMode
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-onde-teal text-onde-dark hover:bg-onde-teal/80'
            }`}
          >
            {controls.kidsMode ? 'Disable' : 'Enable'}
          </button>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'controls'
                ? 'bg-onde-teal text-onde-dark'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            ⚙️ Controls
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'activity'
                ? 'bg-onde-teal text-onde-dark'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            📊 Activity
          </button>
        </div>

        {activeTab === 'controls' ? (
          <>
            {/* PIN Security Section */}
            <SettingsSection icon="🔐" title="PIN Security">
              {!hasPin ? (
                <div className="py-4">
                  <p className="text-white/70 mb-4">
                    Set up a 4-digit PIN to protect parental control settings from being changed.
                  </p>
                  <button
                    onClick={handleSetupPin}
                    className="w-full py-3 bg-onde-teal text-onde-dark font-bold rounded-xl hover:bg-onde-teal/80 transition-colors"
                  >
                    Set Up PIN
                  </button>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">PIN Protection</span>
                    <span className="text-onde-teal">✓ Enabled</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleChangePin}
                      className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Change PIN
                    </button>
                    <button
                      onClick={() => {
                        if (isPinVerified) {
                          removePin()
                        } else {
                          setShowPinEntry(true)
                          setPinAction('verify')
                        }
                      }}
                      className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Remove PIN
                    </button>
                  </div>
                  {isPinVerified && (
                    <button
                      onClick={lockParentalControls}
                      className="w-full py-2 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      🔒 Lock Settings
                    </button>
                  )}
                </div>
              )}
            </SettingsSection>

            {/* Time Limits Section */}
            <SettingsSection icon="⏰" title="Time Limits" locked={hasPin && !isPinVerified}>
              <ToggleSwitch
                enabled={controls.timeLimit.enabled}
                onChange={(enabled) => updateTimeLimit({ enabled })}
                label="Enable Time Limits"
                description="Set daily screen time limits"
              />
              
              {controls.timeLimit.enabled && (
                <>
                  <TimeSlider
                    value={controls.timeLimit.weekdayMinutes}
                    onChange={(weekdayMinutes) => updateTimeLimit({ weekdayMinutes })}
                    label="Weekday Limit (Mon-Fri)"
                  />
                  
                  <TimeSlider
                    value={controls.timeLimit.weekendMinutes}
                    onChange={(weekendMinutes) => updateTimeLimit({ weekendMinutes })}
                    label="Weekend Limit (Sat-Sun)"
                  />

                  <div className="py-4 border-t border-white/10">
                    <ToggleSwitch
                      enabled={controls.timeLimit.bedtimeEnabled}
                      onChange={(bedtimeEnabled) => updateTimeLimit({ bedtimeEnabled })}
                      label="Bedtime Mode"
                      description="Block access during bedtime hours"
                    />
                    
                    {controls.timeLimit.bedtimeEnabled && (
                      <div className="flex gap-4 mt-4">
                        <div className="flex-1">
                          <label className="text-white/50 text-sm">Bedtime starts</label>
                          <input
                            type="time"
                            value={controls.timeLimit.bedtimeStart}
                            onChange={(e) => updateTimeLimit({ bedtimeStart: e.target.value })}
                            className="w-full mt-1 bg-onde-dark-surface border border-white/10 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-white/50 text-sm">Bedtime ends</label>
                          <input
                            type="time"
                            value={controls.timeLimit.bedtimeEnd}
                            onChange={(e) => updateTimeLimit({ bedtimeEnd: e.target.value })}
                            className="w-full mt-1 bg-onde-dark-surface border border-white/10 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="py-4 bg-white/5 rounded-xl p-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Today&apos;s usage</span>
                      <span className="text-onde-teal font-bold">{getTodayUsage()} min</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white/70">Remaining</span>
                      <span className="text-onde-gold font-bold">{getRemainingTime()} min</span>
                    </div>
                  </div>
                </>
              )}
            </SettingsSection>

            {/* Content Filters Section */}
            <SettingsSection icon="🛡️" title="Content Filters" locked={hasPin && !isPinVerified}>
              <ToggleSwitch
                enabled={controls.contentFilter.enabled}
                onChange={(enabled) => updateContentFilter({ enabled })}
                label="Enable Content Filtering"
                description="Filter content based on age appropriateness"
              />
              
              {controls.contentFilter.enabled && (
                <>
                  <div className="py-4">
                    <label className="text-white/70 block mb-3">Maximum Age Rating</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {AGE_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => updateContentFilter({ maxAgeRating: preset.value })}
                          className={`py-2 px-3 rounded-lg text-center transition-all ${
                            controls.contentFilter.maxAgeRating === preset.value
                              ? 'bg-onde-teal text-onde-dark font-bold'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          <div className="font-bold">{preset.label}</div>
                          <div className="text-xs opacity-70">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <ToggleSwitch
                    enabled={controls.contentFilter.hideViolent}
                    onChange={(hideViolent) => updateContentFilter({ hideViolent })}
                    label="Hide Violent Content"
                    description="Filter out books/games with violence"
                  />

                  <ToggleSwitch
                    enabled={controls.contentFilter.hideScary}
                    onChange={(hideScary) => updateContentFilter({ hideScary })}
                    label="Hide Scary Content"
                    description="Filter out horror and scary themes"
                  />

                  <ToggleSwitch
                    enabled={controls.contentFilter.safeSearchEnabled}
                    onChange={(safeSearchEnabled) => updateContentFilter({ safeSearchEnabled })}
                    label="Safe Search"
                    description="Filter search results for age-appropriate content"
                  />
                </>
              )}
            </SettingsSection>

            {/* Quick Presets */}
            <SettingsSection icon="✨" title="Quick Presets" locked={hasPin && !isPinVerified}>
              <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    updateTimeLimit({ enabled: true, weekdayMinutes: 30, weekendMinutes: 60, bedtimeEnabled: true })
                    updateContentFilter({ enabled: true, maxAgeRating: 6, hideViolent: true, hideScary: true })
                  }}
                  className="p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl text-left hover:from-pink-500/30 hover:to-purple-500/30 transition-all"
                >
                  <div className="text-2xl mb-2">👶</div>
                  <div className="text-white font-bold">Toddler Mode</div>
                  <div className="text-white/50 text-sm">Ages 3-6, strict limits</div>
                </button>

                <button
                  onClick={() => {
                    updateTimeLimit({ enabled: true, weekdayMinutes: 60, weekendMinutes: 120, bedtimeEnabled: true })
                    updateContentFilter({ enabled: true, maxAgeRating: 9, hideViolent: true, hideScary: false })
                  }}
                  className="p-4 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-xl text-left hover:from-teal-500/30 hover:to-blue-500/30 transition-all"
                >
                  <div className="text-2xl mb-2">🧒</div>
                  <div className="text-white font-bold">Kid Mode</div>
                  <div className="text-white/50 text-sm">Ages 6-9, balanced limits</div>
                </button>

                <button
                  onClick={() => {
                    updateTimeLimit({ enabled: true, weekdayMinutes: 90, weekendMinutes: 180, bedtimeEnabled: true })
                    updateContentFilter({ enabled: true, maxAgeRating: 12, hideViolent: false, hideScary: false })
                  }}
                  className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl text-left hover:from-yellow-500/30 hover:to-orange-500/30 transition-all"
                >
                  <div className="text-2xl mb-2">🧑</div>
                  <div className="text-white font-bold">Pre-Teen Mode</div>
                  <div className="text-white/50 text-sm">Ages 9-12, relaxed limits</div>
                </button>

                <button
                  onClick={() => {
                    updateTimeLimit({ enabled: false })
                    updateContentFilter({ enabled: false })
                  }}
                  className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all"
                >
                  <div className="text-2xl mb-2">🔓</div>
                  <div className="text-white font-bold">No Restrictions</div>
                  <div className="text-white/50 text-sm">Disable all filters</div>
                </button>
              </div>
            </SettingsSection>

            {/* Danger Zone */}
            <SettingsSection icon="⚠️" title="Reset Options" locked={hasPin && !isPinVerified}>
              <div className="py-4 space-y-3">
                <button
                  onClick={() => clearActivityLog()}
                  className="w-full py-3 bg-white/5 text-white/70 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Clear Activity History
                </button>
                
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                >
                  Reset All Parental Controls
                </button>
              </div>
            </SettingsSection>
          </>
        ) : (
          // Activity Tab
          <SettingsSection icon="📊" title="Activity Report" locked={hasPin && !isPinVerified}>
            <div className="py-4">
              <ActivityReport report={report} />
            </div>
          </SettingsSection>
        )}

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-onde-dark-surface rounded-2xl p-6 max-w-sm w-full"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="text-4xl text-center mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  Reset All Controls?
                </h3>
                <p className="text-white/60 text-center mb-6">
                  This will remove your PIN, all settings, and activity history. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetAllControls()
                      setShowResetConfirm(false)
                    }}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
