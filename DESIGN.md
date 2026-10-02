# Buddy Brand Design Contract (`DESIGN.md`)

_Established according to the [OpenDesign](https://github.com/nexu-io/open-design) specification & the Buddy Fluid Surface Design System._

---

## 1. Brand Identity & Aesthetic Philosophy

**Aesthetic Direction**: _Luxe Financial Fluid Surface_  
Buddy combines the calm, tactile precision of Swiss International design with warm imperial coin gold and deep obsidian tones derived directly from the application's logo assets. It eschews generic neon SaaS gradients in favor of refined, authentic physical metaphors: luminous metallic currency, champagne paper textures, and semi-translucent fluid glass.

### Core Visual Tenets:

1. **Coin Gold Heritage**: The primary brand color (`#F6C31A`) is extracted directly from the coin artwork in `assets/appLogo/coins-logo.png` (mean hue $46.8^\circ$, saturation $92.7\%$, lightness $62.4\%$).
2. **Royal Violet Counterpoint**: Sourced from `assets/appLogo/genric-logo.png` (`#7E57C2`, hue $262^\circ$), violet serves as the specialized secondary accent for **Savings Goals**, **Investments**, and wealth accumulation.
3. **Atmospheric Neutrality**: Warm Alabaster (`#FAF8F2`) in light mode and Smokey Fog Obsidian (`#100C08`) in dark mode provide calm, glare-free backdrops that allow elevated fluid cards to breathe.
4. **Fluid Surface System**: Semi-translucent elevated surfaces (`GlassSurface`) with environmental blur, subtle light-catching edge highlights ($0.12 - 0.38$ alpha), and opt-in semantic color washes.

---

## 2. Token Ramps

### 2.1 Brand Imperial Coin Gold (`$brand1` – `$brand12`)

Derived from the isometric coin luster in `coins-logo.png`.

| Token      | Hex Code  | HSL            | Intended Application                                         |
| ---------- | --------- | -------------- | ------------------------------------------------------------ |
| `$brand1`  | `#FFFDF5` | 48°, 100%, 98% | Subtle card highlight / light glow wash                      |
| `$brand2`  | `#FDF8E2` | 47°, 91%, 94%  | Soft surface tint / selected background                      |
| `$brand3`  | `#FAEDB8` | 47°, 89%, 85%  | Subtle badge fill / decorative border                        |
| `$brand4`  | `#F8E18C` | 47°, 91%, 76%  | Luminous coin highlight                                      |
| `$brand5`  | `#F6C31A` | 46°, 92%, 53%  | **Primary Brand Core (CTA Buttons, Active States)**          |
| `$brand6`  | `#F7C615` | 47°, 93%, 53%  | Primary Hover & Interactive Focus Ring                       |
| `$brand7`  | `#DFAD1E` | 45°, 76%, 50%  | Primary Pressed state / coin rim border                      |
| `$brand8`  | `#B88B12` | 44°, 82%, 40%  | Deep metallic coin outline                                   |
| `$brand9`  | `#996800` | 41°, 100%, 30% | **Accessible Brand Text/Icons on Light Surfaces (5.2:1 AA)** |
| `$brand10` | `#6E4900` | 40°, 100%, 22% | Deep amber header text                                       |
| `$brand11` | `#452D00` | 40°, 100%, 14% | Ultra-dark golden shadow                                     |
| `$brand12` | `#1A1303` | 43°, 70%, 6%   | **On-Primary Text (13.8:1 AAA contrast on #F6C31A)**         |

### 2.2 Secondary Royal Violet (`$purple1` – `$purple12` / Savings)

Derived from `genric-logo.png` (`#7E57C2`).

| Token       | Hex Code  | HSL            | Intended Application                                   |
| ----------- | --------- | -------------- | ------------------------------------------------------ |
| `$purple1`  | `#FAF7FD` | 266°, 60%, 98% | Light savings wash                                     |
| `$purple2`  | `#F3ECFB` | 265°, 65%, 95% | Savings card surface fill                              |
| `$purple3`  | `#E3D3F7` | 266°, 67%, 90% | Savings tracker track                                  |
| `$purple4`  | `#CCAFF0` | 266°, 68%, 81% | Inactive goal progress ring                            |
| `$purple5`  | `#A67BE6` | 265°, 67%, 69% | Dark theme savings foreground                          |
| `$purple6`  | `#7E57C2` | 262°, 47%, 55% | **Secondary Core (Savings Goal, Vaults, Investments)** |
| `$purple7`  | `#6C44B3` | 262°, 45%, 48% | Secondary Hover / Focus                                |
| `$purple8`  | `#583499` | 262°, 49%, 40% | Secondary Pressed state                                |
| `$purple9`  | `#46277D` | 261°, 52%, 32% | Accessible savings label on light surfaces (7.2:1 AAA) |
| `$purple10` | `#331B5E` | 261°, 55%, 24% | Deep violet header                                     |
| `$purple11` | `#221042` | 261°, 61%, 16% | Dark mode surface accent                               |
| `$purple12` | `#120724` | 265°, 67%, 8%  | Obsidian violet base                                   |

### 2.3 Semantic Triad (Financial Cashflow)

| Semantic Role              | Light Theme (Foreground / Background)  | Dark Theme (Foreground / Background)    | Contrast Ratio                       |
| -------------------------- | -------------------------------------- | --------------------------------------- | ------------------------------------ |
| **Income (Cashflow In)**   | `#16A34A` / `rgba(22, 163, 74, 0.10)`  | `#4ADE80` / `rgba(74, 222, 128, 0.14)`  | 4.8:1 AA (Light) / 10.4:1 AAA (Dark) |
| **Expense (Outflows)**     | `#DC2626` / `rgba(220, 38, 38, 0.10)`  | `#F87171` / `rgba(248, 113, 113, 0.14)` | 4.9:1 AA (Light) / 8.2:1 AAA (Dark)  |
| **Savings (Goals/Vaults)** | `#7E57C2` / `rgba(126, 87, 194, 0.10)` | `#BFA5F5` / `rgba(191, 165, 245, 0.14)` | 5.6:1 AA (Light) / 9.8:1 AAA (Dark)  |
| **Warning (Due / Tax)**    | `#D97706` / `rgba(217, 119, 6, 0.10)`  | `#FBBF24` / `rgba(251, 191, 36, 0.14)`  | 4.6:1 AA (Light) / 11.5:1 AAA (Dark) |
| **Info (Sync / Transfer)** | `#2563EB` / `rgba(37, 99, 235, 0.10)`  | `#60A5FA` / `rgba(96, 165, 250, 0.14)`  | 5.1:1 AA (Light) / 8.6:1 AAA (Dark)  |

---

## 3. Surface & Elevation Systems

### 3.1 Light Theme (`#FAF8F2` Warm Alabaster)

- **Atmosphere Background**: `#FAF8F2` (warm ivory cashmere)
- **Card Surface**: `#FFFFFF` with `rgba(40, 37, 31, 0.06)` border
- **Elevated Fluid Surface (`GlassSurface`)**:
  - `start`: `rgba(255, 255, 255, 0.85)`
  - `end`: `rgba(244, 239, 226, 0.55)`
  - `fill`: `rgba(248, 245, 237, 0.65)`
  - `border`: `rgba(0, 0, 0, 0.12)`
- **Typography**:
  - Primary Text: `#1C1914` (14.2:1 AAA)
  - Secondary Text: `#666157` (5.8:1 AA)
  - Disabled Text: `#969084` (3.2:1)

### 3.2 Dark Theme (`#100C08` Smokey Fog Obsidian)

- **Atmosphere Background**: `#100C08` (rich OLED warm black)
- **Card Surface**: `#1B1713` with `rgba(255, 255, 255, 0.10)` border
- **Elevated Fluid Surface (`GlassSurface`)**:
  - `start`: `rgba(255, 255, 255, 0.075)`
  - `end`: `rgba(255, 255, 255, 0.018)`
  - `fill`: `rgba(255, 255, 255, 0.012)`
  - `border`: `rgba(255, 255, 255, 0.38)` (crisp light-catching edge)
- **Typography**:
  - Primary Text: `#F7F4EC` (16.2:1 AAA)
  - Secondary Text: `#ABA394` (7.6:1 AAA)
  - Disabled Text: `#756D60` (3.4:1)

---

## 4. Spacing, Radii & Touch Ergonomics

- **Base Spacing Grid**: 4pt / 8pt / 12pt / 16pt / 24pt / 32pt / 40pt
- **Border Radii**:
  - Controls & Buttons: `10pt` (`$control`)
  - Elevated Cards: `16pt – 20pt` (`$card`, mandatory for Fluid Surface)
  - Bottom Sheets & Modals: `24pt` (`$modal`)
  - Pills & Avatars: `999pt` (`$pill`)
- **Touch Ergonomics**: Minimum **48pt x 48pt** for all interactive targets on iOS and Android.
