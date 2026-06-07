# VOICO — Expo/React Native Architecture

## Overview

VOICO is a single-iPhone app. The phone acts as both the camera/mic and the AI production monitor. The user talks to it; it watches, listens, and responds in real time.

---

## Design Decisions & Disclaimers

Three non-obvious choices baked into this architecture — worth knowing before the demo.

### 1. EAS Build, not Expo Go
`expo-speech-recognition` (real-time STT) uses the native iOS Speech framework and cannot run inside the Expo Go sandbox. This project requires an **EAS Development Build** — a custom native build compiled in Expo's cloud, then installed on your iPhone via a QR link. No Xcode needed, but the first build takes ~20 minutes and requires a free Expo account. Subsequent JS-only changes reload instantly without a rebuild.

> **Demo implication:** The app will not run from the Expo Go App Store app. It runs from a custom build installed directly on your device.

### 2. Focus detection is a confidence proxy, not native sharpness
`expo-face-detector` does not expose a raw sharpness or blur score. Focus loss is inferred by tracking **face detection confidence** across frames — if confidence drops from ~0.9 to below 0.4 for more than one second, VOICO fires a focus warning. This works well when the subject moves out of focus or steps back sharply, but it will not catch subtle lens hunting. For the demo, moving clearly out of focus (leaning back, stepping away) reliably triggers the warning.

> **Demo implication:** For the focus warning segment, make a deliberate movement — don't expect it to fire from small micro-focus adjustments.

### 3. Studio Mode is a state machine, not a free-form UI
The main screen has exactly six states: `idle → checklist → armed → countdown → recording → stopped`. Transitions are one-directional and voice-triggered. There are no manual buttons for most actions during the demo — VOICO drives the flow. This is intentional for demo reliability: it prevents accidental state jumps and makes the voice interaction feel authoritative.

> **Demo implication:** Practice the voice commands in order. Saying "record" while in `idle` (before Studio Mode) will not work — the state machine requires passing through the checklist first.

---

## Build Target

| | |
|---|---|
| **Framework** | Expo SDK 52, TypeScript |
| **Routing** | Expo Router (file-based, like Next.js) |
| **State** | Zustand (lightweight, no boilerplate) |
| **Testing on device** | EAS Development Build (cloud-compiled — no Xcode needed) |
| **Why not Expo Go** | `expo-speech-recognition` requires a native build; Expo Go can't include it |

### How device testing works without Xcode

```
You write code → push to GitHub (or local)
       ↓
eas build --platform ios --profile development
       ↓
EAS cloud builds it (~20 min first time)
       ↓
Installs on your iPhone via a QR code link
       ↓
Subsequent JS changes reload instantly (no rebuild needed)
```

One free Expo account. No Apple Developer paid account needed for personal device.

---

## Project Structure

```
voico/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout, permission requests
│   ├── index.tsx                 # Entry → redirect to studio
│   └── studio/
│       ├── index.tsx             # Studio Mode (main screen)
│       └── summary.tsx           # Session Summary screen
│
├── components/
│   ├── camera/
│   │   ├── CameraPreview.tsx     # Live camera feed
│   │   ├── CompositionOverlay.tsx # Face box, rule-of-thirds grid, warning badges
│   │   └── FaceGuide.tsx         # Centered/off-center face indicator
│   ├── studio/
│   │   ├── ChecklistPanel.tsx    # Pre-flight checklist with live checks
│   │   ├── RecordingHUD.tsx      # Timer, REC dot, live warning toasts
│   │   └── VoiceWaveform.tsx     # Animated waveform — shows VOICO is listening
│   └── summary/
│       ├── SummaryCard.tsx       # Full session summary display
│       └── EditMarkerList.tsx    # Timestamped edit suggestions
│
├── services/
│   ├── VoiceService.ts           # STT + TTS + command dispatch
│   ├── CompositionService.ts     # Face position math (rule of thirds, headroom, backlight)
│   ├── FocusService.ts           # Focus quality from face detection confidence
│   ├── AudioService.ts           # Silence detection + hesitation word matching
│   ├── ResourceService.ts        # Battery level, storage capacity, time estimate
│   └── SessionService.ts         # Event log, edit markers, summary generation
│
├── stores/
│   ├── appStore.ts               # App-wide state (permissions, VOICO active)
│   ├── sessionStore.ts           # Recording state, events, summary
│   └── compositionStore.ts       # Real-time face/composition state
│
├── hooks/
│   ├── useVoice.ts               # Wraps VoiceService for components
│   ├── useComposition.ts         # Live composition feedback
│   ├── useSession.ts             # Recording lifecycle
│   └── useResources.ts           # Battery + storage polling
│
├── types/
│   ├── session.ts                # SessionEvent, SessionSummary
│   ├── composition.ts            # CompositionResult, FacePosition
│   └── commands.ts               # VOICOCommand enum
│
├── constants/
│   ├── commands.ts               # Keyword → command mappings
│   ├── thresholds.ts             # Battery %, silence duration, etc.
│   └── responses.ts              # All VOICO spoken lines
│
└── utils/
    ├── formatTime.ts             # ms → "1:42" formatting
    └── luminance.ts              # Pixel brightness helpers for backlight detection
```

