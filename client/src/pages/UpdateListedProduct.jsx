import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import '../Design/ListProduct.css';
import '../Design/UpdateProduct.css';

const UpdateListedProduct = () => {
  const { productId: paramProductId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    description: '',
    price: '',
    imageUrl: ['']
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProducts();
  }, []);

  useEffect(() => {
    if (paramProductId && products.length) {
      const existing = products.find(p => p.productId === paramProductId);
      if (existing) {
        setFormData({
          name: existing.name || '',
          quantity: existing.quantity || '',
          description: existing.description || '',
          price: existing.price || '',
          imageUrl: existing.imageUrl && existing.imageUrl.length ? existing.imageUrl : ['']
        });
      }
    }
  }, [paramProductId, products]);

  const fetchUserProducts = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      const res = await axios.get(`/userProfile/${user.id}`);
      const userObj = res.data;
      const list = userObj.productsListed || [];
      setProducts(list);
    } catch (err) {
      console.error('Error fetching user products:', err);
      setError('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrl];
    newImageUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrl: newImageUrls }));
  };

  const addImageUrlField = () => {
    setFormData(prev => ({ ...prev, imageUrl: [...prev.imageUrl, ''] }));
  };

  const removeImageUrlField = (index) => {
    const newImageUrls = formData.imageUrl.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, imageUrl: newImageUrls.length > 0 ? newImageUrls : [''] }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!paramProductId) return;
    setError('');

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        quantity: parseInt(formData.quantity, 10),
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl.filter(u => u && u.trim() !== '')
      };

      await axios.put(`/editProduct/${paramProductId}`, payload);
      await fetchUserProducts();
      alert('Product updated successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-large"></div>
      <p>Loading your products...</p>
    </div>
  );

  if (!paramProductId) {
    return (
      <div className="list-product-container">
        <nav className="list-product-nav">
          <button onClick={() => navigate('/dashboard')} className="back-button">Back</button>
          <h2>Your Listings</h2>
          <div></div>
        </nav>

        <div className="list-product-content">
          {products.length === 0 ? (
            <div className="empty-state">
              <p>No products listed yet.</p>
            </div>
          ) : (
            <div className="product-list-grid">
              {products.map(p => (
                <div key={p.productId} className="product-card">
                  <h3>{p.name}</h3>
                  <p>Price: ₹{p.price}</p>
                  <p>Qty: {p.quantity}</p>
                  <div className="product-card-actions">
                    <button onClick={() => navigate(`/update-product/${p.productId}`)} className="btn-primary">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="list-product-container">
      <nav className="list-product-nav">
        <button onClick={() => navigate('/update-product')} className="back-button">Back</button>
        <h2>Edit Product</h2>
        <div></div>
      </nav>

      <div className="list-product-content">
        <div className="form-card">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleEditSubmit} className="product-form">
            <div className="form-group">
              <label>Product Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} min="1" required />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} step="0.01" min="0.01" required />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
            </div>

            <div className="form-group">
              <label>Product Images</label>
              <div className="image-url-list">
                {formData.imageUrl.map((url, index) => (
                  <div key={index} className="image-url-item">
                    <input value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} />
                    {formData.imageUrl.length > 1 && (
                      <button type="button" onClick={() => removeImageUrlField(index)} className="remove-image-button">Remove</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addImageUrlField} className="add-image-button">Add Image</button>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/update-product')} className="btn-cancel">Cancel</button>
              <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateListedProduct;
