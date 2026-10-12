# SnapGrid - Quality Assurance & Manual Test Plan

This test matrix outlines end-to-end and database-level manual test cases for the **SnapGrid** platform.
All test cases are initially set to **`Not Yet Tested`** for execution by test engineers or students during lab evaluation.

---

## 1. Test Summary

- **Total Test Cases**: 25
- **Coverage**:
  - Authentication & JWT Authorization (TC01 - TC05)
  - Post Management & CRUD (TC06 - TC08)
  - Social Interactions: Likes & Comments (TC09 - TC12)
  - Social Graph: Follow / Unfollow (TC13 - TC15)
  - Database Constraints & Integrity Checks (TC16 - TC20)
  - Database Views & Aggregates (TC21 - TC22)
  - Database Triggers & Audit Logging (TC23 - TC24)
  - ACID Transactions (TC25)

---

## 2. Test Execution Matrix

| Test ID | Module / Feature | Test Description | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | User Auth | Successful user registration | 1. Send `POST /api/auth/register` with unique username & email.<br>2. Supply valid password. | HTTP 201 Created; returns JWT token and sanitized user object (no password_hash). | **Not Yet Tested** |
| **TC-AUTH-02** | User Auth | Registration duplicate email rejection | 1. Attempt `POST /api/auth/register` with `john@example.com` (already registered). | HTTP 400 or 409 Conflict; error message indicating email already in use. | **Not Yet Tested** |
| **TC-AUTH-03** | User Auth | Registration duplicate username rejection | 1. Attempt `POST /api/auth/register` with existing username `john_doe`. | HTTP 400 or 409 Conflict; error message indicating username taken. | **Not Yet Tested** |
| **TC-AUTH-04** | User Auth | Successful user login | 1. Send `POST /api/auth/login` with `john@example.com` & `password123`. | HTTP 200 OK; returns valid JWT token and user profile object. | **Not Yet Tested** |
| **TC-AUTH-05** | User Auth | Login with incorrect password | 1. Send `POST /api/auth/login` with `john@example.com` & `wrongpass`. | HTTP 401 Unauthorized; message indicating invalid credentials. | **Not Yet Tested** |
| **TC-AUTH-06** | Authorization | Protected endpoint without token | 1. Send `GET /api/auth/me` without `Authorization` header. | HTTP 401 Unauthorized; message indicating token missing. | **Not Yet Tested** |
| **TC-POST-07** | Posts | Create post with valid payload | 1. Log in as user 1.<br>2. Send `POST /api/posts` with valid `image_url` and `caption`. | HTTP 201 Created; new post record created with `user_id = 1`. | **Not Yet Tested** |
| **TC-POST-08** | Posts | Create post missing required image | 1. Send `POST /api/posts` with `{ "caption": "Missing image" }`. | HTTP 400 Bad Request; validation failure for required `image_url`. | **Not Yet Tested** |
| **TC-POST-09** | Posts | Unauthorized post deletion | 1. Log in as user 2 (`jane@example.com`).<br>2. Attempt `DELETE /api/posts/:id` for post belonging to user 1. | HTTP 403 Forbidden; user cannot delete content belonging to another user. | **Not Yet Tested** |
| **TC-POST-10** | Posts | Authorized post deletion & cascade | 1. Log in as post owner.<br>2. Send `DELETE /api/posts/:id`. | HTTP 200 OK; post deleted; associated likes and comments cascade deleted. | **Not Yet Tested** |
| **TC-LIKE-11** | Likes | Toggle like on a post | 1. User 1 calls `POST /api/posts/2/like`. | HTTP 200 OK; action returns "liked" and `likes_count` increases by 1. | **Not Yet Tested** |
| **TC-LIKE-12** | Likes | Toggle unlike on an already liked post | 1. User 1 calls `POST /api/posts/2/like` again. | HTTP 200 OK; action returns "unliked" and `likes_count` decreases by 1. | **Not Yet Tested** |
| **TC-COMM-13** | Comments | Add comment to post | 1. Send `POST /api/posts/1/comments` with non-empty `comment_text`. | HTTP 201 Created; comment added and returned with author information. | **Not Yet Tested** |
| **TC-COMM-14** | Comments | Reject empty comment | 1. Send `POST /api/posts/1/comments` with `{ "comment_text": "" }`. | HTTP 400 Bad Request; validation indicates comment text cannot be blank. | **Not Yet Tested** |
| **TC-COMM-15** | Comments | Delete comment authorization | 1. User 3 attempts `DELETE /api/comments/:id` for comment authored by User 2. | HTTP 403 Forbidden; non-author cannot delete comment. | **Not Yet Tested** |
| **TC-FOL-16** | Follows | Follow another user | 1. User 1 calls `POST /api/users/2/follow`. | HTTP 200 OK; follow record inserted; User 2 followers count increases. | **Not Yet Tested** |
| **TC-FOL-17** | Follows | Unfollow user | 1. User 1 calls `POST /api/users/2/follow` a second time. | HTTP 200 OK; follow record removed; User 2 followers count decreases. | **Not Yet Tested** |
| **TC-CST-18** | Constraints | Self-follow CHECK constraint | 1. User 1 attempts `POST /api/users/1/follow` (or direct SQL `INSERT INTO follows(follower_id, following_id) VALUES (1, 1)`). | Database raises `check_violation` (CHECK constraint `follower_id != following_id`). | **Not Yet Tested** |
| **TC-CST-19** | Constraints | Duplicate like UNIQUE constraint | 1. Directly insert duplicate like via SQL: `INSERT INTO likes(user_id, post_id) VALUES (1, 10);` twice. | Second query fails with `unique_violation` on `(user_id, post_id)`. | **Not Yet Tested** |
| **TC-CST-20** | Constraints | Foreign key constraint on non-existent post | 1. Send SQL `INSERT INTO likes(user_id, post_id) VALUES (1, 999999);`. | Query fails with `foreign_key_violation` (`post_id` does not exist in `posts`). | **Not Yet Tested** |
| **TC-VIEW-21** | Views | Verify `post_statistics` view computation | 1. Like post 1 with 2 different users.<br>2. Query `SELECT total_likes FROM post_statistics WHERE post_id = 1;`. | `total_likes` matches 2 without requiring manual table calculation. | **Not Yet Tested** |
| **TC-VIEW-22** | Views | Verify `user_statistics` view computation | 1. Query `SELECT * FROM user_statistics WHERE user_id = 1;`. | Correct counts for `post_count`, `followers_count`, and `following_count` match underlying tables. | **Not Yet Tested** |
| **TC-TRG-23** | Triggers | Verify `activity_logs` on post creation | 1. Insert post via API.<br>2. Query `SELECT * FROM activity_logs WHERE action = 'CREATE_POST' ORDER BY log_id DESC LIMIT 1;`. | Audit record is automatically generated with matching `entity_id` and `user_id`. | **Not Yet Tested** |
| **TC-TRG-24** | Triggers | Verify `activity_logs` on post deletion | 1. Delete post via API.<br>2. Query `SELECT * FROM activity_logs WHERE action = 'DELETE_POST' ORDER BY log_id DESC LIMIT 1;`. | Audit record is automatically logged with `action = 'DELETE_POST'`. | **Not Yet Tested** |
| **TC-TXN-25** | Transactions | User deletion transaction atomicity | 1. Start explicit transaction `BEGIN;`<br>2. Delete user and related records.<br>3. Simulate simulated failure before commit.<br>4. Run `ROLLBACK;`. | All records remain intact in database; state remains consistent. | **Not Yet Tested** |

---

## 3. Test Execution Guidelines

1. **Prerequisite**: Ensure PostgreSQL is running and seed data has been imported (`seed.sql`).
2. **Environment**: Test against `http://localhost:5000` with PostgreSQL 15+.
3. **Execution**:
   - For API routes, use Postman collection or terminal `curl` commands.
   - For database constraint and trigger tests, use `psql` or pgAdmin query tool.
   - Update the status column to `PASS` or `FAIL` with tester initials upon execution.
