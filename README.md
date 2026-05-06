# Mini Family Office

Family Command Center MVP for household financial management.

## Product direction

This app is a **Mini Family Office** operating system, not a personal pre-filled dashboard. It should start empty:

- no hardcoded household names;
- no default family members;
- each member registers/logs in and maintains their own profile;
- a Family Admin manages household settings, invitations, permissions, integrations, and shared views.

## Phase 1 / 1.1 scope reflected in the mock UI

- Registration/login mock page for workspace creation and member login.
- Role model: Family Admin, Adult Member, Dependent/Child, Advisor Viewer.
- Permission matrix for household settings, member profiles, connected accounts, cash flow, and AI recommendations.
- Member profile maintenance fields: birth date, gender, family relationship, occupation, employer/school, start date, monthly compensation, personal fixed expenses, household contribution, annual one-time income and expenses.
- Expense category templates for subscriptions, commute, gas, utilities, internet, telecom, auto/home insurance, property tax, landscaper, etc.
- Bank/brokerage/tax data page covering aggregator/OAuth connections, CSV/OFX/QFX imports, and tax form imports.

## Security principle for financial institutions

Do not store bank usernames, passwords, or MFA codes in this application. For US banks, prefer Plaid/Finicity/Yodlee-style aggregator flows or official institution OAuth with read-only scopes. Manual CSV/OFX/QFX and tax form upload remain fallback paths.

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Deployment

Current public prototype may be hosted on Vercel, but the target deployment strategy should be reviewed against the broader family/finance operating-system architecture. Railway remains suitable when the product needs backend services, scheduled jobs, or agent workflows.
