import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusBadge = (status, dueDate) => {
  const overdue = dueDate && new Date(dueDate) < new Date() && status !== 'done' && status !== 'in-review';
  const cls = { todo: 'badge-todo', 'in-progress': 'badge-in-progress', 'in-review': 'badge-review', done: 'badge-done' };
  
  if (overdue) return (
    <span className="badge badge-overdue">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      overdue
    </span>
  );
  
  return <span className={`badge ${cls[status] || ''}`}>{status}</span>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Analyzing dashboard data...</div>;
  if (error) return <div className="alert alert-error animate-slide">{error}</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, <span style={{color: 'hsl(var(--primary-color))', fontWeight: 600}}>{user?.name}</span></p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card active-stat">
          <div className="label">Total Tasks</div>
          <div className="value">{data.total}</div>
          <svg style={{position: 'absolute', right: 20, bottom: 20, opacity: 0.1, pointerEvents: 'none'}} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <div className="card stat-card">
          <div className="label" style={{color: 'hsl(var(--green-color))'}}>Completed</div>
          <div className="value">{data.completed}</div>
          <svg style={{position: 'absolute', right: 20, bottom: 20, opacity: 0.1, pointerEvents: 'none', color: 'hsl(var(--green-color))'}} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div className="card stat-card">
          <div className="label" style={{color: 'hsl(var(--accent-color))'}}>In Progress</div>
          <div className="value">{data.inProgress}</div>
          <svg style={{position: 'absolute', right: 20, bottom: 20, opacity: 0.1, pointerEvents: 'none', color: 'hsl(var(--accent-color))'}} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div className="card stat-card">
          <div className="label" style={{color: 'hsl(var(--red-color))'}}>Overdue</div>
          <div className="value">{data.overdue}</div>
          <svg style={{position: 'absolute', right: 20, bottom: 20, opacity: 0.1, pointerEvents: 'none', color: 'hsl(var(--red-color))'}} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
      </div>

      <div className="section-title">Recent Activity</div>
      <div className="table-container">
        {data.recentTasks.length === 0 ? (
          <div className="empty-state">No recent activity recorded.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTasks.map(task => (
                <tr key={task._id} className="animate-fade">
                  <td>
                    <div style={{fontWeight: 600}}>{task.title}</div>
                  </td>
                  <td>
                    <span className="glass-tag">{task.project?.name || 'Unassigned'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{task.assignedTo?.name?.charAt(0)}</div>
                      {task.assignedTo?.name || '—'}
                    </div>
                  </td>
                  <td>{statusBadge(task.status, task.dueDate)}</td>
                  <td>
                    <div style={{ color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
