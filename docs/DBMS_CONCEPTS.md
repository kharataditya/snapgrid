# SnapGrid - Advanced DBMS Concepts & SQL Implementation

This guide documents the core Relational Database Management System (DBMS) concepts demonstrated in **SnapGrid**, complete with production-ready PostgreSQL queries, execution rationales, and architectural explanations.

---

## 1. Relational Joins

Joins combine columns from one or more tables based on a related column between them.

### 1.1 INNER JOIN vs LEFT JOIN

- **INNER JOIN**: Returns only rows where there is a match in both tables. If a user has not published any posts, they will not appear in an INNER JOIN query between `users` and `posts`.
- **LEFT (OUTER) JOIN**: Returns all rows from the left table, along with matching rows from the right table. If there is no match, the right side returns `NULL`.

### 1.2 Example 1: INNER JOIN (Posts with Author Information)
Used when rendering the global discovery feed where every post must have its author's username and avatar.

```sql
SELECT
    p.post_id,
    p.image_url,
    p.caption,
    p.created_at,
    u.user_id,
    u.username,
    u.profile_image_url
FROM posts p
INNER JOIN users u ON p.user_id = u.user_id
ORDER BY p.created_at DESC;
```

### 1.3 Example 2: LEFT JOIN (Users with Post Counts, Including Inactive Users)
Used when listing platform users including new accounts with 0 posts.

```sql
SELECT
    u.user_id,
    u.username,
    COUNT(p.post_id) AS total_posts
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
GROUP BY u.user_id, u.username
ORDER BY total_posts DESC;
```
*Note*: If `INNER JOIN` were used here, users who have never posted would be omitted from the output.

### 1.4 Example 3: Multi-Table JOIN (Post Feed with Like Status for Current User)

```sql
SELECT
    p.post_id,
    p.caption,
    u.username AS author,
    COUNT(DISTINCT l.like_id) AS like_count,
    COUNT(DISTINCT c.comment_id) AS comment_count,
    CASE WHEN user_likes.like_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_liked
FROM posts p
JOIN users u ON p.user_id = u.user_id
LEFT JOIN likes l ON p.post_id = l.post_id
LEFT JOIN comments c ON p.post_id = c.post_id
LEFT JOIN likes user_likes ON p.post_id = user_likes.post_id AND user_likes.user_id = 1
GROUP BY p.post_id, u.username, user_likes.like_id
ORDER BY p.created_at DESC;
```

---

## 2. Database Views

A **View** is a stored virtual table defined by a SQL query. Views encapsulate complex query logic, ensure standard calculation of metrics, and provide data security abstraction.

### 2.1 View: `post_statistics`
Computes aggregated metrics (total likes and total comments) for every post in the system.

```sql
CREATE OR REPLACE VIEW post_statistics AS
SELECT
    p.post_id,
    p.user_id AS author_id,
    p.caption,
    p.image_url,
    p.created_at,
    COUNT(DISTINCT l.like_id) AS total_likes,
    COUNT(DISTINCT c.comment_id) AS total_comments
FROM posts p
LEFT JOIN likes l ON p.post_id = l.post_id
LEFT JOIN comments c ON p.post_id = c.post_id
GROUP BY p.post_id, p.user_id, p.caption, p.image_url, p.created_at;
```

#### Querying `post_statistics`:
```sql
-- Retrieve the top 5 most engaged posts
SELECT post_id, caption, total_likes, total_comments
FROM post_statistics
ORDER BY (total_likes + total_comments) DESC
LIMIT 5;
```

### 2.2 View: `user_statistics`
Calculates high-level profile summaries for every registered user: post count, followers count, and following count.

```sql
CREATE OR REPLACE VIEW user_statistics AS
SELECT
    u.user_id,
    u.username,
    u.full_name,
    u.profile_image_url,
    COUNT(DISTINCT p.post_id) AS post_count,
    COUNT(DISTINCT f_in.follower_id) AS followers_count,
    COUNT(DISTINCT f_out.following_id) AS following_count
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
LEFT JOIN follows f_in ON u.user_id = f_in.following_id
LEFT JOIN follows f_out ON u.user_id = f_out.follower_id
GROUP BY u.user_id, u.username, u.full_name, u.profile_image_url;
```

