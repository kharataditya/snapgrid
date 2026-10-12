-- ============================================================================
-- SnapGrid Database Triggers (MySQL Version)
-- Database Management System: MySQL 8.0+
-- Database Name: snapgrid_db
-- ============================================================================

USE snapgrid_db;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trg_log_post_created;
DROP TRIGGER IF EXISTS trg_log_post_deleted;
DROP TRIGGER IF EXISTS trg_log_like_created;
DROP TRIGGER IF EXISTS trg_log_like_deleted;
DROP TRIGGER IF EXISTS trg_prevent_self_follow;

-- ============================================================================
-- 1. TRIGGER: trg_log_post_created
-- Logs post creation events automatically into activity_logs
-- ============================================================================
DELIMITER //
CREATE TRIGGER trg_log_post_created
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (
        action,
        entity_type,
        entity_id,
        user_id,
        details,
        created_at
    )
    VALUES (
        'POST_CREATED',
        'post',
        NEW.post_id,
        NEW.user_id,
        JSON_OBJECT(
            'caption', NEW.caption,
            'image_url', NEW.image_url,
            'posted_at', NEW.created_at
        ),
        NOW()
    );
END //
DELIMITER ;

-- ============================================================================
-- 2. TRIGGER: trg_log_post_deleted
-- Logs post deletion events into activity_logs
-- ============================================================================
DELIMITER //
CREATE TRIGGER trg_log_post_deleted
AFTER DELETE ON posts
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (
        action,
        entity_type,
        entity_id,
        user_id,
        details,
        created_at
    )
    VALUES (
        'POST_DELETED',
        'post',
        OLD.post_id,
        OLD.user_id,
        JSON_OBJECT(
            'caption', OLD.caption,
            'image_url', OLD.image_url,
            'deleted_at', NOW()
        ),
        NOW()
    );
END //
DELIMITER ;

-- ============================================================================
-- 3. TRIGGER: trg_log_like_created
-- Logs post like events into activity_logs
-- ============================================================================
DELIMITER //
CREATE TRIGGER trg_log_like_created
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (
        action,
        entity_type,
        entity_id,
        user_id,
        details,
        created_at
    )
    VALUES (
        'LIKE_POST',
        'post',
        NEW.post_id,
        NEW.user_id,
        JSON_OBJECT(
            'like_id', NEW.like_id,
            'action_timestamp', NEW.created_at
        ),
        NOW()
    );
END //
DELIMITER ;

-- ============================================================================
-- 4. TRIGGER: trg_log_like_deleted
-- Logs post unlike events into activity_logs
-- ============================================================================
DELIMITER //
CREATE TRIGGER trg_log_like_deleted
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (
        action,
        entity_type,
        entity_id,
        user_id,
        details,
        created_at
    )
    VALUES (
        'UNLIKE_POST',
        'post',
        OLD.post_id,
        OLD.user_id,
        JSON_OBJECT(
            'like_id', OLD.like_id,
            'action_timestamp', NOW()
        ),
        NOW()
    );
END //
DELIMITER ;

-- ============================================================================
-- 5. TRIGGER: trg_prevent_self_follow
-- Enforces self-follow prevention integrity rule in MySQL InnoDB
-- ============================================================================
DELIMITER //
CREATE TRIGGER trg_prevent_self_follow
BEFORE INSERT ON follows
FOR EACH ROW
BEGIN
    IF NEW.follower_id = NEW.following_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity constraint violated: Users cannot follow themselves';
    END IF;
END //
DELIMITER ;

