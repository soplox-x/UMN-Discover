import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaArrowLeft, FaUsers, FaHeart, FaComment, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const navigateToProfile = (username) => {
    navigate(`/profile/${username}`);
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
        <motion.div 
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button onClick={() => navigate('/social')} className="back-button">
            <FaArrowLeft /> Back
          </button>
          
          <div className="profile-info">
            <div className="profile-avatar-large">
              <FaUser />
            </div>
            
            <div className="profile-details">
              <h1 className="profile-username">@{user.username}</h1>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{user.posts_count}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{user.followers_count}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{user.following_count}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
              
              {currentUser && !user.is_own_profile && (
                <button 
                  className={`follow-button ${user.is_following ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  {user.is_following ? (
                    <>
                      <FaUserMinus /> Unfollow
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({user.posts_count})
          </button>
          <button 
            className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            Followers ({user.followers_count})
          </button>
          <button 
            className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            Following ({user.following_count})
          </button>
        </div>

        <div className="profile-content">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                className="posts-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      className="post-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="post-content">
                        <p>{post.content}</p>
                        {post.image_url && (
                          <div className="post-image">
                            <img src={post.image_url} alt="Post content" />
                          </div>
                        )}
                      </div>
                      
                      <div className="post-meta">
                        <div className="post-stats">
                          <span className="stat">
                            <FaHeart /> {post.likes_count}
                          </span>
                          <span className="stat">
                            <FaComment /> {post.comments_count}
                          </span>
                        </div>
                        <span className="post-time">{formatDate(post.created_at)}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No posts yet</h3>
                    <p>{user.is_own_profile ? "You haven't posted anything yet." : `${user.username} hasn't posted anything yet.`}</p>
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
                    <p>{user.is_own_profile ? "You don't have any followers yet." : `${user.username} doesn't have any followers yet.`}</p>
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
                    <p>{user.is_own_profile ? "You're not following anyone yet." : `${user.username} isn't following anyone yet.`}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;