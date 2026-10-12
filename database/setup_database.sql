-- ============================================================================
-- SnapGrid Complete MySQL Database Initialization Script
-- Runs schema, seed data, views, and triggers in correct dependency order
--
-- Usage from terminal (Command Prompt / PowerShell):
--   mysql -u root -p < setup_database.sql
--
-- Usage from MySQL prompt:
--   source setup_database.sql;
-- ============================================================================

SELECT '1/4 Creating Schema, Constraints & Indexes...' AS status;
source d:/dbmsproject/database/schema.sql;

SELECT '2/4 Populating Seed Data...' AS status;
source d:/dbmsproject/database/seed.sql;

SELECT '3/4 Creating Database Views...' AS status;
source d:/dbmsproject/database/views.sql;

SELECT '4/4 Creating Audit Triggers...' AS status;
source d:/dbmsproject/database/triggers.sql;

SELECT '============================================================' AS separator_line;
SELECT 'SnapGrid MySQL Database setup complete!' AS result;
SELECT 'Run demonstration_queries.sql to inspect all DBMS concepts.' AS next_step;
SELECT '============================================================' AS end_line;
