# BuddyIO Fluid Surface Design System

## Visual identity

BuddyIO uses **semi-translucent Fluid Surface** design language over calm, warm-neutral screen backgrounds. It is
not a generic frosted-glass treatment and it is not a reason to blur every container. The effect
communicates depth through environmental blur, a restrained translucent tint, a light-catching
edge, and soft elevation while allowing the underlying screen atmosphere to remain visible.

The visual hierarchy is:

1. `ScreenContainer` owns the edge-to-edge background, dotted atmosphere, safe-area treatment,
   and native blur target.
2. Solid theme surfaces hold dense or highly legible content where translucency adds no value.
3. Shared Fluid Surface layers hold elevated, floating, or visually grouped card content.
4. Modal and navigation chrome may use specialized Fluid Surface compositions when their shape or
   animated mask cannot be represented by `GlassSurface`.

## Adopted card direction

As of 2026-08-17, BuddyIO will gradually converge on the brighter, curved, outlined Fluid Surface
design established on Home and adopted by the main Settings screen. This is the target visual for
app cards, including summaries, navigation cards, and repeatable records. Density, layout, and
content hierarchy may differ by feature, but they should no longer create separate glass recipes.

`GlassSurface` is the canonical shared implementation of this visual. It promotes the treatment
that originated on Home into an app-generic UI-layer API. All ordinary elevated cards compose this
surface instead of copying its blur, tint, edge, or wash recipe.

### Target visual contract

- Use a generous 16–20 point radius, a clear light-catching edge, clipped content, environmental
  blur, and a restrained theme-aware translucent fill. In dark mode, the neutral body must remain
  visibly transparent rather than compositing into a grey card.
- The environmental blur must read as a smooth atmosphere, not a grain or stipple texture. On
  Android, use the canonical smooth translucent fallback when the native renderer introduces a
  visible noise texture; do not preserve blur at the expense of the Fluid Surface finish.
- Neutral surface is the default. **Colour wash is opt-in**, not part of every card.
- Add a wash only when the full card has a clear semantic role, such as income, expense, account
  tier, warning, success, or another documented state.
- A wash fills the complete rounded inner surface. It must not appear as a smaller square around
  content or an icon.
- Coloured icon containers and watermark icons remain separate layers; their colour does not
  imply that the card itself needs a wash.
- Repeated rows keep their content compact and scannable, but use the same target surface anatomy.

Current wash decisions:

- Home financial metrics use their semantic income, expense, or savings wash.
- The Settings profile card uses brand for Free/Guest and warning-gold for Pro.
- Settings Quick Settings and navigation cards use neutral surface with no wash.
- Manage Categories uses neutral overview, filter, and row surfaces. Only status messages use a
  semantic wash.
- New migrations default to no wash until a semantic reason is documented.

## Current implementation state

`GlassSurface` is the only ordinary elevated-card surface. The former app-local `GlassSurface`,
`GlassCard`, `GlassmorphismContainer`, and `GlassmorphismCard` APIs have been retired with no
compatibility exports. `GlassBackdrop` remains deliberately low-level for overlays and exceptional
shaped effects that need the screen blur target.

`GlassSurface` keeps the native blur as an internal background layer with a theme-matched
material tint, then applies only a translucent theme gradient above it.

- **iOS**: Uses native blur with material tint.
- **Android**: Uses Expo's smooth translucent fallback because the native Dimezis renderer can add a
  fine noise texture on physical devices. The platform fallback preserves the transparent tint,
  light-catching gradient, outline, semantic wash, and depth without turning cards grainy or opaque.

Forms should use Fluid Surface sparingly. Do not mount blur-backed cards behind ordinary text inputs,
segmented controls, or hidden option grids; reserve `GlassSurface` for a visible grouping or an
expanded, on-demand choice surface.

## Gradual migration policy

1. New card work should follow the target visual contract.
2. Migrate existing cards feature by feature when that feature is already being changed or when a
   dedicated visual-migration slice is approved.
3. Use `GlassSurface` as the single app-wide owner for the target blur, tint, edge, radius, and
   depth. Do not add feature-local variants of its recipe.
4. During each migration, preserve behavior, information density, accessibility labels, minimum
   48-point touch targets, loading states, and list performance.
