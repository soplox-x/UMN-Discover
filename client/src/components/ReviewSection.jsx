import React, { useState, useEffect } from 'react';
import { FaStar, FaUser, FaMapMarkerAlt, FaEdit, FaTrash, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewSection = ({ reviewType, targetId, targetName, user }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    isAnonymous: false
  });

  useEffect(() => {
    fetchReviews();
    if (user) {
      fetchUserReview();
    }
  }, [reviewType, targetId, user]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews/${reviewType}/${encodeURIComponent(targetId)}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/reviews/user/${reviewType}/${encodeURIComponent(targetId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setUserReview(data.data);
        setFormData({
          rating: data.data.rating,
          comment: data.data.comment || '',
          isAnonymous: data.data.is_anonymous
        });
      }
    } catch (error) {
      console.error('Failed to fetch user review:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to leave a review');
      return;
    }

    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/reviews/${reviewType}/${encodeURIComponent(targetId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setUserReview(data.data);
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews to update stats
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/reviews/${reviewType}/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserReview(null);
        setFormData({
          rating: 0,
          comment: '',
          isAnonymous: false
        });
        fetchReviews(); // Refresh reviews to update stats
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onStarClick(star) : undefined}
            disabled={!interactive}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Student Reviews</h2>
        <p>Real feedback from UMN students</p>
      </div>

      {/* Overall Rating Stats */}
      {stats && parseInt(stats.total_reviews) > 0 && (
        <div className="rating-overview">
          <div className="overall-rating">
            <div className="rating-number">{parseFloat(stats.average_rating).toFixed(1)}</div>
            <div className="rating-stars">
              {renderStars(Math.round(parseFloat(stats.average_rating)))}
            </div>
            <div className="rating-count">{stats.total_reviews} reviews</div>
          </div>
          
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map(star => {
              const count = parseInt(stats[`${star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'}_star`]);
              const percentage = stats.total_reviews > 0 ? (count / parseInt(stats.total_reviews)) * 100 : 0;
              
              return (
                <div key={star} className="rating-bar-row">
                  <span className="star-label">{star}</span>
                  <FaStar className="star-icon" />
                  <div className="rating-bar">
                    <div 
                      className="rating-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User's Review Section */}
      {user && (
        <div className="user-review-section">
          {userReview ? (
            <div className="user-review-card">
              <div className="user-review-header">
                <h3>Your Review</h3>
                <div className="user-review-actions">
                  <button 
                    className="edit-review-btn"
                    onClick={() => setShowReviewForm(true)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    className="delete-review-btn"
                    onClick={handleDeleteReview}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              <div className="user-review-content">
                <div className="review-rating">
                  {renderStars(userReview.rating)}
                </div>
                {userReview.comment && (
                  <p className="review-comment">{userReview.comment}</p>
                )}
                {userReview.is_anonymous && (
                  <div className="anonymous-badge">
                    <FaEyeSlash /> Posted anonymously
                  </div>
                )}
                <div className="review-date">
                  Reviewed on {formatDate(userReview.created_at)}
                </div>
              </div>
            </div>
          ) : (
            <button 
              className="add-review-btn"
              onClick={() => setShowReviewForm(true)}
            >
              <FaStar /> Write a Review
            </button>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            className="review-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              className="review-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="review-modal-header">
                <h3>Review {targetName}</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowReviewForm(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-group">
                  <label>Rating *</label>
                  <div className="rating-input">
                    {renderStars(formData.rating, true, (rating) => 
                      setFormData(prev => ({ ...prev, rating }))
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Comment (optional)</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience..."
                    maxLength={1000}
                    rows={4}
                  />
                  <div className="char-count">{formData.comment.length}/1000</div>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    />
                    <span className="checkbox-text">
                      <FaEyeSlash /> Post anonymously
                    </span>
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={submitting || formData.rating === 0}
                  >
                    {submitting ? 'Saving...' : userReview ? 'Update Review' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="review-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.avatar_url ? (
                      <img src={review.avatar_url} alt={review.username} />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <div className="reviewer-details">
                    <span className="reviewer-name">{review.username}</span>
                    <span className="review-date">{formatDate(review.created_at)}</span>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {review.comment && (
                <div className="review-content">
                  <p>{review.comment}</p>
                </div>
              )}
              
              <div className="review-meta">
                {review.is_anonymous && (
                  <div className="anonymous-badge">
                    <FaEyeSlash /> Anonymous
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-reviews">
            <h3>No reviews yet</h3>
            <p>Be the first to review {targetName}!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;