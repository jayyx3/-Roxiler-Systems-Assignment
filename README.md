# Store Rating Platform - Production Ready Monorepo

A complete, production-quality, responsive web application for rating and reviewing stores. Built with **Express.js (Node.js)**, **Prisma ORM with PostgreSQL**, and **React (Vite + Tailwind CSS v4)**.

This application implements role-based access control (RBAC) supporting three distinct user profiles:
1. **System Administrator:** Oversees platform statistics, user registration, and store assignments.
2. **Normal User:** Register, browse stores, search by name/address, and submit or update ratings inline.
3. **Store Owner:** View their store's overall performance, average rating, and a timeline of customers who rated them.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Schema & Constraints](#database-schema--constraints)
4. [Local Development Setup](#local-development-setup)
5. [GitHub Publishing Guide](#github-publishing-guide)
6. [Render Deployment Guide (Backend + PostgreSQL)](#render-deployment-guide-backend--postgresql)
7. [Vercel Deployment Guide (Frontend Client)](#vercel-deployment-guide-frontend-client)
8. [Demo Login Credentials](#demo-login-credentials)
9. [API Endpoints Summary](#api-endpoints-summary)
10. [Design & Engineering Decisions](#design--engineering-decisions)

---

## Tech Stack

*   **Backend:** Express.js (Node.js), structured in a clean, layered controller-router architecture.
*   **Database:** PostgreSQL. Integrated via Prisma ORM for type-safe database queries, migrations, and model relation mapping.
*   **Frontend:** ReactJS (bootstrapped with Vite for speed and build efficiency).
*   **Styling:** Tailwind CSS v4, utilizing a customized bright, colorful, clean, and friendly light aesthetic with soft gradient backgrounds, custom fonts (`Outfit`), and fluid hover indicators.
*   **Auth:** JWT-based stateless authentication (tokens passed via `Authorization: Bearer <token>` headers and stored client-side in LocalStorage).
*   **Security:** Configured with `Helmet` security headers, CORS resource sharing constraints, and request throttling via `express-rate-limit` on authentication endpoints.
*   **Form Validation:** Dual-enforced. Frontend handles real-time visual feedback (live password complexity checklists, character limits). Backend acts as the source of truth using `express-validator` rules.

---

## Project Structure

```text
/server
  /prisma
    schema.prisma  → Prisma database models, indexes, and constraints
  /src
    /config        → Database connection singleton (PrismaClient)
    /middlewares   → Authentication, role authorization, validation helpers, global error handler
    /routes        → API route routing paths (auth, admin, store, and owner)
    /seeders       → Database seed script populating system admin, stores, and ratings
    /utils         → Reusable express-validator rules
    app.js         → Main Express application middleware config
    server.js      → Backend HTTP listener entry point
  .env.example     → Template for backend environment variables
  package.json     → Server scripts and dependencies

/client
  /src
    /api           → Axios client configuration with request/response interceptors
    /components    → Reusable UI layouts (Navbar, ProtectedRoute, RatingStars)
    /context       → React AuthContext provider
    /pages
      /auth        → Login and Signup page components
      /admin       → Dashboard, UsersList, and StoresList administration views
      /shared      → Unauthorized (403) and UpdatePassword components
      /user        → Store browsing directory & interactive rating stars
      /storeOwner  → Owner rating stats panel & raters log
    /routes        → React Router mapping and role guard protection
    App.css
    App.jsx        → Client routing wrapper and Toaster setup
    index.css      → Tailwind CSS v4 core, animations, custom theme variables, and global buttons
    main.jsx       → React entry point
  .env.example     → Template for frontend environment variables
  package.json     → Client build scripts and dependencies

docker-compose.yml → PostgreSQL and Adminer developer setup
.gitignore         → Prevents node_modules, build folders, and sensitive environment keys from being tracked
```

---

## Database Schema & Constraints

Prisma handles relationships and mapping to PostgreSQL. The schema uses standard normalization, indexes, and constraint check protections.

### 1. Model Definitions

*   **`users` table:**
    *   `id`: UUID (Primary Key)
    *   `name`: `VarChar(60)` (Validated between 20–60 characters)
    *   `email`: `VarChar(255)` (Unique, validated format)
    *   `password`: `VarChar(255)` (Hashed using bcrypt)
    *   `address`: `VarChar(400)`
    *   `role`: Enum (`SYSTEM_ADMIN`, `NORMAL_USER`, `STORE_OWNER`)
*   **`stores` table:**
    *   `id`: UUID (Primary Key)
    *   `name`: `VarChar(60)`
    *   `email`: `VarChar(255)` (Unique)
    *   `address`: `VarChar(400)`
    *   `owner_id`: UUID (Foreign Key → `users.id`, references a user with role `STORE_OWNER`, nullable)
*   **`ratings` table:**
    *   `id`: UUID (Primary Key)
    *   `user_id`: UUID (Foreign Key → `users.id`, references normal user, cascades on delete)
    *   `store_id`: UUID (Foreign Key → `stores.id`, references store, cascades on delete)
    *   `rating`: `SmallInt` (Enforced between 1 and 5)
    *   *Constraint:* Unique combination index on `(user_id, store_id)`. If a user rates a store again, the database performs an **upsert** (updating the rating value) rather than inserting a duplicate row.

### 2. Indexes Defined
*   `users.email` (Unique Index)
*   `users.role` (Standard Index)
*   `stores.name` (Standard Index)
*   `stores.email` (Unique Index)
*   `ratings.store_id` (Standard Index)
*   `ratings.user_id` (Standard Index)
*   `ratings.user_id_store_id` (Unique Index)

---

## Local Development Setup

### 1. Database Initialization
Ensure PostgreSQL is running locally on port `5432` with a database named `store_ratings`. Alternatively, spin up the configured PostgreSQL instance via Docker Compose:
```bash
docker-compose up -d
```
*This starts PostgreSQL on port `5432` and Adminer on `http://localhost:8080` (credentials: username `postgres`, password `postgres`, database `store_ratings`).*

### 2. Backend Server Setup
From the root workspace folder, navigate to `/server`:
```bash
cd server
copy .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```
*The API server starts on `http://localhost:5000`.*

### 3. Frontend Client Setup
Open a new terminal and navigate to `/client`:
```bash
cd client
copy .env.example .env
npm install
npm run dev
```
*Vite compiles and starts the dev client at `http://localhost:5173`.*

---

## GitHub Publishing Guide

Before deploying, publish your repository to GitHub. Make sure your `.gitignore` is in place at the root to prevent checking in node dependencies and credentials.

1.  **Initialize Git:**
    ```bash
    git init
    ```
2.  **Add files to staging:**
    ```bash
    git add .
    ```
3.  **Commit changes:**
    ```bash
    git commit -m "Initial commit: complete store rating monorepo"
    ```
4.  **Create a blank repository on GitHub:**
    Go to [GitHub](https://github.com/new) and create a repository (do not initialize it with a README or gitignore).
5.  **Link your local repository to GitHub and push:**
    ```bash
    git remote add origin https://github.com/your-username/your-repo-name.git
    git branch -M main
    git push -u origin main
    ```

---

## Render Deployment Guide (Backend + PostgreSQL)

Render is excellent for hosting the PostgreSQL database and Express API server.

### Step 1: Create a PostgreSQL Database on Render
1.  Log in to your [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** and select **PostgreSQL**.
3.  Fill out the details:
    *   **Name:** `store-rating-db`
    *   **Database Name:** `store_ratings`
    *   **User:** `postgres`
4.  Click **Create Database**.
5.  Copy the **External Database URL** (e.g., `postgresql://postgres:...@dpg-...render.com/store_ratings`). You will use this as your connection string.

### Step 2: Deploy the Express Web Service on Render
1.  On the Render Dashboard, click **New +** and select **Web Service**.
2.  Connect your GitHub repository.
3.  Configure the service details:
    *   **Name:** `store-rating-api`
    *   **Language:** `Node`
    *   **Root Directory:** `server`
    *   **Build Command:** `npm install && npx prisma generate && npx prisma db push && npm run seed`
        *(This installs dependencies, generates the Prisma Client, pushes the schema, and runs the seeder script on build)*
    *   **Start Command:** `npm start`
4.  Click **Advanced** and add the following **Environment Variables**:
    *   `DATABASE_URL` = *[Your Render External Database URL copied in Step 1]*
    *   `JWT_SECRET` = *[A secure random string (e.g., `961e31ca7fc33...`)]*
    *   `NODE_ENV` = `production`
    *   `CORS_ORIGIN` = *[Your Vercel Frontend URL (you can update this after deploying on Vercel)]*
5.  Click **Create Web Service**. 
6.  Once deployed, copy the **Web Service URL** (e.g., `https://store-rating-api.onrender.com`).

---

## Vercel Deployment Guide (Frontend Client)

Vercel is the recommended hosting platform for React/Vite frontends.

1.  Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** and select **Project**.
3.  Import your GitHub repository.
4.  Configure Project Settings:
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** Click Edit and select `client`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
5.  Under **Environment Variables**, add:
    *   `VITE_API_URL` = `https://store-rating-api.onrender.com/api` *(Replace this with the Render Web Service URL you copied in the previous section followed by `/api`)*
6.  Click **Deploy**.
7.  Once deployed, copy the production URL (e.g., `https://store-rating-client.vercel.app`) and paste it back into your Render Web Service's `CORS_ORIGIN` variable to secure the APIs.

---

## Demo Login Credentials

The seeder script pre-loads the database with the following demo accounts:

| User Role | Email | Password | Linked Location |
|---|---|---|---|
| **System Admin** | `admin@example.com` | `Password123!` | System Access |
| **Normal User** | `alexander@example.com` | `Password123!` | None (User Alexander Hamilton Junior) |
| **Normal User** | `william@example.com` | `Password123!` | None (User William Shakespeare Senior) |
| **Normal User** | `elizabeth@example.com` | `Password123!` | None (User Elizabeth Bennett Bennet) |
| **Store Owner** | `owner1@example.com` | `Password123!` | *The Grand Boutique Store* |
| **Store Owner** | `owner2@example.com` | `Password123!` | *Premium Gourmet Supermarket* |
| **Store Owner** | `owner3@example.com` | `Password123!` | *Elegant Fashion Emporium* |

*Note: All pre-loaded account names satisfy the strict 20-character minimum requirement.*

---

## API Endpoints Summary

### 🔑 Authentication (`/api/auth`)
*   `POST /signup` - Normal user self-registration (forces role to `NORMAL_USER`).
*   `POST /login` - Single login endpoint for all roles. Returns JWT and role.
*   `POST /logout` - Terminates session, handles cookie clearing on request.
*   `PUT /update-password` - Updates authenticated user's password (requires old password).

### 🛡️ System Administration (`/api/admin`)
*   `GET /dashboard` - Fetches total counts of users, stores, and ratings.
*   `POST /users` - Admin creates new user profile and assigns a role.
*   `GET /users` - Paginated, sortable, and filterable list of users.
*   `GET /users/:id` - Detailed user profile. If they are a Store Owner, includes store ratings aggregates.
*   `POST /stores` - Creates new store and assigns owner.
*   `GET /stores` - Paginated, sortable, and filterable list of stores with overall average ratings.

### 👤 Normal Users (`/api/stores`)
*   `GET /` - Directory listing of stores with overall averages and the user's submitted rating. Supports inline search and sorting.
*   `POST /:storeId/ratings` - Submits a rating or updates an existing one (upsert).
*   `PUT /:storeId/ratings` - Modifies a rating.

### 🏪 Store Owners (`/api/store-owner`)
*   `GET /dashboard` - Statistical panel displaying store info, average rating, and customer review logs.

---

## Design & Engineering Decisions

1.  **Name Constraint Rule:** Standard names (e.g. "John Doe") are short, but to adhere strictly to the challenge requirements, validation rules enforce a **20-character minimum** and **60-character maximum** for both user registration and admin actions.
2.  **Idempotent Rating Upserts:** Rating submission is designed to be idempotent. Submitting a second rating from the same user to the same store updates the existing row instead of adding redundant records, protecting database size.
3.  **Client-Side Caching & Interceptors:** The React application intercepts outgoing requests to inject the JWT Bearer token dynamically, allowing for clean monorepo development and decoupling domains.
4.  **UI/UX Facelift:** Replaced the default dark layout with a vibrant light-mode aesthetic, utilizing indigo, fuchsia, and amber background gradients and white glassmorphic panels for a professional look.
