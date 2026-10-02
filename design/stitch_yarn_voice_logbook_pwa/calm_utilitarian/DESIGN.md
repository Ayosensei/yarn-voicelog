---
name: Calm Utilitarian
colors:
  surface: '#FFFFFF'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#464555'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#3a2cc1'
  on-tertiary: '#ffffff'
  tertiary-container: '#534ada'
  on-tertiary-container: '#dbd8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#e3dfff'
  tertiary-fixed-dim: '#c3c0ff'
  on-tertiary-fixed: '#100069'
  on-tertiary-fixed-variant: '#372abf'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  surface-muted: '#F3F4F6'
  border: '#E5E7EB'
  border-strong: '#D1D5DB'
  ink-900: '#111827'
  ink-600: '#6B7280'
  ink-400: '#9CA3AF'
  accent-50: '#EEF2FF'
  accent-100: '#E0E7FF'
  accent-200: '#C7D2FE'
  accent-600: '#4F46E5'
  accent-700: '#4338CA'
  success: '#15803D'
  success-bg: '#F0FDF4'
  success-border: '#BBF7D0'
  warning: '#92400E'
  warning-bg: '#FEF3C7'
  warning-border: '#FDE68A'
  danger: '#DC2626'
  danger-bg: '#FEF2F2'
  danger-border: '#FECACA'
typography:
  display:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  hero:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  title:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  heading:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  subheading:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  reading:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: '0'
  small:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  small-medium:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
  caption:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  caption-medium:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  overline:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.25rem
  space-2xl: 1.5rem
  space-3xl: 2rem
  touch-min: 3rem
---

## Brand & Style

The design system is engineered for Nigerian tertiary students documenting daily industrial attachment activities under the Students Industrial Work Experience Scheme (SIWES). These users interact with the interface after demanding physical work shifts, often on low-power mobile devices under constrained network bandwidth and variable sunlight.

The brand personality is calm, utilitarian, and dependable:
- **Calm & Focused**: Strips away visual clutter, decorative gradients, stock illustrations, and emojis. The interface delivers quiet confidence and zero distraction.
- **Empathetic & Reassuring**: Never punishes transient network drops or device interruptions. Draft entries, voice transcripts, and incomplete data are preserved locally and highlighted clearly.
- **Voice-First & Direct**: Prioritizes rapid audio capture, crisp transcription confirmation, and fast structured log compilation over secondary configuration options.

The design movement is **Clean Minimal Utility**—combining crisp structural borders (`#E5E7EB` / `#D1D5DB`), flat white surfaces against an off-white background (`#FAFAFA`), high-contrast ink hierarchy, and an intentional single-accent indigo palette (`#4F46E5`). Interactive feedback is communicated through subtle tints, pill elements, and structured 1px bounding lines rather than heavy drop shadows or skeuomorphic embellishments.

## Colors

The system operates strictly in light mode. Every surface role serves a structural or informational purpose, eliminating purely decorative color splashes.

### Application Roles
- **Background & Canvas (`#FAFAFA`)**: The global page background creates an unadorned baseline with low glare.
- **Surfaces (`#FFFFFF`, `#F3F4F6`)**: Card surfaces, modal bodies, and form inputs sit on `#FFFFFF`. Muted surfaces (`#F3F4F6`) provide recessed container backing for segmented switch tracks, disabled controls, and skeleton shimmers.
- **Brand Accent (`#4F46E5`, `#4338CA`)**: Indigo `#4F46E5` serves as the primary actionable anchor—mic capture triggers, primary actions, selected indicators, and form focus boundaries. `#4338CA` serves hover and active press states.
- **Subtle Accent Tints (`#EEF2FF`, `#E0E7FF`, `#C7D2FE`)**: Used exclusively for selected chip containers, waveform tracks, and informational banners.
- **Ink Tiers (`#111827`, `#6B7280`, `#9CA3AF`)**:
  - `ink-900` (`#111827`): Body text, titles, headings, and active button typography.
  - `ink-600` (`#6B7280`): Secondary descriptions, unselected controls, helper text, and interim voice transcription states.
  - `ink-400` (`#9CA3AF`): Placeholders and deactivated icon states. Never used for essential content.
