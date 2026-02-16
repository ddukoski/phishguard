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

### Database & Environment Setup

The project uses MongoDB via Docker.

#### 1. Start MongoDB with Docker

```bash
docker run -d \
  --name phishguard-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=example \
  mongo:8
```

or just start the whole compose with:
```bash
docker compose up -d
```

#### 2. PHP MongoDB extension

Make sure the PHP MongoDB extension is installed:

```bash
# Install via PECL
sudo pecl install mongodb

# Enable the extension in your active php.ini
echo 'extension="mongodb.so"' >> $(php -r "echo php_ini_loaded_file();")
```
#### 3. DB credentials

The default credentials are pre-configured in `.env.example` and match the Docker Compose setup. After copying the `.env` file, no changes are needed for local development.

<details>
<summary>Possible macOS troubleshooting</summary>

```bash
# Remove the quarantine attribute
sudo xattr -d com.apple.quarantine $(php-config --extension-dir)/mongodb.so

# Re-sign the binary locally
codesign --force --sign - $(php-config --extension-dir)/mongodb.so
```
</details>

#### 3. Configure environment

```bash
cp api/.env.example api/.env
php artisan key:generate
```

The default MongoDB settings are already configured:
```dotenv
MONGODB_URI=mongodb://root:example@127.0.0.1:27017/?authSource=admin
MONGODB_DATABASE=phishguard
```

> **Note:** If you have a local MongoDB installed (e.g., via Homebrew for macOS), stop it first:
> ```bash
> brew services stop mongodb-community
> ```

#### 4. Run migrations & seed

```bash
cd api
php artisan migrate --seed
```

This creates all collections and seeds the database with test data.

#### 5. Verify connection

```bash
php artisan tinker --execute="DB::connection('mongodb')->command(['ping' => 1])"
# Should return: MongoDB\Driver\Cursor
```

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