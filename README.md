# Buddy — Community Edition

<div align="center">

**A 100% offline, de-googled, privacy-first personal finance and expense-sharing mobile app.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB.svg?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Privacy](https://img.shields.io/badge/Telemetry-Zero-success.svg)](#privacy--security)

</div>

---

## 🌟 Philosophy

Buddy Community Edition is built for people who want complete control over their financial records. Most modern budgeting apps force mandatory cloud logins, bundle aggressive tracking SDKs, lock core features behind expensive monthly subscriptions, and harvest behavioral analytics.

Buddy flips the script:

- **No Sign-In Required**: Boots straight into the full app from the very first frame.
- **100% Offline**: All ledgers, accounts, and calculations reside exclusively on your device.
- **De-Googled & Zero Telemetry**: Purged of all Google Play Services, Firebase dependencies, trackers, analytics, and proprietary monetization shims.
- **All Pro Features Free & Unlocked**: Multi-wallet tracking, recurring subscription managers, loan amortization calculators, debt snowball/avalanche planners, portfolio analytics, and group split math.
- **Complete Data Portability**: Export and import your entire financial state to clean, human-readable JSON files anytime.

---

## ✨ Features

### 💰 Personal Finance & Ledgers

- **Transactions & Categories**: Multi-currency income, expense, and transfer tracking with custom categorizations, emojis, and tags.
- **Multi-Wallet Support**: Cash, bank accounts, digital wallets, credit cards, and savings vaults with instant balance calculations.
- **Smart Budgets**: Flexible period budgets (weekly, monthly, custom), category spending caps, rollover amounts, and real-time visual progress bars.

### 📊 Advanced Trackers & Calculators

- **Loan Management**: Full loan amortization schedules, interest vs. principal tracking, early payment modeling, and payment history.
- **Debt Payoff Planner**: Snowball and Avalanche payoff strategy simulations.
- **Recurring Subscriptions**: Billing cycle tracking, renewal dates, auto-pay tags, and cost-per-month aggregations.
- **Savings Goals & Retirement**: Target date forecasting, milestone alerts, and retirement nest egg projections.
- **Investments & Portfolios**: Track stocks, ETFs, mutual funds, crypto, and calculate overall portfolio return percentages.

### 👥 Group Expense Splitting

- **Group Shared Ledgers**: Split trip costs, room expenses, and dinner bills among friends and roommates with equal or custom percentage splits.
- **Smart Settlement Math**: Computes the minimum number of transactions needed to settle all debts across members.

### 🛡️ Privacy & Backup

- **On-Device Storage**: High-performance persistence backed by encrypted MMKV storage.
- **Data Export & Import**: Generate full portable JSON backups with a single tap to store on your personal backup drive or cloud vault.

---

## 🛠️ Technology Stack

- **Framework**: [React Native 0.86](https://reactnative.dev/) with [Expo SDK 57](https://expo.dev/) (New Architecture / Fabric enabled)
- **Language**: TypeScript 6.0 in strict mode
- **UI & Styling**: [Tamagui v2](https://tamagui.dev/) with Fluid Surface semi-translucent design system
- **State & Caching**: TanStack React Query v5 with MMKV persistence
- **Performance Lists**: `@shopify/flash-list` for smooth 60fps rendering
- **Routing**: Expo Router v6 file-based navigation

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- [pnpm](https://pnpm.io/) package manager
- Android Studio with Android SDK (for native Android builds)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/buddy.git
   cd buddy
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Type-check the code:

   ```bash
   npx tsc --noEmit
   ```

4. Run the test suite:
   ```bash
   npm test
   ```

### Running Locally

```bash
# Start the Expo development server
npx expo start --dev-client
```

### Building the Android APK (Local Debug)

To compile a local debug build for your connected Android device:

```powershell
cd android
.\gradlew.bat app:assembleDebug -PreactNativeArchitectures=arm64-v8a
```

The compiled APK will be generated at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔒 Privacy Guarantee

Buddy Community Edition does not contain:

- ❌ Firebase Analytics or Google Play Services
- ❌ Crashlytics, Sentry, or remote error reporting endpoints
- ❌ RevenueCat, Superwall, or in-app purchase SDKs
- ❌ Advertising frameworks or tracking beacons
- ❌ External network requests during normal ledger operations

Every byte of financial data is stored locally on your device.

---

## 📄 License

Buddy Community Edition is free software licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See the [LICENSE](LICENSE) file for details.
