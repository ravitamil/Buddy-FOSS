# Buddy Documentation Portal

Welcome to the Buddy documentation portal. This directory organizes the architecture, feature specifications, design system guidelines, domain audits, competitive intelligence, and database reports for the Buddy personal finance and expense-sharing mobile application.

---

## 🛠️ Stack & Technology Overview

- **Framework**: React Native 0.86.0 with Expo SDK 57 (managed workflow, New Architecture / Fabric enabled)
- **Language**: TypeScript 6.0 (strict mode)
- **UI Framework**: Tamagui v1.141 with custom design tokens, dark/light themes, and shorthand syntax
- **Design System**: Fluid Surface Design System (`ScreenContainer` + `GlassSurface`)
- **Navigation**: Expo Router v6 (`expo-router` ~57.0.2) with file-based routing in `app/`
- **Backend**: Supabase (PostgreSQL with Row Level Security, Auth, Storage) — secondary Firebase for Google Sign-In
- **State Management**: React Context API with domain-specific modular contexts; TanStack React Query v5 with MMKV-encrypted persistence
- **Lists**: `@shopify/flash-list` for high-performance virtualization
- **Monetization**: RevenueCat + Superwall

---

## 🤖 AI Agent & Design Contract Files

For AI agents and automated tools working on the project, configuration and instruction files are kept at the project root and in dedicated configuration directories:

- **[`AGENTS.md`](../AGENTS.md)**: Master guidance and commands for Codex and generic AI agents.
- **[`GEMINI.md`](../GEMINI.md)**: Fast Android build path, standards, and guidelines for Google Antigravity.
- **[`CLAUDE.md`](../CLAUDE.md)**: Stack definition, commands, and conventions for Claude Code.
- **[`DESIGN.md`](../DESIGN.md)**: OpenDesign brand contract defining the color ramps, surfaces, and visual identity.
- **[`.agents/skills/`](../.agents/skills/)**: Domain-specific agent skills (Fluid Surface, Clean Code, Tamagui, Supabase, RevenueCat).
- **[`.agent/rules/`](../.agent/rules/)**: AI development workflow rules and quality guardrails.

---

## 📚 Documentation Index

### 1. [Architecture & System Design](./architecture/)

Technical specifications, modular context architecture, feature flags, and UI inventory:

- **[Senior Principal Architect Analysis Report](./architecture/Senior_Principal_Architect_Analysis_Report.md)** — Architectural maturity scorecard, modularization, and roadmap.
- **[BuddyIO Technical Specifications](./architecture/BuddyIO_Technical_Specifications.md)** — Core data models, system boundaries, and API integrations.
- **[Context Architecture](./architecture/context-architecture.md)** — Layered React Context provider hierarchy and TanStack Query interaction model.
- **[Component Ownership Map](./architecture/component-ownership-map.md)** — Mapping of UI screen components to domain contexts and stores.
- **[Feature Controls & Killswitches Runbook](./architecture/feature-controls-runbook.md)** — Database-driven feature flags and maintenance screens.
- **[UI Consolidation Inventory](./architecture/ui-consolidation-inventory.md)** — Inventory of migrated Tamagui components and design tokens.
- **[Header Standardization Status](./architecture/header-standardization-status.md)** — `CustomNavigationHeader` adoption across screens.
- **[App Architecture Feature Integration Remediation Plan](./architecture/app-architecture-feature-integration-remediation-plan.md)** — Technical remediation steps.

### 2. [Design System & Theming](./design/)

Visual language, design tokens, color system, and theming standards:

- **[Fluid Surface Design System](./fluid-surface-design-system.md)** — The primary visual contract for semi-translucent elevated surfaces, edge highlights, blur layers, and surface ownership rules.
- **[Color System](./design/Color_System.md)** — Semantic color ramps, neutral backdrops, and contrast ratios.
- **[Brand Colors](./design/brand-colors.md)** — Imperial Coin Gold (`#F6C31A`), Royal Violet (`#7E57C2`), and obsidian tones.
- **[Theming Guidelines](./design/Theming_Guidelines.md)** — Light and dark mode implementation with `useTamaguiTheme`.

### 3. [Feature Documentation](./features/)

Domain-level functional documentation and user flow guides:

- **[Feature Catalog & Status](./features/README.md)** — Comprehensive catalog of all Buddy application features.
- **[Categories Feature](./features/Category_Feature_Documentation.md)** — Category taxonomy, color pickers, icon management, and persistence.
- **[Group Split Feature](./features/Group_Split_Feature_Documentation.md)** — Expense splitting, pairwise debt matrix, settlements, and member balances.