5. Verify light and dark themes, long text, empty/loading/error states, and pressed/disabled states
   before calling a feature migrated.
6. Use focused tests, TypeScript, lint, formatting, and device screenshots for each slice. Avoid a
   big-bang replacement that makes visual regressions hard to isolate.
7. Remove the transitional recipe and compatibility paths only after all consumers have moved to
   the app-generic target surface.

### Migration status

| Area                                                    | Status                                               | Wash policy                                             |
| ------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Home summaries and action cards                         | Target design adopted                                | Semantic wash where documented                          |
| Main Settings cards                                     | Target design adopted                                | Profile only                                            |
| Manage Categories                                       | Target design adopted                                | Status messages only                                    |
| Create and Edit Category forms                          | Target design adopted                                | Neutral form groups; semantic protected-state wash only |
| Groups, transactions, subscriptions, loans, and savings | Package migration and Android compile proof complete | Neutral by default                                      |
| Secondary Settings, auth, membership, and feature cards | Package migration and Android compile proof complete | Neutral by default                                      |

## Canonical surface anatomy

Every target Fluid Surface card includes:

- blur sourced from the nearest `ScreenContainer` blur target;
- theme-aware translucent gradient tint;
- a subtle edge highlight or semantic accent edge;
- clipped content and consistent radii;
- soft, theme-aware depth rather than a heavy opaque shadow;
- readable foreground colors from Tamagui semantic tokens.

Only `GlassSurface` owns ordinary card chrome. Its public API is limited to generic layout,
test IDs, background adornment, and semantic `washColor`; consumers cannot supply intensity,
custom gradients, borders, tones, or shadows.

## Ownership rules

- `packages/buddy-ui` owns portable theme roles, spacing, radii, touch targets, typography, and
  semantic color foundations.
- `src/components/ui/ScreenContainer.tsx` owns the app background and blur source.
- `packages/buddy-ui/src/GlassSurface.tsx` owns the portable brighter outlined treatment and its
  opt-in semantic colour wash.
- `packages/buddy-ui/src/mobile/GlassBackdrop.tsx` owns low-level blur for overlays and custom-shaped
  compositions that cannot use the standard surface anatomy.
- `packages/buddy-ui/src/overlays` and progressive app navigation chrome may own specialized
  glass rendering required by native sheets, masks, or animated blur.
- Feature components own finance-specific layout and content, but must compose shared surfaces.

Do not recreate blur, opacity ramps, glass borders, or shadows inside a feature card. Do not use
raw light/dark RGBA branches when a theme role or shared Fluid Surface helper represents the same
decision. Features and screens never import `expo-blur` directly. A shape, mask, animation, or
overlay that cannot use the shared card surface composes `GlassBackdrop`. All ordinary card work
composes `GlassSurface`; later feature changes must preserve that contract instead of creating a
new recipe inside feature code.

## Interaction and accessibility

- Preserve at least 48 points for interactive controls on both platforms.
- Keep primary and secondary text at accessible contrast over the lightest and darkest surface
  states; increase tint opacity before weakening text contrast.
- Use semantic color for meaning and the emerald brand accent for identity or selection.
- Animate transform and opacity only for routine interactions. Blur intensity animation is
  reserved for navigation chrome and must remain UI-thread driven.
- Respect reduced-motion settings and never make state understandable only through animation.
- Application release teams should separately verify light and dark modes on their target devices. This consolidation is proven through static tests, package smoke tests, Android assembly, and macOS iOS-simulator CI.

## Screen composition

The normal screen path is `ScreenContainer` → optional `CustomNavigationHeader` →
`ScreenWrapper` → feature content. `ScreenContainer` appears once per screen. `ScreenWrapper`
remains transparent when nested inside it so descendant fluid surfaces can sample the intended
background instead of an accidental opaque layer.

## Review checklist

- Is the surface actually elevated or grouped enough to deserve Fluid Surface?
- Does it follow the canonical outlined `GlassSurface` contract?
- If it has a colour wash, is the full-card semantic reason documented?
- Are tint, border, text, and semantic colors theme-driven?
- Does the background remain visible without compromising readability?
- Are touch targets, safe areas, reduced motion, and both platform conventions preserved?
- Are theme contracts covered, and has the consuming application scheduled its platform-specific release validation?
