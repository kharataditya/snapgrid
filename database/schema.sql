-- ============================================================================
-- SnapGrid Database Schema (MySQL Version)
-- Database Management System: MySQL 8.0+
-- Database Name: snapgrid_db
-- ============================================================================

CREATE DATABASE IF NOT EXISTS snapgrid_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE snapgrid_db;

-- Disable foreign key checks for clean teardown & recreation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TABLE: users
-- Stores registered user accounts and profile information
-- ============================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NULL,
    bio TEXT NULL,
    profile_image_url TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: posts
-- Stores user posts containing image URLs, captions, and publication timestamps
-- ============================================================================
CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_posts_user_id (user_id),
    INDEX idx_posts_created_at (created_at DESC),
    INDEX idx_posts_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: likes
-- Records likes on posts by users. Unique constraint ensures one like per post per user.
-- ============================================================================
CREATE TABLE likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_post_like UNIQUE (user_id, post_id),
    CONSTRAINT fk_likes_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_likes_post
        FOREIGN KEY (post_id) REFERENCES posts(post_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_likes_post_id (post_id),
    INDEX idx_likes_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: comments
-- Stores comments posted by users on posts
-- ============================================================================
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id) REFERENCES posts(post_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_comments_post_created (post_id, created_at ASC),
    INDEX idx_comments_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: follows
-- Records unidirectional follower-following social graph connections
-- ============================================================================
CREATE TABLE follows (
    follow_id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT fk_follows_follower
        FOREIGN KEY (follower_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_follows_following
        FOREIGN KEY (following_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_follows_follower (follower_id),
    INDEX idx_follows_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: activity_logs
-- Audit log table populated automatically by database triggers
-- ============================================================================
CREATE TABLE activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    user_id INT NULL,
    details JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_activity_created (created_at DESC),
    INDEX idx_activity_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
