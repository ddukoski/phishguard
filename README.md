# PhishGuard

## Project
---
### Project Description
*TODO*

### Project Structure

The project is structured so that there is one directory (`api`) that defines the backend APIs in Laravel, and the rest is React frontend, external to the `api` directory.

```bash
├── api                 # Laravel backend
├── eslint.config.js    # the rest below defines the React frontend
├── index.html
├── package-lock.json
├── package.json
├── public
├── src
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Quick start
---
Below are short steps to get the full stack running locally and keep the code clean.

### Cloning
First clone the repository with HTTPS:

```bash
git clone https://github.com/ddukoski/phishguard.git
```

or SSH:
```bash
git clone git@github.com:ddukoski/phishguard.git
```


### Prerequisites
- Node 18+ (Node 20 recommended)
- PHP 8.2+
- Composer

### Installation
```bash
# install frontend deps
npm ci

# install backend deps
composer install --working-dir=api

# install lefthook hooks (postinstall runs this automatically)
npx lefthook install
```

### Database & migrating

*TODO*

### Run locally
To start the frontend dev server, run:
```bash
npm run dev
```
To start the backend server (from project root `/`):
```bash
cd api
php artisan serve --host=127.0.0.1 --port=8000
```

### Linting & autoformat
- Frontend lint: `npm run lint`
- Auto-fix frontend: `npm run lint:fix`
- Backend (Pint):
```bash
composer --working-dir=api run-script lint
```

## CI & Hooks
---
We use [Lefthook](https://lefthook.dev/). The pre-push hook runs frontend lint + build and backend Pint as configured in [.lefthook.yml](.lefthook.yml).

To *temporarily* skip hooks: `git push --no-verify`.

There is also a basic [CI Workflow](.github/workflows/ci.yml) in place to check if the project is ready to run when pushing new code.