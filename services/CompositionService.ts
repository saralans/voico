import { CompositionResult, DetectedFace } from '@/types/composition'
import { THRESHOLDS } from '@/constants/thresholds'

const T = THRESHOLDS.composition

export function analyzeComposition(
  face: DetectedFace | null,
  frameWidth: number,
  frameHeight: number,
): CompositionResult {
  if (!face || frameWidth === 0 || frameHeight === 0) {
    return {
      faceCentered: false,
      headroomOk: false,
      backlit: false,
      faceTooClose: false,
      faceTooFar: false,
      noFace: true,
      feedback: [],
    }
  }

  const { origin, size } = face.bounds

  // Normalize all measurements to [0, 1] relative to the frame
  const centerX = (origin.x + size.width / 2) / frameWidth
  const headroom = origin.y / frameHeight
  const widthRatio = size.width / frameWidth

  const faceCentered = centerX >= 0.33 && centerX <= 0.67
  const headroomOk = headroom >= T.headroomMinPct && headroom <= T.headroomMaxPct
  const faceTooClose = widthRatio > T.faceTooClosePct
  const faceTooFar = widthRatio < T.faceTooFarPct
  // Backlit: position heuristic placeholder — full luminance check in Phase 6
  const backlit = false

  const feedback: string[] = []

  if (faceCentered) {
    feedback.push('Face centered.')
  } else {
    feedback.push(
      centerX < 0.5
        ? 'Move slightly right to center yourself.'
        : 'Move slightly left to center yourself.',
    )
  }

  if (headroomOk) {
    feedback.push('Headroom looks good.')
  } else if (headroom < T.headroomMinPct) {
    feedback.push("Move down slightly — you're too high in the frame.")
  } else {
    feedback.push('Move up slightly — not enough headroom.')
  }

  if (faceTooClose) feedback.push("You're a bit close. Step back slightly.")
  if (faceTooFar) feedback.push("You're quite far. Move closer to the camera.")
  if (backlit) feedback.push('Window behind you is causing backlighting. Try moving away from it.')

  return { faceCentered, headroomOk, backlit, faceTooClose, faceTooFar, noFace: false, feedback }
}

export function compositionSpeech(result: CompositionResult): string {
  if (result.noFace) {
    return "I can't see your face. Please position yourself in frame."
  }

  const hasIssue =
    !result.faceCentered ||
    !result.headroomOk ||
    result.faceTooClose ||
    result.faceTooFar ||
    result.backlit

  if (!hasIssue) {
    return 'Face centered. Headroom looks good. Composition looks great.'
  }

  return result.feedback.join(' ')
}

export function compositionBoxColor(result: CompositionResult | null): string {
  if (!result || result.noFace) return 'rgba(255,255,255,0.4)'
  const hasIssue =
    !result.faceCentered ||
    !result.headroomOk ||
    result.faceTooClose ||
    result.faceTooFar ||
    result.backlit
  return hasIssue ? 'rgba(255, 180, 0, 0.85)' : 'rgba(0, 220, 100, 0.85)'
}
