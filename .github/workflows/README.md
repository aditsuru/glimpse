# GitHub Actions

## Required Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret                         | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `VERCEL_TOKEN`                 | From vercel.com/account/settings → Tokens        |
| `VERCEL_ORG_ID`                | From vercel.com/account/settings → Your ID       |
| `STAGING_VERCEL_PROJECT_ID`    | From the glimpse-staging Vercel project settings |
| `PRODUCTION_VERCEL_PROJECT_ID` | From the glimpse-prod Vercel project settings    |
| `DATABASE_URL_STAGING`         | Neon staging branch connection string            |
| `DATABASE_URL_PRODUCTION`      | Neon main branch connection string               |

## Workflows

| Workflow         | Trigger                   | What it does                                   |
| ---------------- | ------------------------- | ---------------------------------------------- |
| `ci.yml`         | PR to `staging` or `main` | Typecheck + lint                               |
| `staging.yml`    | Push to `staging`         | Migrate staging DB → deploy to glimpse-staging |
| `production.yml` | Push to `main`            | Migrate production DB → deploy to glimpse-prod |

## Notes

- Disable auto-deploy in both Vercel projects (Settings → Git) — deployments are handled entirely by these workflows.
- All other env vars (OAuth, Resend, QStash, R2, Better Auth) are set directly in each Vercel project's environment variables, not here.
