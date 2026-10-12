const fs = require('fs');
const path = require('path');
const readline = require('readline');

let mysql;
try {
  mysql = require('mysql2/promise');
} catch {
  mysql = require('../backend/node_modules/mysql2/promise');
}

const envPath = path.join(__dirname, '../backend/.env');
try {
  require('dotenv').config({ path: envPath });
} catch {
  try {
    require('../backend/node_modules/dotenv').config({ path: envPath });
  } catch (e) {
    // ignore
  }
}

function updateEnvFile(password, host, port, user) {
  try {
    if (!fs.existsSync(envPath)) return;
    let content = fs.readFileSync(envPath, 'utf-8');
    content = content.replace(/^DB_PASSWORD=.*$/m, `DB_PASSWORD=${password}`);
    content = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/snapgrid_db`);
    fs.writeFileSync(envPath, content, 'utf-8');
    console.log('✓ Successfully saved working database credentials to backend/.env');
  } catch (e) {
    console.warn('Notice: Could not automatically update backend/.env:', e.message);
  }
}

function promptPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter MySQL password for user \'root\' (press Enter if none): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function runTerminalInit() {
  console.log('========================================================');
  console.log('     SnapGrid MySQL Database Terminal Initializer');
  console.log('========================================================\n');

  let host = process.env.DB_HOST || 'localhost';
  let user = process.env.DB_USER || 'root';
  let port = parseInt(process.env.DB_PORT || '3306', 10);
  let password = process.env.DB_PASSWORD || '';

  // Parse DATABASE_URL if present
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      host = url.hostname || host;
      port = url.port ? parseInt(url.port, 10) : port;
      user = url.username || user;
      if (url.password) password = decodeURIComponent(url.password);
    } catch (e) {
      // ignore URL parsing errors
    }
  }

  // CLI argument takes top priority: node database/init_db.js [password]
  if (process.argv[2] !== undefined) {
    password = process.argv[2];
  } else if (!password && process.stdin.isTTY) {
    // If running in terminal and no password provided, prompt interactively
    password = await promptPassword();
  }

  const config = {
    host,
    user,
    password,
    port,
    multipleStatements: true
  };

  console.log(`Connecting to MySQL server at ${config.host}:${config.port} as '${config.user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✓ Successfully connected to MySQL server.\n');
    // Save working password to .env so backend server connects without error
    updateEnvFile(password, host, port, user);
  } catch (err) {
    console.error('\n❌ Connection Error: Could not connect to MySQL server.');
    console.error('Details:', err.message);
    console.error('\nTerminal Commands to Fix:');
    console.error('  1. Run with your password as an argument:');
    console.error('     node database/init_db.js YOUR_PASSWORD');
    console.error('  2. Or set DB_PASSWORD in backend/.env');
    console.error('  3. Ensure MySQL service is running (e.g. net start MySQL80)\n');
    process.exit(1);
  }

  try {
    // 1. Create database
    console.log('[1/4] Creating database snapgrid_db...');
    await connection.query('CREATE DATABASE IF NOT EXISTS snapgrid_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await connection.query('USE snapgrid_db;');
    console.log('      ✓ Database snapgrid_db ready.\n');

    // 2. Schema
    console.log('[2/4] Executing schema.sql (tables, constraints, indexes)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('      ✓ 6 tables created with InnoDB engine & foreign key cascades.\n');

    // 3. Seed data
    console.log('[3/4] Executing seed.sql (inserting sample dataset)...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await connection.query(seedSql);
    console.log('      ✓ Seeded 12 users, 25 posts, 42 likes, 22 comments, 26 follows.\n');

    // 4. Views
    console.log('[4/4] Executing views.sql and triggers.sql...');
    const viewsSql = fs.readFileSync(path.join(__dirname, 'views.sql'), 'utf-8');
    await connection.query(viewsSql);
    console.log('      ✓ post_statistics and user_statistics views created.');

    // 5. Triggers
    await connection.query('DROP TRIGGER IF EXISTS trg_log_post_created;');
    await connection.query('DROP TRIGGER IF EXISTS trg_log_post_deleted;');
    await connection.query('DROP TRIGGER IF EXISTS trg_log_like_created;');
    await connection.query('DROP TRIGGER IF EXISTS trg_log_like_deleted;');

    await connection.query(`
      CREATE TRIGGER trg_log_post_created
      AFTER INSERT ON posts
      FOR EACH ROW
      BEGIN
          INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details, created_at)
          VALUES ('POST_CREATED', 'post', NEW.post_id, NEW.user_id,
                  JSON_OBJECT('caption', NEW.caption, 'image_url', NEW.image_url, 'posted_at', NEW.created_at),
                  NOW());
      END;
    `);

    await connection.query(`
      CREATE TRIGGER trg_log_post_deleted
      AFTER DELETE ON posts
      FOR EACH ROW
      BEGIN
          INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details, created_at)
          VALUES ('POST_DELETED', 'post', OLD.post_id, OLD.user_id,
                  JSON_OBJECT('caption', OLD.caption, 'image_url', OLD.image_url, 'deleted_at', NOW()),
                  NOW());
      END;
    `);

    await connection.query(`
      CREATE TRIGGER trg_log_like_created
      AFTER INSERT ON likes
      FOR EACH ROW
      BEGIN
          INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details, created_at)
          VALUES ('LIKE_POST', 'post', NEW.post_id, NEW.user_id,
                  JSON_OBJECT('like_id', NEW.like_id, 'action_timestamp', NEW.created_at),
                  NOW());
      END;
    `);

    await connection.query(`
      CREATE TRIGGER trg_log_like_deleted
      AFTER DELETE ON likes
      FOR EACH ROW
      BEGIN
          INSERT INTO activity_logs (action, entity_type, entity_id, user_id, details, created_at)
          VALUES ('UNLIKE_POST', 'post', OLD.post_id, OLD.user_id,
                  JSON_OBJECT('like_id', OLD.like_id, 'action_timestamp', NOW()),
                  NOW());
      END;
    `);

    await connection.query('DROP TRIGGER IF EXISTS trg_prevent_self_follow;');
    await connection.query(`
      CREATE TRIGGER trg_prevent_self_follow
      BEFORE INSERT ON follows
      FOR EACH ROW
      BEGIN
          IF NEW.follower_id = NEW.following_id THEN
              SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Integrity constraint violated: Users cannot follow themselves';
          END IF;
      END;
    `);
    console.log('      ✓ 5 database triggers compiled (audit logging & self-follow prevention).\n');

    // Verify row counts
    const [userCount] = await connection.query('SELECT COUNT(*) as cnt FROM users');
    const [postCount] = await connection.query('SELECT COUNT(*) as cnt FROM posts');
    const [likeCount] = await connection.query('SELECT COUNT(*) as cnt FROM likes');
    const [commentCount] = await connection.query('SELECT COUNT(*) as cnt FROM comments');
    const [followCount] = await connection.query('SELECT COUNT(*) as cnt FROM follows');

    console.log('========================================================');
    console.log('🎉 SUCCESS: SnapGrid MySQL Database setup is 100% complete!');
    console.log(`   Users in DB:     ${userCount[0].cnt}`);
    console.log(`   Posts in DB:     ${postCount[0].cnt}`);
    console.log(`   Likes in DB:     ${likeCount[0].cnt}`);
    console.log(`   Comments in DB:  ${commentCount[0].cnt}`);
    console.log(`   Follows in DB:   ${followCount[0].cnt}`);
    console.log('========================================================');
    console.log('Ready! Run the app or refresh http://localhost:5173\n');
  } catch (err) {
    console.error('\n❌ Error executing SQL statements:');
    console.error(err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runTerminalInit();
