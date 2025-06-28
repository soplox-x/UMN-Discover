import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaComment, FaImage, FaPaperPlane, FaUser, FaSearch, FaTimes, FaRetweet, FaShare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Social.css';

const Social = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchFeed();
    } else if (activeTab === 'explore') {
      fetchPosts();
    }
  }, [activeTab]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      const response = await fetch(`/api/social/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      const response = await fetch('/api/social/feed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social/posts');
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to create a post');
      return;
    }

    if (!newPost.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', newPost);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setPosts([data.data, ...posts]);
        setNewPost('');
        removeImage();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      alert('Please log in to like posts');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: data.data.likes_count, user_liked: data.data.liked }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(prev => ({ ...prev, [postId]: data.data }));
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const togglePostExpansion = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!user) {
      alert('Please log in to comment');
      return;
    }

    const content = newComment[postId];
    if (!content || !content.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.data]
        }));
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, comments_count: parseInt(post.comments_count) + 1 }
            : post
        ));
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
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

  const handleUsernameClick = (username) => {
    navigateToProfile(username);
  };

  return (
    <div className="social-page">
      <div className="social-container">
        <motion.div 
          className="social-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>UMN Social</h1>
          
          <div className="social-tabs">
            <button 
              className={`tab-button ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              <FaUser /> Feed
            </button>
            <button 
              className={`tab-button ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              <FaSearch /> Explore
            </button>
            <button 
              className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <FaSearch /> Find Users
            </button>
          </div>
        </motion.div>

        {activeTab === 'search' && (
          <motion.div 
            className="search-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Found {searchResults.length} users</h3>
                <div className="users-list">
                  {searchResults.map((searchUser, index) => (
                    <motion.div
                      key={searchUser.id}
                      className="user-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => navigateToProfile(searchUser.username)}
                    >
                      <div className="user-avatar">
                        <FaUser />
                      </div>
                      <div className="user-info">
                        <h4>@{searchUser.username}</h4>
                        {searchUser.bio && <p>{searchUser.bio}</p>}
                        <div className="user-stats">
                          <span>{searchUser.posts_count} posts</span>
                          <span>{searchUser.followers_count} followers</span>
                          <span>{searchUser.following_count} following</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="no-results">
                <h3>No users found</h3>
                <p>Try searching with a different username</p>
              </div>
            )}

            {searchQuery.length === 0 && (
              <div className="search-suggestions">
                <h3>Find and connect with other UMN students</h3>
                <p>Search by username to discover new people to follow</p>
              </div>
            )}
          </motion.div>
        )}

        {user && (activeTab === 'feed' || activeTab === 'explore') && (
          <motion.div 
            className="compose-tweet"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleCreatePost} className="compose-form">
              <div className="compose-header">
                <div className="user-avatar" onClick={() => navigateToProfile(user.username)}>
                  <FaUser />
                </div>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's happening at UMN?"
                  className="compose-input"
                  maxLength={200}
                  rows={3}
                />
              </div>
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button type="button" onClick={removeImage} className="remove-image">
                    ×
                  </button>
                </div>
              )}

              <div className="compose-actions">
                <div className="compose-options">
                  <label className="media-btn">
                    <FaImage />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      hidden
                    />
                  </label>
                  <span className="char-count">{newPost.length}/200</span>
                </div>
                <button 
                  type="submit" 
                  className="tweet-btn"
                  disabled={loading || !newPost.trim()}
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {(activeTab === 'feed' || activeTab === 'explore') && (
          <div className="timeline">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="tweet"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="tweet-content">
                    <div className="tweet-header">
                      <div className="user-avatar" onClick={() => navigateToProfile(post.username)}>
                        <FaUser />
                      </div>
                      <div className="tweet-meta">
                        <span 
                          className="username"
                          onClick={() => handleUsernameClick(post.username)}
                        >
                          @{post.username}
                        </span>
                        <span className="tweet-time">·</span>
                        <span className="tweet-time">{formatDate(post.created_at)}</span>
                      </div>
                    </div>

                    <div className="tweet-text">
                      <p>{post.content}</p>
                      {post.image_url && (
                        <div className="tweet-image">
                          <img src={post.image_url} alt="Post content" />
                        </div>
                      )}
                    </div>

                    <div className="tweet-actions">
                      <button 
                        className="action-btn comment-action"
                        onClick={() => togglePostExpansion(post.id)}
                      >
                        <FaComment />
                        <span>{post.comments_count}</span>
                      </button>
                      <button 
                        className={`action-btn like-action ${post.user_liked ? 'liked' : ''}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <FaHeart />
                        <span>{post.likes_count}</span>
                      </button>
                      
                      <button className="action-btn share-action">
                        <FaShare />
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedPost === post.id && (
                        <motion.div
                          className="tweet-replies"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {user && (
                            <div className="reply-compose">
                              <div className="user-avatar small">
                                <FaUser />
                              </div>
                              <div className="reply-input-container">
                                <input
                                  type="text"
                                  placeholder="Tweet your reply"
                                  value={newComment[post.id] || ''}
                                  onChange={(e) => setNewComment(prev => ({
                                    ...prev,
                                    [post.id]: e.target.value
                                  }))}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(post.id);
                                    }
                                  }}
                                  maxLength={500}
                                />
                                <button 
                                  onClick={() => handleAddComment(post.id)}
                                  className="reply-btn"
                                  disabled={!newComment[post.id]?.trim()}
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="replies-list">
                            {comments[post.id]?.map((comment) => (
                              <div key={comment.id} className="reply">
                                <div className="user-avatar small" onClick={() => navigateToProfile(comment.username)}>
                                  <FaUser />
                                </div>
                                <div className="reply-content">
                                  <div className="reply-header">
                                    <span 
                                      className="username"
                                      onClick={() => handleUsernameClick(comment.username)}
                                    >
                                      @{comment.username}
                                    </span>
                                    <span className="reply-time">·</span>
                                    <span className="reply-time">{formatDate(comment.created_at)}</span>
                                  </div>
                                  <p className="reply-text">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {posts.length === 0 && (
              <motion.div 
                className="empty-timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h3>
                  {activeTab === 'feed' 
                    ? 'Your timeline is empty' 
                    : 'No posts yet'
                  }
                </h3>
                <p>
                  {activeTab === 'feed' 
                    ? 'Follow other users to see posts in your timeline!' 
                    : 'Be the first to share something with the UMN community!'
                  }
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;