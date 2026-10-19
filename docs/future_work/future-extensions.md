# Future Extensions

Ideas for extending the demo object beyond its current scope.

## Current State (short)

Participants draw a path through a maze in the browser. The backend validates
the path, turns it into a small DSL (`UP`, `DOWN`, `LEFT`, `RIGHT`), ranks it by
time and animates it on the shared `/display` screen. The theory pages explain
DSLs and shortest paths (BFS and Dijkstra), and a chat that a self-hosted LLM
answers through a backend proxy is available.

## Ideas

### 1. Natural Language → Code (LLM as Compiler)

Participants describe the route in plain language, for example "go right
until the wall, then down twice". The LLM translates this into DSL commands or a
small program with loops and conditions, such as `repeat 3 { RIGHT }` or
`while not wall: RIGHT`. The backend then executes it in the maze. The display
shows the user prompt, the generated code and the resulting run next to each
other.

**Pros**
- Shows the full chain: human language → formal language → execution.
- Mistakes become useful teaching moments: "the LLM misunderstood you, so what
  went wrong?"
- Uses the existing `/chat` proxy and the `pathValidation` and `pathToDsl`
  logic.

**Cons**
- Depends on the LLM backend, which failed at the Nacht der Technik
  (3 July 2026).
- Response latency and non-deterministic output; generated code must run in a
  sandbox and be validated.
- Requires typing, and visitors tend not to read or write much text.

### 2. Physical Maze with a Small Robot

A tabletop maze with a small robot, such as a Thymio, a LEGO Spike/Mindstorms
kit, a Sphero or an ESP32 model car. The robot drives the participant's DSL
program. The DSL commands map directly onto motor commands.

A simpler variant is a robot arm or pen plotter that traces the path on paper,
so the visitor can keep the drawing as a souvenir.

**Pros**
- Something tangible at the booth draws visitors in.
- The physical run can stream to the display next to the 3D animation.
- Makes "code controls the real world" immediately visible.

**Cons**
- Hardware cost, transport and setup effort, plus a risk of breakage or
  drained batteries during the event.
- Drift and inaccurate turns mean the robot needs calibration or sensors.
- Only one run at a time, which can create a queue at busy events.

### 3. Human vs. Algorithm

After their submission, the participant watches BFS or Dijkstra solve the same
maze step by step, with the explored frontier visible. A side-by-side replay
compares the human path with the optimal one: length, number of turns and
"you were X % longer than optimal".

**Pros**
- Makes the shortest-path theory concrete instead of text-heavy.
- Low effort: `computeShortestPath` already exists; only the visualization of
  the exploration steps is missing.
- Has a competitive element ("beat the algorithm") without new hardware.

**Cons**
- The algorithm always wins on path length, which can feel discouraging.
- Adds another screen to a flow that visitors already found unintuitive.

### 4. Program Instead of Draw (Block-Based DSL)

A Scratch-like editor where participants build the path from DSL blocks
(`MOVE RIGHT 3`, `TURN`, `REPEAT`) before running it, instead of drawing it.
Additional rankings could reward the shortest program, not only the fastest
time.

**Pros**
- Teaches abstraction: loops make programs shorter.
- Fits school or workshop settings well, and kids may already know Scratch.

**Cons**
- Takes longer per participant than drawing, which is too slow for a
  walk-by booth.
- More explanation is needed up front.

### 5. Live Multiplayer Race

Several participants solve the same freshly generated maze at the same time
on their phones. The display shows all cursors live. The generator from maze `2`
can produce a new maze per round so that nobody can memorize the solution.

**Pros**
- Turns the booth into an event with rounds, a countdown and spectators.
- Groups and families can play together.

**Cons**
- Requires pushing live updates (WebSocket/SSE) instead of polling the display
  feed, and round coordination in the backend.
- Depends on stable venue Wi-Fi and mobile reception.
- Waiting for a round to fill up can frustrate solo visitors.

### 6. Voice Control

Participants steer through the maze by voice ("up", "left") or describe the
whole route out loud. Speech-to-text feeds into the DSL, or into idea 1 for free
speech.

**Pros**
- Very low barrier to entry: no reading or typing required, which matches the
  "people don't read" lesson.
- Works well with the physical robot (idea 2).

**Cons**
- The Nacht der Technik (3 July 2026) was very noisy, so speech recognition
  would be unreliable without a headset or push-to-talk microphone.
- Privacy concerns around recording visitors' voices.
- Dialects, accents and multiple languages (Swiss German!) reduce accuracy.
