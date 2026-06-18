# Theory Chat Dialog Stable Scroll

## Context

The theory chat dialog streams assistant responses into
`frontend/src/components/app/theory/TheoryChatWidget.tsx`.

Before the fix, the dialog content used this layout class:

```tsx
max-h-[min(680px,calc(100vh-2rem))]
```

That only capped the dialog height. It did not give the dialog a fixed height.
As streamed text arrived, the message content increased the dialog's intrinsic
height. The dialog therefore kept growing vertically until it reached the
maximum height. Only after reaching that maximum did the transcript area start
scrolling.

The desired behavior is different:

- The dialog should keep the same height while a response streams.
- The transcript area should absorb the growth.
- Once the transcript content is taller than its allocated area, the transcript
  should scroll internally.
- The newest streamed text should stay visible without resizing the dialog.

## Layout Fix

The dialog content now uses a fixed responsive height:

```tsx
h-[min(680px,calc(100dvh-2rem))]
```

This changes the dialog from "grow until this maximum" to "use this stable
height":

- `680px` keeps the desktop dialog from becoming too tall.
- `100dvh - 2rem` keeps the dialog inside the visible viewport on smaller
  screens.
- `dvh` is used instead of `vh` so mobile browser chrome changes are handled
  more accurately.

The dialog still uses the existing grid row structure:

```tsx
grid-rows-[auto_minmax(0,1fr)_auto]
```

That divides the fixed-height dialog into three rows:

- Header: `auto`
- Transcript: `minmax(0,1fr)`
- Input area: `auto`

The important part is the middle row. `minmax(0,1fr)` allows the transcript row
to shrink inside the fixed-height grid instead of forcing the grid taller based
on its content.

## Transcript Scroll Area

The transcript container keeps these classes:

```tsx
min-h-0 overflow-y-auto
```

They work together with the fixed-height grid:

- `min-h-0` allows the grid child to be smaller than its content.
- `overflow-y-auto` makes the transcript itself scroll when messages exceed the
  available row height.

Without `min-h-0`, CSS grid's default minimum size behavior can let content push
the row larger than intended. Without `overflow-y-auto`, overflowing messages
would not get an internal scrollbar.

## Streaming Scroll Behavior

A ref was added for the transcript element:

```tsx
const transcriptRef = useRef<HTMLDivElement | null>(null);
```

The transcript div receives that ref:

```tsx
<div ref={transcriptRef} className="min-h-0 overflow-y-auto ...">
```

Whenever `messages` changes, the component scrolls the transcript to the bottom:

```tsx
useEffect(() => {
  const transcript = transcriptRef.current;
  if (!transcript) return;

  transcript.scrollTop = transcript.scrollHeight;
}, [messages]);
```

This matters for streaming because each response delta updates the assistant
message text. That updates `messages`, React re-renders the transcript content,
and the effect moves the transcript scroll position to the newest content.

The dialog height stays unchanged because the outer dialog has a fixed
responsive height. The transcript scroll position changes because the inner
transcript is the only element allowed to overflow.

## Result

While the assistant response streams:

- The dialog no longer grows vertically.
- The header and input area stay fixed in place.
- The transcript area scrolls internally as content grows.
- The newest streamed assistant text remains visible at the bottom.

The behavior matches what already happened after the dialog reached its previous
maximum height, but now it happens immediately because the transcript has a
stable allocated height from the start.

## Verification

The frontend build passes:

```bash
npm run build --prefix frontend
```
