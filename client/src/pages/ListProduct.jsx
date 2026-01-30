import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import '../Design/ListProduct.css';

const ListProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    description: '',
    price: '',
    imageUrl: [''] 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrl];
    newImageUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      imageUrl: newImageUrls
    }));
  };

  const addImageUrlField = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: [...prev.imageUrl, '']
    }));
  };

  const removeImageUrlField = (index) => {
    const newImageUrls = formData.imageUrl.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      imageUrl: newImageUrls.length > 0 ? newImageUrls : ['']
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      
      const filteredImageUrls = formData.imageUrl.filter(url => url.trim() !== '');
      
      const productData = {
        name: formData.name,
        quantity: parseInt(formData.quantity),
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: filteredImageUrls
      };

      await axios.post('/listProduct', productData);
      
      navigate('/marketplace', { state: { message: 'Product listed successfully!' } });
    } catch (err) {
      setError(err.message || 'Failed to list product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-product-container">
      <nav className="list-product-nav">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2>List Your Product</h2>
        <div></div>
      </nav>

      <div className="list-product-content">
        <div className="form-card">
          <div className="form-header">
            <h1>Add Product to Marketplace</h1>
            <p>Fill in the details to list your product</p>
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="currentColor"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Product Images</label>
              <p className="field-hint">Add URLs of product images</p>
              
              <div className="image-url-list">
                {formData.imageUrl.map((url, index) => (
                  <div key={index} className="image-url-item">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="image-url-input"
                    />
                    {formData.imageUrl.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrlField(index)}
                        className="remove-image-button"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addImageUrlField}
                className="add-image-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Image URL
              </button>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')} 
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Listing...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    List Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="tips-card">
          <h3>💡 Tips for Listing</h3>
          <ul>
            <li>Use clear, descriptive product names</li>
            <li>Add high-quality images for better visibility</li>
            <li>Write detailed descriptions to help buyers</li>
            <li>Set competitive prices</li>
            <li>Keep your stock quantity updated</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ListProduct;
