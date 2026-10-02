# Admin Scripts

This directory contains scripts for administrative tasks in BuddyIO.

## Manage Pro Membership

Use `manage-pro.js` to grant or revoke pro membership for users.

### Requirements

- Node.js
- `SUPABASE_SERVICE_ROLE_KEY` (Get this from Supabase Dashboard > Settings > API)

### Usage

**Granting Pro Membership by Email:**

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/admin/manage-pro.js --email user@example.com --status true
```

**Revoking Pro Membership by Email:**

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/admin/manage-pro.js --email user@example.com --status false
```

**Using Phone Number:**

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/admin/manage-pro.js --phone +1234567890 --status true
```

> [!NOTE]
> If `--status` is omitted, it defaults to `true`.