---

## Screen Architecture

Studio Mode is a single screen with a **state machine**. The camera is always visible; the bottom panel changes per state.

```
┌─────────────────────────────────────────────┐
│                                             │
│           CAMERA PREVIEW                   │
│         (always full-screen)               │
│                                             │
│  [CompositionOverlay — shown in idle]       │
│  [RecordingHUD — shown while recording]    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         BOTTOM PANEL                │   │
│  │  changes based on state below       │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

STATES:
  idle        → composition overlay + "Say 'Studio Mode' to begin"
  checklist   → animated checklist running live checks
  armed       → "All systems go. Say 'record' when ready."
  countdown   → 3… 2… 1…
  recording   → REC dot + timer + live warning toasts
  stopped     → "Generating summary…"

                    ↓ auto-navigates
  
Session Summary (separate screen, full-screen card)
  → VOICO reads aloud automatically on mount
```

---

## Service Designs

### VoiceService

Handles all spoken I/O and command parsing.

```
STT stream (continuous) ──→ transcript buffer
                                  │
                          command detector
                         (keyword matching)
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
              dispatch command            hesitation detector
           (to session/studio)          ("um", "wait", "let me")
                                               │
                                        log SessionEvent
```

**Commands (keyword-matched — no network, no latency):**

| User says | Command |
|-----------|---------|
| "frame me" / "check composition" | `COMPOSITION_CHECK` |
| "start studio mode" / "studio mode" | `STUDIO_MODE` |
| "record" / "start recording" | `START_RECORDING` |
| "stop" / "cut" / "stop recording" | `STOP_RECORDING` |
| "mark mistake" / "mark" | `MARK_MISTAKE` |
| "save" / "yes" (post-session) | `SAVE_SESSION` |

