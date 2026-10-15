# Yarn Design System (v1)

Single source of truth for every Yarn screen. If a screen prompt and this doc disagree, this doc wins.

---

## 0. Principles

1. **Voice first, screen second.** The mic and the transcript are the hero. Nothing competes with them.
2. **Calm, not clever.** Whitespace and hierarchy do the work. One accent color, no decoration.
3. **Simple English everywhere.** Users are students, often tired, often on a phone at the end of a workday.
4. **Built for real conditions.** Mid-range Android, patchy data, one-handed use, bright sunlight. Big targets, high contrast, light assets.
5. **Never lose the user's words.** Every state (error, offline, rate limit) protects the transcript first.

---

## 1. Brand

| Item | Spec |
|------|------|
| **Name** | Yarn (always capitalized in prose, lowercase in the wordmark) |
| **Meaning** | Nigerian slang for telling a story. The app turns your spoken "yarn" into a logbook entry. |
| **Tagline** | Speak your day! |
| **Wordmark** | Lowercase "yarn", Montserrat SemiBold, letter-spacing -0.02em, color `--ink-900`. |
| **Glyph** | A single continuous line that loops once, like a strand of thread ending in a small speech-bubble curl. 1.5px stroke, round caps, `--accent-600`. Sits to the left of the wordmark with 8px gap. |
| **App icon** | Indigo (`--accent-600`) rounded square, white glyph centered, ~18% padding. Maskable-safe for PWA. |
| **Theme color (PWA)** | `#4F46E5` |

---

## 2. Color

Light mode only for v1. Tokens are named semantically so dark mode can be added later without redesigning.

### 2.1 Core palette

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#FAFAFA` | Page background |
| `--surface` | `#FFFFFF` | Cards, inputs, bars |
| `--surface-muted` | `#F3F4F6` | Segmented control track, disabled fills, skeletons |
| `--border` | `#E5E7EB` | Default 1px borders, dividers |
| `--border-strong` | `#D1D5DB` | Input borders, checkbox outlines |
| `--ink-900` | `#111827` | Primary text, icons |
| `--ink-600` | `#6B7280` | Secondary text, helper text, inactive nav |
| `--ink-400` | `#9CA3AF` | Disabled text, placeholder text only. Never for meaningful content. |

### 2.2 Accent (indigo, the only brand color)

| Token | Hex | Use |
|-------|-----|-----|
| `--accent-600` | `#4F46E5` | Primary buttons, active states, links, mic button |
| `--accent-700` | `#4338CA` | Hover, pressed, chip text |
| `--accent-100` | `#E0E7FF` | Pressed tint, progress track |
| `--accent-50` | `#EEF2FF` | Chips, selected rows, info notes |
| `--accent-200` | `#C7D2FE` | Borders on tinted surfaces |

### 2.3 Status colors

| Role | Text/icon | Tint bg | Border | Use |
|------|-----------|---------|--------|-----|
| Success | `#15803D` | `#F0FDF4` | `#BBF7D0` | "Saved" pill, logged-day check, toasts |
| Warning | `#92400E` | `#FEF3C7` | `#FDE68A` | Draft pill, `[placeholder]` highlights, link-privacy note |
| Danger | `#DC2626` | `#FEF2F2` | `#FECACA` | Errors, delete, recording dot |

### 2.4 Rules

- **One accent.** Indigo is the only color allowed to be loud. Status colors appear only as small tinted elements.
- **Amber is reserved** for "you need to act or check this" (placeholders, drafts, warnings). Don't use it decoratively.
- **Never rely on color alone.** Every status has an icon or label too (check, lock, alert-triangle).
- **Contrast targets (approx.):** `--ink-900` on white ≈ 17:1, `--ink-600` on white ≈ 4.8:1, white on `--accent-600` ≈ 6.3:1, `#92400E` on `#FEF3C7` ≈ 6:1, `#15803D` on white ≈ 5:1. All body text meets WCAG AA (4.5:1).
- `--ink-400` (≈ 2.5:1) is allowed only for disabled states and placeholders, never for information the user needs.

---

## 3. Typography

