# VOICO — Phase 1 Setup

## Prerequisites

- iPhone with iOS 16+
- Node.js 18+ and npm installed on your Mac
- Free Expo account → https://expo.dev/signup

---

## First-time setup (run once)

### 1. Install dependencies
```bash
npm install
```

### 2. Fix any Expo SDK version mismatches
```bash
npx expo install --fix
```

### 3. Install EAS CLI globally
```bash
npm install -g eas-cli
```

### 4. Log into your Expo account
```bash
npx eas login
```

### 5. Configure EAS for this project
```bash
npx eas build:configure
```
When prompted, select **iOS** only for now.

---

## Build and install on your iPhone

```bash
npx eas build --platform ios --profile development
```

- First build takes ~20 minutes (cloud build, no Xcode needed)
- When done, EAS prints a QR code and install link
- Open the link on your iPhone → tap **Install**
- After installing, open **VOICO** from your home screen

---

## Day-to-day development

After the initial build, JavaScript changes reload instantly — no rebuild needed:

```bash
npx expo start
```

Scan the QR code with your iPhone's camera (or press `i` for iOS). Changes appear live.

---

## On first launch

Grant all three permissions when iOS prompts:
- Camera
- Microphone
- Speech Recognition

If you accidentally deny one, go to **Settings → Privacy → [Camera / Microphone / Speech Recognition]** and enable VOICO.

---

## Voice commands (Phase 1)

| Say | What happens |
|-----|-------------|
| "frame me" | VOICO acknowledges (full composition check in Phase 2) |
| "start studio mode" | VOICO enters Studio Mode |
| "record" | 3-2-1 countdown → recording starts |
| "stop" | Recording ends |
| "mark mistake" | VOICO confirms the marker |
| Say "um" or "wait" during recording | VOICO flags a possible mistake |

---

## What's built in Phase 1

```
✓  Full-screen front camera feed
✓  Continuous speech-to-text (always listening)
✓  Text-to-speech responses (VOICO's voice)
✓  Keyword command parsing (no network, no latency)
✓  Studio Mode state machine: idle → armed → recording → stopped
✓  Animated voice waveform (shows VOICO is listening)
✓  Live transcript display
✓  Hesitation detection during recording ("um", "wait", etc.)
✓  Zustand stores wired up for Phase 2+
✓  EAS development build configured
```

---

## Troubleshooting

**STT never starts / VOICO doesn't hear me**
Check that Speech Recognition permission is granted in Settings.

**Camera shows "Camera access required"**
Check that Camera permission is granted in Settings.

**Build fails on EAS**
Run `npx expo doctor` to check for dependency issues, then `npx expo install --fix`.

**VOICO speaks but misunderstands commands**
Speak clearly and wait for a brief pause after each command. The STT auto-restarts after each result — there's a ~500ms gap between recognition sessions.