### 4. [Audits, Analysis & Modernization Plans](./audits/)

Historical audits, deep-dive analyses, and algorithmic improvements:

- **Groups & Settlement Audits ([`audits/groups/`](./audits/groups/))**:
  - [Group Split Expense Modernization Plan](./audits/groups/BuddyIO_Group_Split_Expense_Modernization_Plan.md)
  - [Group Expense Tracker Audit & Fix Plan](./audits/groups/Group_Expense_Tracker_Audit_and_Fix_Plan.md)
  - [Group Data Flow Analysis](./audits/groups/Group_Data_Flow_Analysis.md)
  - [Group Expense Logic Audit Report](./audits/groups/Group_Expense_Logic_Audit_Report.md)
  - [Group Expense Debt & Settlement Analysis](./audits/groups/group-expense-debt-settlement-analysis.md)
  - [Multi-Hop Debt Simplification Analysis](./audits/groups/group-expense-analysis-report.md)
  - [Overpayment Handling Critical Fix Documentation](./audits/groups/OVERPAYMENT_FIX_DOCUMENTATION.md)
  - [Comprehensive Confidence Assessment](./audits/groups/comprehensive-confidence-assessment.md)
  - [Group UI Audit](./audits/groups/GroupUI_Audit.md)
- **Budget Audits ([`audits/budget/`](./audits/budget/))**:
  - [Budget Setup Audit & Fix Plan](./audits/budget/Budget_Setup_Audit_and_Fix_Plan.md)
  - [Budget Architecture & Integration Analysis](./audits/budget/budget-architecture-and-integration-analysis.md)
  - [Budget Android Manual Walkthrough](./audits/budget/budget-android-manual-walkthrough.md)
- **Performance Optimizations ([`audits/performance/`](./audits/performance/))**:
  - [Performance Optimization Project Summary](./audits/performance/PERFORMANCE_OPTIMIZATION_SUMMARY.md)
  - [Debt Calculation Algorithm Technical Documentation](./audits/performance/PERFORMANCE_OPTIMIZATION_DOCUMENTATION.md)

### 5. [Business & Strategic Frameworks](./business/)

Executive reports, investment allocations, and strategic roadmaps:

- **[BuddyIO Executive Summary](./business/BuddyIO_Executive_Summary.md)** — Market opportunity, business thesis, and executive overview.
- **[Investment Plan & Budget Allocation](./business/BuddyIO_Investment_Plan.md)** — Financial modeling and resources.
- **[Master Strategic Report](./business/BuddyIO_Master_Strategic_Report.md)** — Comprehensive strategy synthesis.

### 6. [Competitive Intelligence](./competitive-intelligence/)

Competitor reverse-engineering, feature matrices, and benchmarking:

- **[Ultimate Competitive Intelligence Report](./competitive-intelligence/ultimate-competitive-intelligence-report.md)**
- **[Comprehensive Competitive Intelligence Report](./competitive-intelligence/comprehensive-competitive-intelligence-report.md)**
- **[Comprehensive Feature Analysis Matrix](./competitive-intelligence/comprehensive-feature-analysis.md)**
- **[Feature Comparison Matrix](./competitive-intelligence/feature-comparison-matrix.md)**
- **[Updated Feature Comparison Matrix](./competitive-intelligence/updated-feature-comparison-matrix.md)**
- **[App Store Analysis](./competitive-intelligence/app-store-analysis.md)**
- **[Emerging Competitors Analysis](./competitive-intelligence/emerging-competitors-analysis.md)**
- **Competitor Breakdowns**: [Splitwise](./competitive-intelligence/splitwise-research.md) | [Tricount](./competitive-intelligence/tricount-research.md) | [Settle Up](./competitive-intelligence/settle-up-research.md) | [IOU](./competitive-intelligence/iou-research.md) | [PaySplit](./competitive-intelligence/paysplit-research.md)

### 7. [Database & Security Findings](./database/)

Supabase database advisor reports, index optimization, and RLS audit findings:

- **[Supabase Performance Advisor Findings](./database/supabase-performance-advisor-findings.md)**
- **[Supabase Security Advisor Findings](./database/supabase-security-advisor-findings.md)**
- **Advisor Statements & CSV Exports**: Performance Statements, Security Lints, and Foreign Key Audits.
