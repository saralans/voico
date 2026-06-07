# VOICO Demo Script — Draft 1
**Target duration:** 5 minutes  
**Platform:** Expo (React Native) on iPhone via EAS Development Build

---

## SEGMENT 1 — Hook (0:00–0:30)

*[Hold up phone, camera facing audience or pointed at presenter]*

> "Every creator knows the feeling — you record for an hour,
> sit down to edit, and realize your focus was soft at the
> best moment, you said 'um' twelve times, and your battery
> died. VOICO fixes that. Watch."

---

## SEGMENT 2 — Composition Check (0:30–1:30)

*[VOICO app open, camera view live on screen via screen mirror]*

**You:** "VOICO, frame me for a tutorial."

**VOICO** *(spoken + overlay appears):*
- "Face centered." → green box appears around face
- "Headroom looks good." → top-of-frame indicator
- "Window behind you is causing backlighting — try moving left." → backlighting warning flashes red

*[You take one step left]*

**VOICO:** "Composition improved. Ready to record."

---

## SEGMENT 3 — Studio Mode Checklist (1:30–2:15)

**You:** "VOICO, start Studio Mode."

*[Checklist animates onto screen, items check in one by one]*

```
✓  Camera connected
✓  Storage available — 2 hr 14 min remaining
✓  Battery — 87%
✓  Subject visible
✓  Lighting acceptable
✓  Focus acquired
✓  Microphone active
```

**VOICO:** "All systems go. Say 'record' when ready."

---

## SEGMENT 4 — Recording (2:15–3:30)

**You:** "Record."

**VOICO:** "Recording in 3… 2… 1…"  
*[Red REC dot appears. Timer starts.]*

*[Deliver a few lines of fake tutorial — then stumble]*

**You:** "…and then you just — um, wait, actually let me back up for a second…"

**VOICO** *(quietly):* "Possible mistake detected."  
*[Edit marker logged at timestamp 0:22]*

*[Lean back noticeably — a clear, deliberate movement away from camera]*

**VOICO:** "Focus warning."  
*[Focus loss indicator flashes]*

*[Lean back in]*

**VOICO:** "Focus restored."

*[Battery warning fires — pre-staged or real]*

**VOICO:** "Battery at 20 percent."

---

## SEGMENT 5 — Cut + Session Summary (3:30–4:30)

**You:** "Stop."

**VOICO:** "Session ended. Here's your summary."

*[Summary screen animates in]*

```
SESSION SUMMARY
Duration: 1:02

Focus Issues
• 0:38 – 0:44

Suggested Edit Points
• 0:22 – 0:31  (hesitation detected)

Warnings
• Battery 20% at 0:55
```

*VOICO reads the summary aloud as it appears on screen.*

---

## SEGMENT 6 — Close (4:30–5:00)

> "You didn't have to watch a single second of that footage.
> VOICO already found the focus issue, flagged where to cut,
> and warned you before the battery died.
>
> That's VOICO — your AI videographer."

---

## Demo Safety Notes

- Every VOICO line is triggered by real detection — nothing is faked
- Mistake marker fires because you actually say "um, wait" into a live STT feed
- Checklist runs real system checks (battery API, storage API, camera check)
- If anything glitches mid-demo, narrate over it — the concept still lands
- Screen mirror the phone to a display so the audience sees the UI in real time

---

## Technical Disclaimers for Presenter

Three things to know so you can narrate around them if needed.

**1. The app runs from a custom build, not the App Store.**
VOICO requires an EAS Development Build installed directly on your iPhone — it will not appear in or run from the Expo Go app. Install it before the demo and keep it on your home screen.

**2. The focus warning requires a deliberate movement.**
Focus detection infers blur from face detection confidence dropping across frames — it is not a native sharpness sensor. A small lean or subtle shift won't trigger it. For the demo, lean back noticeably (1–2 feet) and pause. The warning reliably fires within ~1 second.

**3. Voice commands only work in sequence.**
Studio Mode is a state machine. "Record" does nothing until you've passed through the checklist. Practice the command order: "Start Studio Mode" → checklist completes → "Record" → … → "Stop". Saying commands out of order will not crash the app, but VOICO will respond with a redirect ("Say 'Studio Mode' to begin").

---

## Tech Stack (for reference)

- **Framework:** Expo (React Native)
- **Camera + Face Detection:** expo-camera, expo-face-detector
- **Speech-to-Text:** expo-speech-recognition
- **Text-to-Speech:** expo-speech
- **Audio Monitoring:** expo-av
- **Battery:** expo-battery
- **Storage:** expo-file-system
- **Build & Testing:** EAS Development Build (cloud-compiled, no Xcode required — free Expo account needed)