- **Semantic Feedback Statuses**:
  - **Success (`#15803D` / `#F0FDF4` / `#BBF7D0`)**: Saved confirmations, verified attendance days, and sync milestones.
  - **Warning (`#92400E` / `#FEF3C7` / `#FDE68A`)**: Draft notices and interactive `[placeholder]` tokens requiring user completion.
  - **Danger (`#DC2626` / `#FEF2F2` / `#FECACA`)**: Live recording indicators, network failure notes, and destructive triggers.

## Typography

The type scale uses **Montserrat** across all headings, body text, and UI controls.

### Implementation Rules
- **Casing Strategy**: Sentence case is strictly applied across headers, controls, and body text. Full uppercase capitalization is exclusively reserved for the `overline` style (e.g., category stamps, "LIVE TRANSCRIPT", date grouping keys).
- **Numeric Tabular Figures**: Timers, word counts, and dates enforce `font-variant-numeric: tabular-nums` (or `font-feature-settings: "tnum"`) to eliminate jitter during active live speech capture.
- **Reading Measure**: The `reading` role is tuned for SIWES daily work log narratives with an expanded line height (`26px`) capped at ~60 characters per line for high legibility on mobile viewports.
- **Scale Stability**: The type hierarchy remains fixed across mobile, tablet, and desktop breakpoints to maintain familiarity and uniform documentation density.

## Layout & Spacing

The spatial model operates on a strict 4px base increment (`0.25rem`), favoring focused single-column layouts over expansive multi-column dashboards.

### Breakpoint Structure & Layout Models
- **Mobile Viewport (<768px)**:
  - Single column fluid container with `20px` (`1.25rem`) gutters.
  - Interactive controls satisfy a hard `48px` minimum touch target rule (`touch-min`).
  - Anchored by a `64px` bottom navigation bar that absorbs `env(safe-area-inset-bottom)`.
  - Floating and contextual actions are bound within a `64px` bottom sticky bar.
- **Tablet / Desktop Viewport (≥768px)**:
  - Fixed centered single column layout with a strict container cap of `640px` (landing pages cap at `480px`; dialogs cap at `420px`).
  - Outer page gutters expand to `32px` (`2rem`).
  - Bottom mobile navigation lifts to a compact `56px` top header containing plain text links and active indicator underlines.
  - Sticky bottom action bars convert to inline elements positioned at the base of primary cards.

### Internal Spacing Rhythm
- **Component Padding**: `space-sm` (8px) separates form labels from fields and icons from labels. `space-md` (12px) structures note boxes and notification surfaces. `space-lg` (16px) is standard for card inner bounds and dense lists.
- **Section & Group Separation**: `space-xl` (20px) creates rhythm between inner entry segments, while `space-2xl` (24px) separates card blocks and list categories.

## Elevation & Depth

Visual separation relies on clean borders (`#E5E7EB` / `#D1D5DB`) paired with low-opacity ambient shadows. Heavy shadows, 3D skeuomorphism, and performance-degrading backdrop blur effects (`backdrop-filter`) are excluded to preserve smooth 60fps rendering on low-spec mobile hardware.

### Depth Hierarchy
1. **Level 0 (Flat / Inline)**:
   - *Elevation*: `none`.
   - *Application*: Standard table rows, inputs, text areas, and empty containers. Outlined using a `1px` stroke of `var(--border)` or `var(--border-strong)`.
2. **Level 1 (Card & Content Blocks)**:
   - *Elevation*: `0 1px 2px rgba(16, 24, 40, 0.05)`.
   - *Application*: Standard work log cards, entry summaries, and weekly status modules. Always paired with a `1px solid var(--border)` boundary.
3. **Level 2 (Sticky & Floating Controls)**:
   - *Elevation*: `0 4px 12px rgba(16, 24, 40, 0.08)`.
   - *Application*: Upward-facing sticky bottom action bars, floating recording action buttons, and contextual filter popovers.
4. **Level 3 (Modal Overlays & Drawers)**:
   - *Elevation*: `0 12px 32px rgba(16, 24, 40, 0.12)`.
   - *Application*: Mobile bottom sheets and centered desktop confirmation dialogs. Rendered over an explicit solid modal scrim (`rgba(17, 24, 39, 0.4)`).

