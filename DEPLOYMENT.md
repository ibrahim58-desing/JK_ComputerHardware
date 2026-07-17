# Deployment Guide (Ubuntu VPS)

This document outlines the steps to deploy the JK Computer Hardware Next.js application to a production Ubuntu VPS.

## Prerequisites

1.  An Ubuntu Server (20.04 or 22.04 recommended).
2.  A domain name pointing to the server's public IP address.
3.  PostgreSQL installed on the server (or accessible remotely).
4.  Node.js (v18+) and npm installed on the server.

## 1. System Setup

SSH into your server and install the necessary dependencies if you haven't already:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 and Nginx
sudo npm install -g pm2
sudo apt install nginx -y
```

## 2. Database Setup

Set up a PostgreSQL database and user for the application:

```bash
sudo -u postgres psql

# Inside psql prompt:
CREATE DATABASE jk_hardware;
CREATE USER jk_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE jk_hardware TO jk_user;
\q
```

## 3. Clone and Build the Application

Clone your repository to the server (e.g., in `/var/www/jk-computer-hardware`):

```bash
cd /var/www
# git clone <your-repo-url> jk-computer-hardware
cd jk-computer-hardware

# Install dependencies
npm ci
```

## 4. Environment Configuration

Create a `.env` file in the root of the project (`/var/www/jk-computer-hardware/.env`) based on `.env.example`:

```env
# Database connection string (replace with your actual credentials)
DATABASE_URL="postgresql://jk_user:your_secure_password@localhost:5432/jk_hardware?schema=public"

# Generate a strong random string for JWT_SECRET
# You can generate one via: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your_very_long_random_secure_string_here"

ADMIN_TOKEN_EXPIRY="24h"
UPLOAD_MAX_SIZE_MB="5"
```

## 5. Database Migration & Seeding

Apply the Prisma migrations to create the tables in your production database and seed it with the default admin user:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

*Note: The default admin credentials from the seed file are: `admin` / `password123`. Change this immediately after logging in.*

## 6. Build the Application

Build the Next.js application for production:

```bash
npm run build
```

## 7. Start the Application with PM2

Use PM2 to start the application and keep it running in the background:

```bash
# Start the app using the ecosystem.config.js
pm2 start ecosystem.config.js

# Save the PM2 list so it restarts on server reboot
pm2 save
pm2 startup
```

## 8. Configure Nginx (Reverse Proxy)

Configure Nginx to route traffic from port 80 (and 443 for SSL) to your Next.js application running on port 3000.

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/jk-hardware
```

Add the following configuration (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Pass real client IP to Next.js for rate limiting
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional: Serve uploads directly via Nginx for better performance
    location /uploads/ {
        alias /var/www/jk-computer-hardware/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
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

Use Let's Encrypt to secure your site with HTTPS:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 10. Backups

Ensure you regularly backup both your database and your uploaded images.

**Database Backup:**
```bash
pg_dump -U jk_user -d jk_hardware > jk_hardware_backup_$(date +%F).sql
```

**Uploads Backup:**
```bash
tar -czvf uploads_backup_$(date +%F).tar.gz /var/www/jk-computer-hardware/public/uploads/products/
```

Create a cron job to automate these backups and move them to secure external storage (like AWS S3).
