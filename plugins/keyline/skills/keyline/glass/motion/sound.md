# UI sound

The most optional thing in the system: "if you're going to do it, here's how", not a recommendation. Whether a preset allows sound, and the rules for arming, hover, dense surfaces and mute, are in `domains/motion/patterns.md`, sound; this file is glass's synthesis and the decisions behind it.

## Synthesise, don't ship files

The whole sound design is ~100 lines of Web Audio, no assets: two sounds, generated on demand. Tuning is editing numbers, not re-exporting audio.

## The "tok"

A woody marimba-like tick: a sine fundamental, a fast-decaying partial, and a noise transient for the attack.

```ts
function tok(base: number, duration: number, volume: number): void {
  if (muted) return;
  const c = getCtx();
  if (!c || c.state !== "running") return;
  const now = c.currentTime;

  // Fundamental + a 3.9:1 partial that decays faster than the body.
  const tones: [number, number, number][] = [
    [1, 1, duration],
    [3.9, 0.32, duration * 0.45],
  ];
  for (const [ratio, vmul, dur] of tones) {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = base * ratio;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume * vmul, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  // Wooden contact tick: short lowpassed noise for the "k".
  const transient = 0.012;
  const noise = c.createBufferSource();
  noise.buffer = getNoise(c);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2600;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.7, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + transient);
  noise.connect(lp).connect(noiseGain).connect(c.destination);
  noise.start(now);
  noise.stop(now + transient + 0.01);
}

export const playHover = () => tok(1200, 0.09, 0.05);
export const playClick = () => tok(900, 0.14, 0.13);
```

### Why each piece is there

**The 3.9:1 partial.** A pure sine reads as a test tone. Struck wooden bars have a strong inharmonic partial near the 4th, and slightly *off* 4.0 reads as physical rather than as a musical interval. It's quieter (0.32×) and decays in 45% of the time, as a real bar's overtones die first.

**The noise transient.** 12ms of lowpassed white noise at the attack is the "k" in "tok", the contact before the note's body: without it a pitched beep, with it something *struck*. Lowpassed at 2600Hz so it's a thud, not a click.

**Exponential ramps, not linear.** Loudness perception is logarithmic, so a linear ramp seems to decay too fast and then hang. `exponentialRampToValueAtTime` matches perception, and can't target zero, hence `0.0001` at both ends.

**The 2ms attack** avoids the click of a discontinuity while still feeling instantaneous.

### Hover vs click

|  | Hover | Click |
|---|---|---|
| Base | 1200Hz | 900Hz |
| Duration | 90ms | 140ms |
| Gain | 0.05 | 0.13 |

Hover is higher, shorter and **2.6× quieter**: you cross dozens of links moving around a page, and hover at click volume is intolerable within seconds. Click, a completed action, is louder and lower, since lower pitch reads as more consequential. Roughly a fourth apart, they sound pleasant when a click follows a hover.

## The autoplay policy

An `AudioContext` starts `suspended` and resumes only from a user gesture, so hover sounds stay silent until the reader's first real interaction unlocks it, permanently.

```ts
export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}
```

Every playback path checks state rather than assuming:

```ts
if (!c || c.state !== "running") return;
```

That's a feature, not a workaround: a page you've merely scrolled past makes no sound. Fail silently; never surface an error for this.

### Arm it on every activation gesture

```ts
const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

/* Idempotent — resume() on a running context is a no-op, which is cheaper
   than the bookkeeping to detach these after the first one lands. */
const onUnlock = () => unlockAudio();
for (const type of UNLOCK_EVENTS) {
  document.addEventListener(type, onUnlock, { passive: true });
}
```

The reference implementation shipped `pointerdown` alone for months. A reader who only moved the mouse across the dock heard nothing — *the hover was the interaction* — which hid because testers click something within seconds; and keyboard-only readers never heard the site. `keydown` is the fix that matters most: the affected group is the one least able to work around it.

## Delegation, not per-element wiring

One set of document listeners covers every link and button on the site.

```ts
const SELECTOR = "a, button, [role='button'], summary";

const onOver = (e: PointerEvent) => {
  // Mouse only — touch has no hover, and we don't want a tick on tap.
  if (e.pointerType && e.pointerType !== "mouse") return;
  const el = (e.target as Element | null)?.closest?.(SELECTOR) ?? null;
  if (el === lastHover) return;   // don't re-fire while moving within one element
  lastHover = el;
  if (el) playHover();
};

document.addEventListener("pointerover", onOver);
document.addEventListener("click", onClick);
```

- **`pointerType !== "mouse"` bails out**, or every tap plays both sounds 15ms apart, like a stutter.
- **`lastHover` deduplication.** `pointerover` fires for descendants too, so an icon *inside* a button would re-trigger without the identity check.
- **`closest(SELECTOR)`** covers anything interactive, including elements added later, with no per-component wiring. `summary` is in it because a `<details>` disclosure is a real control that should feel like one.

### Dense surfaces opt out of the hover tick

```ts
// Surfaces of a hundred small targets (an image wall, a filmstrip) opt out with
// data-quiet-hover: a tick per tile is a machine gun. Clicks still tick.
if (el && !el.closest("[data-quiet-hover]")) playHover();
```

One attribute on the container quiets the subtree on hover while clicks stay audible. It's a rate limit, not "this surface is unimportant".

## Sound as a phrase

Occasionally you want a *run*: the reference implementation plays one note per photograph as they flick past in the opening screen, then a landing note as the real mark arrives.

```ts
/* An A major pentatonic run, written out rather than computed from an
   interval: five notes want to BE a phrase, and pentatonic is the scale
   where no two of them can sound wrong together. */
const RIFFLE = [880, 990, 1100, 1320, 1467];

export function playRiffleStep(i: number): void {
  tok(RIFFLE[Math.min(Math.max(i | 0, 0), RIFFLE.length - 1)], 0.1, 0.06);
}

/** The mark arriving last, and the run resolving onto it. */
export const playLanding = () => tok(587, 0.26, 0.16);
```

- **Pentatonic, because the phrase can be truncated.** A photograph that fails to load drops its turn and the run comes up short; with no dissonant pair in the scale, it still sounds finished.
- **Quieter than a click** (0.06 against 0.13). Five notes inside a second should read as a flutter, not a drum fill.
- **The landing note resolves *downward*.** It sits a fifth below where the run started and is the only accented note. Landing above the run sounds like one more step, not an ending.

It's still a set piece, not a texture — once a session. See §14 of `glass/motion/guide.md`.

## Mute, and persistence

```ts
let muted = localStorage.getItem("ui-sound") === "off";

export function setMuted(value: boolean): void {
  muted = value;
  try { localStorage.setItem("ui-sound", value ? "off" : "on"); } catch {}
}
```

The mute control sits in the nav's settings box beside the theme toggle, with an `aria-pressed` state and a label.

## Should the default be on?

Arguable. On a personal site where sound is part of the character, on is defensible — the only way most people will discover it, and it's quiet, short and muteable. On anything the user didn't choose to visit (a tool, an app, a client site), default to off. If it's on, the mute control must be *findable within seconds*; that's the price.

## What's deliberately absent

**Haptics.** `navigator.vibrate()` isn't implemented: Safari on iOS lacks it, so it would fire only on Android, and a feedback channel on one platform is worse than none. If you add it, keep it under 10ms and tie it to the same mute preference.

**Sounds for anything but hover, click and the one greeting phrase** — no navigation, reveal or error sounds. The riffle earns its place by playing once per tab.

**Pitch variation** by element type or position. It turns an ambient texture into something the user starts trying to interpret.
