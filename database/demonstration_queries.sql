-- ============================================================================
-- SnapGrid Database Demonstration Queries (MySQL Version)
-- Database Management System: MySQL 8.0+
-- Database Name: snapgrid_db
-- ============================================================================
-- This script contains 31 structured queries demonstrating core DBMS concepts:
-- 1. DML Operations (INSERT, SELECT, UPDATE, DELETE)
-- 2. Single & Multi-Table Joins (INNER JOIN, LEFT JOIN)
-- 3. Aggregations & Grouping (COUNT, GROUP BY, HAVING)
-- 4. Subqueries & Set Operations (Correlated, Scalar, NOT EXISTS, IN)
-- 5. Views Utilization (post_statistics, user_statistics)
-- 6. Index & Catalog Introspection (SHOW INDEX, information_schema)
-- 7. Transaction Integrity & ACID Guarantees (START TRANSACTION, COMMIT, ROLLBACK)
-- 8. Relational Constraint Validations (Unique, Check, Foreign Key)
-- 9. Trigger & Audit Log Validations (Posts and Likes trigger executions)
-- ============================================================================

USE snapgrid_db;

-- ============================================================================
-- SECTION 1: BASIC CRUD & DML OPERATIONS
-- ============================================================================

-- QUERY 01: INSERT - Register a new user
-- Purpose: Inserts a new user record with standard fields and hashed password.
-- Expected Output: 1 row affected; user inserted with auto-increment ID.
INSERT INTO users (username, email, password_hash, full_name, bio, profile_image_url)
VALUES (
    'lucas_lens', 
    'lucas@example.com', 
    '$2b$10$rICGjKcKMYrrmJqOFcSUzuXJwDm0K/0BsXoSTECnl1GO.S5HLCJxG', 
    'Lucas Vance', 
    'Street and portrait photographer based in NYC 📸', 
    'https://picsum.photos/seed/lucas_profile/150'
);
SELECT LAST_INSERT_ID() AS new_user_id;


-- QUERY 02: INSERT - Create a new post for an existing user
-- Purpose: Creates a new post associated with a foreign key user_id.
-- Expected Output: 1 row affected with auto-increment post_id.
INSERT INTO posts (user_id, image_url, caption)
VALUES (
    1, 
    'https://picsum.photos/seed/post_alpine_lake/600/600', 
    'Crystal clear reflections in the alpine lake at high altitude 🏞️'
);
SELECT LAST_INSERT_ID() AS new_post_id;


-- QUERY 03: SELECT with Filtering, Pattern Matching, and Sorting
-- Purpose: Retrieves users whose bio mentions photography or design, ordered alphabetically.
-- Expected Output: Rows matching keyword filters.
SELECT 
    user_id, 
    username, 
    full_name, 
    bio 
FROM users
WHERE bio LIKE '%photograph%' OR bio LIKE '%design%'
ORDER BY username ASC;


-- QUERY 04: UPDATE - Edit user profile details
-- Purpose: Updates bio and full name for a specific user using primary key filter.
-- Expected Output: 1 row affected.
UPDATE users
SET 
    bio = 'Senior distributed systems engineer | Linux, Rust & specialty coffee ☕',
    full_name = 'Daniel K. Foster'
WHERE user_id = 12;

SELECT user_id, username, full_name, bio FROM users WHERE user_id = 12;


-- QUERY 05: UPDATE - Edit post caption
-- Purpose: Modifies the caption of a specific post while maintaining created_at timestamp.
-- Expected Output: 1 row affected.
UPDATE posts
SET caption = 'Sunrise over the ridge (Updated: captured on 24mm prime lens) 🏔️✨'
WHERE post_id = 1;

SELECT post_id, caption FROM posts WHERE post_id = 1;


-- QUERY 06: DELETE - Delete a specific comment
-- Purpose: Removes a single comment by primary key.
-- Expected Output: 1 row affected.
DELETE FROM comments
WHERE comment_id = 22;

SELECT COUNT(*) AS remaining_comments_on_post_23 FROM comments WHERE post_id = 23;


-- QUERY 07: DELETE with Foreign Key Cascade
-- Purpose: Demonstrates ON DELETE CASCADE - deleting post 25 automatically cascades
--          to delete its associated likes and comments.
-- Expected Output: Post removed; likes and comments referencing post 25 become 0.
DELETE FROM posts
WHERE post_id = 25;

SELECT 
    (SELECT COUNT(*) FROM posts WHERE post_id = 25) AS post_25_exists,
    (SELECT COUNT(*) FROM likes WHERE post_id = 25) AS orphaned_likes_count,
    (SELECT COUNT(*) FROM comments WHERE post_id = 25) AS orphaned_comments_count;