**Typeface:** Montserrat (variable). Fallback stack: `Montserrat, "Trebuchet MS", "Segoe UI", Roboto, sans-serif` (Trebuchet covers Mac/Windows, Segoe UI covers Windows, Roboto covers Android).
**Weights used:** 400 (regular), 500 (medium), 600 (semibold). Nothing else.
**Numerals:** use `font-variant-numeric: tabular-nums` (or `font-feature-settings: "tnum"`) for timers, word counts, dates in lists. Montserrat is wide, so check the timer does not jump in width.

| Style | Size / Line | Weight | Tracking | Use |
|-------|-------------|--------|----------|-----|
| Display | 40 / 44 | 600 | -0.02em | Recording timer only |
| Hero | 32 / 40 | 600 | -0.02em | Landing headline |
| Title | 24 / 32 | 600 | -0.01em | Page titles, greeting |
| Heading | 20 / 28 | 600 | -0.01em | Section headers, card titles |
| Subheading | 16 / 24 | 600 | 0 | Card item titles, dates in list cards |
| Body | 16 / 24 | 400 | 0 | Default text |
| Reading | 16 / 26 | 400 | 0 | Generated log entry text (slightly looser for comfort) |
| Small | 14 / 20 | 400 / 500 | 0 | Helper text, secondary info, field labels (500) |
| Caption | 12 / 16 | 400 / 500 | 0.01em | Word counts, timestamps, badge text |
| Overline | 12 / 16 | 600 | 0.04em, uppercase | Section labels in log entry, week group labels |

Rules:
- Montserrat runs about 8% wider than typical UI fonts. Keep reading text to ~60 characters per line, let titles wrap to 2 lines instead of shrinking them, and never go below the sizes in the table.
- Max line length for reading text: ~60 characters (handled by the 640px column).
- Sentence case everywhere (buttons, titles, labels). No Title Case, no ALL CAPS except Overline.
- Text never below 12px.

---

## 4. Spacing and layout

**Base unit:** 4px. **Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

| Context | Value |
|---------|-------|
| Page gutter (mobile) | 20px |
| Page gutter (≥768px) | 32px |
| Card padding | 20px (16px in dense list rows) |
| Gap between cards / sections | 16px within a group, 24px between groups |
| Gap between label and field | 8px |
| Gap between icon and label | 8px |

**Breakpoints**

| Name | Width | Behavior |
|------|-------|----------|
| Mobile | 360-767 | Design at **390px**. Single column, bottom nav, sticky bottom action bar. |
| Tablet/Desktop | ≥768 | Same single column, centered, **max-width 640px** (landing: 480px). Bottom nav becomes a slim top nav. Sticky action bar becomes an inline bar at the bottom of the card. |

One layout, one column, on every screen. Yarn is a focused tool, not a dashboard.

**Safe areas:** bottom bars add `env(safe-area-inset-bottom)`. Top bars add `env(safe-area-inset-top)`.

---

## 5. Radius and elevation

| Token | Value | Use |
|-------|-------|-----|
| `--r-sm` | 8px | Small tags, code chips |
| `--r-md` | 12px | Inputs, list rows, toasts |
| `--r-lg` | 16px | Cards, sheets' inner blocks |
| `--r-xl` | 24px | Bottom sheets, modals (top corners) |
| `--r-full` | 9999px | Buttons, chips, pills, toggles, avatars |

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-0` | none (1px border only) | List rows, inputs |
| `--shadow-1` | `0 1px 2px rgba(16,24,40,0.05)` | Cards |
| `--shadow-2` | `0 4px 12px rgba(16,24,40,0.08)` | Sticky bars (upward), FAB, popovers |
| `--shadow-3` | `0 12px 32px rgba(16,24,40,0.12)` | Modals, bottom sheets |

Cards always have **both** a 1px `--border` and `--shadow-1`. Keep shadows this soft. If it looks like a shadow, it's too much.

---

## 6. Iconography

- **Library:** Lucide. **Stroke:** 1.5px, round caps and joins. **Sizes:** 24px default, 20px in dense rows, 16px inline with Caption text.
- **Color:** `--ink-900` default, `--ink-600` for secondary, `--accent-600` for active, status colors for status.
- **Vocabulary (use these, don't invent):**

| Meaning | Icon |
|---------|------|
| Record / mic | `mic` |
| Stop | `square` (filled) |
| AI generate | `sparkles` |
| Confidential | `lock` |
| API key | `key-round` |
| Yarn link | `link` |
| Vocabulary | `book-open` |
| Writing style | `pen-line` |
| Profile | `user` |
| Date | `calendar` |
| Upload / Download | `upload` / `download` |
| Copy | `copy` |
| Regenerate | `refresh-cw` |
| Delete | `trash-2` |
| Back | `arrow-left` |
| More | `more-vertical` |
| Expand | `chevron-down` |
| Success | `check` / `check-circle-2` |
| Warning | `alert-triangle` |
| Info | `info` |
| Search | `search` |
| Document | `file-text` |
| Close / remove | `x` |
| Add | `plus` |
| Show / hide | `eye` / `eye-off` |
| Nav: Logs / Export / Settings | `book-text` / `file-down` / `settings` |

No emoji in the UI. No illustrations. No stock photos.

---

## 7. Motion

| Token | Value |
|-------|-------|
| `--dur-fast` | 120ms (hover, press, toggle) |
| `--dur-base` | 200ms (expand/collapse, chip add/remove, toasts) |
| `--dur-slow` | 320ms (page/sheet transitions) |
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` |

