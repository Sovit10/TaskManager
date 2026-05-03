import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['todo', 'in-progress', 'in-review', 'done'];

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

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '', project: '', dueDate: '', status: 'todo' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes, usersRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects'),
          isAdmin ? api.get('/auth/users') : Promise.resolve({ data: [] })
        ]);
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', formData);
      setTasks([res.data, ...tasks]);
      setShowModal(false);
      setFormData({ title: '', description: '', assignedTo: '', project: '', dueDate: '', status: 'todo' });
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/tasks/${id}`, { status });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="loading">Syncing your workspace...</div>;

  return (
    <div className="animate-fade">
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32}}>
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage and track your team's progress</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Task
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Task Details</th>
              <th>Project</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                <td>
                  <div style={{fontWeight: 600}}>{task.title}</div>
                  <div style={{fontSize: 12, color: 'hsl(var(--text-muted))'}}>{task.description || 'No description'}</div>
                </td>
                <td><span className="glass-tag">{task.project?.name || '—'}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{task.assignedTo?.name?.charAt(0)}</div>
                    {task.assignedTo?.name || '—'}
                  </div>
                </td>
                <td>{statusBadge(task.status, task.dueDate)}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                <td>
                  <select 
                    value={task.status} 
                    onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                    style={{width: 'auto', padding: '4px 8px', fontSize: 13}}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      (!isAdmin && opt === 'done') ? null : <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">New Task</h2>
              <button className="btn-ghost btn-sm" style={{borderRadius: '50%', padding: 4}} onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input required placeholder="e.g. Design System Audit" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows="3" placeholder="Provide context for this task..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select required value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})}>
                    <option value="">Select</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select required value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                    <option value="">Select</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="form-group date-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: 16}}>Create Task</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