-- ============================================================================
-- SECTION 2: SQL JOINS (INNER JOIN, LEFT JOIN, MULTI-TABLE JOINS)
-- ============================================================================

-- QUERY 08: INNER JOIN - Posts with Author Details
-- Purpose: Combines posts with user metadata for feed display.
-- Expected Output: Post records with corresponding author username and profile photo.
SELECT 
    p.post_id,
    p.caption,
    p.image_url,
    p.created_at,
    u.user_id AS author_id,
    u.username AS author_username,
    u.profile_image_url AS author_avatar
FROM posts p
INNER JOIN users u ON p.user_id = u.user_id
ORDER BY p.created_at DESC
LIMIT 5;


-- QUERY 09: LEFT JOIN - Find users who have never created any posts
-- Purpose: Demonstrates LEFT JOIN with NULL check to identify inactive creators.
-- Expected Output: Users whose posts.post_id IS NULL.
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.created_at
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
WHERE p.post_id IS NULL;


-- QUERY 10: Multi-Table INNER JOIN - Comment thread with commenter & post author
-- Purpose: Joins comments, users (commenter), posts, and users (author) to assemble a rich thread.
-- Expected Output: Comments showing commenter username and original post author username.
SELECT 
    c.comment_id,
    c.comment_text,
    c.created_at AS commented_at,
    commenter.username AS commented_by,
    p.post_id,
    author.username AS post_author
FROM comments c
INNER JOIN users commenter ON c.user_id = commenter.user_id
INNER JOIN posts p ON c.post_id = p.post_id
INNER JOIN users author ON p.user_id = author.user_id
WHERE p.post_id = 1
ORDER BY c.created_at ASC;


-- QUERY 11: Multi-Table Feed Query for Logged-In User (User ID = 1)
-- Purpose: Core application query - retrieves posts authored by users that user 1 follows,
--          plus user 1's own posts, with live like counts, comment counts, and like state.
-- Expected Output: Chronological feed for user 1.
SELECT 
    p.post_id,
    p.caption,
    p.image_url,
    p.created_at,
    u.username,
    u.profile_image_url,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) AS comment_count,
    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.post_id AND l.user_id = 1) AS is_liked_by_me
FROM posts p
INNER JOIN users u ON p.user_id = u.user_id
WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = 1)
   OR p.user_id = 1
ORDER BY p.created_at DESC, p.post_id DESC
LIMIT 10;


-- ============================================================================
-- SECTION 3: AGGREGATE FUNCTIONS, GROUP BY & HAVING
-- ============================================================================

-- QUERY 12: Aggregate - Total posts per user (COUNT & GROUP BY)
-- Purpose: Calculates post count per user, sorted by highest post volume.
-- Expected Output: Users sorted by post count descending.
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    COUNT(p.post_id) AS total_posts
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
GROUP BY u.user_id, u.username, u.full_name
ORDER BY total_posts DESC, u.username ASC;


-- QUERY 13: HAVING Clause - Active creators with 3 or more posts
-- Purpose: Filters grouped results using HAVING to identify high-volume contributors.
-- Expected Output: Users having COUNT(p.post_id) >= 3.
SELECT 
    u.user_id,
    u.username,
    COUNT(p.post_id) AS post_count
FROM users u
INNER JOIN posts p ON u.user_id = p.user_id
GROUP BY u.user_id, u.username
HAVING COUNT(p.post_id) >= 3
ORDER BY post_count DESC;


-- QUERY 14: Top 5 Most-Liked Posts across the platform
-- Purpose: Groups likes by post_id and retrieves the top 5 most engaged posts.
-- Expected Output: Top 5 post IDs with like counts.
SELECT 
    p.post_id,
    p.caption,
    u.username AS author,
    COUNT(l.like_id) AS total_likes
FROM posts p
INNER JOIN users u ON p.user_id = u.user_id
LEFT JOIN likes l ON p.post_id = l.post_id
GROUP BY p.post_id, p.caption, u.username
ORDER BY total_likes DESC, p.post_id ASC
LIMIT 5;


-- QUERY 15: Total Likes Received by Each User across all their posts
-- Purpose: Aggregate engagement per creator.
-- Expected Output: Creators ranked by sum of likes on their collective posts.
SELECT 
    u.user_id,
    u.username,
    COUNT(l.like_id) AS total_likes_received
