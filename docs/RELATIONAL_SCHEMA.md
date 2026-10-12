# SnapGrid - Relational Schema

This document details the relational schema specification for the SnapGrid database, following standard relational algebra conventions and MySQL 8.0 Data Definition Language (DDL) constraints.

---

## 1. Relational Notation

In standard relational schema notation:
- **Primary keys (PK)** are indicated with **<u>underline</u>** (or bold underline).
- **Foreign keys (FK)** are marked with an arrow (&uarr; / FK) referencing the parent relation.

```text
users (
    user_id (PK),
    username,
    email,
    password_hash,
    full_name,
    bio,
    profile_image_url,
    created_at
)

posts (
    post_id (PK),
    user_id (FK -> users.user_id),
    image_url,
    caption,
    created_at
)

likes (
    like_id (PK),
    user_id (FK -> users.user_id),
    post_id (FK -> posts.post_id),
    created_at
)

comments (
    comment_id (PK),
    user_id (FK -> users.user_id),
    post_id (FK -> posts.post_id),
    comment_text,
    created_at
)

follows (
    follow_id (PK),
    follower_id (FK -> users.user_id),
    following_id (FK -> users.user_id),
    created_at
)

activity_logs (
    log_id (PK),
    action,
    entity_type,
    entity_id,
    user_id (FK -> users.user_id),
    details,
    created_at
)
```

### Mathematical Notation:
- **USERS** (<u>user_id</u>, username, email, password_hash, full_name, bio, profile_image_url, created_at)
- **POSTS** (<u>post_id</u>, user_id*, image_url, caption, created_at)
- **LIKES** (<u>like_id</u>, user_id*, post_id*, created_at)
- **COMMENTS** (<u>comment_id</u>, user_id*, post_id*, comment_text, created_at)
- **FOLLOWS** (<u>follow_id</u>, follower_id*, following_id*, created_at)
- **ACTIVITY_LOGS** (<u>log_id</u>, action, entity_type, entity_id, user_id*, details, created_at)

*(Asterisk `*` denotes Foreign Key attribute)*

---

## 2. Table Schemas and Constraints Breakdown

### 2.1 Relation: `users`

| Column | Data Type | Key Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `INT AUTO_INCREMENT` | **PK** | `NO` | Primary Key, Auto-increment | Unique user identifier |
| `username` | `VARCHAR(50)` | Candidate Key | `NO` | `UNIQUE` | User account handle |
| `email` | `VARCHAR(100)` | Candidate Key | `NO` | `UNIQUE` | Unique email for authentication |
| `password_hash` | `VARCHAR(255)` | - | `NO` | - | Salted bcrypt hash |
| `full_name` | `VARCHAR(100)` | - | `YES` | - | Full human name |
| `bio` | `TEXT` | - | `YES` | - | Short biography |
| `profile_image_url` | `TEXT` | - | `YES` | `DEFAULT 'https://placehold.co/150'` | Profile photo link |
| `created_at` | `DATETIME` | - | `NO` | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |

#### Constraints for `users`:
- `PRIMARY KEY (user_id)`
- `UNIQUE (username)`
- `UNIQUE (email)`
- `NOT NULL` on `username`, `email`, `password_hash`, `created_at`

---

### 2.2 Relation: `posts`

| Column | Data Type | Key Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `post_id` | `INT AUTO_INCREMENT` | **PK** | `NO` | Primary Key, Auto-increment | Unique post identifier |
| `user_id` | `INT` | **FK** | `NO` | `REFERENCES users(user_id) ON DELETE CASCADE` | Post author identifier |
| `image_url` | `TEXT` | - | `NO` | - | Image file/storage URL |
| `caption` | `TEXT` | - | `YES` | - | Description / text of post |
| `created_at` | `DATETIME` | - | `NO` | `DEFAULT CURRENT_TIMESTAMP` | Post creation timestamp |

#### Constraints for `posts`:
- `PRIMARY KEY (post_id)`
- `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
- `NOT NULL` on `user_id`, `image_url`, `created_at`

---

### 2.3 Relation: `likes`

| Column | Data Type | Key Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `like_id` | `INT AUTO_INCREMENT` | **PK** | `NO` | Primary Key, Auto-increment | Unique like record ID |
| `user_id` | `INT` | **FK** | `NO` | `REFERENCES users(user_id) ON DELETE CASCADE` | User who liked the post |
| `post_id` | `INT` | **FK** | `NO` | `REFERENCES posts(post_id) ON DELETE CASCADE` | Target post liked |
| `created_at` | `DATETIME` | - | `NO` | `DEFAULT CURRENT_TIMESTAMP` | Interaction timestamp |

#### Constraints for `likes`:
- `PRIMARY KEY (like_id)`
- `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
- `FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE`
- `UNIQUE (user_id, post_id)` &rarr; Prevents duplicate likes from the same user on the same post
- `NOT NULL` on `user_id`, `post_id`, `created_at`

