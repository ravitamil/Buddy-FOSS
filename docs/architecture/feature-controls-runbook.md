# BuddyIO Feature Controls Runbook

BuddyIO feature controls are managed from JSON and applied to the Supabase
`public.feature_controls` table. The mobile app reads that table at launch,
merges `all` platform rows with the current platform, and falls back to the
last valid cached config when the network is unavailable.

## Source Of Truth

- Runtime feature graph:
  `src/features/featureControls/matrix.ts`
- Status and key types:
  `src/features/featureControls/types.ts`
- Supabase table migration:
  `supabase/migrations/20260704000000_add_feature_controls.sql`
- JSON example:
  `supabase/feature-controls.example.json`
- JSON schema:
  `docs/feature-controls.schema.json`
- Admin apply script:
  `scripts/admin/apply-feature-controls.js`

The older `docs/competitive-intelligence/comprehensive-feature-analysis.md` file is product
and competitor analysis. It is not the runtime kill-switch map.

## Statuses

| Status        | Meaning                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `enabled`     | Feature is visible and write actions are allowed.                       |
| `hidden`      | Entry points are hidden and direct routes/actions are blocked.          |
| `read_only`   | Reads/navigation are allowed; write and background actions are blocked. |
| `maintenance` | Route is visible but blocked with maintenance UI.                       |
| `disabled`    | Feature/action is hard blocked.                                         |

Core shell features are intentionally not fully kill-switchable:
`auth`, `home`, and `settings` only allow `enabled`.

`analytics` is read-only/reporting. If `read_only` is configured for analytics,
the app treats it as `enabled`.

## JSON Format

Use this shape:

```json
{
  "$schema": "../docs/feature-controls.schema.json",
  "environment": "production",
  "platform": "all",
  "controls": [
    {
      "feature": "groups",
      "status": "enabled",
      "message": null,
      "actions": {
        "groups.create": "disabled",
        "groups.delete": "disabled"
      }
    }
  ]
}
```

Root `environment` and `platform` are defaults. A control can override either
field.

Supported platforms:

- `all`
- `android`
- `ios`

Use `all` for shared behavior. Add an `android` or `ios` row only when one
platform needs different behavior.

## Common Operations

Disable a whole feature:

```json
{
  "feature": "groups",
  "status": "disabled",
  "message": "Groups are temporarily unavailable.",
  "actions": {}
}
```

Hide a feature from navigation/cards:

```json
{
  "feature": "subscriptions",
  "status": "hidden",
  "message": null,
  "actions": {}
}
```

Make a domain read-only:

```json
{
  "feature": "transactions",
  "status": "read_only",
  "message": "Transaction editing is temporarily paused.",
  "actions": {}
}
```

Disable only risky actions:

```json
{
  "feature": "groups",
  "status": "enabled",
  "message": null,
  "actions": {
    "groups.create": "disabled",
    "groups.delete": "disabled",
    "groups.settle": "maintenance"
  }
}
```

Stop background subscription generation while keeping subscriptions visible:

```json
{
  "feature": "subscriptions",
  "status": "enabled",
  "message": null,
  "actions": {
    "subscriptions.autoGenerate": "disabled"
  }
}
```

Disable phone login while keeping Email, Google, and Anonymous login available:

```json
{
  "feature": "phoneAuth",
  "status": "disabled",
  "message": "Phone login is unavailable. Use Email, Google, or Anonymous login.",
  "actions": {}
}
```

## Apply Workflow

1. Copy the example file:

```powershell
Copy-Item supabase\feature-controls.example.json supabase\feature-controls.json
```

2. Edit `supabase\feature-controls.json`.

3. Validate the JSON without changing Supabase:

```powershell
cmd /c npm run feature-controls:apply -- --dry-run supabase/feature-controls.json
```

4. Set admin-only credentials in the terminal session:

```powershell
$env:SUPABASE_URL = "https://<project-ref>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<service-role-or-secret-key>"
```

Do not put service-role or secret keys in the mobile app, `.env.example`, or
committed JSON files.

5. Apply:

```powershell
cmd /c npm run feature-controls:apply -- supabase/feature-controls.json
```

The script upserts rows by:

- `environment`
- `platform`
- `feature_key`

## Validate The Built-In Example

```powershell
cmd /c npm run feature-controls:validate
```

This runs the apply script in `--dry-run` mode against
`supabase/feature-controls.example.json`.

## Runtime Merge Rules

The app fetches rows where:

- `environment` is `all` or the current app environment
- `platform` is `all` or the current native platform

Rows are resolved over bundled defaults. Platform-specific rows override `all`
platform rows for the same feature. Action overrides are scoped to the owning
feature and take precedence over the feature status unless the feature itself is
hard blocked.

Hard-blocked feature statuses:

- `hidden`
- `maintenance`
- `disabled`

When a feature is hard blocked, its actions are blocked even if an action
override says `enabled`.

## Feature Families

| Feature key     | Notes                                      |
| --------------- | ------------------------------------------ |
| `auth`          | Core shell; only `enabled`.                |
| `emailAuth`     | Email OTP login. Enabled by default.       |
| `phoneAuth`     | Phone OTP login. Disabled by default.      |
| `home`          | Core shell; only `enabled`.                |
| `settings`      | Core shell; only `enabled`.                |
| `trackers`      | Depends on loans, subscriptions, wallets.  |
| `transactions`  | Depends on categories.                     |
| `categories`    | Shared transaction taxonomy.               |
| `budgets`       | Depends on transactions and categories.    |
| `groups`        | Depends on transactions and notifications. |
| `loans`         | Depends on transactions and notifications. |
| `subscriptions` | Depends on transactions and notifications. |
| `wallets`       | Covers wallets, cards, net worth.          |
| `investments`   | Investments and portfolio flows.           |
| `savings`       | Savings and retirement flows.              |
| `analytics`     | Reporting feature; no write mode.          |
| `notifications` | Notification preferences and scheduling.   |
| `onboarding`    | Profile creation; depends on auth.         |
| `membership`    | Paywall and customer center.               |
| `backupSync`    | Backup/sync background behavior.           |
| `privacy`       | Privacy and security settings.             |
| `support`       | Help and support routes.                   |

## Safety Notes

- Prefer `hidden` for removing discovery entry points.
- Prefer `disabled` for risky or broken actions.
- Prefer action overrides when only one operation is unsafe.
- Keep the app shell usable; do not try to disable `auth`, `home`, or
  `settings`.
- After applying a config, restart or foreground the app and confirm the
  affected route/action behavior.
