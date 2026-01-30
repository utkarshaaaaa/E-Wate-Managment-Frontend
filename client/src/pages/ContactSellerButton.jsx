import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import '../Design/contactSellerButton.css';

const ContactSellerButton = ({ productId: propProductId, sellerId: propSellerId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { productId: urlProductId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Use productId from props or URL params
  const productId = propProductId || urlProductId;
  const [sellerId, setSellerId] = useState(propSellerId);

  // Fetch productId and sellerId if not provided as props
  useEffect(() => {
    if (!propSellerId && productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get(`/products/${productId}`);
      if (response.data.product) {
        setSellerId(response.data.product.sellerId);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setFetchingData(false);
    }
  };

  // Don't show button if user is the seller
  if (user && sellerId === user.id) {
    return null;
  }
console.log('Debug - Rendering ContactSellerButton with:', { productId, sellerId, currentUserId: user?.id });
  if (fetchingData) {
    return <button className="contact-seller-button" disabled>Loading...</button>;
  } 

  const handleContactSeller = async () => {
    try {
      setLoading(true);
      
      console.log('Debug - ContactSellerButton Values:', {
        productId,
        sellerId,
        currentUserId: user?.id
      });
      
      const response = await axios.post('/chat/get-or-create-group', {
        productId
      });

      if (response.data.success) {
        navigate(`/chat/${response.data.chatGroup._id}`);
      }
    } catch (error) {
      console.error('Error contacting seller:', error);
      alert(error.message || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleContactSeller}
      className="contact-seller-button"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner-btn"></span>
          Connecting...
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contact Seller
        </>
      )}
    </button>
  );
};

export default ContactSellerButton;
