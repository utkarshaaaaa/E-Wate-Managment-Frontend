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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Fetch seller's chat groups
  useEffect(() => {
    fetchSellerChats();
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
      path: '/marketplace'
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
      path: '/listProduct'
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
      path: '/update-product'
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
      path: '/deviceAnalysis'
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
      badge: totalUnread > 0 ? totalUnread : null
    }
  ];

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>TechQ</h2>
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
            <div>
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
                <p className="stat-label">Total Product Listed</p>
                <p className="stat-value">{user?.productsListed?.length || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Rating ⭐</p>
                <p className="stat-value">{user?.rating || 'N/A'}<span className="star" style={{fontSize: "42px", verticalAlign: "top"}}></span></p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Product Sold</p>
                <p className="stat-value">{user?.productsSold || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="navigation-section">
          <h2 className="section-title">Quick Access</h2>
          <div className="navigation-grid">
            {navigationCards.map((card, index) => (
              <Link to={card.path} key={index} className="nav-card">
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
