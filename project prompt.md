# MASTER PROMPT FOR ANTIGRAVITY — Store Rating Platform (FullStack Intern Challenge)

Copy everything below this line into Antigravity as your project prompt.

---

## ROLE & INSTRUCTIONS FOR THE AGENT

You are an expert full-stack engineer. Build a **complete, production-quality, working web application** called **"Store Rating Platform"** based on the exact specification below. Do not skip, simplify, or assume away any requirement. If something is ambiguous, make the most sensible professional decision and document it in the README — do not silently drop a feature. At the end, the project must run locally end-to-end with a single set of setup commands, with seed data so all three roles can be tested immediately.

Build this iteratively:
1. Scaffold backend + database first, with migrations/seeders and all APIs working (verify with a quick test or Postman-style curl checks).
2. Scaffold frontend, wire it to the backend.
3. Implement role-based access end-to-end.
4. Add validations, sorting, filtering, search.
5. Polish UI/UX, error handling, loading states.
6. Write the README and seed/test instructions.

Confirm each phase compiles and runs before moving to the next.

---

## 1. TECH STACK (mandatory)

- **Backend:** Express.js (Node.js), written in a clean layered architecture (routes → controllers → services → models/repositories). Use TypeScript if possible; otherwise modern JS (ES modules) is acceptable.
- **Database:** PostgreSQL. Use **Sequelize** or **Prisma** as ORM (Prisma preferred for type-safety and easy migrations).
- **Frontend:** React.js (Vite-based, not CRA). Use React Router v6+, a global state/auth context, and Axios for API calls.
- **Auth:** JWT-based authentication (access token in httpOnly cookie or Authorization header — pick one and be consistent), bcrypt for password hashing.
- **Styling:** Use a clean component library or utility CSS (Tailwind CSS preferred) — UI must look professional, not unstyled HTML.
- **Validation:** express-validator or zod/joi on backend; matching client-side validation on frontend forms.

---

## 2. PROJECT STRUCTURE

Create a monorepo with two top-level folders:

```
/server          → Express backend
  /src
    /config       → db connection, env config
    /models       → Prisma schema or Sequelize models
    /migrations
    /seeders      → seed script creating 1 admin, sample normal users, sample store owners + stores + ratings
    /controllers
    /services
    /routes
    /middlewares  → auth.middleware.js, role.middleware.js, validate.middleware.js, errorHandler.js
    /utils        → token generation, password hashing, pagination/sorting helpers
    app.js
    server.js
  .env.example
  package.json

/client           → React frontend
  /src
    /api          → axios instance + api call functions per resource
    /components   → reusable UI components (Table, Modal, RatingStars, Navbar, ProtectedRoute, etc.)
    /context       → AuthContext
    /pages
      /auth        → Login.jsx, Signup.jsx
      /admin       → Dashboard.jsx, UsersList.jsx, AddUser.jsx, StoresList.jsx, AddStore.jsx, UserDetail.jsx
      /user        → StoresList.jsx, UpdatePassword.jsx
      /storeOwner  → Dashboard.jsx, UpdatePassword.jsx
    /routes        → AppRoutes.jsx, route guards per role
    /hooks
    App.jsx
    main.jsx
  .env.example
  package.json

README.md
docker-compose.yml (optional but nice-to-have: postgres + adminer)
```

---

## 3. DATABASE SCHEMA (design with best practices: normalization, foreign keys, indexes, enums, timestamps)

### `users` table
| Column | Type | Notes |
|---|---|---|
| id | UUID / serial PK | |
| name | varchar(60) | required, min 20 / max 60 chars enforced at validation layer |
| email | varchar, unique | required, valid email format |
| password | varchar (hashed) | required, never returned in API responses |
| address | varchar(400) | required |
| role | enum('SYSTEM_ADMIN','NORMAL_USER','STORE_OWNER') | required |
| created_at, updated_at | timestamps | |

### `stores` table
| Column | Type | Notes |
|---|---|---|
| id | UUID / serial PK | |
| name | varchar(60) | required |
| email | varchar | required, unique |
| address | varchar(400) | required |
| owner_id | FK → users.id | nullable if store has no linked owner account, but ideally required, references a user with role STORE_OWNER |
| created_at, updated_at | timestamps | |

