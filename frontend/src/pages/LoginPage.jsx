import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade">
        <div className="auth-logo">TTM</div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to manage your team tasks</p>
        
        {error && <div style={{color: 'hsl(var(--red-color))', marginBottom: 20, fontSize: 13}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{textAlign: 'left'}}>
            <label className="form-label">Email Address</label>
            <input type="email" required placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group" style={{textAlign: 'left'}}>
            <label className="form-label">Password</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: 8}}>Sign In</button>
        </form>
        
        <div style={{marginTop: 32, fontSize: 13, color: 'hsl(var(--text-muted))'}}>
          Don't have an account? <Link to="/signup" style={{color: 'hsl(var(--primary-color))', fontWeight: 600, textDecoration: 'none'}}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}
