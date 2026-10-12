# SnapGrid — Mini Instagram Clone (DBMS Project)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-v8.0%2B-blue.svg)](https://www.mysql.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SnapGrid** is a full-stack photo-sharing web application and comprehensive Database Management Systems (DBMS) project. Built with **MySQL 8.0+**, **Node.js / Express**, and **React (Vite)**, it implements core social media features—user profiles, photo publishing, personalized chronological feeds, likes, comments, and follower graphs—while demonstrating foundational and advanced relational database concepts.

Repository: **[https://github.com/kharataditya/snapgrid](https://github.com/kharataditya/snapgrid)**

---

## Table of Contents
1. [Quick Start (Run in 3 Minutes)](#1-quick-start-run-in-3-minutes)
2. [Demo Credentials & Testing](#2-demo-credentials--testing)
3. [Key Features & Highlights](#3-key-features--highlights)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Database Schema & Design](#6-database-schema--design)
7. [SQL Feature Demonstrations (For Viva)](#7-sql-feature-demonstrations-for-viva)
8. [REST API Documentation](#8-rest-api-documentation)
9. [Manual Step-by-Step Setup](#9-manual-step-by-step-setup)
10. [Troubleshooting Common Issues](#10-troubleshooting-common-issues)
11. [Academic Documentation Directory](#11-academic-documentation-directory)

---

## 1. Quick Start (Run in 3 Minutes)

Follow these steps to run SnapGrid on any machine:

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **MySQL Server**: `v8.0` or higher (running on port `3306`)
- **Git**: ([Download Git](https://git-scm.com/))

### Step 1: Clone the Repository
```bash
git clone https://github.com/kharataditya/snapgrid.git
cd snapgrid
```

### Step 2: One-Click Automated Setup (Windows)
Double-click **`setup.bat`** (or execute from terminal):
```powershell
.\setup.bat
```
> **What `setup.bat` does automatically:**
> 1. Installs all backend and frontend dependencies (`npm run install:all`).
> 2. Connects to your MySQL server, creates `snapgrid_db`, runs all tables, constraints, indexes, views, triggers, and seeds 12 users with sample posts.
> 3. Saves your working MySQL credentials into `backend/.env`.

*(Alternatively, run manually via npm: `npm run setup`)*

### Step 3: Start the Application
Double-click **`start-dev.bat`** (or run via terminal):
```powershell
.\start-dev.bat
```
*(Or in two separate terminals: `npm run backend` in terminal 1, and `npm run frontend` in terminal 2).*

### Step 4: Open in Browser
Visit **`http://localhost:5173`** in your browser!

---

## 2. Demo Credentials & Testing

The login page contains **1-Click Demo Login** buttons for instant demonstration:

| Persona | Email / Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **John Doe** | `john@example.com` (`john_doe`) | `password123` | Active photographer (multiple posts & followers) |
| **Jane Smith** | `jane@example.com` (`jane_smith`) | `password123` | Software engineer (follows John, distinct likes) |
| **Alex Rivera** | `alex@example.com` (`alex_wanderer`) | `password123` | Mountain explorer & creator |

*(All 12 pre-seeded users use `password123`).*

### ⚡ 1-Click Multi-Account Switcher (Viva Demonstration)
In the top navigation bar, there is an instant account switcher:
- When logged in as John: Click **`⚡ Switch to @jane_smith`**
- When logged in as Jane: Click **`⚡ Switch to @john_doe`**

This switches accounts in **under 0.1 seconds** without having to logout and retype passwords!
- On any post: Notice the badge says **`❤️ Liked by you`** for the user who liked it, and **`🤍 Not liked by you`** for the other user.
- Likes, feeds, and follows are completely isolated per user account.

---

## 3. Key Features & Highlights

- **Live Chronological Feed**: Posts from accounts you follow and yourself, refreshed in real time with silent background polling.
- **Strictly Segregated Likes**: Likes are enforced at the database level via composite unique constraints (`UNIQUE(user_id, post_id)`). The UI clearly displays who liked each post (e.g. `Liked by you and 3 others`).
- **Follower Graph**: Bi-directional relationship tracking with self-follow prevention enforced by a DBMS check constraint (`CHECK(follower_id != following_id)`).
- **Interactive Comments Thread**: Nested comment lists with author delete privileges.
- **Audit Logging via MySQL Triggers**: Automated trigger execution on post creation and likes into `activity_logs`.
- **Analytical Views**: `post_statistics` and `user_statistics` views pre-computing engagement counters.
- **Mobile Responsive Design**: Clean Instagram-inspired interface with modal photo viewing, responsive grid, and custom avatar fallbacks.

---

## 4. Technology Stack

| Component | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Database** | MySQL (InnoDB) | 8.0+ | Relational DBMS, foreign keys, triggers, views, indexes |
| **Backend Runtime** | Node.js | 18.x+ | Asynchronous event-driven JavaScript runtime |
| **Backend Framework** | Express.js | 4.x | REST API routing, middleware, controllers |
| **Database Driver** | `mysql2/promise` | 3.x | High-performance client with connection pooling & prepared statements |
| **Authentication** | JWT (`jsonwebtoken`) & `bcrypt` | Latest | Stateless JWT with httpOnly cookies & Bearer fallback |
| **Frontend Framework** | React.js | 18.x | Component-driven UI library |
| **Frontend Tooling** | Vite | 6.x | Fast dev server and optimized production build |
| **HTTP Client** | Axios | 1.x | REST client with request/response interceptors |
| **Styling** | Modern CSS3 | Standard | Flexbox, CSS Grid, custom properties, responsive layout |

---

## 5. System Architecture

SnapGrid implements a classic **Three-Tier Architecture**:

```
+-------------------------------------------------------+
|              CLIENT TIER (React + Vite)               |
|      Port 5173 - Feed, Profiles, Post Modal, Auth     |
+---------------------------+---------------------------+
                            | HTTP / REST (Axios)
                            v
+-------------------------------------------------------+
|          APPLICATION TIER (Express.js / Node)         |
|      Port 5000 - JWT Auth Middleware & Controllers   |
+---------------------------+---------------------------+
                            | TCP Socket (mysql2 Pool)
                            v
+-------------------------------------------------------+
|              DATABASE TIER (MySQL 8.0+)               |
|   Port 3306 - snapgrid_db (InnoDB Tables, Views, Triggers) |
+-------------------------------------------------------+
```

---

## 6. Database Schema & Design

The database consists of **6 InnoDB tables** with primary keys, foreign keys (`ON DELETE CASCADE`), unique constraints, and check constraints:

```sql
-- 1. USERS
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NULL,
    bio TEXT NULL,
    profile_image_url TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. POSTS
CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. LIKES (Many-to-Many Bridge)
CREATE TABLE likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_post_like UNIQUE (user_id, post_id),
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. COMMENTS
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. FOLLOWS (Self-referencing Graph)
CREATE TABLE follows (
    follow_id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. ACTIVITY_LOGS (Audit Trail)
CREATE TABLE activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    user_id INT NULL,
    details JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

---

## 7. SQL Feature Demonstrations (For Viva)

All 31 demonstration queries covering complete DBMS concepts can be found in `database/demonstration_queries.sql`.

### Example 1: View Definition (`post_statistics`)
```sql
CREATE OR REPLACE VIEW post_statistics AS
SELECT 
    p.post_id,
    p.user_id,
    u.username,
    p.image_url,
    p.caption,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) AS comment_count
FROM posts p
INNER JOIN users u ON p.user_id = u.user_id;
```

### Example 2: Audit Logging Trigger
```sql
DELIMITER //
CREATE TRIGGER trg_log_post_created
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details, created_at)
    VALUES (
        'POST_CREATED', 'post', NEW.post_id, NEW.user_id,
        JSON_OBJECT('caption', NEW.caption, 'image_url', NEW.image_url), NOW()
    );
END //
DELIMITER ;
```

### Example 3: Correlated Subquery with `GROUP_CONCAT` (Feed Query)
```sql
SELECT p.*, u.username, u.profile_image_url,
    (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
    EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = ?) as is_liked,
    (SELECT GROUP_CONCAT(u2.username ORDER BY l2.created_at DESC SEPARATOR ', ')
     FROM likes l2 JOIN users u2 ON l2.user_id = u2.user_id WHERE l2.post_id = p.post_id) as liked_by_usernames
FROM posts p
INNER JOIN users u ON p.user_id = u.user_id
WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
   OR p.user_id = ?
ORDER BY p.created_at DESC;
```

---

## 8. REST API Documentation

| Resource | Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | No | Register new user account |
| **Auth** | `POST` | `/api/auth/login` | No | Login with email/username and password |
| **Auth** | `GET` | `/api/auth/me` | Yes | Get currently logged-in user profile & stats |
| **Auth** | `POST` | `/api/auth/logout` | Yes | Clear auth cookie |
| **Users** | `GET` | `/api/users/search?q=` | No | Search users by username or name |
| **Users** | `GET` | `/api/users/:id` | No | Get user profile (by ID or username) |
| **Users** | `PUT` | `/api/users/me` | Yes | Update own full name, bio, profile image |
| **Users** | `GET` | `/api/users/:id/followers` | No | List followers of a user |
| **Users** | `GET` | `/api/users/:id/following` | No | List following of a user |
| **Users** | `POST` | `/api/users/:id/follow` | Yes | Follow a user |
| **Users** | `DELETE`| `/api/users/:id/follow` | Yes | Unfollow a user |
| **Posts** | `GET` | `/api/posts/feed` | Yes | Chronological feed with like status |
| **Posts** | `POST` | `/api/posts` | Yes | Create post with image URL and caption |
| **Posts** | `GET` | `/api/posts/:id` | No | Get single post details & likers |
| **Posts** | `DELETE`| `/api/posts/:id` | Yes | Delete post (owner only) |
| **Posts** | `GET` | `/api/posts/user/:id` | No | Get all posts of a specific user |
| **Likes** | `POST` | `/api/posts/:id/like` | Yes | Like post (handles duplicate gracefully) |
| **Likes** | `DELETE`| `/api/posts/:id/like` | Yes | Unlike post |
| **Comments**| `GET`| `/api/posts/:id/comments` | No | Get comment list for post |
| **Comments**| `POST`| `/api/posts/:id/comments` | Yes | Add comment to post |
| **Comments**| `DELETE`| `/api/comments/:id` | Yes | Delete comment (author only) |

---

## 9. Manual Step-by-Step Setup

If you prefer manual setup instead of `setup.bat`:

### 1. Configure Backend `.env`
Copy `.env.example` to `backend/.env`:
```powershell
cp .env.example backend/.env
```
Open `backend/.env` and update `DB_PASSWORD` to your local MySQL root password:
```ini
DB_PASSWORD=your_password
DATABASE_URL=mysql://root:your_password@localhost:3306/snapgrid_db
```

### 2. Initialize Database from Terminal
Run the initializer script:
```powershell
node database/init_db.js your_password
```

### 3. Install Dependencies
```powershell
npm run install:all
```

### 4. Start Servers
```powershell
# Terminal 1 (Backend)
npm run backend

# Terminal 2 (Frontend)
npm run frontend
```

---

## 10. Troubleshooting Common Issues

### Issue 1: `ECONNREFUSED 127.0.0.1:3306`
- **Cause**: MySQL server is not running.
- **Fix**: Open Windows Services (`services.msc`), find **MySQL80**, and click **Start**.
  Or in an Administrator PowerShell terminal:
  ```powershell
  net start MySQL80
  ```

### Issue 2: `Access denied for user 'root'@'localhost'`
- **Cause**: The password in `backend/.env` doesn't match your MySQL root password.
- **Fix**: Run `node database/init_db.js <your_password>` or manually update `DB_PASSWORD` in `backend/.env`.

### Issue 3: `Unknown database 'snapgrid_db'`
- **Cause**: Database has not been initialized.
- **Fix**: Run `node database/init_db.js` or double-click `database/setup_database.bat`.

### Issue 4: Port 5000 or 5173 already in use
- **Fix**: Stop any existing Node processes:
  ```powershell
  Stop-Process -Name node -Force
  ```

---

## 11. Academic Documentation Directory

Full DBMS project reports and examination guides are located in [`docs/`](./docs):

| Document | Link | Description |
| :--- | :--- | :--- |
| **ER Diagram** | [`docs/ER_DIAGRAM.md`](./docs/ER_DIAGRAM.md) | Mermaid Entity-Relationship diagram and cardinality analysis |
| **Relational Schema** | [`docs/RELATIONAL_SCHEMA.md`](./docs/RELATIONAL_SCHEMA.md) | Formal relational notation, keys, and functional dependencies |
| **Normalization** | [`docs/NORMALIZATION.md`](./docs/NORMALIZATION.md) | Step-by-step normalization proof (UNF &rarr; 1NF &rarr; 2NF &rarr; 3NF/BCNF) |
| **DBMS Concepts** | [`docs/DBMS_CONCEPTS.md`](./docs/DBMS_CONCEPTS.md) | Joins, views, triggers, transactions, indexing, and aggregate queries |
| **API Documentation** | [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) | Comprehensive API endpoint reference with sample requests & responses |
| **Testing Document** | [`docs/TESTING.md`](./docs/TESTING.md) | 25 manual and automated test cases covering constraints & API flows |
| **Viva Voce Q&A** | [`docs/VIVA_QUESTIONS.md`](./docs/VIVA_QUESTIONS.md) | 28 oral examination questions with detailed model answers |
| **Team Contribution**| [`docs/TEAM_CONTRIBUTION.md`](./docs/TEAM_CONTRIBUTION.md) | 4-member contribution matrix and Git workflow documentation |

---

Developed for Database Management Systems Project & Viva Evaluation.
