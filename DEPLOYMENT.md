# Deployment Guide (Ubuntu VPS)

This document outlines the steps to deploy the JK Computer Hardware site to a production
Ubuntu VPS.

## 0. Architecture — this is THREE services, not one

The project was split into three independent Next.js apps that all share one PostgreSQL
database:

| Service | Folder | Port | What it is |
|---|---|---|---|
| Public site | `user-interface/` | 3000 | The storefront customers browse (reads the DB directly via Prisma for SSR pages, but a few client widgets — search, contact form, comments — call `/api/...` on their own origin) |
| Admin panel | `admin-interface/` | 3001 | The `/admin` dashboard. Has **no API routes of its own** — every `fetch('/api/admin/...')` call from its pages needs to be forwarded to backend-api |
| Backend API | `backend-api/` | 3002 | The only service with real API route handlers (`/api/...`, `/api/admin/...`) and the only place uploaded product images are physically written (`backend-api/public/uploads/products/`) |

**This is exactly what "PM2 won't work well, put a proxy in front" means.** PM2 just keeps
three separate Node processes alive on three separate ports — it does nothing to stitch them
together. Without Nginx routing `/api/*` and `/uploads/*` on each domain over to backend-api,
the admin panel's login/CRUD calls and the storefront's product images will 404, because
user-interface and admin-interface don't implement those routes or store those files
themselves.

You'll end up with two public domains pointing at the same server:
- `yourdomain.com` → user-interface, with `/api/*` and `/uploads/*` proxied to backend-api
- `admin.yourdomain.com` → admin-interface, with `/api/*` and `/uploads/*` proxied to backend-api

## Prerequisites

1.  An Ubuntu Server (20.04 or 22.04 recommended).
2.  A domain name, with an **A record for the root domain and one for an `admin` subdomain**,
    both pointing at the server's public IP (e.g. `yourdomain.com` and `admin.yourdomain.com`).
3.  PostgreSQL installed on the server (or accessible remotely).
4.  Node.js (v20+) and npm installed on the server.

## 1. System Setup

```bash
sudo apt update && sudo apt upgrade -y

# Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# PM2 and Nginx
sudo npm install -g pm2
sudo apt install nginx -y
```

## 2. Database Setup

One database, shared by all three services:

```bash
sudo -u postgres psql

CREATE DATABASE jk_hardware;
CREATE USER jk_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE jk_hardware TO jk_user;
\q
```

## 3. Clone and Install

Clone once, then install dependencies **separately in each of the three app folders** — they
each have their own `package.json` and `node_modules`:

```bash
cd /var/www
# git clone <your-repo-url> jk-computer-hardware
cd jk-computer-hardware

cd backend-api && npm ci && cd ..
cd admin-interface && npm ci && cd ..
cd user-interface && npm ci && cd ..
```

## 4. Environment Configuration

Create a `.env` file in **each** of `backend-api/`, `admin-interface/`, and `user-interface/`
(based on each folder's `.env.example`).

**`DATABASE_URL`, `JWT_SECRET`, `JWT_ISSUER`, and `JWT_AUDIENCE` must be identical across all
three `.env` files.** Login happens via backend-api, but admin-interface's own middleware
independently verifies that JWT with its own copy of the secret — if the secrets don't match,
every admin login will look invalid.

```env
# Database — same value in all three .env files
DATABASE_URL="postgresql://jk_user:your_secure_password@localhost:5432/jk_hardware?schema=public"

# JWT — same value in all three .env files (generate once, reuse everywhere)
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your_very_long_random_secure_string_here"
JWT_ISSUER="jk-computers"
JWT_AUDIENCE="jk-admin"
ADMIN_ACCESS_TOKEN_EXPIRY="20m"
ADMIN_REFRESH_TOKEN_EXPIRY="7d"

UPLOAD_MAX_SIZE_MB="5"

# NEXT_PUBLIC_SITE_URL — different per app, its own public domain:
# backend-api/.env      -> NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
# admin-interface/.env  -> NEXT_PUBLIC_SITE_URL="https://admin.yourdomain.com"
# user-interface/.env   -> NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

## 5. Database Schema & Seeding

This project has no Prisma migration history (`prisma/migrations` doesn't exist — schema
changes have always been applied with `db push`), so `prisma migrate deploy` will not create
any tables. Use `db push` instead. **Run this once**, from any one of the app folders (they
all point at the same database):

```bash
cd backend-api
npx prisma generate
npx prisma db push
npx prisma db seed
cd ..
```

Then generate the Prisma Client in the other two folders too (they each need their own copy
in `node_modules`, but do **not** re-run `db push`/`db seed` — that would just be a harmless
no-op against tables that already exist, but there's no need):

```bash
cd admin-interface && npx prisma generate && cd ..
cd user-interface && npx prisma generate && cd ..
```

*Note: The default admin credentials from the seed file are `admin` / `admin123`. Change
this immediately after logging in (Admin → Settings → Change Password).*

**Uploaded product images are not in git** (`backend-api/public/uploads/` is gitignored on
purpose). If you're migrating an existing site rather than starting fresh, copy that folder to
the server:

```bash
rsync -avz backend-api/public/uploads/ user@yourserver:/var/www/jk-computer-hardware/backend-api/public/uploads/
```

Skipping this step means every product's photo will 404 even though the database rows
reference them correctly.

## 6. Build All Three Apps

```bash
cd backend-api && npm run build && cd ..
cd admin-interface && npm run build && cd ..
cd user-interface && npm run build && cd ..
```

## 7. Start All Three with PM2

Each app already has its own `ecosystem.config.js` with the right name/port baked in
(`jk-backend-api` on 3002, `jk-admin-interface` on 3001, `jk-user-interface` on 3000):

```bash
cd backend-api && pm2 start ecosystem.config.js && cd ..
cd admin-interface && pm2 start ecosystem.config.js && cd ..
cd user-interface && pm2 start ecosystem.config.js && cd ..

pm2 save
pm2 startup
```

## 8. Configure Nginx (Reverse Proxy)

This is the step that makes the three separate processes behave like one working site. Two
server blocks — one per domain — each proxying `/api/` and `/uploads/` to backend-api, and
everything else to that domain's own frontend.

```bash
sudo nano /etc/nginx/sites-available/jk-hardware
```

```nginx
# ── Public storefront: yourdomain.com ──────────────────────────────────────
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Route API calls to backend-api, not user-interface (which has no /api routes)
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Product images physically live on backend-api's disk
    location /uploads/ {
        alias /var/www/jk-computer-hardware/backend-api/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ── Admin panel: admin.yourdomain.com ───────────────────────────────────────
server {
    listen 80;
    server_name admin.yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /var/www/jk-computer-hardware/backend-api/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/jk-hardware /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Secure with SSL (Certbot)

Certbot can secure both domains in one pass:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com
```

## 10. Backups

Back up both the database and the uploaded images (which only live under `backend-api/`):

```bash
# Database
pg_dump -U jk_user -d jk_hardware > jk_hardware_backup_$(date +%F).sql

# Uploads
tar -czvf uploads_backup_$(date +%F).tar.gz /var/www/jk-computer-hardware/backend-api/public/uploads/products/
```

Create a cron job to automate these backups and move them to secure external storage (like
AWS S3).

## Redeploying after changes

Since there are three services, a code update means repeating build + restart for whichever
app(s) changed:

```bash
cd backend-api && git pull && npm ci && npx prisma generate && npm run build && pm2 restart jk-backend-api && cd ..
# repeat for admin-interface / user-interface as needed, substituting their pm2 process name
```