Signature motion:
- **Mic pulse:** two rings behind the mic, scaling 1 → 1.35, opacity 0.16 → 0, 1.6s loop, second ring delayed 0.8s.
- **Waveform:** vertical bars, 120ms height easing, driven by mic input level.
- **Transcript settling:** interim words fade from `--ink-600` to `--ink-900` over 200ms when finalized.
- **Skeleton shimmer:** 1.4s linear loop on `--surface-muted`.
- **Press:** scale to 0.98 over 120ms.

Respect `prefers-reduced-motion`: replace pulses and shimmers with static states, keep only opacity fades.

---

## 7.5 Interaction states (all interactive elements)

| State | Treatment |
|-------|-----------|
| Default | As specified |
| Hover (desktop only) | Primary: `--accent-700`. Others: `--surface-muted` background. |
| Pressed | Scale 0.98 + one step darker |
| Focus-visible | 2px `--accent-600` ring, 2px offset. Inputs: border becomes `--accent-600` plus a 3px ring `rgba(79,70,229,0.2)`. |
| Disabled | Background `--surface-muted`, text `--ink-400`, no shadow, no hover |
| Loading | Spinner replaces the leading icon, label stays, button stays same width, non-interactive |
| Error | Border and helper text `--danger`, `alert-triangle` icon before the message |

---

## 8. Components

### 8.1 Buttons

| Variant | Style |
|---------|-------|
| **Primary** | Fill `--accent-600`, white text 16/600, `--r-full`. |
| **Secondary** | White fill, 1px `--border-strong`, `--ink-900` text. |
| **Ghost** | No fill or border, `--ink-900` (or `--accent-600` for links). |
| **Destructive** | White fill, 1px `--danger`, `--danger` text. (Filled red only inside a confirmation dialog.) |
| **Icon button** | 48×48 circle, secondary style, 24px icon. |

| Size | Height | Use |
|------|--------|-----|
| L | 56px | Hero actions ("New Log", "Get started") |
| M | 48px | Default |
| S | 40px | Inline, desktop-only secondary actions (never the only way to do something on mobile) |

Horizontal padding 24px. Icon + label gap 8px. Full-width on mobile for primary actions.

### 8.2 Text inputs and text areas

- Height 52px (text), min-height 120px (text area). Radius `--r-md`. Fill `--surface`. 1px `--border-strong`.
- Label above: Small/500, `--ink-900`. Helper below: Caption, `--ink-600`. Placeholder: `--ink-400`.
- Password/key field: masked with eye toggle (48px target) on the right.
- Character/word hints sit bottom-right inside the field's helper row.

### 8.3 Toggle

- 52×32 track, `--r-full`. Off: `--border-strong` track. On: `--accent-600` track. White 24px thumb. Full row is the tap target (min 48px tall).

### 8.4 Checkbox

- 24px visible box, `--r-sm`, 1.5px `--border-strong`. Checked: `--accent-600` fill, white check. Hit area 48px. Disabled: `--surface-muted` fill, `--ink-400` mark.

### 8.5 Segmented control

