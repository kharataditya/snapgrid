# SnapGrid - DBMS Viva Voce Preparation Guide (25+ Q&A)

This document contains 28 essential Database Management Systems (DBMS) questions with concise, technically accurate answers tailored for second-year CSE university oral exams (Viva Voce) and lab demonstrations.

---

### Q1: What is an Entity-Relationship (ER) diagram, and what are its key components?
**A:** An ER diagram is a high-level conceptual data model that illustrates entities within a system and relationships between them. Key components are:
- **Entities**: Objects or concepts (represented as rectangles, e.g., `USERS`, `POSTS`).
- **Attributes**: Properties of entities (represented as ovals, e.g., `username`, `caption`).
- **Relationships**: Associations between entities (represented as diamonds, e.g., "likes", "follows").
- **Cardinality ratios**: 1:1, 1:N, or M:N mappings.

---

### Q2: What is Cardinality, and how is it resolved in SnapGrid for a Many-to-Many (M:N) relationship?
**A:** Cardinality defines the numerical relationship between occurrences of entities on both sides. A user can like many posts, and a post can be liked by many users (M:N). Relational DBMS engines cannot directly link M:N tables without redundancy; it is resolved by creating an **associative/junction table** (`likes`) having foreign keys to both parent tables: `user_id` and `post_id`.

---

### Q3: What is the purpose of database normalization?
**A:** Normalization is the systematic technique of organizing data into relations to eliminate data redundancy and prevent insertion, update, and deletion anomalies while maintaining data integrity.

---

### Q4: Explain the differences between 1NF, 2NF, and 3NF.
**A:**
- **1NF (First Normal Form)**: Requires all column values to be atomic (indivisible) and eliminates repeating groups or arrays.
- **2NF (Second Normal Form)**: Must be in 1NF and have **no partial dependencies** (every non-prime attribute must depend on the entire primary key, not a subset).
- **3NF (Third Normal Form)**: Must be in 2NF and have **no transitive dependencies** (non-prime attributes must not depend on other non-prime attributes).

---

### Q5: What is Boyce-Codd Normal Form (BCNF)? Is SnapGrid in BCNF?
**A:** BCNF is a stricter version of 3NF. A relation is in BCNF if for every functional dependency $X \to Y$, the determinant $X$ is a **superkey**. Yes, SnapGrid is in BCNF because in every relation (`users`, `posts`, `likes`, `comments`, `follows`), all determinants (`user_id`, `post_id`, `comment_id`, composite keys) are candidate keys or superkeys.

---

### Q6: What is a Functional Dependency?
**A:** A functional dependency $X \to Y$ is a constraint between two attribute sets where the value of $X$ uniquely determines the value of $Y$. For example, in SnapGrid, `user_id -> email, username`.

---

### Q7: What is the difference between an INNER JOIN and a LEFT JOIN?
**A:**
- **INNER JOIN** returns only matching rows that satisfy the join condition in both tables. Non-matching rows are omitted.
- **LEFT JOIN** returns all rows from the left table, matched with corresponding rows from the right table. If no match exists, columns from the right table are filled with `NULL`.

---

### Q8: When would you choose a LEFT JOIN over an INNER JOIN in SnapGrid?
**A:** When generating profile statistics or user lists where we need to display all users, including those who have never published a post or received a follower. An `INNER JOIN` would filter out inactive or newly registered users having zero posts.

---

### Q9: What is a Database View, and why did you use views in SnapGrid?
**A:** A view is a virtual table defined by a SQL query that does not store data itself (unless materialized). In SnapGrid, we created `post_statistics` and `user_statistics` to:
1. Simplify complex aggregation queries for the backend.
2. Ensure consistent metrics computation (like counts, follower counts).
3. Provide an abstraction layer preventing client queries from directly executing complex joins repeatedly.

---

### Q10: What is a Database Trigger? What are its components?
**A:** A trigger is a stored procedure that automatically executes (fires) when a specified Data Manipulation Language (DML) event (`INSERT`, `UPDATE`, `DELETE`) occurs on a table. Its components are:
- **Event**: `BEFORE`, `AFTER`, or `INSTEAD OF` on `INSERT`, `UPDATE`, or `DELETE`.
- **Target Table**: The table being modified.
- **Trigger Function**: PL/pgSQL logic handling `NEW` and `OLD` row buffers.

---

### Q11: How are triggers implemented in SnapGrid?
**A:** SnapGrid uses an `AFTER INSERT OR DELETE` trigger on the `posts` and `likes` tables that executes a PL/pgSQL function (`log_post_activity` / `log_like_activity`) to automatically insert audit event records into the `activity_logs` table.

---

### Q12: What is the difference between `NEW` and `OLD` records in PostgreSQL triggers?
**A:**
- `NEW`: A record variable holding the new row data for `INSERT` or `UPDATE` operations.
- `OLD`: A record variable holding the existing row data prior to `UPDATE` or `DELETE` operations. For `DELETE`, `NEW` is `NULL`; for `INSERT`, `OLD` is `NULL`.

---

### Q13: What is a Database Index, and what underlying data structure does PostgreSQL use?
**A:** An index is a redundant data structure that allows the DBMS engine to locate specific rows rapidly without scanning the entire table. By default, PostgreSQL uses a self-balancing **B-Tree (Balanced Tree)** data structure, enabling lookups, range scans, and sort operations in $O(\log N)$ time.

