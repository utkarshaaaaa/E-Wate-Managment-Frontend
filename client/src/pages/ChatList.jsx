import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import '../Design/chatList.css';

const ChatList = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'buyer', 'seller'

  useEffect(() => {
    fetchChats();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/chat/my-chats');
      setChats(response.data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const getFilteredChats = () => {
    if (filter === 'buyer') {
      return chats.filter(chat => !chat.isSeller);
    } else if (filter === 'seller') {
      return chats.filter(chat => chat.isSeller);
    }
    return chats;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  if (loading) {
    return (
      <div className="chat-list-container">
        <div className="chat-list-loading">
          <div className="spinner-large"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <div className="header-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div>
            <h1>Messages</h1>
            {totalUnread > 0 && (
              <span className="total-unread-badge">{totalUnread} unread</span>
            )}
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="back-button-small">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="chat-filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
          <span className="tab-count">{chats.length}</span>
        </button>
        <button 
          className={`filter-tab ${filter === 'buyer' ? 'active' : ''}`}
          onClick={() => setFilter('buyer')}
        >
          Buying
          <span className="tab-count">{chats.filter(c => !c.isSeller).length}</span>
        </button>
        <button 
          className={`filter-tab ${filter === 'seller' ? 'active' : ''}`}
          onClick={() => setFilter('seller')}
        >
          Selling
          <span className="tab-count">{chats.filter(c => c.isSeller).length}</span>
        </button>
      </div>

      <div className="chat-list-content">
        {getFilteredChats().length === 0 ? (
          <div className="empty-chats">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3>No messages yet</h3>
            <p>Start a conversation by contacting a seller</p>
            <button onClick={() => navigate('/marketplace')} className="btn-browse">
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="chats-list">
            {getFilteredChats().map((chat) => (
              <div 
                key={chat._id} 
                className={`chat-item ${chat.unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => handleChatClick(chat._id)}
              >
                <div className="chat-item-avatar">
                  {chat.isSeller ? (
                    <div className="avatar-group">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {chat.participantCount > 0 && (
                        <span className="participant-count">{chat.participantCount}</span>
                      )}
                    </div>
                  ) : (
                    chat.sellerId?.profileImageUrl ? (
                      <img src={chat.sellerId.profileImageUrl} alt={chat.sellerId.userName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {chat.sellerId?.userName?.charAt(0).toUpperCase() || 'S'}
                      </div>
                    )
                  )}
                </div>

                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <h3 className="chat-product-name">{chat.productName}</h3>
                    <span className="chat-time">{formatTime(chat.lastMessageAt)}</span>
                  </div>
                  <div className="chat-item-footer">
                    {chat.isSeller ? (
                      <p className="chat-preview">
                        <span className="seller-badge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Selling
                        </span>
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    ) : (
                      <p className="chat-preview">
                        <span className="buyer-badge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Buying
                        </span>
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="unread-badge">{chat.unreadCount}</span>
                    )}
                  </div>
                </div>

                <svg className="chat-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
