import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../config/axios';
import '../Design/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chatGroups, setChatGroups] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchSellerChats();
    fetchProfile();
    const onProductListed = (e) => {
      const newProduct = e?.detail?.product;
      setProfile(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (!Array.isArray(updated.productsListed)) updated.productsListed = [];
        if (newProduct && newProduct._id) {
          const exists = updated.productsListed.some(p => p._id === newProduct._id || p.productId === newProduct._id);
          if (!exists) updated.productsListed = [...updated.productsListed, newProduct];
        } else {
          updated.productsListed = [...updated.productsListed, newProduct || {}];
        }
        return updated;
      });
    };
    window.addEventListener('productListed', onProductListed);
    return () => window.removeEventListener('productListed', onProductListed);
  }, []);

  const fetchSellerChats = async () => {
    try {
      setLoadingChats(true);
      const response = await axios.get('/chat/my-chats');
      if (response.data.chats) {
        setChatGroups(response.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const userId = user?.id;
      if (!userId) return;
      const res = await axios.get(`/userProfile/${userId}`);
      const fetchedUser = res.data.user || res.data;
      setProfile(fetchedUser);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };
  const unreadChats = chatGroups.filter(chat => chat.unreadCount > 0);
  const totalUnread = chatGroups.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };
  const navigationCards = [
    {
      title: 'Marketplace',
      description: 'Browse and purchase products from sellers',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/marketplace',
      accentColor: '#667eea'
    },
    {
      title: 'List Product',
      description: 'Add your products to the marketplace',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: '/listProduct',
      accentColor: '#f093fb'
    },
    {
      title: 'Manage Listings',
      description: 'Edit your listed products',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #8bd3dd 0%, #5ee7df 100%)',
      path: `/update-product`,
      accentColor: '#5ee7df'
    },
    {
      title: 'Device Analysis',
      description: 'Analyze device performance and metrics',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: '/deviceAnalysis',
      accentColor: '#4facfe'
    },
    {
      title: 'Messages',
      description: 'Chat with buyers about your products',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: '/chats',
      badge: totalUnread > 0 ? totalUnread : null,
      accentColor: '#fa709a'
    },
    {
      title: 'Reviews & Ratings',
      description: 'View customer reviews and ratings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"  fill="none" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 492.289"><defs><linearGradient id="prefix__a" gradientUnits="userSpaceOnUse" x1="258.396" y1="19.906" x2="258.4" y2="416.813"><stop offset="0" stop-color="#FFD433"/><stop offset=".471" stop-color="#FABE2B"/><stop offset="1" stop-color="#F4A722"/></linearGradient></defs><path fill="#F0B100" fill-rule="nonzero" d="M393.868 314.547l27.71 162.547a13.5 13.5 0 01-.046 4.067l-.024.119a13.26 13.26 0 01-1.373 3.971 13.22 13.22 0 01-7.843 6.442c-3.241.986-6.87.737-10.091-.985l-145.502-77.825-144.909 77.503a13.048 13.048 0 01-4.332 1.669c-1.48.285-3.052.315-4.628.06l-.136-.027a13.254 13.254 0 01-8.502-5.321 13.247 13.247 0 01-2.336-9.882l26.741-162.275L4.215 198.002a13.304 13.304 0 01-2.707-3.567 13.263 13.263 0 01-1.376-4.276 13.257 13.257 0 012.537-9.832 13.25 13.25 0 018.745-5.175l159.774-22.883L244.819 7.353a13.313 13.313 0 012.462-3.433 13.212 13.212 0 013.44-2.495 13.276 13.276 0 0110.135-.759 13.23 13.23 0 017.696 6.631l72.978 144.982 159.074 22.869c1.363.196 2.72.617 3.987 1.241 1.218.601 2.369 1.4 3.394 2.399a13.259 13.259 0 014.014 9.335 13.256 13.256 0 01-3.755 9.434l-114.376 116.99z"/><path fill="url(#prefix__a)" d="M408.438 479.015l-28.808-168.89L498.73 188.3l-165.937-23.854L256.7 13.279l-76.805 151.167L13.284 188.3l119.503 121.825-27.827 168.89 151.74-81.162z"/></svg>
      ),
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      path: '/user-reviews',
      accentColor: '#a8edea'
    },
    {
      title: 'My Profile',
      description: 'Edit account info and preferences',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: '/edit-user-details',
      accentColor: '#fee140'
    },
    {
      title: 'Earnings & Wallet',
      description: 'Track balance and transaction history',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      path: '/earnings',
      accentColor: '#38ef7d'
    },
   
  ];

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>EtechQ</h2>
          <span className="nav-subtitle">E-Waste Management</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="welcome-header">
            <div className="avatar">
              {user?.userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="welcome-text">
              <h1 className="welcome-title">Welcome back, {user?.userName}!</h1>
              <p className="welcome-subtitle">{user?.userEmail}</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Products Listed</p>
                <p className="stat-value">{user?.productsListed?.length ?? 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #09bae2 0%, #0cb2cf 100%)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 492.289"><defs><linearGradient id="prefix__a" gradientUnits="userSpaceOnUse" x1="258.396" y1="19.906" x2="258.4" y2="416.813"><stop offset="0" stop-color="#FFD433"/><stop offset=".471" stop-color="#FABE2B"/><stop offset="1" stop-color="#F4A722"/></linearGradient></defs><path fill="#F0B100" fill-rule="nonzero" d="M393.868 314.547l27.71 162.547a13.5 13.5 0 01-.046 4.067l-.024.119a13.26 13.26 0 01-1.373 3.971 13.22 13.22 0 01-7.843 6.442c-3.241.986-6.87.737-10.091-.985l-145.502-77.825-144.909 77.503a13.048 13.048 0 01-4.332 1.669c-1.48.285-3.052.315-4.628.06l-.136-.027a13.254 13.254 0 01-8.502-5.321 13.247 13.247 0 01-2.336-9.882l26.741-162.275L4.215 198.002a13.304 13.304 0 01-2.707-3.567 13.263 13.263 0 01-1.376-4.276 13.257 13.257 0 012.537-9.832 13.25 13.25 0 018.745-5.175l159.774-22.883L244.819 7.353a13.313 13.313 0 012.462-3.433 13.212 13.212 0 013.44-2.495 13.276 13.276 0 0110.135-.759 13.23 13.23 0 017.696 6.631l72.978 144.982 159.074 22.869c1.363.196 2.72.617 3.987 1.241 1.218.601 2.369 1.4 3.394 2.399a13.259 13.259 0 014.014 9.335 13.256 13.256 0 01-3.755 9.434l-114.376 116.99z"/><path fill="url(#prefix__a)" d="M408.438 479.015l-28.808-168.89L498.73 188.3l-165.937-23.854L256.7 13.279l-76.805 151.167L13.284 188.3l119.503 121.825-27.827 168.89 151.74-81.162z"/></svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Rating</p>
                <p className="stat-value">{parseFloat(user?.rating).toFixed(2) || 'N/A'}<span className="star" style={{fontSize: "42px", verticalAlign: "top"}}>⭐</span></p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Products Sold</p>
                <p className="stat-value">{user?.productsSold || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="navigation-section">
          <div className="section-header">
            <h2 className="section-title">Quick Access</h2>
            <p className="section-subtitle">Manage your business with ease</p>
          </div>
          <div className="navigation-grid">
            {navigationCards.map((card, index) => (
              <Link 
                to={card.path} 
                key={index} 
                className="nav-card"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={hoveredCard === index ? { '--accent-color': card.accentColor } : {}}
              >
                <div className="nav-card-icon" style={{ background: card.gradient }}>
                  {card.icon}
                  {card.badge && (
                    <span className="nav-card-badge">{card.badge > 99 ? '99+' : card.badge}</span>
                  )}
                </div>
                <div className="nav-card-content">
                  <h3 className="nav-card-title">{card.title}</h3>
                  <p className="nav-card-description">{card.description}</p>
                </div>
                <div className="nav-card-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
