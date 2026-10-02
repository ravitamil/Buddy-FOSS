---
name: open-design
description: >-
  Use this skill when designing, prototyping, or generating UI interfaces,
  mobile screens, dashboards, presentation decks, or establishing brand
  design systems (DESIGN.md) following OpenDesign (nexu-io/open-design)
  standards and workflows.
---

# OpenDesign: Agent-Native Design Engine & Prototyping

OpenDesign ([nexu-io/open-design](https://github.com/nexu-io/open-design)) is an open-source, local-first design system and prototyping engine that turns AI coding agents into comprehensive design studios. It delivers production-grade single-page artifacts, decks, interactive dashboards, and design system specifications (`DESIGN.md`).

---

## 1. Core Principles & Philosophy

1. **Agent-Native & Local-First**: Work is authored in real files (HTML, CSS, React components, Markdown) that live on the local filesystem rather than behind closed cloud canvases.
2. **`DESIGN.md` as Brand Contract**: Every interface references an explicit design contract defining typography, color palettes, spacing rhythm, and component constraints.
3. **No Generic AI Slop**:
   - Avoid interchangeable SaaS templates, over-rounded floating cards, generic purple/cyan neon gradients, and meaningless decorative blobs.
   - Commit to a distinct, intentional aesthetic direction (e.g. dense operational, brutalist, Swiss International, warm editorial, minimalist luxury, or utility-first).
4. **Honest, Realistic Content**: No `Lorem Ipsum` or placeholder text. Use realistic domain data, explicit empty/error states, and practical controls.

---

## 2. Supported Artifact Types

| Artifact Type      | Format                    | Output & Use Case                                                                      |
| :----------------- | :------------------------ | :------------------------------------------------------------------------------------- |
| **Prototypes**     | HTML / CSS / React Native | Web, desktop, and mobile interface flows with working layout, states, and transitions. |
| **Dashboards**     | HTML / JS / Tamagui       | KPI walls, decision rooms, financial overviews with live tweaks/filtering.             |
| **Decks & Slides** | HTML / PPTX / PDF         | Magazine-style presentations, investor pitches, quarterly reviews with grid anchors.   |
| **Documents**      | Multi-page HTML / PDF     | Polished specifications, brand guidelines, release notes, and editorial docs.          |
| **HyperFrames**    | HTML + CSS + GSAP         | Code-driven motion graphics, animated UI reveals, and product sizzle reels.            |

---

## 3. Workflow

### Step 1: Discover the Brief & Constraints

- Clarify target platform (e.g. React Native / Tamagui for Buddy, or standalone web/HTML).
- Identify target audience, density requirements, and emotional tone.
- Check for existing design contracts:
  - In Buddy: `docs/fluid-surface-design-system.md`, `tamagui.config.ts`, `ScreenContainer`, and `GlassSurface`.
  - In generic projects: `DESIGN.md` or local tokens.

### Step 2: Establish the Design Direction (`DESIGN.md`)

If a `DESIGN.md` does not exist or needs refinement, define:

- **Palette**: Neutral surfaces, primary accents, secondary tones, semantic status colors (success, warning, destructive).
- **Typography Scale**: Display, heading, body, and caption sizes with specific line heights and letter spacing.
- **Rhythm & Grid**: 4pt/8pt spacing grids, consistent border radiuses (e.g. 16–20pt for elevated cards in Fluid Surface).
- **Depth & Materials**: Translucent surfaces, subtle light-catching edge highlights, depth hierarchy.

### Step 3: Author the Artifact

- Produce self-contained, valid, and responsive code.
- Implement real interactive states: hover, pressed, active, disabled, focus, loading, and error states.
- For React Native / Tamagui projects (like Buddy):
  - Compose `ScreenContainer` for background and blur ownership.
  - Compose `GlassSurface` for elevated translucent card layers.
  - Use Tamagui primitives (`YStack`, `XStack`, `Text`, `Button`, `Input`) and design tokens (`$space`, `$size`, `$color`).

### Step 4: Critique & Polish

Run a self-critique pass against OpenDesign craft standards:

- [ ] Responsive across target viewports (mobile, tablet, desktop).
- [ ] Proper text hierarchy — labels and values clearly distinguishable.
- [ ] High contrast and accessible touch targets (minimum 44x44pt).
- [ ] No visual collision or text overflowing containers.
- [ ] Consistent iconography and purposeful motion.

---

## 4. OpenDesign CLI & MCP Integration

If the OpenDesign desktop daemon is installed:

- Run `od` daemon locally (`od start` or run via desktop app).
- Register MCP in Antigravity: `od mcp install antigravity`.
- Studio live preview will synchronize changes over stdio MCP (`http://127.0.0.1:7456`).
