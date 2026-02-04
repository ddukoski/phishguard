# PhishGuard

## Description

## Quick start

Short, practical steps to get the full stack running locally and keep the code clean.

Prereqs
- Node 18+ (Node 20 recommended)
- PHP 8.2+
- Composer
- Git

Install (one-liners)
```bash
# install frontend deps
npm ci

# install backend deps
composer install --working-dir=api

# install lefthook hooks (postinstall runs this automatically)
npx lefthook install
```

Run locally
- Frontend dev server:
```bash
npm run dev
```
- Backend (from project root):
```bash
cd api
php artisan serve --host=127.0.0.1 --port=8000
```

Linting & autoformat
- Frontend lint: `npm run lint`
- Auto-fix frontend: `npm run lint:fix`
- Backend (Pint):
```bash
composer --working-dir=api run-script lint
```

Pre-push hooks
We use Lefthook. The pre-push hook runs frontend lint + build and backend Pint as configured in [.lefthook.yml](.lefthook.yml).

To (temporarily) skip hooks: `git push --no-verify`.
