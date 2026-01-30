import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import '../Design/chatConversation.css';

const ChatConversation = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatInfo();
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatInfo = async () => {
    try {
      const response = await axios.get(`/chat/chat-info/${chatId}`);
      setChatInfo(response.data.chatInfo);
    } catch (error) {
      console.error('Error fetching chat info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/chat/messages/${chatId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await axios.post('/chat/send-message', {
        chatGroupId: chatId,
        message: newMessage.trim()
      });
      
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = () => {
    const grouped = {};
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="chat-conversation-container">
        <div className="chat-loading">
          <div className="spinner-large"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!chatInfo) {
    return (
      <div className="chat-conversation-container">
        <div className="chat-error">
          <h3>Chat not found</h3>
          <button onClick={() => navigate('/chats')} className="btn-back">
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="chat-conversation-container">
      {/* Chat Header */}
      <div className="chat-header">
        <button onClick={() => navigate('/chats')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="chat-header-info">
          <div className="product-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="product-name">{chatInfo.productName}</h2>
            <p className="chat-subtitle">
              {chatInfo.isSeller ? (
                <>
                  <span className="role-badge seller">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Selling
                  </span>
                  {chatInfo.participantCount} {chatInfo.participantCount === 1 ? 'buyer' : 'buyers'}
                </>
              ) : (
                <>
                  <span className="role-badge buyer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Buying
                  </span>
                  Seller: {chatInfo.sellerId.userName}
                </>
              )}
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/product/${chatInfo.productId}`)} 
          className="view-product-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Product
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-area">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="no-messages">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3>No messages yet</h3>
            <p>Start the conversation!</p>
          </div>
        ) : (
          Object.keys(groupedMessages).map(date => (
            <div key={date} className="message-date-group">
              <div className="date-divider">
                <span>{formatDate(new Date(date))}</span>
              </div>
              
              {groupedMessages[date].map((message, index) => {
                const isOwnMessage = message.senderId._id === user?.id || 
                                    message.senderId.Id === user?.id;
                
                return (
                  <div 
                    key={message._id || index} 
                    className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}
                  >
                    {!isOwnMessage && (
                      <div className="message-avatar">
                        {message.senderId.profileImageUrl ? (
                          <img src={message.senderId.profileImageUrl} alt={message.senderId.userName} />
                        ) : (
                          <div className="avatar-placeholder-small">
                            {message.senderId.userName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="message-bubble">
                      {!isOwnMessage && (
                        <span className="sender-name">{message.senderId.userName}</span>
                      )}
                      <p className="message-text">{message.message}</p>
                      <div className="message-time">
                        {formatTime(message.createdAt)}
                        {isOwnMessage && message.isRead && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="read-check">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!chatInfo.isClosed ? (
        <form onSubmit={handleSendMessage} className="chat-input-area">
          <div className="input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <span className="spinner-small"></span>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="chat-closed-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          This chat has been closed by the seller
        </div>
      )}
    </div>
  );
};

export default ChatConversation;
