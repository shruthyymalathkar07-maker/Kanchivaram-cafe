import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled Error Caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#0f3823', color: '#ffffff', fontFamily: 'sans-serif', minHeight: '100vh' }}>
          <h1 style={{ color: '#f87171', fontSize: '24px', fontWeight: 'bold' }}>⚠️ Application Runtime Error</h1>
          <p style={{ margin: '15px 0', fontSize: '14px', color: '#ebdcc8' }}>The application encountered an error while rendering. Technical details below:</p>
          <pre style={{ background: '#0a2618', padding: '15px', borderRadius: '10px', overflowX: 'auto', border: '1px solid #194c31', color: '#4ade80', fontSize: '12px' }}>
            {this.state.error?.toString()}
            {'\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#4ade80', color: '#0f231a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
