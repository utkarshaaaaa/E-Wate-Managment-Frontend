import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../config/axios";
import ContactSellerButton from "./ContactSellerButton";
import "../Design/productDetails.css";

const ProductDetails = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, review: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${productId}`);
      setProduct(response.data.product);

      if (response.data.product.sellerId) {
        const sellerResponse = await axios.get(
          `/userProfile/${response.data.product.sellerId}`,
        );
        setSeller(sellerResponse.data);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!product?.sellerId) return;

    try {
      setSubmitting(true);
      await axios.post("/submitReview", {
        sellerId: product.sellerId,
        rating: reviewData.rating,
        review: reviewData.review,
      });
      setShowReviewForm(false);
      setReviewData({ rating: 5, review: "" });
      const sellerResponse = await axios.get(
        `/userProfile/${product.sellerId}`,
      );
      setSeller(sellerResponse.data);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product not found</h2>
        <button
          onClick={() => navigate("/marketplace")}
          className="back-button"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const images = product.imageUrl || [];

  return (
    <div className="product-details-container">
      <nav className="product-nav">
        <button
          onClick={() => navigate("/marketplace")}
          className="back-button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Marketplace
        </button>
      </nav>

      <div className="product-details-content">
        <div className="product-gallery">
          <div className="main-image">
            {images.length > 0 ? (
              <img src={images[currentImageIndex]} alt={product.name} />
            ) : (
              <div className="image-placeholder">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-grid">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-main-info">
          <h1 className="product-title">{product.name}</h1>

          {product.rating > 0 && (
            <div className="product-rating-display">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={i < Math.round(product.rating) ? "gold" : "none"}
                  stroke="gold"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
              <span className="rating-number">{product.rating.toFixed(1)}</span>
            </div>
          )}

          <div className="product-price-section">
            <span className="product-price-large">
              ₹{product.price?.toFixed(2) || "0.00"}
            </span>
            <span className="product-stock">
              {product.quantity > 0
                ? `${product.quantity} in stock`
                : "Out of stock"}
            </span>
          </div>

          <div className="product-description-section">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-actions">
            <button className="btn-primary">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Cart
            </button>
            <ContactSellerButton 
              productId={product._id} 
              sellerId={product.sellerId} 
            />
          </div>
        </div>
      </div>

      {seller && (
        <div className="seller-section">
          <h2>Seller Information</h2>
          <div className="seller-card">
            <div className="seller-avatar">
              {seller.profileImageUrl ? (
                <img src={seller.profileImageUrl} alt={seller.userName} />
              ) : (
                seller.userName?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="seller-info">
              <h3>{seller.userName}</h3>
              <div className="seller-stats">
                <span>⭐ {seller.rating?.toFixed(1) || "0.0"} rating</span>
                <span>📦 {seller.productSold || 0} products sold</span>
                <span>💬 {seller.reviews?.length || 0} reviews</span>
              </div>
            </div>
            <button
              className="review-button"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              Write a Review
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <h3>Write a Review</h3>
              <div className="rating-input">
                <label>Rating:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewData({ ...reviewData, rating: star })
                      }
                      className={star <= reviewData.rating ? "active" : ""}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div className="review-text">
                <label>Your Review:</label>
                <textarea
                  value={reviewData.review}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, review: e.target.value })
                  }
                  placeholder="Share your experience..."
                  rows="4"
                  required
                />
              </div>
              <div className="review-actions">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}

          {seller.reviews && seller.reviews.length > 0 && (
            <div className="reviews-list">
              <h3>Reviews ({seller.reviews.length})</h3>
              {seller.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <strong className="reviewer-name">
                    {review.reviewerName || "Anonymous"}
                  </strong>
                  <br/>
                  <div className="review-header">
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? "⭐" : "☆"}</span>
                      ))}
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-text">{review.review}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
