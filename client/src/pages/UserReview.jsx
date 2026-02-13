import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import '../Design/UserReview.css';

const UserReview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('highest'); 

  useEffect(() => {
    fetchUserReviews();
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const url =  '/userReviewRating';
      const res = await axios.get(url);
      if (res.data) {
        const fetched = res.data.reviews || [];
        setReviews(fetched);
        if (fetched.length > 0) {
          const sum = fetched.reduce((s, r) => s + (Number(r.rating) || 0), 0);
          const avg = sum / fetched.length;
          setRating(avg);
        } else {
          setRating(0);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (order) => {
    setSortOrder(order);
    const sorted = [...reviews].sort((a, b) => {
      if (order === 'highest') {
        return b.rating - a.rating;
      } else {
        return a.rating - b.rating;
      }
    });
    setReviews(sorted);
  };

  const getSortedReviews = () => {
    return [...reviews].sort((a, b) => {
      if (sortOrder === 'highest') {
        return b.rating - a.rating;
      } else {
        return a.rating - b.rating;
      }
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={star <= rating ? 'currentColor' : 'none'}
            stroke="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="review-container">
      <nav className="review-nav">
        <div className="nav-brand">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* <div className="nav-title-Review">
            <h2>My Reviews & Ratings</h2>
          </div> */}
          
        </div>
      </nav>
      

      <div className="review-content">
        <div className="rating-card">
          <div className="rating-display">
            <div className="rating-value">{rating.toFixed(1)}</div>
            <div className="rating-stars">
              {renderStars(Math.round(rating))}
            </div>
            <p className="rating-text">Overall Rating</p>
            <p className="review-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
          </div>
        </div>
        <div className="sort-section">
          <h3 className="sort-title">Sort By Rating</h3>
          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortOrder === 'highest' ? 'active' : ''}`}
              onClick={() => handleSort('highest')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Highest to Lowest
            </button>
            <button
              className={`sort-btn ${sortOrder === 'lowest' ? 'active' : ''}`}
              onClick={() => handleSort('lowest')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v12m0 0l4-4m-4 4l-4-4m6-8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Lowest to Highest
            </button>
          </div>
        </div>

        <div className="reviews-section">
          <h3 className="reviews-title">Customer Reviews</h3>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h4>No Reviews Yet</h4>
              <p>You don't have any reviews yet. Keep selling great products!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {getSortedReviews().map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.reviewerName?.charAt(0).toUpperCase() || 'R'}
                      </div>
                      <div className="reviewer-details">
                        <h4 className="reviewer-name">{review.reviewerName || 'Anonymous'}</h4>
                        <p className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="review-rating-badge">
                      {renderStars(review.rating)}
                      <span className="rating-number">{review.rating}.0</span>
                    </div>
                  </div>
                  <div className="review-content-text">
                    <p>{review.review || 'No review text provided'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReview;
