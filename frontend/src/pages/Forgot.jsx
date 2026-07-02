import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Forgot() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await api.post('forgot', { email });
      const data = response.data;

      if (data && data.success) {
        setSuccessMsg(data.message || 'Password berhasil direset di MySQL.');
      } else {
        setErrorMsg(data.message || 'Gagal mereset password.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Email tidak ditemukan dalam database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
          Lupa Password? 🔒
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
          Masukkan alamat email Anda dan kami akan mengirimkan link untuk mengatur ulang password.
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

      <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg btn-block"
          style={{ marginTop: 6 }}
        >
          {loading ? (
            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Mengirim...</>
          ) : 'Kirim Link Reset'}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
        Ingat password Anda?{' '}
        <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>Kembali ke Login</Link>
      </p>
    </>
  );
}