## Shapes

The interface blends structured geometric rectangles for information containers with fully pill-shaped geometries for tactile interactions.

### Shape Language & Scale
- **Small Corners (`8px`)**: Applied to checkboxes, code blocks, technical chips, and draft placeholder tokens (`[placeholder]`).
- **Medium Corners (`12px`)**: Applied to text input fields, textareas, note callout boxes, and toast banners.
- **Large Corners (`16px`)**: Applied to standard content cards, log entries, and the inner blocks of bottom sheets.
- **Extra-Large Corners (`24px`)**: Applied to desktop dialog containers and the top-left/top-right corners of mobile bottom sheets.
- **Pill / Fully Rounded (`9999px`)**: All primary, secondary, and ghost buttons; filter chips; status badges; toggles; audio waveform bars; and the central voice recording mic button (`112px`).

## Components

### Buttons
- **Primary**: Background `#4F46E5`, text `#FFFFFF`, height `48px`, border-radius `9999px`, font weight `600`. Hover state `#4338CA`. Active press: `transform: scale(0.98)` over `120ms`.
- **Secondary**: Background `#FFFFFF`, border `1px solid #D1D5DB`, text `#111827`, height `48px`, border-radius `9999px`.
- **Voice Mic Button**: Fixed `112px × 112px` circle. Fill `#4F46E5` with centered 40px Lucide mic icon in white. While recording, two outer concentric rings scale from `1.0` to `1.35` while fading opacity from `0.16` to `0` over a `1.6s` cycle.

### Input Fields & Textareas
- **Default State**: Surface `#FFFFFF`, border `1px solid #D1D5DB`, border-radius `12px`, padding `12px 16px`, text `#111827`, placeholder text `#9CA3AF`.
- **Focus State**: Border color changes to `#4F46E5` with an outer outline ring: `3px solid rgba(79, 70, 229, 0.2)`.
- **Error State**: Border color `#DC2626`, accompanied by `#DC2626` validation error label below the input with a 4px gap.

### Cards & Log Containers
- Surface `#FFFFFF`, border `1px solid #E5E7EB`, shadow `0 1px 2px rgba(16, 24, 40, 0.05)`, border-radius `16px`, inner padding `20px`.
- Inter-section dividing borders inside cards use `1px solid #E5E7EB`.

### Chips & Badges
- **Status Pills**: Height `24px`, radius `9999px`, padding `2px 10px`, font size `12px`, font weight `600`.
  - *Saved*: Background `#F0FDF4`, border `1px solid #BBF7D0`, text `#15803D`.
  - *Draft*: Background `#FEF3C7`, border `1px solid #FDE68A`, text `#92400E`.
- **Filter Chips**: Height `36px`, radius `9999px`, padding `6px 14px`.
  - *Unselected*: Background `#FFFFFF`, border `1px solid #D1D5DB`, text `#111827`.
  - *Selected*: Background `#EEF2FF`, border `1px solid #C7D2FE`, text `#4338CA`.
- **Placeholder Tokens**: Inline bracketed cues (e.g., `[machine used]`) formatted with background `#FEF3C7`, text `#92400E`, radius `8px`, and horizontal padding `6px`.

### Lists & Selectable Export Rows
- Row height `64px`, border-bottom `1px solid #E5E7EB`, surface `#FFFFFF`.
- Selected row shifts background to `#EEF2FF`.

### Checkboxes & Segmented Controls
- **Checkboxes**: Sized `24px × 24px`, border-radius `8px`. Unchecked uses `1.5px solid #D1D5DB`. Checked uses fill `#4F46E5` with white checkmark.
- **Segmented Control**: Track height `48px`, background `#F3F4F6`, border-radius `9999px`, inner padding `4px`. Active segment uses background `#4F46E5`, text `#FFFFFF`, border-radius `9999px`.

### Iconography Rules
- System icons sourced strictly from Lucide Icons with a uniform `1.5px` stroke and round joins.
- Icon dimensions: `24px` for navigation and main triggers, `20px` for dense list rows, `16px` for status badges and inline indicators, and `40px` for the primary mic button icon.