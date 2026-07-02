import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Register() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirm) {
      setErrorMsg('Password tidak cocok. Silakan periksa kembali.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('register', { email, password });
      const data = response.data;

      if (data && data.success) {
        setSuccessMsg('Pendaftaran berhasil! Akun Anda telah disimpan di MySQL. Silakan langsung login.');
      } else {
        setErrorMsg(data.message || 'Terjadi kesalahan saat pendaftaran.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
          Buat Akun ✨
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
          Daftarkan akun baru untuk mengelola warung Anda.
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

      {successMsg && (
        <div style={{
          background: 'var(--success-bg)', color: 'var(--success-text)',
          border: '1px solid var(--success-border)', borderRadius: 10,
          padding: '12px 14px', marginBottom: 20, fontSize: 13.5,
          display: 'flex', alignItems: 'flex-start', gap: 8
        }}>
          <span>✅</span> {successMsg}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label className="form-label">Alamat Email</label>
          <input
            id="email"
            type="email"
            required
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5
              }}
            >{showPass ? '🙈' : '👁️'}</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Konfirmasi Password</label>
          <input
            id="confirmPassword"
            type={showPass ? 'text' : 'password'}
            required
            className="form-input"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg btn-block"
          style={{ marginTop: 6 }}
        >
          {loading ? (
            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Mendaftar...</>
          ) : '🚀 Daftar Sekarang'}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
        Sudah punya akun?{' '}
        <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>Masuk di sini</Link>
      </p>
    </>
  );
}
