import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { usersApi } from '../api/api';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Fetch recommended creators on initial mount
  useEffect(() => {
    let isMounted = true;
    const fetchSuggested = async () => {
      try {
        const data = await usersApi.searchUsers('');
        const list = Array.isArray(data) ? data : data?.users || data?.data || [];
        if (isMounted) setSuggestedUsers(list);
      } catch (e) {
        console.warn('Failed to load suggested creators:', e);
      } finally {
        if (isMounted) setLoadingSuggestions(false);
      }
    };
    fetchSuggested();
    return () => { isMounted = false; };
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setUsers([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const handler = setTimeout(async () => {
      try {
        const data = await usersApi.searchUsers(trimmed);
        const list = Array.isArray(data) ? data : data?.users || data?.data || [];
        setUsers(list);
        setHasSearched(true);
      } catch (err) {
        setError(err.message || 'Failed to search users.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="explore-container">
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px' }}>
              Explore & Discover
            </h1>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by username or name..."
              onClear={() => setSearchTerm('')}
            />
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <LoadingSpinner size="md" text="Searching users..." />
          ) : hasSearched && users.length === 0 ? (
            <div className="empty-state">
              <svg
                className="empty-state-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h3 className="empty-state-title">No Users Found</h3>
              <p className="empty-state-desc">
                No accounts match &ldquo;{searchTerm}&rdquo;. Check the spelling or search for another name.
              </p>
            </div>
          ) : users.length > 0 ? (
            <div className="explore-results-list">
              <h2 style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 600, margin: '10px 0' }}>
                Search Results
              </h2>
              {users.map((u) => (
                <UserCard key={u.user_id || u.id || u.username} user={u} />
              ))}
            </div>
          ) : suggestedUsers.length > 0 ? (
            <div className="explore-results-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
                <h2 style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Suggested Creators
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500 }}>
                  Live Suggestions
                </span>
              </div>
              {suggestedUsers.map((u) => (
                <UserCard key={u.user_id || u.id || u.username} user={u} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg
                className="empty-state-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3 className="empty-state-title">Find Your Community</h3>
              <p className="empty-state-desc">
                Type a username or full name in the search bar above to connect with other creators on SnapGrid.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Explore;
