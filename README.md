# VOICO

An AI videographer that lives on your iPhone. Point the camera at yourself, talk to it, and it coaches your framing, monitors your take, and summarizes the session when you're done — all hands-free.

## What it does

- **Composition check** — say "frame me" and VOICO tells you if your face is centered, too close, or backlit
- **Studio Mode** — runs a pre-flight checklist (battery, storage, camera, mic), then counts down to recording
- **Live monitoring** — during a take it detects focus loss, long silences, and hesitation words in real time
- **Session summary** — when you say "stop", VOICO reads back a summary and flags timestamped edit points

## Voice commands

| Say | Action |
|-----|--------|
| "frame me" / "how do I look" | Composition check |
| "studio mode" | Start Studio Mode flow |
| "record" / "action" | Start recording |
| "stop" / "cut" | Stop recording |
| "mark that" / "oops" | Flag an edit point |
| "save session" | Save the session |

## Tech stack

- **Expo SDK 52** (React Native, TypeScript)
- **expo-speech-recognition** — on-device STT via iOS SFSpeechRecognizer
- **expo-speech** — TTS for VOICO's voice
- **expo-camera v16** — live camera preview
- **expo-router** — file-based navigation
- **Zustand** — lightweight state management

## Running locally

> Requires a physical iPhone — `expo-speech-recognition` uses native iOS APIs that don't work in simulators or Expo Go.

```bash
git clone https://github.com/saralans/voico.git
cd voico
npm install

# Install iOS dependencies
cd ios && pod install && cd ..

# Build and run on device (phone must be plugged in via USB)
npx expo run:ios --device
```

On first run, trust the developer certificate on your iPhone via **Settings → General → VPN & Device Management**.

## Project structure

```
app/
  studio/          # Main Studio Mode screen (state machine)
components/
  camera/          # Camera preview, composition overlay
  studio/          # Voice waveform, recording HUD, checklist
services/
  VoiceService.ts  # STT + TTS + command dispatch
  CompositionService.ts  # Face position math
hooks/
  useVoice.ts      # Speech recognition lifecycle
stores/            # Zustand stores (app, session, composition)
constants/
  commands.ts      # Keyword → command mappings
  responses.ts     # All VOICO spoken lines
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for full design details.
