import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught:', error.message, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0A0F0A', color: '#E8F0E8', fontFamily: 'Cairo, sans-serif',
        padding: '24px', textAlign: 'center', gap: '16px'
      }}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#4ADE80' }}>حدث خطأ غير متوقع</h2>
        <p style={{ color: 'rgba(232,240,232,0.5)', fontSize: '14px' }}>
          {this.state.error?.message || 'يرجى تحديث الصفحة والمحاولة مرة أخرى'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '8px', padding: '10px 24px', borderRadius: '10px',
            border: '1px solid #4ADE80', background: 'rgba(74,222,128,0.12)',
            color: '#4ADE80', cursor: 'pointer', fontSize: '14px', fontWeight: '700'
          }}
        >
          تحديث الصفحة
        </button>
      </div>
    )
  }
}
