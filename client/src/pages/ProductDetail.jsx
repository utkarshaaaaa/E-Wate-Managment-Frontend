import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import '../Design/productDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${productId}`);
      setProduct(response.data.product);

      if (response.data.product.sellerId) {
        fetchSellerProfile(response.data.product.sellerId);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProfile = async (sellerId) => {
    try {
      const response = await axios.get(`/userProfile/${sellerId}`);
      setSellerProfile(response.data);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    }
  };
  console.log('Debug - ProductDetail Values:', {
    productId,
    product,
    sellerProfile,
    reviews
  });

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!product.sellerId) return;

    try {
      setSubmittingReview(true);
      const response = await axios.post('/submitReview', {
        sellerId: product.sellerId,
        rating: rating,
        review: reviewText,
      });

      setReviews(response.data.allReviews);
      setShowReviewForm(false);
      setReviewText('');
      setRating(5);
      
      fetchSellerProfile(product.sellerId);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="error-container">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/marketplace')} className="back-button">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const images = product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl : [];

  return (
    <div className="product-detail-container">
      <nav className="product-nav">
        <button onClick={() => navigate('/marketplace')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </button>
      </nav>

      <div className="product-detail-content">
        <div className="product-images-section">
          <div className="main-image">
            {images.length > 0 ? (
              <img src={images[selectedImage]} alt={product.name} />
            ) : (
              <div className="image-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-images">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-details-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            {product.rating > 0 && (
              <div className="product-rating-display">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={i < Math.floor(product.rating) ? "#fbbf24" : "none"}
                      stroke="#fbbf24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="product-price-section">
            <div className="price">₹{product.price?.toFixed(2)}</div>
            <div className="stock-info">
              {product.quantity > 0 ? (
                <span className="in-stock">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {product.quantity} in stock
                </span>
              ) : (
                <span className="out-of-stock">Out of stock</span>
              )}
            </div>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-actions">
            <button className="buy-button" disabled={product.quantity === 0}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className="contact-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Seller
            </button>
          </div>

          {sellerProfile && (
            <div className="seller-info-card">
              <h3>Seller Information</h3>
              <div className="seller-details">
                {sellerProfile.profileImageUrl && (
                  <img src={sellerProfile.profileImageUrl} alt="Seller" className="seller-avatar" />
                )}
                <div className="seller-text">
                  <h4>{sellerProfile.userName}</h4>
                  <div className="seller-stats">
                    <span>⭐ {sellerProfile.rating?.toFixed(1) || 'New'}</span>
                    <span>📦 {sellerProfile.productSold || 0} sold</span>
                    <span>💬 {reviews.length} reviews</span>
                  </div>
                </div>
              </div>
              <button 
                className="view-profile-button"
                onClick={() => navigate(`/seller/${product.sellerId}`)}
              >
                View Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {sellerProfile && (
        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Customer Reviews</h2>
            <button 
              className="write-review-button"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              Write a Review
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="rating-input">
                <label>Rating:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={star <= rating ? "#fbbf24" : "none"}
                      stroke="#fbbf24"
                      onClick={() => setRating(star)}
                      style={{ cursor: 'pointer' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                required
                rows="4"
              />
              <div className="review-form-actions">
                <button type="button" onClick={() => setShowReviewForm(false)}>Cancel</button>
                <button type="submit" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={i < review.rating ? "#fbbf24" : "none"}
                          stroke="#fbbf24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="review-author">Reviewer #{review.reviewerId?.slice(-6)}</span>
                  </div>
                  <p className="review-text">{review.review}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
