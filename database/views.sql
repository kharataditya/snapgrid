-- ============================================================================
-- SnapGrid Database Views (MySQL Version)
-- Database Management System: MySQL 8.0+
-- Database Name: snapgrid_db
-- ============================================================================

USE snapgrid_db;

-- Drop views if they exist to allow clean creation
DROP VIEW IF EXISTS post_statistics;
DROP VIEW IF EXISTS user_statistics;

-- ============================================================================
-- VIEW: post_statistics
-- Consolidates post details with aggregated like count and comment count.
-- Uses isolated subqueries to prevent Cartesian product double-counting.
-- ============================================================================
CREATE OR REPLACE VIEW post_statistics AS
SELECT 
    p.post_id,
    p.user_id,
    u.username,
    u.full_name,
    p.image_url,
    p.caption,
    p.created_at,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) AS comment_count
FROM posts p
INNER JOIN users u ON p.user_id = u.user_id;

-- ============================================================================
-- VIEW: user_statistics
-- Aggregates metrics for each user: total posts, follower count, and following count.
-- Employs separate scalar subqueries to guarantee accurate metrics.
-- ============================================================================
CREATE OR REPLACE VIEW user_statistics AS
SELECT
    u.user_id,
    u.username,
    u.email,
    u.full_name,
    u.bio,
    u.profile_image_url,
    u.created_at,
    (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.user_id) AS post_count,
    (SELECT COUNT(*) FROM follows f1 WHERE f1.following_id = u.user_id) AS follower_count,
    (SELECT COUNT(*) FROM follows f2 WHERE f2.follower_id = u.user_id) AS following_count
FROM users u;