- Height 48px, track `--surface-muted`, `--r-full`, 4px inner padding. Selected segment: `--accent-600` fill, white text, `--r-full`. Unselected: `--ink-600` text. Max 3 segments.

### 8.6 Chips

- **Filter chip:** height 36px, `--r-full`, white with 1px `--border-strong`. Selected: `--accent-50` fill, `--accent-200` border, `--accent-700` text.
- **Vocabulary chip:** height 32px, `--accent-50` fill, `--accent-700` text 14/500, trailing `x` (16px). 8px gaps, wraps to multiple lines.

### 8.7 Badges and pills (height 24px, Caption/600, `--r-full`, always icon + text)

| Badge | Style |
|-------|-------|
| Saved | Success tint, `check` icon |
| Draft | Warning tint, `pen-line` icon |
| Confidential | `--surface-muted` fill, `--ink-600`, `lock` icon |
| Optional | Text-only tag, `--surface-muted`, `--ink-600` |

### 8.8 Cards

- **Content card:** `--surface`, 1px `--border`, `--r-lg`, `--shadow-1`, padding 20px. Optional header: 20px icon in a 36px `--accent-50` circle + Heading + Small description.
- **Log card (list item):** same as content card, padding 16px, tap target is the whole card. Contents: date (Subheading, tabular), 2-line preview (Small, `--ink-600`, ellipsis), footer row (Caption word count + badges).
- **Note box:** `--r-md`, tint fill + tint border, 12px padding, leading 16px icon, Small text. Variants: info (accent), warning (amber), success.

### 8.9 Navigation

- **Top bar:** 56px, `--surface`, bottom 1px `--border`. Back button left (48px target), title center or left, action right.
- **Bottom nav (mobile):** 64px + safe area, `--surface`, top 1px `--border`. 3 items (Logs, Export, Settings). Icon 24 + label Caption. Active: `--accent-600` icon and label, no pill background. Inactive: `--ink-600`.
- **Desktop nav (≥768):** slim top bar with wordmark left, three text links right, active link `--accent-600` with 2px underline.

### 8.10 Sticky action bar

- `--surface`, top 1px `--border`, `--shadow-2` (upward), padding 12px 20px + safe area. Holds 1-2 actions; the primary fills the remaining width. Content above it gets bottom padding equal to the bar's height.

### 8.11 Toast

- `--ink-900` fill, white text 14/500, `--r-md`, 12px 16px padding, leading icon. Appears 16px above the bottom nav / action bar, auto-dismisses in 4s, one line max.

### 8.12 Dialog / bottom sheet

- Bottom sheet on mobile (`--r-xl` top corners, drag handle 36×4 `--border-strong`), centered modal on desktop (max 420px). Title Heading, body Body, actions stacked full-width on mobile: primary/destructive on top, ghost "Cancel" below. Scrim `rgba(17,24,39,0.4)`.

### 8.13 Yarn-specific components

**Mic button**
- 112px circle, `--accent-600`, white 40px icon. Idle: `mic` icon, one faint static ring (`--accent-100`). Recording: `square` icon, two pulsing rings. Error/denied: `--danger` fill, `mic-off` icon, no pulse.

**Waveform strip**
- Height 40px, full card width. Bars 3px wide, 3px gap, `--r-full`, `--accent-600`, min height 4px. Idle: flat line of `--border-strong` dots.

**Timer**
- Display style, tabular numerals, `--ink-900`, format `mm:ss`.

**Live transcript card**
- Content card, min-height 160px. Label row: Overline "LIVE TRANSCRIPT" + 8px `--danger` blinking dot while recording. Finalized text `--ink-900`, interim text `--ink-600`. Tap to edit. Placeholder when empty: "Your words will appear here as you speak."

**Log entry block (view/edit)**
- Six sections, each: Overline label in `--ink-600` + Reading text below, 20px between sections. Editing: section gets `--accent-600` 1.5px outline, `--r-md`, 8px padding, no layout shift.
- **Placeholder token** (`[number of samples]`): `--warning-bg` fill, `--warning-text` text, `--r-sm`, 2px 6px padding, 500 weight. Tapping selects it for replacement.

**Week strip**
- 7 circles, 32px, evenly spaced, day initial below in Caption. Logged: `--accent-600` fill + white check. Today: 2px `--accent-600` ring, no fill. Missed past day: `--surface-muted`. Future: `--surface-muted` at 50% opacity.