**Hesitation triggers** (logged but don't interrupt):
`"um"`, `"uh"`, `"wait"`, `"let me"`, `"actually"`, `"sorry"`, `"let me restart"`

---

### CompositionService

Takes face bounds from `expo-face-detector` on each frame. Returns a `CompositionResult`.

```typescript
interface CompositionResult {
  faceCentered: boolean      // face center within middle third horizontally
  headroomOk: boolean        // 10–20% gap between face top and frame top
  backlit: boolean           // face region darker than frame edges
  faceTooClose: boolean      // face bounds > 60% of frame width
  faceTooFar: boolean        // face bounds < 15% of frame width
  noFace: boolean
  feedback: string[]         // spoken lines: ["Face centered", "Backlighting detected"]
}
```

**Backlight detection** — no pixel access needed:
expo-face-detector returns a `yawAngle` and bounds. If bounds are present but face landmark confidence is low, and the phone is pointed toward a bright source (estimated from orientation + time of day), flag backlighting. For the demo, a luminance heuristic on the face region via canvas is the fallback.

**Rule of thirds:**
Divide frame into a 3×3 grid. Ideal face center = upper intersection points (⅓ from top, ⅓ or ⅔ from left).

---

### FocusService

expo-face-detector doesn't expose a raw sharpness score. Proxy approach:

```
Each frame → face detection result
                  │
         track these values:
         • face bounds stability  (jitter = focus hunting)
         • landmark confidence    (drops when blurry)
         • face count changes     (disappears when very blurry)
                  │
         rolling window (last 10 frames)
                  │
         if avg confidence < 0.4 for 1s → "focus warning"
         if confidence recovers > 0.7  → "focus restored"
                  │
         log SessionEvent with timestamp
```

---

### AudioService

Two parallel monitors:

**1. Silence detection** via `expo-av` audio metering:
```
Record audio with metering enabled
Poll audio power (dB) every 200ms
If power < –40 dB for > 2.5 seconds during recording → log silence event
```

**2. Hesitation detection** via STT transcript (in VoiceService):
```
Transcript buffer updated every ~500ms
Match against hesitation word list
Log event if match found (debounce 3s — don't double-log)
```

---

### ResourceService

Polled every 10 seconds during recording.

| Resource | API | Warning threshold |
|----------|-----|-------------------|
| Battery | `expo-battery` `getBatteryLevelAsync()` | < 20% |
| Storage | `expo-file-system` `getFreeDiskStorageAsync()` | < 500 MB |
| Recording time estimate | `freeStorage / estimatedBitrate` | < 10 min remaining |

Estimated bitrate: ~17 MB/min (1080p H.264 on iPhone, conservative estimate).

---

### SessionService

All events feed into a central log. Summary is generated at stop.

```typescript
interface SessionEvent {
  id: string
  timestamp: number          // ms from recording start
  type: EventType
  note?: string
}

type EventType =
  | 'recording_start'
  | 'recording_stop'
  | 'focus_lost'
  | 'focus_restored'
  | 'hesitation'
  | 'silence'
  | 'user_marker'
  | 'battery_warning'
  | 'storage_warning'

interface SessionSummary {
  duration: number
  focusIssues: { start: number; end: number }[]
  suggestedEdits: { start: number; end: number; reason: string }[]
  batteryWarnings: number[]
  storageWarnings: number[]
}
```

**Edit marker logic:**
Pair `focus_lost` + `focus_restored` → focus issue range.
Cluster `hesitation` / `silence` / `user_marker` events within 30s → single suggested edit window (start 5s before first, end 5s after last).

---

## Data Flow (recording session)

```
User: "Record"
       │
  VoiceService detects START_RECORDING command
       │
  sessionStore.startRecording()
  SessionService.logEvent('recording_start')
       │
  ┌────┴────────────────────────────────────────┐
  │  Parallel monitors (all running):           │
  │                                             │
  │  CameraPreview  → FocusService              │
  │  expo-av meter  → AudioService              │
  │  ResourceService polling                    │
  │  VoiceService STT → hesitation detection    │
  └────────────────────────────────────────────┘
       │
  Each monitor → SessionService.logEvent(...)
               → VOICO speaks warning if threshold crossed
       │
User: "Stop"
       │
  SessionService.generateSummary()
  Navigate to summary screen
  VOICO reads summary aloud
```

---

## Key Packages

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-camera": "~16.0.0",
  "expo-face-detector": "~13.0.0",
  "expo-speech": "~13.0.0",
  "expo-speech-recognition": "~0.2.0",
  "expo-av": "~15.0.0",
  "expo-battery": "~13.0.0",
  "expo-file-system": "~18.0.0",
  "react-native-reanimated": "~3.16.0",
  "zustand": "^5.0.0",
  "typescript": "^5.3.0"
}
```

---

## Build Phases

### Phase 1 — Foundation
- [ ] Expo project init (TypeScript + Expo Router)
- [ ] Camera feed rendering (CameraPreview)
- [ ] VoiceService: TTS speaking + STT listening
- [ ] Command parsing ("record", "stop", "studio mode")
- [ ] Zustand stores wired up
- [ ] EAS development build profile configured

### Phase 2 — Computer Vision
- [ ] expo-face-detector on camera frames
- [ ] CompositionService: face centering, headroom, backlight
- [ ] CompositionOverlay: face bounding box, grid, warning badges
- [ ] "VOICO, frame me" works end-to-end

### Phase 3 — Studio Mode
- [ ] Studio Mode state machine (idle → checklist → armed → recording → stopped)
- [ ] ChecklistPanel with real checks (battery, storage, camera, face, mic)
- [ ] 3-2-1 countdown (spoken + animated)
- [ ] RecordingHUD: timer, REC dot

### Phase 4 — Monitoring
- [ ] FocusService: confidence-based focus loss detection
- [ ] AudioService: silence detection + hesitation word matching
- [ ] ResourceService: battery + storage polling + spoken warnings
- [ ] All events logged to SessionService

### Phase 5 — Session Summary
- [ ] SessionService.generateSummary() from event log
- [ ] SummaryCard UI
- [ ] VOICO auto-reads summary on screen mount

### Phase 6 — Demo Polish
- [ ] VoiceWaveform animation (shows VOICO is listening)
- [ ] Transition animations between states
- [ ] VOICO voice tuning (rate, pitch via expo-speech params)
- [ ] Graceful fallbacks for missing permissions
- [ ] Demo walkthrough end-to-end rehearsal

---

## Permissions Required

Declared in `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "VOICO uses the camera to monitor composition and focus.",
      "NSMicrophoneUsageDescription": "VOICO listens for your voice commands and monitors audio.",
      "NSSpeechRecognitionUsageDescription": "VOICO uses speech recognition to understand your commands."
    }
  }
}
```

---

## What to Expect Per Phase

| After Phase | What you can demo |
|-------------|-------------------|
| 1 | Say "record" → VOICO responds. Say "stop" → VOICO confirms. |
| 2 | Point camera at your face → VOICO describes composition. |
| 3 | "Studio Mode" → checklist → countdown → recording HUD. |
| 4 | Say "um" during recording → VOICO logs it. Move out of focus → warning fires. |
| 5 | Stop recording → full session summary spoken + displayed. |
| 6 | Full demo-ready experience. Polished enough to pitch. |