FROM users u
INNER JOIN posts p ON u.user_id = p.user_id
LEFT JOIN likes l ON p.post_id = l.post_id
GROUP BY u.user_id, u.username
ORDER BY total_likes_received DESC;


-- QUERY 16: HAVING Filter - Posts with High Engagement (>= 4 likes)
-- Purpose: Uses HAVING to filter for posts achieving a specific engagement threshold.
-- Expected Output: High engagement posts.
SELECT 
    p.post_id,
    p.caption,
    COUNT(l.like_id) AS like_count
FROM posts p
INNER JOIN likes l ON p.post_id = l.post_id
GROUP BY p.post_id, p.caption
HAVING COUNT(l.like_id) >= 4
ORDER BY like_count DESC;


-- ============================================================================
-- SECTION 4: SUBQUERIES & ANALYTICAL QUERIES
-- ============================================================================

-- QUERY 17: Subquery - Posts with above-average likes
-- Purpose: Demonstrates scalar subquery inside HAVING / WHERE.
-- Expected Output: Posts whose like count exceeds platform average.
SELECT 
    p.post_id,
    p.caption,
    COUNT(l.like_id) AS likes_count
FROM posts p
INNER JOIN likes l ON p.post_id = l.post_id
GROUP BY p.post_id, p.caption
HAVING COUNT(l.like_id) > (
    SELECT AVG(like_count)
    FROM (
        SELECT COUNT(like_id) AS like_count
        FROM posts p2
        LEFT JOIN likes l2 ON p2.post_id = l2.post_id
        GROUP BY p2.post_id
    ) AS avg_table
)
ORDER BY likes_count DESC;


-- QUERY 18: Subquery - Users with more followers than platform average
-- Purpose: Compares individual follower counts against the average.
-- Expected Output: Users with above-average follower count.
SELECT 
    u.user_id,
    u.username,
    COUNT(f.follower_id) AS follower_count
FROM users u
INNER JOIN follows f ON u.user_id = f.following_id
GROUP BY u.user_id, u.username
HAVING COUNT(f.follower_id) > (
    SELECT AVG(f_cnt)
    FROM (
        SELECT COUNT(follower_id) AS f_cnt
        FROM users u2
        LEFT JOIN follows f2 ON u2.user_id = f2.following_id
        GROUP BY u2.user_id
    ) AS follower_avg
)
ORDER BY follower_count DESC;


-- QUERY 19: Correlated Subquery with NOT EXISTS - Users with zero likes given
-- Purpose: Finds users who have never liked any post using NOT EXISTS.
-- Expected Output: Users with no rows in the likes table.
SELECT 
    u.user_id, 
    u.username, 
    u.full_name
FROM users u
WHERE NOT EXISTS (
    SELECT 1 
    FROM likes l 
    WHERE l.user_id = u.user_id
);


-- QUERY 20: IN Subquery - Users followed by user 1
-- Purpose: Retrieves profile details of all accounts that user 1 follows.
-- Expected Output: List of creators followed by user 1.
SELECT 
    user_id, 
    username, 
    full_name, 
    bio
FROM users
WHERE user_id IN (
    SELECT following_id 
    FROM follows 
    WHERE follower_id = 1
)
ORDER BY username ASC;


-- QUERY 21: Window Function - DENSE_RANK() of creators by post count
-- Purpose: Uses MySQL 8.0 window functions to rank creators by activity.
-- Expected Output: Ranked creator standings.
SELECT 
    u.username,
    COUNT(p.post_id) AS post_count,
    DENSE_RANK() OVER (ORDER BY COUNT(p.post_id) DESC) AS activity_rank
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
GROUP BY u.user_id, u.username
ORDER BY activity_rank ASC, u.username ASC;


-- ============================================================================
-- SECTION 5: DATABASE VIEWS UTILIZATION
-- ============================================================================

-- QUERY 22: Query View - post_statistics
-- Purpose: Inspects post details with like and comment counts computed by the view.
-- Expected Output: Aggregated post statistics.
SELECT 
    post_id,
    username,
    LEFT(caption, 40) AS short_caption,
    like_count,
    comment_count
FROM post_statistics
ORDER BY like_count DESC, comment_count DESC
LIMIT 5;


-- QUERY 23: Query View - user_statistics
-- Purpose: Evaluates comprehensive user metrics (posts, followers, following) from the view.
-- Expected Output: Platform social graph summary per user.
SELECT 
    username,
    full_name,
    post_count,
    follower_count,
    following_count
FROM user_statistics
ORDER BY follower_count DESC, post_count DESC
LIMIT 8;