**Selectable log row (export)**
- Row height 64px, `--r-md`, 1px `--border`. Checkbox left, date (Subheading) + one-line preview (Caption, ellipsis), word count right. Selected: `--accent-50` fill. Confidential: whole row 50% opacity, disabled checkbox, `lock` icon, note "Confidential, excluded from exports".

---

## 9. Patterns

### 9.1 Empty states
- Centered inside the list area: 48px `--accent-50` circle with a 24px icon in `--accent-600`, Heading (one short line), Small `--ink-600` helper (one line), optional Primary button. No illustrations.

### 9.2 Loading
- **Generating entry:** skeleton of the log entry block (six overline + text skeleton pairs) with shimmer, plus a status line "Yarn is writing your entry..." with a small spinner. The transcript stays visible and safe above it.
- **Lists:** 3 skeleton log cards.
- **Buttons:** spinner in place of icon (see 7.5).

### 9.3 Errors (always include: what happened, what to do, and that the words are safe)

| Situation | Where | Copy |
|-----------|-------|------|
| Mic permission denied | Note box (danger) above mic + red mic button | "Yarn can't hear you yet. Allow microphone access in your browser settings, or upload a voice memo instead." |
| Browser doesn't support speech | Note box (warning) | "This browser can't listen live. Upload a voice memo and Yarn will do the rest." |
| Daily limit reached | Dialog | "You've used today's free entries. Add your own Gemini key in Settings to keep going. Your transcript is saved." |
| Generation failed | Inline note box + Retry button | "Something went wrong while writing your entry. Your words are safe. Try again." |
| Offline | Slim banner under top bar (warning) | "You're offline. Some things won't work until you're back." |

### 9.4 Destructive actions
- Delete log: always a confirmation bottom sheet. Title "Delete this log?", body "This can't be undone.", actions "Delete" (destructive filled red) and "Cancel" (ghost).

### 9.5 Confidential mode
- Anywhere a confidential log appears: `lock` icon + "Confidential" badge. Transcript area replaced by a `--surface-muted` note: "Transcript not stored for confidential entries."

---

## 10. Voice and copy

- **Tone:** warm, plain, encouraging. Like a helpful coursemate, not a corporate app.
- **Person:** talk to "you". Yarn refers to itself as "Yarn" (not "we", not "I").
- **Language:** basic English. Short sentences. No jargon ("transcript" is fine, "STT/LLM/API" are not visible unless the user opted into API key settings, and even there prefer "your own Gemini key").
- **Buttons:** verb first, 1-3 words. "New Log", "Generate Logbook Entry", "Save changes", "Download Word document".
- **Dates:** short "Tue, 30 Sep", long "Tuesday, 30 September 2026". Day before month (Nigerian convention).
- **Numbers:** "212 words", "3 of 5 days". Times in 12-hour "9:00 AM".
- **No** exclamation marks except the tagline "Speak your day!" and rare celebrations. No emoji, no all-caps except Overline.

---

## 11. Accessibility and performance

**Accessibility**
- Text contrast ≥ 4.5:1, UI component contrast ≥ 3:1.
- Touch targets ≥ 48×48px (S buttons 40px are desktop-only, never sole path on mobile).
- Visible focus ring on every interactive element.
- Layout survives 200% text zoom without horizontal scroll.
- Mic button has an `aria-label` that changes with state ("Start recording" / "Stop recording"). Timer and status text in an `aria-live="polite"` region.
- Reduced motion respected (see section 7).

**Performance (PWA on mid-range Android, patchy data)**
- Self-host Montserrat, Latin subset, variable weights 400-600 only, `font-display: swap`. The fallback stack should stay readable if it never loads.
- No raster images in the UI. SVG icons only, tree-shaken.
- Shadows and blurs kept minimal (no backdrop-filter).
- App shell cached by service worker so the shell opens offline.

---

## 12. Design tokens (CSS)

