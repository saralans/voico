import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'
import { DetectedFace, CompositionResult } from '@/types/composition'
import { compositionBoxColor } from '@/services/CompositionService'

interface Props {
  faces: DetectedFace[]
  result: CompositionResult | null
  visible: boolean
}

export function CompositionOverlay({ faces, result, visible }: Props) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start()
  }, [visible])

  const face = faces[0] ?? null
  const boxColor = compositionBoxColor(result)

  return (
    <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="none">

      {/* ── Rule-of-thirds grid ── */}
      <View style={[styles.gridLine, styles.vLine1]} />
      <View style={[styles.gridLine, styles.vLine2]} />
      <View style={[styles.gridLine, styles.hLine1]} />
      <View style={[styles.gridLine, styles.hLine2]} />

      {/* ── Face bounding box ── */}
      {face && (
        <View
          style={{
            position: 'absolute',
            left: face.bounds.origin.x,
            top: face.bounds.origin.y,
            width: face.bounds.size.width,
            height: face.bounds.size.height,
          }}
        >
          {/* Corner marks — each is two short perpendicular lines */}
          <Corner position="topLeft" color={boxColor} />
          <Corner position="topRight" color={boxColor} />
          <Corner position="bottomLeft" color={boxColor} />
          <Corner position="bottomRight" color={boxColor} />

          {/* Warning badges below the face box */}
          <View style={styles.badgeRow}>
            {result?.backlit && <WarningBadge label="BACKLIT" />}
            {result?.faceTooClose && <WarningBadge label="TOO CLOSE" />}
            {result?.faceTooFar && <WarningBadge label="TOO FAR" />}
            {result?.noFace === false && !result.faceCentered && (
              <WarningBadge label="OFF CENTER" />
            )}
          </View>
        </View>
      )}

      {/* ── No face detected ── */}
      {faces.length === 0 && visible && (
        <View style={styles.noFaceHint}>
          <Text style={styles.noFaceText}>No face detected</Text>
        </View>
      )}

    </Animated.View>
  )
}

// ─── Corner mark ─────────────────────────────────────────────────────────────

const CORNER_SIZE = 16
const CORNER_THICKNESS = 2

type CornerPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

function Corner({ position, color }: { position: CornerPosition; color: string }) {
  const posStyle = {
    topLeft:     { top: 0, left: 0 },
    topRight:    { top: 0, right: 0 },
    bottomLeft:  { bottom: 0, left: 0 },
    bottomRight: { bottom: 0, right: 0 },
  }[position]

  // Horizontal arm direction
  const hStyle = {
    topLeft:     { left: 0 },
    topRight:    { right: 0 },
    bottomLeft:  { left: 0 },
    bottomRight: { right: 0 },
  }[position]

  // Vertical arm direction
  const vStyle = {
    topLeft:     { top: 0 },
    topRight:    { top: 0 },
    bottomLeft:  { bottom: 0 },
    bottomRight: { bottom: 0 },
  }[position]

  return (
    <View style={[{ position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE }, posStyle]}>
      {/* Horizontal arm */}
      <View
        style={[
          { position: 'absolute', width: CORNER_SIZE, height: CORNER_THICKNESS, backgroundColor: color },
          position.includes('top') ? { top: 0 } : { bottom: 0 },
          hStyle,
        ]}
      />
      {/* Vertical arm */}
      <View
        style={[
          { position: 'absolute', width: CORNER_THICKNESS, height: CORNER_SIZE, backgroundColor: color },
          vStyle,
          hStyle,
        ]}
      />
    </View>
  )
}

// ─── Warning badge ────────────────────────────────────────────────────────────

function WarningBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const GRID_COLOR = 'rgba(255,255,255,0.14)'

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: GRID_COLOR,
  },
  vLine1: { left: '33.33%', top: 0, bottom: 0, width: 1 },
  vLine2: { left: '66.67%', top: 0, bottom: 0, width: 1 },
  hLine1: { top: '33.33%', left: 0, right: 0, height: 1 },
  hLine2: { top: '66.67%', left: 0, right: 0, height: 1 },
  badgeRow: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 160, 0, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  noFaceHint: {
    position: 'absolute',
    bottom: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  noFaceText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    letterSpacing: 0.5,
  },
})
