import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as Speech from 'expo-speech'
import { CameraPreview } from '@/components/camera/CameraPreview'
import { CompositionOverlay } from '@/components/camera/CompositionOverlay'
import { VoiceWaveform } from '@/components/studio/VoiceWaveform'
import { useVoice } from '@/hooks/useVoice'
import { VoiceService } from '@/services/VoiceService'
import { analyzeComposition, compositionSpeech } from '@/services/CompositionService'
import { useSessionStore, StudioState } from '@/stores/sessionStore'
import { useCompositionStore } from '@/stores/compositionStore'
import { VOICOCommand } from '@/types/commands'
import { DetectedFace } from '@/types/composition'
import { RESPONSES } from '@/constants/responses'
import { delay } from '@/utils/delay'

export default function StudioScreen() {
  const { studioState, setStudioState, setRecordingStartTime } = useSessionStore()
  const { result: compositionResult, setResult } = useCompositionStore()
  const { transcript, isListening } = useVoice()

  const [faces, setFaces] = useState<DetectedFace[]>([])
  const [countdownValue, setCountdownValue] = useState<number | null>(null)

  // Refs prevent stale closures in async handlers
  const studioStateRef = useRef(studioState)
  const latestFacesRef = useRef<DetectedFace[]>([])
  const cameraLayoutRef = useRef({ width: 0, height: 0 })

  useEffect(() => {
    studioStateRef.current = studioState
  }, [studioState])

  // ── Camera callbacks ────────────────────────────────────────────────────────

  const handleFacesDetected = useCallback((detected: DetectedFace[]) => {
    setFaces(detected)
    latestFacesRef.current = detected
    const { width, height } = cameraLayoutRef.current
    if (width > 0) {
      const result = analyzeComposition(detected[0] ?? null, width, height)
      setResult(result)
    }
  }, [setResult])

  const handleCameraLayout = useCallback((layout: { width: number; height: number }) => {
    cameraLayoutRef.current = layout
  }, [])

  // ── Voice commands ──────────────────────────────────────────────────────────

  const handleCommand = useCallback(async (cmd: VOICOCommand) => {
    const state = studioStateRef.current

    switch (cmd) {
      case VOICOCommand.COMPOSITION_CHECK: {
        const face = latestFacesRef.current[0] ?? null
        const { width, height } = cameraLayoutRef.current
        const result = analyzeComposition(face, width, height)
        setResult(result)
        await VoiceService.speak(compositionSpeech(result))
        break
      }

      case VOICOCommand.STUDIO_MODE:
        if (state !== 'idle') break
        setStudioState('armed')
        await VoiceService.speak(RESPONSES.studioModeReady)
        break

      case VOICOCommand.START_RECORDING:
        if (state !== 'armed') {
          await VoiceService.speak(RESPONSES.notArmed)
          break
        }
        setStudioState('countdown')
        setCountdownValue(3)
        Speech.speak('3', { rate: 0.75 })
        await delay(1100)
        setCountdownValue(2)
        Speech.speak('2', { rate: 0.75 })
        await delay(1100)
        setCountdownValue(1)
        Speech.speak('1', { rate: 0.75 })
        await delay(1100)
        setCountdownValue(null)
        setStudioState('recording')
        setRecordingStartTime(Date.now())
        await VoiceService.speak(RESPONSES.recordingStarted)
        break

      case VOICOCommand.STOP_RECORDING:
        if (state !== 'recording') break
        setStudioState('stopped')
        setRecordingStartTime(null)
        await VoiceService.speak(RESPONSES.recordingStopped)
        await delay(2000)
        setStudioState('idle')
        break

      case VOICOCommand.MARK_MISTAKE:
        if (state !== 'recording') break
        await VoiceService.speak(RESPONSES.mistakeMarked)
        break

      default:
        break
    }
  }, [setStudioState, setRecordingStartTime, setResult])

  useEffect(() => VoiceService.onCommand(handleCommand), [handleCommand])

  useEffect(() => {
    return VoiceService.onHesitation(async () => {
      if (studioStateRef.current !== 'recording') return
      await VoiceService.speak(RESPONSES.hesitation)
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => VoiceService.speak(RESPONSES.greeting), 1200)
    return () => clearTimeout(timer)
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />

      <CameraPreview
        onFacesDetected={handleFacesDetected}
        onViewLayout={handleCameraLayout}
      />

      {/* Composition overlay — visible when idle so user sees framing feedback */}
      <CompositionOverlay
        faces={faces}
        result={compositionResult}
        visible={studioState === 'idle'}
      />

      {/* ── Top bar ── */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <Text style={styles.title}>VOICO</Text>
        <StateBadge state={studioState} />
      </SafeAreaView>

      {/* ── Countdown overlay ── */}
      {countdownValue !== null && (
        <View style={styles.countdownOverlay} pointerEvents="none">
          <Text style={styles.countdownText}>{countdownValue}</Text>
        </View>
      )}

      {/* ── REC indicator ── */}
      {studioState === 'recording' && (
        <View style={styles.recRow} pointerEvents="none">
          <View style={styles.recDot} />
          <Text style={styles.recLabel}>REC</Text>
        </View>
      )}

      {/* ── Bottom panel ── */}
      <SafeAreaView style={styles.bottomPanel} edges={['bottom']}>
        <StatusHint state={studioState} compositionResult={compositionResult} />
        <VoiceWaveform active={isListening} />
        {transcript.length > 0 && (
          <Text style={styles.transcript} numberOfLines={1}>
            {transcript}
          </Text>
        )}
      </SafeAreaView>
    </View>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StateBadge({ state }: { state: StudioState }) {
  const map: Record<StudioState, { bg: string; label: string }> = {
    idle:      { bg: '#2a2a2a', label: 'IDLE' },
    checklist: { bg: '#1a3a5c', label: 'CHECKING' },
    armed:     { bg: '#1a4d1a', label: 'READY' },
    countdown: { bg: '#5c3a1a', label: 'STARTING' },
    recording: { bg: '#7a0000', label: '● REC' },
    stopped:   { bg: '#2a2a2a', label: 'STOPPED' },
  }
  const { bg, label } = map[state]
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  )
}

function StatusHint({
  state,
  compositionResult,
}: {
  state: StudioState
  compositionResult: ReturnType<typeof useCompositionStore>['result']
}) {
  if (state === 'idle') {
    if (!compositionResult || compositionResult.noFace) {
      return <Text style={styles.hint}>Say 'frame me' or 'start studio mode'</Text>
    }
    const allGood =
      compositionResult.faceCentered &&
      compositionResult.headroomOk &&
      !compositionResult.faceTooClose &&
      !compositionResult.faceTooFar
    return (
      <Text style={[styles.hint, { color: allGood ? 'rgba(0,220,100,0.8)' : 'rgba(255,180,0,0.8)' }]}>
        {allGood ? 'Composition looks great' : 'Say "frame me" for feedback'}
      </Text>
    )
  }

  const staticHints: Partial<Record<StudioState, string>> = {
    armed:   "Say 'record' when ready",
    stopped: 'Session ended',
  }
  const text = staticHints[state]
  if (!text) return null
  return <Text style={styles.hint}>{text}</Text>
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 6, zIndex: 10,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeLabel: { color: '#fff', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 20, backgroundColor: 'rgba(0,0,0,0.3)',
  },
  countdownText: { color: '#fff', fontSize: 130, fontWeight: '100' },
  recRow: {
    position: 'absolute', top: 72, left: 22,
    flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 10,
  },
  recDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#ff3b30' },
  recLabel: { color: '#ff3b30', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28, paddingBottom: 12,
    alignItems: 'center', gap: 10, zIndex: 10,
  },
  hint: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center' },
  transcript: {
    color: 'rgba(255,255,255,0.4)', fontSize: 12, fontStyle: 'italic', textAlign: 'center',
  },
})