```css
:root {
  /* Surfaces */
  --bg: #FAFAFA;
  --surface: #FFFFFF;
  --surface-muted: #F3F4F6;
  --border: #E5E7EB;
  --border-strong: #D1D5DB;

  /* Ink */
  --ink-900: #111827;
  --ink-600: #6B7280;
  --ink-400: #9CA3AF;

  /* Accent */
  --accent-600: #4F46E5;
  --accent-700: #4338CA;
  --accent-200: #C7D2FE;
  --accent-100: #E0E7FF;
  --accent-50:  #EEF2FF;

  /* Status */
  --success: #15803D; --success-bg: #F0FDF4; --success-border: #BBF7D0;
  --warning: #92400E; --warning-bg: #FEF3C7; --warning-border: #FDE68A;
  --danger:  #DC2626; --danger-bg:  #FEF2F2; --danger-border:  #FECACA;

  /* Radius */
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 24px; --r-full: 9999px;

  /* Elevation */
  --shadow-1: 0 1px 2px rgba(16,24,40,0.05);
  --shadow-2: 0 4px 12px rgba(16,24,40,0.08);
  --shadow-3: 0 12px 32px rgba(16,24,40,0.12);

  /* Spacing (4px base) */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 20px;
  --s-6: 24px; --s-8: 32px; --s-10: 40px; --s-12: 48px; --s-16: 64px;

  /* Motion */
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 320ms;
  --ease: cubic-bezier(0.2, 0, 0, 1);

  /* Type */
  --font: Montserrat, "Trebuchet MS", "Segoe UI", Roboto, sans-serif;
}
```

---

## 13. Paste-in block for Google Stitch

Put this at the top of every screen prompt.

```text
DESIGN SYSTEM (follow exactly, do not improvise):
App: "Yarn", mobile-first responsive PWA for Nigerian SIWES students to speak daily work notes and get clean logbook entries. Clean, minimal, calm. Light mode only.

Colors: background #FAFAFA, surface #FFFFFF, muted surface #F3F4F6, border #E5E7EB, strong border #D1D5DB, text #111827, secondary text #6B7280. ONE accent: indigo #4F46E5 (hover #4338CA, tint #EEF2FF, tint border #C7D2FE). Success #15803D on #F0FDF4. Warning/placeholder #92400E on #FEF3C7. Danger #DC2626 on #FEF2F2. No other colors, no gradients.

Type: Montserrat only (fallbacks: Trebuchet MS, Segoe UI, Roboto), weights 400/500/600. Scale: 40 timer, 32 hero, 24 title, 20 heading, 16 body (line 24; 26 for log entry text), 14 small, 12 caption. Overline = 12px, 600, uppercase, +0.04em tracking. Sentence case everywhere.

Shape: 8px grid (4px base), 20px page gutters. Cards white, 1px #E5E7EB border, 16px radius, very soft shadow. Inputs 52px tall, 12px radius. Buttons and chips fully rounded; heights 56 (hero), 48 (default). Touch targets at least 48px. Lucide-style 1.5px line icons only. No illustrations, photos or emoji.

Layout: design at 390px wide. Single column, max-width 640px centered on desktop. Mobile: 64px bottom nav (Logs, Export, Settings; active item indigo) and sticky bottom action bar with white background and top border. Top bar 56px with back arrow.

Wordmark: lowercase "yarn" in Montserrat semibold with a small looping-thread glyph in indigo. Tagline: "Speak your day!"
```

---

## 14. Decisions log (changes from earlier prompts)

| Decision | Detail |
|----------|--------|
| Success green darkened | `#16A34A` → `#15803D` so green text passes AA on white. |
| Warning text darkened | `#B45309` → `#92400E` for placeholders and amber notes (better contrast on `#FEF3C7`). |
| One max-width | All screens use 640px (landing 480px). Earlier prompts varied between 480 and 680. |
| Segmented control | Selected = indigo fill, white text, everywhere. |
| Type scale locked | 40 / 32 / 24 / 20 / 16 / 14 / 12 only. |
| Nav breakpoint | Bottom nav below 768px, top nav at 768px and above. |
| Buttons | Three sizes only (56 / 48 / 40). |
| Typeface changed | Inter → Montserrat, fallbacks Trebuchet MS, Segoe UI, Roboto. Overline tracking reduced to 0.04em because Montserrat is wider. |
| Tagline | "Speak your day!" (replaces "Speak your day. Get your logbook."). The only exclamation mark allowed in regular UI copy. |
