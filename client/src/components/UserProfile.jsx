import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaArrowLeft, FaUsers, FaHeart, FaComment, FaUserPlus, FaUserMinus, FaYoutube, FaSpotify, FaFacebook, FaDiscord, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/UserProfile.css';

const UserProfile = ({ user: currentUser }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (user) {
      if (activeTab === 'posts') {
        fetchUserPosts();
      } else if (activeTab === 'followers') {
        fetchFollowers();
      } else if (activeTab === 'following') {
        fetchFollowing();
      }
      fetchSuggestions();
    }
  }, [activeTab, user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/social/users/${username}`, { headers });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/social/users/${username}/posts`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`/api/social/users/${username}/followers`);
      const data = await response.json();
      
      if (data.success) {
        setFollowers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`/api/social/users/${username}/following`);
      const data = await response.json();
      
      if (data.success) {
        setFollowing(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch following:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/social/suggestions/${user?.id || 'me'}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert('Please log in to follow users');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/social/users/${user.id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(prev => ({
          ...prev,
          is_following: data.following,
          followers_count: data.following 
            ? parseInt(prev.followers_count) + 1 
            : parseInt(prev.followers_count) - 1
        }));
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    }
  };

  const handleFollowSuggestion = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/social/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuggestions(prev => prev.filter(s => s.id !== userId));
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const navigateToProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  const getSocialIcon = (platform) => {
    const icons = {
      youtube: <FaYoutube />,
      spotify: <FaSpotify />,
      facebook: <FaFacebook />,
      discord: <FaDiscord />,
      twitter: <FaTwitter />,
      instagram: <FaInstagram />,
      linkedin: <FaLinkedin />,
      github: <FaGithub />
    };
    return icons[platform];
  };

  const getSocialColor = (platform) => {
    const colors = {
      youtube: '#FF0000',
      spotify: '#1DB954',
      facebook: '#1877F2',
      discord: '#5865F2',
      twitter: '#1DA1F2',
      instagram: '#E4405F',
      linkedin: '#0A66C2',
      github: '#333333'
    };
    return colors[platform];
  };

  const formatSocialUrl = (platform, value) => {
    if (!value) return '';
    
    const baseUrls = {
      youtube: 'https://youtube.com/',
      spotify: 'https://open.spotify.com/user/',
      facebook: 'https://facebook.com/',
      twitter: 'https://twitter.com/',
      instagram: 'https://instagram.com/',
      linkedin: 'https://linkedin.com/in/',
      github: 'https://github.com/'
    };

    if (platform === 'discord') return value;
    
    if (value.startsWith('http')) return value;
    return baseUrls[platform] + value.replace(/^@/, '');
  };

  if (loading) {
    return (
      <div className="user-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-error">
        <h2>Profile Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/social')} className="back-button">
          <FaArrowLeft /> Back to Social
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="sidebar-content">
              <button onClick={() => navigate('/social')} className="back-button">
                <FaArrowLeft /> Back
              </button>
              <div className="profile-card">
                <div 
                  className="profile-banner"
                  style={{
                    backgroundImage: user?.banner_url 
                      ? `url(${user.banner_url})` 
                      : 'linear-gradient(135deg, var(--primary-medium), var(--primary-light))'
                  }}
                />
                <div className="profile-info">
                  <div className="profile-header">
                    <div className="profile-avatar-container">
                      <div className="profile-avatar">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt="Avatar" />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                    </div>
                    
                    {currentUser && !user.is_own_profile && (
                      <button 
                        className={`follow-btn ${user.is_following ? 'following' : ''}`}
                        onClick={handleFollow}
                      >
                        {user.is_following ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>

                  <div className="profile-details">
                    <div className="profile-names">
                      <h2 className="username">@{user?.username}</h2>
                      <p className="join-date">Joined {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>

                    {user?.bio && (
                      <div className="bio-section">
                        <p className="bio">{user.bio}</p>
                      </div>
                    )}

                    <div className="profile-stats">
                      <button 
                        className={`stat ${activeTab === 'following' ? 'active' : ''}`}
                        onClick={() => setActiveTab('following')}
                      >
                        <span className="stat-number">{user.following_count}</span>
                        <span className="stat-label">Following</span>
                      </button>
                      <button 
                        className={`stat ${activeTab === 'followers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('followers')}
                      >
                        <span className="stat-number">{user.followers_count}</span>
                        <span className="stat-label">Followers</span>
                      </button>
                    </div>
                  </div>
                </div>
                {(user?.youtube_url || user?.spotify_url || user?.facebook_url || user?.discord_username || 
                  user?.twitter_url || user?.instagram_url || user?.linkedin_url || user?.github_url) && (
                  <div className="connections-section">
                    <h3>CONNECTIONS</h3>
                    <div className="connections-list">
                      {[
                        { key: 'youtube_url', platform: 'youtube', label: 'YOUTUBE' },
                        { key: 'spotify_url', platform: 'spotify', label: 'SPOTIFY' },
                        { key: 'facebook_url', platform: 'facebook', label: 'FACEBOOK' },
                        { key: 'discord_username', platform: 'discord', label: 'DISCORD' },
                        { key: 'twitter_url', platform: 'twitter', label: 'TWITTER' },
                        { key: 'instagram_url', platform: 'instagram', label: 'INSTAGRAM' },
                        { key: 'linkedin_url', platform: 'linkedin', label: 'LINKEDIN' },
                        { key: 'github_url', platform: 'github', label: 'GITHUB' }
                      ].map(({ key, platform, label }) => {
                        const value = user[key];
                        if (!value) return null;

                        return (
                          <div key={key} className="connection-item">
                            {platform === 'discord' ? (
                              <div className="connection-link">
                                <span className="social-icon" style={{ color: getSocialColor(platform) }}>
                                  {getSocialIcon(platform)}
                                </span>
                                <span className="connection-label">{value}</span>
                              </div>
                            ) : (
                              <a 
                                href={formatSocialUrl(platform, value)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="connection-link"
                              >
                                <span className="social-icon" style={{ color: getSocialColor(platform) }}>
                                  {getSocialIcon(platform)}
                                </span>
                                <span className="connection-label">{label}</span>
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {suggestions.length > 0 && (
                <div className="suggestions-card">
                  <h3>You might like</h3>
                  <div className="suggestions-list">
                    {suggestions.slice(0, 2).map((suggestion) => (
                      <div key={suggestion.id} className="suggestion-item">
                        <div className="suggestion-user">
                          <div 
                            className="suggestion-avatar"
                            onClick={() => navigateToProfile(suggestion.username)}
                          >
                            {suggestion.avatar_url ? (
                              <img src={suggestion.avatar_url} alt={suggestion.username} />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div className="suggestion-info">
                            <p className="suggestion-name" onClick={() => navigateToProfile(suggestion.username)}>
                              {suggestion.display_name || suggestion.username}
                            </p>
                            <p className="suggestion-username">@{suggestion.username}</p>
                          </div>
                        </div>
                        <button 
                          className="follow-suggestion-btn"
                          onClick={() => handleFollowSuggestion(suggestion.id)}
                        >
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
          <main className="profile-main">
            <div className="profile-tabs">
              <nav className="tabs-nav">
                <button 
                  className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  Posts
                </button>
                <button 
                  className={`tab-button ${activeTab === 'replies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('replies')}
                >
                  Replies
                </button>
                <button 
                  className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
                  onClick={() => setActiveTab('media')}
                >
                  Media
                </button>
              </nav>
            </div>
            <div className="profile-content">
              <AnimatePresence mode="wait">
                {activeTab === 'posts' && (
                  <motion.div
                    key="posts"
                    className="posts-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <div key={post.id} className="post-item">
                          <div className="post-header">
                            <div className="post-avatar">
                              {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" />
                              ) : (
                                <FaUser />
                              )}
                            </div>
                            <div className="post-content">
                              <div className="post-meta">
                                <span className="post-username">@{user?.username}</span>
                                <span className="post-time">· {formatDate(post.created_at)}</span>
                              </div>
                              <p className="post-text">{post.content}</p>
                              {post.image_url && (
                                <div className="post-image">
                                  <img src={post.image_url} alt="Post content" />
                                </div>
                              )}
                              <div className="post-actions">
                                <button className="action-btn">
                                  <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                  </svg>
                                  <span>{post.likes_count}</span>
                                </button>
                                <button className="action-btn">
                                  <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                  </svg>
                                  <span>{post.comments_count}</span>
                                </button>
                                <button className="action-btn">
                                  <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <h3>No posts yet</h3>
                        <p>{user.username} hasn't posted anything yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'followers' && (
                  <motion.div
                    key="followers"
                    className="users-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {followers.length > 0 ? (
                      followers.map((follower, index) => (
                        <motion.div
                          key={follower.id}
                          className="user-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          onClick={() => navigateToProfile(follower.username)}
                        >
                          <div className="user-avatar">
                            <FaUser />
                          </div>
                          <div className="user-info">
                            <h4>@{follower.username}</h4>
                            {follower.bio && <p>{follower.bio}</p>}
                          </div>
                          <span className="follow-date">
                            Followed {formatDate(follower.followed_at)}
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <h3>No followers yet</h3>
                        <p>{user.username} doesn't have any followers yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'following' && (
                  <motion.div
                    key="following"
                    className="users-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {following.length > 0 ? (
                      following.map((followedUser, index) => (
                        <motion.div
                          key={followedUser.id}
                          className="user-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          onClick={() => navigateToProfile(followedUser.username)}
                        >
                          <div className="user-avatar">
                            <FaUser />
                          </div>
                          <div className="user-info">
                            <h4>@{followedUser.username}</h4>
                            {followedUser.bio && <p>{followedUser.bio}</p>}
                          </div>
                          <span className="follow-date">
                            Following since {formatDate(followedUser.followed_at)}
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <h3>Not following anyone</h3>
                        <p>{user.username} isn't following anyone yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'replies' && (
                  <motion.div
                    key="replies"
                    className="empty-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3>No replies yet</h3>
                    <p>{user.username}'s replies to other posts will appear here.</p>
                  </motion.div>
                )}

                {activeTab === 'media' && (
                  <motion.div
                    key="media"
                    className="posts-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {posts.filter(post => post.image_url).length > 0 ? (
                      posts.filter(post => post.image_url).map((post) => (
                        <div key={post.id} className="post-item">
                          <div className="post-header">
                            <div className="post-avatar">
                              {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" />
                              ) : (
                                <FaUser />
                              )}
                            </div>
                            <div className="post-content">
                              <div className="post-meta">
                                <span className="post-username">@{user?.username}</span>
                                <span className="post-time">· {formatDate(post.created_at)}</span>
                              </div>
                              <p className="post-text">{post.content}</p>
                              <div className="post-image">
                                <img src={post.image_url} alt="Post content" />
                              </div>
                              <div className="post-actions">
                                <button className="action-btn">
                                  <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                  </svg>
                                  <span>{post.likes_count}</span>
                                </button>
                                <button className="action-btn">
                                  <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                  </svg>
                                  <span>{post.comments_count}</span>
                                </button>
                                <button className="action-btn">
                                  <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <h3>No media posts</h3>
                        <p>{user.username} hasn't posted any media yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;