### `ratings` table
| Column | Type | Notes |
|---|---|---|
| id | UUID / serial PK | |
| user_id | FK → users.id | the normal user who rated |
| store_id | FK → stores.id | the store being rated |
| rating | smallint | 1–5, enforced via CHECK constraint |
| created_at, updated_at | timestamps | |
| **unique constraint** | (user_id, store_id) | a user can only have ONE rating per store — submitting again should UPDATE, not duplicate |

Add indexes on `stores.name`, `stores.email`, `users.email`, `users.role`, `ratings.store_id`, `ratings.user_id`.

Write a seed script that creates:
- 1 system admin (e.g. admin@example.com)
- 5+ normal users
- 5+ store owners, each linked to one store
- Random ratings (1–5) from normal users across stores, so dashboards and average ratings are populated immediately.

---

## 4. AUTHENTICATION & AUTHORIZATION

- Single `/api/auth/login` endpoint for ALL roles (admin, normal user, store owner) — backend determines role from the user record and returns it in the JWT payload + response body.
- `/api/auth/signup` — **public, normal users only** (role is forced to NORMAL_USER server-side regardless of what's sent in the body — never trust client-supplied role on signup).
- `/api/auth/logout` — clears token/cookie.
- `/api/auth/update-password` — authenticated route, available to ALL roles (normal user, store owner, and admin should also be able to change their own password even though not explicitly listed for admin — apply consistently).
- JWT middleware (`authenticate`) verifies token on protected routes.
- Role middleware (`authorize(...roles)`) restricts routes by role — e.g. `authorize('SYSTEM_ADMIN')` for admin-only routes.
- Passwords hashed with bcrypt (salt rounds ≥ 10) before storage. Never log or return plaintext/hashed passwords.

---

## 5. BACKEND API ENDPOINTS (implement all of these)

### Auth
- `POST /api/auth/signup` — normal user self-registration
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `PUT /api/auth/update-password` (authenticated, any role)

### Admin (role = SYSTEM_ADMIN only)
- `GET /api/admin/dashboard` → returns `{ totalUsers, totalStores, totalRatings }`
- `POST /api/admin/users` → create a new user (Name, Email, Password, Address, Role — admin chooses role: NORMAL_USER, STORE_OWNER, or SYSTEM_ADMIN)
- `GET /api/admin/users` → list normal + admin users (and optionally store owners too — clarify in UI tabs/filter by role) with Name, Email, Address, Role; supports `?sortBy=&order=&name=&email=&address=&role=`
- `GET /api/admin/users/:id` → full detail of a user; **if role is STORE_OWNER, include their store's average rating in the response**
- `POST /api/admin/stores` → create new store (Name, Email, Address, and optionally assign/create an owner)
- `GET /api/admin/stores` → list stores with Name, Email, Address, Rating (computed average); supports same sort/filter query params as above

### Normal User (role = NORMAL_USER only)
- `GET /api/stores` → list all stores with: storeName, address, overallRating (avg of all ratings), userSubmittedRating (this logged-in user's rating or null), supports `?search=&searchBy=name|address&sortBy=&order=`
- `POST /api/stores/:storeId/ratings` → submit a rating (1–5). If a rating already exists for (user, store), **update it** instead of creating a duplicate (upsert).
- `PUT /api/stores/:storeId/ratings` → explicit modify-rating endpoint (can reuse the same upsert logic as above)

### Store Owner (role = STORE_OWNER only)
- `GET /api/store-owner/dashboard` → returns the owner's store info: `{ averageRating, raters: [{ userName, userEmail, rating, ratedAt }] }`

All list endpoints must support **pagination**, **sorting (asc/desc) on Name, Email, Address, Role/Rating**, and relevant **filtering**, implemented server-side (not just client-side array sorting) — use query params and apply them in the DB query (ORDER BY / WHERE).

Apply consistent error handling middleware returning `{ success: false, message, errors? }` with correct HTTP status codes (400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 500 server error).

---

## 6. VALIDATION RULES (apply identically on backend AND frontend — backend is source of truth, frontend just gives instant feedback)

- **Name:** required, min 20 characters, max 60 characters.
- **Address:** required, max 400 characters.
- **Email:** required, must be valid email format (use a proper regex or validator library, not a trivial check).
- **Password:** required, 8–16 characters, must contain at least one uppercase letter AND at least one special character (e.g. regex: `^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$`).
- **Rating:** integer between 1 and 5 inclusive only.
- Show clear inline field-level error messages on every form (Signup, Add User, Add Store, Update Password, Login).
- Backend must re-validate everything even if frontend already validated (never trust client input).

---

## 7. FRONTEND PAGES & UX REQUIREMENTS

### Public
- **Login page** — single form for all roles, redirects based on returned role after success.
- **Signup page** (normal users only) — Name, Email, Address, Password fields with live validation hints.

### Shared (all logged-in roles)
- **Navbar** showing role-appropriate links + Logout button.
- **Update Password** page/modal, accessible from a profile menu.

### System Administrator
- **Dashboard** — 3 stat cards: Total Users, Total Stores, Total Ratings.
- **Users list page** — sortable table (Name, Email, Address, Role) with column-header sort toggle (asc/desc) and filter inputs above the table for Name, Email, Address, Role (dropdown).
- **Add User form** — Name, Email, Password, Address, Role selector.
- **Stores list page** — sortable table (Name, Email, Address, Rating) with same filter pattern.
- **Add Store form** — Name, Email, Address, (optionally link/create Store Owner).
- **User Detail view** — modal or page showing Name, Email, Address, Role, and (if Store Owner) their store's average Rating.

### Normal User
- **Stores list page** — search bar (by Name and/or Address), table/card view showing: Store Name, Address, Overall Rating, "Your Rating" (or "Not Rated"), a 1–5 star/number rating input to submit or modify their rating inline.

### Store Owner
- **Dashboard** — average rating prominently displayed + a table of users who rated their store (Name, Email, Rating, Date).

### General UX
- Loading states (spinners/skeletons) on data fetches.
- Empty states ("No stores found", "No ratings yet").
- Toast/snackbar notifications for success/error actions (e.g. react-hot-toast).
- Protected routes: unauthenticated users redirected to `/login`; wrong-role access redirected to a 403/Not Authorized page.
- Responsive layout (usable on mobile and desktop).

---

## 8. SECURITY & BEST PRACTICES CHECKLIST

- [ ] Passwords hashed with bcrypt, never returned in any API response.
- [ ] JWT secret stored in `.env`, never hardcoded.
- [ ] SQL injection protected via parameterized queries/ORM (no raw string-concatenated SQL).
- [ ] CORS configured to only allow the frontend origin.
- [ ] Helmet.js (or equivalent) for HTTP security headers.
- [ ] Rate limiting on `/api/auth/*` routes to prevent brute force.
- [ ] Centralized error handler — no stack traces leaked to client in production mode.
- [ ] `.env.example` files provided for both client and server (no real secrets committed).
- [ ] Input sanitization on all write endpoints.
- [ ] Role checked on backend for every protected route — never rely on frontend hiding a button as the only access control.

---

## 9. DELIVERABLES

1. Fully working `/server` and `/client` codebases as described above.
2. Database migrations + a seed script (`npm run seed`) producing demo data for all 3 roles.
3. `.env.example` for both client and server.
4. A root `README.md` containing:
   - Project overview
   - Tech stack
   - Setup instructions (`npm install`, env setup, migrate, seed, run — for both client and server, in order)
   - Demo login credentials for all 3 roles (admin / normal user / store owner)
   - API endpoint summary table
   - Any assumptions made for ambiguous requirements
5. (Optional but valued) `docker-compose.yml` to spin up PostgreSQL locally with one command.
6. Make sure `npm run dev` (or documented equivalent) on both client and server results in a fully usable app at `localhost` with no manual DB setup beyond running migrate + seed.

---

## 10. ACCEPTANCE CRITERIA — verify before declaring done

- [ ] Can sign up as a normal user, log in, see store list, search by name/address, submit a rating, modify it, and see the overall rating update.
- [ ] Can log in as admin, see dashboard counts update correctly, add a new normal user / store owner / admin, add a new store, filter and sort both Users and Stores tables, view full detail of a store owner including their rating.
- [ ] Can log in as a store owner, see correct average rating and the full list of raters for their specific store only (not other stores).
- [ ] All form validations (Name length, Address length, Password complexity, Email format, Rating range) are enforced on both frontend and backend, with clear error messages.
- [ ] Password update works for all roles and re-hashes correctly.
- [ ] Logout clears the session/token and protected pages become inaccessible.
- [ ] Submitting a second rating for the same store by the same user updates the existing rating rather than creating a duplicate row.
- [ ] No console errors, no broken routes, no role can access another role's pages/APIs directly via URL or API call.

Build the entire project now, following the structure and order above.
