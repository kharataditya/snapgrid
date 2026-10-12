-- ============================================================================
-- SnapGrid Seed Data (MySQL Version)
-- Database Management System: MySQL 8.0+
-- Database Name: snapgrid_db
-- ============================================================================

USE snapgrid_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE activity_logs;
TRUNCATE TABLE follows;
TRUNCATE TABLE comments;
TRUNCATE TABLE likes;
TRUNCATE TABLE posts;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Password hash for 'password123':
-- $2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq

-- ============================================================================
-- 1. SEED USERS (12 Users)
-- ============================================================================
INSERT INTO users (user_id, username, email, password_hash, full_name, bio, profile_image_url, created_at)
VALUES
(1, 'john_doe', 'john@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'John Doe', 'Photography enthusiast & urban explorer 📷 | Canon EOS R5', 'https://picsum.photos/seed/john_profile/150', DATE_SUB(NOW(), INTERVAL 60 DAY)),
(2, 'jane_smith', 'jane@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Jane Smith', 'Software engineer & digital creator 💻 | Coffee & code ☕', 'https://picsum.photos/seed/jane_profile/150', DATE_SUB(NOW(), INTERVAL 58 DAY)),
(3, 'alex_wanderer', 'alex@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Alex Rivera', 'Mountain explorer & drone videographer 🏔️ | Sony Alpha', 'https://picsum.photos/seed/alex_profile/150', DATE_SUB(NOW(), INTERVAL 55 DAY)),
(4, 'chef_elena', 'elena@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Elena Rostova', 'Artisan sourdough & pastry chef 🥐 | Farm-to-table', 'https://picsum.photos/seed/elena_profile/150', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(5, 'david_fitness', 'david@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'David Kim', 'Strength coach & marathon runner 🏃‍♂️ | Daily consistency', 'https://picsum.photos/seed/david_profile/150', DATE_SUB(NOW(), INTERVAL 48 DAY)),
(6, 'sophia_art', 'sophia@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Sophia Martinez', 'Digital illustrator & UI visual designer ✨ | Color palette obsessive', 'https://picsum.photos/seed/sophia_profile/150', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(7, 'travel_with_liam', 'liam@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Liam O Connor', 'Backpacking 40+ countries ✈️ | Capturing unscripted moments', 'https://picsum.photos/seed/liam_profile/150', DATE_SUB(NOW(), INTERVAL 40 DAY)),
(8, 'emma_reads', 'emma@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Emma Watson', 'Bookworm & cozy literature reviews 📚 | Tea & sci-fi novels', 'https://picsum.photos/seed/emma_profile/150', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(9, 'urban_marcus', 'marcus@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Marcus Vance', 'Architectural photographer in Chicago 🏙️ | Brutalism and geometry', 'https://picsum.photos/seed/marcus_profile/150', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(10, 'olivia_green', 'olivia@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Olivia Chen', 'Indoor botanist & urban gardener 🌿 | Living in an urban jungle', 'https://picsum.photos/seed/olivia_profile/150', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(11, 'ryan_beats', 'ryan@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Ryan Brooks', 'Electronic music producer & sound designer 🎧 | Synths & groove', 'https://picsum.photos/seed/ryan_profile/150', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(12, 'daniel_code', 'daniel@example.com', '$2b$10$0GwbnHZF/l1Bk6WImv0dsekH.JWczOp/U/YqABMg5fuXlQvQOx3Oq', 'Daniel Foster', 'Distributed systems architect ⚙️ | Linux, Rust & coffee brewing', 'https://picsum.photos/seed/daniel_profile/150', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ============================================================================
-- 2. SEED POSTS (25 Posts)
-- ============================================================================
INSERT INTO posts (post_id, user_id, image_url, caption, created_at)
VALUES
(1, 1, 'https://picsum.photos/seed/post_alps_summit/600/600', 'First light over the ridge. Waking up at 4 AM was totally worth it. 🏔️✨', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(2, 1, 'https://picsum.photos/seed/post_misty_forest/600/600', 'Pacific Northwest damp pine air. Nothing resets the mind like quiet trails.', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(3, 1, 'https://picsum.photos/seed/post_desert_dunes/600/600', 'Golden hour patterns across the sand dunes. Wind-sculpted perfection.', DATE_SUB(NOW(), INTERVAL 20 DAY)),

(4, 2, 'https://picsum.photos/seed/post_clean_desk/600/600', 'New mechanical keyboard build completed! 65% layout with lubed switches ⌨️', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(5, 2, 'https://picsum.photos/seed/post_code_deploy/600/600', 'Deployed my open source project v2.0 today! Stars appreciated on GitHub 🚀', DATE_SUB(NOW(), INTERVAL 18 DAY)),

(6, 3, 'https://picsum.photos/seed/post_cappadocia/600/600', 'Sunrise hot air balloon flight over the fairy chimneys in Cappadocia 🎈', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(7, 3, 'https://picsum.photos/seed/post_kyoto/600/600', 'Hidden stone alleyway in Gion, Kyoto. Lanterns gently swinging in the wind 🏮', DATE_SUB(NOW(), INTERVAL 17 DAY)),

(8, 4, 'https://picsum.photos/seed/post_sourdough_crust/600/600', 'Sunday morning sourdough loaf fresh out of the Dutch oven. Hear that crackle! 🥖', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(9, 4, 'https://picsum.photos/seed/post_matcha_tart/600/600', 'Matcha green tea tart with black sesame crust and white chocolate ganache 🍵', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(10, 4, 'https://picsum.photos/seed/post_fresh_pasta/600/600', 'Handmade tagliatelle with wild mushroom ragu and fresh thyme 🍝', DATE_SUB(NOW(), INTERVAL 10 DAY)),

(11, 5, 'https://picsum.photos/seed/post_track_morning/600/600', '15km tempo run in the bag before the city woke up. Track workouts never lie! 🏃', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(12, 5, 'https://picsum.photos/seed/post_gym_plates/600/600', 'New deadlift personal record today! Form check felt crisp and stable 💪', DATE_SUB(NOW(), INTERVAL 14 DAY)),

(13, 6, 'https://picsum.photos/seed/post_cyber_sketch/600/600', 'Character concept design for a retro-futuristic graphic novel project 🎨', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(14, 6, 'https://picsum.photos/seed/post_color_palette/600/600', 'Finding color inspiration in neon signs and rainy reflection streets 🌧️', DATE_SUB(NOW(), INTERVAL 12 DAY)),

(15, 7, 'https://picsum.photos/seed/post_amalfi_cliff/600/600', 'Coastline drive along Amalfi. Lemon groves and deep turquoise sea 🍋🌊', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(16, 7, 'https://picsum.photos/seed/post_fiji_reef/600/600', 'Crystal clear waters on the outer barrier reef. Pristine biodiversity 🐠', DATE_SUB(NOW(), INTERVAL 11 DAY)),

(17, 8, 'https://picsum.photos/seed/post_cozy_reading/600/600', 'Rainy afternoon, cinnamon tea, and a gripping mystery novel. Peak comfort 📖', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(18, 8, 'https://picsum.photos/seed/post_bookstack_shelf/600/600', 'My favorite literary reads of the quarter! Which one have you read? 📚', DATE_SUB(NOW(), INTERVAL 8 DAY)),

(19, 9, 'https://picsum.photos/seed/post_glass_facade/600/600', 'Curved glass reflections against concrete pillars. Geometric symmetry 🏙️', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(20, 9, 'https://picsum.photos/seed/post_bridge_shadows/600/600', 'Structural steel trusses and deep shadows at dusk on the river 🌉', DATE_SUB(NOW(), INTERVAL 7 DAY)),

(21, 10, 'https://picsum.photos/seed/post_monstera_leaf/600/600', 'A new fenestrated leaf finally unfurled on my variegated Monstera! 🌱💚', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(22, 10, 'https://picsum.photos/seed/post_greenhouse_sun/600/600', 'Afternoon sunbeams streaming through the community greenhouse glass 🌿☀️', DATE_SUB(NOW(), INTERVAL 4 DAY)),

(23, 11, 'https://picsum.photos/seed/post_analog_synth/600/600', 'Tweaking patch cables on the modular synth rack. Rich analog harmonics 🎛️', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(24, 11, 'https://picsum.photos/seed/post_studio_monitors/600/600', 'Late night mixdown session. Bassline finally sitting in the pocket 🎵', DATE_SUB(NOW(), INTERVAL 3 DAY)),

(25, 12, 'https://picsum.photos/seed/post_distributed_nodes/600/600', 'Benchmarking consensus algorithms on a cluster. Sub-millisecond latency! ⚡', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================================================
-- 3. SEED LIKES (42 Likes)
-- ============================================================================
INSERT INTO likes (like_id, user_id, post_id, created_at)
VALUES
(1,  2, 1,  DATE_SUB(NOW(), INTERVAL 27 DAY)),
(2,  3, 1,  DATE_SUB(NOW(), INTERVAL 27 DAY)),
(3,  4, 1,  DATE_SUB(NOW(), INTERVAL 26 DAY)),
(4,  7, 1,  DATE_SUB(NOW(), INTERVAL 26 DAY)),
(5,  9, 1,  DATE_SUB(NOW(), INTERVAL 25 DAY)),

(6,  5, 2,  DATE_SUB(NOW(), INTERVAL 25 DAY)),
(7,  10, 2, DATE_SUB(NOW(), INTERVAL 24 DAY)),
(8,  8, 2,  DATE_SUB(NOW(), INTERVAL 23 DAY)),

(9,  1, 4,  DATE_SUB(NOW(), INTERVAL 24 DAY)),
(10, 11, 4, DATE_SUB(NOW(), INTERVAL 24 DAY)),
(11, 12, 4, DATE_SUB(NOW(), INTERVAL 23 DAY)),

(12, 1, 5,  DATE_SUB(NOW(), INTERVAL 17 DAY)),
(13, 12, 5, DATE_SUB(NOW(), INTERVAL 16 DAY)),

(14, 1, 6,  DATE_SUB(NOW(), INTERVAL 23 DAY)),
(15, 2, 6,  DATE_SUB(NOW(), INTERVAL 23 DAY)),
(16, 5, 6,  DATE_SUB(NOW(), INTERVAL 22 DAY)),
(17, 8, 6,  DATE_SUB(NOW(), INTERVAL 21 DAY)),
(18, 10, 6, DATE_SUB(NOW(), INTERVAL 20 DAY)),

(19, 4, 7,  DATE_SUB(NOW(), INTERVAL 16 DAY)),
(20, 6, 7,  DATE_SUB(NOW(), INTERVAL 15 DAY)),

(21, 1, 8,  DATE_SUB(NOW(), INTERVAL 22 DAY)),
(22, 2, 8,  DATE_SUB(NOW(), INTERVAL 22 DAY)),
(23, 7, 8,  DATE_SUB(NOW(), INTERVAL 21 DAY)),

(24, 2, 11, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(25, 9, 11, DATE_SUB(NOW(), INTERVAL 19 DAY)),

(26, 1, 13, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(27, 4, 13, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(28, 6, 13, DATE_SUB(NOW(), INTERVAL 17 DAY)),

(29, 2, 15, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(30, 5, 15, DATE_SUB(NOW(), INTERVAL 9 DAY)),

(31, 1, 16, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(32, 2, 16, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(33, 6, 16, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(34, 9, 16, DATE_SUB(NOW(), INTERVAL 3 DAY)),

(35, 2, 19, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(36, 7, 19, DATE_SUB(NOW(), INTERVAL 13 DAY)),

(37, 1, 21, DATE_SUB(NOW(), INTERVAL 11 DAY)),
(38, 4, 21, DATE_SUB(NOW(), INTERVAL 10 DAY)),

(39, 2, 23, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(40, 12, 23, DATE_SUB(NOW(), INTERVAL 7 DAY)),

(41, 1, 25, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(42, 2, 25, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================================================
-- 4. SEED COMMENTS (22 Comments)
-- ============================================================================
INSERT INTO comments (comment_id, user_id, post_id, comment_text, created_at)
VALUES
(1,  7, 1,  'Incredible lighting John! Which trail did you take to reach this vantage point?', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(2,  9, 1,  'The composition with the mountain ridges leading the eye is pristine!', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(3,  1, 1,  '@travel_with_liam took the North Ridge trail, steep but well marked!', DATE_SUB(NOW(), INTERVAL 26 DAY)),

(4,  12, 4, 'That 65% form factor is pure ergonomics. What switches did you solder?', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(5,  2, 4,  'Gateron Oil Kings with Krytox 205g0 lube, silky smooth feel!', DATE_SUB(NOW(), INTERVAL 24 DAY)),

(6,  1, 8,  'That crust looks unbelievable Elena! Would love the hydration percentage recipe.', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(7,  10, 8, 'Nothing beats the aroma of freshly baked sourdough on a Sunday morning!', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(8,  4, 8,  '@john_doe it is a 78% hydration sourdough with 20% rye flour!', DATE_SUB(NOW(), INTERVAL 22 DAY)),

(9,  11, 9, 'That matcha green hue is stunning! Almost too beautiful to eat.', DATE_SUB(NOW(), INTERVAL 16 DAY)),

(10, 2, 11, 'Way to put in the early morning mileage David! Real dedication right there.', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(11, 11, 11, 'What playlist keeps your cadence steady during long tempo runs?', DATE_SUB(NOW(), INTERVAL 20 DAY)),

(12, 9, 13, 'The retro cyberpunk vibes are strong here Sophia. Brilliant use of contrasting purples.', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(13, 2, 13, 'Would make an incredible wallpaper or book jacket cover!', DATE_SUB(NOW(), INTERVAL 19 DAY)),

(14, 1, 7,  'Kyoto is pure magic at dusk. Did you manage to visit the bamboo grove too?', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(15, 8, 7,  'This shot evokes such peace. Adding this destination to my dream itinerary!', DATE_SUB(NOW(), INTERVAL 17 DAY)),

(16, 4, 15, 'Amalfi coast lemons make the absolute best fresh pasta sauces and desserts!', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(17, 7, 6,  'Watching the balloons rise over the rock formations was an unforgettable memory!', DATE_SUB(NOW(), INTERVAL 4 DAY)),

(18, 6, 17, 'Cozy reading aesthetics at their finest Emma. What novel is this?', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(19, 8, 17, '@sophia_art It is "Project Hail Mary" by Andy Weir, could not put it down!', DATE_SUB(NOW(), INTERVAL 15 DAY)),

(20, 2, 19, 'Love how the diagonal reflection cuts across the architecture frame Marcus.', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(21, 1, 21, 'Those leaf fenestrations are gorgeous Olivia! Green thumb mastery.', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(22, 11, 23, 'Analog synthesizers have a warmth that digital VSTs still struggle to replicate.', DATE_SUB(NOW(), INTERVAL 8 DAY));

-- ============================================================================
-- 5. SEED FOLLOWS (26 Follow Relationships)
-- ============================================================================
INSERT INTO follows (follow_id, follower_id, following_id, created_at)
VALUES
(1,  1, 2,  DATE_SUB(NOW(), INTERVAL 50 DAY)),  -- John follows Jane
(2,  1, 3,  DATE_SUB(NOW(), INTERVAL 45 DAY)),  -- John follows Alex
(3,  1, 4,  DATE_SUB(NOW(), INTERVAL 40 DAY)),  -- John follows Elena
(4,  1, 7,  DATE_SUB(NOW(), INTERVAL 35 DAY)),  -- John follows Liam
(5,  1, 9,  DATE_SUB(NOW(), INTERVAL 30 DAY)),  -- John follows Marcus

(6,  2, 1,  DATE_SUB(NOW(), INTERVAL 48 DAY)),  -- Jane follows John
(7,  2, 6,  DATE_SUB(NOW(), INTERVAL 42 DAY)),  -- Jane follows Sophia
(8,  2, 12, DATE_SUB(NOW(), INTERVAL 14 DAY)),  -- Jane follows Daniel

(9,  3, 1,  DATE_SUB(NOW(), INTERVAL 44 DAY)),  -- Alex follows John
(10, 3, 7,  DATE_SUB(NOW(), INTERVAL 39 DAY)),  -- Alex follows Liam
(11, 3, 10, DATE_SUB(NOW(), INTERVAL 28 DAY)),  -- Alex follows Olivia

(12, 4, 1,  DATE_SUB(NOW(), INTERVAL 41 DAY)),  -- Elena follows John
(13, 4, 2,  DATE_SUB(NOW(), INTERVAL 39 DAY)),  -- Elena follows Jane

(14, 5, 1,  DATE_SUB(NOW(), INTERVAL 38 DAY)),  -- David follows John
(15, 5, 2,  DATE_SUB(NOW(), INTERVAL 37 DAY)),  -- David follows Jane
(16, 5, 11, DATE_SUB(NOW(), INTERVAL 24 DAY)),  -- David follows Ryan

(17, 6, 2,  DATE_SUB(NOW(), INTERVAL 36 DAY)),  -- Sophia follows Jane
(18, 6, 9,  DATE_SUB(NOW(), INTERVAL 33 DAY)),  -- Sophia follows Marcus

(19, 7, 1,  DATE_SUB(NOW(), INTERVAL 35 DAY)),  -- Liam follows John
(20, 7, 3,  DATE_SUB(NOW(), INTERVAL 34 DAY)),  -- Liam follows Alex
(21, 7, 4,  DATE_SUB(NOW(), INTERVAL 32 DAY)),  -- Liam follows Elena

(22, 8, 4,  DATE_SUB(NOW(), INTERVAL 31 DAY)),  -- Emma follows Elena
(23, 8, 6,  DATE_SUB(NOW(), INTERVAL 29 DAY)),  -- Emma follows Sophia

(24, 9, 1,  DATE_SUB(NOW(), INTERVAL 27 DAY)),  -- Marcus follows John
(25, 10, 1, DATE_SUB(NOW(), INTERVAL 25 DAY)),  -- Olivia follows John
(26, 12, 2, DATE_SUB(NOW(), INTERVAL 13 DAY));  -- Daniel follows Jane