#### Querying `user_statistics`:
```sql
-- Retrieve profile stats for user ID 1
SELECT * FROM user_statistics WHERE user_id = 1;
```

---

## 3. Database Triggers & Audit Logging

A **Trigger** is a procedural routine automatically executed by MySQL when specified events (`INSERT`, `UPDATE`, `DELETE`) happen on a table.

SnapGrid uses triggers to log user activities into the `activity_logs` table without polluting backend application logic.

### 3.1 Post Creation Audit Trigger in MySQL

```sql
DELIMITER //
CREATE TRIGGER trg_log_post_created
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details, created_at)
    VALUES (
        'POST_CREATED',
        'post',
        NEW.post_id,
        NEW.user_id,
        JSON_OBJECT('caption', NEW.caption, 'image_url', NEW.image_url, 'posted_at', NEW.created_at),
        NOW()
    );
END //
DELIMITER ;
```

### 3.2 Post Deletion Audit Trigger in MySQL

```sql
DELIMITER //
CREATE TRIGGER trg_log_post_deleted
AFTER DELETE ON posts
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details, created_at)
    VALUES (
        'POST_DELETED',
        'post',
        OLD.post_id,
        OLD.user_id,
        JSON_OBJECT('caption', OLD.caption, 'deleted_at', NOW()),
        NOW()
    );
END //
DELIMITER ;
```

### 3.3 Trigger for Likes

```sql
DELIMITER //
CREATE TRIGGER trg_log_like_created
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details, created_at)
    VALUES (
        'LIKE_POST',
        'post',
        NEW.post_id,
        NEW.user_id,
        JSON_OBJECT('like_id', NEW.like_id, 'action_timestamp', NEW.created_at),
        NOW()
    );
END //
DELIMITER ;
```

---

## 4. Performance Indexes

Without indexes, PostgreSQL must perform costly Full Table Scans ($O(N)$). Indexes provide balanced B-Tree structures ($O(\log N)$) for fast key lookups, ordering, and foreign key traversals.

### 4.1 Index Definitions

```sql
-- 1. Accelerate Foreign Key Lookups (essential for JOIN performance)
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- 2. Accelerate Social Graph Edge Queries
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- 3. Accelerate Timeline and Feed Ordering
CREATE INDEX idx_posts_created_at_desc ON posts(created_at DESC);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 4. Unique Indexes (Created automatically by UNIQUE constraints)
-- users(username), users(email), likes(user_id, post_id), follows(follower_id, following_id)
```

### 4.2 Index Usage Demonstration (`EXPLAIN ANALYZE`)
```sql
EXPLAIN ANALYZE
SELECT * FROM posts WHERE user_id = 2 ORDER BY created_at DESC;
-- Plan uses 'Bitmap Index Scan on idx_posts_user_id' instead of Seq Scan
```

---

## 5. Database Transactions (ACID Compliance)

A **Transaction** is a unit of work performed within a database management system against a database. Transactions uphold **ACID** properties:
- **Atomicity**: All operations succeed, or none take effect.
- **Consistency**: The database transitions from one valid state to another valid state according to rules and constraints.
- **Isolation**: Concurrent transactions execute without cross-contamination.
- **Durability**: Committed data survives power loss or crashes.

### 5.1 Account Deletion Transaction Example
When a user requests account deletion, several dependent or associated operations must be bundled atomically. If any query fails, the entire transaction is rolled back.

```sql
BEGIN;

-- 1. Record final audit log before cascades
INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details)
VALUES ('USER_ACCOUNT_PURGE', 'users', 2, 2, '{"reason": "User requested account closure"}'::jsonb);

-- 2. Remove user follows explicitly (or rely on ON DELETE CASCADE)
DELETE FROM follows WHERE follower_id = 2 OR following_id = 2;

-- 3. Delete user's comments and likes
DELETE FROM comments WHERE user_id = 2;
DELETE FROM likes WHERE user_id = 2;

-- 4. Delete user's posts
DELETE FROM posts WHERE user_id = 2;

-- 5. Delete user account record
DELETE FROM users WHERE user_id = 2;

-- If any step raises a database error, run:
-- ROLLBACK;

-- If all steps succeed:
COMMIT;
```

