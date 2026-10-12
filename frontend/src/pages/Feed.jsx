import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { postsApi, usersApi } from '../api/api';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const isFetchingRef = useRef(false);

  // Initial full load
  const fetchFeed = useCallback(async (showLoader = true) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await postsApi.getFeed();
      const list = Array.isArray(data) ? data : data?.posts || data?.data || [];
      setPosts(list);

      // If feed is empty, also fetch suggested creators to help user get started
      if (list.length === 0) {
        try {
          const suggested = await usersApi.searchUsers('');
          const usersList = Array.isArray(suggested) ? suggested : suggested?.users || [];
          setSuggestedUsers(usersList.slice(0, 5));
        } catch (e) {
          // ignore suggestions error
        }
      }
    } catch (err) {
      if (showLoader) {
        setError(err.message || 'Failed to load feed. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Silent background sync that updates feed in real time without flickering UI
  const fetchFeedSilently = useCallback(async () => {
    if (isFetchingRef.current) return;
    try {
      const data = await postsApi.getFeed();
      const list = Array.isArray(data) ? data : data?.posts || data?.data || [];
      if (!list || list.length === 0) return;

      setPosts((prevPosts) => {
        // If counts differ or new posts were published, merge seamlessly
        const prevMap = new Map(
          prevPosts.map((p) => [p.post_id || p.id || p._id, p])
        );

        // Check if anything actually changed
        let hasChanges = list.length !== prevPosts.length;
        if (!hasChanges) {
          for (const newPost of list) {
            const pId = newPost.post_id || newPost.id || newPost._id;
            const existing = prevMap.get(pId);
            if (!existing) {
              hasChanges = true;
              break;
            }
            if (
              existing.like_count !== newPost.like_count ||
              existing.comment_count !== newPost.comment_count ||
              existing.is_liked !== newPost.is_liked
            ) {
              hasChanges = true;
              break;
            }
          }
        }

        return hasChanges ? list : prevPosts;
      });
    } catch (e) {
      // Background sync silently fails on temporary network hiccups
    }
  }, []);

  useEffect(() => {
    fetchFeed(true);

    // 1. Periodic background sync every 4 seconds for true live feed updates
    const pollInterval = setInterval(() => {
      fetchFeedSilently();
    }, 4000);

    // 2. Refresh immediately when window/tab is focused
    const handleFocus = () => {
      fetchFeedSilently();
    };
    window.addEventListener('focus', handleFocus);

    // 3. React instantly to real-time follow/unfollow events from anywhere in app
    const handleFollowChange = () => {
      fetchFeed(false);
    };
    window.addEventListener('snapgrid:follow_change', handleFollowChange);

    // 4. React instantly to post creations from Navbar
    const handleGlobalPostCreated = (e) => {
      const newPost = e.detail;
      if (newPost) {
        setPosts((prev) => [newPost, ...prev]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        fetchFeed(false);
      }
    };
    window.addEventListener('snapgrid:post_created', handleGlobalPostCreated);

    // 5. React instantly to user account switches
    const handleUserSwitched = () => {
      fetchFeed(true);
    };
    window.addEventListener('snapgrid:user_switched', handleUserSwitched);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('snapgrid:follow_change', handleFollowChange);
      window.removeEventListener('snapgrid:post_created', handleGlobalPostCreated);
      window.removeEventListener('snapgrid:user_switched', handleUserSwitched);
    };
  }, [fetchFeed, fetchFeedSilently]);

  const handlePostCreated = (newPost) => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      fetchFeed(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => (p.post_id || p.id || p._id) !== deletedId));
  };

  return (
    <>
      <Navbar onPostCreated={handlePostCreated} />
      <main className="feed-container">
        {/* Real-time Status Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '600px',
          margin: '0 auto 12px auto',
          padding: '0 8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.02em' }}>
              LIVE FEED
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchFeed(false)}
            disabled={refreshing}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
            title="Refresh feed"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: refreshing ? 'rotate(360deg)' : 'none',
                transition: 'transform 0.6s ease'
              }}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div style={{ paddingTop: '60px' }}>
            <LoadingSpinner size="lg" text="Loading live feed..." />
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="error-banner" style={{ justifyContent: 'center', marginBottom: '20px' }}>
              {error}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fetchFeed(true)}
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <svg
              className="empty-state-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <h2 className="empty-state-title">Welcome to SnapGrid!</h2>
            <p className="empty-state-desc">
              Your feed is empty. Follow users below or explore to see photos appear in your live feed immediately!
            </p>

            {/* Quick In-feed Suggestions */}
            {suggestedUsers.length > 0 && (
              <div style={{
                width: '100%',
                maxWidth: '440px',
                margin: '24px auto',
                textAlign: 'left',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                  Suggested Creators to Follow
                </h3>
                {suggestedUsers.map((u) => (
                  <UserCard
                    key={u.user_id || u.id}
                    user={u}
                    onFollowChange={() => fetchFeed(false)}
                  />
                ))}
              </div>
            )}

            <div className="feed-empty-actions" style={{ marginTop: '16px' }}>
              <Link to="/explore" className="btn btn-primary">
                Find People in Explore
              </Link>
            </div>
          </div>
        ) : (
          <div className="feed-layout">
            <div className="feed-posts-list">
              {posts.map((post) => (
                <PostCard
                  key={post.post_id || post.id || post._id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Feed;
