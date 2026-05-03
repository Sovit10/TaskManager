const Task = require('../models/Task');

const getDashboardStats = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
    
    const total = await Task.countDocuments(filter);
    const completed = await Task.countDocuments({ ...filter, status: 'done' });
    const inProgress = await Task.countDocuments({ ...filter, status: 'in-progress' });
    const overdue = await Task.countDocuments({ 
      ...filter, 
      status: { $ne: 'done' }, 
      dueDate: { $lt: new Date() } 
    });

    const recentTasks = await Task.find(filter)
      .populate('assignedTo', 'name')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({ total, completed, inProgress, overdue, recentTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
