import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg('Email atau password salah. Silakan coba lagi.');
      setLoading(false);
      return;
    }

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
          Selamat Datang 👋
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
          Masuk ke akun admin Anda untuk melanjutkan.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          background: 'var(--error-bg)', color: 'var(--error-text)',
          border: '1px solid var(--error-border)', borderRadius: 10,
          padding: '12px 14px', marginBottom: 20, fontSize: 13.5,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span>❌</span> {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label className="form-label">Alamat Email</label>
          <input
            id="email"
            type="email"
            required
            className="form-input"
            placeholder="admin@warung.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Password</label>
            <Link to="/forgot" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-600)' }}>
              Lupa Password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', opacity: 0.6, transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
            >
              {showPass ? (
                /* Eye-off icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                /* Eye icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          id="btn-login"
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg btn-block"
          style={{ marginTop: 6 }}
        >
          {loading ? (
            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Memproses...</>
          ) : '🔑 Masuk'}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
        Belum punya akun?{' '}
        <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>Daftar sekarang</Link>
      </p>
    </>
  );
}