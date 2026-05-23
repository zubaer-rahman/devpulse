# DevPulse

An internal tech issue & feature tracker platform designed for software teams to collaboratively report bugs, suggest features, and coordinate resolutions.

## 🚀 Live URL
**https://devpulse-rose.vercel.app/**

## ✨ Features
- **Role-Based Access Control**: Secure login and management for Contributors and Maintainers.
- **Issue Tracking**: Create, view, update, and resolve software bugs or feature requests.
- **Advanced Filtering & Sorting**: Filter issues by type/status and sort by age.
- **Optimized Data Retrieval**: Efficient batch lookups without using ORMs, query builders, or SQL JOINs.
- **Dynamic Status Flows**: Transition issues smoothly from `open` -> `in_progress` -> `resolved`.

## 🛠️ Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (NeonDB)
- **Driver**: Raw native `pg` driver (No ORM/Query Builder)
- **Security**: bcrypt (password hashing), jsonwebtoken (JWT auth)
- **Deployment**: Vercel

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zubaer-rahman/devpulse.git
   cd devpulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=your_neondb_postgresql_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new Contributor or Maintainer.
- `POST /api/auth/login` - Authenticate user and receive JWT.

### Issues
- `POST /api/issues` - Create a new bug or feature request *(Protected)*.
- `GET /api/issues` - Retrieve all issues with optional filtering (`type`, `status`) and sorting.
- `GET /api/issues/:id` - Retrieve specific issue details.
- `PATCH /api/issues/:id` - Update an issue. *(Maintainers can update any; Contributors can update their own if open)*.
- `DELETE /api/issues/:id` - Permanently delete an issue *(Maintainer only)*.

## 🗄️ Database Schema Summary

The database uses raw SQL and consists of two core tables:

**1. `users` Table**
- `id`: Primary Key (Serial)
- `name`: VARCHAR(255)
- `email`: VARCHAR(255) UNIQUE
- `password`: VARCHAR(255)
- `role`: VARCHAR(20) (`contributor` or `maintainer`)
- `created_at`, `updated_at`: Timestamps

**2. `issues` Table**
- `id`: Primary Key (Serial)
- `title`: VARCHAR(255)
- `description`: TEXT (Min 20 characters)
- `type`: VARCHAR(20) (`bug` or `feature_request`)
- `status`: VARCHAR(20) (`open`, `in_progress`, `resolved`)
- `reporter_id`: INT Foreign Key referencing `users(id)` ON DELETE CASCADE
- `created_at`, `updated_at`: Timestamps
