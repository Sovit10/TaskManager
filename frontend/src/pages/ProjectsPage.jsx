import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;
  if (error) return <div className="alert alert-error animate-slide">{error}</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your team projects</p>
        </div>
        {user?.role === 'admin' && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8}}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Project
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="card animate-slide" style={{ marginBottom: 24 }}>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Project Name</label>
              <input
                type="text"
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Enter project description (optional)"
                rows="3"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary">Create Project</button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="section-title">All Projects ({projects.length})</div>
      <div className="table-container">
        {projects.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: 16, opacity: 0.5}}>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h6z" />
            </svg>
            No projects found. {user?.role === 'admin' && 'Create your first project to get started.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project._id} className="animate-fade">
                  <td>
                    <div style={{ fontWeight: 600 }}>{project.name}</div>
                  </td>
                  <td>
                    <div style={{ color: 'hsl(var(--text-muted))', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.description || 'No description'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                        {project.createdBy?.name?.charAt(0)}
                      </div>
                      {project.createdBy?.name || 'Unknown'}
                    </div>
                  </td>
                  <td>
                    <div style={{ color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {new Date(project.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
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