import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-app)', padding: 24
        }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💥</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
              Ups! Terjadi Kesalahan
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 24 }}>
              Halaman mengalami error yang tidak terduga. Coba refresh halaman.
            </p>
            <details style={{ textAlign: 'left', background: 'var(--error-bg)', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 12, color: 'var(--error-text)' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Detail Error</summary>
              <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.error?.message}
              </pre>
            </details>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              🔄 Refresh Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
