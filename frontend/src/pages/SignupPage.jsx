import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade">
        <div className="auth-logo">TTM</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join your team and start managing tasks</p>
        
        {error && <div style={{color: 'hsl(var(--red-color))', marginBottom: 20, fontSize: 13}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{textAlign: 'left'}}>
            <label className="form-label">Full Name</label>
            <input type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group" style={{textAlign: 'left'}}>
            <label className="form-label">Email Address</label>
            <input type="email" required placeholder="name@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left'}}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" required placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: 8}}>Sign Up</button>
        </form>
        
        <div style={{marginTop: 32, fontSize: 13, color: 'hsl(var(--text-muted))'}}>
          Already have an account? <Link to="/login" style={{color: 'hsl(var(--primary-color))', fontWeight: 600, textDecoration: 'none'}}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