-- ============================================================================
-- SECTION 6: INDEX & METADATA INTROSPECTION
-- ============================================================================

-- QUERY 24: Inspect Table Indexes on posts
-- Purpose: Verifies index creation on the posts table for performance optimization.
-- Expected Output: Primary key, foreign keys, and created_at index details.
SHOW INDEX FROM posts;


-- QUERY 25: Inspect Relational Table Constraints via information_schema
-- Purpose: Introspects foreign key and unique constraints in MySQL.
-- Expected Output: Registered constraints in snapgrid_db.
SELECT 
    TABLE_NAME, 
    CONSTRAINT_NAME, 
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'snapgrid_db'
ORDER BY TABLE_NAME, CONSTRAINT_NAME;


-- ============================================================================
-- SECTION 7: TRANSACTION INTEGRITY & ACID DEMONSTRATION
-- ============================================================================

-- QUERY 26: Successful Multi-Table Transaction (COMMIT)
-- Purpose: Demonstrates atomic operations - creating a post and an immediate like.
-- Expected Output: Both operations succeed atomically.
START TRANSACTION;

INSERT INTO posts (user_id, image_url, caption)
VALUES (2, 'https://picsum.photos/seed/tx_test_commit/600/600', 'Transaction test post - commit demonstration');

-- Like the post using LAST_INSERT_ID()
INSERT INTO likes (user_id, post_id)
VALUES (2, LAST_INSERT_ID());

COMMIT;

SELECT p.post_id, p.caption, COUNT(l.like_id) AS likes
FROM posts p
LEFT JOIN likes l ON p.post_id = l.post_id
WHERE p.caption LIKE 'Transaction test post - commit%'
GROUP BY p.post_id, p.caption;


-- QUERY 27: Transaction Rollback Demonstration (ROLLBACK)
-- Purpose: Demonstrates atomicity failure handling - rolling back all uncommitted changes.
-- Expected Output: Post is NOT created after ROLLBACK.
START TRANSACTION;

INSERT INTO posts (user_id, image_url, caption)
VALUES (2, 'https://picsum.photos/seed/tx_test_rollback/600/600', 'This post should be discarded by rollback');

-- Revert entire transaction
ROLLBACK;

SELECT COUNT(*) AS should_be_zero
FROM posts
WHERE caption = 'This post should be discarded by rollback';


-- ============================================================================
-- SECTION 8: RELATIONAL CONSTRAINT VIOLATION TESTS
-- ============================================================================

-- QUERY 28: Constraint Violation - Duplicate Like Prevention
-- Purpose: Verifies UNIQUE(user_id, post_id) constraint rejects duplicate likes.
-- Note: Running this duplicate insert will trigger MySQL Error 1062: Duplicate entry.
-- INSERT INTO likes (user_id, post_id) VALUES (2, 1); -- Will fail: user 2 already liked post 1


-- QUERY 29: Constraint Violation - Self-Follow Prevention
-- Purpose: Verifies CHECK(follower_id != following_id) constraint.
-- Note: Running this insert will trigger MySQL Error 3819: Check constraint 'chk_no_self_follow' is violated.
-- INSERT INTO follows (follower_id, following_id) VALUES (1, 1); -- Will fail: self-follow


-- ============================================================================
-- SECTION 9: DATABASE TRIGGER & AUDIT LOG VALIDATION
-- ============================================================================

-- QUERY 30: Trigger Validation - Post Creation Audit
-- Purpose: Verifies that inserting a post fires trg_log_post_created.
-- Expected Output: A new row in activity_logs with action = 'POST_CREATED'.
INSERT INTO posts (user_id, image_url, caption)
VALUES (1, 'https://picsum.photos/seed/trigger_test_image/600/600', 'Testing automatic audit trigger logging');

SELECT 
    log_id, 
    action, 
    entity_type, 
    entity_id, 
    user_id, 
    details, 
    created_at
FROM activity_logs
WHERE action = 'POST_CREATED'
ORDER BY created_at DESC
LIMIT 1;


-- QUERY 31: Trigger Validation - Post Deletion Audit
-- Purpose: Verifies that deleting a post fires trg_log_post_deleted.
-- Expected Output: A row in activity_logs with action = 'POST_DELETED'.
DELETE FROM posts
WHERE caption = 'Testing automatic audit trigger logging';

SELECT 
    log_id, 
    action, 
    entity_type, 
    entity_id, 
    user_id, 
    details, 
    created_at
FROM activity_logs
WHERE action = 'POST_DELETED'
ORDER BY created_at DESC
LIMIT 1;