---

### Q14: Why did you index `user_id` in the `posts` table?
**A:** Because foreign key columns are heavily used in `JOIN` conditions and `WHERE` clauses (e.g., loading a user's profile feed: `SELECT * FROM posts WHERE user_id = ?`). Without an index on `user_id`, MySQL InnoDB would execute a slow Table Scan (O(N)) across all posts.

---

### Q15: What are the ACID properties in database management?
**A:**
- **Atomicity**: The "all-or-nothing" rule; either all operations within a transaction commit or none persist.
- **Consistency**: A transaction takes the database from one valid state satisfying all constraints to another valid state.
- **Isolation**: Concurrent execution of transactions yields the same state as serial execution.
- **Durability**: Once committed, changes survive system crashes or power failures.

---

### Q16: Give an example of where a Transaction is essential in SnapGrid.
**A:** When deleting a user account. Deleting the user requires removing or updating their posts, likes, comments, and follow relationships, plus recording an audit event. Wrapping these in a `START TRANSACTION ... COMMIT` block ensures that if a database failure occurs mid-operation, the changes are rolled back with `ROLLBACK`, preventing orphaned records or corrupted state.

---

### Q17: What is the difference between `WHERE` and `HAVING` clauses?
**A:**
- `WHERE` filters individual rows **before** any grouping or aggregation takes place. It cannot contain aggregate functions.
- `HAVING` filters groups of rows **after** `GROUP BY` aggregation has been calculated (e.g., `HAVING COUNT(like_id) > 5`).

---

### Q18: What is the difference between `COUNT(*)`, `COUNT(column)`, and `COUNT(DISTINCT column)`?
**A:**
- `COUNT(*)` counts all rows in the result set, including those with `NULL` values.
- `COUNT(column)` counts only rows where the specified column is **NOT NULL**.
- `COUNT(DISTINCT column)` counts the number of unique, non-null values in that column.

---

### Q19: What is a Subquery? What is the difference between Correlated and Non-Correlated subqueries?
**A:** A subquery is a query nested inside another SQL statement.
- **Non-Correlated**: Independent of the outer query; it executes once, and its result is used by the outer query (e.g., `WHERE user_id IN (SELECT user_id FROM ...)`.
- **Correlated**: References columns from the outer query; it executes once for every candidate row evaluated by the outer query.

---

### Q20: What are Referential Integrity Constraints, and what does `ON DELETE CASCADE` mean?
**A:** Referential integrity ensures that relationships between tables remain consistent; a foreign key value must match an existing primary key in the referenced parent table or be `NULL`. `ON DELETE CASCADE` instructs MySQL to automatically delete all dependent child rows when the referenced parent row is deleted.

---

### Q21: Why do we use `ON DELETE SET NULL` on `activity_logs.user_id` instead of `CASCADE`?
**A:** Audit logs are historical compliance records. If a user deletes their account, we still want to preserve the record of actions that took place on the platform, but set the author identifier to `NULL` to avoid referencing a non-existent user.

---

### Q22: What is the purpose of the `CHECK` constraint in the `follows` table?
**A:** The constraint `CHECK (follower_id != following_id)` ensures domain integrity at the database engine level, preventing users from creating social follow links to themselves. MySQL 8.0 natively enforces this check.

---

### Q23: Why is the combination of `(user_id, post_id)` constrained as `UNIQUE` in the `likes` table?
**A:** To enforce the business rule of **idempotency**: a user can only like a particular post once. If an identical insert is attempted, MySQL rejects it with Error 1062 (`ER_DUP_ENTRY`).

---

### Q24: What is the difference between `CHAR`, `VARCHAR`, and `TEXT` in MySQL?
**A:**
- `CHAR(n)`: Fixed-length string, padded with trailing spaces up to length $n$.
- `VARCHAR(n)`: Variable-length string with a maximum upper limit of $n$ characters. Stored with a length prefix.
- `TEXT`: Variable-length string for larger blocks of text (up to 64 KB for standard TEXT), stored off-page in InnoDB if large.

---

### Q25: Why is `DATETIME` used in SnapGrid MySQL?
**A:** `DATETIME` stores date and time values (`YYYY-MM-DD HH:MM:SS`) spanning from year 1000 to 9999, independent of the server's local timezone setting, making it reliable for storing post timestamps and audit histories.

---

### Q26: How does the application prevent SQL Injection attacks?
**A:** By using **Parameterized Queries** (Prepared Statements) provided by the `mysql2` database driver (e.g., `db.query('SELECT * FROM users WHERE email = ?', [email])`). User input is treated strictly as data literals, never interpreted as executable SQL statements.

---

### Q27: How are user passwords securely stored in SnapGrid?
**A:** Passwords are never stored in plaintext. They are hashed using **bcrypt** with a salt round factor of 10 (`password_hash VARCHAR(255)`), protecting against rainbow table attacks and credential leaks.

---

### Q28: How does the system handle database connection scalability?
**A:** SnapGrid uses a **Connection Pool** (`mysql.createPool` via `mysql2/promise`). Instead of creating a new heavy TCP connection and database thread for each HTTP request, connections are pre-allocated, reused from the pool, and released back when queries complete.