---

### 2.4 Relation: `comments`

| Column | Data Type | Key Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `comment_id` | `INT AUTO_INCREMENT` | **PK** | `NO` | Primary Key, Auto-increment | Unique comment ID |
| `user_id` | `INT` | **FK** | `NO` | `REFERENCES users(user_id) ON DELETE CASCADE` | Comment author ID |
| `post_id` | `INT` | **FK** | `NO` | `REFERENCES posts(post_id) ON DELETE CASCADE` | Post commented on |
| `comment_text` | `TEXT` | - | `NO` | - | Comment body content |
| `created_at` | `DATETIME` | - | `NO` | `DEFAULT CURRENT_TIMESTAMP` | Comment creation timestamp |

#### Constraints for `comments`:
- `PRIMARY KEY (comment_id)`
- `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
- `FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE`
- `NOT NULL` on `user_id`, `post_id`, `comment_text`, `created_at`

---

### 2.5 Relation: `follows`

| Column | Data Type | Key Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `follow_id` | `INT AUTO_INCREMENT` | **PK** | `NO` | Primary Key, Auto-increment | Unique follow relationship ID |
| `follower_id` | `INT` | **FK** | `NO` | `REFERENCES users(user_id) ON DELETE CASCADE` | Initiating user |
| `following_id`| `INT` | **FK** | `NO` | `REFERENCES users(user_id) ON DELETE CASCADE` | User being followed |
| `created_at` | `DATETIME` | - | `NO` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of follow edge |

#### Constraints for `follows`:
- `PRIMARY KEY (follow_id)`
- `FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE`
- `FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE`
- `UNIQUE (follower_id, following_id)` &rarr; Prevents duplicate follow connections
- `CHECK (follower_id != following_id)` &rarr; Prevents self-following
- `NOT NULL` on `follower_id`, `following_id`, `created_at`

---

### 2.6 Relation: `activity_logs`

| Column | Data Type | Key Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `log_id` | `INT AUTO_INCREMENT` | **PK** | `NO` | Primary Key, Auto-increment | Audit log record ID |
| `action` | `VARCHAR(50)` | - | `NO` | - | Logged action (`CREATE_POST`, etc.) |
| `entity_type` | `VARCHAR(50)` | - | `NO` | - | Target table (`posts`, `comments`, etc.) |
| `entity_id` | `INT` | - | `NO` | - | Primary key ID of target entity |
| `user_id` | `INT` | **FK** | `YES` | `REFERENCES users(user_id) ON DELETE SET NULL` | Performing user (nullable) |
| `details` | `JSON` | - | `YES` | - | Additional diagnostic metadata |
| `created_at` | `DATETIME` | - | `NO` | `DEFAULT CURRENT_TIMESTAMP` | Event timestamp |

#### Constraints for `activity_logs`:
- `PRIMARY KEY (log_id)`
- `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL`
- `NOT NULL` on `action`, `entity_type`, `entity_id`, `created_at`

---

## 3. Referential Integrity Rules Summary

| Constraint Name | Source Table | Source Column | Target Table | Target Column | Delete Action | Update Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_posts_user` | `posts` | `user_id` | `users` | `user_id` | `CASCADE` | `CASCADE` |
| `fk_likes_user` | `likes` | `user_id` | `users` | `user_id` | `CASCADE` | `CASCADE` |
| `fk_likes_post` | `likes` | `post_id` | `posts` | `post_id` | `CASCADE` | `CASCADE` |
| `fk_comments_user` | `comments` | `user_id` | `users` | `user_id` | `CASCADE` | `CASCADE` |
| `fk_comments_post` | `comments` | `post_id` | `posts` | `post_id` | `CASCADE` | `CASCADE` |
| `fk_follows_follower` | `follows` | `follower_id` | `users` | `user_id` | `CASCADE` | `CASCADE` |
| `fk_follows_following`| `follows` | `following_id` | `users` | `user_id` | `CASCADE` | `CASCADE` |
| `fk_logs_user` | `activity_logs` | `user_id` | `users` | `user_id` | `SET NULL` | `CASCADE` |

**Rationale for ON DELETE CASCADE**:
When a user deletes their account, all dependent posts, likes, comments, and follow relationships owned by or directed to them are automatically wiped to prevent orphaned records and maintain referential consistency.

**Rationale for ON DELETE SET NULL (activity_logs)**:
Audit records must persist even if a user is deleted so platform administrators can audit what occurred previously, setting the actor reference to `NULL`.
