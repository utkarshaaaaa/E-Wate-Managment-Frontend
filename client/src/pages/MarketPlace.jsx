import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import '../Design/marketplace.css';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [allProducts, setAllProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const cardRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = entry.target.getAttribute('data-product-id');
            setVisibleProducts((prev) => new Set([...prev, productId]));
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px',
      }
    );

    Object.values(cardRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(cardRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products');
      const fetched = response.data.products || [];
      setAllProducts(fetched);
      setProducts(fetched);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    try {
      setSearching(true);
      const response = await axios.get(`/search?name=${encodeURIComponent(searchQuery)}`);
      const fetched = response.data.results.map(r => r.product) || [];
      setAllProducts(fetched);
      applyFilters(fetched, minPrice, maxPrice);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await axios.post('/aiSearch', { query: searchQuery });
      const fetched = response.data.results.map(r => r.product) || [];
      setAllProducts(fetched);
      applyFilters(fetched, minPrice, maxPrice);
    } catch (error) {
      console.error('Error with AI search:', error);
    } finally {
      setSearching(false);
    }
  };

  const applyFilters = (productList, min, max) => {
    const filtered = productList.filter(
      product => Number(product.price) >= min && Number(product.price) <= max
    );
    setProducts(filtered);
  };

  const handlePriceChange = (type, value) => {
    const numValue = Number(value);
    if (type === 'min') {
      setMinPrice(numValue);
      applyFilters(allProducts, numValue, maxPrice);
    } else {
      setMaxPrice(numValue);
      applyFilters(allProducts, minPrice, numValue);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };
  
  return (
    <div className="marketplace-container">
      <nav className="marketplace-nav">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2>Marketplace</h2>
        <div></div>
      </nav>

      <div className="marketplace-content">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button" disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
            <button type="button" onClick={handleAISearch} className="ai-search-button" disabled={searching}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Search
            </button>
            <button 
              type="button" 
              onClick={() => setShowFilter(!showFilter)}
              className={`filter-toggle-button ${showFilter ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </form>
        </div>

        {showFilter && (
          <div className="filter-section">
          <div className="filter-header">
            <h3>Filter by Price</h3>
          </div>
          <div className="price-filter">
            <div className="price-input-group">
              <label htmlFor="minPrice">Min Price</label>
              <div className="price-input-wrapper">
                <span className="currency">₹</span>
                <input
                  type="range"
                  id="minPrice"
                  min="0"
                  max="100000"
                  step="100"
                  value={minPrice}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="price-range-input"
                />
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="price-number-input"
                  min="0"
                  max="100000"
                />
              </div>
            </div>

            <div className="price-input-group">
              <label htmlFor="maxPrice">Max Price</label>
              <div className="price-input-wrapper">
                <span className="currency">₹</span>
                <input
                  type="range"
                  id="maxPrice"
                  min="0"
                  max="100000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="price-range-input"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="price-number-input"
                  min="0"
                  max="100000"
                />
              </div>
            </div>

            <div className="price-range-display">
              <span className="price-label">Selected Range: ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3>No products found</h3>
            <p>Try adjusting your search or check back later</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div 
                key={product.productId} 
                ref={(el) => (cardRefs.current[product.productId] = el)}
                data-product-id={product.productId}
                className={`product-card ${visibleProducts.has(product.productId) ? 'visible' : ''}`}
                onClick={() => handleProductClick(product.productId)}
              >
                <div className="product-image">
                  {product.imageUrl && product.imageUrl.length > 0 ? (
                    <img src={product.imageUrl[0]} alt={product.name} />
                  ) : (
                    <div className="product-image-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">₹{product.price?.toFixed(2) || '0.00'}</span>
                    <span className="product-quantity">Qty: {product.quantity || 0}</span>
                  </div>
                  {product.rating > 0 && (
                    <div className="product-rating">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="gold" stroke="gold">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
