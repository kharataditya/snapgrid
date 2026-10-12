# SnapGrid - Database Normalization Guide

This document presents a step-by-step academic walkthrough of database normalization for **SnapGrid**, starting from an unnormalized monolithic representation (UNF) through First Normal Form (1NF), Second Normal Form (2NF), and Third Normal Form (3NF).

---

## 1. Why Normalization Matters

In relational database design, **normalization** is the process of structuring attributes and relations to minimize data redundancy and avoid anomalies during data manipulation:
- **Insertion Anomaly**: Inability to record certain information without recording unrelated information.
- **Update Anomaly**: Inconsistencies caused by having to update the same fact in multiple rows.
- **Deletion Anomaly**: Unintentional loss of crucial data when deleting another piece of information.

---

## 2. Unnormalized Form (UNF)

Imagine an initial naive design where all application data is stored in a single flat spreadsheet or single monolithic table called `UNNORMALIZED_FEED`:

### UNF Monolithic Relation:
```text
UNNORMALIZED_FEED (
    user_id, username, email, full_name, bio,
    post_id, post_image_url, post_caption, post_created_at,
    liker_user_ids, comment_ids, commenter_user_ids, comments_text,
    following_user_ids
)
```

### Sample UNF Data:

| user_id | username | email | post_id | post_image_url | comments_text | liker_user_ids |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 101 | john_doe | john@ex.com | 501 | img1.jpg | {"Great shot!", "Awesome view"} | {102, 103} |
| 101 | john_doe | john@ex.com | 502 | img2.jpg | {"Love this!"} | {103} |
| 102 | jane_smith | jane@ex.com | NULL | NULL | NULL | NULL |

### Problems with UNF:
1. **Repeating groups & multi-valued attributes**: `comments_text` and `liker_user_ids` contain comma-separated or array values.
2. **Extreme Redundancy**: User details (`username`, `email`, `bio`) are repeated for every post created by that user.
3. **Severe Anomalies**:
   - *Insertion*: Cannot register a new user without creating a dummy post or filling post fields with `NULL`.
   - *Update*: If User 101 updates their email, every post row belonging to User 101 must be modified.
   - *Deletion*: If User 101 deletes their only post, their profile information could be accidentally lost.

---

## 3. First Normal Form (1NF)

### 1NF Definition:
A relation is in **1NF** if and only if:
1. Every attribute contains only **atomic** (indivisible) values.
2. There are no repeating groups or multi-valued columns.
3. Each record is uniquely identifiable by a Primary Key (often composite in flattened views).

### Transforming UNF to 1NF:
We flatten repeating groups so each cell contains exactly one value.

```text
FLAT_FEED_1NF (
    user_id, username, email, full_name, bio,
    post_id, post_image_url, post_caption, post_created_at,
    liker_user_id,
    comment_id, commenter_user_id, comment_text,
    following_user_id
)
```

**Composite Primary Key Candidate**: `{user_id, post_id, liker_user_id, comment_id, following_user_id}`

### 1NF Sample Table:

| user_id | username | post_id | liker_user_id | comment_id | comment_text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 101 | john_doe | 501 | 102 | 901 | Great shot! |
| 101 | john_doe | 501 | 103 | 901 | Great shot! |
| 101 | john_doe | 501 | 102 | 902 | Awesome view |
| 101 | john_doe | 501 | 103 | 902 | Awesome view |

### Identified Functional Dependencies (FDs):
1. `user_id -> username, email, full_name, bio`
2. `post_id -> user_id, post_image_url, post_caption, post_created_at`
3. `comment_id -> post_id, commenter_user_id, comment_text`
4. `{liker_user_id, post_id} -> like_created_at`
5. `{follower_user_id, following_user_id} -> follow_created_at`

### Why 1NF Still Fails:
Notice that `username` depends only on `user_id`, which is only **part** of the composite primary key. This is a **Partial Functional Dependency**.

---

## 4. Second Normal Form (2NF)

### 2NF Definition:
A relation is in **2NF** if and only if:
1. It is already in **1NF**.
2. No non-prime attribute is **partially dependent** on any candidate key (i.e., every non-prime attribute must be fully functionally dependent on the entire primary key).

### Eliminating Partial Dependencies:
We decompose `FLAT_FEED_1NF` by separating attributes that depend only on parts of the primary key into distinct relations:

1. **USERS_PARTIAL**:
   - `user_id -> username, email, full_name, bio`
   - Attributes moved: `user_id`, `username`, `email`, `full_name`, `bio`.

