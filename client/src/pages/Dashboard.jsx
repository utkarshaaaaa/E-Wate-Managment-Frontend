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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      path: '/marketplace',
      accentColor: '#6366f1'
    },
    {
      title: 'List Product',
      description: 'Add your products to the marketplace',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      path: '/listProduct',
      accentColor: '#10b981'
    },
    {
      title: 'Manage Listings',
      description: 'Edit your listed products',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      path: `/update-product`,
      accentColor: '#06b6d4'
    },
    {
      title: 'Device Analysis',
      description: 'Analyze device performance and metrics',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      path: '/deviceAnalysis',
      accentColor: '#8b5cf6'
    },
    {
      title: 'Messages',
      description: 'Chat with buyers about your products',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      path: '/chats',
      badge: totalUnread > 0 ? totalUnread : null,
      accentColor: '#f59e0b'
    },
    {
      title: 'Reviews & Ratings',
      description: 'View customer reviews and ratings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      path: '/user-reviews',
      accentColor: '#ec4899'
    },
    {
      title: 'My Profile',
      description: 'Edit account info and preferences',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      path: '/edit-user-details',
      accentColor: '#3b82f6'
    },
    {
      title: 'Earnings & Wallet',
      description: 'Track balance and transaction history',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      path: '/earnings',
      accentColor: '#14b8a6'
    },
  ];

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="nav-brand">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div className="brand-text">
              <h2>EtechQ</h2>
              <span className="nav-subtitle">Device Health & Marketplace</span>
            </div>
          </div>
        </div>
        <div className="nav-right">
          <div className="user-menu">
            <div className="user-avatar">
              {user?.userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.userName}</span>
              <span className="user-email">{user?.userEmail}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <div className="welcome-header">
            <div className="welcome-text">
              <h1 className="welcome-title">Welcome back, {user?.userName}</h1>
              <p className="welcome-subtitle">Here's what's happening with your account today</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper stat-icon-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="stat-trend stat-trend-up">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="stat-content">
                <p className="stat-label">Products Listed</p>
                <p className="stat-value">{user?.productsListed?.length ?? 0}</p>
                <p className="stat-change">Active listings</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper stat-icon-success">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-trend stat-trend-up">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="stat-content">
                <p className="stat-label">Products Sold</p>
                <p className="stat-value">{user?.productsSold || 0}</p>
                <p className="stat-change">Total sales</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper stat-icon-warning">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
               
              </div>
              <div className="stat-content">
                <p className="stat-label">Rating Score</p>
                <p className="stat-value">{parseFloat(user?.rating).toFixed(2) || 'N/A'}</p>
                <p className="stat-change">Overall rating</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper stat-icon-info">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                {totalUnread > 0 && (
                  <div className="stat-badge stat-badge-alert">{totalUnread}</div>
                )}
              </div>
              <div className="stat-content">
                <p className="stat-label">Unread Messages</p>
                <p className="stat-value">{totalUnread}</p>
                <p className="stat-change">Pending responses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <h2 className="section-title">Quick Actions</h2>
              <p className="section-description">Access your most-used features</p>
            </div>
          </div>

          <div className="navigation-grid">
            {navigationCards.map((card, index) => (
              <Link 
                to={card.path} 
                key={index} 
                className="nav-card"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
