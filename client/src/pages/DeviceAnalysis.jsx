import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import '../Design/deviceAnalysis.css';

const DeviceAnalysis = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    deviceName: '',
    modelNumber: '',
    issue: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImages, setShowImages] = useState(false);
  const [expandedComponent, setExpandedComponent] = useState(null);
  const [componentDescription, setComponentDescription] = useState({});
  const [loadingDescription, setLoadingDescription] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAnalyze = async () => {
    if (!formData.deviceName || !formData.modelNumber || !formData.issue) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const endpoint = showImages ? '/analyze-device-image' : '/analyze-device-parts';
      const response = await axios.post(endpoint, formData);

      setAnalysisResult(response.data);
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getComponentDescription = async (componentName, deviceName) => {
    if (componentDescription[componentName]) {
      return; 
    }

    try {
      setLoadingDescription(componentName);
      
      const response = await axios.post('/get-component-description', {
        componentName,
        deviceName: formData.deviceName
      });

      setComponentDescription(prev => ({
        ...prev,
        [componentName]: response.data.description
      }));
    } catch (err) {
      console.error('Error fetching description:', err);
      setComponentDescription(prev => ({
        ...prev,
        [componentName]: 'Description not available at this time.'
      }));
    } finally {
      setLoadingDescription(null);
    }
  };

  const toggleComponentExpansion = (componentName) => {
    if (expandedComponent === componentName) {
      setExpandedComponent(null);
    } else {
      setExpandedComponent(componentName);
      if (!componentDescription[componentName]) {
        getComponentDescription(componentName);
      }
    }
  };

  const handleReset = () => {
    setFormData({ deviceName: '', modelNumber: '', issue: '' });
    setAnalysisResult(null);
    setError('');
    setShowImages(false);
    setExpandedComponent(null);
    setComponentDescription({});
  };

  const getWorkableParts = () => {
    return analysisResult?.workable_parts || analysisResult?.analysis?.workable_parts || [];
  };

  const getDamagedParts = () => {
    if (showImages && analysisResult?.damaged_parts) {
      return analysisResult.damaged_parts;
    }
    return (analysisResult?.analysis?.damaged_parts || []).map(name => ({ name }));
  };

  return (
    <div className="device-analysis-container">
      <nav className="device-analysis-nav">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h2>AI Device Analysis</h2>
        <div></div>
      </nav>

      <div className="device-analysis-content">
        {!analysisResult ? (
          <div className="analysis-form-section">
            <div className="form-header">
              <div className="header-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1>AI Device Analysis</h1>
              <p>Get intelligent diagnostics with interactive component insights</p>
            </div>

            <div className="analysis-form-card">
              {error && (
                <div className="error-message">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="currentColor"/>
                  </svg>
                  {error}
                </div>
              )}

              <form className="analysis-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="deviceName">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Device Name
                  </label>
                  <input
                    type="text"
                    id="deviceName"
                    name="deviceName"
                    value={formData.deviceName}
                    onChange={handleChange}
                    placeholder="e.g, iPhone 13 Pro"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modelNumber">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Model Number
                  </label>
                  <input
                    type="text"
                    id="modelNumber"
                    name="modelNumber"
                    value={formData.modelNumber}
                    onChange={handleChange}
                    placeholder="e.g, A2484"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="issue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Issue Description
                  </label>
                  <textarea
                    id="issue"
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    placeholder="Describe the problem in detail ..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-option">
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="showImages"
                      checked={showImages}
                      onChange={(e) => setShowImages(e.target.checked)}
                    />
                    <label htmlFor="showImages" className="checkbox-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Generate AI component images
                      <span className="option-note">(Takes 60-90 seconds to generate images)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="btn-analyze-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      {showImages ? 'Generating images...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Start AI Analysis
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="analysis-results-section">
            <div className="results-header">
              <div className="results-title-section">
                <div className="success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2>Analysis Complete</h2>
                  <p className="device-info">{analysisResult.device}</p>
                  <p className="interaction-hint">Click any component for detailed information</p>
                </div>
              </div>
              <button onClick={handleReset} className="btn-new-analysis">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Analysis
              </button>
            </div>

            <div className="results-grid">
              <div className="results-card workable-card">
                <div className="card-header">
                  <div className="card-icon workable-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3>Working Components</h3>
                    <p>{getWorkableParts().length} functional parts</p>
                  </div>
                </div>
                <div className="components-list">
                  {getWorkableParts().map((part, index) => (
                    <div key={index} className="component-item-interactive workable-item">
                      <button 
                        className="component-button"
                        onClick={() => toggleComponentExpansion(part)}
                      >
                        <div className="component-header">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="component-name">{part}</span>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor"
                            className={`expand-icon ${expandedComponent === part ? 'expanded' : ''}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {expandedComponent === part && (
                        <div className="component-description">
                          {loadingDescription === part ? (
                            <div className="description-loading">
                              <span className="spinner-small"></span>
                              <span>Getting description...</span>
                            </div>
                          ) : (
                            <p>{componentDescription[part] || 'Click to load description...'}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {getWorkableParts().length === 0 && (
                    <p className="empty-message">No working components identified</p>
                  )}
                </div>
              </div>

              <div className="results-card damaged-card">
                <div className="card-header">
                  <div className="card-icon damaged-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3>Damaged Components</h3>
                    <p>{getDamagedParts().length} Parts need replacement</p>
                  </div>
                </div>
                <div className="components-list">
                  {getDamagedParts().map((part, index) => (
                    <div key={index} className="component-item-interactive damaged-item">
                      <button 
                        className="component-button"
                        onClick={() => toggleComponentExpansion(part.name)}
                      >
                        <div className="component-header">
                          {part.imageUrl ? (
                            <div className="component-thumbnail">
                              <img src={part.imageUrl} alt={part.name} />
                            </div>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className="component-name">{part.name}</span>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor"
                            className={`expand-icon ${expandedComponent === part.name ? 'expanded' : ''}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {expandedComponent === part.name && (
                        <div className="component-expanded-view">
                          {part.imageUrl && (
                            <div className="component-image-large">
                              <img src={part.imageUrl} alt={part.name} />
                            </div>
                          )}
                          <div className="component-description">
                            {loadingDescription === part.name ? (
                              <div className="description-loading">
                                <span className="spinner-small"></span>
                                <span>Getting AI description...</span>
                              </div>
                            ) : (
                              <p>{componentDescription[part.name] || 'Click to load description...'}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {getDamagedParts().length === 0 && (
                    <p className="empty-message">No damaged components identified</p>
                  )}
                </div>
              </div>
            </div>

            <div className="summary-stats">
              <div className="stat-box">
                <div className="stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="stat-value">{getWorkableParts().length + getDamagedParts().length}</div>
                <div className="stat-label">Total Components</div>
              </div>
              <div className="stat-box success">
                <div className="stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-value">{getWorkableParts().length}</div>
                <div className="stat-label">Working</div>
              </div>
              <div className="stat-box danger">
                <div className="stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="stat-value">{getDamagedParts().length}</div>
                <div className="stat-label">Damaged</div>
              </div>
              <div className="stat-box health">
                <div className="stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="stat-value">
                  {((getWorkableParts().length / Math.max(1, getWorkableParts().length + getDamagedParts().length)) * 100).toFixed(0)}%
                </div>
                <div className="stat-label">Health Score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceAnalysis;