---

## 6. Aggregate Functions & Grouping

PostgreSQL aggregate functions calculate a single summary result across sets of rows.

### 6.1 `COUNT()`, `GROUP BY`, and `HAVING`
Filter posts having more than 5 likes:

```sql
SELECT
    p.post_id,
    p.caption,
    COUNT(l.like_id) AS like_count
FROM posts p
JOIN likes l ON p.post_id = l.post_id
GROUP BY p.post_id, p.caption
HAVING COUNT(l.like_id) >= 5
ORDER BY like_count DESC;
```
*Difference between WHERE and HAVING*:
- `WHERE` filters rows **before** grouping.
- `HAVING` filters aggregated groups **after** aggregation.

### 6.2 Average Comments Per User Post
```sql
SELECT
    u.username,
    COUNT(c.comment_id) AS total_comments_received,
    COUNT(DISTINCT p.post_id) AS total_posts,
    ROUND(COUNT(c.comment_id)::NUMERIC / GREATEST(COUNT(DISTINCT p.post_id), 1), 2) AS avg_comments_per_post
FROM users u
JOIN posts p ON u.user_id = p.user_id
LEFT JOIN comments c ON p.post_id = c.post_id
GROUP BY u.user_id, u.username
ORDER BY avg_comments_per_post DESC;
```

---

## 7. Subqueries (Nested Queries)

SnapGrid demonstrates four categories of subqueries:

### 7.1 Scalar Subquery (Single Value in SELECT)
Calculates the global platform average likes per post alongside individual post likes:

```sql
SELECT
    p.post_id,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS post_likes,
    (SELECT ROUND(AVG(like_cnt), 2)
     FROM (SELECT COUNT(*) AS like_cnt FROM likes GROUP BY post_id) sub) AS platform_avg_likes
FROM posts p;
```

### 7.2 Subquery with `IN` (Users Who Have Never Posted)
Identifies lurker accounts that have not created any post content:

```sql
SELECT user_id, username, email
FROM users
WHERE user_id NOT IN (
    SELECT DISTINCT user_id FROM posts
);
```

### 7.3 Correlated Subquery (Latest Post Per User)
A correlated subquery references columns from the outer query:

```sql
SELECT u.username, p.post_id, p.caption, p.created_at
FROM users u
JOIN posts p ON u.user_id = p.user_id
WHERE p.created_at = (
    SELECT MAX(p2.created_at)
    FROM posts p2
    WHERE p2.user_id = u.user_id
);
```

### 7.4 Subquery in `FROM` Clause (Derived Table)
Computes engagement distribution across user tiers:

```sql
SELECT
    tier,
    COUNT(*) AS total_creators
FROM (
    SELECT
        user_id,
        CASE
            WHEN COUNT(post_id) >= 10 THEN 'Power Creator'
            WHEN COUNT(post_id) >= 3 THEN 'Regular Creator'
            ELSE 'Casual'
        END AS tier
    FROM posts
    GROUP BY user_id
) AS creator_tiers
GROUP BY tier;
```

---

## 8. Relational Integrity Constraints

Constraints enforce business logic and referential integrity directly at the DBMS engine layer.

| Constraint Type | SQL Example in SnapGrid | Enforcement & Purpose |
| :--- | :--- | :--- |
| **PRIMARY KEY** | `user_id SERIAL PRIMARY KEY` | Guarantees entity identity: unique and non-null for every record. |
| **FOREIGN KEY** | `user_id INT REFERENCES users(user_id) ON DELETE CASCADE` | Prevents orphaned child records; ensures every post/like references a valid user. |
| **UNIQUE** | `CONSTRAINT uq_user_post_like UNIQUE (user_id, post_id)` | Prevents duplicate actions (e.g., duplicate likes on the same post). |
| **NOT NULL** | `image_url TEXT NOT NULL` | Guarantees that mandatory application fields are never omitted. |
| **CHECK** | `CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)` | Enforces logical domain rules (e.g., users cannot follow themselves). |
| **DEFAULT** | `created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | Provides automatic fallback values when attributes are unspecified on INSERT. |
