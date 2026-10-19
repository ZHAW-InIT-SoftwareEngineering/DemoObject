# Lessons Learned – Nacht der Technik (3 July 2026)

## What went well

- **Overall:** A big success with very good feedback from visitors. We are on the right track.
- **Decoration:** The booth looked appealing and drew people in. Visitors especially loved the stickers. → **Keep this for future events.**

## What needs improvement

### 1. App flow and usability
The flow within the app was not intuitive. Visitors repeatedly asked what to do next and when.
- **Action:** Review the user journey and make the next step obvious at each stage.

### 2. Path input in `/maze` was confusing
Visitors were unsure how to enter the path in the `/maze` route, because the theory section taught them the DSL proxy with the cross.
- **Action:** Use one consistent input method across theory and maze, or add a short overlay explaining how to enter the path.

### 3. People don't read
The concepts are well explained, but visitors simply don't read text.
- **Action:** Reduce text to a minimum and rely more on visuals, short cues, and verbal explanations from the team.

### 4. Display laptops went to sleep
The laptops mirroring the `/display` route kept turning off their screens.
- **Action:** Find a cross-platform solution (macOS, Windows, Linux) and apply it **before** the event. Options:
  - Per OS: `caffeinate -di` (macOS), `powercfg /change monitor-timeout-ac 0` and `powercfg /change standby-timeout-ac 0` (Windows), `xset s off -dpms` (Linux/X11).
  - App-level: use the browser [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) in the `/display` route, which works independently of the OS.

### 5. LLM was not working
The LLM feature did not work during the event.
- **Action:** Investigate the root cause.
- **Action:** Set up and test the LLM backend (incl. VM reboots) **at least 2 days before** the event, not on the same day.

## Checklist for next event

- [ ] App flow reviewed and simplified
- [ ] Path input in `/maze` aligned with theory, or explained with an overlay
- [ ] Text reduced, visuals added
- [ ] Screen-sleep prevention configured and tested on all display laptops
- [ ] LLM backend set up and verified 2 days in advance
- [ ] Deco and stickers packed