2. **POSTS_PARTIAL**:
   - `post_id -> user_id, post_image_url, post_caption, post_created_at`
   - Attributes moved: `post_id`, `user_id`, `image_url`, `caption`, `created_at`.

3. **LIKES_PARTIAL**:
   - `{user_id, post_id} -> created_at`
   - Key: `(user_id, post_id)`.

4. **COMMENTS_PARTIAL**:
   - `comment_id -> post_id, user_id, comment_text, created_at`
   - Key: `comment_id`.

5. **FOLLOWS_PARTIAL**:
   - `{follower_id, following_id} -> created_at`
   - Key: `(follower_id, following_id)`.

### Resulting 2NF Relations:
- `USERS (user_id, username, email, full_name, bio)`
- `POSTS (post_id, user_id, image_url, caption, created_at)`
- `LIKES (user_id, post_id, created_at)`
- `COMMENTS (comment_id, user_id, post_id, comment_text, created_at)`
- `FOLLOWS (follower_id, following_id, created_at)`

In this state, partial dependencies have been removed.

---

## 5. Third Normal Form (3NF)

### 3NF Definition:
A relation is in **3NF** if and only if:
1. It is already in **2NF**.
2. There are **no transitive dependencies** (i.e., non-prime attributes must not depend on other non-prime attributes: $X \to Y$ and $Y \to Z$ where $Z$ is non-prime and $Y$ is not a superkey).
   - Equivalently: For every functional dependency $X \to Y$, either $X$ is a superkey, or $Y$ is a prime attribute (part of a candidate key).

### Checking Transitive Dependencies in Our Relations:

#### Table `users`:
- Functional Dependencies:
  - `user_id -> username, email, password_hash, full_name, bio, profile_image_url, created_at`
  - `username -> user_id, email, password_hash, ...` (Candidate key)
  - `email -> user_id, username, password_hash, ...` (Candidate key)
- All determinants (`user_id`, `username`, `email`) are **Candidate Keys / Superkeys**.
- There are no dependencies between non-key attributes like `bio -> full_name`.
- &check; **users is in 3NF (and BCNF)**.

#### Table `posts`:
- Functional Dependencies:
  - `post_id -> user_id, image_url, caption, created_at`
- Determinant `post_id` is the primary key.
- Does `caption` determine `image_url`? No.
- &check; **posts is in 3NF (and BCNF)**.

#### Table `likes`:
- Functional Dependencies:
  - `{user_id, post_id} -> created_at`
- Determinant `{user_id, post_id}` is a candidate key.
- &check; **likes is in 3NF (and BCNF)**.

#### Table `comments`:
- Functional Dependencies:
  - `comment_id -> user_id, post_id, comment_text, created_at`
- Determinant `comment_id` is the primary key.
- &check; **comments is in 3NF (and BCNF)**.

#### Table `follows`:
- Functional Dependencies:
  - `{follower_id, following_id} -> created_at`
- Determinant `{follower_id, following_id}` is a candidate key.
- &check; **follows is in 3NF (and BCNF)**.

---

## 6. Boyce-Codd Normal Form (BCNF) Verification

A relation is in **BCNF** if for every non-trivial functional dependency $X \to Y$, $X$ is a **superkey**.

- In `users`: `user_id`, `username`, and `email` are all superkeys.
- In `posts`: `post_id` is a superkey.
- In `likes`: `like_id` and `(user_id, post_id)` are superkeys.
- In `comments`: `comment_id` is a superkey.
- In `follows`: `follow_id` and `(follower_id, following_id)` are superkeys.

Hence, every relation in the SnapGrid core schema satisfies **BCNF**.

---

## 7. Normalization Summary Matrix

| Form | Requirement | How SnapGrid Satisfies It |
| :--- | :--- | :--- |
| **1NF** | Atomic values, no repeating groups | Multi-valued comments, likes, and follow lists are decoupled into their own records with atomic fields. |
| **2NF** | In 1NF + No partial dependencies | Attributes dependent on subsets of composite keys are moved to respective independent tables (`users`, `posts`, `likes`, `comments`, `follows`). |
| **3NF** | In 2NF + No transitive dependencies | Non-key attributes depend solely on the primary key, avoiding indirect functional dependencies. |
| **BCNF** | Every determinant is a superkey | All functional determinants throughout every relation constitute candidate keys. |

### Practical Benefits Achieved:
- **Zero Redundancy**: User details exist in exactly one row.
- **Data Integrity**: Updates to a user profile take effect instantly platform-wide.
- **Clean Relational Joins**: Expressive SQL joins provide feeds, stats, and graphs on-demand without data bloat.
